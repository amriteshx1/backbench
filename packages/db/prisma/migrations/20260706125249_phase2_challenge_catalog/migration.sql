-- CreateEnum
CREATE TYPE "ChallengeDifficulty" AS ENUM ('easy', 'medium', 'hard');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateTable
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" "ChallengeDifficulty" NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'published',
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "template_key" TEXT NOT NULL,
    "test_key" TEXT NOT NULL,
    "max_score" INTEGER NOT NULL DEFAULT 100,
    "time_limit_ms" INTEGER NOT NULL DEFAULT 2000,
    "memory_limit_mb" INTEGER NOT NULL DEFAULT 256,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "challenge_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_tag_links" (
    "challenge_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "challenge_tag_links_pkey" PRIMARY KEY ("challenge_id","tag_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "challenges_slug_key" ON "challenges"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_tags_name_key" ON "challenge_tags"("name");

-- AddForeignKey
ALTER TABLE "challenge_tag_links" ADD CONSTRAINT "challenge_tag_links_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_tag_links" ADD CONSTRAINT "challenge_tag_links_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "challenge_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
