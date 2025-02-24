const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { readFileSync } = require('fs');
const { join } = require('path');
const mongoose = require('mongoose');
const { getUserFromToken } = require('./utils/auth');

// Read schema
const typeDefs = readFileSync(
  join(__dirname, 'schema.graphql'),
  'utf-8'
);

const resolvers = require('./resolvers');

async function startServer() {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      // Get the user token from the headers
      const token = req.headers.authorization || '';
      
      // Try to retrieve a user with the token
      const user = await getUserFromToken(token);
      
      return { user };
    },
    introspection: true, // Enable introspection in all environments
    playground: true,    // Enable playground in all environments
    cors: {
      origin: '*',      // Be more restrictive in production
      credentials: true
    }
  });

  await server.start();

  server.applyMiddleware({ 
    app,
    path: '/graphql',
    cors: false // Handle CORS through Express if needed
  });

  // Optional: Add Express CORS middleware if needed
  app.use(cors());

  const PORT = process.env.PORT || 4000;
  
  app.listen(PORT, () => {
    console.log(`
    🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}
    📈 Sandbox available at http://localhost:${PORT}/graphql
    `);
  });
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/your-database')
  .then(() => {
    console.log('Connected to MongoDB');
    startServer();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });