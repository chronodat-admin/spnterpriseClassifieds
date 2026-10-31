import * as React from 'react';
import { Spinner, Text } from '@fluentui/react-components';
import { AppBrandIcon } from '../Layout/AppBrandIcon';
import styles from './AppLoader.module.scss';

export interface IAppLoaderProps {
  label: string;
  detail?: string;
  variant?: 'page' | 'inline';
}

export const AppLoader: React.FC<IAppLoaderProps> = ({ label, detail, variant = 'page' }) => (
  <div
    className={variant === 'inline' ? styles.inline : styles.page}
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <AppBrandIcon variant="tile" />
    <Spinner size="large" label={label} />
    {detail ? <Text className={styles.detail}>{detail}</Text> : null}
  </div>
);

export default AppLoader;
