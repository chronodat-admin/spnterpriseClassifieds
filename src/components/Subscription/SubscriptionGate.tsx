import * as React from 'react';
import { Button, Field, Input, MessageBar, MessageBarBody, Spinner, Text } from '@fluentui/react-components';
import { PRODUCT_NAME, PUBLISHER_NAME, SUPPORT_URL, TRIAL_DAYS } from '../../constants/store';
import { ISubscriptionAccess } from '../../hooks/useSubscriptionAccess';
import { hostedSubscribeUrl } from '../../services/subscriptionClient';
import { ISubscriptionHost } from '../../services/subscriptionClient';

export interface ISubscriptionGateProps {
  access: ISubscriptionAccess;
  host: ISubscriptionHost;
  children: React.ReactNode;
}

export const SubscriptionGate: React.FC<ISubscriptionGateProps> = ({ access, host, children }) => {
  const [licenseDraft, setLicenseDraft] = React.useState(access.licenseKey);
  const [busy, setBusy] = React.useState(false);
  const [actionError, setActionError] = React.useState('');

  if (!access.checking && access.connectivityError && !access.status) {
    return (
      <div style={{ padding: 24, maxWidth: 640 }}>
        <h1>{PRODUCT_NAME}</h1>
        <MessageBar intent="warning">
          <MessageBarBody>
            The subscription service could not be reached. This is a connection problem, not the end of the trial.
            {access.error ? ` ${access.error}` : ''}
          </MessageBarBody>
        </MessageBar>
        <Button appearance="primary" onClick={() => access.refresh().catch(() => undefined)} style={{ marginTop: 16 }}>
          Retry
        </Button>
      </div>
    );
  }

  if (access.checking && !access.status) {
    return <Spinner label="Checking subscription" style={{ margin: 48 }} />;
  }

  if (access.status && !access.hasAccess) {
    const subscribe = async (): Promise<void> => {
      setBusy(true);
      setActionError('');
      try {
        await access.checkout();
      } catch (err) {
        const fallback = hostedSubscribeUrl(host, window.location.href);
        if (fallback) {
          window.location.assign(fallback);
          return;
        }
        setActionError(err instanceof Error ? err.message : 'Checkout failed');
        setBusy(false);
      }
    };

    return (
      <div style={{ padding: 24, maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h1>Subscribe to {PRODUCT_NAME}</h1>
        <Text>
          The {TRIAL_DAYS}-day trial for this SharePoint site has ended. One yearly subscription covers everyone on this site.
          Published by {PUBLISHER_NAME}.
        </Text>
        {actionError && (
          <MessageBar intent="error"><MessageBarBody>{actionError}</MessageBarBody></MessageBar>
        )}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button appearance="primary" disabled={busy} onClick={() => subscribe().catch(() => undefined)}>Subscribe</Button>
          <Button appearance="secondary" onClick={() => access.refresh().catch(() => undefined)}>Refresh</Button>
          <Button appearance="subtle" onClick={() => window.open(SUPPORT_URL, '_blank', 'noopener,noreferrer')}>Support</Button>
        </div>
        <Field label="License key">
          <Input value={licenseDraft} onChange={(_, data) => setLicenseDraft(data.value)} />
        </Field>
        <Button
          appearance="secondary"
          onClick={() => {
            access.saveLicenseKey(licenseDraft);
            access.refresh().catch(() => undefined);
          }}
        >
          Activate license key
        </Button>
      </div>
    );
  }

  const trialing = access.status?.status === 'trialing';
  return (
    <>
      {trialing && (
        <MessageBar intent="info" style={{ margin: '8px 16px 0' }}>
          <MessageBarBody>
            Trial: {access.status?.trialDaysRemaining ?? TRIAL_DAYS} day(s) left for this SharePoint site.
            <Button appearance="transparent" onClick={() => access.checkout().catch(() => undefined)}>Subscribe</Button>
          </MessageBarBody>
        </MessageBar>
      )}
      {children}
    </>
  );
};
