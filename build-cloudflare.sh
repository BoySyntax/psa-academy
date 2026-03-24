#!/bin/bash

# Build script for Cloudflare Pages deployment
echo "Building for Cloudflare Pages..."

# Install dependencies
npm ci

# Build the application
npm run build

# Create Cloudflare-specific files
echo "Creating Cloudflare configuration..."

# Update environment variables for production
cat > .env.production << EOF
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_ENVIRONMENT=production
VITE_CDN_PROVIDER=cloudflare
EOF

echo "Build complete! Ready for Cloudflare Pages deployment."
echo ""
echo "Next steps:"
echo "1. Run: npx wrangler pages deploy dist --project-name=psa-academy"
echo "2. Or use the Cloudflare Dashboard to connect your GitHub repo"
