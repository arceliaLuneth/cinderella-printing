ALTER TABLE printing.invoices
  ADD COLUMN revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  ADD COLUMN revised_at timestamptz;

CREATE TABLE printing.invoice_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES printing.invoices(id) ON DELETE RESTRICT,
  revision integer NOT NULL CHECK (revision > 0),
  revised_at timestamptz,
  archived_at timestamptz NOT NULL DEFAULT now(),
  snapshot jsonb NOT NULL,
  total bigint NOT NULL,
  amount_paid bigint NOT NULL,
  payment_status text NOT NULL,
  sent_at timestamptz,
  pdf bytea NOT NULL,
  pdf_sha256 text NOT NULL,
  UNIQUE (invoice_id, revision)
);
ALTER TABLE printing.invoice_revisions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON printing.invoice_revisions FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON printing.invoice_revisions FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON printing.invoice_revisions FROM authenticated;
  END IF;
END $$;

CREATE FUNCTION printing.protect_invoice_revision() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Salinan invoice terdahulu tidak dapat diubah atau dihapus';
END $$;
CREATE TRIGGER protect_invoice_revision BEFORE UPDATE OR DELETE ON printing.invoice_revisions
FOR EACH ROW EXECUTE FUNCTION printing.protect_invoice_revision();
REVOKE EXECUTE ON FUNCTION printing.protect_invoice_revision() FROM PUBLIC;

CREATE OR REPLACE FUNCTION printing.lock_invoice_history() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'Riwayat invoice tidak dapat dihapus'; END IF;
  IF NEW.order_id IS DISTINCT FROM OLD.order_id
    OR NEW.invoice_number IS DISTINCT FROM OLD.invoice_number
    OR NEW.issued_at IS DISTINCT FROM OLD.issued_at THEN
    RAISE EXCEPTION 'Identitas invoice tidak dapat diubah';
  END IF;

  IF NEW.snapshot IS DISTINCT FROM OLD.snapshot
    OR NEW.total IS DISTINCT FROM OLD.total
    OR NEW.revision IS DISTINCT FROM OLD.revision
    OR NEW.revised_at IS DISTINCT FROM OLD.revised_at THEN
    IF current_setting('printing.revising_order', true) IS DISTINCT FROM OLD.order_id::text
      OR OLD.is_cancelled OR NEW.revision <> OLD.revision + 1
      OR NEW.revised_at IS NULL OR NEW.sent_at IS NOT NULL THEN
      RAISE EXCEPTION 'Gunakan transaksi revisi invoice';
    END IF;
    INSERT INTO printing.invoice_revisions (
      invoice_id,revision,revised_at,snapshot,total,amount_paid,payment_status,sent_at,pdf,pdf_sha256
    ) VALUES (
      OLD.id,OLD.revision,OLD.revised_at,OLD.snapshot,OLD.total,OLD.amount_paid,OLD.payment_status,OLD.sent_at,OLD.pdf,OLD.pdf_sha256
    );
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION printing.lock_billed_order() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM printing.invoices WHERE order_id = OLD.id) THEN
    IF NEW.order_number IS DISTINCT FROM OLD.order_number THEN
      RAISE EXCEPTION 'Nomor pesanan yang telah ditagihkan tidak dapat diubah';
    END IF;
    IF ROW(NEW.customer_id,NEW.source,NEW.subtotal,NEW.additional_cost,NEW.discount,NEW.total,NEW.notes,NEW.due_date)
      IS DISTINCT FROM ROW(OLD.customer_id,OLD.source,OLD.subtotal,OLD.additional_cost,OLD.discount,OLD.total,OLD.notes,OLD.due_date)
      AND current_setting('printing.revising_order', true) IS DISTINCT FROM OLD.id::text THEN
      RAISE EXCEPTION 'Gunakan transaksi revisi untuk mengedit pesanan yang telah ditagihkan';
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION printing.lock_billed_items() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE target_order uuid;
BEGIN
  target_order := CASE WHEN TG_OP = 'INSERT' THEN NEW.order_id ELSE OLD.order_id END;
  IF TG_OP = 'UPDATE' AND NEW.order_id IS DISTINCT FROM OLD.order_id THEN
    RAISE EXCEPTION 'Item pesanan tidak dapat dipindahkan ke pesanan lain';
  END IF;
  PERFORM 1 FROM printing.orders WHERE id = target_order FOR UPDATE;
  IF current_setting('printing.revising_order', true) IS DISTINCT FROM target_order::text
    AND EXISTS (SELECT 1 FROM printing.invoices WHERE order_id = target_order) THEN
    RAISE EXCEPTION 'Gunakan transaksi revisi untuk mengedit item yang telah ditagihkan';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$;
