// server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

const rooms = {};

function logf(msg) {
	console.log(getCurrentTimestamp() + " " + msg);
}

wss.on('connection', function connection(ws) {

	logf("wss connection >>");

    ws.on('message', function incoming(message)
    {
        logf("wss message: " + message);

        const data = JSON.parse(message);
        const { type, room, payload } = data;

        if (type === 'join') {
            if (!rooms[room]) {
                rooms[room] = [];
            }
            rooms[room].push(ws);

            // Notify others in the room
            rooms[room].forEach(client => {
                if (client !== ws) {
                    client.send(JSON.stringify({ type: 'new-user' }));
					logf("Sent new-user");
                }
            });
        }

        if (type === 'signal') {
            // Send signal (offer/answer/ice) to all others in the room
            rooms[room].forEach(client => {
                if (client !== ws) {
                    client.send(JSON.stringify({ type: 'signal', payload }));
					logf("signaled");
                }
            });
        }

        ws.on('close', () => {
            if (rooms[room]) {
                rooms[room] = rooms[room].filter(client => client !== ws);
				logf("client left");
            }
        });
    });
});

const getCurrentTimestamp = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

console.log('Signaling server running on ws://localhost:3000');
