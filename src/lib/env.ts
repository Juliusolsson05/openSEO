/**
 * Runtime environment validation.
 *
 * Called once at server boot from instrumentation.ts. Fails fast if any
 * required secret is missing or malformed so the container crashes on start
 * instead of silently running with a baked-in default or a broken vault.
 */

const BUILD_TIME_PLACEHOLDER_AUTH_SECRET = 'build-time-placeholder-not-a-real-secret'

export function assertServerEnv(): void {
  const errors: string[] = []

  const authSecret = process.env.AUTH_SECRET
  if (!authSecret) {
    errors.push('AUTH_SECRET is required (set via --env-file, Docker secret, or orchestrator).')
  } else if (authSecret === BUILD_TIME_PLACEHOLDER_AUTH_SECRET) {
    errors.push('AUTH_SECRET is still the Dockerfile build-time placeholder. Set a real value at runtime.')
  } else if (process.env.NODE_ENV === 'production' && authSecret.length < 32) {
    errors.push('AUTH_SECRET must be at least 32 characters in production.')
  }

  const encKey = process.env.OPENSEO_ENCRYPTION_KEY
  if (!encKey) {
    errors.push('OPENSEO_ENCRYPTION_KEY is required (base64-encoded 32 bytes).')
  } else {
    try {
      const decoded = Buffer.from(encKey, 'base64')
      if (decoded.length !== 32) {
        errors.push(`OPENSEO_ENCRYPTION_KEY must decode to exactly 32 bytes (got ${decoded.length}).`)
      } else if (process.env.NODE_ENV === 'production' && decoded.every((b) => b === decoded[0])) {
        errors.push('OPENSEO_ENCRYPTION_KEY looks like a placeholder (all identical bytes). Generate a real key.')
      }
    } catch {
      errors.push('OPENSEO_ENCRYPTION_KEY is not valid base64.')
    }
  }

  if (errors.length > 0) {
    const msg = [
      '',
      '========================================================================',
      'OpenSEO refused to start: required environment variables are missing or invalid.',
      '',
      ...errors.map((e) => `  - ${e}`),
      '',
      'See .env.example for the full list. Supply secrets via --env-file, Docker',
      'secrets, or your orchestrator (Compose/K8s/Fly/etc.).',
      '========================================================================',
      '',
    ].join('\n')
    // eslint-disable-next-line no-console
    console.error(msg)
    process.exit(1)
  }
}
