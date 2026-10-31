# Store submission — Enterprise Classifieds 365

AppSource submission notes for Enterprise Classifieds 365 by Chronodat LLC. This product is separate from Policy & Attestation, Timesheets, Asset Management, and Help Desk.

## Artifact map

| Artifact | Location |
| --- | --- |
| SharePoint package | `sharepoint/solution/enterprise-classifieds-365.sppkg` |
| Teams package | `teams/TeamsSPFxApp.zip` and `sharepoint/solution/TeamsSPFxApp.zip` |
| Partner Center description | `docs/store-submission/partner-center-long-description.html` |
| Certification steps | `docs/store-submission/04-validation-test-instructions.md` |
| Checklist | `CHRONODAT-APP-CHECKLIST.md` |

## Partner Center

- Product name: **Enterprise Classifieds 365**
- Publisher: **Chronodat LLC**
- MPN ID: **6481556**
- Primary package: `sharepoint/solution/enterprise-classifieds-365.sppkg`
- Component: one SharePoint Framework web part. Supported on modern pages, as a full-page app, and in Microsoft Teams as a personal app and a channel tab. No extension ships in this package.
- Data boundary: customer SharePoint Online tenant for listings, messages, files, and settings
- External service: `https://subscription.chronodat.com` for the 14-day site trial, yearly subscription status, checkout, and license key. Product slug: `enterprise-classifieds-365`
- Price: one yearly price for one SharePoint site. Do not put a trial on the Stripe price. Tax code `txcd_10103001`. Map the product slug to that Stripe Price ID in the subscription service. Statement descriptor must fit Stripe’s length limit.
- Product page: https://www.chronodat.com/enterprise-classifieds-365
- Knowledge base: https://www.chronodat.com/wiki/enterprise-classifieds-365
- Privacy: https://www.chronodat.com/Privacy
- Terms: https://www.chronodat.com/terms-conditions
- Support: https://www.chronodat.com/contact

## Microsoft Graph permissions

| Scope | Why it is requested |
| --- | --- |
| User.Read | Read the signed-in employee’s profile for listings and messages. |
| User.Read.All | Read colleague profiles, manager, and people search used by seller cards and pickers. |
| Presence.Read.All | Show a colleague’s Teams presence on a profile. |

This package does not request Mail.Send. Listing mail is not sent by the app.

## Build

```powershell
npm run ship
```

That command bundles with `--ship`, builds `TeamsSPFxApp.zip` (manifest 1.17, `color.png` 192×192, `outline.png` 32×32 at the zip root), then runs `gulp package-solution --ship`.

Do not upload marketing images that show another Chronodat product. Capture listing images from this app at 1366×768 and a video thumbnail at 1280×720 before the image upload step. Those image files are not in the repo yet.
