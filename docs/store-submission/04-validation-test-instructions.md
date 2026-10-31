# Certification test instructions — Enterprise Classifieds 365

Publisher: Chronodat LLC. Install the package from `sharepoint/solution/enterprise-classifieds-365.sppkg` in the tenant app catalog, deploy it, and add the Enterprise Classifieds 365 web part to a modern page on a dedicated SharePoint subsite. Sync the same package to Teams. The solution id and the Teams manifest id are `01edb3d7-481b-4569-9530-e0a9922f3a3d`. The web part id is `11ba5f14-f00a-4922-94bc-94155bf58a16`.

## Expected package

- One web part. No SharePoint Framework extension.
- Teams manifest version 1.17. `ClientSideAssets/TeamsSPFxApp.zip` contains `manifest.json`, `color.png`, and `outline.png` at the zip root.
- Developer is Chronodat LLC. Privacy, terms, and website URLs are on chronodat.com. MPN ID is 6481556.
- Graph scopes are User.Read, User.Read.All, and Presence.Read.All.

## First run

1. Open the page. The app asks a site owner to run setup on a dedicated subsite.
2. Run setup. Lists and libraries are created in that site. When setup finishes, the marketplace opens.
3. The first successful call to subscription.chronodat.com starts a 14-day trial for that site. A trial banner shows the days remaining and a Subscribe action.
4. If subscription.chronodat.com cannot be reached and there is no recent successful status, the app shows a connection problem and a Retry action. It does not say the trial ended.
5. Footer reads Chronodat, LLC and the current year.

## Marketplace

1. Create a listing with a photo and publish it.
2. Find it from Home and from Listings. Free, For rent, Donation, and Wanted filters change the result set.
3. Open the listing, send a message, and mark it sold as the owner.
4. Help links open the Chronodat product page, knowledge base, and contact page, plus the in-app privacy and terms pages.

## Access after the trial

When the subscription service returns no access, the marketplace is replaced by Subscribe, Refresh, and Activate license key. Subscription details stay available from that screen. A valid key for product slug `enterprise-classifieds-365` restores access after Refresh. An active yearly subscription for the site also restores access. The subscription covers that SharePoint site, not the whole tenant.

## Teams

Add the personal app and a channel tab. The sidebar starts closed and opens from the menu button. The same web part id is used.
