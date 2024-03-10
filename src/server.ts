import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import {
  getExtract,
  createTransaction,
  resetDatabase,
} from "./PostgresAccountRepository";
import { validateClientId, validateTransactionBody } from "./validations";
import axios from "axios";
axios.defaults.baseURL = `http://127.0.0.1:${process.env.PORT}`;


export const app = express();

app.use(express.json());

app.post(
  "/clientes/:id/transacoes",
  async (request: Request, response: Response) => {
    //console.log("NEW TRANSACTION");
    let startTime = performance.now();
    const id = validateClientId(request.params);
    const body = validateTransactionBody(request.body);

    if (id === null || body === null) {
      return response.status(422).json();
    }

    const { valor, tipo, descricao } = body;

    // gambeta
    if (id > 5) {
      return response.status(404).json();
    }

    const { account, error } = await createTransaction(
      id,
      valor,
      tipo,
      descricao,
    );

    if (error) {
      return response.status(422).json();
    }

    let endTime = performance.now();
    //console.log(`Transaction took ${endTime - startTime} milliseconds to run.`);
    return response.json({
      limite: account.limit_amount,
      saldo: account.balance,
    });
  },
);

app.get(
  "/clientes/:id/extrato",
  async (request: Request, response: Response) => {
    //console.log("NEW EXTRACT");
    let startTime = performance.now();
    const id = validateClientId(request.params);
    if (id === null) {
      return response.status(422).json();
    }
    // gambeta
    if (id > 5) {
      return response.status(404).json();
    }

    const account = await getExtract(id);

    let endTime = performance.now();
    //console.log(`Extract took ${endTime - startTime} milliseconds to run.`);
    return response.json(account);
  },
);

app.get("/reset", async (request: Request, response: Response) => {
  return response.send();
});

app
  .listen({
    host: "0.0.0.0",
    port: parseInt(process.env.PORT),
  })
//.then(async () => {
//  console.log(`🚀 Rinha de Backend Running on port 3000!`);
//  console.log("warming up app");
//  axios.get("/clientes/1/extrato");
//  axios.get("/clientes/1/extrato");
//  axios.get("/clientes/1/extrato");
//  axios.get("/clientes/1/extrato");
//  axios.get("/clientes/1/extrato");
//  axios.get("/clientes/1/extrato");
//  axios.get("/clientes/1/extrato");
//  await axios.post("/clientes/1/transacoes", {
//    valor: 1,
//    tipo: "c",
//    descricao: "asdf",
//  });
//  await axios.post("/clientes/1/transacoes", {
//    valor: 1,
//    tipo: "d",
//    descricao: "asdf",
//  });
//  await axios.post("/clientes/1/transacoes", {
//    valor: 1,
//    tipo: "c",
//    descricao: "asdf",
//  });
//  await axios.post("/clientes/1/transacoes", {
//    valor: 1,
//    tipo: "d",
//    descricao: "asdf",
//  });
//  await axios.post("/clientes/1/transacoes", {
//    valor: 1,
//    tipo: "c",
//    descricao: "asdf",
//  });
//  await axios.post("/clientes/1/transacoes", {
//    valor: 1,
//    tipo: "d",
//    descricao: "asdf",
//  });
//  resetDatabase();
//});
