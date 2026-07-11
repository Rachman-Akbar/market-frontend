import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AddressMapTracker from "@/features/profile/address/components/AddressMapTracker";
import { resolveKomerceDestination } from "@/features/profile/address/destinationService";
import {
  getSellerOnboardingError,
  useSellerOnboarding,
} from "@/features/auth/services/sellerOnboardingService";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";

const STEPS = [
  {
    number: 1,
    title: "Identitas Toko",
    description: "Nama, profil, dan kontak toko",
  },
  {
    number: 2,
    title: "Lokasi Toko",
    description: "Alamat dan pinpoint OpenStreetMap",
  },
  {
    number: 3,
    title: "Operasional",
    description: "Jam buka dan kebijakan toko",
  },
];

const initialForm = {
  store_name: "",
  short_description: "",
  description: "",
  phone: "",
  email: "",
  owner_name: "",
  owner_phone: "",
  country: "Indonesia",
  province: "",
  city_or_regency: "",
  district: "",
  subdistrict: "",
  postal_code: "",
  full_address: "",
  address_notes: "",
  latitude: "",
  longitude: "",
  komerce_destination_id: "",
  open_days: "Senin - Sabtu",
  open_time: "08:00",
  close_time: "17:00",
  shipping_policy: "",
  return_policy: "",
  website_url: "",
  instagram_url: "",
};

function Field({ label, required, children, helper }) {
  return (
    <label className="block space-y-2">
      <span className="block text-sm font-bold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>
      {children}
      {helper ? <span className="block text-xs leading-5 text-slate-400">{helper}</span> : null}
    </label>
  );
}

function TextArea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#03ac0e] focus:bg-white focus:ring-2 focus:ring-[#03ac0e]/10"
    />
  );
}

