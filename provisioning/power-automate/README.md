# Enterprise Classifieds 365 — Power Automate Flows

This document describes the Power Automate cloud flows that support Enterprise Classifieds 365. Each flow references SharePoint lists defined in `provisioning/schemas/` and uses templates from the `EC365_Templates` document library where applicable.

## Prerequisites

- SharePoint site provisioned via `ProvisioningService` (lists, libraries, groups)
- Connections: SharePoint, Office 365 Outlook, Microsoft Teams, Approvals
- Service account or flow owner with Edit access to EC365 lists
- Environment variables (recommended):
  - `EC365_SiteUrl` — SharePoint site absolute URL
  - `EC365_AdminEmail` — Admin notification mailbox
  - `EC365_TeamsChannelId` — Default Teams channel for announcements

---

## 1. Approval Flow

**Name:** `EC365 - Listing Approval`

**Trigger:** When an item is created or modified — `EC365_Listings`  
**Condition:** `EC365_Status` equals `Pending`

### Steps

1. **Create approval queue item**
   - List: `EC365_ApprovalQueue`
   - Set `EC365_ListingId`, `EC365_ListingTitle`, `EC365_SubmittedBy`, `EC365_SubmittedOn`, `EC365_Status` = `Pending`

2. **Start and wait for an approval**
   - Type: Approve/Reject — first to respond
   - Assigned to: SharePoint group `EC365_Approvers`
   - Title: `Approve listing: @{triggerOutputs()?['body/Title']}`
   - Details: Include listing description, price, category, seller name, thumbnail URL

3. **Condition — Approved**
   - **If yes:**
     - Update `EC365_Listings`: `EC365_Status` = `Approved`, `EC365_PublishedOn` = `utcNow()`, `EC365_ExpiresOn` = `addDays(utcNow(), 90)`
     - Update `EC365_ApprovalQueue`: `EC365_Status` = `Approved`, `EC365_ReviewedBy`, `EC365_ReviewedOn`
     - Create `EC365_Notifications` item for seller (type: `Approval`)
     - Invoke **Email Notification** sub-flow (template key: `ListingApproved`)
     - Log to `EC365_ActivityLogs` (action: `ListingApproved`)
   - **If no:**
     - Update `EC365_Listings`: `EC365_Status` = `Rejected`, `EC365_ApprovalNotes` = approver comments
     - Update `EC365_ApprovalQueue`: `EC365_Status` = `Rejected`
     - Create seller notification (type: `Approval`)
     - Invoke **Email Notification** sub-flow (template key: `ListingRejected`)

### Error handling

- Configure run-after on failure to notify `EC365_AdminEmail`
- Write failure details to `EC365_ActivityLogs`

---

## 2. Expiration Reminder Flow

**Name:** `EC365 - Expiration Reminder`

**Trigger:** Recurrence — daily at 08:00 (site time zone)

### Steps

1. **Get items** from `EC365_Listings`:
   - Filter: `EC365_Status eq 'Approved' and EC365_ExpiresOn le '@{addDays(utcNow(), 7)}' and EC365_ExpiresOn ge '@{utcNow()}'`

2. **Apply to each** listing:
   - Create `EC365_Notifications` for seller (type: `Expiration`)
   - Invoke **Email Notification** sub-flow (template key: `ListingExpiringSoon`)
   - Optionally invoke **Teams Notification** sub-flow

3. **Get expired items** (where `EC365_ExpiresOn lt utcNow()`):
   - Update `EC365_Status` = `Expired`
   - Log to `EC365_ActivityLogs` (action: `ListingExpired`)

---

## 3. Renewal Flow

**Name:** `EC365 - Listing Renewal`

**Trigger:** When an item is modified — `EC365_Listings`  
**Condition:** `EC365_Status` changed to `Approved` AND previous status was `Expired`

### Steps

1. Calculate new expiry: `addDays(utcNow(), 90)` from `EC365_Settings.ListingExpiryDays`
2. Update listing: `EC365_ExpiresOn`, `EC365_PublishedOn` = `utcNow()`
3. Create seller notification (type: `System`, message: "Your listing has been renewed.")
4. Invoke **Email Notification** sub-flow (template key: `ListingRenewed`)
5. Log to `EC365_ActivityLogs` (action: `ListingRenewed`)

**Alternative trigger:** Power Apps / SPFx button calling a manual "Renew Listing" flow with `listingId` parameter.

---

## 4. Sold Notification Flow

**Name:** `EC365 - Sold Notification`

**Trigger:** When an item is modified — `EC365_Listings`  
**Condition:** `EC365_Status` equals `Sold`

### Steps

1. Set `EC365_SoldOn` = `utcNow()` if empty
2. **Get favorites** from `EC365_Favorites` where `EC365_ListingId` = listing Id AND `EC365_NotifyOnChange` = true
3. **Apply to each** favorite:
   - Create notification (type: `Sold`) for favoriting user
4. Notify seller (type: `Sold`)
5. Invoke **Email Notification** for seller (template key: `ListingSold`)
6. Invoke **Teams Notification** if `EC365_Settings.EnableTeamsNotifications` = true
7. Log to `EC365_ActivityLogs` (action: `ListingSold`)

---

## 5. Message Notification Flow

**Name:** `EC365 - Message Notification`

**Trigger:** When an item is created — `EC365_Messages`

