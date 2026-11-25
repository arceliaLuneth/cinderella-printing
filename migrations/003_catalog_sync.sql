ALTER TABLE printing.products
  ADD COLUMN sku text CHECK (sku IS NULL OR length(btrim(sku)) BETWEEN 1 AND 80),
  ADD COLUMN min_order integer NOT NULL DEFAULT 1 CHECK (min_order BETWEEN 1 AND 1000000),
  ADD COLUMN is_draft boolean NOT NULL DEFAULT false,
  ADD CONSTRAINT products_draft_not_active CHECK (NOT (is_draft AND is_active));

CREATE UNIQUE INDEX products_sku_unique ON printing.products (lower(sku)) WHERE sku IS NOT NULL;

-- Retire only the exact records created by the old demo seed.
UPDATE printing.products p SET is_active = false
FROM printing.categories c
WHERE p.category_id = c.id
  AND c.slug = 'demo-cetak-kertas' AND c.name = '[DEMO] Cetak Kertas'
  AND (p.slug, p.name) IN (('demo-brosur-a5', '[DEMO] Brosur A5'), ('demo-kartu-nama', '[DEMO] Kartu Nama'));

UPDATE printing.categories c SET is_active = false
WHERE c.slug = 'demo-cetak-kertas' AND c.name = '[DEMO] Cetak Kertas'
  AND NOT EXISTS (SELECT 1 FROM printing.products p WHERE p.category_id = c.id AND p.is_active);
