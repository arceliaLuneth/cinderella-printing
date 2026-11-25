-- Skema privat: akses data hanya melalui API Next.js.
-- Jangan menambahkan skema printing ke Exposed schemas Supabase.
CREATE SCHEMA printing;
REVOKE ALL ON SCHEMA printing FROM PUBLIC;

CREATE TABLE printing.admin_users (
  id uuid PRIMARY KEY,
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 120),
  email text NOT NULL UNIQUE CHECK (email = lower(email)),
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'admin')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Tidak menyimpan password; id adalah UUID Supabase Auth yang sudah diverifikasi.
-- Tidak memakai FK auth.users agar migrasi sama dapat berjalan di PostgreSQL biasa.

CREATE TABLE printing.company_profile (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  business_name text NOT NULL,
  about text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  logo_url text NOT NULL DEFAULT '',
  opening_hours text NOT NULL DEFAULT '',
  services jsonb NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(services) = 'array'),
  portfolio jsonb NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(portfolio) = 'array'),
  how_to_order jsonb NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(how_to_order) = 'array'),
  faqs jsonb NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(faqs) = 'array'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO printing.company_profile (business_name) VALUES ('Cinderella Printing');

CREATE TABLE printing.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 120),
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX categories_name_unique ON printing.categories (lower(name));

CREATE TABLE printing.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES printing.categories(id) ON DELETE RESTRICT,
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 180),
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  image_url text,
  unit text NOT NULL CHECK (length(btrim(unit)) BETWEEN 1 AND 30),
  reference_price bigint CHECK (reference_price BETWEEN 0 AND 1000000000),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON printing.products (category_id);
CREATE INDEX products_active_idx ON printing.products (is_active, created_at DESC, id);

CREATE TABLE printing.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 160),
  phone text NOT NULL CHECK (length(btrim(phone)) BETWEEN 6 AND 30),
  email text,
  address text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX customers_phone_idx ON printing.customers (phone);

CREATE SEQUENCE printing.order_number_seq;
CREATE SEQUENCE printing.invoice_number_seq;
CREATE TABLE printing.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE DEFAULT (
    'ORD-' || to_char(now() AT TIME ZONE 'Asia/Jakarta', 'YYYYMMDD') || '-' ||
    lpad(nextval('printing.order_number_seq')::text, 8, '0')
  ),
  customer_id uuid NOT NULL REFERENCES printing.customers(id) ON DELETE RESTRICT,
  source text NOT NULL CHECK (source IN ('whatsapp', 'langsung')),
  status text NOT NULL DEFAULT 'baru'
    CHECK (status IN ('baru', 'diproses', 'dikirim', 'selesai', 'dibatalkan')),
  payment_status text NOT NULL DEFAULT 'belum_bayar' CHECK (payment_status IN ('belum_bayar', 'lunas')),
  subtotal bigint NOT NULL CHECK (subtotal >= 0),
  additional_cost bigint NOT NULL DEFAULT 0 CHECK (additional_cost BETWEEN 0 AND 1000000000000),
  discount bigint NOT NULL DEFAULT 0 CHECK (discount BETWEEN 0 AND 1000000000000),
  total bigint NOT NULL CHECK (total >= 0 AND total = subtotal + additional_cost - discount),
  notes text NOT NULL DEFAULT '',
  due_date date,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  created_by uuid NOT NULL REFERENCES printing.admin_users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_customer_idx ON printing.orders (customer_id);
CREATE INDEX orders_status_idx ON printing.orders (status, created_at DESC);
CREATE INDEX orders_created_idx ON printing.orders (created_at DESC, id);

CREATE TABLE printing.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES printing.orders(id) ON DELETE RESTRICT,
  product_id uuid NOT NULL REFERENCES printing.products(id) ON DELETE RESTRICT,
  position integer NOT NULL CHECK (position >= 0),
  product_name text NOT NULL,
  unit text NOT NULL,
  specifications jsonb NOT NULL CHECK (jsonb_typeof(specifications) = 'object'),
  quantity numeric(12,3) NOT NULL CHECK (quantity > 0 AND quantity <= 1000000),
  unit_price bigint NOT NULL CHECK (unit_price BETWEEN 0 AND 1000000000),
  line_total bigint GENERATED ALWAYS AS (round(quantity * unit_price)::bigint) STORED,
  UNIQUE (order_id, position)
);
CREATE INDEX order_items_product_idx ON printing.order_items (product_id);

CREATE TABLE printing.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE REFERENCES printing.orders(id) ON DELETE RESTRICT,
  invoice_number text NOT NULL UNIQUE DEFAULT (
    'INV-' || to_char(now() AT TIME ZONE 'Asia/Jakarta', 'YYYYMMDD') || '-' ||
    lpad(nextval('printing.invoice_number_seq')::text, 8, '0')
  ),
  issued_at timestamptz NOT NULL DEFAULT now(),
  snapshot jsonb NOT NULL CHECK (jsonb_typeof(snapshot) = 'object'),
  total bigint NOT NULL CHECK (total >= 0),
  payment_status text NOT NULL CHECK (payment_status IN ('belum_bayar', 'lunas')),
  is_cancelled boolean NOT NULL DEFAULT false,
  pdf bytea NOT NULL,
  pdf_sha256 text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX invoices_issued_idx ON printing.invoices (issued_at DESC, id);

