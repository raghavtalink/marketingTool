const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { removeBackground } = require('@imgly/background-removal-node');
const { Product, ImageEditorProject } = require('../models');
const Jimp = require('jimp');
const axios = require('axios');

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

const processUpload = async (file) => {
  const { createReadStream } = await file;
  const stream = createReadStream();
  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
};

const imageEditorResolver = {
  Query: {
    imageEditorProjects: async (_, __, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      return await ImageEditorProject.find({ userId: user.id })
        .sort({ updatedAt: -1 });
    },

    imageEditorProject: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const project = await ImageEditorProject.findOne({
        _id: id,
        userId: user.id
      });

      if (!project) {
        throw new UserInputError('Project not found');
      }

      return project;
    }
  },

  Mutation: {
    removeBackground: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      try {
        const product = await Product.findOne({
          _id: input.productId,
          userId: user.id
        });

        if (!product) {
          throw new UserInputError('Product not found');
        }

        const imageBuffer = await processUpload(input.image);

        // Configure background removal
        const config = {
          debug: false,
          model: 'medium',
          output: {
            format: 'image/png',
            quality: 0.8,
            type: 'foreground'
          }
        };

        const processedImageBlob = await removeBackground(imageBuffer, config);
        const arrayBuffer = await processedImageBlob.arrayBuffer();
        const processedBuffer = Buffer.from(arrayBuffer);

        return {
          success: true,
          image: `data:image/png;base64,${processedBuffer.toString('base64')}`
        };
      } catch (error) {
        console.error('Background removal error:', error);
        return {
          success: false,
          error: error.message
        };
      }
    },

    adjustImage: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      try {
        const product = await Product.findOne({
          _id: input.productId,
          userId: user.id
        });

        if (!product) {
          throw new UserInputError('Product not found');
        }

        let productImage, backgroundImage, processedImage;

        if (input.productImage) {
          const productBuffer = await processUpload(input.productImage);
          productImage = await Jimp.read(productBuffer);
        }

        if (input.backgroundImage) {
          const backgroundBuffer = await processUpload(input.backgroundImage);
          backgroundImage = await Jimp.read(backgroundBuffer);
        }

        if (productImage && backgroundImage) {
          // Resize product image to match background
          productImage.resize(backgroundImage.getWidth(), backgroundImage.getHeight(), Jimp.RESIZE_CONTAIN);

          // Apply brightness and contrast
          if (input.brightness) {
            productImage.brightness(input.brightness - 0.5); // Jimp brightness is from -1 to +1
          }
          if (input.contrast) {
            productImage.contrast(input.contrast - 0.5); // Jimp contrast is from -1 to +1
          }

          // Composite images
          backgroundImage.composite(productImage, 0, 0, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacitySource: 1,
            opacityDest: 1
          });

          // Get final buffer
          const buffer = await backgroundImage.getBufferAsync(Jimp.MIME_PNG);
          
          return {
            success: true,
            image: `data:image/png;base64,${buffer.toString('base64')}`
          };
        }

        throw new Error('Both product and background images are required');
      } catch (error) {
        console.error('Image adjustment error:', error);
        return {
          success: false,
          error: error.message
        };
      }
    },

    saveImageEditorProject: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      try {
        const project = await ImageEditorProject.create({
          userId: user.id,
          productId: input.productId,
          backgroundImage: input.backgroundImage ? 
            `data:image/png;base64,${(await processUpload(input.backgroundImage)).toString('base64')}` : null,
          productImage: input.productImage ?
            `data:image/png;base64,${(await processUpload(input.productImage)).toString('base64')}` : null,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        return project;
      } catch (error) {
        console.error('Project save error:', error);
        throw new Error(`Failed to save project: ${error.message}`);
      }
    },

    generateImage: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      try {
        const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID_IMAGE_EDITOR}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
        
        const headers = {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN_IMAGE_EDITOR}`,
          'Content-Type': 'application/json'
        };

        const payload = {
          prompt: input.prompt,
          num_steps: input.steps || 4
        };

        console.log('🎨 Generating image with Cloudflare AI...');
        const response = await axios.post(url, payload, { headers });

        if (response.status !== 200) {
          throw new Error(`Cloudflare API error: ${response.data}`);
        }

        let base64Str;
        const result = response.data;

        // Handle the nested dictionary structure
        if (result.result) {
          if (typeof result.result === 'object' && result.result.image) {
            base64Str = result.result.image;
          } else if (typeof result.result === 'string') {
            base64Str = result.result;
          } else {
            throw new Error(`Unexpected data format in result: ${typeof result.result}`);
          }
        } else {
          throw new Error('Missing "result" key in response');
        }

        // Clean up the base64 string
        base64Str = base64Str.replace(/['"]/g, '').trim();

        return {
          success: true,
          image: base64Str
        };

      } catch (error) {
        console.error('Image generation error:', error);
        console.error('Full error:', error.response?.data || error);
        return {
          success: false,
          error: error.message
        };
      }
    },
  }
};

module.exports = imageEditorResolver;