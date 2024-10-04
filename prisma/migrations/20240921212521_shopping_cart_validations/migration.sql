/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `like_products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[product_id]` on the table `like_products` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "like_products_user_id_key" ON "like_products"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "like_products_product_id_key" ON "like_products"("product_id");
