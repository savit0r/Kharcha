# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest on `master` | ✅ Yes |
| Older branches | ❌ No |

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

If you discover a security vulnerability, please report it privately:

1. Email the maintainer directly (check the GitHub profile)
2. **Or** open a [GitHub Security Advisory](https://github.com/tusharDevelops/Kharcha/security/advisories/new)

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We aim to respond within **72 hours** and will keep you updated as the issue is resolved.

## Security Best Practices for Self-Hosting

- Never commit your `.env` file — use `.env.example` as a template
- Use strong random strings for `JWT_SECRET` and `JWT_REFRESH_SECRET` (min 64 chars)
- Enable SSL/TLS for your PostgreSQL connection
- Run behind a reverse proxy (nginx/Caddy) in production
- Set `NODE_ENV=production` in your deployment environment
