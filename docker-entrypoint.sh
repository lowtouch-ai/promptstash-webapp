#!/bin/sh
set -e

echo "🔥 Running cache warming script..."
node /app/scripts/warm-cache.js || echo "⚠️ Cache warming failed, continuing..."

echo "🗺️ Generating sitemap..."
node /app/scripts/generate-sitemap.js || echo "⚠️ Sitemap generation failed, continuing..."

# Copy generated files to nginx html directory
if [ -f /app/public/templates-cache.json ]; then
  cp /app/public/templates-cache.json /usr/share/nginx/html/
  echo "✅ templates-cache.json copied"
fi

if [ -f /app/public/sitemap.xml ]; then
  cp /app/public/sitemap.xml /usr/share/nginx/html/
  echo "✅ sitemap.xml copied"
fi

echo "🚀 Starting nginx..."
exec nginx -g "daemon off;"
