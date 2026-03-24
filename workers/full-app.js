// Cloudflare Worker for full PSA Academy application
// This serves both frontend and handles API requests

import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';

const CACHE_TTL = {
  html: 60 * 5, // 5 minutes
  js: 60 * 60 * 24 * 30, // 30 days
  css: 60 * 60 * 24 * 30, // 30 days
  images: 60 * 60 * 24 * 7, // 7 days
  fonts: 60 * 60 * 24 * 30, // 30 days
};

async function handleAssets(event) {
  const request = event.request;
  const url = new URL(request.url);
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    return handleApi(request);
  }
  
  // Serve static assets
  try {
    return await getAssetFromKV(event, {
      cacheControl: CACHE_TTL,
      mapRequestToAsset: (req) => {
        // First try to match exact file
        return mapRequestToAsset(req);
      },
    });
  } catch (e) {
    // If asset not found, serve index.html for SPA
    let notFoundResponse = await getAssetFromKV(event, {
      mapRequestToAsset: (req) => new Request(`${new URL(req.url).origin}/index.html`, req),
    });
    return notFoundResponse;
  }
}

async function handleApi(request) {
  const url = new URL(request.url);
  const backendUrl = `https://your-backend-domain.com${url.pathname}${url.search}`;
  
  // Forward request to backend
  const response = await fetch(backendUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
  
  // Add CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Return response with CORS
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...Object.fromEntries(response.headers),
      ...corsHeaders,
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    try {
      return await handleAssets({ request, waitUntil: ctx.waitUntil.bind(ctx) });
    } catch (e) {
      return new Response('Error loading resource', { status: 500 });
    }
  },
};
