-- AlterTable
ALTER TABLE "forgot_passwords" ALTER COLUMN "reset_token" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "user_tokens" ALTER COLUMN "token" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role_id" SET DEFAULT 1;
