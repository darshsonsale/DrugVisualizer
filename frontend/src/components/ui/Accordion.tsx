import React, { useState } from 'react';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: string;
  defaultExpanded?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  className = '',
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    items.forEach((item) => {
      if (item.defaultExpanded) {
        initial.add(item.id);
      }
    });
    return initial;
  });

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={`ui-accordion ${className}`.trim()}>
      {items.map((item) => {
        const isExpanded = expandedIds.has(item.id);

        return (
          <div
            key={item.id}
            className={`ui-accordion__item ${isExpanded ? 'ui-accordion__item--expanded' : ''}`}
          >
            <button
              type="button"
              className="ui-accordion__trigger"
              onClick={() => toggle(item.id)}
              aria-expanded={isExpanded}
              aria-controls={`accordion-content-${item.id}`}
              id={`accordion-trigger-${item.id}`}
            >
              <div className="ui-accordion__title-group">
                {item.icon && (
                  <span className="material-symbols-outlined ui-accordion__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className="ui-accordion__title">{item.title}</span>
              </div>
              <span
                className={`material-symbols-outlined ui-accordion__chevron ${
                  isExpanded ? 'ui-accordion__chevron--expanded' : ''
                }`}
                aria-hidden="true"
              >
                expand_more
              </span>
            </button>

            {isExpanded && (
              <div
                id={`accordion-content-${item.id}`}
                role="region"
                aria-labelledby={`accordion-trigger-${item.id}`}
                className="ui-accordion__panel"
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
