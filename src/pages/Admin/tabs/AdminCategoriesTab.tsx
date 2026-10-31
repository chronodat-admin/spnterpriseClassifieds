import * as React from 'react';
import { CategoryTree, LoadingSkeleton } from '../../../controls';
import { CategoryEditDialog } from '../../../dialogs';
import { useCategories, useLocalization } from '../../../hooks';
import { ServiceContainer, SERVICE_KEYS } from '../../../services/ServiceContainer';
import { ICategory } from '../../../interfaces';

export const AdminCategoriesTab: React.FC = () => {
  const { categoryTree, refresh, isLoading } = useCategories(false);
  const { strings } = useLocalization();
  const s = strings as import('../../../localization/en-us').IAppStrings;
  const [editOpen, setEditOpen] = React.useState(false);
  const [editCategory, setEditCategory] = React.useState<Partial<ICategory> | undefined>();

  if (isLoading) return <LoadingSkeleton rows={4} />;

  return (
    <>
      <CategoryTree
        categories={categoryTree}
        editable
        onAdd={() => { setEditCategory({}); setEditOpen(true); }}
        onEdit={(cat) => { setEditCategory(cat); setEditOpen(true); }}
        onDelete={async (cat) => {
          await ServiceContainer.getInstance().resolve<{ delete(id: number): Promise<void> }>(SERVICE_KEYS.CategoryService).delete(cat.id);
          await refresh();
        }}
      />
      <CategoryEditDialog
        open={editOpen}
        category={editCategory}
        onClose={() => setEditOpen(false)}
        onSave={async (cat) => {
          const svc = ServiceContainer.getInstance().resolve<{ create(c: Partial<ICategory>): Promise<ICategory>; update(id: number, c: Partial<ICategory>): Promise<ICategory> }>(SERVICE_KEYS.CategoryService);
          if (cat.id) await svc.update(cat.id, cat); else await svc.create(cat);
          setEditOpen(false);
          await refresh();
        }}
        labels={{ title: s.categories.title, name: 'Name', description: 'Description', visible: 'Visible', save: s.common.save, cancel: s.common.cancel }}
      />
    </>
  );
};

export default AdminCategoriesTab;
