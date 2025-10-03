# ft_transcendence – Plan de sélection des modules

## Objectif
Atteindre l’équivalent de 7 Major Modules avec un ensemble cohérent, rapide à livrer, réutilisant un socle commun (Fastify + WebSocket + SQLite + SPA Typescript + Tailwind).

## Sélection retenue

### Majors (5)
1. Web – Backend Framework (Fastify + Node.js)
2. User Management – Standard user management
3. Gameplay – Remote players
4. AI-Algo – Introduce an AI opponent
5. Gameplay – Live Chat

### Minors (4) → 2 Majors équivalents
6. Web – Database (SQLite)  
7. Web – Frontend toolkit (Tailwind)  
8. AI-Algo – User & game stats dashboards  
9. Gameplay – Game customization options  

Total: 5 majors + (4 minors = 2 majors) = 7 majors.

## Pourquoi cette combinaison
- Forte synergie temps réel (Remote players, Live chat, AI, matchmaking, notifications tournoi).
- SQLite suffit pour users, matchs, stats, messages, configs.
- Tailwind accélère le front sans framework lourd.
- L’IA fournit des matchs artificiels pour enrichir les stats.
- Customization module faible coût si basé sur un JSON validé côté serveur.
- Aucun module “lourd” type Blockchain / ELK / Microservices / 3D / WAF-Vault.

## Modules volontairement exclus (raison rapide)
- Blockchain: périmètre annexe, temps R&D élevé.
- Microservices / ELK / WAF: surdimensionné pour MVP.
- Advanced 3D Babylon.js: courbe d’apprentissage inutile ici.
- Multiple players (plus de 2 simultanés): complexifie le moteur réseau.
- Second game: double effort logique + stats.
- OAuth remote auth: optionnel, non essentiel au cœur gameplay.
- 2FA/JWT: ajoute friction et complexité sécurité sans gain immédiat.

## Dépendances & ordre logique
- Tailwind & SQLite préparés tôt (support à User, Chat, Stats).
- User Management avant Chat (profils, amis, blocage).
- Remote players avant AI (même pipeline input).
- Game customization avant finalisation AI (IA doit consommer les power-ups / paramètres).
- Stats dashboards en fin (dépend données déjà générées).

## Phases d’implémentation (proposition)

### Phase 0 – Socle
- Pong local 1v1 (moteur séparé du rendu).
- SPA Typescript (router minimal History API ou hash).

### Phase 1 – Backend & Infra
- Fastify (API: /auth, /users, /matches, /ws upgrade).
- Dockerfile + docker compose minimal (un container).
- SQLite + migrations (schema v1).

### Phase 2 – User Management
- Inscription / login (hash Argon2 ou bcrypt).
- Sessions (cookie signé) ou JWT interne simple (si besoin).
- Avatar + profil + historique basique.

### Phase 3 – Remote Players
- WebSocket: rooms (match:<id>), protocole événements (JOIN, STATE, INPUT, SCORE, END).
- Autorité serveur: physique côté serveur; clients en rendu passif + interpolation.
- Reconnexion tolérante (timeout grace period).

### Phase 4 – Live Chat
- Canaux: direct (user:user), global, lobby match.
- Invitations jeu (message typé INVITE + création match).
- Blocage (table blocked).

### Phase 5 – AI Opponent
- Tick perception toutes les 1000 ms (snapshot state).
- Prédiction trajectoire (calcul rebonds).
- File d’inputs simulant press/release.
- Remplacement joueur déconnecté possible.

### Phase 6 – Game Customization
- Table match_config + JSON validé (zod ou schema maison).
- Paramètres: targetScore, ballSpeed, paddleScale, powerUps[].
- Application serveur (garantit équité).

### Phase 7 – Stats Dashboards
- Agrégations: winrate, ratio vs AI, durée moyenne, longest rally, vitesse max balle.
- Cache périodique (table stats_cache) si nécessaire.

### Phase 8 – Polish & Tests
- Tests e2e (simulation matches + IA).
- Seed + script génération matches IA vs IA.
- Audit sécurité basique (XSS, SQLi, HTTPS, CSP minimale).

## Schéma SQL (proposition initiale)
```
users(id PK, email UNIQUE, password_hash, display_name UNIQUE, avatar_url, created_at)
friendships(user_id, friend_id, status) -- (pending|accepted|blocked)
blocked(user_id, blocked_id)
matches(id PK, created_at, status, mode, config_id FK)
match_players(match_id, user_id NULL si AI, score, is_ai)
match_config(id PK, json_blob)
chat_messages(id PK, from_user, to_user NULL, room NULL, type, payload, created_at)
stats_cache(user_id, json_blob, refreshed_at)
```

