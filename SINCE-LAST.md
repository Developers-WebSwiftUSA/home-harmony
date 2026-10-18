# Since last commit

Uncommitted work since `4c1f2b67` — **Show each listing thumbnail from that property's first image.** (5 Sep 2026).

This is a working-tree summary, not a commit.

---

## 0. Interactive first-visit tutorial

Game-style walkthrough with **intro → spotlight steps → outro**.

- Spotlight + blur, animated cursor, forced click on the glowing control; other clicks blocked.
- Progress dots, body scroll lock, smart coachmark placement, Skip anytime.
- Guest: after Welcome → Start tour → Properties → Rentals → Agents → How It Works → User Guide → Sign In → Finish.
- **After login/register:** guest tour closes and the matching **dashboard tour** starts (buyer / seller / agent / admin) with intro → sidebar highlights → User Guide → finish.
- Replay from User Guide → **Replay interactive tutorial**.
- Persistence: `htg-guided-tour-{public|buyer|seller|agent|admin}`.

---

## 0b. Agent request / admin assign workflow

- **Admin adds agents** via Users → Add agent (`POST /api/users/agents`). Public signup no longer offers Agent.
- **Sellers request** an agent per listing (`RequestAgentControl` on My Listings); they cannot assign directly.
- **Admin approves** on `/admin/agent-requests` and picks the agent (defaults to seller preference).
- Model: `AgentAssignmentRequest`. Direct `PUT /properties/:id/assign-agent` is **admin-only**.
- Pending-action badge: Agent Requests.

---

## 1. Listing photos: main image + gallery

Sellers/agents set a **main photo** and a separate **gallery** on add/edit listing (`ListingImageFields`, `SellerAddListing`).

Sale property detail shows the gallery as a carousel. Public listings still use the first/main image as the thumbnail.

---

## 2. Pay to Go extra gallery photos

- Main photo is free.
- First **3 gallery** photos are free.
- Extra gallery photos require Pay to Go (mock card checkout, same pattern as ad campaigns).
- Extra photos stay private until admin approves.
- Model: `GallerySlotPurchase`; listings store `paidGallerySlots`.
- Public image cap: `limitImagesForPublic` in `backend/utils/galleryPricing.js`.
- Existing listings were grandfathered on server start (`migrateGallerySlots.js`) so already-public extras were not cut off.

**Admin:** `/admin/gallery-photos` (`AdminGalleryPurchases.tsx`) to approve, charge, reject, refund, view usage, and grant/revoke slots.

Pending-action badges include gallery purchases.

---

## 3. Dedicated Admin Pricing page

Image and ad campaign prices are **not** edited on billing/approval pages.

- New **Admin → Pricing** at `/admin/pricing`.
- Rates on `PlatformSettings`: `gallerySlotPrice`, `advertisementDailyRate`, `sponsoredDailyRate`.
- API: `GET/PUT /api/platform-settings/pricing` (admin).
- Ad daily rates read from settings (`adPricing.js` is async).
- Gallery Photos and Admin Settings only **link** to Pricing; Ad Campaigns / Gallery Photos do the same.

---

## 4. Agent preferred area (optional)

Agents can set a service area so they rank higher when sellers assign an agent.

**Registration:** optional map search + radius when role is Agent. Not required to sign up.

**Later:** add / change / remove from:
- Agent dashboard overview card
- Agent Settings → Preferred area

**Storage:** `agentProfile.preferredArea` (`label`, `city`, `state`, `radiusMiles`, GeoJSON `[lng, lat]`).

**Ranking** (`agentProximity.js`): preferred-area coords over profile location and assigned listings. Sort: in preferred radius → same state → same city → distance → name.

**Assign-agent picker:** “Preferred area” badge and “Suggested nearby” grouping.

---

## 5. User Guide on every page

- Labeled **User Guide** button (bottom-right) opens the page-specific manual.
- Public navbar and footer include User Guide.
- Dashboard sidebar **Help** renamed to **User Guide** (still goes to `/admin|buyer|seller|agent/help`).
- Help manuals added/updated for pricing, gallery photos, preferred area, and related pages.

---

## 6. Agent selection listing

`AssignAgentSelect` / active-agents API rank agents for the listing location. Public Agents page and related assignment UI show location / preferred-area context.

---

## 7. Bugfixes (from testing)

- Skipping or **removing** preferred area no longer leaves an empty GeoJSON stub (`Point` with `[]`). Register-without-area, `/auth/me`, and Remove area now return no area.
- Profile update no longer mixes a full `location` object with nested `location.*` paths in the same Mongo `$set`.
- Enter in map search no longer submits the registration form; it selects the first place result.
- User Guide button sits **below** dialogs (`z-40`) and hides while the guide is open.
- Map picker: stable Leaflet instance id; choosing a search result does not fire two conflicting updates.
- Extra padding on login so the User Guide chip does not cover Create Account.

---

## 8. Tests

- Frontend vitest: gallery slots, preferred area, help routes, pending badges (39 tests passing when last run).
- Backend: `backend/utils/agentProximity.test.mjs` (ranking + empty-area sanitizing).

---

## New routes

| Path | Role |
|------|------|
| `/admin/pricing` | Admin pricing |
| `/admin/gallery-photos` | Admin gallery slot purchases |
| `/admin/agent-requests` | Admin approve/assign agent requests |
| `/api/platform-settings/pricing` | GET/PUT pricing |
| `/api/gallery-slots` | Gallery slot purchases |
| `/api/agent-requests` | Seller request / admin approve agent assignment |
| `/api/users/agents` (POST) | Admin create agent |

---

## Not for commit

`backend/uploads/*.jpg` files are leftover uploaded images, not source. Do not include them unless you intend to keep sample uploads.
