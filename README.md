This is a [Next.js](https://nextjs.org) landing page project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Environment Variables

Create `.env.local` and set the following:

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_HOTJAR_ID=XXXXXXXX
NEXT_PUBLIC_HOTJAR_SV=6
```

## Analytics
- GA4 is injected via `app/providers/AnalyticsProvider.tsx` using `next/script`.
- Hotjar is conditionally loaded when envs are present.
- UTM parameters are captured once and stored in `sessionStorage.utm_params`.

## Mobile-first fixed aspect layout
- Wrap pages with `components/MobileFrame.tsx` to lock to a mobile canvas (default 390x844) while scaling on desktop.

## Git & Vercel
1. Initialize git and push:
   ```bash
   git init
   git add .
   git commit -m "chore: initial scaffold with mobile frame and analytics"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. Import the repo into Vercel and set env vars in Project Settings → Environment Variables.
3. Deploy. Preview and Production URLs will be created. Ensure `NEXT_PUBLIC_SITE_URL` matches the Production domain for sitemap/robots.