function UploadField({ label, accept, file, onChange, helper }) {
  return (
    <Field label={label} helper={helper}>
      <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-[#03ac0e] hover:bg-[#f4fff8]">
        <span className="material-symbols-outlined text-3xl text-[#03ac0e]">add_photo_alternate</span>
        <span className="mt-2 text-sm font-black text-slate-700">
          {file ? file.name : `Pilih ${label.toLowerCase()}`}
        </span>
        <span className="mt-1 text-xs text-slate-400">JPG, PNG, atau WebP</span>
        <input
          type="file"
          accept={accept}
          onChange={onChange}
          className="hidden"
        />
      </label>
    </Field>
  );
}

function StepHeader({ step }) {
  const current = STEPS[step - 1];

  return (
    <div className="mb-7">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#03ac0e]">
        Langkah {current.number} dari {STEPS.length}
      </p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
        {step === 1 ? "Pembuatan identitas toko" : current.title}
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">{current.description}</p>
    </div>
  );
}

export default function SellerOnboardingPage() {
  const navigate = useNavigate();
  const { user, roles, store, initializing } = useAuth();
  const onboardingMutation = useSellerOnboarding();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);
  const [message, setMessage] = useState("");
  const [destinationStatus, setDestinationStatus] = useState({
    loading: false,
    message: "",
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm((current) => ({
      ...current,
      email: current.email || user.email || "",
      owner_name: current.owner_name || user.name || "",
    }));
  }, [user]);

  useEffect(() => {
    if (initializing) {
      return;
    }

    if (roles.includes("seller") && store?.id) {
      navigate("/auth/role-switch?redirect=%2Fseller", { replace: true });
    }
  }, [initializing, navigate, roles, store?.id]);

  const addressValues = useMemo(
    () => ({
      country: form.country,
      province: form.province,
      cityOrRegency: form.city_or_regency,
      district: form.district,
      subdistrict: form.subdistrict,
      postalCode: form.postal_code,
      fullAddress: form.full_address,
    }),
    [
      form.city_or_regency,
      form.country,
      form.district,
      form.full_address,
      form.postal_code,
      form.province,
      form.subdistrict,
    ]
  );

  const change = (key) => (event) => {
    setMessage("");
    const resetDestination = [
      "province",
      "city_or_regency",
      "district",
      "subdistrict",
      "postal_code",
    ].includes(key);

    setForm((current) => ({
      ...current,
      [key]: event.target.value,
      ...(resetDestination ? { komerce_destination_id: "" } : {}),
    }));
  };

  const selectFile = (type, maxSizeMb) => (event) => {
    setMessage("");
    const file = event.target.files?.[0] || null;

    if (!file) {
      if (type === "logo") setLogo(null);
      if (type === "banner") setBanner(null);
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      setMessage(`${type === "logo" ? "Logo" : "Banner"} maksimal ${maxSizeMb} MB.`);
      event.target.value = "";
      return;
    }

    if (type === "logo") setLogo(file);
    if (type === "banner") setBanner(file);
  };

  const resolveAddress = (address) => {
    setForm((current) => ({
      ...current,
      country: address.country || current.country,
      province: address.province || current.province,
      city_or_regency: address.cityOrRegency || current.city_or_regency,
      district: address.district || current.district,
      subdistrict: address.subdistrict || current.subdistrict,
      postal_code: address.postalCode || current.postal_code,
      full_address: address.fullAddress || current.full_address,
      komerce_destination_id: "",
    }));
  };

  const setCoordinate = ({ latitude, longitude }) => {
    setForm((current) => ({
      ...current,
      latitude,
      longitude,
    }));
  };

  const ensureDestination = async () => {
    if (form.komerce_destination_id) {
      return form.komerce_destination_id;
    }

    setDestinationStatus({
      loading: true,
      message: "Mencocokkan tujuan logistik...",
    });

    try {
      const destination = await resolveKomerceDestination(addressValues);
      setForm((current) => ({
        ...current,
        komerce_destination_id: destination.id,
      }));
      setDestinationStatus({
        loading: false,
        message: `Tujuan logistik ditemukan: ${destination.label || destination.subdistrict || destination.id}`,
      });
      return destination.id;
    } catch (error) {
      setDestinationStatus({
        loading: false,
        message: error.message,
      });
      return "";
    }
  };

  useEffect(() => {
    if (
      step !== 2 ||
      !form.subdistrict ||
      !form.district ||
      !form.city_or_regency ||
      !form.province
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      ensureDestination();
    }, 700);

    return () => window.clearTimeout(timer);
  }, [
    addressValues,
    form.city_or_regency,
    form.district,
    form.postal_code,
    form.province,
    form.subdistrict,
    step,
  ]);

  const validateStep = () => {
    if (step === 1) {
      if (form.store_name.trim().length < 3) {
        return "Nama toko minimal 3 karakter.";
      }

      if (!form.phone.trim() || !form.owner_name.trim() || !form.owner_phone.trim()) {
        return "Telepon toko, nama pemilik, dan telepon pemilik wajib diisi.";
      }
    }

    if (step === 2) {
      const required = [
        form.country,
        form.province,
        form.city_or_regency,
        form.district,
        form.subdistrict,
        form.postal_code,
        form.full_address,
        form.latitude,
        form.longitude,
      ];

      if (required.some((value) => !String(value || "").trim())) {
        return "Lengkapi alamat dan pinpoint lokasi toko.";
      }
    }

    if (step === 3 && form.open_time && form.close_time && form.open_time >= form.close_time) {
      return "Jam tutup harus lebih besar dari jam buka.";
    }

    return "";
  };

  const nextStep = async () => {
    const validationMessage = validateStep();

    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    setMessage("");
    setStep((current) => Math.min(STEPS.length, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const previousStep = () => {
    setMessage("");
    setStep((current) => Math.max(1, current - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (event) => {
    event.preventDefault();
    const validationMessage = validateStep();

    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    setMessage("");

    try {
      await onboardingMutation.mutateAsync({
        values: { ...form },
        files: {
          logo,
          banner,
        },
      });
      navigate("/seller", { replace: true });
    } catch (error) {
      setMessage(getSellerOnboardingError(error));
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] px-4 py-6 sm:px-6 lg:py-8">
      <div className="mx-auto grid min-h-[760px] w-full max-w-7xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[0.78fr_1.22fr]">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#00aa5b] via-[#03ac0e] to-[#008c47] p-10 text-white lg:block">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-black/10 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col">
            <Link to="/" className="inline-flex w-fit items-center gap-3 rounded-2xl bg-white/14 px-4 py-3 ring-1 ring-white/20 transition hover:bg-white/20">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl font-black text-[#03ac0e]">M</span>
              <div>
                <p className="text-lg font-black leading-none">MarketKu</p>
                <p className="mt-1 text-xs font-semibold text-white/75">Seller onboarding</p>
              </div>
            </Link>

            <div className="mt-14">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/70">Mulai berjualan</p>
              <h2 className="mt-4 text-4xl font-black leading-tight">Bangun identitas toko dan tentukan lokasi operasionalmu.</h2>
              <p className="mt-5 text-sm leading-7 text-white/80">
                Data toko, lokasi OpenStreetMap, dan alamat logistik disimpan melalui API backend yang sama dengan akun MarketKu.
              </p>
            </div>

            <div className="mt-10 space-y-3">
              {STEPS.map((item) => {
                const active = item.number === step;
                const completed = item.number < step;

                return (
                  <div
                    key={item.number}
                    className={`flex items-start gap-4 rounded-2xl p-4 ring-1 transition ${active ? "bg-white/20 ring-white/35" : "bg-white/10 ring-white/15"}`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${completed || active ? "bg-white text-[#03ac0e]" : "bg-white/15 text-white"}`}>
                      {completed ? "✓" : item.number}
                    </span>
                    <div>
                      <p className="text-sm font-black">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-white/70">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto rounded-2xl bg-white/12 p-4 ring-1 ring-white/15">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/65">Akun aktif</p>
              <p className="mt-2 text-sm font-black">{user?.name || "Pengguna MarketKu"}</p>
              <p className="mt-1 text-xs text-white/70">{user?.email || "-"}</p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#03ac0e] text-base font-black text-white">M</span>
              <span className="text-lg font-black text-[#03ac0e]">MarketKu</span>
            </Link>
            <span className="text-xs font-black text-slate-500">Langkah {step}/{STEPS.length}</span>
          </div>

          <form onSubmit={submit} className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
            <StepHeader step={step} />

            {step === 1 ? (
              <div className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Nama toko" required>
                    <Input
                      value={form.store_name}
                      onChange={change("store_name")}
                      placeholder="Contoh: MarketKu Official Store"
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus:bg-white focus:ring-[#03ac0e]"
                    />
                  </Field>
                  <Field label="Deskripsi singkat">
                    <Input
                      value={form.short_description}
                      onChange={change("short_description")}
                      placeholder="Maksimal 255 karakter"
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus:bg-white focus:ring-[#03ac0e]"
                    />
                  </Field>
                  <Field label="Telepon toko" required>
                    <Input
                      value={form.phone}
                      onChange={change("phone")}
                      placeholder="08xxxxxxxxxx"
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus:bg-white focus:ring-[#03ac0e]"
                    />
                  </Field>
                  <Field label="Email toko">
                    <Input
                      type="email"
                      value={form.email}
                      onChange={change("email")}
                      placeholder="toko@contoh.com"
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus:bg-white focus:ring-[#03ac0e]"
                    />
                  </Field>
                  <Field label="Nama pemilik" required>
                    <Input
                      value={form.owner_name}
                      onChange={change("owner_name")}
                      placeholder="Nama penanggung jawab toko"
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus:bg-white focus:ring-[#03ac0e]"
                    />
                  </Field>
                  <Field label="Telepon pemilik" required>
                    <Input
                      value={form.owner_phone}
                      onChange={change("owner_phone")}
                      placeholder="08xxxxxxxxxx"
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus:bg-white focus:ring-[#03ac0e]"
                    />
                  </Field>
                </div>

                <Field label="Deskripsi toko">
                  <TextArea
                    value={form.description}
                    onChange={change("description")}
                    placeholder="Jelaskan jenis produk dan keunggulan toko"
                    rows={5}
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <UploadField
                    label="Logo toko"
                    accept="image/png,image/jpeg,image/webp"
                    file={logo}
                    onChange={selectFile("logo", 2)}
                    helper="Ukuran maksimal 2 MB"
                  />
                  <UploadField
                    label="Banner toko"
                    accept="image/png,image/jpeg,image/webp"
                    file={banner}
                    onChange={selectFile("banner", 5)}
                    helper="Ukuran maksimal 5 MB"
                  />
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  {[
                    ["country", "Negara", true],
                    ["province", "Provinsi", true],
                    ["city_or_regency", "Kota / Kabupaten", true],
                    ["district", "Kecamatan", true],
                    ["subdistrict", "Kelurahan / Desa", true],
                    ["postal_code", "Kode pos", true],
                  ].map(([key, label, required]) => (
                    <Field key={key} label={label} required={required}>
                      <Input
                        value={form[key]}
                        onChange={change(key)}
                        className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus:bg-white focus:ring-[#03ac0e]"
                      />
                    </Field>
                  ))}
                </div>

                <Field label="Alamat lengkap" required>
                  <TextArea
                    value={form.full_address}
                    onChange={change("full_address")}
                    placeholder="Nama jalan, nomor bangunan, RT/RW, dan detail lokasi"
                    rows={4}
                  />
                </Field>

                <Field label="Catatan atau patokan">
                  <Input
                    value={form.address_notes}
                    onChange={change("address_notes")}
                    placeholder="Contoh: Pagar hitam dekat minimarket"
                    className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus:bg-white focus:ring-[#03ac0e]"
                  />
                </Field>

                <div className="rounded-2xl border border-[#03ac0e]/20 bg-[#f4fff8] px-4 py-3">
                  <p className="text-sm font-black text-slate-800">
                    Tujuan logistik terisi otomatis
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {destinationStatus.message ||
                      "OpenStreetMap mengisi wilayah dan backend mencocokkan ID tujuan kurir secara otomatis."}
                  </p>
                </div>

                <AddressMapTracker
                  latitude={form.latitude}
                  longitude={form.longitude}
                  addressValues={addressValues}
                  onCoordinateChange={setCoordinate}
                  onAddressResolved={resolveAddress}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Latitude" required>
                    <Input
                      value={form.latitude}
                      readOnly
                      className="h-12 rounded-xl border-slate-200 bg-slate-100 px-4 text-slate-500"
                    />
                  </Field>
                  <Field label="Longitude" required>
                    <Input
                      value={form.longitude}
                      readOnly
                      className="h-12 rounded-xl border-slate-200 bg-slate-100 px-4 text-slate-500"
                    />
                  </Field>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-3">
                  <Field label="Hari operasional">
                    <Input
                      value={form.open_days}
                      onChange={change("open_days")}
                      placeholder="Senin - Sabtu"
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus:bg-white focus:ring-[#03ac0e]"
                    />
                  </Field>
                  <Field label="Jam buka">
                    <Input
                      type="time"
                      value={form.open_time}
                      onChange={change("open_time")}
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus:bg-white focus:ring-[#03ac0e]"
                    />
                  </Field>
                  <Field label="Jam tutup">
                    <Input
                      type="time"
                      value={form.close_time}
                      onChange={change("close_time")}
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus:bg-white focus:ring-[#03ac0e]"
                    />
                  </Field>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Website">
                    <Input
                      type="url"
                      value={form.website_url}
                      onChange={change("website_url")}
                      placeholder="https://"
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus:bg-white focus:ring-[#03ac0e]"
                    />
                  </Field>
                  <Field label="Instagram">
                    <Input
                      type="url"
                      value={form.instagram_url}
                      onChange={change("instagram_url")}
                      placeholder="https://instagram.com/..."
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus:bg-white focus:ring-[#03ac0e]"
                    />
                  </Field>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Kebijakan pengiriman">
                    <TextArea
                      value={form.shipping_policy}
                      onChange={change("shipping_policy")}
                      placeholder="Jadwal proses dan ketentuan pengiriman"
                      rows={5}
                    />
                  </Field>
                  <Field label="Kebijakan retur">
                    <TextArea
                      value={form.return_policy}
                      onChange={change("return_policy")}
                      placeholder="Syarat dan batas waktu pengembalian"
                      rows={5}
                    />
                  </Field>
                </div>

                <div className="rounded-2xl border border-[#03ac0e]/20 bg-[#f4fff8] p-5">
                  <p className="text-sm font-black text-slate-900">Ringkasan pendaftaran</p>
                  <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Toko</p>
                      <p className="mt-1 font-black text-slate-800">{form.store_name}</p>
                      <p className="mt-1 text-slate-500">{form.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Lokasi</p>
                      <p className="mt-1 font-black text-slate-800">{form.city_or_regency}, {form.province}</p>
                      <p className="mt-1 line-clamp-2 text-slate-500">{form.full_address}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {message ? (
              <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {message}
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
              <div>
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={previousStep}
                    disabled={onboardingMutation.isPending}
                    className="h-12 rounded-xl border-slate-200 px-5 font-black text-slate-700"
                  >
                    Kembali
                  </Button>
                ) : (
                  <Link to="/" className="text-sm font-black text-slate-500 transition hover:text-[#03ac0e]">
                    Batalkan
                  </Link>
                )}
              </div>

              {step < STEPS.length ? (
                <Button
                  type="button"
                  size="lg"
                  onClick={nextStep}
                  className="h-12 rounded-xl bg-[#03ac0e] px-6 font-black shadow-[0_14px_30px_rgba(3,172,14,0.2)] hover:bg-[#039f0d] focus-visible:ring-[#03ac0e]"
                >
                  Lanjutkan
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="lg"
                  disabled={onboardingMutation.isPending}
                  className="h-12 rounded-xl bg-[#03ac0e] px-6 font-black shadow-[0_14px_30px_rgba(3,172,14,0.2)] hover:bg-[#039f0d] focus-visible:ring-[#03ac0e] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {onboardingMutation.isPending ? "Membuat Toko..." : "Buat Toko dan Masuk Seller"}
                </Button>
              )}
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
