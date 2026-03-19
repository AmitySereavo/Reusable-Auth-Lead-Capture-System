-- CreateTable
CREATE TABLE "VerificationDeliveryAttempt" (
    "id" SERIAL NOT NULL,
    "purpose" TEXT NOT NULL DEFAULT 'verification',
    "delivery" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "originalTo" TEXT NOT NULL,
    "rewritten" BOOLEAN NOT NULL DEFAULT false,
    "target" TEXT,
    "successRedirect" TEXT,
    "verificationCodeId" INTEGER,
    "verificationTokenId" INTEGER,
    "ok" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL,
    "providerMessageId" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "errorCategory" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationDeliveryAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VerificationDeliveryAttempt_identifier_idx" ON "VerificationDeliveryAttempt"("identifier");

-- CreateIndex
CREATE INDEX "VerificationDeliveryAttempt_delivery_idx" ON "VerificationDeliveryAttempt"("delivery");

-- CreateIndex
CREATE INDEX "VerificationDeliveryAttempt_channel_idx" ON "VerificationDeliveryAttempt"("channel");

-- CreateIndex
CREATE INDEX "VerificationDeliveryAttempt_provider_idx" ON "VerificationDeliveryAttempt"("provider");

-- CreateIndex
CREATE INDEX "VerificationDeliveryAttempt_status_idx" ON "VerificationDeliveryAttempt"("status");

-- CreateIndex
CREATE INDEX "VerificationDeliveryAttempt_createdAt_idx" ON "VerificationDeliveryAttempt"("createdAt");

-- CreateIndex
CREATE INDEX "VerificationDeliveryAttempt_verificationCodeId_idx" ON "VerificationDeliveryAttempt"("verificationCodeId");

-- CreateIndex
CREATE INDEX "VerificationDeliveryAttempt_verificationTokenId_idx" ON "VerificationDeliveryAttempt"("verificationTokenId");

-- AddForeignKey
ALTER TABLE "VerificationDeliveryAttempt" ADD CONSTRAINT "VerificationDeliveryAttempt_verificationCodeId_fkey" FOREIGN KEY ("verificationCodeId") REFERENCES "VerificationCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationDeliveryAttempt" ADD CONSTRAINT "VerificationDeliveryAttempt_verificationTokenId_fkey" FOREIGN KEY ("verificationTokenId") REFERENCES "VerificationToken"("id") ON DELETE SET NULL ON UPDATE CASCADE;
