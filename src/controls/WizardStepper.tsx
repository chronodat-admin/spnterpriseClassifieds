import * as React from 'react';
import { Text, makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  root: { display: 'flex', gap: tokens.spacingHorizontalS, marginBottom: tokens.spacingVerticalL },
  step: {
    flex: 1,
    padding: tokens.spacingVerticalS,
    textAlign: 'center',
    borderBottom: `2px solid ${tokens.colorNeutralStroke2}`,
    color: tokens.colorNeutralForeground3
  },
  active: {
    borderBottomColor: tokens.colorBrandStroke1,
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold
  },
  completed: {
    borderBottomColor: tokens.colorNeutralStroke1,
    color: tokens.colorNeutralForeground1
  }
});

export interface IWizardStep {
  key: string;
  label: string;
}

export interface IWizardStepperProps {
  steps: IWizardStep[];
  currentStep: number;
}

export const WizardStepper: React.FC<IWizardStepperProps> = ({ steps, currentStep }) => {
  const classes = useStyles();
  return (
    <div className={classes.root} role="list" aria-label="Wizard steps">
      {steps.map((step, index) => (
        <div
          key={step.key}
          className={`${classes.step} ${index === currentStep ? classes.active : ''} ${index < currentStep ? classes.completed : ''}`}
          role="listitem"
          aria-current={index === currentStep ? 'step' : undefined}
        >
          <Text size={200}>{step.label}</Text>
        </div>
      ))}
    </div>
  );
};
