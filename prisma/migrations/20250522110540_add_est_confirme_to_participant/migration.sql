/*
  Warnings:

  - Added the required column `est_confirme` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Made the column `password` on table `Participant` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "est_confirme" BOOLEAN NOT NULL,
ALTER COLUMN "password" SET NOT NULL,
ALTER COLUMN "emailConfirmed" DROP NOT NULL,
ALTER COLUMN "emailConfirmed" DROP DEFAULT;
