-- This is an empty migration.
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE TABLE IF NOT EXISTS "content_embedding" (
    "id" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "chunk_index" INTEGER NOT NULL DEFAULT 0,
    "content" TEXT NOT NULL,
    "embedding" vector(768) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "content_embedding_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "content_embedding_source_idx" ON "content_embedding" ("source_type","source_id");
CREATE INDEX IF NOT EXISTS "content_embedding_embedding_idx" ON "content_embedding" USING hnsw ("embedding" vector_cosine_ops);
