---
name: database-schema
description: Recommended database schema for an OpenSEO blog — posts, elements, categories, and optional dictionary tables. Use when setting up the database, creating migrations, or adapting the schema to a different ORM/database.
user-invocable: false
---

# Database Schema

The recommended schema below covers posts, elements, and categories. Adapt the syntax to the user's ORM or database. The examples use Prisma, but the structure maps directly to any relational database or document store.

## Recommended schema

```prisma
model Post {
  id              Int       @id @default(autoincrement())
  titleText       String    @map("title_text")
  slug            String    @unique
  seoTitle        String?   @map("seo_title")
  metaDescription String?   @map("meta_description")
  excerpt         String?
  focusKeyword    String?   @map("focus_keyword")
  status          String    @default("DRAFT") // DRAFT, GENERATED, PUBLISHED
  coverImageUrl   String?   @map("cover_image_url")
  coverImageDesc  String?   @map("cover_image_description")
  publishedAt     DateTime? @map("published_at")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  elements   Element[]
  categories CategoriesOnPosts[]

  @@map("posts")
}

model Element {
  id          Int    @id @default(autoincrement())
  postId      Int    @map("post_id")
  order       Int    // 1-indexed display order
  elementType String @map("element_type") // paragraph, faq, checklist, etc.
  content     Json   // shape depends on elementType

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId, order])
  @@map("elements")
}

model Category {
  id   Int    @id @default(autoincrement())
  name String @unique

  posts CategoriesOnPosts[]

  @@map("categories")
}

model CategoriesOnPosts {
  postId     Int @map("post_id")
  categoryId Int @map("category_id")

  post     Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  category Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@id([postId, categoryId])
  @@map("categories_on_posts")
}
```

## Adapting to other setups

**MongoDB / document store:** Store elements as an embedded array on the post document. No need for a separate collection — the ordered array maps naturally.

```
{
  _id: ...,
  title_text: "...",
  slug: "...",
  elements: [
    { order: 1, element_type: "introduction", content: { text: "..." } },
    { order: 2, element_type: "paragraph", content: { title: "...", text: "..." } }
  ],
  categories: ["SEO", "Analytics"]
}
```

**SQLite without ORM:** Use a JSON column for `content`. SQLite supports JSON functions for querying if needed, but in practice you'll always read the full element set for a post.

**Existing database:** Add the tables alongside what's already there. The schema is self-contained — it doesn't assume anything else exists.

## Key design decisions

- **`content` is a JSON column.** Each element type has a different content shape. Storing as JSON avoids a sprawling schema with columns for every possible field. The rendering engine already handles type-specific parsing.
- **`order` is explicit.** Do not rely on insertion order or array index. Always sort by `order` ascending when rendering.
- **Categories are a many-to-many join.** If the user's blog only needs simple category strings, flatten to a JSON array on the post instead.
- **Cover image lives on the post**, not as an element. It's page-level metadata, not inline content.
- **Cascade deletes.** Deleting a post removes its elements. This is the expected behavior.

## Optional: Dictionary tables

If the user wants dictionary/glossary pages:

```prisma
model Dictionary {
  id       Int    @id @default(autoincrement())
  title    String @unique
  subject  String
  language String @default("en")

  terms Term[]

  @@map("dictionaries")
}

model Term {
  id           Int    @id @default(autoincrement())
  dictionaryId Int    @map("dictionary_id")
  keyword      String
  letter       String // first letter, for alphabetical grouping
  description  String
  focusKeyword String? @map("focus_keyword")
  definition   Json?   // full definition object (title, synonyms, faqs, etc.)

  dictionary Dictionary @relation(fields: [dictionaryId], references: [id], onDelete: Cascade)

  @@unique([dictionaryId, keyword])
  @@map("terms")
}
```

Only add these if the user's blog will have glossary/dictionary features.
