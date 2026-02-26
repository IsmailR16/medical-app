"use client";

import { Toaster } from "react-hot-toast";

/** Global toast container — rendered once in the root layout. */
export default function ToastProvider() {
  return <Toaster position="top-right" />;
}
