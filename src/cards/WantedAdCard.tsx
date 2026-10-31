import * as React from 'react';
import { Card, Text, Badge, makeStyles, tokens } from '@fluentui/react-components';
import { IWantedAd } from '../interfaces';
import { formatCurrency, formatRelativeDate } from '../utilities';

const useStyles = makeStyles({
  root: {
    padding: tokens.spacingHorizontalL,
    borderRadius: '16px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    boxShadow: tokens.shadow2
  },
  meta: { display: 'flex', gap: tokens.spacingHorizontalM, marginTop: tokens.spacingVerticalS, alignItems: 'center' }
});

export interface IWantedAdCardProps {
  wantedAd: IWantedAd;
  onClick?: () => void;
  matchCountLabel?: string;
}

export const WantedAdCard: React.FC<IWantedAdCardProps> = ({
  wantedAd,
  onClick,
  matchCountLabel = 'matches'
}) => {
  const classes = useStyles();
  return (
    <Card className={classes.root} onClick={onClick}>
      <Text weight="semibold">{wantedAd.title}</Text>
      <Text size={200} truncate>{wantedAd.description}</Text>
      <div className={classes.meta}>
        {wantedAd.maxPrice !== undefined && (
          <Text>Max {formatCurrency(wantedAd.maxPrice, wantedAd.currency ?? 'USD')}</Text>
        )}
        <Badge appearance={wantedAd.isActive ? 'filled' : 'outline'} color={wantedAd.isActive ? 'success' : 'informative'}>
          {wantedAd.isActive ? 'Active' : 'Inactive'}
        </Badge>
        {wantedAd.matchCount !== undefined && (
          <Text size={200}>{wantedAd.matchCount} {matchCountLabel}</Text>
        )}
        <Text size={100}>{formatRelativeDate(wantedAd.created)}</Text>
      </div>
    </Card>
  );
};
