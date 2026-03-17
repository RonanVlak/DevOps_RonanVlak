#!/bin/sh
set -e
API_URL="${API_URL:-http://localhost:3000}"
mkdir -p /usr/share/nginx/html/assets
cat > /usr/share/nginx/html/assets/env.js <<EOF
window.__env = { API_URL: "${API_URL}" };
EOF
exec "$@"