import { audit, query, transaction } from "../lib/db";
import { missing } from "../lib/errors";
import type { InspirationInput, InspirationPhoto } from "../types/inspiration";

export async function listPhotos(publicOnly = false) {
  const result = await query<InspirationPhoto>(
    "SELECT id,title,description,image_url,is_active FROM printing.inspiration_photos" +
    (publicOnly ? " WHERE is_active" : "") + " ORDER BY created_at DESC,id",
  );
  return result.rows;
}

export async function savePhoto(input: InspirationInput, actorId: string, id?: string) {
  return transaction(async (db) => {
    const values = [input.title, input.description, input.image_url, input.is_active];
    const result = id
      ? await db.query<InspirationPhoto>(
          "UPDATE printing.inspiration_photos SET title=$1,description=$2,image_url=$3,is_active=$4 WHERE id=$5 RETURNING id,title,description,image_url,is_active",
          [...values, id],
        )
      : await db.query<InspirationPhoto>(
          "INSERT INTO printing.inspiration_photos (title,description,image_url,is_active) VALUES ($1,$2,$3,$4) RETURNING id,title,description,image_url,is_active",
          values,
        );
    const photo = result.rows[0] || missing("Foto inspirasi");
    await audit(db, actorId, id ? "inspiration.updated" : "inspiration.created", "inspiration_photos", photo.id);
    return photo;
  });
}
