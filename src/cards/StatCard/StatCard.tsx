import * as React from 'react';
import {
  Card,
  Text,
  makeStyles,
  tokens
} from '@fluentui/react-components';

const useStyles = makeStyles({
  card: {
    padding: tokens.spacingHorizontalL,
    height: '100%'
  },
  value: {
    fontSize: tokens.fontSizeHero700,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorBrandForeground1,
    lineHeight: 1.2
  },
  label: {
    color: tokens.colorNeutralForeground2,
    marginTop: tokens.spacingVerticalXS
  },
  trend: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
    marginTop: tokens.spacingVerticalS,
    fontSize: tokens.fontSizeBase200
  },
  trendUp: {
    color: tokens.colorPaletteGreenForeground1
  },
  trendDown: {
    color: tokens.colorPaletteRedForeground1
  },
  icon: {
    fontSize: '24px',
    color: tokens.colorBrandForeground1,
    marginBottom: tokens.spacingVerticalS
  }
});

export interface IStatCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactElement;
  trend?: number;
  trendLabel?: string;
  ariaLabel?: string;
}

export const StatCard: React.FC<IStatCardProps> = ({
  label,
  value,
  icon,
  trend,
  trendLabel,
  ariaLabel
}) => {
  const styles = useStyles();

  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
  const trendDirection = trend !== undefined ? (trend >= 0 ? 'up' : 'down') : undefined;

  return (
    <Card
      className={styles.card}
      role="figure"
      aria-label={ariaLabel ?? `${label}: ${formattedValue}`}
    >
      {icon && <div className={styles.icon} aria-hidden="true">{icon}</div>}
      <Text className={styles.value} block aria-hidden="true">{formattedValue}</Text>
      <Text className={styles.label} size={300} block>{label}</Text>
      {trend !== undefined && (
        <div
          className={`${styles.trend} ${trendDirection === 'up' ? styles.trendUp : styles.trendDown}`}
          aria-label={trendLabel ?? `${trend >= 0 ? 'Up' : 'Down'} ${Math.abs(trend)}%`}
        >
          <span aria-hidden="true">{trend >= 0 ? '↑' : '↓'}</span>
          <span aria-hidden="true">{Math.abs(trend)}%</span>
          {trendLabel && <span>{trendLabel}</span>}
        </div>
      )}
    </Card>
  );
};
