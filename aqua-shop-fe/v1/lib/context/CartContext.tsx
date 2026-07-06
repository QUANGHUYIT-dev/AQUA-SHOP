"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getCart,
  removeCartItem as removeServerCartItem,
  updateCartItem,
} from "@/lib/api";
import { addProductToServerCart } from "@/lib/cart-actions";
import { syncSessionCartToServer } from "@/lib/cart-sync";
import {
  addToSessionCart,
  readSessionCart,
  removeSessionCartItem,
  setSessionCartItemQuantity,
} from "@/lib/cart-session-storage";
import { AuthContext } from "@/lib/context/AuthContext";
import type { ServerCart, SessionCartItem } from "@/types/cart";

interface CartContextValue {
  items: SessionCartItem[];
  serverCart: ServerCart | null;
  itemCount: number;
  isLoading: boolean;
  isServerCart: boolean;
  refreshCart: () => Promise<void>;
  addItem: (
    productId: string,
    variantId: string,
    quantity?: number,
  ) => Promise<void>;
  updateItemQuantity: (
    target: {
      cartItemId?: string;
      productId: string;
      variantId: string;
    },
    quantity: number,
  ) => Promise<void>;
  removeItem: (target: {
    cartItemId?: string;
    productId: string;
    variantId: string;
  }) => Promise<void>;
}

export const CartContext = createContext<CartContextValue | undefined>(
  undefined,
);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const auth = useContext(AuthContext);
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const isHydrated = auth?.isHydrated ?? false;

  const [items, setItems] = useState<SessionCartItem[]>([]);
  const [serverCart, setServerCart] = useState<ServerCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const syncingOnLoginRef = useRef(false);

  const syncFromSession = useCallback(() => {
    const sessionItems = readSessionCart();
    setItems(sessionItems);
  }, []);

  const fetchServerCart = useCallback(async () => {
    const cart = await getCart();
    setServerCart(cart);
    return cart;
  }, []);

  const refreshCart = useCallback(async () => {
    if (isAuthenticated) {
      setIsLoading(true);
      try {
        await fetchServerCart();
      } catch {
        setServerCart(null);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    syncFromSession();
    setServerCart(null);
    setIsLoading(false);
  }, [fetchServerCart, isAuthenticated, syncFromSession]);

  useEffect(() => {
    if (!isHydrated) return;

    let cancelled = false;

    async function initialize() {
      setIsLoading(true);

      if (isAuthenticated) {
        const sessionItems = readSessionCart();

        if (sessionItems.length > 0 && !syncingOnLoginRef.current) {
          syncingOnLoginRef.current = true;
          try {
            const cart = await syncSessionCartToServer();
            if (!cancelled) {
              setServerCart(cart);
              setItems([]);
            }
          } catch {
            if (!cancelled) {
              await fetchServerCart().catch(() => setServerCart(null));
            }
          } finally {
            syncingOnLoginRef.current = false;
          }
        } else {
          try {
            const cart = await fetchServerCart();
            if (!cancelled) setServerCart(cart);
          } catch {
            if (!cancelled) setServerCart(null);
          }
        }

        if (!cancelled) setItems([]);
      } else {
        syncFromSession();
        if (!cancelled) setServerCart(null);
      }

      if (!cancelled) setIsLoading(false);
    }

    initialize();
    return () => {
      cancelled = true;
    };
  }, [fetchServerCart, isAuthenticated, isHydrated, syncFromSession]);

  const addItem = useCallback(
    async (productId: string, variantId: string, quantity = 1) => {
      if (isAuthenticated) {
        await addProductToServerCart(productId, variantId, quantity);
        await fetchServerCart();
        return;
      }

      addToSessionCart(productId, variantId, quantity);
      syncFromSession();
    },
    [fetchServerCart, isAuthenticated, syncFromSession],
  );

  const updateItemQuantity = useCallback(
    async (
      target: {
        cartItemId?: string;
        productId: string;
        variantId: string;
      },
      quantity: number,
    ) => {
      if (isAuthenticated) {
        if (!target.cartItemId) {
          throw new Error("Không tìm thấy dòng giỏ hàng trên server");
        }

        if (quantity <= 0) {
          await removeServerCartItem(target.cartItemId);
        } else {
          await updateCartItem(target.cartItemId, quantity);
        }

        await fetchServerCart();
        return;
      }

      setSessionCartItemQuantity(
        target.productId,
        target.variantId,
        quantity,
      );
      syncFromSession();
    },
    [fetchServerCart, isAuthenticated, syncFromSession],
  );

  const removeItem = useCallback(
    async (target: {
      cartItemId?: string;
      productId: string;
      variantId: string;
    }) => {
      if (isAuthenticated) {
        if (!target.cartItemId) {
          throw new Error("Không tìm thấy dòng giỏ hàng trên server");
        }

        await removeServerCartItem(target.cartItemId);
        await fetchServerCart();
        return;
      }

      removeSessionCartItem(target.productId, target.variantId);
      syncFromSession();
    },
    [fetchServerCart, isAuthenticated, syncFromSession],
  );

  const itemCount = useMemo(() => {
    if (isAuthenticated && serverCart) {
      return serverCart.totalItems;
    }
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [isAuthenticated, serverCart, items]);

  const value = useMemo(
    () => ({
      items,
      serverCart,
      itemCount,
      isLoading,
      isServerCart: isAuthenticated,
      refreshCart,
      addItem,
      updateItemQuantity,
      removeItem,
    }),
    [
      items,
      serverCart,
      itemCount,
      isLoading,
      isAuthenticated,
      refreshCart,
      addItem,
      updateItemQuantity,
      removeItem,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
