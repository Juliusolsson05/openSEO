# Troubleshooting

Common problems, why they happen, and how to fix them.

---

### App refuses to start: "AUTH_SECRET is required"

You don't have `AUTH_SECRET` set in `.env`. Generate one:

```bash
openssl rand -base64 32
```

Paste the output as the value for `AUTH_SECRET` in your `.env` file.

---

### App refuses to start: "OPENSEO_ENCRYPTION_KEY must decode to exactly 32 bytes"

The encryption key must be valid base64 that decodes to exactly 32 bytes. Generate a correct one:

```bash
openssl rand -base64 32
```

Replace the value in `.env`. If you used a hand-typed string, that's the problem — it needs to be a real base64-encoded 32-byte key.

---

### Setup wizard won't complete

You need at least one valid AI provider API key (OpenAI, Anthropic, or Gemini). The setup wizard tests the key over the network before saving. If it hangs or fails, check that the key is valid and that your machine can reach the provider's API.

---

### Build fails: jsdom/DOMPurify error

A server-rendered page is importing client-side DOMPurify code. Check that server components don't import the full element registration barrel. The fix is usually moving the import behind a dynamic `import()` or into a client component.

---

### Port 4720 already in use

Either another OpenSEO instance is running, or something else grabbed that port. Change it:

```bash
# Via install script
./install.sh --port 8080

# Or manually in .env
PORT=8080
```

---

### Prisma migration errors

In local dev, run:

```bash
npx prisma migrate dev
```

In Docker, migrations run automatically on startup via `docker-entrypoint.sh`. Check the logs if something went wrong:

```bash
docker compose logs app
```

---

### LAN/mobile dev: CORS errors

When testing from another device on your network, set `ALLOWED_DEV_ORIGINS` in `.env` with your LAN IP:

```bash
ALLOWED_DEV_ORIGINS=192.168.1.154
```

Replace with your actual IP. Restart the dev server after changing this.

---

### Health check returns 503

The database is unreachable. Check that Postgres is actually running:

```bash
docker compose ps
docker compose logs postgres
```

If the container is up but the app still can't connect, verify `DATABASE_URL` in `.env` matches the Postgres container's host/port/credentials.
