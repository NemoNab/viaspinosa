# Исходники

`sun.js` — «Солнце» (кольцо, шар, однобитное зерно). На сайт идёт собранный `assets/sun.min.js`:
в него входят только нужные части Three.js.

Пересборка:

    npm i esbuild three@0.170.0
    npx esbuild src/sun.js --bundle --format=esm --minify --target=es2019 --legal-comments=none --outfile=assets/sun.min.js
