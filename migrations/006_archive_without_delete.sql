ALTER TABLE printing.orders ADD COLUMN archived_at timestamptz;
ALTER TABLE printing.invoices ADD COLUMN archived_at timestamptz;

-- Keep prior line items when an admin revises a draft or an issued invoice.
ALTER TABLE printing.order_items
  ADD COLUMN retired_at timestamptz,
  DROP CONSTRAINT order_items_order_id_position_key;
CREATE UNIQUE INDEX order_items_active_position
  ON printing.order_items (order_id, position) WHERE retired_at IS NULL;
