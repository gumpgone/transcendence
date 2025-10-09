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