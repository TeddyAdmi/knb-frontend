const BACKEND_URL = "https://knb-pkoin.onrender.com"; 
const socket = io(BACKEND_URL);

const ROOMS = [
  { id: 1, bet: 0.1 }, { id: 2, bet: 0.5 }, { id: 3, bet: 1 },
  { id: 4, bet: 2 },   { id: 5, bet: 5 },   { id: 6, bet: 10 },
  { id: 7, bet: 25 },  { id: 8, bet: 50 },  { id: 9, bet: 100 }, { id: 10, bet: 250 }
];

let currentUser = null;
let currentRoom = null;

window.addEventListener('load', async () => {
  if (window.pocketnet) {
    currentUser = await window.pocketnet.getUserInfo();
    document.getElementById('user-info').innerText = `Игрок: ${currentUser.name || currentUser.address}`;
  }
  renderRooms();
});

function renderRooms() {
  const container = document.getElementById('rooms-grid');
  container.innerHTML = '';
  ROOMS.forEach(room => {
    const btn = document.createElement('button');
    btn.innerText = `Комната ${room.id} (Ставка: ${room.bet} PKOIN)`;
    btn.onclick = () => joinRoom(room.id);
    container.appendChild(btn);
  });
}

async function joinRoom(roomId) {
  currentRoom = ROOMS.find(r => r.id === roomId);
  
  // УКАЖИТЕ АДРЕС СВОЕГО PKOIN-КОШЕЛЬКА
  const walletAddress = "PQoPdcQdkqQSqiHxPfsMwnhxW8QAjfTEzs"; 

  const tx = await window.pocketnet.makePayment({
    address: walletAddress,
    amount: currentRoom.bet,
    comment: `Ставка КНБ комната ${currentRoom.id}`
  });

  if (tx && tx.hash) {
    document.getElementById('rooms-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    
    socket.emit('join_room', {
      roomId: currentRoom.id,
      address: currentUser.address,
      txHash: tx.hash
    });
  }
}

socket.on('game_start', (data) => {
  document.getElementById('status').innerText = data.message;
});

function makeMove(move) {
  socket.emit('make_move', { roomId: currentRoom.id, move: move });
}

socket.on('game_result', (data) => {
  document.getElementById('status').innerText = `Результат: ${data.result}. Выигрыш: ${data.prize} PKOIN`;
});
