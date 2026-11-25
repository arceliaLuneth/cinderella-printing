export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
    public headers?: Record<string, string>,
  ) { super(message); }
}
export function missing(label = "Data"): never {
  throw new ApiError(404, "NOT_FOUND", label + " tidak ditemukan.");
}
export function conflict(message: string): never {
  throw new ApiError(409, "CONFLICT", message);
}
