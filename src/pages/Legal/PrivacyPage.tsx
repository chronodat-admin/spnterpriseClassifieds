import * as React from 'react';
import { PageLayout } from '../../layouts';
import { useLocalization } from '../../hooks';
import styles from './Legal.module.scss';

export const PrivacyPage: React.FC = () => {
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;

  return (
    <PageLayout title={s.privacy.title}>
      <div className={styles.legal}>
        <p className={styles.updated}>{s.privacy.lastUpdated}: January 1, 2026</p>
        <section>
          <h2>Information We Collect</h2>
          <p>Enterprise Classifieds 365 collects listing data, messages, and usage telemetry to provide classifieds services within your Microsoft 365 tenant. All data remains within your organization&apos;s SharePoint environment.</p>
        </section>
        <section>
          <h2>How We Use Information</h2>
          <p>We use collected information to display listings, facilitate communication between users, provide search functionality, and improve the application experience.</p>
        </section>
        <section>
          <h2>Data Retention</h2>
          <p>Listing and message data is retained according to your organization&apos;s SharePoint retention policies. You may request deletion of your listings and personal data through your tenant administrator.</p>
        </section>
        <section>
          <h2>Contact</h2>
          <p>Listing, message, and file data stays in your organization&apos;s SharePoint tenant. Chronodat LLC receives only the tenant id, site URL, site title, user email, and optional license key needed to check the 14-day trial or yearly site subscription at subscription.chronodat.com. Privacy policy: https://www.chronodat.com/Privacy</p>
        </section>
      </div>
    </PageLayout>
  );
};

export default PrivacyPage;
