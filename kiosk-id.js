document.addEventListener('DOMContentLoaded', () => {
  const dialog = document.getElementById('user-id-dialog');
  const form = document.getElementById('user-id-form');
  const input = document.getElementById('user-id-input');
  const platformLabel = document.getElementById('selected-platform');
  const closeButton = dialog.querySelector('.dialog-close');
  let selectedPlatform = 'HCM';

  document.addEventListener('click', (event) => {
    const target = event.target.closest('.inline-item, .card');
    if (!target) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    selectedPlatform = target.closest('.card').dataset.platform.toUpperCase();
    platformLabel.textContent = `PLATAFORMA ${selectedPlatform}`;
    input.value = '';
    dialog.showModal();
    input.focus();
  }, true);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const userId = input.value.trim();
    if (!userId) return;

    sessionStorage.setItem('kiosko-user-id', userId);
    dialog.close();
    window.KioskGame.start(selectedPlatform, userId);
  });

  closeButton.addEventListener('click', () => dialog.close());
});