### Steps

1. Increment `EC365_MessageCount` on related `EC365_Listings` item
2. Create `EC365_Notifications` for recipient:
   - Type: `Message`
   - Title: "New message about @{EC365_ListingTitle}"
   - Link to messages view in SPFx app
3. Invoke **Email Notification** sub-flow (template key: `NewMessage`) unless recipient is the sender
4. If `EC365_AttachmentUrl` is set, include in email body
5. Log to `EC365_ActivityLogs` (action: `MessageSent`)

---

## 6. Review Reminder Flow

**Name:** `EC365 - Review Reminder`

**Trigger:** Recurrence — weekly on Monday at 09:00

### Steps

1. **Get items** from `EC365_Listings`:
   - Filter: `EC365_Status eq 'Sold' and EC365_SoldOn ge '@{addDays(utcNow(), -14)}' and EC365_SoldOn le '@{addDays(utcNow(), -7)}'`

2. **Apply to each** sold listing:
   - Check `EC365_Reviews` for existing review by buyer (`EC365_ReservedBy` or message thread participant)
   - If no review exists:
     - Create notification for buyer (type: `Review`)
     - Invoke **Email Notification** sub-flow (template key: `ReviewReminder`)

3. Log summary to `EC365_ActivityLogs`

---

## 7. Teams Notification Flow

**Name:** `EC365 - Teams Notification` (Child flow)

**Input parameters:** `title`, `message`, `linkUrl`, `listingId` (optional)

### Steps

1. Read `EC365_Settings.EnableTeamsNotifications`; exit if false
2. Get template from `EC365_Templates` where `EC365_TemplateKey` = `TeamsAlert` and `EC365_IsActive` = true
3. Post message in a chat or channel (Microsoft Teams connector):
   - Use Adaptive Card with listing thumbnail, title, price, and action button linking to `linkUrl`
4. Log to `EC365_ActivityLogs` (action: `TeamsNotificationSent`)

**Invoked by:** Sold Notification, Expiration Reminder, Approval Flow (optional broadcast for featured listings)

---

## 8. Email Notification Flow

**Name:** `EC365 - Email Notification` (Child flow)

**Input parameters:** `templateKey`, `recipientEmail`, `replacements` (object)

### Steps

1. Read `EC365_Settings.EnableEmailNotifications`; exit if false
2. Get HTML template from `EC365_Templates`:
   - Filter: `EC365_TemplateKey` = `templateKey`, `EC365_TemplateType` = `Email`, `EC365_IsActive` = true
3. Replace tokens in subject and body: `{{ListingTitle}}`, `{{SellerName}}`, `{{Price}}`, `{{LinkUrl}}`, `{{ExpiryDate}}`
4. Send email (Office 365 Outlook — Send an email V2)
5. Log to `EC365_ActivityLogs` (action: `EmailSent`, details: templateKey + recipient)

### Standard template keys

| Template Key | Purpose |
|---|---|
| `ListingApproved` | Seller notified of approval |
| `ListingRejected` | Seller notified of rejection with notes |
| `ListingExpiringSoon` | Expiration warning (7 days) |
| `ListingRenewed` | Renewal confirmation |
| `ListingSold` | Sold confirmation to seller |
| `NewMessage` | New buyer/seller message |
| `ReviewReminder` | Post-sale review request |

---

## 9. Scheduled Cleanup Flow

**Name:** `EC365 - Scheduled Cleanup`

**Trigger:** Recurrence — weekly on Sunday at 02:00

### Steps

1. **Archive old drafts**
   - `EC365_Listings` where `EC365_Status` = `Draft` and `Modified lt addDays(utcNow(), -30)`
   - Set `EC365_Status` = `Archived`

2. **Delete stale notifications**
   - `EC365_Notifications` where `EC365_IsRead` = true and `Created lt addDays(utcNow(), -90)`
   - Delete items in batches of 100

3. **Purge old activity logs** (per retention setting)
   - Read `EC365_Settings` retention days (default 365)
   - Delete `EC365_ActivityLogs` older than retention period

4. **Clean orphaned favorites**
   - Favorites where listing no longer exists or status is `Archived`/`Rejected`

5. **Expire announcements**
   - `EC365_Announcements` where `EC365_EndDate lt utcNow()` → set `EC365_IsActive` = false

6. **Recalculate tag usage**
   - Update `EC365_Tags.EC365_UsageCount` from active listing tag references

7. Send summary email to `EC365_AdminEmail` with counts of archived, deleted, and updated items
8. Log cleanup summary to `EC365_ActivityLogs` (action: `ScheduledCleanup`)

---

## Deployment Checklist

- [ ] Import or recreate all nine flows in the target Power Platform environment
- [ ] Update SharePoint site URL connection references
- [ ] Upload email/Teams templates to `EC365_Templates`
- [ ] Add flow service account to `EC365_Owners` or grant list-level Edit permissions
- [ ] Test Approval flow with a sample Pending listing
- [ ] Verify recurrence flows are enabled and time zone is correct
- [ ] Confirm child flows (Email, Teams) are callable from parent flows

## Related Files

| File | Purpose |
|---|---|
| `provisioning/schemas/*.schema.json` | List and library definitions |
| `provisioning/security/groups.json` | Approver and moderator group names |
| `src/services/ProvisioningService.ts` | Programmatic list creation via PnPjs |
