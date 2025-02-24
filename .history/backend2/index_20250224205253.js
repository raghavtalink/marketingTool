require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const { readFileSync } = require('fs');
const { join } = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { startServer } = require('./server');


const authMiddleware = require('./middleware/auth');
const resolvers = require('./resolvers');
const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf-8');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
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

app.use(cors(corsOptions));

// Auth middleware
const getUser = async (token) => {
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return { id: decoded.userId };
  } catch (err) {
    return null;
  }
};

// Create Apollo Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const user = await authMiddleware(req);
      return { user };
    },
  });

// Start server
// async function startServer() {
//   await server.start();
//   server.applyMiddleware({ app, path: '/graphql' });

//   const PORT = process.env.PORT || 4000;
//   app.listen(PORT, () => {
//     console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
//   });
//}

startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });

startServer();
