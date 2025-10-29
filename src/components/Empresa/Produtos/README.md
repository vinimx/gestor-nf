# Componentes de Produtos - FASE 3

## Visão Geral

Esta é a implementação da FASE 3 do sistema de gestão de produtos com integração completa da FOCUS NFE. Os componentes incluem seletores fiscais inteligentes, calculadora de impostos em tempo real e validador fiscal.

## Componentes Principais

### 1. Seletores Fiscais Inteligentes

#### SeletorNCM
Componente para seleção de códigos NCM com busca inteligente e validação em tempo real.

```tsx
import { SeletorNCM } from '@/components/Empresa/Produtos/Seletores';

<SeletorNCM
  value={ncm}
  onChange={(ncmData) => setNCM(ncmData)}
  onValidate={(valid) => setNCMValid(valid)}
  placeholder="Digite o código NCM..."
/>
```

**Funcionalidades:**
- Busca com debounce (300ms)
- Autocomplete com sugestões
- Validação em tempo real
- Cache de resultados
- Fallback para dados locais
- Indicador de status (válido/inválido)

#### SeletorCFOP
Componente para seleção de códigos CFOP filtrado por tipo (entrada/saída).

```tsx
import { SeletorCFOP } from '@/components/Empresa/Produtos/Seletores';

<SeletorCFOP
  value={cfop}
  onChange={(cfopData) => setCFOP(cfopData)}
  tipo="SAIDA"
  onValidate={(valid) => setCFOPValid(valid)}
  placeholder="CFOP de Saída..."
/>
```

**Funcionalidades:**
- Filtro por tipo (entrada/saída)
- Busca inteligente
- Validação de compatibilidade
- Sugestões baseadas no NCM

#### SeletorCST
Componente para seleção de códigos CST por tipo de imposto.

```tsx
import { SeletorCST } from '@/components/Empresa/Produtos/Seletores';

<SeletorCST
  value={cst}
  onChange={(cstData) => setCST(cstData)}
  tipo="ICMS"
  onValidate={(valid) => setCSTValid(valid)}
  placeholder="CST ICMS..."
/>
```

**Funcionalidades:**
- Filtro por tipo de imposto (ICMS, IPI, PIS, COFINS)
- Descrições detalhadas
- Validação de aplicabilidade
- Sugestões baseadas no NCM

### 2. Calculadora de Impostos

Componente para cálculos automáticos de impostos em tempo real.

```tsx
import { CalculadoraImpostos } from '@/components/Empresa/Produtos/Seletores';

<CalculadoraImpostos
  produto={produto}
  quantidade={1}
  valorUnitario={100.00}
  onCalculationChange={(calculos) => setCalculos(calculos)}
/>
```

**Funcionalidades:**
- Cálculos em tempo real
- Preview de valores
- Validação de alíquotas
- Histórico de cálculos
- Exportação de cálculos

### 3. Validador Fiscal

Componente para validação de compatibilidade fiscal NCM+CFOP+CST.

```tsx
import { ValidadorFiscal } from '@/components/Empresa/Produtos/Seletores';

<ValidadorFiscal
  produto={produto}
  onValidationChange={(result) => setValidation(result)}
/>
```

**Funcionalidades:**
- Validação de compatibilidade NCM+CFOP+CST
- Verificação de alíquotas
- Sugestões de correção
- Validação via FOCUS NFE
- Cache de validações

## Hooks Customizados

### useFocusNFE
Hook para integração com a API FOCUS NFE.

```tsx
import { useFocusNFE } from '@/hooks/useFocusNFE';

const {
  buscarNCMs,
  buscarCFOPs,
  buscarCSTs,
  validarProduto,
  loadingNCM,
  loadingCFOP,
  loadingCST,
  loadingValidation,
  errorNCM,
  errorCFOP,
  errorCST,
  errorValidation,
  clearCache,
  getCacheStats
} = useFocusNFE();
```

### useCalculadoraImpostos
Hook para cálculos de impostos.

```tsx
import { useCalculadoraImpostos } from '@/hooks/useCalculadoraImpostos';

const {
  calculos,
  loading,
  error,
  calcularImpostos,
  limparCalculos
} = useCalculadoraImpostos();
```

## Modal de Produto Atualizado

### ModalProdutoV2
Versão atualizada do modal de produto com integração dos seletores fiscais.

```tsx
import { ModalProdutoV2 } from '@/components/Empresa/Produtos/ModalProdutoV2';

<ModalProdutoV2
  open={isOpen}
  onOpenChange={setIsOpen}
  produto={produto}
  onSuccess={() => refetch()}
  onSubmit={handleSubmit}
/>
```

