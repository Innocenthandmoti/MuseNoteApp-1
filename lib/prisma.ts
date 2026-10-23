import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
  pool: Pool;
};

// Lazy initialization function to prevent top-level execution during build collection
function getPrismaClient() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const connectionString = process.env.DATABASE_URL;

  const pool =
    globalForPrisma.pool ||
    new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });

  if (!globalForPrisma.pool) {
    globalForPrisma.pool = pool;
  }

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}

// Export a proxy or getter-wrapped client so imports don't trigger immediate connections
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = getPrismaClient();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
