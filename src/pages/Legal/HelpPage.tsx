import * as React from 'react';
import { Link, makeStyles, tokens } from '@fluentui/react-components';
import { PageLayout } from '../../layouts';
import { useLocalization } from '../../hooks';
import { ROUTES } from '../../constants';
import { KNOWLEDGE_BASE_URL, PRODUCT_PAGE_URL, SUPPORT_URL } from '../../constants/store';
import styles from './Legal.module.scss';

const useStyles = makeStyles({
  faq: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalL }
});

export const HelpPage: React.FC = () => {
  const classes = useStyles();
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;

  const faqs = [
    { q: 'How do I create a listing?', a: 'Click Create Listing from the dashboard or navigation menu. Follow the 6-step wizard to add category, details, images, pricing, location, and publish.' },
    { q: 'How do I contact a seller?', a: 'Open a listing detail page and click Contact Seller. Messages appear in your Messages inbox.' },
    { q: 'How do saved searches work?', a: 'Run a search on the Search page and click Save Search. Enable notifications to receive alerts when new matching listings are posted.' },
    { q: 'Who approves listings?', a: 'Categories marked as requiring approval are reviewed by moderators in the Admin Center approval queue before going live.' }
  ];

  return (
    <PageLayout title={s.help.title}>
      <div className={styles.legal}>
        <section>
          <h2>{s.help.gettingStarted}</h2>
          <p>Browse listings from the dashboard, search by keyword or category, and create your own listings using the wizard. Save favorites and set up saved searches to stay informed.</p>
        </section>

        <section className={classes.faq}>
          <h2>{s.help.faq}</h2>
          {faqs.map((item, i) => (
            <div key={i}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </section>

        <section>
          <h2>{s.help.documentation}</h2>
          <p>
            <Link href={PRODUCT_PAGE_URL} target="_blank" rel="noopener noreferrer">Product page</Link>
            {' · '}
            <Link href={KNOWLEDGE_BASE_URL} target="_blank" rel="noopener noreferrer">Knowledge base</Link>
            {' · '}
            <Link href={SUPPORT_URL} target="_blank" rel="noopener noreferrer">{s.help.contactSupport}</Link>
            {' · '}
            <Link href={ROUTES.Privacy}>{s.navigation.privacy}</Link>
            {' · '}
            <Link href={ROUTES.Terms}>{s.navigation.terms}</Link>
          </p>
        </section>

        <section>
          <h2>{s.help.contactSupport}</h2>
          <p>Contact your SharePoint administrator for tenant setup. For the product, use the Chronodat support page.</p>
        </section>
      </div>
    </PageLayout>
  );
};

export default HelpPage;
