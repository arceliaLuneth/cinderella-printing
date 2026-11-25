import { mkdir, writeFile } from "node:fs/promises";
import { endpoints } from "../src/api/router";
import { openapiSpec } from "../src/api/openapi";

async function main() {
  await mkdir("docs", { recursive: true });
  await writeFile("docs/openapi.json", JSON.stringify(openapiSpec(endpoints), null, 2) + "\n");
  console.log("docs/openapi.json diperbarui (" + endpoints.length + " operasi).");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "OpenAPI gagal dibuat");
  process.exitCode = 1;
});
