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