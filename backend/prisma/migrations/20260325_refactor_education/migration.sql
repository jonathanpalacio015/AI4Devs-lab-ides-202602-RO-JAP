-- CreateTable Education
CREATE TABLE "Education" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "school" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "field" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "candidateId" INTEGER NOT NULL,
    CONSTRAINT "Education_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- AlterTable Candidate
ALTER TABLE "Candidate" DROP COLUMN "education";

-- Add updatedAt to Candidate
ALTER TABLE "Candidate" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add createdAt to Candidate if doesn't exist
ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable Experience to use CASCADE
ALTER TABLE "Experience" DROP CONSTRAINT "Experience_candidateId_fkey";
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Education_candidateId_idx" ON "Education"("candidateId");
