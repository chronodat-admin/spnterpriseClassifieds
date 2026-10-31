import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  Button,
  Text
} from '@fluentui/react-components';
import { PersonRegular, SettingsRegular, SignOutRegular, QuestionCircleRegular } from '@fluentui/react-icons';
import { ROUTES } from '../constants';
import { useAppContext, useStrings } from '../hooks';
import { getInitials } from '../utilities';

export interface IProfileMenuProps {
  photoUrl?: string;
}

export const ProfileMenu: React.FC<IProfileMenuProps> = ({ photoUrl }) => {
  const strings = useStrings();
  const navigate = useNavigate();
  const { userDisplayName, userEmail } = useAppContext();

  const initials = getInitials(userDisplayName || 'User');

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Button
          appearance="subtle"
          aria-label={`Profile menu for ${userDisplayName}`}
          icon={
            <Avatar
              name={userDisplayName}
              image={photoUrl ? { src: photoUrl } : undefined}
              initials={initials}
              size={28}
              aria-hidden="true"
            />
          }
        />
      </MenuTrigger>
      <MenuPopover>
        <div style={{ padding: '12px 16px', maxWidth: 280 }}>
          <Text weight="semibold" block>{userDisplayName}</Text>
          <Text size={200} style={{ color: 'var(--colorNeutralForeground3)' }} block>{userEmail}</Text>
        </div>
        <MenuDivider />
        <MenuList>
          <MenuItem
            icon={<PersonRegular />}
            onClick={() => navigate(ROUTES.MyListings)}
          >
            {strings.navigation.myListings}
          </MenuItem>
          <MenuItem
            icon={<SettingsRegular />}
            onClick={() => navigate(ROUTES.Settings)}
          >
            {strings.navigation.settings}
          </MenuItem>
          <MenuItem
            icon={<QuestionCircleRegular />}
            onClick={() => navigate(ROUTES.Help)}
          >
            {strings.navigation.help}
          </MenuItem>
          <MenuDivider />
          <MenuItem
            icon={<SignOutRegular />}
            disabled
            aria-label="Sign out is managed by SharePoint"
          >
            Sign out
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};
