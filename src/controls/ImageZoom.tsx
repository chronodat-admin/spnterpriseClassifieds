import * as React from 'react';
import { Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, Image, Button } from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';

export interface IImageZoomProps {
  src: string;
  alt?: string;
  open: boolean;
  onClose: () => void;
}

export const ImageZoom: React.FC<IImageZoomProps> = ({ src, alt = 'Zoomed image', open, onClose }) => (
  <Dialog open={open} onOpenChange={(_, d) => !d.open && onClose()}>
    <DialogSurface style={{ maxWidth: '90vw', maxHeight: '90vh' }}>
      <DialogBody>
        <DialogTitle action={<Button appearance="subtle" icon={<Dismiss24Regular />} onClick={onClose} />}>
          {alt}
        </DialogTitle>
        <DialogContent>
          <Image src={src} alt={alt} fit="contain" style={{ maxHeight: '75vh', width: '100%' }} />
        </DialogContent>
      </DialogBody>
    </DialogSurface>
  </Dialog>
);
