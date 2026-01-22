import "dotenv/config";

export default {
  schema: "./prisma/schema.prisma",
  datasource: {
    adapter: "postgresql",
    url: process.env.DATABASE_URL,
  },
};
