"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginacaoProps {
  total: number;
  limit: number;
  offset: number;
  onPageChange: (offset: number) => void;
}

export function Paginacao({
  total,
  limit,
  offset,
  onPageChange,
}: PaginacaoProps) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = offset + limit < total;
  const hasPreviousPage = offset > 0;

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      onPageChange(offset - limit);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      onPageChange(offset + limit);
    }
  };

  const handlePageClick = (page: number) => {
    const newOffset = (page - 1) * limit;
    onPageChange(newOffset);
  };

  // Calcula páginas visíveis (mostra no máximo 5)
  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Mostra todas as páginas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostra páginas próximas à atual
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-between border-t pt-4">
      <div className="text-sm text-muted-foreground">
        Mostrando {offset + 1} a {Math.min(offset + limit, total)} de {total}{" "}
        empresas
      </div>

      <div className="flex items-center gap-1">
        {/* Botão Anterior */}
        <Button
          variant="outline"
          size="icon"
          onClick={handlePreviousPage}
          disabled={!hasPreviousPage}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Página anterior</span>
        </Button>

        {/* Páginas */}
        {visiblePages[0] > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageClick(1)}
            >
              1
            </Button>
            {visiblePages[0] > 2 && (
              <span className="px-2 text-muted-foreground">...</span>
            )}
          </>
        )}

        {visiblePages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="icon"
            onClick={() => handlePageClick(page)}
          >
            {page}
          </Button>
        ))}

        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <span className="px-2 text-muted-foreground">...</span>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageClick(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}

        {/* Botão Próximo */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextPage}
          disabled={!hasNextPage}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Próxima página</span>
        </Button>
      </div>
    </div>
  );
}

