# Chronodat app checklist — Enterprise Classifieds 365

Applied from the Policy & Attestation checklist. Product name is Enterprise Classifieds 365. Publisher is Chronodat LLC. Do not reuse another product’s name, icon, or claims.

## Done for store submission

- [x] Publisher Chronodat LLC, MPN ID 6481556, privacy, terms, and product URLs on chronodat.com
- [x] Long description names only the one web part, full-page app, and Teams tab/personal app
- [x] Graph permissions reduced to User.Read, User.Read.All, and Presence.Read.All, with a written justification
- [x] Teams manifest 1.17, same solution id, `teams:package` builds `TeamsSPFxApp.zip`
- [x] Help links: product page, knowledge base, and contact
- [x] 14-day site trial, yearly site subscription, paywall, refresh, license key, and 7-day status grace
- [x] Subscription host is `https://subscription.chronodat.com` and the product slug is `enterprise-classifieds-365`
- [x] Footer is Chronodat, LLC and the year
- [x] Hash routes, dedicated-subsite setup, and SharePoint title chrome hiding were already in the app
- [x] Teams sidebar starts closed and opens as a drawer
- [x] Azure OpenAI key is masked, copy and cut are blocked, and replace/remove are offered
- [x] Partner Center description, validation steps, and this checklist

## Still open before the listing images are uploaded

- [ ] Capture listing images from this app at 1366×768 and a 1280×720 video thumbnail. Do not reuse Policy & Attestation art.
- [ ] Add the product page, knowledge base article, and website catalog entry on chronodat.com
- [ ] Create the Stripe yearly price (no Stripe trial, tax code `txcd_10103001`) and map `enterprise-classifieds-365` to that Price ID
- [ ] After catalog upload, confirm the item is deployed, `SupportsTeamsTabs` is true, and `ContainsTeamsManifest` is true
- [ ] Spanish, French, and German for the full UI. Store surfaces added in this change are English.
- [ ] Open Sans font files are not bundled. The shell asks for Open Sans and falls back to Segoe UI so the page does not call a third-party font host.
