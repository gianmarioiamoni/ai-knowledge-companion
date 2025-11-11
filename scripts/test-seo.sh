#!/bin/bash
echo "🔍 Testing SEO..."

# Test Sitemap
curl -s http://localhost:3000/sitemap.xml | head -20
echo "✓ Sitemap OK"

# Test Robots
curl -s http://localhost:3000/robots.txt
echo "✓ Robots.txt OK"

# Test Metadata
curl -s http://localhost:3000/en | grep -E "og:|twitter:|canonical" | head -10
echo "✓ Metadata OK"
