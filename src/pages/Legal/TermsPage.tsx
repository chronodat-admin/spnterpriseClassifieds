import * as React from 'react';
import { PageLayout } from '../../layouts';
import { useLocalization } from '../../hooks';
import styles from './Legal.module.scss';

export const TermsPage: React.FC = () => {
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;

  return (
    <PageLayout title={s.terms.title}>
      <div className={styles.legal}>
        <p className={styles.updated}>{s.terms.lastUpdated}: January 1, 2026</p>
        <section>
          <h2>Acceptance of Terms</h2>
          <p>By using Enterprise Classifieds 365, you agree to comply with your organization&apos;s acceptable use policies and these terms of service.</p>
        </section>
        <section>
          <h2>User Responsibilities</h2>
          <p>Users are responsible for the accuracy of their listings, respectful communication with other users, and compliance with applicable laws and organizational policies.</p>
        </section>
        <section>
          <h2>Prohibited Content</h2>
          <p>Listings must not contain illegal items, offensive content, spam, fraudulent offers, or content that violates intellectual property rights.</p>
        </section>
        <section>
          <h2>Moderation</h2>
          <p>Administrators and moderators may review, approve, reject, or remove listings that violate these terms or organizational policies.</p>
        </section>
        <section>
          <h2>Limitation of Liability</h2>
          <p>Enterprise Classifieds 365 is provided as-is. Your organization is responsible for transactions between users. The application facilitates connections but does not guarantee listing accuracy or transaction outcomes.</p>
        </section>
      </div>
    </PageLayout>
  );
};

export default TermsPage;
