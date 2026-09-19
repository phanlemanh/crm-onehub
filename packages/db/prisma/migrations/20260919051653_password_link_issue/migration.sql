-- CreateTable
CREATE TABLE "password_link_issue" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "issuedById" TEXT NOT NULL,
    "issuedByName" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_link_issue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "password_link_issue_email_issuedAt_idx" ON "password_link_issue"("email", "issuedAt");
