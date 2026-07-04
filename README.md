# AAS Marketing — Diseño web premium y crecimiento digital

Web multipágina estática de la agencia **AAS Marketing** (marketing · desarrollo
web). Sin frameworks, sin dependencias, sin build: HTML + CSS + JavaScript
vanilla (módulos ES). Lista para desplegar en **Vercel** o cualquier hosting
estático (Netlify, Cloudflare Pages, GitHub Pages, cPanel…).

## Estructura

```
├── index.html                  Inicio (hero, portfolio, bento, demo, testimonios, IG, FAQ)
├── servicios/                  Todos los servicios (filas interactivas con preview)
│   ├── diseno-web/             Especialidad: diseño web / tiendas / landings
│   └── redes-sociales/         Especialidad: gestión de redes sociales
├── portfolio/                  12 proyectos reales con previews interactivas
├── proceso/                    Proceso de trabajo en 6 fases (línea temporal)
├── agencia/                    Sobre la agencia (identidad, valores, cómo trabaja)
├── faq/                        Preguntas frecuentes (con schema FAQPage)
├── blog/                       “Ideas” — preparado para el futuro (noindex)
├── contacto/                   Formulario validado + WhatsApp + email
├── privacidad/ · cookies/ · aviso-legal/   Textos legales (LSSI-CE + RGPD)
├── 404.html
├── sitemap.xml · robots.txt · vercel.json
└── assets/
    ├── css/main.css            Sistema de diseño completo (tokens, componentes, motion)
    ├── js/main.js              Punto de entrada (módulos ES nativos)
    ├── js/modules/             loader · cursor · scroll · reveal · nav · theme ·
    │                           tilt · rotator · heroCanvas · form · misc · utils
    ├── fonts/                  Manrope variable + Instrument Serif (autoalojadas)
    └── img/
        ├── logo-aas.svg        Logotipo vectorial AAS (tematizable)
        ├── favicon.svg · apple-touch-icon.png · og.jpg
        └── work/               Capturas reales de cada proyecto (webp)
```

El logotipo se renderiza como **máscara CSS con `currentColor`**, por lo que se
adapta solo a los modos claro y oscuro sin duplicar archivos. La intro de carga
reconstruye el logotipo AAS con partículas (Path2D del mismo trazado).

## Configuración actual

- **Dominio:** `https://www.aasmarketing.com` (en canonicals, Open Graph, JSON-LD,
  `sitemap.xml` y `robots.txt`), definido en un único sitio: `SITE.url` en
  `gen/core.mjs`. Si cambia, edítalo ahí y vuelve a ejecutar `node build.mjs`.
- **Correo:** el formulario envía por [FormSubmit](https://formsubmit.co) a
  `aaswebmarketing@gmail.com`. El **primer envío** desde el dominio publicado
  dispara un correo de confirmación de FormSubmit: pulsa “Activate” una vez.
- **Datos legales** (aviso legal, privacidad): titular *Aleksandar Metodiev
  Stefanov*, NIF *X4294288G*, domicilio en Collado Villalba (Madrid). Nombre
  comercial: *AAS Marketing*.

## Despliegue en Vercel

No hay build. Importa el repositorio en Vercel y despliega como **sitio
estático** (framework preset: *Other*, sin comando de build, output = raíz).
El `vercel.json` incluido activa `cleanUrls`, `trailingSlash`, cabeceras de
seguridad y cache larga (`immutable`) para `assets/`.

**Analítica:** activa **Web Analytics** y **Speed Insights** en el panel de
Vercel (pestaña *Analytics* / *Speed Insights* del proyecto). El sitio carga
`/_vercel/insights/script.js` y `/_vercel/speed-insights/script.js`
**solo tras el consentimiento** del banner de cookies (localStorage
`aas_cookie_consent`). Es analítica anónima y sin cookies de rastreo.

## Contenido pendiente (placeholders)

- **Instagram / TikTok**: la sección de redes enlaza a
  [@aas_webmarketing](https://www.instagram.com/aas_webmarketing/) y a
  [TikTok](https://www.tiktok.com/@aas_webmarketing). Son tarjetas de “seguir”,
  no requieren contenido adicional.
- **Portadas del blog**: placeholders `ph-media` en `blog/` (el blog está
  marcado `noindex` hasta que haya artículos).

> La web es de la **agencia**: los datos personales del titular solo aparecen
> en el pie legal, como exige la LSSI-CE, no en el contenido visible.

## Capturas del portfolio

Las imágenes de `assets/img/work/` se generaron automáticamente visitando cada
web real (desktop 1440px, versión alta para el scroll interno del hover y
móvil 390px, exportadas a WebP optimizado). Para regenerarlas, reemplaza los
archivos manteniendo los nombres: `<slug>.webp`, `<slug>-tall.webp`,
`<slug>-mobile.webp`.

## Decisiones de diseño y rendimiento

- **Tema claro/oscuro** con View Transitions API (revelado circular desde el
  interruptor) y respeto de `prefers-color-scheme`. Sin parpadeo: el tema se
  aplica inline en `<head>` antes del CSS. Claves de almacenamiento: `aas_theme`,
  `aas_intro_seen`, `aas_cookie_consent` (solo `localStorage`/`sessionStorage`,
  sin cookies de rastreo).
- **Motion**: intro de partículas que reconstruye el logotipo AAS (solo la
  primera visita de la sesión), cursor con estela en canvas, scroll nativo,
  reveals enmascarados por palabra, tarjetas 3D con brillo, marquees, contadores
  y kinetic typography en el menú. **Todo se desactiva con
  `prefers-reduced-motion`** y en pantallas táctiles lo que no aplica.
- **Rendimiento**: cero dependencias, un solo CSS, módulos ES diferidos, fuentes
  woff2 subsetadas y precargadas, imágenes WebP con `loading="lazy"` y
  dimensiones explícitas, un único bucle `requestAnimationFrame` compartido,
  canvas pausados fuera de pantalla y prefetch de páginas al pasar el cursor.
- **SEO**: metadatos por página, Open Graph + Twitter Cards, JSON-LD
  (`ProfessionalService`, `WebSite`, `Service`, `FAQPage`, `HowTo`,
  `BreadcrumbList`, `CollectionPage`), sitemap, robots, canonicals, jerarquía de
  encabezados semántica y migas de pan.
- **Accesibilidad**: skip-link, `focus-visible`, `aria-current`,
  `aria-expanded`, formularios con errores anunciados (`role="alert"`),
  contraste AA y HTML 100% legible sin JavaScript.

## Desarrollo local

No hay build. Cualquier servidor estático sirve:

```bash
python3 -m http.server 8080
# → http://localhost:8080
```
