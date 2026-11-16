"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  Tags,
  X,
} from "lucide-react";
import { useAdminAuth } from "@/components/admin/auth-provider";

const navSections = [
  {
    label: "Ringkasan",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Katalog",
    items: [
      { href: "/admin/produk", label: "Produk", icon: Package },
      { href: "/admin/kategori", label: "Kategori", icon: Tags },
    ],
  },
  {
    label: "Transaksi",
    items: [
      { href: "/admin/pesanan", label: "Pesanan", icon: ShoppingCart },
      { href: "/admin/invoice", label: "Invoice", icon: FileText },
    ],
  },
];

function pageTitle(pathname: string) {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/produk")) return "Produk";
  if (pathname.startsWith("/admin/kategori")) return "Kategori";
  if (pathname.startsWith("/admin/pesanan/")) return "Detail pesanan";
  if (pathname.startsWith("/admin/pesanan")) return "Pesanan";
  if (pathname === "/admin/invoice/baru") return "Buat invoice";
  if (/^\/admin\/invoice\/[^/]+\/edit$/.test(pathname)) return "Edit invoice";
  if (/^\/admin\/invoice\/[^/]+$/.test(pathname)) return "Detail invoice";
  if (pathname.startsWith("/admin/invoice")) return "Invoice";
  return "Admin";
}

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAdminAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const dateLabel = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  function handleLogout() {
    logout();
    router.replace("/admin/login");
  }

  return (
    <div className={`admin-root${menuOpen ? " admin-root--menu-open" : ""}`}>
      <button
        type="button"
        className="admin-sidebar-overlay"
        aria-label="Tutup navigasi"
        onClick={() => setMenuOpen(false)}
      />
      <aside className="admin-sidebar" aria-label="Navigasi admin">
        <div className="admin-brand">
          <Image
            src="/admin-logo.png"
            alt="Logo Cinderella Printing"
            width={38}
            height={38}
            className="admin-brand-mark"
            priority
          />
          <span className="admin-brand-text">
            <strong>Cinderella</strong>
            <small>Admin Panel</small>
          </span>
          <button
            type="button"
            className="admin-sidebar-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Tutup navigasi"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <nav className="admin-nav">
          {navSections.map((section) => (
            <div className="admin-nav-group" key={section.label}>
              <p className="admin-nav-label">{section.label}</p>
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`admin-nav-link${active ? " is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button type="button" className="admin-sidebar-action" onClick={handleLogout}>
            <LogOut size={16} aria-hidden="true" />
            Keluar
          </button>
        </div>
      </aside>

      <div className="admin-body">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-menu-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Buka navigasi"
            >
              <Menu size={20} aria-hidden="true" />
            </button>
            <div>
              <p className="admin-topbar-kicker">Cinderella Printing</p>
              <h2>{pageTitle(pathname)}</h2>
            </div>
          </div>
          <div className="admin-topbar-right">
            <span className="admin-topbar-date">{dateLabel}</span>
            <Link href="/" className="admin-btn admin-btn--ghost admin-btn--sm" target="_blank">
              Lihat situs
            </Link>
            <span className="admin-avatar" aria-hidden="true">
              AD
            </span>
          </div>
        </header>

        <main className="admin-main" id="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
