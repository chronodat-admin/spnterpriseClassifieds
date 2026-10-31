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
  Textarea
} from '@fluentui/react-components';
import { IFavoriteCollection } from '../interfaces';

export interface ICollectionDialogProps {
  open: boolean;
  collection?: Partial<IFavoriteCollection>;
  onClose: () => void;
  onSave: (collection: Partial<IFavoriteCollection>) => void;
  labels?: { title: string; name: string; description: string; save: string; cancel: string };
  saving?: boolean;
}

export const CollectionDialog: React.FC<ICollectionDialogProps> = ({
  open,
  collection,
  onClose,
  onSave,
  labels = { title: 'Collection', name: 'Name', description: 'Description', save: 'Save', cancel: 'Cancel' },
  saving
}) => {
  const [title, setTitle] = React.useState(collection?.title ?? '');
  const [description, setDescription] = React.useState(collection?.description ?? '');

  React.useEffect(() => {
    setTitle(collection?.title ?? '');
    setDescription(collection?.description ?? '');
  }, [collection]);

  return (
    <Dialog open={open} onOpenChange={(_, d) => !d.open && onClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{collection?.id ? `Edit ${labels.title}` : `Create ${labels.title}`}</DialogTitle>
          <DialogContent>
            <Field label={labels.name} required>
              <Input value={title} onChange={(_, d) => setTitle(d.value)} />
            </Field>
            <Field label={labels.description}>
              <Textarea value={description} onChange={(_, d) => setDescription(d.value)} />
            </Field>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose}>{labels.cancel}</Button>
            <Button appearance="primary" disabled={!title.trim() || saving} onClick={() => onSave({ ...collection, title, description })}>
              {labels.save}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
