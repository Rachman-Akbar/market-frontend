import { useEffect, useState } from "react";
import { CrudDialog } from "@/shared/components/crud/CrudDialog";
import { ActiveToggle } from "@/shared/components/form/ActiveToggle";
import { FormField, inputClassName } from "@/shared/components/form/FormField";
import { required, validateFields } from "@/core/utils/formValidation";
import { getAdminIdentityError, useAdminRoles, useCreateAdminUser, useUpdateAdminUser } from "@/features/admin/identity/services/adminIdentityService";

function initialValues(user) {
  return {
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    avatar: user?.avatar || "",
    roleIds: (user?.roles || []).map((role) => role.id),
    isEmailVerified: user?.isEmailVerified ?? false,
    isActive: user?.isActive ?? true,
    isBanned: Boolean(user?.bannedAt),
    bannedAt: user?.bannedAt || "",
  };
}

export function UserFormDialog({ open, user, onClose, onSaved, onDelete }) {
  const [values, setValues] = useState(() => initialValues(user));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const rolesQuery = useAdminRoles();
  const createMutation = useCreateAdminUser();
  const updateMutation = useUpdateAdminUser();
  const mutation = user ? updateMutation : createMutation;
  const adminRoleId = (rolesQuery.data || []).find((role) => role.name === "admin")?.id;
  const canBeBanned = Boolean(adminRoleId && values.roleIds.includes(adminRoleId));

  useEffect(() => {
    if (open) {
      setValues(initialValues(user));
      setErrors({});
      setMessage("");
    }
  }, [open, user]);

  const setField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const toggleRole = (roleId) => {
    setValues((current) => {
      const roleIds = current.roleIds.includes(roleId)
        ? current.roleIds.filter((id) => id !== roleId)
        : [...current.roleIds, roleId];
      const stillAdmin = !adminRoleId || roleIds.includes(adminRoleId);

      return {
        ...current,
        roleIds,
        ...(stillAdmin ? {} : { isBanned: false, bannedAt: "" }),
      };
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateFields(values, {
      name: required("Nama"),
      email: required("Email"),
      password: !user && values.password ? required("Password") : () => "",
    });

    if (!values.roleIds.length) nextErrors.roleIds = "Minimal satu role wajib dipilih.";
    if (values.password && values.password.length < 8) nextErrors.password = "Password minimal 8 karakter.";
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);

    try {
      const saved = user
        ? await updateMutation.mutateAsync({ id: user.id, values })
        : await createMutation.mutateAsync(values);
      onSaved?.(saved);
      onClose?.();
    } catch (error) {
      setMessage(getAdminIdentityError(error));
    }
  };

  return (
    <CrudDialog open={open} onClose={onClose} title={user ? "Edit User" : "Tambah User"} subtitle="Kelola akun, role, verifikasi, active/non-active, dan banned admin." size="max-w-3xl">
      <form onSubmit={submit}>
        <div className="grid gap-4 p-6 md:grid-cols-2">
          <FormField label="Nama" error={errors.name} required>
            <input value={values.name} onChange={(event) => setField("name", event.target.value)} className={inputClassName} />
          </FormField>
          <FormField label="Email" error={errors.email} required>
            <input type="email" value={values.email} onChange={(event) => setField("email", event.target.value)} className={inputClassName} />
          </FormField>
          <FormField label={user ? "Password baru" : "Password"} error={errors.password}>
            <input type="password" value={values.password} onChange={(event) => setField("password", event.target.value)} className={inputClassName} placeholder={user ? "Kosongkan jika tidak diubah" : "Minimal 8 karakter"} />
          </FormField>
          <FormField label="URL avatar">
            <input value={values.avatar} onChange={(event) => setField("avatar", event.target.value)} className={inputClassName} placeholder="https://..." />
          </FormField>
          <div className="md:col-span-2">
            <p className="text-sm font-extrabold text-slate-800">Role</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {(rolesQuery.data || []).filter((role) => role.isActive || values.roleIds.includes(role.id)).map((role) => (
                <label key={role.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={values.roleIds.includes(role.id)} onChange={() => toggleRole(role.id)} className="h-4 w-4 rounded border-slate-300 text-teal-600" />
                  <span className="capitalize">{role.name}</span>
                </label>
              ))}
            </div>
            {errors.roleIds ? <p className="mt-1 text-xs font-semibold text-red-600">{errors.roleIds}</p> : null}
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={values.isEmailVerified} onChange={(event) => setField("isEmailVerified", event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-teal-600" />
            Email terverifikasi
          </label>
          {canBeBanned ? (
            <label className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/40 p-4 text-sm font-semibold text-red-700">
              <input type="checkbox" checked={values.isBanned} onChange={(event) => { const checked = event.target.checked; setValues((current) => ({ ...current, isBanned: checked, isActive: checked ? false : current.isActive })); }} className="h-4 w-4 rounded border-red-300 text-red-600" />
              Banned akun admin
            </label>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-500">Banned hanya tersedia untuk akun dengan role admin.</div>
          )}
          <div className="md:col-span-2">
            <ActiveToggle checked={values.isActive} onChange={(isActive) => setField("isActive", isActive)} description="Akun nonaktif tidak dapat menggunakan sesi atau role aktif." />
          </div>
          {message ? <p className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{message}</p> : null}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button type="button" onClick={onClose} className="h-10 border border-slate-200 px-4 text-sm font-bold text-slate-600">Batal</button>
          {user && onDelete ? <button type="button" onClick={() => onDelete(user)} className="h-10 bg-red-50 px-4 text-sm font-extrabold text-red-600">Hapus</button> : null}
          <button type="submit" disabled={mutation.isPending} className="h-10 bg-teal-600 px-4 text-sm font-extrabold text-white disabled:opacity-60">{mutation.isPending ? "Menyimpan..." : "Simpan User"}</button>
        </div>
      </form>
    </CrudDialog>
  );
}
