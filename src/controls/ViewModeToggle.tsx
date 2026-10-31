import * as React from 'react';
import {
  ToggleButton,
  Tooltip,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import {
  Grid24Regular,
  List24Regular,
  TextBulletListLtr24Regular,
  ImageMultiple24Regular
} from '@fluentui/react-icons';
import { IViewMode } from '../interfaces';

const useStyles = makeStyles({
  root: { display: 'flex', gap: tokens.spacingHorizontalXS }
});

const DEFAULT_MODES: IViewMode[] = [
  { key: 'grid', label: 'Grid', icon: 'Grid' },
  { key: 'list', label: 'List', icon: 'List' },
  { key: 'compact', label: 'Compact', icon: 'Compact' },
  { key: 'gallery', label: 'Gallery', icon: 'Gallery' }
];

const iconMap: Record<string, React.ReactElement> = {
  Grid: <Grid24Regular />,
  List: <List24Regular />,
  Compact: <TextBulletListLtr24Regular />,
  Gallery: <ImageMultiple24Regular />
};

export interface IViewModeToggleProps {
  value: IViewMode['key'];
  onChange: (mode: IViewMode['key']) => void;
  modes?: IViewMode[];
  labels?: Record<IViewMode['key'], string>;
}

export const ViewModeToggle: React.FC<IViewModeToggleProps> = ({
  value,
  onChange,
  modes = DEFAULT_MODES,
  labels
}) => {
  const classes = useStyles();
  return (
    <div className={classes.root} role="group" aria-label="View mode">
      {modes.map(mode => (
        <Tooltip key={mode.key} content={labels?.[mode.key] ?? mode.label} relationship="label">
          <ToggleButton
            checked={value === mode.key}
            icon={iconMap[mode.icon] ?? iconMap.Grid}
            onClick={() => onChange(mode.key)}
            aria-label={labels?.[mode.key] ?? mode.label}
          />
        </Tooltip>
      ))}
    </div>
  );
};
