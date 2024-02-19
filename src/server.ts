import fastify, { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { PostgresAccountRepository } from "./PostgresAccountRepository";
import { validateClientId, validateTransactionBody } from "./validations";

const envToLogger = {
  transport: {
    target: "pino-pretty",
    options: {
      translateTime: "HH:MM:ss Z",
      ignore: "pid,hostname",
    },
  },
};

const app = fastify({ logger: envToLogger });

const repository = new PostgresAccountRepository();

app.post(
  "/clientes/:id/transacoes",
  async (request: FastifyRequest, reply: FastifyReply) => {
    const id = validateClientId(request.params);
    const body = validateTransactionBody(request.body);

    if (id === null || body === null) {
      return reply.code(400).send();
    }

    const { valor, tipo, descricao } = body;

    await repository.createTransaction(id, {
      value: valor,
      type: tipo,
      description: descricao,
    });

    const replyData = {
      limite: 100000,
      saldo: -9098,
    };

    reply.send(replyData);
  },
);

app.get(
  "/clientes/:id/extrato",
  async (request: FastifyRequest, reply: FastifyReply) => {
    const id = validateClientId(request.params);
    if (id === null) {
      return reply.code(400).send();
    }

    const account = await repository.getExtract(id);

    if (account == null) {
      return reply.code(404).send();
    }

    const extrato = {
      saldo: {
        total: account?.balance,
        data_extrato: account?.extract_date,
        limite: account?.limit_amount,
      },
      ultimas_transacoes: account?.transactions,
    };

    reply.send(extrato);
  },
);

app
  .listen({
    host: "0.0.0.0",
    port: 9999,
  })
  .then(() => {
    app.log.info(`🚀 Rinha de Backend Running on port 3000!`);
  });
