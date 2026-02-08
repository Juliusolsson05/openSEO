import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { analyzeWebsiteAsync } from '@/server/services/website-analyzer'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function parseHost(url: string) {
  try {
    const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`
    return new URL(withProtocol).hostname
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>

    const name = String(body.name ?? '').trim()
    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')
    const passwordConfirm = String(body.password_confirm ?? '')
    const companyName = String(body.company_name ?? '').trim()
    const companyUrl = String(body.company_url ?? '').trim()

    if (!name || !email || !password || !passwordConfirm || !companyName || !companyUrl) {
      return NextResponse.json({ detail: 'All fields are required.' }, { status: 400 })
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json({ detail: 'Please enter a valid email.' }, { status: 400 })
    }

    if (password !== passwordConfirm) {
      return NextResponse.json({ detail: 'Passwords do not match.' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ detail: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    const host = parseHost(companyUrl)
    if (!host) {
      return NextResponse.json({ detail: 'Please enter a valid company URL.' }, { status: 400 })
    }

    const invited = await prisma.user.findUnique({ where: { email } })
    if (!invited || invited.password) {
      return NextResponse.json({ detail: 'This email is not approved for signup yet.' }, { status: 403 })
    }

    const hashed = await bcrypt.hash(password, 10)

    const company = await prisma.company.create({
      data: {
        name: companyName,
        business_type: companyName,
        language: 'en',
        keywords: [],
        website_url: companyUrl,
        settings: {
          onboarding: {
            completed_at: new Date().toISOString(),
          },
        },
      },
    })

    // Fire-and-forget: scrape website and build company profile
    try {
      analyzeWebsiteAsync(company.id, companyUrl)
    } catch {
      // Non-blocking — profile extraction failure shouldn't break registration
    }

    await prisma.user.update({
      where: { id: invited.id },
      data: {
        name,
        password: hashed,
        companyId: company.id,
        userType: 'ADMINISTRATOR',
      },
    })

    return NextResponse.json({ status: 'ok' }, { status: 201 })
  } catch (error) {
    console.error('register error', error)
    return NextResponse.json({ detail: 'Registration failed.' }, { status: 500 })
  }
}