## Événements WebSocket (exemple)
```
CLIENT -> SERVER:
{type:"JOIN_MATCH", matchId}
{type:"INPUT", key:"UP"|"DOWN", state:"PRESS"|"RELEASE"}

SERVER -> CLIENT:
{type:"STATE", state:{ball:{x,y,vx,vy}, paddles:[...], scores:[...], ts}}
{type:"MATCH_END", winnerUserId}
{type:"CHAT", message:{...}}
{type:"INVITE", matchId, fromUser}
```

## IA – Approche rapide
1. Snapshot state (ball position, velocity, paddle positions).
2. Simulation rebonds jusqu’à atteindre x du paddle IA.
3. Cible = y attendu ± marge d’erreur aléatoire.
4. Générer séquence d’inputs pour tendre vers y (limiter vitesse).
5. Introduire jitter décision (délais random ~50–120 ms) pour humaniser.

## Sécurité minimale
- Hash Argon2id ou bcrypt cost élevé.
- Validation systématique côté serveur (never trust client).
- Filtrage output (escape HTML dans chat).
- HTTPS (cert self-signed pour dev puis script).
- Rate limiting basique sur auth + chat.

## Risques & Mitigations
- Latence / jitter: interpolation client + horodatage serveur.
- Désync moteur: état autoritaire toutes les X frames (ex: 10 Hz).
- Flood chat: rate limit per user.
- AI trop forte: facteur d’erreur configurable.

## Critères de complétion modules
- Backend Framework: Fastify + routes + WS + packaging Docker.
- Database: toutes données persistées en SQLite + migrations reproductibles.
- Frontend Toolkit: Tailwind utilisé exclusivement pour styles.
- Standard User Management: login/logout, avatars, friends, historique visible.
- Remote players: deux navigateurs externes jouent même partie en temps réel.
- Live Chat: DM, blocage, invitations, notif tournoi.
- AI Opponent: IA peut gagner parfois; évolue avec custom rules.
- Game customization: paramètres modifiables appliqués serveur.
- Stats dashboards: vues utilisateur + globale avec métriques listées.

## Roadmap condensation (semaine)
- S1: Phase 0–1
- S2: Phase 2–3
- S3: Phase 4–5
- S4: Phase 6–7
- S5: Tests, optimisation, hardening

## Prochaines actions immédiates
1. Valider ce plan en équipe.
2. Créer migrations v1.
3. Prototyper moteur Pong serveur (tick constant + deterministic).
4. Établir convention événements WS.
5. Implémenter auth + sessions avant d’écrire UI chat.

---

Version: 1.0  
Révisions futures: ajouter détail protocole, format stats, schéma config puissance/power-ups.

## Répartition Équipe (3 personnes)

### Rôles principaux
- Dev A – Backend & Infra:
  - Fastify (API/WS), Docker, migrations SQLite, schéma, auth (sessions/hash), sécurité (HTTPS, headers, validation), rate limiting, seed/scripts.
- Dev B – Gameplay & Temps réel & IA:
  - Moteur Pong serveur (boucle, physique), protocole WS, remote players, matchmaking + tournoi, AI opponent, game customization (application serveur), synchronisation état, anti-désync.
- Dev C – Frontend & UX:
  - SPA (router), composants UI (auth, lobby, tournoi, chat, match viewer), Tailwind, gestion état client, formulaires + validation, dashboards stats, pages profil.

### Tâches transverses (rotation)
- QA/tests (e2e script simulation)
- Revue code croisée (PR ≤ 300 lignes)
- Documentation protocole (B rédige, A/C valident)
- Sécurité (A lead, B/C check)

### Par phase (parallélisation)

Phase 0  
- B: moteur local (logique pure, API step())  
- C: structure SPA + router + layout + thème Tailwind  
- A: repo, lint, Docker base, scripts dev (hot reload), config env  

Phase 1  
- A: migrations v1 + tables users/matches/chat + endpoints /health /auth  
- B: adaptation moteur côté serveur (tick fixe) + interface réseau abstraite  
- C: écrans Login/Register (mock), page Match placeholder, shell tournoi  

Phase 2 (User Management)  
- A: auth réelle (hash, sessions), protection routes, avatars stockage  
- C: intégration auth réelle + profil utilisateur + liste joueurs  
- B: prépare structure matchmaking (structures en mémoire)  

