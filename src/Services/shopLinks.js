import { slugify } from './eventUtils';

// Every shop product has its own page: /shop/<name>, e.g. /shop/gfc-classic-tee
export const productSlug = (item) => slugify(String(item?.name || '').replace(/&/g, ' and '));
export const productPath = (item) => `/shop/${productSlug(item)}`;

// Lowest price across a product's variants (cents)
export const lowestPriceCents = (item) => Math.min(...(item?.variants || []).map((v) => v.priceCents).filter((n) => n > 0));
