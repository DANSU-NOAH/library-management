
import postgres from "postgres";

const globalForSql = globalThis as unknown as {
  sql?: ReturnType<typeof postgres>;
};

function getSql() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is missing. Check your Vercel environment variables.");
  }

  return postgres(connectionString, {
    ssl: "require",
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

export const sql = globalForSql.sql ?? getSql();

if (process.env.NODE_ENV !== "production") {
  globalForSql.sql = sql;
}

