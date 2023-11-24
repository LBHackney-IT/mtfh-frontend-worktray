import React, { useContext, useMemo } from "react";

import {
  Pagination,
  PaginationButton,
  PaginationControls,
  PaginationSummary,
} from "@mtfh/common/lib/components";

import { WorktrayContext } from "../../context/worktray-context";
import { locale } from "../../services";
import "./styles.scss";

const { previous, next, assistiveNavigation, searchResultsCounter } =
  locale.components.pagination;

interface WorktrayPaginationProps {
  pageRange?: number;
}

export const hasNoResult = (total: number | undefined): boolean => {
  return !total || total <= 0;
};

export const WorktrayPagination = ({
  pageRange = 2,
}: WorktrayPaginationProps): JSX.Element | null => {
  const {
    state: { total, page, pageSize },
    dispatch,
  } = useContext(WorktrayContext);

  const [totalPages, activePage] = useMemo(() => {
    const tp = total ? Math.ceil(total / pageSize) : 0;
    return [tp, page > tp ? tp : page];
  }, [total, page, pageSize]);

  const range = useMemo(() => {
    if (hasNoResult(total)) {
      return [1];
    }
    let rangeStart = activePage - pageRange;
    let rangeEnd = activePage + pageRange;
    if (rangeEnd > totalPages) {
      rangeEnd = totalPages;
      rangeStart = totalPages - pageRange * 2;
    }

    if (rangeStart <= 1) {
      rangeStart = 1;
      rangeEnd = Math.min(pageRange * 2 + 1, totalPages);
    }

    const length = rangeEnd - rangeStart + 1;
    const visiblePages = new Array<number>(length);

    for (let i = 0; i < length; i += 1) {
      visiblePages[i] = rangeStart + i;
    }

    return visiblePages;
  }, [total, activePage, pageRange, totalPages]);

  if (total === undefined || total < 0 || totalPages === Infinity || range.length === 0) {
    return null;
  }

  return (
    <Pagination role="navigation">
      <PaginationSummary>{searchResultsCounter(page, pageSize, total)}</PaginationSummary>
      <PaginationControls>
        {activePage > 1 && (
          <PaginationButton
            as="button"
            onClick={() => dispatch({ type: "PAGE", payload: activePage - 1 })}
            variant="previous"
          >
            {previous}
          </PaginationButton>
        )}
        {range.map((index) => (
          <PaginationButton
            as="button"
            key={index}
            onClick={() => dispatch({ type: "PAGE", payload: index })}
            active={hasNoResult(total)}
            aria-label={assistiveNavigation(index)}
            aria-current={index === activePage ? "page" : undefined}
            className={hasNoResult(total) ? "lbh-pagination__link__no-item" : undefined}
          >
            {index}
          </PaginationButton>
        ))}
        {activePage < totalPages && (
          <PaginationButton
            as="button"
            onClick={() => dispatch({ type: "PAGE", payload: activePage + 1 })}
            variant="next"
          >
            {next}
          </PaginationButton>
        )}
      </PaginationControls>
    </Pagination>
  );
};
