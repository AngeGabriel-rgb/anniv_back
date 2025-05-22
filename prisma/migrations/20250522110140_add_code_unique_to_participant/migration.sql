-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "code_unique" TEXT,
ALTER COLUMN "password" DROP NOT NULL;