Phase 3 (Remote players)  
- B: protocole WS (JOIN_MATCH, INPUT, STATE), rooms + interpolation suggestions  
- A: persistance match lifecycle (start/end) + enregistrement scores  
- C: UI spectateur + affichage latence + contrôles clavier abstraits  

Phase 4 (Chat)  
- B: types événements CHAT / INVITE réutilisant même canal  
- A: table chat_messages + filtres XSS + rate limit  
- C: UI chat (global / DM / match), invites → flux création partie  

Phase 5 (AI)  
- B: module IA (prédiction rebonds, jitter), substitution joueur déco  
- A: flag is_ai dans match_players + seed matches IA vs IA  
- C: toggle “Play vs AI” + badge IA dans UI  

Phase 6 (Customization)  
- B: application runtime config (vitesses, targetScore...)  
- A: table match_config + validation JSON  
- C: formulaire création config + preview paramètres  

Phase 7 (Stats)  
- A: agrégations SQL + éventuellement cache  
- B: instrumentation (collect rally length, vitesse)  
- C: dashboards (graphiques simples canvas/SVG)  

Phase 8 (Polish & Tests)  
- A: hardening HTTPS + headers + audit env  
- B: test charge léger (simulation 20 matchs AI)  
- C: UX raffinements + messages d’erreur unifiés  

### Points d’intégration obligatoires
- Fin Phase 1: API /auth + moteur isolé = démo login + partie locale.  
- Fin Phase 3: Deux navigateurs jouent en remote (base).  
- Fin Phase 5: Partie vs IA + remplacement joueur déco.  
- Fin Phase 7: Dashboards alimentés par données réelles.  

### Limites WIP
- Max 2 features simultanées / dev.
- Pas de nouvelle feature si dette tests > 10% lignes modifiées non couvertes script simulation.

### Communication
- Stand-up quotidien (≤10 min).
- Revue protocole WS avant implémentation (schéma JSON figé).
- Retro courte fin de chaque phase (ce qui bloque, ajustements).

### Risques & Mitigation
- Goulot Backend: A surchargé → B/C aident sur endpoints simples.
- Désync jeu: snapshots autoritaires + outil diff state (console).  
- Glissement stats: instrumentation légère dès Phase 3 (éviter refactor tardif).  

### Critère “Done” (résumé)
- Backend: test curl + seed + migration reproductible.
- Gameplay: 3 matchs consécutifs sans désync > 100 ms sur balle.
- Chat: DM + blocage vérifiés (message bloqué non reçu).
- IA: win-rate configurable (50% ± 15% sur 20 matchs par défaut).
- Custom: paramètres visibles et réellement appliqués (log serveur).
- Stats: variation visible après nouveaux matchs.

### Répartition charge (approx %)
- A: 35%
- B: 40%
- C: 35%
Rééquilibrage en Phase 7 (C plus chargé → A/B aident sur visualisations simples).

### Outils recommandés internes
- Script simulate_matches.ts (spawns N IA vs IA) – B initial, A maintient.
- checker_state.ts (compare state serveur vs client) – B.
- seed.ts (users + matches) – A.
- generate_stats.ts (force recalcul) – A.

### Première semaine (objectif concret)
Jour 2: moteur local + auth mock + layout  
Jour 4: migrations + auth réelle + moteur serveur ticking  
Jour 5: début WS protocole + UI écoute STATE  

Fin S1: Partie remote minimale jouable (sans chat).  

---

## Short List – Répartition Modules

Greg (Dev A – Backend & Infra)
- Major: Backend Framework (Fastify)
- Major: Standard User Management (auth, sessions, friends, avatars)
- Major: Live Chat (stockage + endpoints + blocage)
- Minor: Database (SQLite)
- Minor: Stats Dashboards (agrégations / API)
- Minor: Game Customization (table + validation)

Wallid (Dev B – Gameplay / Temps Réel / IA)
- Major: Remote Players (WS protocole, sync, déconnexions)
- Major: AI Opponent (logique prédiction / inputs simulés)
- Major: Live Chat (événements temps réel, invitations)
- Minor: Game Customization (application runtime)
- Minor: Stats Dashboards (instrumentation match)
- (Core) Tournoi & Matchmaking (structure + annonces)

Mehdi (Dev C – Frontend & UX)
- Minor: Frontend Toolkit (Tailwind)
- Major: Standard User Management (UI formulaires / profils)
- Major: Live Chat (UI DM / global / invites / profils)
- Major: Remote Players (affichage match, latence, spectateur)
- Minor: Stats Dashboards (charts / navigation)
- Minor: Game Customization (UI création / sélection configs)
