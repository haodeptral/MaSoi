const http = require('http');
const express = require('express');
const path = require('path');
const gameRoutes = require('./routers/gameRouter');
const playerRoutes = require('./routers/playerRouter');
const { initWebSocket } = require('./utils/webSocketHandler');
const cors = require('cors');

const app = express();

// Apply CORS middleware before any routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

const server = http.createServer(app);
const PORT = 5505;

// Serve static files from the 'client' directory
app.use(express.static(path.join(__dirname, '../client')));
// Serve the img folder
app.use('/img', express.static(path.join(__dirname, 'img')));

// Use routes for various functionalities
app.use('/game', gameRoutes);
app.use('/player', playerRoutes);

// Basic route for checking server status
app.get('/status', (req, res) => {
    res.send("Werewolf Online is currently up.");
});

// Initialize WebSocket
initWebSocket(server);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});