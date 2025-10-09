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