-- CreateTable
CREATE TABLE "public"."BlacklistWord" (
    "id" SERIAL NOT NULL,
    "phrase" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,

    CONSTRAINT "BlacklistWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WhitelistWord" (
    "id" SERIAL NOT NULL,
    "phrase" TEXT NOT NULL,

    CONSTRAINT "WhitelistWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EvaluationLog" (
    "id" SERIAL NOT NULL,
    "input_text" TEXT NOT NULL,
    "masked_text" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "contains_profanity" BOOLEAN NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlacklistWord_phrase_key" ON "public"."BlacklistWord"("phrase");

-- CreateIndex
CREATE UNIQUE INDEX "WhitelistWord_phrase_key" ON "public"."WhitelistWord"("phrase");
