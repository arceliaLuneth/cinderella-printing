CREATE TABLE printing.catalog_revision (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  revision bigint NOT NULL DEFAULT 0
);
INSERT INTO printing.catalog_revision DEFAULT VALUES;
ALTER TABLE printing.catalog_revision ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON printing.catalog_revision FROM PUBLIC;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON printing.catalog_revision FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON printing.catalog_revision FROM authenticated;
  END IF;
END;
$$;

CREATE FUNCTION printing.bump_catalog_revision() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  UPDATE printing.catalog_revision SET revision = revision + 1 WHERE id;
  RETURN NULL;
END;
$$;
REVOKE ALL ON FUNCTION printing.bump_catalog_revision() FROM PUBLIC;

CREATE TRIGGER catalog_revision_categories
AFTER INSERT OR UPDATE ON printing.categories
FOR EACH STATEMENT EXECUTE FUNCTION printing.bump_catalog_revision();

CREATE TRIGGER catalog_revision_products
AFTER INSERT OR UPDATE ON printing.products
FOR EACH STATEMENT EXECUTE FUNCTION printing.bump_catalog_revision();

CREATE TRIGGER catalog_revision_photos
AFTER INSERT OR UPDATE ON printing.inspiration_photos
FOR EACH STATEMENT EXECUTE FUNCTION printing.bump_catalog_revision();
