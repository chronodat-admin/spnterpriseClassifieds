import * as React from 'react';
import {
  Card,
  CardHeader,
  CardPreview,
  Text,
  Badge,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import { FolderRegular } from '@fluentui/react-icons';
import { ICategory } from '../../interfaces';
import { useStrings } from '../../hooks';

const useStyles = makeStyles({
  card: {
    cursor: 'pointer',
    height: '100%',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover
    },
    ':focus-visible': {
      outline: `2px solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: '2px'
    }
  },
  preview: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '88px',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    borderTop: `4px solid ${tokens.colorBrandBackground}`
  },
  icon: {
    fontSize: '32px',
    color: tokens.colorBrandForeground1
  },
  image: {
    width: '100%',
    height: '80px',
    objectFit: 'cover',
    borderRadius: tokens.borderRadiusMedium
  },
  count: {
    color: tokens.colorNeutralForeground3
  }
});

export interface ICategoryCardProps {
  category: ICategory;
  onClick?: (category: ICategory) => void;
  listingCountLabel?: string;
}

export const CategoryCard: React.FC<ICategoryCardProps> = ({ category, onClick, listingCountLabel }) => {
  const strings = useStrings();
  const styles = useStyles();

  const handleClick = (): void => onClick?.(category);
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(category);
    }
  };

  const countText = listingCountLabel ?? strings.categories.listingCount.replace(
    '{count}',
    String(category.listingCount ?? 0)
  );

  return (
    <Card
      className={styles.card}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${category.title}, ${countText}`}
    >
      <CardPreview>
        {category.imageUrl ? (
          <img src={category.imageUrl} alt="" className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.preview} style={category.color ? { borderTopColor: category.color, backgroundColor: `${category.color}22` } : undefined} aria-hidden="true">
            <FolderRegular className={styles.icon} />
          </div>
        )}
      </CardPreview>
      <CardHeader
        header={<Text weight="semibold">{category.title}</Text>}
        description={
          <Text className={styles.count} size={200}>
            {countText}
          </Text>
        }
        action={
          category.approvalRequired ? (
            <Badge appearance="outline" color="warning" size="small">
              {strings.createWizard.categoryStep.approvalRequired}
            </Badge>
          ) : undefined
        }
      />
    </Card>
  );
};
