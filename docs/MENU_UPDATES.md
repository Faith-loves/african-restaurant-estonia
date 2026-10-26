# Requested menu changes

The catalogue and the admin's **Apply menu updates** action contain the owner's confirmed changes.

| Item | Small | Medium | Large |
| --- | --- | --- | --- |
| Fried Plantain | €6 | €12 | €24 |
| Fried Rice / Vegan Fried Rice | €10 (unchanged) | €15 | €20 |
| Jollof Rice / Vegan Jollof Rice | €9.50 (unchanged) | €12.70 | €19.50 |
| Fried Yam | — | €11.50 | €16.90 |
| Roasted Plantains | — | €14 | €28 |

| Combo / meal | Price | Availability |
| --- | --- | --- |
| Egusi + Beef + Eba + Zobo | €25 | Available, Today's Menu |
| Egusi + Beef + Poundo + Zobo | €26 | Available, Today's Menu |
| Ewedu Soup | €6 | Available, Today's Menu |
| Fried Yam + Fried Plantain + Tomato Sauce + Zobo | €22 | Available, Today's Menu |
| Fried Rice + Chicken | €20 | Available, Today's Menu |
| Fried Rice + Turkey | €21 | Available, Today's Menu |
| Fried Rice + Fish | €22 | Available, Today's Menu |
| Jollof + Chicken | €19 | Available, Today's Menu |
| Jollof + Turkey | €20 | Available, Today's Menu |
| Jollof + Fish | €21 | Available, Today's Menu |
| Fish Pie / Chicken Pie | Existing prices retained | Unavailable |

Rice combos retain their included plantain and Zobo. The same chicken combo prices also apply to the Puff Puff versions, following the request for all rice combos.

All ten drink extras have the supplied sizes and prices: Coca-Cola, Zero and Fanta 0.50 L at €3; Coca-Cola, Zero, Fanta and Sprite 0.30 L at €2.45; Water 0.50 L at €2.15; Zobo and Ginger Drink 0.30 L at €3.99. Corresponding drink products are priced too. Malt and Capri-Sun standalone prices remain unconfirmed.

Soups, Ofada Sauce and Ayamase Sauce receive the confirmed Small protein extras: chicken €6.50, turkey €7.50, beef €10.50, fish €10.50, gizzard €9.50 and pomo €8.50. Other existing meal extras remain intact. Unspecified soup base prices/availability remain unchanged.

## Apply to the saved menu

After this version is deployed, sign in to **Admin → Menu**, then click **Apply menu updates**. This writes the requested changes to Firestore, which powers both admin/customer menus and checkout. Photos, descriptions and custom extras are preserved. The update is versioned per document so applying it again preserves later manual edits. No destructive catalogue re-import is needed.

The source folder has no Firebase credentials; the live database has not been changed from this workspace.

## Verification

`node scripts/verify-menu-prices.mjs` verifies every requested price, drink extras, soup proteins, availability, preserved custom fields, vegan alignment, one-batch application and repeat-update protection against an in-memory database. Existing menu-edit and checkout regression checks also pass.
