"use client";

import { AuthProvider } from "@/lib/context/AuthContext";
import { CartProvider } from "@/lib/context/CartContext";
import { FeedbackProvider } from "@/lib/context/FeedbackContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <FeedbackProvider>{children}</FeedbackProvider>
      </CartProvider>
    </AuthProvider>
  );
}
