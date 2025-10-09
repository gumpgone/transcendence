# Init & Launch — Transcendence (Phase 0)

But: permettre à chacun de lancer le front en 1 commande (Docker), ou en dev local (hot reload).

Contenu du repo (utile)
- web/ → SPA TypeScript + Tailwind v4 (via @tailwindcss/cli) + Vite
- Dockerfile, docker-compose.yml → build prod statique (Nginx)
- docker-compose.dev.yml → mode dev (hot reload, sans Node local)
- docs/ → en.subject, Idea1, etc.

Option A — Lancer en 1 commande (Docker, build prod)
- Prérequis: Docker installé
- Commande:
```bash
docker compose up --build
```
- Ouvre http://localhost:8080
- Stop:
```bash
docker compose down
```
Notes:
- Si warning “version is obsolete” sur compose, ignorez ou supprimez la clé version du fichier.
- Si “orphan containers” apparaît:
```bash
docker compose down --remove-orphans
```

Option B — Dev avec Docker (hot reload, 1 commande)
- Prérequis: Docker
- Commande:
```bash
docker compose -f docker-compose.dev.yml up --build
```
- Ouvre http://localhost:5173
- Stop: Ctrl+C, puis:
```bash
docker compose -f docker-compose.dev.yml down
```
Ce service:
- installe les dépendances (npm ci/i)
- lance Tailwind (watch) et Vite (dev)

Option C — Dev local sans Docker (hot reload)
- Prérequis:
  - Node 18+ (OK) ou Node 20.19+ si Vite 7+ plus tard
  - npm 10+
- Installation:
```bash
cd web
npm install
```
- Dev (2 terminaux):
```bash
# T1
cd web && npm run tw:dev   # compile Tailwind v4: src/tailwind.css -> src/style.css
# T2
cd web && npm run dev      # Vite dev server
```
- Ouvre http://localhost:5173
Astuce: Exposer sur le réseau local:
```bash
npm run dev -- --host
```

Installer Node sans sudo (machines 42)
- Via nvm:
```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
node -v && npm -v
```
- Portable (tarball):
```bash
VER=20.19.0
cd ~ && mkdir -p ~/.local
curl -fsSL https://nodejs.org/dist/v$VER/node-v$VER-linux-x64.tar.xz -o node.tar.xz
tar -xJf node.tar.xz && mv node-v$VER-linux-x64 ~/.local/node-$VER && rm node.tar.xz
echo 'export PATH="$HOME/.local/node-'"$VER"'/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
node -v
```

Vérifications (Definition of Ready Phase 0)
- http://localhost:5173 (dev) ou http://localhost:8080 (Docker) charge sans erreur
- Navigation SPA: Login, Lobby, Match, Chat, Profile; Back/Forward OK
- Styles Tailwind visibles (fond sombre)
- Aucune erreur dans la console Firefox

Dépannage rapide
- “vite: not found” dans Docker dev:
  - Assurez-vous que docker-compose.dev.yml exécute “npm ci”/“npm i” avant “npm run dev”
- “Cannot find package 'esbuild'”:
  - Regénérez le lockfile local:
    - cd web && rm -rf node_modules package-lock.json && npm install
    - commit web/package-lock.json puis relancez Docker
- Tailwind v4: pas de “init”:
  - Utiliser @tailwindcss/cli et les scripts déjà fournis:
    - npm run tw:dev (watch), npm run tw:build (prod)
- Conflits de conteneurs:
  - docker compose down --remove-orphans

Arbo à connaître (frontend)
- web/index.html → shell + <main id="app">
- web/src/main.ts → bootstrap SPA
- web/src/router.ts → router maison
- web/src/pages/* → pages Login/Lobby/Match/Chat/Profile
- web/src/tailwind.css → source Tailwind v4
- web/src/style.css → généré (ne pas committer)

Contact
- Si “1 commande” ne marche pas, lancer Option B (dev Docker). Si toujours bloqué, ouvrir une issue avec le log d’erreur.