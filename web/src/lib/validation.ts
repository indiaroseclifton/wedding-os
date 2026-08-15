export function requiredString(value: unknown, field: string, max = 500): string {
  if (typeof value !== "string") {
    throw new ValidationError(`${field} is required`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new ValidationError(`${field} is required`);
  }
  if (trimmed.length > max) {
    throw new ValidationError(`${field} is too long`);
  }
  return trimmed;
}

export function optionalString(value: unknown, max = 5000): string | undefined {
  if (value == null || value === "") return undefined;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

export function optionalId(value: unknown): string | undefined {
  if (value == null || value === "") return undefined;
  if (typeof value !== "string") return undefined;
  return value.trim() || undefined;
}

export class ValidationError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
