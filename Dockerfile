# Stage 1: build
FROM node:18-alpine AS build
WORKDIR /app
COPY web/package*.json ./web/
RUN cd web && npm ci
COPY web ./web
# Ensure Tailwind builds the CSS used by Vite
RUN cd web && npm run tw:build && npm run build

# Stage 2: serve with nginx (SPA fallback)
FROM nginx:alpine
COPY --from=build /app/web/dist /usr/share/nginx/html
COPY docs/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80