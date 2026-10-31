import * as React from 'react';
import {
  HomeRegular,
  HomeFilled,
  GridRegular,
  GridFilled,
  AddRegular,
  FolderRegular,
  FolderFilled,
  HeartRegular,
  HeartFilled,
  SearchRegular,
  SearchFilled,
  ChatRegular,
  ChatFilled,
  StarRegular,
  StarFilled,
  FlagRegular,
  FlagFilled,
  ShieldRegular,
  ShieldFilled,
  SettingsRegular,
  SettingsFilled,
  QuestionCircleRegular,
  QuestionCircleFilled,
  DocumentRegular,
  DocumentFilled,
  EyeRegular,
  ImageRegular,
  LinkRegular,
  AlertRegular,
  SparkleRegular,
  MailRegular,
  ShareRegular,
  DeleteRegular,
  EditRegular,
  DismissRegular,
  FilterRegular,
  ArrowSyncRegular
} from '@fluentui/react-icons';

export type AppIconName =
  | 'Home'
  | 'Grid'
  | 'Add'
  | 'Folder'
  | 'Heart'
  | 'Search'
  | 'Chat'
  | 'Star'
  | 'Flag'
  | 'Shield'
  | 'Settings'
  | 'Help'
  | 'Document'
  | 'Eye'
  | 'Image'
  | 'Link'
  | 'Alert'
  | 'Sparkle'
  | 'Mail'
  | 'Share'
  | 'Delete'
  | 'Edit'
  | 'Dismiss'
  | 'Filter'
  | 'Refresh';

type IconComponent = React.FC<{ className?: string }>;

interface IIconEntry {
  regular: IconComponent;
  filled?: IconComponent;
}

const ICON_MAP: Record<AppIconName, IIconEntry> = {
  Home: { regular: HomeRegular, filled: HomeFilled },
  Grid: { regular: GridRegular, filled: GridFilled },
  Add: { regular: AddRegular },
  Folder: { regular: FolderRegular, filled: FolderFilled },
  Heart: { regular: HeartRegular, filled: HeartFilled },
  Search: { regular: SearchRegular, filled: SearchFilled },
  Chat: { regular: ChatRegular, filled: ChatFilled },
  Star: { regular: StarRegular, filled: StarFilled },
  Flag: { regular: FlagRegular, filled: FlagFilled },
  Shield: { regular: ShieldRegular, filled: ShieldFilled },
  Settings: { regular: SettingsRegular, filled: SettingsFilled },
  Help: { regular: QuestionCircleRegular, filled: QuestionCircleFilled },
  Document: { regular: DocumentRegular, filled: DocumentFilled },
  Eye: { regular: EyeRegular },
  Image: { regular: ImageRegular },
  Link: { regular: LinkRegular },
  Alert: { regular: AlertRegular },
  Sparkle: { regular: SparkleRegular },
  Mail: { regular: MailRegular },
  Share: { regular: ShareRegular },
  Delete: { regular: DeleteRegular },
  Edit: { regular: EditRegular },
  Dismiss: { regular: DismissRegular },
  Filter: { regular: FilterRegular },
  Refresh: { regular: ArrowSyncRegular }
};

export interface IAppIconsProps {
  name: AppIconName;
  filled?: boolean;
  className?: string;
  'aria-hidden'?: boolean;
  'aria-label'?: string;
}

export const AppIcons: React.FC<IAppIconsProps> = ({
  name,
  filled = false,
  className,
  'aria-hidden': ariaHidden,
  'aria-label': ariaLabel
}) => {
  const entry = ICON_MAP[name];
  const Icon = filled && entry.filled ? entry.filled : entry.regular;
  return <Icon className={className} aria-hidden={ariaHidden} aria-label={ariaLabel} />;
};

export function getAppIcon(name: AppIconName, filled = false): React.ReactElement {
  return <AppIcons name={name} filled={filled} />;
}

export default AppIcons;
