-- Allow one order to receive multiple verified payments, including a down payment.
ALTER TABLE printing.orders
  DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE printing.orders
  ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('belum_bayar', 'dp', 'lunas'));

ALTER TABLE printing.invoices
  DROP CONSTRAINT IF EXISTS invoices_payment_status_check;
ALTER TABLE printing.invoices
  ADD COLUMN IF NOT EXISTS amount_paid bigint NOT NULL DEFAULT 0;
UPDATE printing.invoices i
SET amount_paid = COALESCE((SELECT sum(p.amount) FROM printing.payments p WHERE p.order_id = i.order_id), 0);
ALTER TABLE printing.invoices
  ADD CONSTRAINT invoices_payment_status_check
  CHECK (payment_status IN ('belum_bayar', 'dp', 'lunas'));
ALTER TABLE printing.invoices
  ADD CONSTRAINT invoices_amount_paid_check
  CHECK (amount_paid >= 0 AND amount_paid <= total);

ALTER TABLE printing.payments
  DROP CONSTRAINT IF EXISTS payments_order_id_key;
ALTER TABLE printing.payments
  ADD CONSTRAINT payments_amount_positive_check CHECK (amount > 0);
CREATE INDEX IF NOT EXISTS payments_order_id_verified_idx
  ON printing.payments (order_id, verified_at DESC, id);

UPDATE printing.orders o
SET payment_status = CASE
  WHEN COALESCE((SELECT sum(p.amount) FROM printing.payments p WHERE p.order_id = o.id), 0) = 0 THEN 'belum_bayar'
  WHEN COALESCE((SELECT sum(p.amount) FROM printing.payments p WHERE p.order_id = o.id), 0) >= o.total THEN 'lunas'
  ELSE 'dp'
END;
