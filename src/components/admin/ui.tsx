"use client";

import { useLayoutEffect, useEffectEvent, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Search, X } from "lucide-react";
import type { Tone } from "@/lib/admin/format";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="admin-page-header">
      <div>
        {eyebrow && <p className="admin-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="admin-page-desc">{description}</p>}
      </div>
      {actions && <div className="admin-page-actions">{actions}</div>}
    </header>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "info",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: ReactNode;
  tone?: "info" | "success" | "warning" | "neutral";
}) {
  return (
    <article className={`admin-stat admin-stat--${tone}`}>
      <div className="admin-stat-icon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <p className="admin-stat-label">{label}</p>
        <p className="admin-stat-value">{value}</p>
        {hint && <p className="admin-stat-hint">{hint}</p>}
      </div>
    </article>
  );
}

export function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  return <span className={`admin-badge admin-badge--${tone}`}>{label}</span>;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="admin-empty">
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder = "Cari…",
  label = "Cari data",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}) {
  return (
    <label className="admin-search">
      <span className="sr-only">{label}</span>
      <Search size={16} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

export function Modal({
  title,
  description,
  onClose,
  children,
  size = "md",
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const titleId = useId();
  const dialog = useRef<HTMLDivElement>(null);
  const close = useEffectEvent(onClose);
  const [previousFocus] = useState(() => document.activeElement);

  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>(".admin-root");
    const wasInert = root?.inert ?? false;
    if (root) root.inert = true;
    if (!dialog.current?.contains(document.activeElement)) dialog.current?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key !== "Tab" || !dialog.current) return;
      const controls = Array.from(dialog.current.querySelectorAll<HTMLElement>(
        'a[href],button,input,select,textarea,[tabindex]',
      )).filter(el => el.tabIndex >= 0 && !el.matches(":disabled") && el.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (!first || (event.shiftKey && [dialog.current, first].includes(document.activeElement as HTMLElement))) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      if (root) root.inert = wasInert;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [previousFocus]);

  return createPortal(
    <div
      className="admin-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`admin-modal admin-modal--${size}`}
        ref={dialog}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="admin-modal-head">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button type="button" className="admin-icon-btn" onClick={onClose} aria-label="Tutup">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
      </div>
    </div>, document.body
  );
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Konfirmasi",
  pending = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal title={title} onClose={() => { if (!pending) onCancel(); }} size="sm">
      <div className="admin-confirm">
        <span className="admin-confirm-icon" aria-hidden="true">
          <AlertTriangle size={22} />
        </span>
        <p>{message}</p>
      </div>
      <div className="admin-form-actions">
        <button type="button" className="admin-btn admin-btn--ghost" onClick={onCancel} disabled={pending}>
          Batal
        </button>
        <button type="button" className="admin-btn admin-btn--danger" onClick={onConfirm} disabled={pending}>
          {pending ? "Menyimpan…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function LoadingPanel({ label = "Memuat data…" }: { label?: string }) {
  return (
    <div className="admin-loading" role="status">
      <span className="admin-spinner" aria-hidden="true" />
      {label}
    </div>
  );
}
