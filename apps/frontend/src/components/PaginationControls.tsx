import type { MouseEvent } from 'react';
import { cn } from '@/helpers/utils';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface PaginationControlsProps {
  className?: string;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  totalPages: number;
}

export function PaginationControls({
  className,
  currentPage,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  totalPages,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
    const firstPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    return firstPage + index;
  });
  const firstVisiblePage = pages[0] ?? 1;
  const lastVisiblePage = pages[pages.length - 1] ?? totalPages;

  const changePage = (event: MouseEvent<HTMLAnchorElement>, page: number) => {
    event.preventDefault();
    onPageChange(page);
  };

  return (
    <Pagination className={cn('mt-6', className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            aria-disabled={!hasPreviousPage}
            className={!hasPreviousPage ? 'pointer-events-none opacity-40' : ''}
            href="#previous"
            onClick={(event) => {
              if (hasPreviousPage) changePage(event, currentPage - 1);
              else event.preventDefault();
            }}
            tabIndex={hasPreviousPage ? 0 : -1}
          />
        </PaginationItem>
        {firstVisiblePage > 1 && (
          <>
            <PaginationItem>
              <PaginationLink
                href="#page-1"
                onClick={(event) => changePage(event, 1)}
              >
                1
              </PaginationLink>
            </PaginationItem>
            {firstVisiblePage > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </>
        )}
        {pages.map((pageNumber) => (
          <PaginationItem key={pageNumber}>
            <PaginationLink
              href={`#page-${pageNumber}`}
              isActive={pageNumber === currentPage}
              onClick={(event) => changePage(event, pageNumber)}
            >
              {pageNumber}
            </PaginationLink>
          </PaginationItem>
        ))}
        {lastVisiblePage < totalPages && (
          <>
            {lastVisiblePage < totalPages - 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink
                href={`#page-${totalPages}`}
                onClick={(event) => changePage(event, totalPages)}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}
        <PaginationItem>
          <PaginationNext
            aria-disabled={!hasNextPage}
            className={!hasNextPage ? 'pointer-events-none opacity-40' : ''}
            href="#next"
            onClick={(event) => {
              if (hasNextPage) changePage(event, currentPage + 1);
              else event.preventDefault();
            }}
            tabIndex={hasNextPage ? 0 : -1}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
