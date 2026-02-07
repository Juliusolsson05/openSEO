/**
 * File-based store for synced content.
 *
 * Synced posts and dictionaries are persisted to a JSON file so they survive
 * dev-server restarts. The example site reads from both this store and the
 * static fixtures — synced data takes priority (by slug/id).
 *
 * Customers would replace this with their own database. The store interface
 * is intentionally simple: upsert + delete + list.
 */
import fs from 'node:fs'
import path from 'node:path'
import type { ExampleDictionary, ExamplePost } from './types'

const STORE_DIR = path.join(process.cwd(), '.example-store')
const POSTS_FILE = path.join(STORE_DIR, 'posts.json')
const DICTIONARIES_FILE = path.join(STORE_DIR, 'dictionaries.json')

function ensureDir() {
  if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true })
}

// ─── Posts ──────────────────────────────────────────────────────────

function readPosts(): ExamplePost[] {
  if (!fs.existsSync(POSTS_FILE)) return []
  try {
    return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8')) as ExamplePost[]
  } catch {
    return []
  }
}

function writePosts(posts: ExamplePost[]) {
  ensureDir()
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2))
}

export function getSyncedPosts(): ExamplePost[] {
  return readPosts()
}

export function upsertSyncedPost(post: ExamplePost): ExamplePost {
  const posts = readPosts()
  const idx = posts.findIndex((p) => p.slug === post.slug || p.id === post.id)
  if (idx >= 0) {
    posts[idx] = post
  } else {
    posts.push(post)
  }
  writePosts(posts)
  return post
}

export function deleteSyncedPost(slug: string): boolean {
  const posts = readPosts()
  const filtered = posts.filter((p) => p.slug !== slug)
  if (filtered.length === posts.length) return false
  writePosts(filtered)
  return true
}

// ─── Dictionaries ───────────────────────────────────────────────────

function readDictionaries(): ExampleDictionary[] {
  if (!fs.existsSync(DICTIONARIES_FILE)) return []
  try {
    return JSON.parse(fs.readFileSync(DICTIONARIES_FILE, 'utf-8')) as ExampleDictionary[]
  } catch {
    return []
  }
}

function writeDictionaries(dicts: ExampleDictionary[]) {
  ensureDir()
  fs.writeFileSync(DICTIONARIES_FILE, JSON.stringify(dicts, null, 2))
}

export function getSyncedDictionaries(): ExampleDictionary[] {
  return readDictionaries()
}

export function upsertSyncedDictionary(dict: ExampleDictionary): ExampleDictionary {
  const dicts = readDictionaries()
  const idx = dicts.findIndex((d) => d.id === dict.id)
  if (idx >= 0) {
    dicts[idx] = dict
  } else {
    dicts.push(dict)
  }
  writeDictionaries(dicts)
  return dict
}

export function deleteSyncedDictionary(dictId: string): boolean {
  const dicts = readDictionaries()
  const filtered = dicts.filter((d) => d.id !== dictId)
  if (filtered.length === dicts.length) return false
  writeDictionaries(filtered)
  return true
}
