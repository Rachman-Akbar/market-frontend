import { useEffect, useMemo, useState } from "react";
import { CrudDialog } from "@/shared/components/crud/CrudDialog";
import { ActiveToggle } from "@/shared/components/form/ActiveToggle";
import {
  FormField,
  inputClassName,
  textAreaClassName,
} from "@/shared/components/form/FormField";
import { required, validateFields } from "@/core/utils/formValidation";
import {
  getAdminIdentityError,
  useAdminPermissions,
  useCreateAdminRole,
  useUpdateAdminRole,
} from "@/features/admin/identity/services/adminIdentityService";

function initialValues(role) {
  return {
    name: role?.name || "",
    description: role?.description || "",
    isActive: role?.isActive ?? true,
    permissionIds: (role?.permissions || []).map((permission) => permission.id),
  };
}

export function RoleFormDialog({ open, role, onClose, onSaved }) {
  const [values, setValues] = useState(() => initialValues(role));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const permissionsQuery = useAdminPermissions();
  const createMutation = useCreateAdminRole();
  const updateMutation = useUpdateAdminRole();
  const mutation = role ? updateMutation : createMutation;

  const visiblePermissions = useMemo(
    () => (permissionsQuery.data || []).filter(
      (permission) => permission.isActive || values.permissionIds.includes(permission.id),
    ),
    [permissionsQuery.data, values.permissionIds],
  );

  useEffect(() => {
    if (!open) return;

    setValues(initialValues(role));
    setErrors({});
    setMessage("");
  }, [open, role]);

  const setField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const togglePermission = (permissionId) => {
    setValues((current) => ({
      ...current,
      permissionIds: current.permissionIds.includes(permissionId)
        ? current.permissionIds.filter((id) => id !== permissionId)
        : [...current.permissionIds, permissionId],
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateFields(values, {
      name: required("Nama role"),
    });

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      const saved = role
        ? await updateMutation.mutateAsync({ id: role.id, values })
        : await createMutation.mutateAsync(values);

      onSaved?.(saved);
      onClose?.();
    } catch (error) {
      setMessage(getAdminIdentityError(error));
    }
  };

  return (
    <CrudDialog
      open={open}
      onClose={onClose}
      title={role ? "Edit Role" : "Tambah Role"}
      subtitle="Nama role disimpan lowercase dan dilindungi unique constraint."
      size="max-w-3xl"
    >
      <form onSubmit={submit}>
        <div className="space-y-4 p-6">
          <FormField label="Nama role" error={errors.name} required>
            <input
              value={values.name}
              onChange={(event) => setField("name", event.target.value)}
              className={inputClassName}
            />
          </FormField>

          <FormField label="Deskripsi">
            <textarea
              value={values.description}
              onChange={(event) => setField("description", event.target.value)}
              className={textAreaClassName}
            />
          </FormField>

          <div>
            <p className="text-sm font-extrabold text-slate-800">Permissions</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {visiblePermissions.map((permission) => (
                <label
                  key={permission.id}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={values.permissionIds.includes(permission.id)}
                    onChange={() => togglePermission(permission.id)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600"
                  />
                  <span>{permission.name}</span>
                  {!permission.isActive ? (
                    <span className="ml-auto text-[10px] font-extrabold uppercase text-slate-400">
                      Nonaktif
                    </span>
                  ) : null}
                </label>
              ))}
            </div>
          </div>

          <ActiveToggle
            checked={values.isActive}
            onChange={(isActive) => setField("isActive", isActive)}
            description="Role nonaktif tidak dapat dipakai untuk login atau assignment baru."
          />

          {message ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {message}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="h-10 rounded-xl bg-teal-600 px-4 text-sm font-extrabold text-white disabled:opacity-60"
          >
            {mutation.isPending ? "Menyimpan..." : "Simpan Role"}
          </button>
        </div>
      </form>
    </CrudDialog>
  );
}
