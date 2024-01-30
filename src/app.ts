import WebSocket from 'ws';
import { StringDecoder } from 'string_decoder';

let clients: {user?: string, socket: WebSocket}[] = [];

export function createWebSocketServer() {
  const wss = new WebSocket.Server({ port: 8080 });
  
  wss.on('connection', (ws) => {
    clients.push({socket: ws});

    ws.on('message', function message(data, isBinary) {
      const decoder = new StringDecoder('utf8');
      const buffer = Buffer.from(data.toString());

      const messageData = JSON.parse(decoder.write(buffer))

      if(messageData.type === "LOGIN") {
        const currentClient = clients.find(connectedClients => connectedClients.socket === ws)

        if(currentClient) currentClient.user = messageData.user;
        
        clients.forEach(client => client.socket.send(JSON.stringify({ type: "ONLINE", users: clients.map(client => client.user).filter(client => !!client) })));
      } else {
        const currentClient = clients.find(connectedClients => connectedClients.user === messageData.to)

        ws.send(data, { binary: isBinary });
        currentClient?.socket.send(data, { binary: isBinary });
      }
    });

    ws.on('close', () => {
      clients = clients.filter((client) => client.socket !== ws);
    });
  });

  console.log('WebSocket server started on port 8080');
}

createWebSocketServer();