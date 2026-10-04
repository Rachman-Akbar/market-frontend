import { useEffect, useMemo, useState } from "react";
import { CrudDialog, FormActionDock, FormEditorFooter, FormEditorLayout } from "@/shared/components/crud";
import { InlineActiveSwitch } from "@/shared/components/form/InlineActiveSwitch";
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
import { useFormDirty } from "@/shared/hooks/useFormDirty";
import { toastError, toastSuccess } from "@/shared/utils/userFeedback";

function initialValues(role) {
  return {
    name: role?.name || "",
    description: role?.description || "",
    isActive: role?.isActive ?? true,
    permissionIds: (role?.permissions || []).map((permission) => permission.id),
  };
}

export function RoleFormDialog({ open, role, onClose, onSaved, onDelete }) {
  const [values, setValues] = useState(() => initialValues(role));
  const [errors, setErrors] = useState({});
  const pristine = initialValues(role);
  const dirty = useFormDirty(pristine, values);
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
      toastSuccess(role ? "Role berhasil diperbarui." : "Role berhasil ditambahkan.");
      window.setTimeout(() => onClose?.(), 350);
    } catch (error) {
      toastError("Gagal menyimpan role", getAdminIdentityError(error));
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
        <FormEditorLayout
          actions={
            <FormActionDock tone="teal" save={{ icon: "save", label: "Simpan Role" }} disabled={mutation.isPending || !dirty} onDelete={role && onDelete ? () => onDelete(role) : undefined} />
          }
        >
          <div className="space-y-4">
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
            <div className="mt-2 grid gap-[5px] sm:grid-cols-2">
              {visiblePermissions.map((permission) => (
                <label
                  key={permission.id}
                  className="flex cursor-pointer items-center gap-[5px] rounded-[10px] border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700"
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

          <div className="flex h-11 items-center justify-between rounded-[10px] border border-slate-200 bg-white px-3">
            <div>
              <span className="block text-sm font-bold text-slate-700">Status aktif</span>
              <span className="block text-[11px] text-slate-400">Role nonaktif tidak dapat dipakai untuk login atau assignment baru.</span>
            </div>
            <InlineActiveSwitch checked={values.isActive} onChange={(isActive) => setField("isActive", isActive)} showLabel={false} />
          </div>
        </div>
        </FormEditorLayout>

        <FormEditorFooter onCancel={onClose} submitLabel="Simpan Role" submitIcon="save" disabled={mutation.isPending || !dirty} tone="teal" onDelete={role && onDelete ? () => onDelete(role) : undefined} />
      </form>
    </CrudDialog>
  );
}
