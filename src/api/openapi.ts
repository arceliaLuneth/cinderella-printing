import { z } from "zod";
import type { Endpoint } from "./router";

export function openapiSpec(endpoints: Endpoint[]) {
  const paths: Record<string, Record<string, unknown>> = {};
  for (const route of endpoints) {
    const parameters: Record<string, unknown>[] = [];
    for (const name of route.path.matchAll(/\{([^}]+)\}/g)) {
      parameters.push({ in: "path", name: name[1], required: true, schema: { type: "string", format: "uuid" } });
    }
    if (route.query) {
      const shape = z.toJSONSchema(route.query, { target: "openapi-3.0", io: "input" });
      const props = shape.properties || {};
      for (const [name, schema] of Object.entries(props)) {
        parameters.push({ in: "query", name, required: (shape.required ?? []).includes(name), schema });
      }
    }
    const binary = route.path.endsWith("/pdf"), csv = route.path.endsWith(".csv");
    const success = binary ? { "application/pdf": { schema: { type: "string", format: "binary" } } }
      : csv ? { "text/csv": { schema: { type: "string" } } }
      : { "application/json": { schema: { $ref: "#/components/schemas/Success" } } };
    const responses: Record<string, unknown> = {
      [route.method === "POST" && !route.path.includes("/auth/") &&
        !route.path.includes("/confirm") && !route.path.includes("/payments/") ? "201" : "200"]: {
        description: "Berhasil. Uang dan kuantitas desimal dikembalikan sebagai string.", content: success,
      },
    };
    for (const code of ["400","401","403","404","405","409","413","415","422","429","500","502","503"]) {
      responses[code] = { description: "Permintaan gagal; lihat error.code dan request_id.",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } };
    }
    paths[route.path] ??= {};
    paths[route.path][route.method.toLowerCase()] = {
      summary: route.summary,
      operationId: route.method.toLowerCase() + route.path.replace(/[^a-zA-Z0-9]+/g, "_"),
      tags: [route.path.split("/")[1] || "system"],
      security: route.admin ? [{ bearerAuth: [] }] : [],
      ...(parameters.length ? { parameters } : {}),
      ...(route.body ? { requestBody: { required: true, content: { "application/json": {
        schema: z.toJSONSchema(route.body, { target: "openapi-3.0", io: "input" }),
      } } } } : {}),
      ...(route.multipart ? { requestBody: { required: true, content: { "multipart/form-data": {
        schema: { type: "object", required: ["file"], properties: { file: { type: "string", format: "binary" } } },
      } } } } : {}),
      responses,
    };
  }
  return {
    openapi: "3.0.3",
    info: { title: "Cinderella Printing Backend", version: "1.0.0",
      description: "API backend Next.js + PostgreSQL/Supabase. Pemesanan hanya melalui admin. Nominal rupiah berupa string integer, quantity berupa string desimal hingga 3 angka. Diskon dan biaya tambahan maksimum Rp1 triliun; harga satuan maksimum Rp1 miliar. Pembayaran manual lunas, tanpa payment gateway. Lihat README dan docs/API.md untuk bentuk data respons." },
    servers: [{ url: "/api/v1" }],
    paths,
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "Supabase access token" } },
      schemas: {
        Success: { type: "object", properties: { data: {}, meta: {
          type: "object", properties: { page: { type: "integer" }, limit: { type: "integer" }, total: { type: "integer" } },
        } }, required: ["data"] },
        Error: { type: "object", required: ["error","request_id"], properties: {
          error: { type: "object", required: ["code","message"], properties: {
            code: { type: "string" }, message: { type: "string" }, details: {},
          } }, request_id: { type: "string", format: "uuid" },
        } },
      },
    },
  };
}
