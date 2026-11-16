import type { Metadata } from "next";
import { AdminProviders } from "@/components/admin/providers";
import "./admin.css";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Admin Cinderella Printing",
  },
  robots: { index: false, follow: false },
};

export const instant = false;

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AdminProviders>{children}</AdminProviders>;
}
