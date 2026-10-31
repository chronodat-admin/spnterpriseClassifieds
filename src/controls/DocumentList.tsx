import * as React from 'react';
import { Link, Text, makeStyles, tokens } from '@fluentui/react-components';
import { Document24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS },
  item: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }
});

export interface IDocumentItem {
  id: string | number;
  name: string;
  url: string;
  size?: string;
}

export interface IDocumentListProps {
  documents: IDocumentItem[];
  emptyMessage?: string;
}

export const DocumentList: React.FC<IDocumentListProps> = ({ documents, emptyMessage }) => {
  const classes = useStyles();
  if (documents.length === 0) {
    return emptyMessage ? <Text>{emptyMessage}</Text> : null;
  }
  return (
    <div className={classes.root}>
      {documents.map(doc => (
        <div key={doc.id} className={classes.item}>
          <Document24Regular />
          <Link href={doc.url} target="_blank" rel="noopener noreferrer">{doc.name}</Link>
          {doc.size && <Text size={200}>{doc.size}</Text>}
        </div>
      ))}
    </div>
  );
};
