# Upstash Redis Setup Guide

This guide explains how to set up Upstash Redis for rate limiting in the AI Knowledge Companion application.

## 📋 Table of Contents

- [What is Upstash Redis?](#what-is-upstash-redis)
- [Why Upstash?](#why-upstash)
- [Setup Steps](#setup-steps)
- [Configuration](#configuration)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## What is Upstash Redis?

Upstash is a serverless Redis database service that offers:
- ✅ **Serverless**: Pay only for what you use
- ✅ **Edge-ready**: Global replication for low latency
- ✅ **REST API**: Works with serverless platforms (Vercel, AWS Lambda, etc.)
- ✅ **Free tier**: 10,000 commands/day free forever

## Why Upstash?

For rate limiting, we need a fast, globally accessible key-value store. Upstash Redis is perfect because:

1. **Serverless-native**: Works seamlessly with Next.js serverless functions
2. **Low latency**: Edge locations worldwide ensure fast response times
3. **Cost-effective**: Free tier covers most small to medium applications
4. **Simple REST API**: No connection pooling or TCP connection management
5. **Built-in analytics**: Track rate limit hits and patterns

## Setup Steps

### Step 1: Create Upstash Account

1. Go to [https://upstash.com/](https://upstash.com/)
2. Sign up with GitHub, Google, or email
3. Verify your email address

### Step 2: Create Redis Database

1. Click "Create Database" in the Upstash dashboard
2. Choose configuration:
   - **Name**: `ai-companion-rate-limit` (or any name you prefer)
   - **Type**: `Regional` (cheaper) or `Global` (lower latency worldwide)
   - **Region**: Choose closest to your users (or multiple regions for Global)
   - **TLS**: Keep enabled for security

3. Click "Create"

### Step 3: Get Connection Details

After creating the database:

1. In the database dashboard, scroll to "REST API" section
2. Copy these two values:
   - **UPSTASH_REDIS_REST_URL**: The REST API endpoint
   - **UPSTASH_REDIS_REST_TOKEN**: Your authentication token

### Step 4: Add to Environment Variables

Add to your `.env.local` file:

```bash
# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL=https://your-database-name.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

**⚠️ IMPORTANT**: 
- Never commit these values to git
- Use different databases for development and production
- Keep your token secret

### Step 5: Install Dependencies

Dependencies are already installed if you've run the setup, but if needed:

```bash
pnpm add @upstash/ratelimit @upstash/redis
```

### Step 6: Restart Development Server

Restart your Next.js development server for environment variables to take effect:

```bash
# Stop the current server (Ctrl+C)
# Then start again
pnpm dev
```

## Configuration

### Rate Limit Types

The application uses different rate limits for different endpoint types:

| Type | Default Limit | Window | Use Case |
|------|---------------|--------|----------|
| `auth` | 5 requests | 1 minute | Login/signup (brute force prevention) |
| `ai` | 10 requests | 1 minute | OpenAI API calls (cost protection) |
| `upload` | 5 uploads | 5 minutes | File uploads (spam prevention) |
| `admin` | 30 requests | 1 minute | Admin operations |
| `api` | 60 requests | 1 minute | General API endpoints |

### Role-Based Multipliers

Higher-privileged users get higher limits:

- **user**: 1x (normal limits)
- **admin**: 3x limits
- **super_admin**: 10x limits

### Custom Limits

To adjust limits, edit `src/lib/rate-limit/config.ts`:

```typescript
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  ai: {
    limit: 20, // Change this
    window: '1m', // Or this (1m, 60s, 1h, etc.)
  },
  // ... other types
}
```

## Testing

### Test 1: Verify Redis Connection

Check if rate limiting is active:

```bash
# Make a request to any protected endpoint
curl http://localhost:3000/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{"message":"test","tutor_id":"...","conversation_id":"..."}'
```

Look for rate limit headers in the response:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: When the limit resets

### Test 2: Trigger Rate Limit

Make multiple rapid requests to see rate limiting in action:

```bash
# Run this 15 times quickly
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/chat/send \
    -H "Content-Type: application/json" \
    -d '{"message":"test '$i'"}' \
    -i
done
```

After the 11th request (ai limit is 10/minute), you should see:
- HTTP status: `429 Too Many Requests`
- `Retry-After` header with seconds to wait

### Test 3: Check Logs

Start your dev server and look for:

```
✅ Redis initialized for rate limiting
```

If you see this, Redis is configured correctly.

If you see:
```
⚠️  Upstash Redis not configured. Rate limiting will be disabled.
```

Then check your environment variables.

## Troubleshooting

### Rate Limiting Not Working

**Problem**: No rate limit headers in responses

**Solutions**:
1. Check environment variables are set:
   ```bash
   echo $UPSTASH_REDIS_REST_URL
   ```

2. Restart dev server after adding variables

3. Check Upstash dashboard for errors

4. Look for Redis initialization log in console

### Connection Errors

**Problem**: `Failed to initialize Redis` error

**Solutions**:
1. Verify URL and token are correct (no extra spaces)
2. Check Upstash database is active (not paused)
3. Test connection directly:
   ```bash
   curl $UPSTASH_REDIS_REST_URL/ping \
     -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"
   ```
   Should return: `{"result":"PONG"}`

### Rate Limits Too Strict/Loose

**Problem**: Users hitting limits too quickly or not at all

**Solutions**:
1. Adjust limits in `src/lib/rate-limit/config.ts`
2. Increase window duration for less strict limits
3. Use role-based multipliers for power users
4. Consider separate limits for different user tiers

### Development vs Production

**Best Practice**: Use separate Redis databases

Development `.env.local`:
```bash
UPSTASH_REDIS_REST_URL=https://dev-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=dev_token
```

Production (Vercel environment variables):
```bash
UPSTASH_REDIS_REST_URL=https://prod-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=prod_token
```

## Free Tier Limits

Upstash free tier includes:
- **10,000 commands/day**
- **1 database**
- **10 MB data**
- **Basic analytics**

This is sufficient for:
- ~200 active users/day
- ~50 requests/user/day
- Small to medium applications

For larger applications, consider:
- **Pay-as-you-go**: $0.2 per 100K commands
- **Pro plan**: $10/month for unlimited commands

## Monitoring

### Upstash Dashboard

Monitor your rate limiting in the Upstash dashboard:

1. Go to your database
2. Click "Analytics" tab
3. View:
   - Commands/second
   - Bandwidth usage
   - Top commands
   - Error rates

### Application Logs

Rate limit hits are logged:

```
[RATE_LIMIT_HIT] {
  identifier: 'user:***',
  type: 'ai',
  endpoint: '/api/chat/send',
  timestamp: '2024-01-15T10:30:00Z'
}
```

Use these logs to:
- Identify abuse patterns
- Adjust limits
- Monitor API usage

## Security Best Practices

1. **Never expose tokens**: Keep `UPSTASH_REDIS_REST_TOKEN` secret
2. **Use TLS**: Always enable TLS in production
3. **Rotate tokens**: Regenerate tokens periodically
4. **Monitor access**: Check Upstash logs for suspicious activity
5. **Separate databases**: Use different DBs for dev/staging/prod

## Cost Optimization

Tips to stay within free tier:

1. **Set appropriate limits**: Don't check rate limits on every request if not needed
2. **Use edge caching**: Cache responses when possible
3. **Batch operations**: Combine related checks
4. **Clean up old data**: Use TTL to auto-expire old keys

## Next Steps

After setup:

1. ✅ Test rate limiting on all protected endpoints
2. ✅ Adjust limits based on your needs
3. ✅ Monitor usage in Upstash dashboard
4. ✅ Set up alerts for high usage
5. ✅ Document your rate limit policies for users

## Support

- **Upstash Docs**: https://upstash.com/docs
- **Upstash Discord**: https://upstash.com/discord
- **Rate Limiting Guide**: `docs/RATE_LIMITING_GUIDE.md`
- **Implementation Details**: `docs/SECURITY_IMPROVEMENTS_IMPLEMENTATION.md`

