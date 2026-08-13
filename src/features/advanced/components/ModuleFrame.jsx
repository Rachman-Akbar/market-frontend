import { EntityToolbar } from "@/shared/components/crud/EntityToolbar";

export function ModuleFrame({
  title,
  subtitle,
  query,
  onQueryChange,
  onRefresh,
  onCreate,
  createLabel = "Tambah Data",
  children,
  filters,
  hideCreate = false,
  refreshing = false,
  placeholder = "Cari data",
  selectionEnabled = false,
  selectedCount = 0,
  onToggleSelection,
  bulkActions = [],
  columns = [],
  visibleColumns = [],
  onToggleColumn,
  onShowAllColumns,
  onResetColumns,
  hasActiveFilters = false,
  onClearFilters,
}) {
  return (
    <section className="w-full min-w-0 max-w-full overflow-hidden">
      <header className="mb-2 border-b border-slate-200 bg-white pb-3">
        <h1 className="text-lg font-extrabold text-slate-950">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </header>
      <EntityToolbar
        query={query}
        onQueryChange={onQueryChange}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onCreate={onCreate}
        createLabel={createLabel}
        placeholder={placeholder}
        filters={filters}
        hideCreate={hideCreate || !onCreate}
        selectionEnabled={selectionEnabled}
        selectedCount={selectedCount}
        onToggleSelection={onToggleSelection}
        bulkActions={bulkActions}
        columns={columns}
        visibleColumns={visibleColumns}
        onToggleColumn={onToggleColumn}
        onShowAllColumns={onShowAllColumns}
        onResetColumns={onResetColumns}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
      />
      <div className="space-y-3">{children}</div>
    </section>
  );
}
