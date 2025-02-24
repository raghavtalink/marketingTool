const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { readFileSync } = require('fs');
const { join } = require('path');
const cors = require('cors');
const { json } = require('body-parser');
const mongoose = require('mongoose');
const { getUserFromToken } = require('./utils/auth');

let isStarting = false;

async function startServer() {
  // Prevent multiple server starts
  if (isStarting) {
    console.log('Server is already starting...');
    return;
  }
  
  isStarting = true;

  const app = express();

  // CORS configuration
  const corsOptions = {
    origin: [
      'http://localhost:3000',
      'http://localhost:8000',
      'https://*.inc1.devtunnels.ms',
      'https://*.devtunnels.ms',
      'https://*.ngrok.io',
      'https://*.ngrok-free.app',
      'http://192.168.*.*',
      'http://172.16.*.*',
      'http://10.*.*.*',
      'http://103.40.61.70:30080',
      'http://103.40.61.70:30081',
    ],
    credentials: true,
  };

  try {
    // Connect to MongoDB first
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB');
    }

    // Read schema
    const typeDefs = readFileSync(
      join(__dirname, 'schema.graphql'),
      'utf-8'
    );

    const resolvers = require('./resolvers');

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      introspection: true,
      apollo: {
        key: process.env.APOLLO_KEY || undefined,
        graphRef: process.env.APOLLO_GRAPH_REF || undefined,
      },
    });

    await server.start();

    // Apply middleware
    app.use(
      '/graphql',
      cors(corsOptions),
      json(),
      expressMiddleware(server, {
        context: async ({ req }) => {
          const token = req.headers.authorization || '';
          const user = await getUserFromToken(token);
          return { user };
        },
      })
    );

    const PORT = process.env.PORT || 4001;

    // Start the server
    const serverInstance = await new Promise((resolve, reject) => {
      const instance = app.listen(PORT, () => {
        console.log(`
🚀 Server ready at http://localhost:${PORT}/graphql
        `);
        resolve(instance);
      });

      instance.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.error(`Port ${PORT} is already in use. Trying another port...`);
          instance.close();
          resolve(null);
        } else {
          reject(err);
        }
      });
    });

    if (!serverInstance) {
      throw new Error('Failed to start server');
    }

    return serverInstance;

  } catch (error) {
    console.error('Error starting server:', error);
    throw error;
  } finally {
    isStarting = false;
  }
}

module.exports = { startServer };