document.addEventListener('DOMContentLoaded', () => {
  const dialog = document.getElementById('user-id-dialog');
  const form = document.getElementById('user-id-form');
  const input = document.getElementById('user-id-input');
  const closeButton = dialog.querySelector('.dialog-close');
  let selectedTarget = null;
  let replayingClick = false;

  document.addEventListener('click', (event) => {
    if (replayingClick) return;
    const target = event.target.closest('.inline-item, .card');
    if (!target) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    selectedTarget = target;
    input.value = '';
    dialog.showModal();
    input.focus();
  }, true);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!selectedTarget) return;

    sessionStorage.setItem('kiosko-user-id', input.value.trim());
    const target = selectedTarget;
    selectedTarget = null;
    dialog.close();

    // Replay the original menu click so the existing menu navigation still runs.
    replayingClick = true;
    target.click();
    replayingClick = false;
  });

  closeButton.addEventListener('click', () => {
    selectedTarget = null;
    dialog.close();
  });
});
