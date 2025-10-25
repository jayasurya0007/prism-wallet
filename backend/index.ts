import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/agent/status', (req, res) => {
  res.json({ active: false, actions: 0 });
});

app.get('/api/portfolio/:address', (req, res) => {
  res.json({ totalValue: 0, balances: [] });
});

// WebSocket
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'connected' }));
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});