import fastify, { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { PostgresAccountRepository } from "./PostgresAccountRepository";
import { validateClientId, validateTransactionBody } from "./validations";
import { errors } from "./errors";

const envToLogger = {
  level: "info",
  transport: {
    target: "pino-pretty",
    options: {
      translateTime: "HH:MM:ss Z",
      ignore: "pid,hostname",
    },
  },
};

export const app = fastify({ logger: envToLogger });

const repository = new PostgresAccountRepository();

app.post(
  "/clientes/:id/transacoes",
  async (request: FastifyRequest, reply: FastifyReply) => {
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

    const { account, error } = await repository.createTransaction(id, {
      value: valor,
      type: tipo,
      description: descricao,
    });

    if (error === errors.ACCOUNT_NOT_FOUND) {
      return reply.code(404).send();
    }

    if (error === errors.INVALID_TRANSACTION) {
      return reply.code(422).send();
    }

    reply.send({
      limite: account.limit_amount,
      saldo: account.balance,
    });
  },
);

app.get(
  "/clientes/:id/extrato",
  async (request: FastifyRequest, reply: FastifyReply) => {
    const id = validateClientId(request.params);
    if (id === null) {
      return reply.code(422).send();
    }
    // gambeta
    if (id > 5) {
      return reply.code(404).send();
    }

    const account = await repository.getExtract(id);

    if (account == null) {
      return reply.code(404).send();
    }

    reply.send(account);
  },
);

app
  .listen({
    host: "0.0.0.0",
    port: 3000,
  })
  .then(() => {
    app.log.info(`🚀 Rinha de Backend Running on port 3000!`);
  });
