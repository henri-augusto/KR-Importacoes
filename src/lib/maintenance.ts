const TRUTHY = new Set(["true", "1", "yes", "on"]);

/**
 * Server-only. Lê MAINTENANCE_MODE em runtime (layout com force-dynamic).
 */
export function isMaintenanceMode(): boolean {
  const value = process.env.MAINTENANCE_MODE?.trim().toLowerCase();
  if (!value) return false;
  return TRUTHY.has(value);
}
