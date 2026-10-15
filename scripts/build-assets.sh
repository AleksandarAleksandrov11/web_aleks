#!/usr/bin/env bash
# Empaqueta y minifica JS y CSS, y actualiza el ?v=hash en todas las páginas.
# Fuentes: assets/js/src/ y assets/css/src/main.css  →  assets/js/main.js y assets/css/main.css
# Uso (desde la raíz del repo): bash scripts/build-assets.sh
set -euo pipefail
cd "$(dirname "$0")/.."
ESBUILD="npx -y esbuild@0.24.0"
$ESBUILD assets/js/src/main.js --bundle --minify --format=esm --target=es2020 --outfile=assets/js/main.js --log-level=warning
$ESBUILD assets/css/src/main.css --minify --target=chrome100,safari15,firefox100 --outfile=assets/css/main.css --log-level=warning
cssv=$(sha1sum assets/css/main.css | cut -c1-8)
jsv=$(sha1sum assets/js/main.js | cut -c1-8)
git ls-files '*.html' | xargs sed -i -E "s/main\.css\?v=[0-9a-f]{8}/main.css?v=$cssv/; s/main\.js\?v=[0-9a-f]{8}/main.js?v=$jsv/"
echo "css $cssv ($(wc -c < assets/css/main.css) B) · js $jsv ($(wc -c < assets/js/main.js) B)"
