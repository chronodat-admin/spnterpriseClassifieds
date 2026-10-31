import * as React from 'react';
import { Button, Text, makeStyles, tokens } from '@fluentui/react-components';
import {
  ChevronLeft24Regular,
  ChevronRight24Regular,
  ChevronDoubleLeftRegular,
  ChevronDoubleRightRegular
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalM,
    padding: tokens.spacingVerticalM
  },
  info: { minWidth: '120px', textAlign: 'center' }
});

export interface IPaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  labels?: { page: string; of: string; items: string };
}

export const Pagination: React.FC<IPaginationProps> = ({
  page,
  pageSize,
  totalCount,
  onPageChange,
  labels = { page: 'Page', of: 'of', items: 'items' }
}) => {
  const classes = useStyles();
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className={classes.root}>
      <Button
        icon={<ChevronDoubleLeftRegular />}
        disabled={page <= 1}
        onClick={() => onPageChange(1)}
        aria-label="First page"
      />
      <Button
        icon={<ChevronLeft24Regular />}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      />
      <Text className={classes.info}>
        {labels.page} {page} {labels.of} {totalPages} ({totalCount} {labels.items})
      </Text>
      <Button
        icon={<ChevronRight24Regular />}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      />
      <Button
        icon={<ChevronDoubleRightRegular />}
        disabled={page >= totalPages}
        onClick={() => onPageChange(totalPages)}
        aria-label="Last page"
      />
    </div>
  );
};
