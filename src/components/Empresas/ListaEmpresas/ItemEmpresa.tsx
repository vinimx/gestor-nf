"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { maskCNPJ, maskPhone } from "@/lib/masks";
import { Empresa } from "@/types/models";
import { Building2, Mail, MapPin, MoreVertical, Phone } from "lucide-react";

interface ItemEmpresaProps {
  empresa: Empresa;
  onEdit: (empresa: Empresa) => void;
  onDelete: (empresa: Empresa) => void;
}

export function ItemEmpresa({ empresa, onEdit, onDelete }: ItemEmpresaProps) {
  const enderecoCompleto =
    empresa.endereco &&
    (empresa.endereco.logradouro || empresa.endereco.cidade)
      ? [
          empresa.endereco.logradouro,
          empresa.endereco.numero,
          empresa.endereco.bairro,
          empresa.endereco.cidade,
          empresa.endereco.uf,
        ]
          .filter(Boolean)
          .join(", ")
      : null;

  return (
    <Card 
      className="group transition-all duration-300 hover:shadow-lg hover:scale-[1.01] hover:border-primary/50 animate-in fade-in slide-in-from-bottom-4 overflow-hidden"
      role="article"
      aria-label={`Empresa ${empresa.nome}`}
    >
      <CardHeader className="pb-3 overflow-hidden">
        <div className="flex items-start justify-between gap-2 min-w-0 w-full">
          <div className="min-w-0 flex-1 space-y-1 overflow-hidden">
            <div className="flex items-start gap-2 flex-wrap min-w-0">
              <CardTitle className="text-lg transition-colors group-hover:text-primary break-words line-clamp-2 flex-1 min-w-0 max-w-full overflow-hidden hyphens-auto" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                {empresa.nome}
              </CardTitle>
              <Badge variant={empresa.ativo ? "success" : "secondary"} className="shrink-0 whitespace-nowrap">
                {empresa.ativo ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <CardDescription className="flex items-center gap-1 text-xs min-w-0 overflow-hidden">
              <Building2 className="h-3 w-3 shrink-0" />
              <span className="break-all truncate" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>CNPJ: {maskCNPJ(empresa.cnpj)}</span>
            </CardDescription>
          </div>

          {/* Menu de Ações */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 shrink-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={`Ações para ${empresa.nome}`}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Abrir menu de ações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => onEdit(empresa)}
                aria-label={`Editar ${empresa.nome}`}
              >
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(empresa)}
                className="text-destructive focus:text-destructive"
                aria-label={`Excluir ${empresa.nome}`}
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 text-sm overflow-hidden">
        {/* Inscrição Estadual */}
        {empresa.inscricao_estadual && (
          <div className="text-muted-foreground min-w-0 max-w-full overflow-hidden">
            <span className="font-medium">IE:</span>{" "}
            <span className="break-all" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{empresa.inscricao_estadual}</span>
          </div>
        )}

        {/* Contatos */}
        <div className="flex flex-col gap-1 min-w-0 max-w-full">
          {empresa.email && (
            <div className="flex items-center gap-2 text-muted-foreground min-w-0 max-w-full overflow-hidden">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs break-all min-w-0 max-w-full" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{empresa.email}</span>
            </div>
          )}
          {empresa.telefone && (
            <div className="flex items-center gap-2 text-muted-foreground overflow-hidden">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs whitespace-nowrap">{maskPhone(empresa.telefone)}</span>
            </div>
          )}
        </div>

        {/* Endereço */}
        {enderecoCompleto && (
          <div className="flex items-start gap-2 text-muted-foreground min-w-0 max-w-full overflow-hidden">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="text-xs leading-relaxed min-w-0 max-w-full" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{enderecoCompleto}</span>
          </div>
        )}

        {/* Data de Cadastro */}
        {empresa.created_at && (
          <div className="pt-2 text-xs text-muted-foreground/70">
            Cadastrado em{" "}
            {new Date(empresa.created_at).toLocaleDateString("pt-BR")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

