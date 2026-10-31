import * as React from 'react';
import { Text, makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS },
  bars: { display: 'flex', alignItems: 'flex-end', gap: tokens.spacingHorizontalXS, height: '120px' },
  bar: {
    flex: 1,
    backgroundColor: tokens.colorBrandBackground,
    borderRadius: tokens.borderRadiusSmall,
    minWidth: '8px',
    transition: 'height 0.2s'
  },
  label: { textAlign: 'center', fontSize: '10px', color: tokens.colorNeutralForeground3 }
});

export interface IStatChartProps {
  title?: string;
  data: Array<{ label: string; value: number }>;
}

export const StatChart: React.FC<IStatChartProps> = ({ title, data }) => {
  const classes = useStyles();
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div className={classes.root}>
      {title && <Text weight="semibold">{title}</Text>}
      <div className={classes.bars}>
        {data.map((item, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              className={classes.bar}
              style={{ height: `${(item.value / max) * 100}%` }}
              title={`${item.label}: ${item.value}`}
            />
            <span className={classes.label}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
