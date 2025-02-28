const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { removeBackground } = require('@imgly/background-removal-node');
const { Product, ImageEditorProject } = require('../models');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const axios = require('axios');

const CLOUDFLARE_ACCOUNT_ID_IMAGE_EDITOR = process.env.CLOUDFLARE_ACCOUNT_ID_IMAGE_EDITOR;
const CLOUDFLARE_API_TOKEN_IMAGE_EDITOR = process.env.CLOUDFLARE_API_TOKEN_IMAGE_EDITOR;

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
      console.log(`[Query:imageEditorProjects] Fetching projects for user: ${user.id}`);

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
      console.log(`[Mutation:removeBackground] Starting for product: ${input.productId}`);

      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      try {
        const product = await Product.findOne({
          _id: input.productId,
          userId: user.id
        });
        console.log(`[removeBackground] Product found: ${product ? 'yes' : 'no'}`);


        if (!product) {
          throw new UserInputError('Product not found');
        }

        // Process the uploaded file
        const imageBuffer = await processUpload(input.image);
        console.log(`[removeBackground] Image uploaded: ${imageBuffer.length} bytes`);


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
        console.log('[removeBackground] Background removed successfully');


        // Remove background
        const processedImageBlob = await removeBackground(imageBuffer, config);
        
        // Convert Blob to Buffer
        const arrayBuffer = await processedImageBlob.arrayBuffer();
        const processedBuffer = Buffer.from(arrayBuffer);

        // Convert to base64
        const base64Image = processedBuffer.toString('base64');

        return {
          success: true,
          image: `data:image/png;base64,${base64Image}`
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

        let productImage, backgroundImage;
        if (input.productImage) {
          productImage = await processUpload(input.productImage);
        }
        if (input.backgroundImage) {
          backgroundImage = await processUpload(input.backgroundImage);
        }

        // Process images with Sharp
        let processedImage;
        if (productImage && backgroundImage) {
          // Get dimensions
          const prodImg = sharp(productImage);
          const bgImg = sharp(backgroundImage);
          const [prodMeta, bgMeta] = await Promise.all([
            prodImg.metadata(),
            bgImg.metadata()
          ]);

          // Resize product image to match background
          const resizedProduct = await sharp(productImage)
            .resize(bgMeta.width, bgMeta.height, {
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .toBuffer();

          // Composite images
          processedImage = await sharp(backgroundImage)
            .composite([
              {
                input: resizedProduct,
                gravity: 'center'
              }
            ])
            .modulate({
              brightness: input.brightness || 1,
              contrast: input.contrast || 1
            })
            .toBuffer();
        }

        const base64Image = processedImage.toString('base64');

        return {
          success: true,
          image: `data:image/png;base64,${base64Image}`
        };
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