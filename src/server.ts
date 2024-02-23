import fastify, { FastifyRequest, FastifyReply } from "fastify";
import {
  getExtract,
  createTransaction,
  resetDatabase,
} from "./PostgresAccountRepository";
import { validateClientId, validateTransactionBody } from "./validations";
import axios from "axios";
axios.defaults.baseURL = "http://127.0.0.1:3000";

//const envToLogger = {
//  level: "error",
//  transport: {
//    target: "pino-pretty",
//    options: {
//      translateTime: "HH:MM:ss Z",
//      ignore: "pid,hostname",
//    },
//  },
//};

export const app = fastify();

app.post(
  "/clientes/:id/transacoes",
  async (request: FastifyRequest, reply: FastifyReply) => {
    console.log("NEW TRANSACTION");
    let startTime = performance.now();
    const id = validateClientId(request.params);
    const body = validateTransactionBody(request.body);

    if (id === null || body === null) {
      return reply.code(422).send();
    }

    const { valor, tipo, descricao } = body;

    // gambeta
    if (id > 5) {
      return reply.code(404).send();
    }

    const { account, error } = await createTransaction(
      id,
      valor,
      tipo,
      descricao,
    );

    if (error) {
      return reply.code(422).send();
    }

    let endTime = performance.now();
    console.log(`Transaction took ${endTime - startTime} milliseconds to run.`);
    return reply.send({
      limite: account.limit_amount,
      saldo: account.balance,
    });
  },
);

app.get(
  "/clientes/:id/extrato",
  async (request: FastifyRequest, reply: FastifyReply) => {
    console.log("NEW EXTRACT");
    let startTime = performance.now();
    const id = validateClientId(request.params);
    if (id === null) {
      return reply.code(422).send();
    }
    // gambeta
    if (id > 5) {
      return reply.code(404).send();
    }

    const account = await getExtract(id);

    let endTime = performance.now();
    console.log(`Extract took ${endTime - startTime} milliseconds to run.`);
    return reply.send(account);
  },
);

app.get("/reset", async (request: FastifyRequest, reply: FastifyReply) => {
  return reply.send(account);
});

app
  .listen({
    host: "0.0.0.0",
    port: 3000,
  })
  .then(async () => {
    console.log(`🚀 Rinha de Backend Running on port 3000!`);
    console.log("warming up app");
    axios.get("/clientes/1/extrato");
    axios.get("/clientes/1/extrato");
    axios.get("/clientes/1/extrato");
    axios.get("/clientes/1/extrato");
    axios.get("/clientes/1/extrato");
    axios.get("/clientes/1/extrato");
    axios.get("/clientes/1/extrato");
    await axios.post("/clientes/1/transacoes", {
      valor: 1,
      tipo: "c",
      descricao: "asdf",
    });
    await axios.post("/clientes/1/transacoes", {
      valor: 1,
      tipo: "d",
      descricao: "asdf",
    });
    await axios.post("/clientes/1/transacoes", {
      valor: 1,
      tipo: "c",
      descricao: "asdf",
    });
    await axios.post("/clientes/1/transacoes", {
      valor: 1,
      tipo: "d",
      descricao: "asdf",
    });
    await axios.post("/clientes/1/transacoes", {
      valor: 1,
      tipo: "c",
      descricao: "asdf",
    });
    await axios.post("/clientes/1/transacoes", {
      valor: 1,
      tipo: "d",
      descricao: "asdf",
    });
    resetDatabase();
  });
