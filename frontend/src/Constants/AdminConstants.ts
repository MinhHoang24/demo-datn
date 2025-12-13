export const STORAGE_KEYS = {
  ROLE: "role",
  AUTH_TOKEN: "authToken",
} as const;

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
} as const;

export const MENU_KEYS = {
  PRODUCTS: "products",
  USERS: "users",
  ORDERS: "orders",
  PROFILE: "profile",
  ANALYSIS: "analysis",
} as const;

export const MENU_LABELS: Record<string, string> = {
  [MENU_KEYS.PRODUCTS]: "Sản phẩm",
  [MENU_KEYS.USERS]: "Người dùng",
  [MENU_KEYS.ORDERS]: "Đơn hàng",
  [MENU_KEYS.PROFILE]: "Thông tin",
  [MENU_KEYS.ANALYSIS]: "Thống kê",
};