/*
  Warnings:

  - A unique constraint covering the columns `[channel]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_channel_key" ON "User"("channel");
