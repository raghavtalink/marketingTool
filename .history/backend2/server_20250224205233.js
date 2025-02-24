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
    cors(),
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
  
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/your-database');
  console.log('Connected to MongoDB');

  app.listen(PORT, () => {
    console.log(`
    🚀 Server ready at http://localhost:${PORT}/graphql
    `);
  });
}

module.exports = { startServer };