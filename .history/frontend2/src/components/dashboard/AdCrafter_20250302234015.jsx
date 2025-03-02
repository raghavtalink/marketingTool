import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Edit2, 
  ChevronRight, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Twitter,
  EyeIcon,
  UsersIcon,
  ShoppingCart,
  TrendingUp,
  Loader,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

// GraphQL Queries and Mutations
const GET_CAMPAIGNS = gql`
  query Campaigns {
    campaigns {
      id
      userId
      productId
      campaignName
      platforms
      objectives
      contentPlan {
        platform
        content
        generatedAt
        productId
        sentiment
      }
      status
      createdAt
      updatedAt
    }
  }
`;

const GET_CAMPAIGN = gql`
  query Campaign($campaignId: ID!) {
    campaign(id: $campaignId) {
      id
      userId
      productId
      campaignName
      platforms
      objectives
      contentPlan {
        platform
        content
        generatedAt
        productId
        sentiment
      }
      status
      createdAt
      updatedAt
    }
  }
`;

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

const CREATE_CAMPAIGN = gql`
  mutation CreateCampaign($input: SocialMediaCampaignInput!) {
    createCampaign(input: $input) {
      id
      userId
      productId
      campaignName
      platforms
      objectives
      contentPlan {
        platform
        content
        generatedAt
        productId
        sentiment
      }
      status
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_CAMPAIGN = gql`
  mutation UpdateCampaign($input: UpdateCampaignInput!, $updateCampaignId: ID!) {
    updateCampaign(input: $input, id: $updateCampaignId) {
      id
      campaignName
      platforms
      objectives
      status
    }
  }
`;

const DELETE_CAMPAIGN = gql`
  mutation DeleteCampaign($deleteCampaignId: ID!) {
    deleteCampaign(id: $deleteCampaignId)
  }
