# GA4 reporting setup

The website currently has no Google Analytics Data API credentials or GA4 property configuration for server-side traffic reporting. Existing Firestore order analytics must remain separate from GA4 traffic reporting.

When traffic reporting is approved, implement it as a server-only admin route that:

1. Reuses `requireAdminPermission(request, "viewAnalytics")`.
2. Reads a server-only GA4 property ID and Google service-account credential from Vercel environment variables.
3. Calls the Google Analytics Data API from the server runtime only.
4. Returns an explicitly scoped, aggregated response to the admin UI.
5. Returns a safe `not configured` response when the property ID or credentials are absent.

Never place service-account credentials, refresh tokens, or Data API secrets in `NEXT_PUBLIC_*` variables or browser code. Do not display visitor counts until the property and credentials have been configured and the API response has been verified.

## Ecommerce funnel definitions

The website emits GA4 recommended ecommerce events only after analytics consent:

- `view_item_list`: a priced menu list becomes visible after loading or filtering.
- `select_item`: a customer chooses an available menu item to open its configuration modal.
- `view_item`: the item configuration modal opens for a new menu selection.
- `add_to_cart`: a configured item is successfully added to the cart.
- `remove_from_cart`: an item is removed, reduced from quantity one to zero, or the cart is cleared.
- `view_cart`: the cart drawer is opened with at least one item.
- `begin_checkout`: the customer continues from the cart into the order-details page.
- `purchase`: the server confirms a successful order and returns validated order items.

Use event counts for action volume, and use users or sessions for people/session-based conversion rates. A practical reporting funnel is:

`view_item_list` → `select_item` or `view_item` → `add_to_cart` → `view_cart` → `begin_checkout` → `purchase`

Recommended derived metrics:

- Menu views: count of `view_item_list` events, or distinct users with that event.
- Add-to-cart activity: count of `add_to_cart` events and summed item quantities.
- Checkout starts: count of `begin_checkout` events.
- Completed purchases: count of `purchase` events, using `transaction_id` for deduplication.
- Checkout conversion rate: users with `purchase` divided by users with `begin_checkout` for the same period.
- Estimated cart abandonment: users with `view_cart` but no `begin_checkout` or `purchase` within the reporting window.
- Estimated checkout abandonment: users with `begin_checkout` but no `purchase` within the reporting window.

These are estimates based on consented GA4 events, not exact order-system truth. They do not recover historical abandoned carts, and event counts are not interchangeable with users or sessions.
