/*
  Warnings:

  - You are about to drop the column `roleid` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `_ProductToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProductToUser" DROP CONSTRAINT "_ProductToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToUser" DROP CONSTRAINT "_ProductToUser_B_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "roleid";

-- DropTable
DROP TABLE "_ProductToUser";
