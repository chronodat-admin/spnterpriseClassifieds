import * as React from 'react';
import { Card, Text, makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  root: { padding: tokens.spacingHorizontalL, minWidth: '140px' },
  value: { fontSize: '28px', fontWeight: tokens.fontWeightSemibold, lineHeight: 1.2 },
  label: { color: tokens.colorNeutralForeground3 }
});

export interface IStatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
}

export const StatsCard: React.FC<IStatsCardProps> = ({ label, value, icon, trend }) => {
  const classes = useStyles();
  return (
    <Card className={classes.root}>
      {icon}
      <Text className={classes.value}>{value}</Text>
      <Text className={classes.label} size={200}>{label}</Text>
      {trend && <Text size={100}>{trend}</Text>}
    </Card>
  );
};
