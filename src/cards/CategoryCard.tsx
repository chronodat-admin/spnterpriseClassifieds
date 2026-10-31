import * as React from 'react';
import { Card, Text, makeStyles, tokens } from '@fluentui/react-components';
import { ICategory } from '../interfaces';

const useStyles = makeStyles({
  root: { padding: tokens.spacingHorizontalL, cursor: 'pointer', height: '100%' },
  icon: { fontSize: '32px', marginBottom: tokens.spacingVerticalS }
});

export interface ICategoryCardProps {
  category: ICategory;
  onClick?: () => void;
  listingCountLabel?: string;
}

export const CategoryCard: React.FC<ICategoryCardProps> = ({ category, onClick, listingCountLabel = 'listings' }) => {
  const classes = useStyles();
  return (
    <Card
      className={classes.root}
      onClick={onClick}
      style={category.color ? { borderTop: `4px solid ${category.color}` } : undefined}
    >
      {category.iconName && <span className={classes.icon}>{category.iconName}</span>}
      <Text weight="semibold">{category.title}</Text>
      {category.description && <Text size={200}>{category.description}</Text>}
      {category.listingCount !== undefined && (
        <Text size={200}>{category.listingCount} {listingCountLabel}</Text>
      )}
    </Card>
  );
};
