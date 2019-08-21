const path = require('path');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const port = process.env.PORT || 80;
const routes = require('./routes/');
const app = express();

app.use(routes);
app.use(express.static(path.join(__dirname, '../ps.io/')));

const server = http.createServer(app);
const io = socketIo(server);
const getApiAndEmit = async socket => {
  try {
    // Getting the data
    const res = await axios.get('https://api.github.com/users/PabloSuarez/repos');
    // Emitting a new message. It will be consumed by the client
    socket.emit('FromAPI', res.data);
  } catch (error) {
    console.error(`Error: ${error.code}`);
  }
};

let interval;
io.on('connection', socket => {
  console.log('New client connected');
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 10000);
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
