import * as React from 'react';
import { Tree, TreeItem, TreeItemLayout, Button, makeStyles, tokens } from '@fluentui/react-components';
import { Add24Regular, Edit24Regular, Delete24Regular } from '@fluentui/react-icons';
import { ICategory } from '../interfaces';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS },
  actions: { display: 'flex', gap: tokens.spacingHorizontalXS }
});

export interface ICategoryTreeProps {
  categories: ICategory[];
  selectedId?: number;
  onSelect?: (category: ICategory) => void;
  onAdd?: (parentId?: number) => void;
  onEdit?: (category: ICategory) => void;
  onDelete?: (category: ICategory) => void;
  editable?: boolean;
}

const renderTree = (
  items: ICategory[],
  selectedId: number | undefined,
  onSelect: ((c: ICategory) => void) | undefined,
  onEdit: ((c: ICategory) => void) | undefined,
  onDelete: ((c: ICategory) => void) | undefined,
  editable: boolean
): React.ReactNode =>
  items.map(cat => (
    <TreeItem
      key={cat.id}
      itemType={cat.children?.length ? 'branch' : 'leaf'}
      value={String(cat.id)}
    >
      <TreeItemLayout
        onClick={() => onSelect?.(cat)}
        aria-selected={selectedId === cat.id}
      >
        {cat.title}
        {cat.listingCount !== undefined && ` (${cat.listingCount})`}
        {editable && (
          <>
            <Button appearance="subtle" icon={<Edit24Regular />} size="small" onClick={(e) => { e.stopPropagation(); onEdit?.(cat); }} />
            <Button appearance="subtle" icon={<Delete24Regular />} size="small" onClick={(e) => { e.stopPropagation(); onDelete?.(cat); }} />
          </>
        )}
      </TreeItemLayout>
      {cat.children && cat.children.length > 0 && (
        <Tree>{renderTree(cat.children, selectedId, onSelect, onEdit, onDelete, editable)}</Tree>
      )}
    </TreeItem>
  ));

export const CategoryTree: React.FC<ICategoryTreeProps> = ({
  categories,
  selectedId,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  editable = false
}) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      {editable && onAdd && (
        <div className={classes.actions}>
          <Button appearance="primary" icon={<Add24Regular />} onClick={() => onAdd()}>Add category</Button>
        </div>
      )}
      <Tree aria-label="Categories">
        {renderTree(categories, selectedId, onSelect, onEdit, onDelete, editable)}
      </Tree>
    </div>
  );
};
