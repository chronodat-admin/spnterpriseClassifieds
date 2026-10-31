import * as React from 'react';
import {
  ToggleButton,
  Tooltip
} from '@fluentui/react-components';
import {
  GridRegular,
  ListRegular,
  TextBulletListRegular,
  ImageRegular
} from '@fluentui/react-icons';
import { IViewMode } from '../../interfaces';
import { useStrings } from '../../hooks';

export interface IViewModeToggleProps {
  value: IViewMode['key'];
  onChange: (mode: IViewMode['key']) => void;
  disabled?: boolean;
  availableModes?: IViewMode['key'][];
  labels?: Partial<Record<IViewMode['key'], string>>;
}

const VIEW_MODES: IViewMode[] = [
  { key: 'grid', label: 'Grid', icon: 'Grid' },
  { key: 'list', label: 'List', icon: 'List' },
  { key: 'compact', label: 'Compact', icon: 'Compact' },
  { key: 'gallery', label: 'Gallery', icon: 'Gallery' }
];

const ICON_MAP: Record<string, React.ReactElement> = {
  Grid: <GridRegular />,
  List: <ListRegular />,
  Compact: <TextBulletListRegular />,
  Gallery: <ImageRegular />
};

export const ViewModeToggle: React.FC<IViewModeToggleProps> = ({
  value,
  onChange,
  disabled = false,
  availableModes = ['grid', 'list', 'compact', 'gallery'],
  labels
}) => {
  const strings = useStrings();

  const labelMap: Record<IViewMode['key'], string> = {
    grid: labels?.grid ?? strings.listings.viewModes.grid,
    list: labels?.list ?? strings.listings.viewModes.list,
    compact: labels?.compact ?? strings.listings.viewModes.compact,
    gallery: labels?.gallery ?? strings.listings.viewModes.gallery
  };

  const modes = VIEW_MODES.filter(m => availableModes.includes(m.key));

  return (
    <div role="group" aria-label="View mode">
      {modes.map(mode => (
        <Tooltip key={mode.key} content={labelMap[mode.key]} relationship="label">
          <ToggleButton
            appearance={value === mode.key ? 'primary' : 'subtle'}
            checked={value === mode.key}
            icon={ICON_MAP[mode.icon]}
            onClick={() => onChange(mode.key)}
            disabled={disabled}
            aria-label={labelMap[mode.key]}
            aria-pressed={value === mode.key}
          />
        </Tooltip>
      ))}
    </div>
  );
};
