const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { removeBackground } = require('@imgly/background-removal-node');
const { Product, ImageEditorProject } = require('../models');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const axios = require('axios');
const sizeOf = require('image-size');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit (adjust as needed)
const COMPRESSION_QUALITY = 80; // Default quality for compression

const CLOUDFLARE_ACCOUNT_ID_IMAGE_EDITOR = process.env.CLOUDFLARE_ACCOUNT_ID_IMAGE_EDITOR;
const CLOUDFLARE_API_TOKEN_IMAGE_EDITOR = process.env.CLOUDFLARE_API_TOKEN_IMAGE_EDITOR;

const processUpload = async (imageData) => {
  try {
    // Extract base64 data and format
    const matches = imageData.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
    if (!matches) throw new Error('Invalid image format');

    const [, format, base64Data] = matches;
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Get image details
    const { width, height, type } = sizeOf(imageBuffer);
    console.log(`[processUpload] Original image: ${width}x${height} ${type} (${imageBuffer.length} bytes)`);

    // If image is too large, compress it
    if (imageBuffer.length > MAX_FILE_SIZE) {
      console.log('[processUpload] Image too large, compressing...');
      
      // Calculate compression ratio
      const compressionRatio = MAX_FILE_SIZE / imageBuffer.length;
      const quality = Math.floor(COMPRESSION_QUALITY * compressionRatio);
      
      // Resize if dimensions are too large
      const maxDimension = 2000; // Adjust based on your needs
      const scale = Math.min(1, maxDimension / Math.max(width, height));
      
      const processedBuffer = await sharp(imageBuffer)
        .resize(Math.round(width * scale), Math.round(height * scale), {
          fit: 'inside',
          withoutEnlargement: true
        })
        .toFormat(format, { quality })
        .toBuffer();

      console.log(`[processUpload] Compressed image: ${processedBuffer.length} bytes`);
      return processedBuffer;
    }

    return imageBuffer;
  } catch (error) {
    console.error('[processUpload] Error:', error);
    throw error;
  }
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
      try {
        const product = await Product.findOne({
          _id: input.productId,
          userId: user.id
        });
        
        if (!product) {
          throw new Error('Product not found');
        }

        const imageBuffer = await processUpload(input.image);

        // Dynamic config based on image size
        const config = {
          debug: true,
          model: imageBuffer.length > 5 * 1024 * 1024 ? 'fast' : 'medium', // Use faster model for large images
          output: {
            format: 'image/png', // Keep PNG for transparency
            quality: imageBuffer.length > MAX_FILE_SIZE ? 70 : 80,
            type: 'foreground'
          }
        };

        const processedImageBlob = await removeBackground(imageBuffer, config);
        const arrayBuffer = await processedImageBlob.arrayBuffer();
        const processedBuffer = Buffer.from(arrayBuffer);

        // Determine output format based on size and transparency needs
        const outputFormat = processedBuffer.length > MAX_FILE_SIZE ? 'webp' : 'png';
        const compressedBuffer = await sharp(processedBuffer)
          .toFormat(outputFormat, { 
            quality: processedBuffer.length > MAX_FILE_SIZE ? 70 : 80,
            effort: 4 // Compression effort (1-6)
          })
          .toBuffer();

        return {
          success: true,
          image: `data:image/${outputFormat};base64,${compressedBuffer.toString('base64')}`
        };

      } catch (error) {
        console.error('Background removal error:', error);
        return {
          success: false,
          error: error.message,
          image: null
        };
      }
    },

    adjustImage: async (_, { input }, { user }) => {
      console.log(`[Mutation:adjustImage] Starting for product: ${input.productId}`);

      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      try {
        const product = await Product.findOne({
          _id: input.productId,
          userId: user.id
        });
        console.log(`[adjustImage] Product found: ${product ? 'yes' : 'no'}`);


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
      console.log(`[Mutation:generateImage] Starting with prompt: ${input.prompt.substring(0, 50)}...`);

      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      try {
        console.log('[generateImage] Calling Cloudflare AI API');

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
        console.log('[generateImage] Processing API response');


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
        console.log('[generateImage] Operation completed successfully');


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