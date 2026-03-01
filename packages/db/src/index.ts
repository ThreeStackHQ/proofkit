import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export * from "./schema";
export { createId } from "@paralleldrive/cuid2";
export {
  eq, and, or, gt, lt, gte, lte, desc, asc, count, sql,
  isNull, isNotNull, inArray, between
} from "drizzle-orm";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return drizzle(postgres(url, { max: 10 }), { schema });
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    if (!_db) _db = createDb();
    return (_db as any)[prop];
  },
});
