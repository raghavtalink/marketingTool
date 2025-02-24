const userResolver = require('./userResolver');
const productResolver = require('./productResolver');
const contentResolver = require('./contentResolver');
const socialMediaResolver = require('./socialMediaResolver');
const { GraphQLDateTime } = require('graphql-iso-date');

const resolvers = {
  DateTime: GraphQLDateTime,
  Query: {
    ...userResolver.Query,
    ...productResolver.Query,
    ...contentResolver.Query,
    ...socialMediaResolver.Query,
  },
  Mutation: {
    ...userResolver.Mutation,
    ...productResolver.Mutation,
    ...contentResolver.Mutation,
    ...socialMediaResolver.Mutation,
  }
};

module.exports = resolvers;