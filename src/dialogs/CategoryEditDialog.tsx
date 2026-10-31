import * as React from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Field,
  Input,
  Textarea,
  Switch
} from '@fluentui/react-components';
import { ICategory } from '../interfaces';

export interface ICategoryEditDialogProps {
  open: boolean;
  category?: Partial<ICategory>;
  onClose: () => void;
  onSave: (category: Partial<ICategory>) => void;
  parentCategories?: ICategory[];
  labels?: { title: string; name: string; description: string; visible: string; save: string; cancel: string };
  saving?: boolean;
}

export const CategoryEditDialog: React.FC<ICategoryEditDialogProps> = ({
  open,
  category,
  onClose,
  onSave,
  labels = { title: 'Category', name: 'Name', description: 'Description', visible: 'Visible', save: 'Save', cancel: 'Cancel' },
  saving
}) => {
  const [title, setTitle] = React.useState(category?.title ?? '');
  const [description, setDescription] = React.useState(category?.description ?? '');
  const [isVisible, setIsVisible] = React.useState(category?.isVisible ?? true);

  React.useEffect(() => {
    setTitle(category?.title ?? '');
    setDescription(category?.description ?? '');
    setIsVisible(category?.isVisible ?? true);
  }, [category]);

  return (
    <Dialog open={open} onOpenChange={(_, d) => !d.open && onClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{category?.id ? `Edit ${labels.title}` : `New ${labels.title}`}</DialogTitle>
          <DialogContent>
            <Field label={labels.name} required>
              <Input value={title} onChange={(_, d) => setTitle(d.value)} />
            </Field>
            <Field label={labels.description}>
              <Textarea value={description} onChange={(_, d) => setDescription(d.value)} />
            </Field>
            <Switch label={labels.visible} checked={isVisible} onChange={(_, d) => setIsVisible(d.checked)} />
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose}>{labels.cancel}</Button>
            <Button appearance="primary" disabled={!title.trim() || saving} onClick={() => onSave({ ...category, title, description, isVisible })}>
              {labels.save}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
