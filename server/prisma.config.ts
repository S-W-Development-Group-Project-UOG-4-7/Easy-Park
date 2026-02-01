import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // This is where Prisma 7 looks for your Postgres connection
    url: process.env.DATABASE_URL,
  },
});