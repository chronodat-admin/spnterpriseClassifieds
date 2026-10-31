import * as React from 'react';
import { Textarea, Button, Field, Text, Avatar, makeStyles, tokens } from '@fluentui/react-components';
import { formatRelativeDate, getInitials } from '../utilities';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM },
  list: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM },
  comment: { display: 'flex', gap: tokens.spacingHorizontalM },
  body: { flex: 1 }
});

export interface IComment {
  id: string | number;
  author: string;
  body: string;
  created: Date | string;
}

export interface ICommentSectionProps {
  comments: IComment[];
  onSubmit?: (body: string) => void;
  placeholder?: string;
  submitLabel?: string;
  loading?: boolean;
}

export const CommentSection: React.FC<ICommentSectionProps> = ({
  comments,
  onSubmit,
  placeholder = 'Write a comment...',
  submitLabel = 'Post',
  loading
}) => {
  const classes = useStyles();
  const [body, setBody] = React.useState('');

  const handleSubmit = (): void => {
    if (!body.trim() || !onSubmit) return;
    onSubmit(body.trim());
    setBody('');
  };

  return (
    <div className={classes.root}>
      {onSubmit && (
        <Field>
          <Textarea value={body} onChange={(_, d) => setBody(d.value)} placeholder={placeholder} resize="vertical" />
          <Button appearance="primary" onClick={handleSubmit} disabled={!body.trim() || loading} style={{ marginTop: 8 }}>
            {submitLabel}
          </Button>
        </Field>
      )}
      <div className={classes.list}>
        {comments.map(c => (
          <div key={c.id} className={classes.comment}>
            <Avatar name={c.author} initials={getInitials(c.author)} size={32} />
            <div className={classes.body}>
              <Text weight="semibold">{c.author}</Text>
              <Text>{c.body}</Text>
              <Text size={100}>{formatRelativeDate(c.created)}</Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
