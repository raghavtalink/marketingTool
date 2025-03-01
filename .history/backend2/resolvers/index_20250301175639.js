const userResolver = require('./userResolver');
const productResolver = require('./productResolver');
const contentResolver = require('./contentResolver');
const marketAnalysisResolver = require('./marketAnalysisResolver');
const imageEditorResolver = require('./imageEditorResolver');
const socialMediaResolver = require('./socialMediaResolver');
//const { GraphQLDateTime } = require('graphql-iso-date');
const { DateTimeResolver } = require('graphql-scalars');


const resolvers = {
  DateTime: DateTimeResolver,
  Query: {
    me: userResolver.Query.me,
    products: productResolver.Query.products,
    product: productResolver.Query.product,
    contentHistory: contentResolver.Query.contentHistory,
    marketAnalysisHistory: marketAnalysisResolver.Query.marketAnalysisHistory,
    imageEditorProjects: imageEditorResolver.Query.imageEditorProjects,
    imageEditorProject: imageEditorResolver.Query.imageEditorProject,
    campaigns: socialMediaResolver.Query.campaigns,
    campaign: socialMediaResolver.Query.campaign,
    scrapeProductData: contentResolver.Query.scrapeProductData,
  },
  Mutation: {
    register: userResolver.Mutation.register,
    login: userResolver.Mutation.login,
    createProduct: productResolver.Mutation.createProduct,
    chat: contentResolver.Mutation.chat,
    deleteGeneratedContent: contentResolver.Mutation.deleteGeneratedContent,
    analyzeTrends: marketAnalysisResolver.Mutation.analyzeTrends,
    suggestPricing: marketAnalysisResolver.Mutation.suggestPricing,
    recommendBundles: marketAnalysisResolver.Mutation.recommendBundles,
    removeBackground: imageEditorResolver.Mutation.removeBackground,
    generateImage: imageEditorResolver.Mutation.generateImage,
    adjustImage: imageEditorResolver.Mutation.adjustImage,
    saveImageEditorProject: imageEditorResolver.Mutation.saveImageEditorProject,
    createCampaign: socialMediaResolver.Mutation.createCampaign,
    updateCampaign: socialMediaResolver.Mutation.updateCampaign,
    deleteCampaign: socialMediaResolver.Mutation.deleteCampaign,
    generateCampaignContent: socialMediaResolver.Mutation.generateCampaignContent,
    generateTitle: contentResolver.Mutation.generateTitle,
    generateSEOTags: contentResolver.Mutation.generateSEOTags,
    generateFullListing: contentResolver.Mutation.generateFullListing,
    importScrapedProduc
  }
};

module.exports = resolvers;