# Gold Price Tracker

Real-time gold price comparison from Indian jewellers with live rates from IBJA, Kalyan Jewellers, Bhima Gold, and P N Gadgil & Sons.

## Features

- **Live Gold Prices**: Real-time rates from multiple sources
  - IBJA (Official Jewellers Reference)
  - Yahoo Finance (International, converted to INR)
  - Kalyan Jewellers (AJAX API)
  - Bhima Jewellers (Homepage scraping)
  - P N Gadgil & Sons (API)
- **Price Comparison**: See how different jewellers compare
- **WebSocket Updates**: Real-time price updates via Socket.IO

## Tech Stack

- **API**: Express.js + TypeScript
- **Web**: Next.js 14 + React + TailwindCSS
- **State**: Zustand + React Query
- **Real-time**: Socket.IO

## Project Structure

```
gold-price-tracker/
├── apps/
│   ├── api/                    # Express API server
│   │   ├── src/
│   │   │   ├── index.ts        # Entry point
│   │   │   ├── routes/
│   │   │   │   ├── prices.ts   # /api/prices/* endpoints
│   │   │   │   └── platforms.ts # /api/platforms endpoint
│   │   │   ├── services/
│   │   │   │   ├── spotPrice.ts         # Gold price fetching (IBJA, Yahoo, Jewellers)
│   │   │   │   ├── realTimePriceFetcher.ts # Platform-specific pricing
│   │   │   │   ├── livePriceFetcher.ts  # Live product data
│   │   │   │   ├── database.ts          # Prisma (optional)
│   │   │   │   └── redis.ts             # Cache (optional)
│   │   │   └── utils/
│   │   │       └── logger.ts    # Winston logger
│   │   └── prisma/
│   │       └── schema.prisma    # Database schema (optional)
│   │
│   └── web/                     # Next.js frontend
│       └── src/
│           ├── app/             # Next.js app router
│           │   ├── page.tsx     # Home page
│           │   └── layout.tsx   # Root layout
│           ├── components/
│           │   ├── SpotPriceCard.tsx    # Price display
│           │   ├── DealsList.tsx        # Deals list
│           │   ├── PlatformGrid.tsx     # Platform badges
│           │   └── AlertBanner.tsx      # Deal alerts
│           ├── lib/
│           │   ├── api.ts       # Axios client
│           │   └── socket.tsx   # Socket.IO client
│           └── stores/
│               └── socketStore.ts # Zustand store
│
├── package.json                 # Root package.json
├── turbo.json                   # Turborepo config
└── tsconfig.base.json          # Shared TypeScript config
```

## Quick Start

```bash
# Install dependencies
npm install

# Start both API and Web servers
npm run dev

# Or start individually
npm run dev:api  # API on http://localhost:3001
npm run dev:web  # Web on http://localhost:4001
```

## Environment Variables

Create a `.env` file in the root (see `.env.example`):

```env
PORT=3001
CORS_ORIGINS="http://localhost:3000,http://localhost:4001"
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
```

Database and Redis are optional - the app runs in standalone mode without them.

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /api/prices/spot` | Current spot prices from all sources |
| `GET /api/prices/deals` | Best deals compared to IBJA |
| `GET /api/platforms` | Monitored platforms list |

## Adding a New Jeweller

1. Edit `apps/api/src/services/spotPrice.ts`:
   - Add interface to `JewellerRates`
   - Create fetch function (e.g., `fetchNewJewellerRates()`)
   - Add to `fetchJewellerRates()` Promise.all

2. Update `apps/web/src/components/SpotPriceCard.tsx`:
   - Add interface for the new jeweller
   - Add UI section in the component

Example fetch function:
```typescript
async function fetchNewJewellerRates(): Promise<void> {
  try {
    const response = await axios.get('https://jeweller-api.com/rates');
    currentJewellerRates.newJeweller = {
      gold22k: response.data.rate22k,
      gold24k: response.data.rate24k,
      timestamp: new Date(),
      source: 'New Jeweller',
    };
  } catch (error) {
    logger.warn('New Jeweller rates fetch failed');
  }
}
```

## Modifying Price Sources

### IBJA Rates
File: `apps/api/src/services/spotPrice.ts` - `fetchIBJARate()`
Source: https://ibjarates.com (HTML scraping)

### Yahoo Finance
File: `apps/api/src/services/spotPrice.ts` - `fetchYahooGoldPrice()`
Uses: GC=F (Gold Futures), converts USD/oz to INR/g

### Kalyan Jewellers
File: `apps/api/src/services/spotPrice.ts` - `fetchKalyanRates()`
API: POST to `/kalyan_gold_rates/ajax/get_rate`
Note: Rates are per 10 grams, divided by 10 for per-gram display

### Bhima Jewellers
File: `apps/api/src/services/spotPrice.ts` - `fetchBhimaRates()`
Source: Homepage HTML contains `metalrate2` JSON

### P N Gadgil
File: `apps/api/src/services/spotPrice.ts` - `fetchPNGRates()`
API: `goldpriceeditor.droidinfinity.com/api/external/metal-prices/1085`

## Frontend Components

### SpotPriceCard
Displays all price sources with color-coded sections:
- Gold (IBJA) - Official reference
- Blue (International) - Yahoo Finance
- Green (PNG) - P N Gadgil
- Amber (Bhima) - Bhima Jewellers
- Rose (Kalyan) - Kalyan Jewellers

### DealsList
Shows products sorted by discount from IBJA price.

## Common Tasks

### Change Refresh Interval
Edit `apps/api/src/services/spotPrice.ts`:
```typescript
setInterval(fetchAllPrices, 60000); // 60 seconds
```

### Add Platform to Deals
Edit `apps/api/src/services/realTimePriceFetcher.ts`:
- Add platform to `trackedPlatforms` array
- Add pricing logic in `getIBJABasedPrices()`

### Modify UI Colors
Edit `apps/web/tailwind.config.js` or component directly.
Gold colors use `gold-*` custom classes defined in config.

## Deployment

This app can be deployed to free hosting platforms with custom URLs.

### Quick Deploy

**Backend (Express API)**: [Render.com](https://render.com) - Free tier, auto-sleep after 15min
**Frontend (Next.js Web)**: [Vercel.com](https://vercel.com) - Free tier, unlimited

See [GITHUB_SETUP.md](./GITHUB_SETUP.md) for GitHub push instructions.
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment walkthrough.

**Expected URLs after deployment:**
- Frontend: `https://gold-tracker-web.vercel.app`
- Backend: `https://gold-tracker-api.onrender.com`

### Deployment Steps Summary

1. **Push to GitHub**: [GITHUB_SETUP.md](./GITHUB_SETUP.md)
2. **Deploy Backend**: `npm run start --workspace=@gold-tracker/api` on Render
3. **Deploy Frontend**: Next.js on Vercel with `NEXT_PUBLIC_API_URL` pointing to Render
4. **Set Environment Variables**: See `.env.example`

## Troubleshooting

**API not starting locally?**
- Check if port 3001 is free: `lsof -i :3001`
- Set `NODE_TLS_REJECT_UNAUTHORIZED=0` for HTTPS issues

**Prices showing 0?**
- Check network connectivity to price sources
- Review logs in console for fetch errors
- Note: Bhima rates use fallback on free hosting (Cloudflare WAF blocks automated requests)

**WebSocket not connecting?**
- Ensure API is running before starting web
- Check CORS_ORIGINS includes web URL
- Check browser console for connection errors

**Deployment issues?**
- See [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
- Ensure environment variables are set correctly
- Check Render backend cold start (first request may take 10-30s)

## License

MIT