`;

// Helper Components
const PlatformIcon = ({ platform }) => {
  switch (platform) {
    case 'INSTAGRAM':
      return <Instagram className="text-pink-500" />;
    case 'FACEBOOK':
      return <Facebook className="text-blue-500" />;
    case 'LINKEDIN':
      return <Linkedin className="text-blue-700" />;
    case 'TWITTER':
      return <Twitter className="text-sky-400" />;
    default:
      return <Megaphone />;
  }
};

const ObjectiveIcon = ({ objective }) => {
  switch (objective) {
    case 'AWARENESS':
      return <EyeIcon className="text-purple-500" />;
    case 'ENGAGEMENT':
      return <UsersIcon className="text-green-500" />;
    case 'SALES':
      return <ShoppingCart className="text-yellow-500" />;
    case 'TRAFFIC':
      return <TrendingUp className="text-blue-500" />;
    default:
      return <Megaphone />;
  }
};

const AdCrafter = () => {
  // State
  const [view, setView] = useState('list'); // 'list', 'create', 'detail', 'edit'
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [formData, setFormData] = useState({
    campaignName: '',
    productId: '',
    platforms: [],
    objectives: []
  });
  const [notification, setNotification] = useState(null);

  // GraphQL hooks
  const { loading: campaignsLoading, error: campaignsError, data: campaignsData, refetch: refetchCampaigns } = useQuery(GET_CAMPAIGNS);
  const { loading: productsLoading, error: productsError, data: productsData } = useQuery(GET_PRODUCTS);
  const [createCampaign, { loading: createLoading }] = useMutation(CREATE_CAMPAIGN);
  const [updateCampaign, { loading: updateLoading }] = useMutation(UPDATE_CAMPAIGN);
  const [deleteCampaign, { loading: deleteLoading }] = useMutation(DELETE_CAMPAIGN);

  // Event handlers
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCampaign({
        variables: {
          input: formData
        }
      });
      showNotification('Campaign created successfully!', 'success');
      refetchCampaigns();
      setView('list');
      resetForm();
    } catch (error) {
      showNotification('Error creating campaign: ' + error.message, 'error');
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateCampaign({
        variables: {
          updateCampaignId: selectedCampaign.id,
          input: {
            campaignName: formData.campaignName,
            platforms: formData.platforms,
            objectives: formData.objectives,
          }
        }
      });
      showNotification('Campaign updated successfully!', 'success');
      refetchCampaigns();
      setView('list');
      resetForm();
    } catch (error) {
      showNotification('Error updating campaign: ' + error.message, 'error');
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaign({
          variables: {
            deleteCampaignId: id
          }
        });
        showNotification('Campaign deleted successfully!', 'success');
        refetchCampaigns();
        if (selectedCampaign?.id === id) {
          setView('list');
          setSelectedCampaign(null);
        }
      } catch (error) {
        showNotification('Error deleting campaign: ' + error.message, 'error');
      }
    }
  };

  const handleViewCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setView('detail');
  };

  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      campaignName: campaign.campaignName,
      productId: campaign.productId,
      platforms: campaign.platforms,
      objectives: campaign.objectives
    });
    setView('edit');
  };

  // Helper functions
  const resetForm = () => {
    setFormData({
      campaignName: '',
      productId: '',
      platforms: [],
      objectives: []
    });
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => {
      const newValues = prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value];
      return { ...prev, [field]: newValues };
    });
  };

  return (
    <div className="w-full">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 right-8 z-50 p-4 rounded-lg shadow-lg flex items-center ${
              notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="mr-2" size={20} />
            ) : (
              <AlertTriangle className="mr-2" size={20} />
            )}
            <p>{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 mb-2">
          Ad Crafter
        </h1>
        <p className="text-gray-400">Create compelling social media ads that convert.</p>
      </motion.div>

      {/* Main content area */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 shadow-xl">
        {/* Navigation and action buttons */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setView('list');
                setSelectedCampaign(null);
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'list' ? 'bg-purple-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All Campaigns
            </button>
            
            {selectedCampaign && (
              <button
                onClick={() => setView('detail')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  view === 'detail' ? 'bg-purple-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Campaign Details
              </button>
            )}
          </div>
          
          {(view === 'list' || campaignsError) && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                resetForm();
                setView('create');
              }}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg text-white flex items-center"
            >
              <Plus size={18} className="mr-2" /> New Campaign
            </motion.button>
          )}
        </div>

        {/* List View */}
        {view === 'list' && (
          <div>
            {campaignsLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader size={30} className="animate-spin text-purple-500" />
              </div>
            ) : campaignsError ? (
              <div className="text-center py-12">
                <AlertTriangle size={48} className="mx-auto mb-4 text-amber-500" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">Unable to load campaigns</h3>
                <p className="text-gray-500 mb-6">There was an error connecting to the campaigns service.</p>
                <p className="text-gray-400 text-sm mb-6">You can still create new campaigns!</p>
                <button
                  onClick={() => setView('create')}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg text-white"
                >
                  Create New Campaign
                </button>
              </div>
            ) : campaignsData?.campaigns?.length === 0 ? (
              <div className="text-center py-12">
                <Megaphone size={48} className="mx-auto mb-4 text-gray-500" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">No campaigns created yet</h3>
                <p className="text-gray-500 mb-6">Create your first campaign to start crafting effective ads!</p>
                <button
                  onClick={() => setView('create')}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg text-white"
                >
                  Create Your First Campaign
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaignsData?.campaigns?.map((campaign) => (
                  <motion.div
                    key={campaign.id}
                    whileHover={{ y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden shadow-lg"
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-white truncate pr-4">
                          {campaign.campaignName}
                        </h3>
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => handleEditCampaign(campaign)}
                            className="p-1.5 bg-gray-700 rounded-md hover:bg-gray-600 text-gray-300"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            className="p-1.5 bg-gray-700 rounded-md hover:bg-red-700 text-gray-300 hover:text-white"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mb-3">
                        {campaign.platforms.map((platform) => (
                          <div key={platform} className="p-1.5 bg-gray-700/50 rounded-md">
                            <PlatformIcon platform={platform} />
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex space-x-2 mb-4">
                        {campaign.objectives.map((objective) => (
                          <span key={objective} className="text-xs px-2.5 py-1 rounded-full bg-gray-700/50 text-gray-300">
                            {objective.charAt(0) + objective.slice(1).toLowerCase()}
                          </span>
                        ))}
                      </div>
                      
                      <div className="text-xs text-gray-400 mb-4">
                        Created: {new Date(parseInt(campaign.createdAt)).toLocaleDateString()}
                      </div>
                      
                      <button
                        onClick={() => handleViewCampaign(campaign)}
                        className="w-full py-2 bg-gradient-to-r from-purple-700/20 to-pink-700/20 hover:from-purple-700/40 hover:to-pink-700/40 rounded-md text-white flex items-center justify-center"
                      >
                        View Details <ChevronRight size={16} className="ml-1" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Form */}
        {(view === 'create' || view === 'edit') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
              {view === 'create' ? 'Create New Campaign' : 'Edit Campaign'}
            </h2>
            
            <form onSubmit={view === 'create' ? handleCreateSubmit : handleUpdateSubmit}>
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Campaign Name</label>
                <input
                  type="text"
                  value={formData.campaignName}
                  onChange={(e) => setFormData({...formData, campaignName: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter campaign name"
                  required
                />
              </div>
              
              {view === 'create' && (
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">Select Product</label>
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData({...formData, productId: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select a product</option>
                    {productsData?.products?.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="mb-6">
                <label className="block text-gray-300 mb-3">Platforms</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {['FACEBOOK', 'INSTAGRAM', 'TWITTER', 'LINKEDIN'].map(platform => (
                    <div 
                      key={platform}
                      onClick={() => handleCheckboxChange('platforms', platform)}
                      className={`
                        flex items-center justify-center space-x-2 p-4 rounded-lg cursor-pointer border transition-all
                        ${formData.platforms.includes(platform) 
                          ? 'border-purple-500 bg-purple-900/30' 
                          : 'border-gray-700 bg-gray-800 hover:bg-gray-700'}
                      `}
                    >
                      <PlatformIcon platform={platform} />
                      <span>{platform.charAt(0) + platform.slice(1).toLowerCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-8">
                <label className="block text-gray-300 mb-3">Objectives</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {['AWARENESS', 'ENGAGEMENT', 'SALES', 'TRAFFIC'].map(objective => (
                    <div 
                      key={objective}
                      onClick={() => handleCheckboxChange('objectives', objective)}
                      className={`
                        flex items-center justify-center space-x-2 p-4 rounded-lg cursor-pointer border transition-all
                        ${formData.objectives.includes(objective) 
                          ? 'border-pink-500 bg-pink-900/30' 
                          : 'border-gray-700 bg-gray-800 hover:bg-gray-700'}
                      `}
                    >
                      <ObjectiveIcon objective={objective} />
                      <span>{objective.charAt(0) + objective.slice(1).toLowerCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-4 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setView('list');
                    resetForm();
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading || updateLoading}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 rounded-lg text-white flex items-center"
                >
                  {(createLoading || updateLoading) && <Loader size={18} className="animate-spin mr-2" />}
                  {view === 'create' ? 'Create Campaign' : 'Update Campaign'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Detail View */}
        {view === 'detail' && selectedCampaign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-500">
                {selectedCampaign.campaignName}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditCampaign(selectedCampaign)}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDeleteCampaign(selectedCampaign.id)}
                  className="p-2 bg-gray-800 hover:bg-red-700 rounded-lg text-gray-300 hover:text-white"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4 text-gray-200">Campaign Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Platforms</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCampaign.platforms.map(platform => (
                        <div key={platform} className="flex items-center space-x-2 bg-gray-700/40 px-3 py-1.5 rounded-md">
                          <PlatformIcon platform={platform} />
                          <span>{platform.charAt(0) + platform.slice(1).toLowerCase()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Objectives</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCampaign.objectives.map(objective => (
                        <div key={objective} className="flex items-center space-x-2 bg-gray-700/40 px-3 py-1.5 rounded-md">
                          <ObjectiveIcon objective={objective} />
                          <span>{objective.charAt(0) + objective.slice(1).toLowerCase()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Status</h4>
                    <div className="bg-gray-700/40 px-3 py-1.5 rounded-md inline-block">
                      {selectedCampaign.status || 'Draft'}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Created</h4>
                    <div className="text-gray-300">
                      {new Date(parseInt(selectedCampaign.createdAt)).toLocaleString()}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Last Updated</h4>
                    <div className="text-gray-300">
                      {new Date(parseInt(selectedCampaign.updatedAt)).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4 text-gray-200">Content Plan</h3>
                
                {selectedCampaign.contentPlan && selectedCampaign.contentPlan.length > 0 ? (
                  <div className="space-y-4">
                    {selectedCampaign.contentPlan.map((content, index) => (
                      <div key={index} className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center mb-3">
                          <PlatformIcon platform={content.platform} />
                          <span className="ml-2 font-medium">{content.platform.charAt(0) + content.platform.slice(1).toLowerCase()}</span>
                        </div>
                        <p className="text-gray-300 whitespace-pre-line">{content.content}</p>
                        <div className="mt-3 text-xs text-gray-500">
                          Generated: {new Date(parseInt(content.generatedAt)).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No content has been generated yet.</p>
                    <button
                      onClick={() => {
                        // This would typically trigger content generation
                        showNotification('Content generation feature coming soon!', 'success');
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white"
                    >
                      Generate Content
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdCrafter;