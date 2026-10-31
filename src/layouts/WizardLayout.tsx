import * as React from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import styles from './WizardLayout.module.scss';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXL }
});

export interface IWizardLayoutProps {
  stepper: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const WizardLayout: React.FC<IWizardLayoutProps> = ({ stepper, children, footer }) => {
  const classes = useStyles();
  return (
    <div className={`${styles.wizardLayout} ${classes.root}`}>
      <div className={styles.stepper}>{stepper}</div>
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
};
