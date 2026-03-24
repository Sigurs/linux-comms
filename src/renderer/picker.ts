declare global {
  interface Window {
    pickerAPI: {
      getSources: () => Promise<{ id: string; name: string; thumbnailDataUrl: string }[]>;
      pickSource: (sourceId: string | null) => void;
    };
  }
}

let selectedSourceId: string | null = null;

async function init() {
  const sources = await window.pickerAPI.getSources();
  const container = document.getElementById('sources')!;
  container.innerHTML = '';

  if (sources.length === 0) {
    container.innerHTML = '<p style="color:#6c7086">No sources found.</p>';
    return;
  }

  for (const source of sources) {
    const el = document.createElement('div');
    el.className = 'source';
    el.dataset.id = source.id;
    el.innerHTML = `
      <img src="${source.thumbnailDataUrl}" alt="" />
      <div class="name" title="${source.name}">${source.name}</div>
    `;
    el.addEventListener('click', () => {
      document.querySelectorAll('.source').forEach((s) => s.classList.remove('selected'));
      el.classList.add('selected');
      selectedSourceId = source.id;
      (document.getElementById('btn-share') as HTMLButtonElement).disabled = false;
    });
    container.appendChild(el);
  }
}

document.getElementById('btn-share')!.addEventListener('click', () => {
  if (selectedSourceId) {
    window.pickerAPI.pickSource(selectedSourceId);
  }
});

document.getElementById('btn-cancel')!.addEventListener('click', () => {
  window.pickerAPI.pickSource(null);
});

init().catch(console.error);
