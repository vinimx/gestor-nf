import { XMLParser } from "fast-xml-parser";
import { NotaFiscal, ItemDaNotaFiscal, ImpostoNota } from "@/types/models";

interface NFeData {
  nota: Partial<NotaFiscal>;
  itens: Partial<ItemDaNotaFiscal>[];
  impostos: Partial<ImpostoNota>[];
}

export class NFEParser {
  private parser: XMLParser;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      parseAttributeValue: true,
      trimValues: true,
    });
  }

  parseNFeXml(xml: string): NFeData {
    try {
      const jsonObj = this.parser.parse(xml);

      // Buscar a NFe no XML (pode estar em diferentes estruturas)
      const nfe = this.findNFe(jsonObj);

      if (!nfe) {
        throw new Error("NFe não encontrada no XML");
      }

      const nota = this.extractNotaFiscal(nfe);
      const itens = this.extractItens(nfe);
      const impostos = this.extractImpostos(nfe);

      return {
        nota,
        itens,
        impostos,
      };
    } catch (error) {
      console.error("Erro ao fazer parse do XML:", error);
      throw new Error(
        `Erro ao processar XML: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    }
  }

  private findNFe(obj: any): any {
    // Tentar diferentes estruturas de XML NFe
    if (obj.NFe) return obj.NFe;
    if (obj.nfeProc) return obj.nfeProc.NFe;
    if (obj["nfe:NFe"]) return obj["nfe:NFe"];
    if (obj["NFeProc"]) return obj["NFeProc"].NFe;

    // Buscar recursivamente
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        if (
          key.toLowerCase().includes("nfe") ||
          key.toLowerCase().includes("nota")
        ) {
          const result = this.findNFe(obj[key]);
          if (result) return result;
        }
      }
    }

    return null;
  }

  private extractNotaFiscal(nfe: any): Partial<NotaFiscal> {
    const infNFe = nfe.infNFe || nfe.infNFe || nfe["@_infNFe"];
    const ide = infNFe?.ide || infNFe?.ide;
    const emit = infNFe?.emit || infNFe?.emit;
    const total = infNFe?.total || infNFe?.total;

    // Extrair chave de acesso
    const chaveAcesso = infNFe?.["@_Id"]?.replace("NFe", "") || null;

    // Extrair número e série
    const numero = ide?.nNF || ide?.numero || "";
    const serie = ide?.serie || ide?.serie || "";

    // Extrair datas
    const dataEmissao = this.formatDate(
      ide?.dhEmi || ide?.dEmi || ide?.dataEmissao
    );

    // Extrair valores
    const valorTotal = this.extractNumber(
      total?.ICMSTot?.vNF || total?.valorTotal || total?.totalNota || 0
    );
    const baseCalculo = this.extractNumber(
      total?.ICMSTot?.vBC || total?.baseCalculo || 0
    );
    const impostoTotal = this.extractNumber(
      total?.ICMSTot?.vICMS || total?.impostoTotal || 0
    );

    return {
      chave_acesso: chaveAcesso,
      numero: numero.toString(),
      serie: serie.toString(),
      data_emissao: dataEmissao,
      valor_total: valorTotal,
      base_calculo: baseCalculo,
      imposto_total: impostoTotal,
      status: "importado",
      tipo: "entrada", // Default, pode ser ajustado conforme necessário
    };
  }

  private extractItens(nfe: any): Partial<ItemDaNotaFiscal>[] {
    const infNFe = nfe.infNFe || nfe.infNFe;
    const det = infNFe?.det || infNFe?.itens || infNFe?.detalhes;

    if (!det) return [];

    const itens = Array.isArray(det) ? det : [det];

    return itens.map((item: any, index: number) => {
      const prod = item.prod || item.produto || item;
      const imposto = item.imposto || item.tributacao;

      return {
        descricao: prod.xProd || prod.descricao || prod.nome || "",
        ncm: prod.NCM || prod.ncm || "",
        quantidade: this.extractNumber(prod.qCom || prod.quantidade || 1),
        unidade: prod.uCom || prod.unidade || "UN",
        valor_unitario: this.extractNumber(
          prod.vUnCom || prod.valorUnitario || 0
        ),
        valor_total: this.extractNumber(prod.vProd || prod.valorTotal || 0),
        cfop: prod.CFOP || prod.cfop || "",
        aliquota_icms: this.extractNumber(
          imposto?.ICMS?.pICMS || imposto?.aliquotaIcms || 0
        ),
      };
    });
  }

  private extractImpostos(nfe: any): Partial<ImpostoNota>[] {
    const infNFe = nfe.infNFe || nfe.infNFe;
    const total = infNFe?.total || infNFe?.total;
    const icmsTot = total?.ICMSTot || total?.icmsTotal;

    const impostos: Partial<ImpostoNota>[] = [];

    if (icmsTot) {
      // ICMS
      if (icmsTot.vICMS && icmsTot.vICMS > 0) {
        impostos.push({
          tipo: "ICMS",
          base_calculo: this.extractNumber(icmsTot.vBC || 0),
          aliquota: this.calculateAliquota(
            this.extractNumber(icmsTot.vBC || 0),
            this.extractNumber(icmsTot.vICMS || 0)
          ),
          valor: this.extractNumber(icmsTot.vICMS || 0),
        });
      }

      // IPI
      if (icmsTot.vIPI && icmsTot.vIPI > 0) {
        impostos.push({
          tipo: "IPI",
          base_calculo: this.extractNumber(icmsTot.vBC || 0),
          aliquota: this.calculateAliquota(
            this.extractNumber(icmsTot.vBC || 0),
            this.extractNumber(icmsTot.vIPI || 0)
          ),
          valor: this.extractNumber(icmsTot.vIPI || 0),
        });
      }

      // PIS
      if (icmsTot.vPIS && icmsTot.vPIS > 0) {
        impostos.push({
          tipo: "PIS",
          base_calculo: this.extractNumber(icmsTot.vBC || 0),
          aliquota: this.calculateAliquota(
            this.extractNumber(icmsTot.vBC || 0),
            this.extractNumber(icmsTot.vPIS || 0)
          ),
          valor: this.extractNumber(icmsTot.vPIS || 0),
        });
      }

      // COFINS
      if (icmsTot.vCOFINS && icmsTot.vCOFINS > 0) {
        impostos.push({
          tipo: "COFINS",
          base_calculo: this.extractNumber(icmsTot.vBC || 0),
          aliquota: this.calculateAliquota(
            this.extractNumber(icmsTot.vBC || 0),
            this.extractNumber(icmsTot.vCOFINS || 0)
          ),
          valor: this.extractNumber(icmsTot.vCOFINS || 0),
        });
      }
    }

    return impostos;
  }

  private formatDate(dateStr?: string): string {
    if (!dateStr) return String(new Date().toISOString().split("T")[0]);

    try {
      // Tentar diferentes formatos de data
      let date: Date;

      if (dateStr.includes("T")) {
        // ISO format
        date = new Date(dateStr);
      } else if (dateStr.includes("/")) {
        // DD/MM/YYYY format
        const parts = dateStr.split("/");
        const day = parts[0] ?? "1";
        const month = parts[1] ?? "1";
        const year = parts[2] ?? "1970";
        date = new Date(
          parseInt(year, 10),
          parseInt(month, 10) - 1,
          parseInt(day, 10)
        );
      } else {
        // YYYY-MM-DD format
        date = new Date(dateStr);
      }

      return String(date.toISOString().split("T")[0]);
    } catch {
      return String(new Date().toISOString().split("T")[0]);
    }
  }

  private extractNumber(value: any): number {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      // Remove caracteres não numéricos exceto ponto e vírgula
      const cleaned = value.replace(/[^\d.,]/g, "");
      // Substitui vírgula por ponto
      const normalized = cleaned.replace(",", ".");
      return parseFloat(normalized) || 0;
    }
    return 0;
  }

  private calculateAliquota(baseCalculo: number, valor: number): number {
    if (baseCalculo === 0) return 0;
    return (valor / baseCalculo) * 100;
  }

  // Método para validar se o XML é uma NFe válida
  validateNFeXml(xml: string): boolean {
    try {
      const jsonObj = this.parser.parse(xml);
      const nfe = this.findNFe(jsonObj);
      return !!nfe;
    } catch {
      return false;
    }
  }

  // Método para extrair informações básicas sem fazer parse completo
  extractBasicInfo(xml: string): {
    chave: string | null;
    numero: string | null;
    valor: number | null;
  } {
    try {
      const jsonObj = this.parser.parse(xml);
      const nfe = this.findNFe(jsonObj);

      if (!nfe) {
        return { chave: null, numero: null, valor: null };
      }

      const infNFe = nfe.infNFe || nfe.infNFe;
      const ide = infNFe?.ide || infNFe?.ide;
      const total = infNFe?.total || infNFe?.total;

      const chave = infNFe?.["@_Id"]?.replace("NFe", "") || null;
      const numero = ide?.nNF || ide?.numero || null;
      const valor = this.extractNumber(
        total?.ICMSTot?.vNF || total?.valorTotal || 0
      );

      return {
        chave,
        numero: numero?.toString() || null,
        valor: valor || null,
      };
    } catch {
      return { chave: null, numero: null, valor: null };
    }
  }
}
