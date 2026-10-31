import * as React from 'react';
import {
  Combobox,
  Option,
  Avatar,
  Text,
  Spinner,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import { ServiceContainer, SERVICE_KEYS } from '../../services';
import { IUserProfile } from '../../interfaces';
import { SEARCH_DEBOUNCE_MS } from '../../constants';
import { useAppContext, useDebounce, useStrings } from '../../hooks';
import { getInitials } from '../../utilities';

const useStyles = makeStyles({
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS
  },
  optionText: {
    display: 'flex',
    flexDirection: 'column'
  }
});

interface IGraphService {
  searchUsers(query: string, limit?: number): Promise<IUserProfile[]>;
}

export interface IPeoplePickerProps {
  selectedUsers: IUserProfile[];
  onSelectionChange: (users: IUserProfile[]) => void;
  multiSelect?: boolean;
  maxSelections?: number;
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

export const PeoplePicker: React.FC<IPeoplePickerProps> = ({
  selectedUsers,
  onSelectionChange,
  multiSelect = false,
  maxSelections = 10,
  placeholder,
  disabled = false,
  ariaLabel
}) => {
  const strings = useStrings();
  const styles = useStyles();
  const { serviceContainerReady } = useAppContext();

  const [query, setQuery] = React.useState('');
  const [options, setOptions] = React.useState<IUserProfile[]>([]);
  const [loading, setLoading] = React.useState(false);
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);

  const getService = React.useCallback((): IGraphService | undefined => {
    if (!serviceContainerReady) return undefined;
    try {
      return ServiceContainer.getInstance().resolve<IGraphService>(SERVICE_KEYS.GraphService);
    } catch {
      return undefined;
    }
  }, [serviceContainerReady]);

  React.useEffect(() => {
    const service = getService();
    if (!service || debouncedQuery.length < 2) {
      setOptions([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    service.searchUsers(debouncedQuery, 10)
      .then(users => {
        if (!cancelled) setOptions(users);
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [debouncedQuery, getService]);

  const handleSelect = (_: unknown, data: { optionValue?: string; selectedOptions: string[] }): void => {
    const selectedId = data.optionValue;
    if (!selectedId) return;

    const user = options.find(u => u.id === selectedId);
    if (!user) return;

    if (multiSelect) {
      const exists = selectedUsers.some(u => u.id === user.id);
      if (exists) {
        onSelectionChange(selectedUsers.filter(u => u.id !== user.id));
      } else if (selectedUsers.length < maxSelections) {
        onSelectionChange([...selectedUsers, user]);
      }
    } else {
      onSelectionChange([user]);
    }
    setQuery('');
  };

  const selectedIds = selectedUsers.map(u => u.id);

  return (
    <Combobox
      multiselect={multiSelect}
      selectedOptions={selectedIds}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onOptionSelect={handleSelect}
      placeholder={placeholder ?? strings.common.search}
      disabled={disabled}
      aria-label={ariaLabel ?? 'Search for people'}
      freeform
    >
      {loading && (
        <Option text="" value="__loading__" disabled>
          <Spinner size="tiny" label={strings.common.loading} />
        </Option>
      )}
      {options.map(user => (
        <Option key={user.id} value={user.id} text={user.displayName}>
          <div className={styles.option}>
            <Avatar
              name={user.displayName}
              initials={getInitials(user.displayName)}
              size={24}
              aria-hidden="true"
            />
            <div className={styles.optionText}>
              <Text size={200} weight="semibold">{user.displayName}</Text>
              <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                {user.email}
              </Text>
            </div>
          </div>
        </Option>
      ))}
    </Combobox>
  );
};
