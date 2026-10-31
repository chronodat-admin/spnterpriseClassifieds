import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { makeStyles, tokens } from '@fluentui/react-components';
import { PageLayout, TwoColumnLayout } from '../../layouts';
import { CategoryTree, LoadingSkeleton, ErrorState } from '../../controls';
import { CategoryCard } from '../../cards';
import { CategoryEditDialog, ConfirmDialog } from '../../dialogs';
import { useCategories, useLocalization, usePermissions } from '../../hooks';
import { ServiceContainer, SERVICE_KEYS } from '../../services/ServiceContainer';
import { ROUTES } from '../../constants';
import { ICategory } from '../../interfaces';

const useStyles = makeStyles({
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: tokens.spacingHorizontalM }
});

interface ICategoryService {
  create(category: Partial<ICategory>): Promise<ICategory>;
  update(id: number, category: Partial<ICategory>): Promise<ICategory>;
  delete(id: number): Promise<void>;
}

export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const classes = useStyles();
  const { categoryTree, categories, isLoading, error, refresh } = useCategories(false);
  const { strings } = useLocalization();
  const s = strings as import('../../localization/en-us').IAppStrings;
  const { canAdmin } = usePermissions();
  const [selected, setSelected] = React.useState<ICategory | undefined>();
  const [editOpen, setEditOpen] = React.useState(false);
  const [editCategory, setEditCategory] = React.useState<Partial<ICategory> | undefined>();
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<ICategory | undefined>();

  const handleSave = async (category: Partial<ICategory>): Promise<void> => {
    const service = ServiceContainer.getInstance().resolve<ICategoryService>(SERVICE_KEYS.CategoryService);
    if (category.id) {
      await service.update(category.id, category);
    } else {
      await service.create(category);
    }
    setEditOpen(false);
    await refresh();
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    const service = ServiceContainer.getInstance().resolve<ICategoryService>(SERVICE_KEYS.CategoryService);
    await service.delete(deleteTarget.id);
    setDeleteOpen(false);
    setDeleteTarget(undefined);
    await refresh();
  };

  if (isLoading) return <LoadingSkeleton rows={6} />;
  if (error) return <ErrorState message={error.message} onRetry={refresh} retryLabel={s.app.retry} />;

  const displayCategories = selected?.children?.length
    ? selected.children
    : selected
      ? [selected]
      : categoryTree;

  return (
    <PageLayout title={s.categories.title} subtitle={s.categories.browseByCategory}>
      <TwoColumnLayout
        sidebar={
          <CategoryTree
            categories={categoryTree}
            selectedId={selected?.id}
            onSelect={setSelected}
            editable={canAdmin}
            onAdd={() => { setEditCategory({}); setEditOpen(true); }}
            onEdit={(cat) => { setEditCategory(cat); setEditOpen(true); }}
            onDelete={(cat) => { setDeleteTarget(cat); setDeleteOpen(true); }}
          />
        }
      >
        <div className={classes.cards}>
          {displayCategories.map(cat => (
            <CategoryCard
              key={cat.id}
              category={cat}
              listingCountLabel={s.categories.listingCount}
              onClick={() => navigate(`${ROUTES.Listings}?category=${cat.id}`)}
            />
          ))}
        </div>
      </TwoColumnLayout>

      <CategoryEditDialog
        open={editOpen}
        category={editCategory}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        parentCategories={categories}
        labels={{ title: s.categories.title, name: 'Name', description: s.categories.subcategories, visible: 'Visible', save: s.common.save, cancel: s.common.cancel }}
      />
      <ConfirmDialog
        open={deleteOpen}
        title={s.common.delete}
        message={`Delete category "${deleteTarget?.title}"?`}
        confirmLabel={s.common.delete}
        cancelLabel={s.common.cancel}
        intent="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </PageLayout>
  );
};

export default CategoriesPage;