**Funcionalidades:**
- Formulário multi-step com abas
- Seletores fiscais integrados
- Validação em tempo real
- Preview de cálculos
- Histórico de alterações

## Página de Demonstração

### Demo Seletores Fiscais
Página para demonstração dos seletores fiscais.

Acesse: `/empresa/[id]/produtos/demo`

**Funcionalidades:**
- Demonstração de todos os seletores
- Exemplo de uso
- Teste de funcionalidades
- Reset de dados

## Configuração

### Variáveis de Ambiente

```env
# FOCUS NFE API Configuration
NEXT_PUBLIC_FOCUS_API_URL=https://api.focusnfe.com.br
FOCUS_API_TOKEN=seu_token_aqui
FOCUS_API_ENVIRONMENT=homologacao
```

### Dependências

```json
{
  "dependencies": {
    "react-hook-form": "^7.45.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0"
  }
}
```

## Estrutura de Arquivos

```
src/components/Empresa/Produtos/
├── ListaProdutos.tsx              # Lista principal
├── ModalProduto.tsx               # Modal original
├── ModalProdutoV2.tsx             # Modal atualizado
├── ModalCategoria.tsx             # Modal de categoria
├── Seletores/
│   ├── SeletorNCM.tsx            # Seletor de NCM
│   ├── SeletorCFOP.tsx           # Seletor de CFOP
│   ├── SeletorCST.tsx            # Seletor de CST
│   ├── CalculadoraImpostos.tsx   # Calculadora
│   ├── ValidadorFiscal.tsx       # Validador
│   └── index.ts                  # Exportações
└── README.md                     # Esta documentação
```

## Uso Básico

### 1. Importar os componentes

```tsx
import { 
  SeletorNCM, 
  SeletorCFOP, 
  SeletorCST, 
  CalculadoraImpostos, 
  ValidadorFiscal 
} from '@/components/Empresa/Produtos/Seletores';
```

### 2. Usar os seletores

```tsx
const [ncm, setNCM] = useState<FocusNCMData | null>(null);
const [cfop, setCFOP] = useState<FocusCFOPData | null>(null);
const [cst, setCST] = useState<FocusCSTData | null>(null);

<SeletorNCM
  value={ncm?.codigo || ""}
  onChange={setNCM}
  onValidate={(valid) => console.log('NCM válido:', valid)}
/>

<SeletorCFOP
  value={cfop?.codigo || ""}
  onChange={setCFOP}
  tipo="SAIDA"
  onValidate={(valid) => console.log('CFOP válido:', valid)}
/>

<SeletorCST
  value={cst?.codigo || ""}
  onChange={setCST}
  tipo="ICMS"
  onValidate={(valid) => console.log('CST válido:', valid)}
/>
```

### 3. Usar a calculadora

```tsx
const [calculos, setCalculos] = useState(null);

<CalculadoraImpostos
  produto={produto}
  quantidade={1}
  valorUnitario={100.00}
  onCalculationChange={setCalculos}
/>
```

### 4. Usar o validador

```tsx
const [validation, setValidation] = useState(null);

<ValidadorFiscal
  produto={produto}
  onValidationChange={setValidation}
/>
```

## Performance

### Cache Strategy
- NCMs: 1 hora
- CFOPs: 1 hora
- CSTs: 24 horas
- Validações: 30 minutos

### Otimizações
- Debounce para buscas (300ms)
- Request deduplication
- Lazy loading de componentes
- Virtualização para listas grandes

## Troubleshooting

### Problemas Comuns

1. **Token FOCUS NFE não configurado**
   - Verifique se `FOCUS_API_TOKEN` está definido
   - Sistema usa fallback para dados locais

2. **API indisponível**
   - Sistema usa fallback para validação local
   - Verifique logs do console para erros

3. **Timeout de requisição**
   - Aumente o timeout se necessário
   - Verifique conexão com internet

4. **Dados desatualizados**
   - API FOCUS atualiza dados mensalmente
   - Dados podem estar desatualizados

### Logs de Debug

```tsx
// Ativar logs detalhados
console.log('Validação NCM:', validation);
console.log('Dados FOCUS:', dadosCnpj);
console.log('Cache Stats:', getCacheStats());
```

## Próximos Passos

### Melhorias Futuras
- [ ] Cache persistente no localStorage
- [ ] Suporte a importação em lote
- [ ] Melhorar feedback visual
- [ ] Shortcuts de teclado
- [ ] Integração com outras APIs fiscais
- [ ] Machine learning para sugestões
- [ ] Relatórios avançados
- [ ] API para integração com ERPs

---

*Esta documentação será atualizada conforme novas funcionalidades forem implementadas.*
