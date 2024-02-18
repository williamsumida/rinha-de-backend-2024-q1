import fastify, { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";

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

app.post(
  "/clientes/:id/transacoes",
  async (request: FastifyRequest, reply: FastifyReply) => {
    const clientId = request.params.id;
    const transactionData = request.body;

    app.log.info(clientId);
    const replyData = {
      limite: 100000,
      saldo: -9098,
    };

    reply.send(replyData);
  },
);

app
  .listen({
    host: "0.0.0.0",
    port: 9999,
  })
  .then(() => {
    app.log.info(`🚀 Rinha de Backend Running on port 9999!`);
  });
