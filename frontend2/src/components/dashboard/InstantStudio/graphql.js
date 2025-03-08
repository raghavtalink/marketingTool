import { gql } from '@apollo/client';

export const GENERATE_IMAGE = gql`
  mutation GenerateImage($input: ImageGenerationInput!) {
    generateImage(input: $input) {
      success
      image
      error
    }
  }
`;

export const REMOVE_BACKGROUND = gql`
  mutation RemoveBackground($input: BackgroundRemovalInput!) {
    removeBackground(input: $input) {
      success
      image
      error
    }
  }
`;

export const PRODUCTS_QUERY = gql`
  query Products {
    products {
      id
      name
      description
      category
      price
      inventoryCount
      competitorUrls
      currency
      userId
      createdAt
      updatedAt
    }
  }
`;