CREATE TABLE printing.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE REFERENCES printing.orders(id) ON DELETE RESTRICT,
  amount bigint NOT NULL CHECK (amount >= 0),
  method text NOT NULL CHECK (method IN ('tunai', 'transfer')),
  reference text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  verified_by uuid NOT NULL REFERENCES printing.admin_users(id),
  verified_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE printing.audit_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id uuid NOT NULL REFERENCES printing.admin_users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_created_idx ON printing.audit_logs (created_at DESC);

CREATE TABLE printing.rate_limits (
  key text PRIMARY KEY,
  attempts integer NOT NULL DEFAULT 1,
  expires_at timestamptz NOT NULL
);
CREATE INDEX rate_limits_expiry_idx ON printing.rate_limits (expires_at);

CREATE FUNCTION printing.touch_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE FUNCTION printing.lock_invoice_history() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'Riwayat invoice tidak dapat dihapus'; END IF;
  IF NEW.order_id IS DISTINCT FROM OLD.order_id
    OR NEW.invoice_number IS DISTINCT FROM OLD.invoice_number
    OR NEW.issued_at IS DISTINCT FROM OLD.issued_at
    OR NEW.snapshot IS DISTINCT FROM OLD.snapshot
    OR NEW.total IS DISTINCT FROM OLD.total THEN
    RAISE EXCEPTION 'Snapshot invoice tidak dapat diubah';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER invoice_history BEFORE UPDATE OR DELETE ON printing.invoices
FOR EACH ROW EXECUTE FUNCTION printing.lock_invoice_history();

CREATE FUNCTION printing.lock_billed_order() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM printing.invoices WHERE order_id = OLD.id) AND (
    NEW.customer_id IS DISTINCT FROM OLD.customer_id
    OR NEW.order_number IS DISTINCT FROM OLD.order_number
    OR NEW.source IS DISTINCT FROM OLD.source
    OR NEW.subtotal IS DISTINCT FROM OLD.subtotal
    OR NEW.additional_cost IS DISTINCT FROM OLD.additional_cost
    OR NEW.discount IS DISTINCT FROM OLD.discount
    OR NEW.total IS DISTINCT FROM OLD.total
    OR NEW.notes IS DISTINCT FROM OLD.notes
    OR NEW.due_date IS DISTINCT FROM OLD.due_date
  ) THEN RAISE EXCEPTION 'Pesanan yang telah ditagihkan tidak dapat diedit'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER billed_order BEFORE UPDATE ON printing.orders
FOR EACH ROW EXECUTE FUNCTION printing.lock_billed_order();

CREATE FUNCTION printing.lock_billed_items() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE target_order uuid;
BEGIN
  target_order := CASE WHEN TG_OP = 'INSERT' THEN NEW.order_id ELSE OLD.order_id END;
  -- Kunci parent yang sama dengan alur konfirmasi untuk mencegah balapan transaksi.
  PERFORM 1 FROM printing.orders WHERE id = target_order FOR UPDATE;
  IF EXISTS (SELECT 1 FROM printing.invoices WHERE order_id = target_order)
    OR (TG_OP = 'UPDATE' AND EXISTS (
      SELECT 1 FROM printing.invoices WHERE order_id = NEW.order_id
    )) THEN RAISE EXCEPTION 'Detail pesanan yang telah ditagihkan tidak dapat diubah'; END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER billed_items BEFORE INSERT OR UPDATE OR DELETE ON printing.order_items
FOR EACH ROW EXECUTE FUNCTION printing.lock_billed_items();

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['company_profile','categories','products','customers','orders','invoices'] LOOP
    EXECUTE format('CREATE TRIGGER touch_updated_at BEFORE UPDATE ON printing.%I FOR EACH ROW EXECUTE FUNCTION printing.touch_updated_at()', t);
  END LOOP;
  FOREACH t IN ARRAY ARRAY[
    'admin_users','company_profile','categories','products','customers',
    'orders','order_items','invoices','payments','audit_logs','rate_limits'
  ] LOOP
    EXECUTE format('ALTER TABLE printing.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON printing.%I FROM PUBLIC', t);
  END LOOP;
  -- Tidak ada policy anon/authenticated: Data API tidak dapat mengakses skema ini.
  -- Kredensial DATABASE_URL hanya digunakan server, yang memeriksa admin_users.
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON SCHEMA printing FROM anon;
    REVOKE ALL ON ALL TABLES IN SCHEMA printing FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON SCHEMA printing FROM authenticated;
    REVOKE ALL ON ALL TABLES IN SCHEMA printing FROM authenticated;
  END IF;
END $$;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA printing FROM PUBLIC;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA printing FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA printing REVOKE ALL ON TABLES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA printing REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
