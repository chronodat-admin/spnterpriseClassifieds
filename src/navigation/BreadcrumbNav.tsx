import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbButton,
  BreadcrumbDivider
} from '@fluentui/react-components';
import { IBreadcrumbItem } from '../interfaces';

export interface IBreadcrumbNavProps {
  items: IBreadcrumbItem[];
  maxItems?: number;
}

export const BreadcrumbNav: React.FC<IBreadcrumbNavProps> = ({ items, maxItems = 5 }) => {
  const navigate = useNavigate();

  const visibleItems = items.length > maxItems
    ? [items[0], { key: 'ellipsis', text: '...' }, ...items.slice(-(maxItems - 2))]
    : items;

  const handleNavigate = (path?: string): void => {
    if (path) navigate(path);
  };

  return (
    <Breadcrumb aria-label="Breadcrumb navigation">
      {visibleItems.map((item, index) => {
        const isLast = index === visibleItems.length - 1;
        const isEllipsis = item.key === 'ellipsis';

        return (
          <React.Fragment key={item.key}>
            {index > 0 && <BreadcrumbDivider />}
            <BreadcrumbItem>
              {isEllipsis ? (
                <span aria-hidden="true">...</span>
              ) : item.path && !isLast ? (
                <BreadcrumbButton
                  onClick={() => handleNavigate(item.path)}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.text}
                </BreadcrumbButton>
              ) : (
                <BreadcrumbButton current aria-current="page">
                  {item.text}
                </BreadcrumbButton>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        );
      })}
    </Breadcrumb>
  );
};
