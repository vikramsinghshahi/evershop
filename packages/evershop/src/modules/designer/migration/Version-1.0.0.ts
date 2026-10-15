import { execute } from '@evershop/postgres-query-builder';
import type { PoolClient } from 'pg';

/**
 * Designers sell artwork through the fabric "Choose design" picker and earn
 * commission on printed lines. The wallet is an append-only ledger in rupees;
 * a balance is always the sum of its entries.
 */
export default async (connection: PoolClient) => {
  await execute(
    connection,
    `CREATE TABLE IF NOT EXISTS "designer_profile" (
      "designer_profile_id" INT GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
      "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
      "customer_id" INT DEFAULT NULL,
      "display_name" varchar(80) NOT NULL,
      "slug" varchar(80) NOT NULL,
      "studio_name" varchar(120) DEFAULT NULL,
      "bio" text DEFAULT NULL,
      "status" varchar NOT NULL DEFAULT 'pending',
      "status_note" text DEFAULT NULL,
      "agreement_version" varchar DEFAULT NULL,
      "agreement_accepted_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
      "payout_method" varchar DEFAULT NULL,
      "payout_paypal_email" varchar DEFAULT NULL,
      "payout_bank" jsonb DEFAULT NULL,
      "commission_rate" decimal(5,2) DEFAULT NULL,
      "gstin" varchar(15) DEFAULT NULL,
      "pan" varchar(10) DEFAULT NULL,
      "verified_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "DESIGNER_PROFILE_UUID_UNIQUE" UNIQUE ("uuid"),
      CONSTRAINT "DESIGNER_PROFILE_CUSTOMER_UNIQUE" UNIQUE ("customer_id"),
      CONSTRAINT "DESIGNER_PROFILE_SLUG_UNIQUE" UNIQUE ("slug"),
      CONSTRAINT "DESIGNER_PROFILE_STATUS_CHECK" CHECK ("status" IN ('pending', 'verified', 'suspended')),
      CONSTRAINT "DESIGNER_PROFILE_PAYOUT_CHECK" CHECK ("payout_method" IS NULL OR "payout_method" IN ('paypal', 'bank')),
      CONSTRAINT "DESIGNER_PROFILE_RATE_CHECK" CHECK ("commission_rate" IS NULL OR ("commission_rate" >= 0 AND "commission_rate" <= 50)),
      CONSTRAINT "FK_DESIGNER_PROFILE_CUSTOMER" FOREIGN KEY ("customer_id") REFERENCES "customer" ("customer_id") ON DELETE SET NULL
    )`
  );

  await execute(
    connection,
    `CREATE TABLE IF NOT EXISTS "designer_design" (
      "designer_design_id" INT GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
      "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
      "designer_profile_id" INT NOT NULL,
      "sku" varchar(20) DEFAULT NULL,
      "name" varchar(80) NOT NULL,
      "description" text DEFAULT NULL,
      "category" varchar(40) NOT NULL,
      "colors" text[] NOT NULL DEFAULT '{}',
      "tags" text[] NOT NULL DEFAULT '{}',
      "repeat_type" varchar(20) NOT NULL DEFAULT 'tile',
      "image" varchar NOT NULL,
      "original_file" varchar NOT NULL,
      "original_name" varchar(200) DEFAULT NULL,
      "file_hash" char(64) NOT NULL,
      "width_px" INT NOT NULL,
      "height_px" INT NOT NULL,
      "dpi" INT DEFAULT NULL,
      "status" varchar NOT NULL DEFAULT 'draft',
      "review_note" text DEFAULT NULL,
      "sales_count" INT NOT NULL DEFAULT 0,
      "submitted_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
      "approved_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "DESIGNER_DESIGN_UUID_UNIQUE" UNIQUE ("uuid"),
      CONSTRAINT "DESIGNER_DESIGN_SKU_UNIQUE" UNIQUE ("sku"),
      CONSTRAINT "DESIGNER_DESIGN_HASH_UNIQUE" UNIQUE ("file_hash"),
      CONSTRAINT "DESIGNER_DESIGN_STATUS_CHECK" CHECK ("status" IN ('draft', 'pending', 'approved', 'rejected', 'hidden', 'withdrawn')),
      CONSTRAINT "FK_DESIGNER_DESIGN_PROFILE" FOREIGN KEY ("designer_profile_id") REFERENCES "designer_profile" ("designer_profile_id") ON DELETE RESTRICT
    )`
  );
  await execute(
    connection,
    `CREATE INDEX IF NOT EXISTS "DESIGNER_DESIGN_LISTING" ON "designer_design" ("status", "approved_at" DESC)`
  );
  await execute(
    connection,
    `CREATE INDEX IF NOT EXISTS "FK_DESIGNER_DESIGN_PROFILE" ON "designer_design" ("designer_profile_id")`
  );

  await execute(
    connection,
    `CREATE TABLE IF NOT EXISTS "designer_payout" (
      "designer_payout_id" INT GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
      "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
      "designer_profile_id" INT NOT NULL,
      "amount" decimal(12,2) NOT NULL,
      "method" varchar NOT NULL,
      "reference" varchar(120) NOT NULL,
      "note" text DEFAULT NULL,
      "paid_by" varchar DEFAULT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "DESIGNER_PAYOUT_UUID_UNIQUE" UNIQUE ("uuid"),
      CONSTRAINT "DESIGNER_PAYOUT_AMOUNT_CHECK" CHECK ("amount" > 0),
      CONSTRAINT "FK_DESIGNER_PAYOUT_PROFILE" FOREIGN KEY ("designer_profile_id") REFERENCES "designer_profile" ("designer_profile_id") ON DELETE RESTRICT
    )`
  );

  // amount is signed: credits positive, debits negative.
  await execute(
    connection,
    `CREATE TABLE IF NOT EXISTS "designer_wallet_entry" (
      "designer_wallet_entry_id" INT GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
      "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
      "designer_profile_id" INT NOT NULL,
      "type" varchar NOT NULL,
      "status" varchar NOT NULL,
      "amount" decimal(12,2) NOT NULL,
      "base_amount" decimal(12,2) DEFAULT NULL,
      "rate" decimal(5,2) DEFAULT NULL,
      "order_id" INT DEFAULT NULL,
      "order_item_id" INT DEFAULT NULL,
      "designer_design_id" INT DEFAULT NULL,
      "designer_payout_id" INT DEFAULT NULL,
      "paid_payout_id" INT DEFAULT NULL,
      "period" varchar(7) DEFAULT NULL,
      "reference" varchar(120) DEFAULT NULL,
      "description" text DEFAULT NULL,
      "currency" varchar(3) DEFAULT NULL,
      "exchange_rate" decimal(12,4) DEFAULT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "DESIGNER_WALLET_ENTRY_UUID_UNIQUE" UNIQUE ("uuid"),
      CONSTRAINT "DESIGNER_WALLET_TYPE_CHECK" CHECK ("type" IN ('commission', 'bonus', 'reversal', 'payout', 'adjustment')),
      CONSTRAINT "DESIGNER_WALLET_STATUS_CHECK" CHECK ("status" IN ('pending', 'available', 'paid', 'void')),
      CONSTRAINT "FK_DESIGNER_WALLET_PROFILE" FOREIGN KEY ("designer_profile_id") REFERENCES "designer_profile" ("designer_profile_id") ON DELETE RESTRICT,
      CONSTRAINT "FK_DESIGNER_WALLET_PAYOUT" FOREIGN KEY ("designer_payout_id") REFERENCES "designer_payout" ("designer_payout_id") ON DELETE RESTRICT,
      CONSTRAINT "FK_DESIGNER_WALLET_PAID_PAYOUT" FOREIGN KEY ("paid_payout_id") REFERENCES "designer_payout" ("designer_payout_id") ON DELETE RESTRICT
    )`
  );
  // One commission per order line, one bonus per designer and month.
  await execute(
    connection,
    `CREATE UNIQUE INDEX IF NOT EXISTS "DESIGNER_WALLET_ONE_COMMISSION"
       ON "designer_wallet_entry" ("order_item_id") WHERE "type" = 'commission'`
  );
  await execute(
    connection,
    `CREATE UNIQUE INDEX IF NOT EXISTS "DESIGNER_WALLET_ONE_BONUS"
       ON "designer_wallet_entry" ("designer_profile_id", "period") WHERE "type" = 'bonus'`
  );
  await execute(
    connection,
    `CREATE UNIQUE INDEX IF NOT EXISTS "DESIGNER_WALLET_ONE_REFUND_REVERSAL"
       ON "designer_wallet_entry" ("order_item_id", "reference") WHERE "type" = 'reversal'`
  );
  await execute(
    connection,
    `CREATE INDEX IF NOT EXISTS "DESIGNER_WALLET_BY_DESIGNER" ON "designer_wallet_entry" ("designer_profile_id", "status")`
  );
  await execute(
    connection,
    `CREATE INDEX IF NOT EXISTS "DESIGNER_WALLET_BY_ORDER" ON "designer_wallet_entry" ("order_id")`
  );

  await execute(
    connection,
    `INSERT INTO "setting" ("name", "value", "is_json") VALUES
       ('designerCommissionRate', '10', FALSE),
       ('designerBonusTiers', '[{"threshold":25000,"percent":3},{"threshold":100000,"percent":5}]', TRUE),
       ('designerHoldDays', '14', FALSE),
       ('designerMinPayout', '500', FALSE)
     ON CONFLICT ("name") DO NOTHING`
  );
};
