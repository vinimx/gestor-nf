/*
Simple integration test script to POST a new empresa to the local dev server.
Usage (PowerShell):
  node scripts/test-create-empresa.js

It sends a POST to http://localhost:3000/api/empresas and prints the response.
Make sure your dev server is running (`npm run dev`) and your environment is configured.
*/

const http = require("http");
const https = require("https");
const { URL } = require("url");

async function run() {
  const urlString =
    process.env.TEST_API_URL || "http://localhost:3000/api/empresas";
  const url = new URL(urlString);
  const payload = JSON.stringify({
    nome: "Empresa de Teste LTDA",
    cnpj: "12.345.678/0001-95",
    inscricao_estadual: "123456789",
    endereco: {
      logradouro: "Rua de Teste",
      numero: "100",
      complemento: "Sala 1",
      bairro: "Centro",
      cidade: "São Paulo",
      uf: "SP",
      cep: "01001-000",
    },
    telefone: "(11) 99999-0000",
    email: "teste@empresa.com",
    ativo: true,
  });

  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === "https:" ? 443 : 80),
    path: url.pathname + url.search,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    },
  };

  const client = url.protocol === "https:" ? https : http;

  const req = client.request(options, (res) => {
    let body = "";
    res.on("data", (chunk) => {
      body += chunk;
    });
    res.on("end", () => {
      console.log("Status:", res.statusCode);
      console.log("Response:", body);
      if (res.statusCode && res.statusCode >= 400) process.exitCode = 2;
    });
  });

  req.on("error", (err) => {
    console.error("Erro ao chamar API:", err);
    process.exitCode = 1;
  });

  req.write(payload);
  req.end();
}

run();
