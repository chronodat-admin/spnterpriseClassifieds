import * as React from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import { Star24Filled, Star24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  root: { display: 'inline-flex', gap: tokens.spacingHorizontalXXS, alignItems: 'center' },
  filled: { color: tokens.colorPaletteMarigoldBackground3 },
  empty: { color: tokens.colorNeutralForeground4 }
});

export interface IRatingStarsProps {
  value: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
}

export const RatingStars: React.FC<IRatingStarsProps> = ({
  value,
  max = 5,
  size = 20,
  interactive = false,
  onChange
}) => {
  const classes = useStyles();
  return (
    <span className={classes.root} role={interactive ? 'slider' : 'img'} aria-label={`Rating: ${value} of ${max}`}>
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const filled = starValue <= Math.round(value);
        const Icon = filled ? Star24Filled : Star24Regular;
        return (
          <span
            key={i}
            className={filled ? classes.filled : classes.empty}
            style={{ cursor: interactive ? 'pointer' : 'default', fontSize: size }}
            onClick={interactive && onChange ? () => onChange(starValue) : undefined}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
          >
            <Icon />
          </span>
        );
      })}
    </span>
  );
};
