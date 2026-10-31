import * as React from 'react';
import { FilterPanel, IFilterPanelProps } from './FilterPanel';
import { Accordion, AccordionItem, AccordionHeader, AccordionPanel } from '@fluentui/react-components';

export interface IAdvancedFiltersProps extends IFilterPanelProps {
  expanded?: boolean;
  accordionTitle?: string;
}

export const AdvancedFilters: React.FC<IAdvancedFiltersProps> = ({
  expanded = true,
  accordionTitle,
  ...filterProps
}) => {
  if (!accordionTitle) {
    return <FilterPanel {...filterProps} />;
  }
  return (
    <Accordion defaultOpenItems={expanded ? ['filters'] : []}>
      <AccordionItem value="filters">
        <AccordionHeader>{accordionTitle}</AccordionHeader>
        <AccordionPanel>
          <FilterPanel {...filterProps} />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};
