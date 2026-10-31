import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Input,
  Popover,
  PopoverTrigger,
  PopoverSurface,
  List,
  ListItem,
  Text,
  Spinner,
  Button,
  Divider
} from '@fluentui/react-components';
import { SearchRegular, HistoryRegular, TagRegular, GridRegular, SparkleRegular } from '@fluentui/react-icons';
import { ROUTES } from '../constants';
import { ISearchSuggestion } from '../interfaces';
import { useSearch, useStrings } from '../hooks';

export interface IGlobalSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

function SuggestionIcon({ type }: { type: ISearchSuggestion['type'] }): React.ReactElement {
  switch (type) {
    case 'history': return <HistoryRegular />;
    case 'category': return <GridRegular />;
    case 'tag': return <TagRegular />;
    case 'ai': return <SparkleRegular />;
    default: return <SearchRegular />;
  }
}

let globalSearchIdCounter = 0;

function useStableId(prefix: string): string {
  const idRef = React.useRef<string>();
  if (!idRef.current) {
    globalSearchIdCounter += 1;
    idRef.current = `${prefix}-${globalSearchIdCounter}`;
  }
  return idRef.current;
}

export const GlobalSearch: React.FC<IGlobalSearchProps> = ({ onSearch, placeholder }) => {
  const strings = useStrings();
  const navigate = useNavigate();
  const {
    query,
    setQuery,
    suggestions,
    history,
    isSearching,
    clearHistory,
    selectSuggestion
  } = useSearch();

  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listId = useStableId('global-search-list');

  const displaySuggestions = query.length > 0 ? suggestions : history.map(h => ({
    text: h,
    type: 'history' as const
  }));

  const handleSubmit = (searchQuery: string): void => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    onSearch?.(trimmed);
    navigate(`${ROUTES.Search}?q=${encodeURIComponent(trimmed)}`);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleSelect = (suggestion: ISearchSuggestion): void => {
    selectSuggestion(suggestion);
    handleSubmit(suggestion.text);
  };

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit(query);
    } else if (event.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <Popover
      open={open && (displaySuggestions.length > 0 || isSearching)}
      onOpenChange={(_, data) => setOpen(data.open)}
      positioning="below-start"
      trapFocus
    >
      <PopoverTrigger disableButtonEnhancement>
        <Input
          ref={inputRef}
          value={query}
          onChange={(_, data) => {
            setQuery(data.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          contentBefore={<SearchRegular aria-hidden="true" />}
          contentAfter={isSearching ? <Spinner size="tiny" aria-label={strings.common.loading} /> : undefined}
          placeholder={placeholder ?? strings.search.placeholder}
          aria-label={strings.search.placeholder}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          role="combobox"
          style={{ width: '100%', maxWidth: 480 }}
        />
      </PopoverTrigger>
      <PopoverSurface aria-label={strings.search.suggestions}>
        <List id={listId} role="listbox" aria-label={strings.search.suggestions}>
          {displaySuggestions.length === 0 && !isSearching && (
            <ListItem aria-disabled="true">
              <Text size={200}>{strings.search.noSuggestions}</Text>
            </ListItem>
          )}
          {displaySuggestions.map((suggestion, index) => (
            <ListItem
              key={`${suggestion.text}-${index}`}
              role="option"
              aria-selected={false}
              onClick={() => handleSelect(suggestion as ISearchSuggestion)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSelect(suggestion as ISearchSuggestion);
              }}
              tabIndex={0}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <SuggestionIcon type={suggestion.type} />
              <Text>{suggestion.text}</Text>
            </ListItem>
          ))}
        </List>
        {history.length > 0 && query.length === 0 && (
          <>
            <Divider />
            <Button
              appearance="subtle"
              size="small"
              onClick={clearHistory}
              aria-label={strings.search.clearHistory}
            >
              {strings.search.clearHistory}
            </Button>
          </>
        )}
      </PopoverSurface>
    </Popover>
  );
};
