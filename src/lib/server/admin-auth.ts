import "server-only";

// Shared bearer-token check for the manual admin trigger and the Vercel
// Cron route. Both read the same ADMIN_CRON_SECRET env var — for Vercel
// Cron's automatic `Authorization: Bearer $CRON_SECRET` header to pass
// this check, set a `CRON_SECRET` env var in the Vercel project with the
// same value as ADMIN_CRON_SECRET (see README for the deploy step).
export function isAuthorizedAdminRequest(request: Request): boolean {
  const configuredSecret = process.env.ADMIN_CRON_SECRET;
  if (!configuredSecret) return false;

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${configuredSecret}`;
}
