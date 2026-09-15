import { useCallback, useRef, useState } from "react";
import {
  createPpobTransaction,
  checkPpobTransactionStatus,
  inquiryPpobBill,
  payPpobBill,
  getPpobAdminError,
} from "@/features/ppob/services/ppobService";
import { openMidtransPayment } from "@/features/order/ordering/midtransService";
import { ppobStatusEngine, receiptEmailEngine } from "@/core/engine/engine";

const TERMINAL_PAYMENT_STATUS = ["paid", "failed", "expired", "refunded"];
const MAX_POLL_ATTEMPTS = 12;
const POLL_INTERVAL_MS = 5000;

/**
 * Shared hook for PPOB payment logic. Handles both prepaid (Midtrans) and
 * postpaid (inquiry → direct pay) flows. Used by both Home Page and PPOB Page.
 *
 * @param {{ onSuccess?: (tx) => void, onError?: (msg) => void }} options
 */
export function usePpobPayment({ onSuccess, onError } = {}) {
  const [step, setStep] = useState("idle");
  const [created, setCreated] = useState(null);
  const [liveStatus, setLiveStatus] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [inquiryData, setInquiryData] = useState(null);
  const [failure, setFailure] = useState("");
  const pollTimerRef = useRef(null);
  const pollCountRef = useRef(0);
  const callbacksRef = useRef({ onSuccess, onError });
  callbacksRef.current = { onSuccess, onError };

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    pollCountRef.current = 0;
  }, []);

  const reset = useCallback(() => {
    stopPolling();
    setStep("idle");
    setCreated(null);
    setLiveStatus(null);
    setPaymentResult(null);
    setInquiryData(null);
    setFailure("");
  }, [stopPolling]);

  const pollStatus = useCallback(
    (txId) => {
      if (!txId || pollTimerRef.current) return;
      pollCountRef.current += 1;

      checkPpobTransactionStatus(txId).then(
        (data) => {
          setLiveStatus(data);
          if (TERMINAL_PAYMENT_STATUS.includes(data.paymentStatus) || data.status === "success") {
            if (data.status === "success" || data.paymentStatus === "paid") {
              callbacksRef.current.onSuccess?.(data);
              receiptEmailEngine.sendEmail(txId).catch(() => {});
              ppobStatusEngine.notify(txId).catch(() => {});
            }
            stopPolling();
            return;
          }
          if (pollCountRef.current >= MAX_POLL_ATTEMPTS) {
            stopPolling();
            return;
          }
          pollTimerRef.current = setTimeout(() => {
            pollTimerRef.current = null;
            pollStatus(txId);
          }, POLL_INTERVAL_MS);
        },
        () => {
          if (pollCountRef.current >= MAX_POLL_ATTEMPTS) {
            stopPolling();
            return;
          }
          pollTimerRef.current = setTimeout(() => {
            pollTimerRef.current = null;
            pollStatus(txId);
          }, POLL_INTERVAL_MS);
        }
      );
    },
    [stopPolling]
  );

  /**
   * Pay for a prepaid product (Pulsa, Data, Token Listrik).
   * Creates transaction → opens Midtrans → polls status.
   */
  const payPrepaid = useCallback(
    async (product, customerId) => {
      if (!product || !customerId?.trim()) {
        setFailure("Masukkan nomor customer terlebih dahulu.");
        return;
      }
      setFailure("");
      setPaymentResult(null);
      setCreated(null);
      setStep("processing");

      try {
        const result = await createPpobTransaction(product.id, customerId.trim());
        if (!result?.snapToken) {
          throw new Error("Backend tidak mengembalikan snap_token untuk pembayaran.");
        }
        setCreated(result);
        setStep("payment");
        setLiveStatus(null);
        pollCountRef.current = 0;

        try {
          await openMidtransPayment(result, {
            onSuccess: () => setPaymentResult("success"),
            onPending: () => setPaymentResult("pending"),
            onError: () => setPaymentResult("error"),
            onClose: () => setPaymentResult((prev) => prev || "closed"),
          });
          pollStatus(result.id);
        } catch (snapError) {
          setPaymentResult("error");
          setFailure(typeof snapError?.message === "string" ? snapError.message : "Popup pembayaran Midtrans gagal dimuat.");
          pollStatus(result.id);
        }
      } catch (e) {
        setStep("idle");
        setFailure(getPpobAdminError(e, "Transaksi gagal diproses."));
        callbacksRef.current.onError?.(getPpobAdminError(e, "Transaksi gagal diproses."));
      }
    },
    [pollStatus]
  );

  /**
   * Inquiry for a postpaid bill (Tagihan).
   * Verifies customer and retrieves bill details.
   */
  const inquiryBill = useCallback(
    async (product, customerId) => {
      if (!product || !customerId?.trim()) {
        setFailure("Masukkan nomor pelanggan terlebih dahulu.");
        return null;
      }
      setFailure("");
      setStep("inquiry");
      setInquiryData(null);

      try {
        const data = await inquiryPpobBill(product.providerProductCode, customerId.trim());
        setInquiryData(data);
        setStep("confirm");
        return data;
      } catch (e) {
        setStep("idle");
        setFailure(getPpobAdminError(e, "Gagal melakukan inquiry tagihan."));
        callbacksRef.current.onError?.(getPpobAdminError(e, "Gagal melakukan inquiry tagihan."));
        return null;
      }
    },
    []
  );

  /**
   * Pay for a postpaid bill after inquiry.
   * Calls IAK directly (no Midtrans for postpaid).
   */
  const payPostpaid = useCallback(
    async (referenceId) => {
      if (!referenceId) {
        setFailure("Reference ID tidak valid.");
        return;
      }
      setFailure("");
      setStep("processing");
      setPaymentResult(null);

      try {
        const result = await payPpobBill(referenceId);
        setCreated({
          referenceId: result.reference_id,
          trId: result.tr_id,
          status: result.status,
          sn: result.sn,
          ...inquiryData,
        });

        if (result.status === "success") {
          setPaymentResult("success");
          setStep("payment");
          callbacksRef.current.onSuccess?.({ ...result, ...inquiryData });
          receiptEmailEngine.sendEmail(result.reference_id).catch(() => {});
          ppobStatusEngine.notify(result.reference_id).catch(() => {});
        } else {
          setPaymentResult("pending");
          setStep("payment");
        }
      } catch (e) {
        setStep("idle");
        setFailure(getPpobAdminError(e, "Pembayaran tagihan gagal."));
        callbacksRef.current.onError?.(getPpobAdminError(e, "Pembayaran tagihan gagal."));
      }
    },
    [inquiryData]
  );

  const retryPay = useCallback(() => {
    stopPolling();
    setCreated(null);
    setLiveStatus(null);
    setPaymentResult(null);
    setFailure("");
    setStep("confirm");
  }, [stopPolling]);

  const ledger = liveStatus || created || {};

  const isTerminal =
    TERMINAL_PAYMENT_STATUS.includes(ledger.paymentStatus) ||
    ledger.status === "success" ||
    ledger.status === "failed" ||
    ledger.status === "expired";

  return {
    step,
    setStep,
    created,
    setCreated,
    liveStatus,
    setLiveStatus,
    paymentResult,
    setPaymentResult,
    inquiryData,
    failure,
    setFailure,
    ledger,
    isTerminal,
    payPrepaid,
    inquiryBill,
    payPostpaid,
    retryPay,
    stopPolling,
    reset,
  };
}
