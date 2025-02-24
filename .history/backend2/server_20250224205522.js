const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { readFileSync } = require('fs');
const { join } = require('path');
const cors = require('cors');
const { json } = require('body-parser');
const mongoose = require('mongoose');
const { getUserFromToken } = require('./utils/auth');

async function startServer() {
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

  const PORT = process.env.PORT || 4000;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    return new Promise((resolve, reject) => {
      const serverInstance = app.listen(PORT, () => {
        console.log(`
    🚀 Server ready at http://localhost:${PORT}/graphql
        `);
        resolve(serverInstance);
      }).on('error', (err) => {
        reject(err);
      });
    });
  } catch (error) {
    console.error('Error starting server:', error);
    throw error;
  }
}

module.exports = { startServer };