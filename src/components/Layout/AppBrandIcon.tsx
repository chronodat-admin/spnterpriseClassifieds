import * as React from 'react';
import { makeStyles, mergeClasses } from '@fluentui/react-components';
import {
  ENTERPRISE_CLASSIFIEDS_BRAND_ICON_URL,
  ENTERPRISE_CLASSIFIEDS_NAV_ICON_URL
} from '../../constants/brandAssets';
import { APP_NAME } from '../../constants';

const useStyles = makeStyles({
  root: {
    display: 'block',
    flexShrink: 0,
    objectFit: 'contain',
    backgroundColor: 'transparent'
  },
  nav: {
    width: '28px',
    height: '28px'
  },
  inline: {
    width: '24px',
    height: '24px'
  },
  title: {
    width: '28px',
    height: '28px'
  },
  tile: {
    width: '96px',
    height: '96px'
  }
});

export type AppBrandIconVariant = 'nav' | 'inline' | 'title' | 'tile';

export interface IAppBrandIconProps {
  variant?: AppBrandIconVariant;
  className?: string;
  decorative?: boolean;
}

export const AppBrandIcon: React.FC<IAppBrandIconProps> = ({
  variant = 'nav',
  className,
  decorative = true
}) => {
  const styles = useStyles();
  const src = variant === 'tile'
    ? ENTERPRISE_CLASSIFIEDS_BRAND_ICON_URL
    : (ENTERPRISE_CLASSIFIEDS_NAV_ICON_URL || ENTERPRISE_CLASSIFIEDS_BRAND_ICON_URL);

  if (!src) {
    return null;
  }

  return (
    <img
      src={src}
      alt={decorative ? '' : APP_NAME}
      className={mergeClasses(styles.root, styles[variant], className)}
      aria-hidden={decorative || undefined}
      draggable={false}
    />
  );
};

export default AppBrandIcon;
