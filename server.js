// server.js
const express = require('express');
const SocketServer = require('ws').Server;
const crypto = require("crypto");

// Set the port to 3001
const PORT = 3001;

// Create a new express serverd
const server = express()
  // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on port ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({server});

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {
  console.log('Client connected');
  // online client count sent from server
  console.log(wss.clients.size);
  let clientCount = {
    count: wss.clients.size,
    id: crypto.randomBytes(16).toString("hex"),
    type: "clientCount"  
  }
  wss.clients.forEach(function each(client) {
    client.send(JSON.stringify(clientCount));
  });

  ws.on('message', (message) => {
    let obj = JSON.parse(message);
    
      switch(obj.type) {
        case "postMessage":
          obj.id = crypto.randomBytes(16).toString("hex");
          obj.type = "incomingMessage";
          console.log(obj);
          break;
        case "postNotification":
          obj.id = crypto.randomBytes(16).toString("hex");
          obj.type = "incomingNotification";
          console.log(obj);
          break;
      }
      wss.clients.forEach(function each(client) {
          client.send(JSON.stringify(obj));
      });
  });
  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    let clientCount = {
    count: wss.clients.size,
    id: crypto.randomBytes(16).toString("hex"),
    type: "clientCount"  
    }
    wss.clients.forEach(function each(client) {
      client.send(JSON.stringify(clientCount));
    });
    console.log('Client disconnected');
  });
});