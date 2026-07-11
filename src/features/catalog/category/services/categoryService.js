import { useQuery } from "@tanstack/react-query";
import { CATALOG_CACHE_TTL } from "@/features/catalog/domain/cache/catalogCacheConfig";
import { catalogRequest, unwrapCollection, unwrapData } from "@/features/catalog/catalogApi";
import { getCatalogGroups } from "@/features/catalog/cataloggroup/services/catalogGroupService";

let navigationCache = null;
let navigationCacheExpiresAt = 0;
let navigationPromise = null;

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, "dan")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeBoolean(value, fallback = true) {
  if (value === undefined || value === null) return fallback;
  if (value === true || value === 1 || value === "1") return true;
  if (value === false || value === 0 || value === "0") return false;
  return Boolean(value);
}

function cleanCategoryPath(path = "") {
  return String(path)
    .replace(/^\/+|\/+$/g, "")
    .trim();
}

function encodeCategoryPath(path = "") {
  return cleanCategoryPath(path)
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function getCategoryChildren(category = {}) {
  return extractCategories(
    category.children ??
      category.childrens ??
      category.sub_categories ??
      category.subCategories ??
      category.items ??
      []
  );
}

function navigationIsFresh() {
  return navigationCache && navigationCacheExpiresAt > Date.now();
}

export function extractCategories(value) {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  if (Array.isArray(value.data)) return value.data;
  if (Array.isArray(value.items)) return value.items;
  if (Array.isArray(value.categories)) return value.categories;
  if (Array.isArray(value.results)) return value.results;

  if (value.data) return extractCategories(value.data);
  if (value.items) return extractCategories(value.items);
  if (value.categories) return extractCategories(value.categories);
  if (value.results) return extractCategories(value.results);

  return [];
}

export function normalizeCategory(category = {}, fallback = {}) {
  const id = category.id ?? category.category_id ?? category.categoryId ?? null;
  const name = category.name || category.title || category.nama || "Kategori";
  const slug = category.slug || slugify(name);

  const parentId =
    category.parent_id ??
    category.parentId ??
    category.parent?.id ??
    fallback.parent_id ??
    null;

  const catalogGroupId =
    category.catalog_group_id ??
    category.catalogGroupId ??
    category.catalog_group?.id ??
    category.catalogGroup?.id ??
    category.group_id ??
    category.groupId ??
    fallback.catalog_group_id ??
    null;

  const level = Number(category.level ?? fallback.level ?? (parentId ? 2 : 1));
  const fullSlug = category.full_slug || category.fullSlug || category.path || slug;
  const key = String(id ?? fullSlug ?? slug);

  return {
    id,
    key,
    catalog_group_id: catalogGroupId,
    parent_id: parentId,
    level,
    sort_order: Number(category.sort_order ?? category.sortOrder ?? 0),
    is_active: normalizeBoolean(category.is_active ?? category.isActive, true),
    is_visible_in_menu: normalizeBoolean(
      category.is_visible_in_menu ?? category.isVisibleInMenu ?? category.visible,
      true
    ),
    name,
    slug,
    full_slug: fullSlug,
    image_url: category.image_url ?? category.imageUrl ?? null,
    icon_url: category.icon_url ?? category.iconUrl ?? null,
    children: [],
    raw: category,
  };
}

function flattenCategories(categories = [], fallback = {}) {
  const result = [];

  const walk = (category, parent = null, indexPath = "0") => {
    const normalized = normalizeCategory(category, {
      parent_id: parent?.id ?? category.parent_id ?? category.parentId ?? null,
      catalog_group_id:
        category.catalog_group_id ??
        category.catalogGroupId ??
        parent?.catalog_group_id ??
        fallback.catalog_group_id ??
        null,
      level: parent ? Number(parent.level || 1) + 1 : category.level ?? fallback.level ?? 1,
    });

    const item = {
      ...normalized,
      key: String(normalized.id ?? normalized.full_slug ?? normalized.slug ?? indexPath),
      parent_key: parent?.key ? String(parent.key) : "",
      children: [],
    };

    result.push(item);

    getCategoryChildren(category).forEach((child, index) => {
      walk(child, item, `${indexPath}.${index}`);
    });
  };

  extractCategories(categories).forEach((category, index) => {
    walk(category, null, String(index));
  });

  return result;
}

export function buildCategoryTree(categories = [], fallback = {}) {
  const normalized = flattenCategories(categories, fallback)
    .filter((category) => category.is_active !== false)
    .filter((category) => category.is_visible_in_menu !== false)
    .sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return a.name.localeCompare(b.name);
    });

  const mapByKey = new Map();
  const mapById = new Map();

  normalized.forEach((category) => {
    const item = {
      ...category,
      children: [],
    };

    mapByKey.set(String(item.key), item);

    if (item.id !== null && item.id !== undefined) {
      mapById.set(String(item.id), item);
    }
  });

  const roots = [];

  normalized.forEach((category) => {
    const item = mapByKey.get(String(category.key));
    const parentKey = category.parent_key ? String(category.parent_key) : "";
    const parentId =
      category.parent_id !== null && category.parent_id !== undefined
        ? String(category.parent_id)
        : "";

    const parent = parentKey
      ? mapByKey.get(parentKey)
      : parentId
        ? mapById.get(parentId)
        : null;

    if (parent && parent.key !== item.key) {
      parent.children.push(item);
    } else {
      roots.push(item);
    }
  });

  const sortTree = (items = []) => {
    return items
      .sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
        return a.name.localeCompare(b.name);
      })
      .map((item) => ({
        ...item,
        children: sortTree(item.children || []),
      }));
  };

  return sortTree(roots);
}

