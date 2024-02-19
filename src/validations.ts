import { z } from "zod";

export function validateClientId(params: any) {
  try {
    const clientIdSchema = z.object({ id: z.coerce.number().int() });
    const { id } = clientIdSchema.parse(params);
    return id;
  } catch (err) {
    return null;
  }
}

export function validateTransactionBody(body: any) {
  try {
    const transactionDataBodySchema = z.object({
      valor: z.number().positive(),
      tipo: z.enum(["c", "d"]),
      descricao: z.string().min(1).max(10),
    });
    return transactionDataBodySchema.parse(body);
  } catch (erro) {
    return null;
  }
}
