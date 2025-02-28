import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

// Create an HTTP link to the GraphQL API
const httpLink = createHttpLink({
  uri: 'https://stagingbackend.onrender.com/graphql',
});

// Create the Apollo Client
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;