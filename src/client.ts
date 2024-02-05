import { type Socket, io } from "socket.io-client";

async function testConnection() {
  const uri = `http://localhost:8080/`;
  
  const socket = io(uri);
  
  socket.on("connect", () => {
    console.log(`[client] connected to ${uri}. ID: ${socket.id}`)

    let onlineUsers: string[] = []
  
    socket.on("message", (from: string, to: string, message: string) => {
      console.log(`[client] ${from.slice(0, 7)}: ${message}`)
    })
  
    socket.on("login", (clients: string[]) => {
      console.log(`[client] user ${username} is online`)
  
      onlineUsers = clients
    })
  
    socket.on("logout", (username: string) => {
      console.log(`[client] user ${username} is offline`)
  
      onlineUsers = onlineUsers.filter(user => user !== username)
    })

    const username = `user-${socket.id}`

    socket.emit("login", username)
  
    try {      
      setInterval(() => {
        onlineUsers.forEach(user => socket.emit("message", username, user, `Hello from ${username.slice(0, 7)}, ${user.slice(0, 7)}!`))
      }, 1000)
    } catch(err) {
      socket.emit("logout", username);
    }
  })
  
  socket.on("disconnect", () => {
    socket.emit("logout", `user-${socket.id}`);
    console.log(`[client] disconnected.`)
  }); 
}

testConnection()
  .catch(console.log);