import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ShoppingBag, 
  ExternalLink,
  AlertCircle,
  X,
  Check,
  RefreshCw,
  Link as LinkIcon
} from 'lucide-react';

// GraphQL queries and mutations
const GET_PRODUCTS = gql`
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

const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductCreateInput!) {
    createProduct(input: $input) {
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

const IMPORT_SCRAPED_PRODUCT = gql`
  mutation ImportScrapedProduct($url: String!) {
    importScrapedProduct(url: $url) {
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

const Products = () => {
  // State for modal and form
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMethod, setAddMethod] = useState(null); // 'manual' or 'import'
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    inventoryCount: '',
    currency: 'INR',
    competitorUrls: ''
  });
  const [importUrl, setImportUrl] = useState('');
  const [errors, setErrors] = useState({});

  // GraphQL hooks
  const { loading, error, data, refetch } = useQuery(GET_PRODUCTS);
  
  const [createProduct, { loading: createLoading }] = useMutation(CREATE_PRODUCT, {
    onCompleted: () => {
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        inventoryCount: '',
        currency: 'INR',
        competitorUrls: ''
      });
      refetch();
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      setErrors({ submit: error.message });
    }
  });
  
  const [importProduct, { loading: importLoading }] = useMutation(IMPORT_SCRAPED_PRODUCT, {
    onCompleted: () => {
      setIsAddModalOpen(false);
      setImportUrl('');
      refetch();
    },
    onError: (error) => {
      console.error('Error importing product:', error);
      setErrors({ import: error.message });
    }
  });

  // Filter products based on search query
  const filteredProducts = data?.products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Product name is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.price || isNaN(formData.price)) newErrors.price = 'Valid price is required';
    if (!formData.inventoryCount || isNaN(formData.inventoryCount)) newErrors.inventoryCount = 'Valid inventory count is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear errors
    setErrors({});
    
    // Submit form
    createProduct({
      variables: {
        input: {
          ...formData,
          price: parseFloat(formData.price),
          inventoryCount: parseInt(formData.inventoryCount)
        }
      }
    });
  };

  // Handle import submission
  const handleImport = (e) => {
    e.preventDefault();
    
    // Validate URL
    if (!importUrl) {
      setErrors({ import: 'URL is required' });
      return;
    }
    
    // Clear errors
    setErrors({});
    
    // Submit import
    importProduct({
      variables: {
        url: importUrl
      }
    });
  };

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
          Your Products
        </h1>
        <p className="mt-2 text-gray-400">
          Manage your product inventory and listings
        </p>
      </div>
      
      {/* Search and Add bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-auto flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Add Product
        </button>
      </div>
      
      {/* Products table */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
            <p className="text-red-400">Error loading products: {error.message}</p>
            <button 
              onClick={() => refetch()} 
              className="mt-4 px-4 py-2 bg-gray-800 rounded-lg flex items-center mx-auto"
            >
              <RefreshCw size={16} className="mr-2" />
              Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            <ShoppingBag size={48} className="mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400">
              {searchQuery ? 'No products match your search' : 'You have no products yet'}
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="mt-4 px-4 py-2 bg-gray-800 rounded-lg flex items-center mx-auto"
              >
                <X size={16} className="mr-2" />
                Clear Search
              </button>
            )}
            {!searchQuery && (
              <button 
                onClick={() => setIsAddModalOpen(true)} 
                className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center mx-auto"
              >
                <Plus size={16} className="mr-2" />
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Inventory</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-gray-700 rounded-md flex items-center justify-center">
                          <ShoppingBag size={16} className="text-gray-400" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium">{product.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {product.currency} {product.price.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${product.inventoryCount > 10 ? 'text-green-400' : product.inventoryCount > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {product.inventoryCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-700">
                          <Edit size={16} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-400 rounded-md hover:bg-gray-700">
                          <Trash2 size={16} />
                        </button>
                        {product.competitorUrls && (
                          <a 
                            href={product.competitorUrls} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1 text-gray-400 hover:text-blue-400 rounded-md hover:bg-gray-700"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-black bg-opacity-75" 
              aria-hidden="true"
              onClick={() => setIsAddModalOpen(false)}
            ></div>

            {/* Modal positioning */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            {/* Modal content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-900 border border-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-50"
              onClick={(e) => e.stopPropagation()} // Prevent clicks from closing the modal
            >
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-800 hover:text-gray-200 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  <X size={20} />
                  <span className="sr-only">Close</span>
                </button>
              </div>
              
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg font-medium leading-6 text-white">
                    Add New Product
                  </h3>
                  
                  {!addMethod ? (
                    <div className="mt-6 grid grid-cols-1 gap-4">
                      <button
                        onClick={() => setAddMethod('import')}
                        className="flex items-center justify-center p-4 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <LinkIcon size={24} className="mr-3 text-blue-400" />
                        <div className="text-left">
                          <div className="font-medium">Import from URL</div>
                          <div className="text-sm text-gray-400">Add product from Amazon or other marketplace</div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setAddMethod('manual')}
                        className="flex items-center justify-center p-4 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <Edit size={24} className="mr-3 text-purple-400" />
                        <div className="text-left">
                          <div className="font-medium">Add Manually</div>
                          <div className="text-sm text-gray-400">Create a product with custom details</div>
                        </div>
                      </button>
                    </div>
                  ) : addMethod === 'import' ? (
                    <div className="mt-4">
                      <form onSubmit={handleImport}>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-400 mb-1">
                            Product URL
                          </label>
                          <input
                            type="url"
                            value={importUrl}
                            onChange={(e) => setImportUrl(e.target.value)}
                            placeholder="https://www.amazon.com/product/..."
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          {errors.import && (
                            <p className="mt-1 text-sm text-red-400">{errors.import}</p>
                          )}
                          <p className="mt-2 text-xs text-gray-500">
                            Paste a product URL from Amazon, eBay, or other supported marketplaces
                          </p>
                        </div>
                        
                        <div className="flex justify-end space-x-3 mt-6">
                          <button
                            type="button"
                            onClick={() => setAddMethod(null)}
                            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={importLoading}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center"
                          >
                            {importLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                Importing...
                              </>
                            ) : (
                              <>Import Product</>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                              Product Name
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            {errors.name && (
                              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                              Description
                            </label>
                            <textarea
                              name="description"
                              value={formData.description}
                              onChange={handleInputChange}
                              rows="3"
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            ></textarea>
                            {errors.description && (
                              <p className="mt-1 text-sm text-red-400">{errors.description}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                              Category
                            </label>
                            <input
                              type="text"
                              name="category"
                              value={formData.category}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            {errors.category && (
                              <p className="mt-1 text-sm text-red-400">{errors.category}</p>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-1">
                                Price
                              </label>
                              <div className="flex">
                                <select
                                  name="currency"
                                  value={formData.currency}
                                  onChange={handleInputChange}
                                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                  <option value="INR">₹</option>
                                  <option value="USD">$</option>
                                  <option value="EUR">€</option>
                                  <option value="GBP">£</option>
                                </select>
                                <input
                                  type="number"
                                  name="price"
                                  value={formData.price}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 bg-gray-800 border-y border-r border-gray-700 rounded-r-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                              </div>
                              {errors.price && (
                                <p className="mt-1 text-sm text-red-400">{errors.price}</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-1">
                                Inventory
                              </label>
                              <input
                                type="number"
                                name="inventoryCount"
                                value={formData.inventoryCount}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                              {errors.inventoryCount && (
                                <p className="mt-1 text-sm text-red-400">{errors.inventoryCount}</p>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                              Competitor URLs (Optional)
                            </label>
                            <input
                              type="text"
                              name="competitorUrls"
                              value={formData.competitorUrls}
                              onChange={handleInputChange}
                              placeholder="https://example.com/product"
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        </div>
                        
                        {errors.submit && (
                          <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-md">
                            <p className="text-sm text-red-400">{errors.submit}</p>
                          </div>
                        )}
                        
                        <div className="flex justify-end space-x-3 mt-6">
                          <button
                            type="button"
                            onClick={() => setAddMethod(null)}
                            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={createLoading}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center"
                          >
                            {createLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                Creating...
                              </>
                            ) : (
                              <>Create Product</>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;