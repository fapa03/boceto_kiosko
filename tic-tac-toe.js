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
  const boardElement = document.getElementById('tic-tac-toe-board');
  const winLines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  let board = Array(9).fill('');
  let startedAt = 0;
  let timerInterval = null;
  let computerTimeout = null;
  let active = false;
  let ended = false;

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const elapsedSeconds = () => Math.floor((Date.now() - startedAt) / 1000);

  const updateTimer = () => {
    const value = formatTime(elapsedSeconds());
    timerDisplay.textContent = value;
    finalTimer.textContent = value;
  };

  const getWinner = (mark) => winLines.some((line) => line.every((index) => board[index] === mark));

  const markCell = (index, mark) => {
    board[index] = mark;
    cells[index].textContent = mark;
    cells[index].disabled = true;
    cells[index].classList.toggle('computer-mark', mark === 'O');
    cells[index].setAttribute('aria-label', `Casilla ${index + 1}: ${mark}`);
  };

  const finishSession = (message) => {
    if (ended) return;
    ended = true;
    active = false;
    clearInterval(timerInterval);
    clearTimeout(computerTimeout);
    updateTimer();
    sessionState.textContent = 'SESIÓN FINALIZADA';
    timerPill.classList.add('finished');
    status.textContent = message;
    resultTitle.textContent = message;
    finalTimer.textContent = timerDisplay.textContent;
    result.hidden = false;
    cells.forEach((cell) => { cell.disabled = true; });
  };

  const chooseComputerMove = () => {
    const available = board.map((value, index) => value ? -1 : index).filter((index) => index >= 0);
    const findFinishingMove = (mark) => {
      for (const index of available) {
        board[index] = mark;
        const wins = getWinner(mark);
        board[index] = '';
        if (wins) return index;
      }
      return null;
    };

    const win = findFinishingMove('O');
    if (win !== null) return win;
    const block = findFinishingMove('X');
    if (block !== null) return block;
    if (board[4] === '') return 4;
    const corners = [0, 2, 6, 8].filter((index) => board[index] === '');
    if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
    return available[Math.floor(Math.random() * available.length)];
  };

  const computerTurn = () => {
    if (!active || ended) return;
    const move = chooseComputerMove();
    if (move === undefined) {
      finishSession('Empate');
      return;
    }
    markCell(move, 'O');
    if (getWinner('O')) {
      finishSession('Ganó la computadora');
    } else if (board.every(Boolean)) {
      finishSession('Empate');
    } else {
      status.textContent = 'Tu turno';
      active = true;
    }
  };

  cells.forEach((cell) => {
    cell.addEventListener('click', () => {
      if (!active || ended || cell.disabled) return;
      const index = Number(cell.dataset.cell);
      markCell(index, 'X');
      if (getWinner('X')) {
        finishSession('¡Ganaste!');
      } else if (board.every(Boolean)) {
        finishSession('Empate');
      } else {
        active = false;
        status.textContent = 'Turno de la computadora…';
        computerTimeout = setTimeout(computerTurn, 420);
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
    start(platform, userId) {
      clearInterval(timerInterval);
      clearTimeout(computerTimeout);
      board = Array(9).fill('');
      startedAt = Date.now();
      active = true;
      ended = false;
      cells.forEach((cell) => {
        cell.textContent = '';
        cell.disabled = false;
        cell.classList.remove('computer-mark');
        cell.setAttribute('aria-label', `Casilla ${Number(cell.dataset.cell) + 1}`);
      });
      result.hidden = true;
      status.textContent = 'Tu turno';
      document.getElementById('game-platform').textContent = platform;
      document.getElementById('game-title').textContent = 'Tic Tac Toe';
      timerDisplay.textContent = '00:00';
      finalTimer.textContent = '00:00';
      sessionState.textContent = 'SESIÓN EN CURSO';
      timerPill.classList.remove('finished');
      sessionStorage.setItem('kiosko-user-id', userId);
      menu.hidden = true;
      version.hidden = true;
      gameScreen.hidden = false;
      updateTimer();
      timerInterval = setInterval(updateTimer, 200);
      boardElement.focus({ preventScroll: true });
    }
  };
});
