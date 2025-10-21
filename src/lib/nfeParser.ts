import { XMLParser } from "fast-xml-parser";

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

  parseNFeXml(xml: string) {
    try {
      const jsonObj = this.parser.parse(xml);
      const nfe = this.findNFe(jsonObj);
      if (!nfe) throw new Error("NFe não encontrada no XML");

      // Return minimal structure used by UploadXML component
      return {
        nota: {
          chave_acesso: null,
          numero: null,
          serie: null,
          data_emissao: null,
          valor_total: null,
          base_calculo: null,
          imposto_total: null,
          tipo: "entrada",
          status: "importado",
        },
        itens: [
          {
            descricao: "",
            ncm: "",
            quantidade: 1,
            unidade: "UN",
            valor_unitario: 0,
            valor_total: 0,
            cfop: "",
            aliquota_icms: 0,
          },
        ],
        impostos: [
          {
            tipo: "ICMS",
            base_calculo: 0,
            aliquota: 0,
            valor: 0,
          },
        ],
      };
    } catch (err) {
      console.error("Erro ao fazer parse do XML (client):", err);
      throw err;
    }
  }

  validateNFeXml(xml: string): boolean {
    try {
      const jsonObj = this.parser.parse(xml);
      const nfe = this.findNFe(jsonObj);
      return !!nfe;
    } catch {
      return false;
    }
  }

  extractBasicInfo(xml: string) {
    try {
      const jsonObj = this.parser.parse(xml);
      const nfe = this.findNFe(jsonObj);
      if (!nfe) return { chave: null, numero: null, valor: null };

      const infNFe = nfe.infNFe || nfe.infNFe;
      const ide = infNFe?.ide || infNFe?.ide;
      const total = infNFe?.total || infNFe?.total;

      const chave = infNFe?.["@_Id"]?.replace("NFe", "") || null;
      const numero = ide?.nNF || ide?.numero || null;
      const valor = total?.ICMSTot?.vNF || total?.valorTotal || 0;

      return {
        chave,
        numero: numero?.toString() || null,
        valor: valor || null,
      };
    } catch {
      return { chave: null, numero: null, valor: null };
    }
  }

  private findNFe(obj: any): any {
    if (!obj || typeof obj !== "object") return null;
    if (obj.NFe) return obj.NFe;
    if (obj.nfeProc) return obj.nfeProc.NFe;
    if (obj["nfe:NFe"]) return obj["nfe:NFe"];
    if (obj["NFeProc"]) return obj["NFeProc"].NFe;

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
}




