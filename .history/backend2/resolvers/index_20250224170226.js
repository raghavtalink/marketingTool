const userResolver = require('./userResolver');
const productResolver = require('./productResolver');
const contentResolver = require('./contentResolver');
const marketAnalysisResolver = require('./marketAnalysisResolver');
const imageEditorResolver = require('./imageEditorResolver');
const socialMediaResolver = require('./socialMediaResolver');
const { GraphQLDateTime } = require('graphql-iso-date');

const resolvers = {
  DateTime: GraphQLDateTime,
  Query: {
    ...userResolver.Query,
    ...productResolver.Query,
    ...contentResolver.Query,
    ...marketAnalysisResolver.Query,
    ...imageEditorResolver.Query,
    ...socialMediaResolver.Query,
  },
  Mutation: {
    ...userResolver.Mutation,
    ...productResolver.Mutation,
    ...contentResolver.Mutation,
    ...marketAnalysisResolver.Mutation,
    ...imageEditorResolver.Mutation,
    ...socialMediaResolver.Mutation,
  }
};

module.exports = resolvers;