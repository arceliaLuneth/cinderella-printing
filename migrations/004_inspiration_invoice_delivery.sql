CREATE TABLE printing.inspiration_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 160),
  description text NOT NULL DEFAULT '' CHECK (length(description) <= 2000),
  image_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE printing.inspiration_photos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON printing.inspiration_photos FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON printing.inspiration_photos FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON printing.inspiration_photos FROM authenticated;
  END IF;
END $$;

CREATE TRIGGER inspiration_photos_touch
BEFORE UPDATE ON printing.inspiration_photos
FOR EACH ROW EXECUTE FUNCTION printing.touch_updated_at();

ALTER TABLE printing.invoices ADD COLUMN sent_at timestamptz;
