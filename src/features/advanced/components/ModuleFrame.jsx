import { EntityToolbar } from "@/shared/components/crud/EntityToolbar";

export function ModuleFrame({
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
  onApplyDefaultColumns,
  hasActiveFilters = false,
  onClearFilters,
}) {
  return (
    <section className="w-full min-w-0 max-w-full overflow-hidden">
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
        onApplyDefaultColumns={onApplyDefaultColumns}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
      />
      <div className="space-y-3">{children}</div>
    </section>
  );
}
