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
    const clientIdSchema = z.object({ id: z.coerce.number().int() });
    const transactionDataBodySchema = z.object({
      valor: z.number().positive(),
      tipo: z.enum(["c", "d"]),
      descricao: z.string().min(1).max(10),
    });

    const { id } = clientIdSchema.parse(request.params);
    const { valor, tipo, descricao } = transactionDataBodySchema.parse(
      request.body,
    );

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
    const clientIdSchema = z.object({ id: z.coerce.number().int() });
    const { id } = clientIdSchema.parse(request.params);
    app.log.info(id);

    const extrato = {
      saldo: {
        total: -9098,
        data_extrato: "2024-01-17T02:34:41.217753Z",
        limite: 100000,
      },
      ultimas_transacoes: [
        {
          valor: 10,
          tipo: "c",
          descricao: "descricao",
          realizada_em: "2024-01-17T02:34:38.543030Z",
        },
        {
          valor: 90000,
          tipo: "d",
          descricao: "descricao",
          realizada_em: "2024-01-17T02:34:38.543030Z",
        },
      ],
    };

    reply.send(extrato);
  },
);

app
  .listen({
    host: "0.0.0.0",
    port: 3000,
  })
  .then(() => {
    app.log.info(`🚀 Rinha de Backend Running on port 9999!`);
  });
