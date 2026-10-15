# Fuentes de JS y CSS

La web sirve un único `assets/js/main.js` y un único `assets/css/main.css`,
empaquetados y minificados. Se editan aquí (`assets/js/src/`, `assets/css/src/main.css`)
y se regeneran con:

    bash scripts/build-assets.sh

El script también actualiza el `?v=hash` de las páginas para que nadie vea versiones en caché.
