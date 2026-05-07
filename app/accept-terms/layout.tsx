import { ClerkProvider } from "@clerk/nextjs";
import ToastProvider from "@/components/ToastProvider";

export default function AcceptTermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ToastProvider />
      {children}
    </ClerkProvider>
  );
}
