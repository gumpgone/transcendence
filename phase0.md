# Phase 0 — SPA TS + Tailwind + Docker (no backend yet)

Goal (end of Week 1 per docs/Idea1.md): 
- SPA TypeScript + Tailwind, router, pages: Login, Lobby, Match, Chat, Profile.
- Canvas placeholder on Match page (you can migrate chatgptpong later).
- Runs in Docker with a single command.
- Firefox-compatible, no unhandled errors.

Prereqs (campus):
- Node v18.20.4, npm 10.7.0
- Docker installed (rootless ok)

## 1) Scaffold SPA (vanilla TypeScript)

In repo root:
- Create a web/ app with Vite vanilla-ts template.

```sh
npm create vite@latest web -- --template vanilla-ts
cd web
npm i -D tailwindcss @tailwindcss/cli postcss autoprefixer
# v4: pas de "init". On compile avec le CLI:
npm run tw:dev   # dans un premier terminal
npm run dev      # dans un second terminal
```

Edit src/tailwind.css (v4):
```css
@import "tailwindcss";
:root { color-scheme: dark; }
body { background: #0f172a; color: #e2e8f0; min-height: 100dvh; }
```

Importe le CSS généré (src/style.css) dans src/main.ts:
```ts
import './style.css';
```

## 2) Minimal router + pages

Create src/router.ts:
```ts
export type Page = { mount: (el: HTMLElement) => void; unmount?: () => void };

const routes: Record<string, () => Promise<Page>> = {
  '/login': () => import('./pages/LoginPage').then(m => m.default),
  '/lobby': () => import('./pages/LobbyPage').then(m => m.default),
  '/match': () => import('./pages/MatchPage').then(m => m.default),
  '/chat':  () => import('./pages/ChatPage').then(m => m.default),
  '/profile': () => import('./pages/ProfilePage').then(m => m.default),
};

let current: Page | null = null;

async function render() {
  const outlet = document.getElementById('app')!;
  current?.unmount?.();
  const load = routes[location.pathname] || routes['/login'];
  const page = await load();
  outlet.innerHTML = '';
  current = page;
  page.mount(outlet);
}

export function navigate(to: string) {
  if (to !== location.pathname) history.pushState({}, '', to);
  render();
}

export function startRouter() {
  window.addEventListener('popstate', render);
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest('a[data-link]') as HTMLAnchorElement | null;
    if (a) { e.preventDefault(); navigate(a.getAttribute('href') || '/'); }
  });
  render();
}
```

Create src/pages/LoginPage.ts:
```ts
const page = {
  mount(el: HTMLElement) {
    el.innerHTML = `
      <div class="max-w-md mx-auto p-6">
        <h1 class="text-xl font-bold mb-4">Login (mock)</h1>
        <form class="grid gap-3">
          <input class="bg-slate-800 rounded p-2" placeholder="Alias (Phase IV.3 default)" />
          <button type="submit" class="bg-teal-400 text-slate-900 font-semibold rounded p-2">Enter Lobby</button>
        </form>
      </div>`;
    const form = el.querySelector('form')!;
    form.addEventListener('submit', (e) => { e.preventDefault(); history.pushState({}, '', '/lobby'); window.dispatchEvent(new PopStateEvent('popstate')); });
  }
};
export default page;
```

Create src/pages/LobbyPage.ts:
```ts
const page = {
  mount(el: HTMLElement) {
    el.innerHTML = `
      <div class="max-w-2xl mx-auto p-6">
        <h1 class="text-xl font-bold mb-4">Lobby</h1>
        <nav class="flex gap-3">
          <a data-link href="/match" class="underline">Start Local Match</a>
          <a data-link href="/chat" class="underline">Chat</a>
          <a data-link href="/profile" class="underline">Profile</a>
        </nav>
      </div>`;
  }
};
export default page;
```

Create src/pages/MatchPage.ts (canvas placeholder):
```ts
const page = {
  mount(el: HTMLElement) {
    el.innerHTML = `
      <div class="max-w-5xl mx-auto p-4">
        <h1 class="text-xl font-bold mb-3">Match (Local placeholder)</h1>
        <canvas id="game" class="bg-slate-900 rounded w-full aspect-[16/9]"></canvas>
        <p class="text-sm text-slate-400 mt-2">W/S (left) · ↑/↓ (right) · Space (pause)</p>
      </div>`;
    // Later: migrate logic from chatgptpong/index.html into this canvas.
  }
};
export default page;
```

Create src/pages/ChatPage.ts and src/pages/ProfilePage.ts (simple placeholders):
```ts
const page = { mount(el: HTMLElement){ el.innerHTML = '<div class="p-6">Chat (Phase 4)</div>'; } };
export default page;
```
```ts
const page = { mount(el: HTMLElement){ el.innerHTML = '<div class="p-6">Profile (Phase 2)</div>'; } };
export default page;
```

Edit index.html (web/index.html) to include shell + outlet:
```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Transcendence</title>
  </head>
  <body>
    <header class="border-b border-slate-800">
      <nav class="max-w-5xl mx-auto p-3 flex gap-4">
        <a data-link href="/login" class="hover:underline">Login</a>
        <a data-link href="/lobby" class="hover:underline">Lobby</a>
        <a data-link href="/match" class="hover:underline">Match</a>
        <a data-link href="/chat" class="hover:underline">Chat</a>
        <a data-link href="/profile" class="ml-auto hover:underline">Profile</a>
      </nav>
    </header>
    <main id="app" class="max-w-5xl mx-auto p-4"></main>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

Replace src/main.ts:
```ts
import './style.css';
import { startRouter } from './router';
startRouter();
```

Dev run:
```sh
npm run dev
```

## 3) Docker (single command run)

At repo root, create Dockerfile:
```Dockerfile
# Stage 1: build
FROM node:18-alpine AS build
WORKDIR /app
COPY web/package*.json ./web/
RUN cd web && npm ci
COPY web ./web
RUN cd web && npm run build

# Stage 2: serve with nginx (SPA fallback)
FROM nginx:alpine
COPY --from=build /app/web/dist /usr/share/nginx/html
COPY docs/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

Create docs/nginx.conf:
```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  location / {
    try_files $uri /index.html;
  }
}
```

Create docker-compose.yml:
```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "8080:80"
```

Build and run:
```sh
docker compose up --build
# open http://localhost:8080
```

## 4) Migrate existing local Pong

- Open chatgptpong/index.html and move the canvas logic into src/pages/MatchPage.ts.
- Keep physics/render decoupled (prepare for remote sync later).

## 5) Acceptance (Phase 0)
- SPA navigation (Back/Forward) works, no console errors in Firefox.
- Tailwind styles applied.
- Match page renders canvas (local game can be added now or Phase 1).
- Runs in Docker with one command.