// Cloudflare Worker for API Proxy
// This worker handles API requests and forwards them to your backend

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Only handle API requests
    if (!url.pathname.startsWith('/api/')) {
      // Forward to Netlify
      return fetch(request);
    }

    // Remove /api prefix for backend
    const backendPath = url.pathname.replace('/api', '');
    const backendUrl = `https://your-backend-domain.com${backendPath}${url.search}`;
    
    // Create new request for backend
    const backendRequest = new Request(backendUrl, {
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

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Forward request to backend
      const response = await fetch(backendRequest);
      
      // Create new response with CORS headers
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...response.headers,
          ...corsHeaders,
        },
      });

      return newResponse;
    } catch (error) {
      // Return error response
      return new Response(
        JSON.stringify({ error: 'Backend unavailable' }),
        {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
  },
};
