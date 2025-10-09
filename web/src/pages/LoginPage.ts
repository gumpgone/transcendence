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