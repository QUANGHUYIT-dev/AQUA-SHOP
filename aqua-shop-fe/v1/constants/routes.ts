export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDERS: "/orders",
  PROFILE: "/profile",
  SEARCH: "/search",
  ABOUT: "/about",
  CONTACT: "/contact",
  CATEGORY_PLANTS: "/cay-thuy-sinh",
  CATEGORY_FISH: "/ca-canh",
  CATEGORY_ACCESSORIES: "/phu-kien",
  CATEGORY_TANKS: "/be-ho-tu-ke",
  ADMIN: "/admin",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_PRODUCT_CREATE: "/admin/products/new",
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_BRANDS: "/admin/brands",
  ADMIN_BANNERS: "/admin/banners",
  ADMIN_CUSTOMERS: "/admin/customers",
  ADMIN_INVENTORY: "/admin/inventory",
  ADMIN_POS: "/admin/pos",
  ADMIN_ORDERS: "/admin/orders",
} as const;

export function getProductDetailPath(slug: string): string {
  return `/san-pham/${slug}`;
}

export function getAdminProductEditPath(productId: string): string {
  return `/admin/products/${productId}/edit`;
}

export function getOrderDetailPath(orderId: string): string {
  return `/orders/${orderId}`;
}

export function getAdminInventorySkuPath(sku: string): string {
  return `/admin/inventory/${encodeURIComponent(sku)}`;
}

export function getAdminOrderDetailPath(orderId: string): string {
  return `/admin/orders/${orderId}`;
}

export const FOOTER_QUICK_LINKS = [
  { href: ROUTES.CATEGORY_PLANTS, label: "Cây thủy sinh" },
  { href: ROUTES.CATEGORY_FISH, label: "Cá cảnh" },
  { href: ROUTES.CATEGORY_ACCESSORIES, label: "Phụ kiện" },
  { href: ROUTES.CATEGORY_TANKS, label: "Bể hồ & Tủ kệ" },
  { href: ROUTES.ABOUT, label: "Giới thiệu" },
  { href: ROUTES.CONTACT, label: "Liên hệ" },
] as const;