function getEmbeddedGroupCategories(group = {}) {
  const raw = group.raw || group;

  return extractCategories(
    raw.categories ??
      raw.category ??
      raw.children ??
      raw.items ??
      group.categories ??
      []
  );
}

function isEmptyNavigation(categoriesByGroup = {}) {
  return Object.values(categoriesByGroup).every((items) => {
    return !Array.isArray(items) || items.length === 0;
  });
}

function splitMenuByGroup(menuCategories = [], groups = []) {
  const flat = flattenCategories(menuCategories);

  return Object.fromEntries(
    groups.map((group) => {
      const groupId = String(group.id ?? "");
      const groupKey = String(group.key ?? groupId);
      const groupItems = flat.filter((category) => String(category.catalog_group_id ?? "") === groupId);

      return [
        groupKey,
        buildCategoryTree(groupItems, {
          catalog_group_id: group.id,
        }),
      ];
    })
  );
}

export function getCategoryHref(category = {}) {
  const path = category.full_slug || category.path || category.slug || category.id || "";
  return `/category/${String(path).replace(/^\/+|\/+$/g, "")}`;
}

export async function getCategories() {
  const payload = await catalogRequest("/categories", {
    cacheTtl: CATALOG_CACHE_TTL.long,
    persistCache: true,
  });
  const rawItems = extractCategories(payload);

  return {
    data: buildCategoryTree(rawItems),
    raw: payload,
  };
}

export async function getCategoriesMenu() {
  const payload = await catalogRequest("/categories/menu", {
    cacheTtl: CATALOG_CACHE_TTL.long,
    persistCache: true,
  });
  const rawItems = extractCategories(payload);

  return {
    data: buildCategoryTree(rawItems),
    raw: payload,
  };
}

export async function getCategoriesByCatalogGroup(groupId) {
  const payload = await catalogRequest(`/catalog-groups/${groupId}/categories`, {
    cacheTtl: CATALOG_CACHE_TTL.long,
    persistCache: true,
  });
  const data = unwrapData(payload);
  const rawItems = extractCategories(data);

  return {
    data: buildCategoryTree(rawItems, {
      catalog_group_id: groupId,
    }),
    raw: payload,
  };
}

