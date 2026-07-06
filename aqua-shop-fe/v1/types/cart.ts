export interface SessionCartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

/** Single line-item returned by GET /cart */
export interface ServerCartItem {
  cartItemId: string;
  sku: string;
  productId: string;
  variantId: string;
  productName: string;
  variantLabel?: string;
  thumbnailUrl?: string;
  slug?: string;
  price: number;
  salePrice?: number | null;
  quantity: number;
  lineTotal: number;
  inStock?: boolean;
}

/** Response shape of GET /cart */
export interface ServerCart {
  cartId?: string;
  items: ServerCartItem[];
  totalItems: number;
  totalPrice: number;
}
