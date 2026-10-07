# DevToolsHub — Production Launch Checklist

## Current Production

| Item | Value |
|---|---|
| Service | `devtoolshub` (Cloud Run, `us-central1`) |
| Project | `fanclash-prod` |
| URL | `https://devtoolshub-992548687225.us-central1.run.app` |
| Custom domain | Not yet configured |
| Image | `us-central1-docker.pkg.dev/fanclash-prod/devtoolshub/app:latest` |

---

## Pre-Deploy Checklist

### Code Quality
```bash
npx tsc --noEmit          # TypeScript — must be clean
npx jest --no-coverage    # All tests — must pass (762+ expected)
npm run build             # Production build — must succeed
npm audit --omit=dev      # Production runtime audit — must be clean
```

### Security
- [ ] No secrets committed to Git (`git log --all --oneline | head -20` + `git diff HEAD`)
- [ ] `npm audit --omit=dev` — zero critical/high in production deps
- [ ] No `eval()` or `new Function()` in `src/`
- [ ] `dangerouslySetInnerHTML` only in `JsonLd.tsx` (static schema data, not user input)

---

## Deploy

```bash
# 1. Build and push (linux/amd64 required for Cloud Run)
docker buildx build \
  --platform linux/amd64 \
  -t us-central1-docker.pkg.dev/fanclash-prod/devtoolshub/app:latest \
  --push .

# 2. Deploy
gcloud run deploy devtoolshub \
  --image us-central1-docker.pkg.dev/fanclash-prod/devtoolshub/app:latest \
  --region us-central1 \
  --project fanclash-prod
```

---

## Post-Deploy Smoke Test

```bash
BASE="https://devtoolshub-992548687225.us-central1.run.app"
for p in "/" "/tools/json-formatter" "/tools/sql-formatter" \
          "/tools/jwt-decoder" "/tools/password-generator" \
          "/tools/category/json" "/sitemap.xml" "/robots.txt" \
          "/privacy" "/terms" "/about" "/contact"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$p")
  echo "$code $p"
done
```

Expected: all 200.

### Verify Security Headers
```bash
curl -sI https://devtoolshub-992548687225.us-central1.run.app/ | \
  grep -i "strict-transport\|x-content-type\|x-frame\|referrer\|permissions\|content-security"
```

Expected: all 6 headers present.

### Verify Static Asset Caching
```bash
# Get a chunk URL from the homepage HTML, then check its Cache-Control
curl -s https://devtoolshub-992548687225.us-central1.run.app/ | \
  grep -o '"/_next/static/[^"]*\.js"' | head -1
# Then: curl -sI "https://...run.app/<chunk_url>" | grep cache-control
```

Expected: `public, max-age=31536000, immutable`

---

## Rollback

```bash
# List recent revisions
gcloud run revisions list \
  --service devtoolshub \
  --region us-central1 \
  --project fanclash-prod

# Roll back to a specific revision
gcloud run services update-traffic devtoolshub \
  --to-revisions devtoolshub-XXXXX-xxx=100 \
  --region us-central1 \
  --project fanclash-prod
```

---

## Environment Variables

Set via `gcloud run services update --set-env-vars`:

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | YES | Canonical domain for sitemap, robots, metadata |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional | GA4 tracking (format: `G-XXXXXXXXXX`) |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Optional | AdSense publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXX`) |
| `NODE_ENV` | YES | Set to `production` (already in Dockerfile) |

### Set env vars
```bash
gcloud run services update devtoolshub \
  --region us-central1 \
  --project fanclash-prod \
  --set-env-vars "NEXT_PUBLIC_SITE_URL=https://toolforge.dev,NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX"
```

---

## Google Search Console Setup

1. Go to https://search.google.com/search-console
2. Add property → **URL prefix** → enter `https://devtoolshub-992548687225.us-central1.run.app`
3. Verify via HTML tag (add to `<head>` in `layout.tsx` as `other: { 'google-site-verification': 'TOKEN' }`)
4. Submit sitemap: `https://devtoolshub-992548687225.us-central1.run.app/sitemap.xml`
5. Request indexing for: `/`, `/tools/json-formatter`, `/tools/base64-encoder`
6. Monitor Coverage report for errors

When custom domain is live, add as a separate property and resubmit sitemap.

---

## Google AdSense Setup

1. Apply at https://www.google.com/adsense
2. Add site: enter production URL
3. Add publisher code to site:
   - Set `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX` in Cloud Run env vars
   - The `AdSenseScript` component automatically loads when the env var is set
4. Submit for review — typically takes 1–14 days
5. After approval, add `AdSlot` components to homepage and tool pages with your slot IDs

**Do not claim AdSense approval until Google grants it.**

---

## Custom Domain Setup (toolforge.dev)

When the domain is purchased and DNS is configurable:

```bash
# Map custom domain to Cloud Run service
gcloud run domain-mappings create \
  --service devtoolshub \
  --domain toolforge.dev \
  --region us-central1 \
  --project fanclash-prod

# Check DNS records to add
gcloud run domain-mappings describe \
  --domain toolforge.dev \
  --region us-central1 \
  --project fanclash-prod
```

Then:
1. Add DNS records at your registrar (A + AAAA records)
2. Wait for TLS certificate provisioning (Google manages it automatically)
3. Update `NEXT_PUBLIC_SITE_URL=https://toolforge.dev` in Cloud Run env vars
4. Optionally update Search Console with new domain property

---

## Cloud Run Scaling

Current configuration:
- CPU: 1 vCPU | Memory: 1Gi | Concurrency: 80
- Min instances: 0 | Max instances: 10

For sustained traffic (10k+ daily visitors), consider:
```bash
gcloud run services update devtoolshub \
  --min-instances 1 \
  --region us-central1 \
  --project fanclash-prod
```
Min=1 eliminates cold starts but adds ~$15/month fixed cost.

---

## Monitoring

- **Cloud Run metrics**: https://console.cloud.google.com/run/detail/us-central1/devtoolshub/metrics?project=fanclash-prod
- **Logs**: https://console.cloud.google.com/run/detail/us-central1/devtoolshub/logs?project=fanclash-prod
- **GA4**: https://analytics.google.com (after GA_MEASUREMENT_ID is configured)
- **Search Console**: https://search.google.com/search-console

### Useful log query (Cloud Console → Logs Explorer):
```
resource.type="cloud_run_revision"
resource.labels.service_name="devtoolshub"
severity>=ERROR
```