export async function getCategoryById(id) {
  const payload = await catalogRequest(`/categories/${id}`, {
    cacheTtl: CATALOG_CACHE_TTL.medium,
  });
  const data = unwrapData(payload);

  return normalizeCategory(data);
}

export async function getCategoryByPath(path) {
  const encodedPath = encodeCategoryPath(path);
  const payload = await catalogRequest(`/categories/path/${encodedPath}`, {
    cacheTtl: CATALOG_CACHE_TTL.medium,
  });
  const data = unwrapData(payload);

  return normalizeCategory(data);
}

export async function getProductsByCategoryPath(path, params = {}) {
  const encodedPath = encodeCategoryPath(path);
  const payload = await catalogRequest(`/categories/path/${encodedPath}/products`, {
    params: {
      include_descendants: true,
      per_page: params.per_page ?? params.limit ?? 20,
      include: "summary",
      ...params,
    },
    cacheTtl: CATALOG_CACHE_TTL.short,
  });
  const { items, meta } = unwrapCollection(payload);

  return {
    data: items,
    meta,
    raw: payload,
  };
}

export async function getCategoryNavigation({ forceRefresh = false } = {}) {
  if (!forceRefresh && navigationIsFresh()) return navigationCache;
  if (!forceRefresh && navigationPromise) return navigationPromise;

  navigationPromise = getCatalogGroups({ is_active: 1, include_categories: 1 })
    .then(async (groupsResult) => {
      const groups = Array.isArray(groupsResult?.data)
        ? groupsResult.data
            .filter((group) => group.is_active !== false)
            .sort((a, b) => {
              if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
              return a.name.localeCompare(b.name);
            })
            .map((group) => ({
              ...group,
              key: String(group.key ?? group.id ?? group.slug),
            }))
        : [];

      if (!groups.length) {
        const menuResult = await getCategoriesMenu();

        return {
          groups: [
            {
              id: "all",
              key: "all",
              name: "Kategori",
              slug: "kategori",
            },
          ],
          categoriesByGroup: {
            all: menuResult.data,
          },
        };
      }

      let categoriesByGroup = Object.fromEntries(
        groups.map((group) => {
          const embeddedCategories = getEmbeddedGroupCategories(group);

          return [
            group.key,
            buildCategoryTree(embeddedCategories, {
              catalog_group_id: group.id,
            }),
          ];
        })
      );

      if (isEmptyNavigation(categoriesByGroup)) {
        try {
          const menuResult = await getCategoriesMenu();
          const groupedMenu = splitMenuByGroup(extractCategories(menuResult.raw), groups);

          categoriesByGroup = isEmptyNavigation(groupedMenu)
            ? {
                ...categoriesByGroup,
                [groups[0].key]: menuResult.data,
              }
            : groupedMenu;
        } catch {
          categoriesByGroup = Object.fromEntries(groups.map((group) => [group.key, []]));
        }
      }

      return {
        groups,
        categoriesByGroup,
      };
    })
    .then((result) => {
      navigationCache = result;
      navigationCacheExpiresAt = Date.now() + CATALOG_CACHE_TTL.long;
      return result;
    })
    .finally(() => {
      navigationPromise = null;
    });

  return navigationPromise;
}


export const categoryKeys = {
  menu: ["catalog", "categories", "menu"],
  navigation: ["catalog", "categories", "navigation"],
  path: (path) => ["catalog", "categories", "path", String(path || "")],
};

export function useCategoriesMenu(options = {}) {
  return useQuery({
    queryKey: categoryKeys.menu,
    queryFn: getCategoriesMenu,
    staleTime: 300000,
    ...options,
  });
}

export function useCategoryNavigation(options = {}) {
  return useQuery({
    queryKey: categoryKeys.navigation,
    queryFn: () => getCategoryNavigation(),
    staleTime: 300000,
    ...options,
  });
}

export function useCategoryByPath(path, options = {}) {
  return useQuery({
    queryKey: categoryKeys.path(path),
    queryFn: () => getCategoryByPath(path),
    enabled: Boolean(path),
    staleTime: 300000,
    ...options,
  });
}
