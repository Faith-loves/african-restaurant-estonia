# GA4 reporting setup

The website currently has no Google Analytics Data API credentials or GA4 property configuration for server-side traffic reporting. Existing Firestore order analytics must remain separate from GA4 traffic reporting.

When traffic reporting is approved, implement it as a server-only admin route that:

1. Reuses `requireAdminPermission(request, "viewAnalytics")`.
2. Reads a server-only GA4 property ID and Google service-account credential from Vercel environment variables.
3. Calls the Google Analytics Data API from the server runtime only.
4. Returns an explicitly scoped, aggregated response to the admin UI.
5. Returns a safe `not configured` response when the property ID or credentials are absent.

Never place service-account credentials, refresh tokens, or Data API secrets in `NEXT_PUBLIC_*` variables or browser code. Do not display visitor counts until the property and credentials have been configured and the API response has been verified.
