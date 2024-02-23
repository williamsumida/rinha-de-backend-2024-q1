import { Pool, Client } from "pg";

const config = {
  host: "postgres",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: "123",
  max: 13,
};

export const pool = new Pool(config);
//export const client = new Client(config);
//client.connect();
