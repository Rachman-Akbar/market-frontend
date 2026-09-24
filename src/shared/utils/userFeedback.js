import Swal from "sweetalert2";

const toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2400,
  timerProgressBar: true,
  didOpen: (popup) => {
    popup.addEventListener("mouseenter", Swal.stopTimer);
    popup.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export function toastSuccess(title, message = "") {
  toast.fire({ icon: "success", title, text: message || "" });
}

export function toastError(title, message = "") {
  toast.fire({ icon: "error", title, text: message || "" });
}

export function toastInfo(title, message = "") {
  toast.fire({ icon: "info", title, text: message || "" });
}