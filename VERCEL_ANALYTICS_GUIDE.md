# Vercel Web Analytics Implementation Guide

This guide explains how Vercel Web Analytics has been integrated into the cescocomp project.

## What is Vercel Web Analytics?

Vercel Web Analytics is a privacy-first analytics solution that tracks page views and custom events on your website. It's designed to be lightweight and doesn't require any consent management with GDPR compliance built-in.

## Prerequisites

- A Vercel account. If you don't have one, you can [sign up for free](https://vercel.com/signup).
- A Vercel project. If you don't have one, you can [create a new project](https://vercel.com/new).
- The Vercel CLI installed. You can install it using the following command:
  ```bash
  # Using pnpm
  pnpm i vercel
  
  # Using yarn
  yarn i vercel
  
  # Using npm
  npm i vercel
  
  # Using bun
  bun i vercel
  ```

## How Analytics is Implemented in This Project

### Current Implementation

This project uses Vercel Analytics via a CDN import in the main `index.html` file:

```html
<script type="module">
    import { inject } from 'https://cdn.jsdelivr.net/npm/@vercel/analytics/+esm';
    inject();
</script>
```

This approach:
- **No package installation needed**: Analytics are loaded from a CDN
- **Minimal performance impact**: Lightweight script injection
- **Works with static HTML**: Perfect for HTML-based projects
- **Automatic tracking**: Tracks page views and basic metrics out of the box

### Enable Web Analytics in Vercel Dashboard

To see analytics data, you need to enable Web Analytics in your Vercel project:

1. Go to the [Vercel Dashboard](/dashboard)
2. Select your project
3. Click the **Analytics** tab
4. Click **Enable**

> **Note**: Enabling Web Analytics will add new routes (scoped at `/_vercel/insights/*`) after your next deployment.

### Deployment

To deploy this project and start tracking analytics:

```bash
vercel deploy
```

If you haven't already, we recommend [connecting your project's Git repository](/docs/git#deploying-a-git-repository), which will enable Vercel to deploy your latest commits automatically.

### Verify Analytics is Working

Once your app is deployed, you can verify that analytics are working correctly:

1. Visit any page on your deployed site
2. Open your browser's Network tab (Developer Tools)
3. Look for a request to `/_vercel/insights/view`
4. If you see this request, analytics are being tracked successfully

## Viewing Your Data

Once your app is deployed and users have visited your site, you can view your analytics data:

1. Go to your [Vercel Dashboard](/dashboard)
2. Select your project
3. Click the **Analytics** tab
4. After a few days of traffic, you'll be able to view and filter the data

## Adding Custom Events

Users on Pro and Enterprise plans can add custom events to track user interactions like:
- Button clicks
- Form submissions
- Purchases
- Other important user actions

For more information about custom events, see the [custom events documentation](/docs/analytics/custom-events).

## Privacy and Compliance

Vercel Web Analytics is designed with privacy in mind:
- No cookies by default
- GDPR compliant
- No need for cookie consent banners
- Lightweight and performant

Learn more about how Vercel supports [privacy and data compliance standards](/docs/analytics/privacy-policy).

## Troubleshooting

### Analytics not showing requests

If you don't see the `/_vercel/insights/view` request:
1. Make sure the script is properly loaded (check Network tab)
2. Verify that Web Analytics is enabled in your Vercel dashboard
3. Ensure your site is deployed to Vercel (not just running locally)

### No data appearing after deployment

- It can take a few minutes for data to appear
- Ensure users have actually visited your site
- Check that analytics are enabled in your dashboard

For more troubleshooting tips, see the [troubleshooting guide](/docs/analytics/troubleshooting).

## Next Steps

- [Learn more about the `@vercel/analytics` package](/docs/analytics/package)
- [Set up custom events](/docs/analytics/custom-events)
- [Learn about filtering data](/docs/analytics/filtering)
- [Read about privacy and compliance](/docs/analytics/privacy-policy)
- [Explore pricing](/docs/analytics/limits-and-pricing)

## Related Resources

- [Vercel Analytics Documentation](/docs/analytics)
- [Getting Started with Vercel](/docs/getting-started)
- [Vercel Deployment Guide](/docs/deployments)
