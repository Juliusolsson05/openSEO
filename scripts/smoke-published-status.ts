/**
 * Smoke test: verify TitleStatus.PUBLISHED round-trips through Postgres.
 *
 * The repo has no test runner configured (no vitest/jest), so this is a
 * runnable standalone script. Run against a dev database:
 *
 *   DATABASE_URL=postgres://... npx tsx scripts/smoke-published-status.ts
 *
 * It creates a Company + BlogPost with status = PUBLISHED, re-queries by
 * that status, then cleans up. If the `20260405000000_add_published_to_title_status`
 * migration has not been applied, the INSERT will throw:
 *     invalid input value for enum "TitleStatus": "PUBLISHED"
 *
 * Exit code 0 on success, non-zero on any assertion failure.
 */

import { PrismaClient, TitleStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('TitleStatus values from @prisma/client:', Object.values(TitleStatus))
  if (!Object.values(TitleStatus).includes('PUBLISHED' as TitleStatus)) {
    throw new Error('Prisma client does not expose TitleStatus.PUBLISHED — run `prisma generate`')
  }

  const company = await prisma.company.create({
    data: {
      name: `published-enum-smoke-${Date.now()}`,
      business_type: 'test',
      language: 'en',
    },
  })

  let postId: number | undefined
  try {
    const post = await prisma.blogPost.create({
      data: {
        companyId: company.id,
        title_text: 'Published smoke post',
        slug: `published-smoke-${Date.now()}`,
        status: TitleStatus.PUBLISHED,
      },
    })
    postId = post.id

    if (post.status !== 'PUBLISHED') {
      throw new Error(`expected status PUBLISHED, got ${post.status}`)
    }

    const rows = await prisma.blogPost.findMany({
      where: { companyId: company.id, status: TitleStatus.PUBLISHED },
      select: { id: true, status: true },
    })
    if (rows.length !== 1 || rows[0].status !== 'PUBLISHED') {
      throw new Error(`expected 1 PUBLISHED row, got ${JSON.stringify(rows)}`)
    }

    console.log('OK — BlogPost round-trips with status PUBLISHED')
  } finally {
    if (postId) await prisma.blogPost.deleteMany({ where: { id: postId } })
    await prisma.company.delete({ where: { id: company.id } }).catch(() => {})
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
