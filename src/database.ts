import postgres from "postgres";

const config = {
  host: "localhost",
  port: 5432,
  database: "postgres",
  username: "postgres",
  password: "123",
  max: 20,
};

export const db = postgres(config);