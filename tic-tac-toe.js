document.addEventListener('DOMContentLoaded', () => {
  const gameScreen = document.getElementById('game-screen');
  const menu = document.querySelector('.container');
  const version = document.getElementById('app-version');
  const dialog = document.getElementById('user-id-dialog');
  const cells = [...document.querySelectorAll('.game-cell')];
  const timerDisplay = document.getElementById('session-timer');
  const finalTimer = document.getElementById('final-session-timer');
  const timerPill = document.querySelector('.timer-pill');
  const sessionState = document.getElementById('session-state');
  const status = document.getElementById('game-status');
  const result = document.getElementById('session-result');
  const resultTitle = document.getElementById('result-title');
  const jsonOutput = document.getElementById('session-json');
  const boardElement = document.getElementById('tic-tac-toe-board');
  const winLines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  let board = Array(9).fill('');
  let startedAt = null;
  let timerInterval = null;
  let activeMark = 'X';
  let ended = false;
  let selectedPlatform = 'HCM';
  let userId = '';

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const elapsedSeconds = () => Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000));

  const updateTimer = () => {
    const value = formatTime(elapsedSeconds());
    timerDisplay.textContent = value;
    finalTimer.textContent = value;
  };

  const getWinner = (mark) => winLines.some((line) => line.every((index) => board[index] === mark));

  const finishSession = (message) => {
    if (ended) return;
    ended = true;
    clearInterval(timerInterval);
    const endTime = new Date();
    const durationSeconds = Math.max(0, Math.floor((endTime.getTime() - startedAt.getTime()) / 1000));
    const finalTime = formatTime(durationSeconds);
    timerDisplay.textContent = finalTime;
    finalTimer.textContent = finalTime;
    const record = {
      zona: window.KIOSK_ZONE || 'MXL01',
      usuario: userId,
      plataforma: selectedPlatform,
      startTime: startedAt.toISOString(),
      endTime: endTime.toISOString(),
      sessionTimeSeconds: durationSeconds
    };

    sessionState.textContent = 'SESIÓN FINALIZADA';
    timerPill.classList.add('finished');
    status.textContent = message;
    resultTitle.textContent = message;
    jsonOutput.textContent = JSON.stringify(record, null, 2);
    result.hidden = false;
    cells.forEach((cell) => { cell.disabled = true; });
  };

  cells.forEach((cell) => {
    cell.addEventListener('click', () => {
      if (ended || cell.disabled) return;
      const index = Number(cell.dataset.cell);
      board[index] = activeMark;
      cell.textContent = activeMark;
      cell.disabled = true;
      cell.classList.toggle('computer-mark', activeMark === 'O');
      cell.setAttribute('aria-label', `Casilla ${index + 1}: ${activeMark}`);

      if (getWinner(activeMark)) {
        finishSession(`¡Ganó ${activeMark}!`);
      } else if (board.every(Boolean)) {
        finishSession('Empate');
      } else {
        activeMark = activeMark === 'X' ? 'O' : 'X';
        status.textContent = `Turno de ${activeMark}`;
      }
    });
  });

  document.getElementById('end-session').addEventListener('click', () => finishSession('Sesión cerrada'));
  document.getElementById('return-to-menu').addEventListener('click', () => {
    gameScreen.hidden = true;
    menu.hidden = false;
    version.hidden = false;
  });

  window.KioskGame = {
    start(platform, id) {
      clearInterval(timerInterval);
      board = Array(9).fill('');
      startedAt = new Date();
      activeMark = 'X';
      ended = false;
      selectedPlatform = platform;
      userId = id;
      cells.forEach((cell) => {
        cell.textContent = '';
        cell.disabled = false;
        cell.classList.remove('computer-mark');
        cell.setAttribute('aria-label', `Casilla ${Number(cell.dataset.cell) + 1}`);
      });
      result.hidden = true;
      jsonOutput.textContent = '';
      status.textContent = 'Turno de X';
      document.getElementById('game-platform').textContent = platform;
      document.getElementById('game-context').textContent = `Supongamos que estamos dentro de ${platform}`;
      timerDisplay.textContent = '00:00';
      finalTimer.textContent = '00:00';
      sessionState.textContent = 'SESIÓN EN CURSO';
      timerPill.classList.remove('finished');
      sessionStorage.setItem('kiosko-user-id', id);
      menu.hidden = true;
      version.hidden = true;
      gameScreen.hidden = false;
      updateTimer();
      timerInterval = setInterval(updateTimer, 200);
      boardElement.focus({ preventScroll: true });
    }
  };
});
