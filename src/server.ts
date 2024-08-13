import http from 'http';

import httpStatus from 'http-status';
import mongoose from 'mongoose';
import WebSocket from 'ws';

import app from './app';
import config from './config/config';
import ApiError from './utils/ApiError';

mongoose.set('strictQuery', true);

mongoose
  .connect(config.mongoose.url)
  .then(() => {
    console.log(`Connected to MongoDB: ${mongoose.connection.name}`);
  })
  .catch((err) => {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'MongoDB connection error. Please make sure MongoDB is running',
      'critical',
      false,
      err.stack,
    );
  });

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket connection handling
wss.on('connection', (ws: any) => {
  console.log('WebSocket connection opened');

  // Event handler for receiving messages from clients
  ws.on('message', (message: any) => {
    console.log(`${message}`);

    // Send a response back to the client
    ws.send(`${message}`);
  });

  // Event handler for closing the WebSocket connection
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Start the HTTP server
server.listen(config.port, () => {
  console.log(`Listening to port ${config.port}`);
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: Error) => {
  exitHandler();
  throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Server error occurred', 'critical', false, error.stack);
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  if (server) {
    server.close();
  }
});
