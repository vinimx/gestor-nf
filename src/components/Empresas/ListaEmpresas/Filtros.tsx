"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

interface FiltrosProps {
  onSearchChange: (search: string) => void;
  onSortChange: (sort: string, order: "asc" | "desc") => void;
  onStatusChange: (status: "all" | "active" | "inactive") => void;
  defaultSearch?: string;
  defaultSort?: string;
  defaultOrder?: "asc" | "desc";
  defaultStatus?: "all" | "active" | "inactive";
}

export function Filtros({
  onSearchChange,
  onSortChange,
  onStatusChange,
  defaultSearch = "",
  defaultSort = "nome",
  defaultOrder = "asc",
  defaultStatus = "all",
}: FiltrosProps) {
  const [search, setSearch] = useState(defaultSearch);
  const [sort, setSort] = useState(defaultSort);
  const [order, setOrder] = useState<"asc" | "desc">(defaultOrder);
  const [status, setStatus] = useState<"all" | "active" | "inactive">(defaultStatus);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, onSearchChange]);

  useEffect(() => {
    onSortChange(sort, order);
  }, [sort, order, onSortChange]);

  useEffect(() => {
    onStatusChange(status);
  }, [status, onStatusChange]);

  const handleClearSearch = () => {
    setSearch("");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Linha 1: Busca */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou CNPJ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-9"
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Limpar busca</span>
          </Button>
        )}
      </div>

      {/* Linha 2: Filtros e Ordenação */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Filtro de Status */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as "all" | "active" | "inactive")}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="active">Apenas Ativas</SelectItem>
              <SelectItem value="inactive">Apenas Inativas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ordenação */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Ordenar por:</span>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nome">Nome</SelectItem>
              <SelectItem value="cnpj">CNPJ</SelectItem>
              <SelectItem value="created_at">Data</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={order}
            onValueChange={(value) => setOrder(value as "asc" | "desc")}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">A-Z</SelectItem>
              <SelectItem value="desc">Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

