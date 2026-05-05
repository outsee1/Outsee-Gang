import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";

/**
 * Integration test for the `orders_recompute_total_insert` trigger.
 *
 * Verifies that any client-supplied `total_price` is overwritten with the
 * authoritative server-side computation: SUM(products.price * quantity).
 *
 * Requires PG* env vars (managed Supabase DB access). Skipped otherwise.
 */

const hasDb = !!process.env.PGHOST;
const d = hasDb ? describe : describe.skip;

const psql = (sql: string) =>
  execSync(`psql -tAc ${JSON.stringify(sql)}`, { encoding: "utf8" }).trim();

/** Run an INSERT inside a transaction that we ROLLBACK so test data does not persist. */
const insertAndRollback = (sql: string): string => {
  const wrapped = `BEGIN;\n${sql};\nROLLBACK;`;
  const out = execSync(`psql -tA <<'PSQL_EOF'\n${wrapped}\nPSQL_EOF`, {
    encoding: "utf8",
    shell: "/bin/bash",
  });
  // psql echoes BEGIN / ROLLBACK lines too; pull the last non-empty line that isn't a status keyword.
  const lines = out.split("\n").map((l) => l.trim()).filter(Boolean);
  const data = lines.find(
    (l) => l !== "BEGIN" && l !== "ROLLBACK" && !l.startsWith("INSERT ")
  );
  return data ?? "";
};

d("orders.total_price server-side recompute", () => {
  it("ignores client-supplied total and recomputes from products.price * quantity", () => {
    const product = psql(
      "SELECT id || '|' || price FROM products ORDER BY created_at LIMIT 1"
    );
    expect(product).toBeTruthy();
    const [productId, priceStr] = product.split("|");
    const unitPrice = Number(priceStr);
    const quantity = 4;
    const expected = unitPrice * quantity;

    const items = JSON.stringify([{ productId, quantity }]).replace(/'/g, "''");
    const inserted = insertAndRollback(
      `INSERT INTO orders (first_name, items, total_price, payment_method, status)
       VALUES ('VITEST_TRIGGER', '${items}'::jsonb, 99999.99, 'Stripe', 'pending')
       RETURNING total_price`
    );

    expect(Number(inserted)).toBeCloseTo(expected, 2);
    expect(Number(inserted)).not.toBe(99999.99);
  });

  it("recomputes to 0 when items reference unknown products", () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const items = JSON.stringify([{ productId: fakeId, quantity: 5 }]).replace(/'/g, "''");
    const inserted = insertAndRollback(
      `INSERT INTO orders (first_name, items, total_price, payment_method, status)
       VALUES ('VITEST_TRIGGER', '${items}'::jsonb, 5000, 'Stripe', 'pending')
       RETURNING total_price`
    );
    expect(Number(inserted)).toBe(0);
  });
});