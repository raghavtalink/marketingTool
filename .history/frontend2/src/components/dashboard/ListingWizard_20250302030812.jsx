import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { 
  Search, 
  Package, 
  Tag, 
  Type, 
  FileText, 
  FileCheck,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  Loader
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
      currency
    }
  }
`;

const GENERATE_SEO_TAGS = gql`
  mutation GenerateSEOTags($input: GenerateContentInput!) {
    generateSEOTags(input: $input) {
      id
      content
      contentType
      productId
      generatedAt
      webDataUsed
    }
  }
`;

const GENERATE_TITLE = gql`
  mutation GenerateTitle($input: GenerateContentInput!) {
    generateTitle(input: $input) {
      id
      content
      contentType
      productId
      generatedAt
      webDataUsed
    }
  }
`;

const GENERATE_FULL_LISTING = gql`
  mutation GenerateFullListing($input: GenerateContentInput!) {
    generateFullListing(input: $input) {
      id
      content
      contentType
      productId
      generatedAt
      webDataUsed
    }
  }
`;

const GENERATE_CONTENT = gql`
  mutation GenerateContent($input: AIPromptInput!) {
    generateContent(input: $input) {
      content
      contentType
      generatedAt
      id
      productId
      webDataUsed
    }
  }
`;

const AIGenerationLoader = () => {
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [particles, setParticles] = useState([]);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const startTime = useRef(Date.now());
  const expectedDuration = 15000; // 15 seconds expected loading time
  
  const loadingMessages = [
    "Analyzing product data...",
    "Researching market trends...",
    "Crafting compelling content...",
    "Optimizing for search engines...",
    "Polishing final details...",
    "Almost there..."
  ];
  
  // Generate random particles
  useEffect(() => {
    if (!containerRef.current) return;
    
    const generateParticles = () => {
      const containerWidth = containerRef.current?.offsetWidth || 400;
      const containerHeight = containerRef.current?.offsetHeight || 300;
      
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * containerWidth,
        y: Math.random() * containerHeight,
        size: Math.random() * 4 + 1,
        color: `hsl(${Math.random() * 60 + 240}, 100%, 70%)`,
        speedX: (Math.random() - 0.5) * 1.5,
        speedY: (Math.random() - 0.5) * 1.5,
      }));
      
      setParticles(newParticles);
    };
    
    generateParticles();
    
    // Update loading phase
    const phaseInterval = setInterval(() => {
      setLoadingPhase(prev => (prev + 1) % loadingMessages.length);
    }, 2500);
    
    return () => {
      clearInterval(phaseInterval);
    };
  }, []);
  
  // Animate particles
  useEffect(() => {
    if (!containerRef.current || particles.length === 0) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    
    const animateParticles = () => {
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          let newX = particle.x + particle.speedX;
          let newY = particle.y + particle.speedY;
          
          // Bounce off walls
          if (newX <= 0 || newX >= containerWidth) {
            particle.speedX *= -1;
            newX = particle.x + particle.speedX;
          }
          
          if (newY <= 0 || newY >= containerHeight) {
            particle.speedY *= -1;
            newY = particle.y + particle.speedY;
          }
          
          return {
            ...particle,
            x: newX,
            y: newY
          };
        })
      );
      
      // Update progress based on elapsed time
      const elapsed = Date.now() - startTime.current;
      const newProgress = Math.min(elapsed / expectedDuration, 0.95);
      setProgress(newProgress);
      
      animationRef.current = requestAnimationFrame(animateParticles);
    };
    
    animationRef.current = requestAnimationFrame(animateParticles);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles]);
  
  // Interactive elements - user can click to add new particles
  const handleClick = (e) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add new particles at click position
    const newParticles = Array.from({ length: 5 }, (_, i) => ({
      id: `click-${Date.now()}-${i}`,
      x,
      y,
      size: Math.random() * 4 + 2,
      color: `hsl(${Math.random() * 60 + 240}, 100%, 70%)`,
      speedX: (Math.random() - 0.5) * 3,
      speedY: (Math.random() - 0.5) * 3,
    }));
    
    setParticles(prev => [...prev, ...newParticles]);
  };
  
  return (
    <div 
      className="relative w-full h-64 bg-gray-900/60 rounded-xl overflow-hidden cursor-pointer"
      ref={containerRef}
      onClick={handleClick}
    >
      {/* Particles */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full pointer-events-none"
          animate={{ x: particle.x, y: particle.y }}
          transition={{ duration: 0.1, ease: "linear" }}
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
        />
      ))}
      
      {/* Central brain visualization */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-blue-600"
          animate={{ 
            scale: [1, 1.1, 1],
            boxShadow: [
              '0 0 20px rgba(124, 58, 237, 0.5)',
              '0 0 30px rgba(124, 58, 237, 0.7)',
              '0 0 20px rgba(124, 58, 237, 0.5)'
            ]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Orbiting elements */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-blue-400"
            animate={{
              x: Math.cos(i * (Math.PI * 2/3)) * 50 - 1.5,
              y: Math.sin(i * (Math.PI * 2/3)) * 50 - 1.5,
              rotate: 360
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>
      
      {/* Loading message */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <motion.p
          key={loadingPhase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-white font-medium"
        >
          {loadingMessages[loadingPhase]}
        </motion.p>
      </div>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <motion.div 
          className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      
      {/* Hint text */}
      <div className="absolute top-2 right-2 text-xs text-gray-400 opacity-70">
        Click anywhere to interact
      </div>
    </div>
  );
};

const ListingWizard = () => {
  // State
  const [step, setStep] = useState(1); // 1: Select Product, 2: Select Generation Type, 3: View Results
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [generationType, setGenerationType] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedSection, setCopiedSection] = useState(null);

  // GraphQL hooks
  const { loading: productsLoading, error: productsError, data: productsData } = useQuery(GET_PRODUCTS);
  
  const [generateSEOTags] = useMutation(GENERATE_SEO_TAGS, {
    onCompleted: (data) => {
      setGeneratedContent(data.generateSEOTags);
      setIsLoading(false);
      setStep(3);
    },
    onError: (error) => {
      setError(`Error generating SEO tags: ${error.message}`);
      setIsLoading(false);
    }
  });
  
  const [generateTitle] = useMutation(GENERATE_TITLE, {
    onCompleted: (data) => {
      setGeneratedContent(data.generateTitle);
      setIsLoading(false);
      setStep(3);
    },
    onError: (error) => {
      setError(`Error generating title: ${error.message}`);
      setIsLoading(false);
    }
  });
  
  const [generateFullListing] = useMutation(GENERATE_FULL_LISTING, {
    onCompleted: (data) => {
      setGeneratedContent(data.generateFullListing);
      setIsLoading(false);
      setStep(3);
    },
    onError: (error) => {
      setError(`Error generating full listing: ${error.message}`);
      setIsLoading(false);
    }
  });
  
  const [generateContent] = useMutation(GENERATE_CONTENT, {
    onCompleted: (data) => {
      setGeneratedContent(data.generateContent);
      setIsLoading(false);
      setStep(3);
    },
    onError: (error) => {
      setError(`Error generating description: ${error.message}`);
      setIsLoading(false);
    }
  });

  // Filter products based on search query
  const filteredProducts = productsData?.products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Handle generation request
  const handleGenerate = () => {
    setIsLoading(true);
    setError(null);
    
    // Determine which mutation to call based on generation type
    switch(generationType) {
      case 'seo_tags':
        generateSEOTags({
          variables: {
            input: {
              productId: selectedProduct.id
            }
          }
        });
        break;
      case 'product_title':
        generateTitle({
          variables: {
            input: {
              productId: selectedProduct.id
            }
          }
        });
        break;
      case 'product_description':
        generateContent({
          variables: {
            input: {
              productId: selectedProduct.id,
              promptType: 'product_description'
            }
          }
        });
        break;
      case 'full_listing':
        generateFullListing({
          variables: {
            input: {
              productId: selectedProduct.id
            }
          }
        });
        break;
      default:
        setError('Please select a generation type');
        setIsLoading(false);
    }
  };

  // Handle copy to clipboard
  const handleCopy = (text, section) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedSection(section);
        setTimeout(() => setCopiedSection(null), 2000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };

  // Custom renderer for code blocks
  const CodeBlock = ({language, value}) => {
    return (
      <div className="relative">
        <button 
          onClick={() => handleCopy(value, `code-${language}`)}
          className="absolute top-2 right-2 p-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
        >
          {copiedSection === `code-${language}` ? <Check size={16} /> : <Copy size={16} />}
        </button>
        <SyntaxHighlighter language={language || 'markup'} style={atomDark}>
          {value}
        </SyntaxHighlighter>
      </div>
    );
  };

  // Reset wizard
  const resetWizard = () => {
    setStep(1);
    setSelectedProduct(null);
    setGenerationType(null);
    setGeneratedContent(null);
    setError(null);
  };

  // Render step 1: Select Product
  const renderSelectProduct = () => {
    if (productsLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      );
    }

    if (productsError) {
      return (
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle size={20} className="text-red-400 mr-2 mt-0.5" />
            <div>
              <h3 className="text-red-400 font-medium">Error loading products</h3>
              <p className="text-red-300 text-sm mt-1">{productsError.message}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-400 hover:text-red-300 flex items-center"
              >
                <RefreshCw size={14} className="mr-1" /> Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!productsData?.products.length) {
      return (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 text-center">
          <Package size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-medium mb-2">No Products Found</h3>
          <p className="text-gray-400 mb-6">
            You need to add products before you can use the Listing Wizard.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard/products'}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Add Your First Product
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedProduct(product)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedProduct?.id === product.id 
                  ? 'bg-purple-900/30 border-purple-500' 
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {product.currency === 'USD' ? '$' : 
                     product.currency === 'EUR' ? '€' : 
                     product.currency === 'GBP' ? '£' : '₹'}
                    {product.price}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Stock: {product.inventoryCount}
                  </p>
                </div>
              </div>
              {selectedProduct?.id === product.id && (
                <div className="mt-3 flex justify-end">
                  <div className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full flex items-center">
                    <Check size={12} className="mr-1" /> Selected
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setStep(2)}
            disabled={!selectedProduct}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            Continue
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>
    );
  };

  // Render step 2: Select Generation Type
  const renderSelectGenerationType = () => {
    // Define generation types with their details
    const generationTypes = [
      {
        id: 'seo_tags',
        title: 'SEO Tags & Keywords',
        description: 'Generate optimized meta descriptions, keywords, and hashtags',
        icon: <Tag size={24} className="text-blue-400" />,
        color: 'from-blue-600/20 to-blue-800/20 border-blue-700/30'
      },
      {
        id: 'product_title',
        title: 'Product Title',
        description: 'Create attention-grabbing, keyword-rich product titles',
        icon: <Type size={24} className="text-purple-400" />,
        color: 'from-purple-600/20 to-purple-800/20 border-purple-700/30'
      },
      {
        id: 'product_description',
        title: 'Product Description',
        description: 'Write compelling product descriptions that convert',
        icon: <FileText size={24} className="text-green-400" />,
        color: 'from-green-600/20 to-green-800/20 border-green-700/30'
      },
      {
        id: 'full_listing',
        title: 'Full Listing',
        description: 'Generate a complete product listing with all elements',
        icon: <FileCheck size={24} className="text-amber-400" />,
        color: 'from-amber-600/20 to-amber-800/20 border-amber-700/30'
      }
    ];

    // Function to handle generation type selection
    const handleTypeSelect = (typeId) => {
      setGenerationType(typeId);
      // Clear any previous errors when a new type is selected
      setError(null);
    };

    // Function to handle generation
    const handleGenerate = () => {
      // Validate that a generation type is selected
      if (!generationType) {
        setError('Please select a generation type');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      // Determine which mutation to call based on generation type
      switch(generationType) {
        case 'seo_tags':
          generateSEOTags({
            variables: {
              input: {
                productId: selectedProduct.id
              }
            }
          });
          break;
        case 'product_title':
          generateTitle({
            variables: {
              input: {
                productId: selectedProduct.id
              }
            }
          });
          break;
        case 'product_description':
          generateContent({
            variables: {
              input: {
                productId: selectedProduct.id,
                promptType: 'product_description'
              }
            }
          });
          break;
        case 'full_listing':
          generateFullListing({
            variables: {
              input: {
                productId: selectedProduct.id
              }
            }
          });
          break;
        default:
          setError('Please select a generation type');
          setIsLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-medium mb-4">Select Content Type</h2>
          <p className="text-gray-400 mb-6">
            Choose what type of content you want to generate for <span className="font-medium">{selectedProduct.name}</span>
          </p>
          
          {/* Generation type selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generationTypes.map((type) => (
              <div
                key={type.id}
                className={`p-4 rounded-lg bg-gradient-to-br ${type.color} border cursor-pointer transition-all duration-200 ${
                  generationType === type.id 
                    ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-purple-500 transform scale-[1.02]' 
                    : 'hover:bg-gray-800/50'
                }`}
                onClick={() => handleTypeSelect(type.id)}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-1">{type.icon}</div>
                  <div>
                    <h3 className="font-medium">{type.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{type.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg flex items-center text-red-400">
              <AlertCircle size={16} className="mr-2" />
              {error}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <h3 className="font-medium">Selected Product</h3>
          <div className="flex justify-between items-center mt-2">
            <p>{selectedProduct.name}</p>
            <button 
              onClick={() => setStep(1)}
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center"
            >
              Change
            </button>
          </div>
        </div>
        
        <h3 className="text-lg font-medium">What would you like to generate?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {generationTypes.map(type => (
            <motion.div
              key={type.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setGenerationType(type.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                generationType === type.id 
                  ? 'bg-purple-900/30 border-purple-500' 
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start">
                <div className="p-2 bg-gray-700 rounded-lg mr-3">
                  {type.icon}
                </div>
                <div>
                  <h3 className="font-medium">{type.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{type.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep(1)}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back
          </button>
          
          <button
            onClick={handleGenerate}
            disabled={!generationType || isLoading}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Generate Content
                <ChevronRight size={16} className="ml-1" />
              </>
            )}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 mt-4">
            <div className="flex items-start">
              <AlertCircle size={20} className="text-red-400 mr-2 mt-0.5" />
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        )}
        
        {isLoading && (
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Generating content...</h3>
            <AIGenerationLoader />
          </div>
        )}
      </div>
    );
  };

  // Render step 3: View Results
  const renderResults = () => {
    if (!generatedContent) return null;
    
    const generationTypeLabels = {
      'seo_tags': 'SEO Tags',
      'product_title': 'Product Title',
      'product_description': 'Product Description',
      'full_listing': 'Full Listing'
    };
    
    // Function to render content based on type
    const renderContent = () => {
      // For SEO Tags, create a more structured and visually appealing display
      if (generatedContent.contentType === 'seo_tags') {
        // Parse the content to extract different sections
        const content = generatedContent.content;
        
        // Extract sections using regex or string manipulation
        const metaDescriptionMatch = content.match(/\*\*Meta Description[^*]*\*\*\s*"([^"]+)"/);
        const metaDescription = metaDescriptionMatch ? metaDescriptionMatch[1] : '';
        
        const focusKeywordsMatch = content.match(/\*\*Focus Keywords[^*]*\*\*\s*([\s\S]*?)(?=\*\*|$)/);
        const focusKeywordsText = focusKeywordsMatch ? focusKeywordsMatch[1] : '';
        const focusKeywords = focusKeywordsText
          .split('\n')
          .filter(line => line.trim().startsWith('"') || line.trim().startsWith('-') || /\d+\./.test(line))
          .map(line => line.replace(/^["-]\s*|"$/g, '').trim())
          .filter(Boolean);
        
        const secondaryKeywordsMatch = content.match(/\*\*Secondary Keywords[^*]*\*\*\s*([\s\S]*?)(?=\*\*|$)/);
        const secondaryKeywordsText = secondaryKeywordsMatch ? secondaryKeywordsMatch[1] : '';
        const secondaryKeywords = secondaryKeywordsText
          .split('\n')
          .filter(line => line.trim().startsWith('"') || line.trim().startsWith('-') || /\d+\./.test(line))
          .map(line => line.replace(/^["-]\s*|"$/g, '').trim())
          .filter(Boolean);
        
        const hashtagsMatch = content.match(/\*\*Suggested Hashtags\*\*\s*([\s\S]*?)(?=\*\*|$)/);
        const hashtagsText = hashtagsMatch ? hashtagsMatch[1] : '';
        const hashtags = hashtagsText
          .split('\n')
          .filter(line => line.includes('#'))
          .map(line => line.replace(/^["-]\s*|"$/g, '').trim())
          .join(' ')
          .split(' ')
          .filter(tag => tag.startsWith('#'))
          .filter(Boolean);
        
        const htmlCodeMatch = content.match(/```(?:html)?\s*([\s\S]*?)```/);
        const htmlCode = htmlCodeMatch ? htmlCodeMatch[1] : '';
        
        return (
          <div className="space-y-6">
            {/* Copy button for entire content */}
            <div className="absolute top-2 right-2 flex space-x-2">
              <button 
                onClick={() => handleCopy(generatedContent.content, 'full-content')}
                className="p-1.5 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors flex items-center"
                title="Copy all content"
              >
                {copiedSection === 'full-content' ? <Check size={16} className="mr-1" /> : <Copy size={16} className="mr-1" />}
                <span className="text-xs">Copy All</span>
              </button>
            </div>
            
            {/* Meta Description */}
            <div className="bg-gray-800/70 rounded-lg p-4 border border-gray-700">
              <div className="flex justify-between items-start">
                <h3 className="text-purple-400 font-medium mb-2">Meta Description</h3>
                <button 
                  onClick={() => handleCopy(metaDescription, 'meta-description')}
                  className="p-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                  title="Copy meta description"
                >
                  {copiedSection === 'meta-description' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <p className="text-gray-300 italic border-l-2 border-purple-500 pl-3 py-1">{metaDescription}</p>
              <div className="mt-2 text-xs text-gray-500 flex items-center">
                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${metaDescription.length <= 160 ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                {metaDescription.length} characters {metaDescription.length > 160 ? '(recommended: 160 max)' : ''}
              </div>
            </div>
            
            {/* Focus Keywords */}
            <div className="bg-gray-800/70 rounded-lg p-4 border border-gray-700">
              <div className="flex justify-between items-start">
                <h3 className="text-blue-400 font-medium mb-2">Focus Keywords</h3>
                <button 
                  onClick={() => handleCopy(focusKeywords.join(', '), 'focus-keywords')}
                  className="p-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                  title="Copy focus keywords"
                >
                  {copiedSection === 'focus-keywords' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {focusKeywords.map((keyword, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded-md text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Secondary Keywords */}
            <div className="bg-gray-800/70 rounded-lg p-4 border border-gray-700">
              <div className="flex justify-between items-start">
                <h3 className="text-teal-400 font-medium mb-2">Secondary Keywords</h3>
                <button 
                  onClick={() => handleCopy(secondaryKeywords.join(', '), 'secondary-keywords')}
                  className="p-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                  title="Copy secondary keywords"
                >
                  {copiedSection === 'secondary-keywords' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {secondaryKeywords.map((keyword, index) => (
                  <span key={index} className="px-2 py-1 bg-teal-900/30 text-teal-300 rounded-md text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Hashtags */}
            <div className="bg-gray-800/70 rounded-lg p-4 border border-gray-700">
              <div className="flex justify-between items-start">
                <h3 className="text-pink-400 font-medium mb-2">Suggested Hashtags</h3>
                <button 
                  onClick={() => handleCopy(hashtags.join(' '), 'hashtags')}
                  className="p-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                  title="Copy hashtags"
                >
                  {copiedSection === 'hashtags' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-pink-900/30 text-pink-300 rounded-md text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            {/* HTML Code */}
            {htmlCode && (
              <div className="bg-gray-800/70 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-start">
                  <h3 className="text-amber-400 font-medium mb-2">HTML Code</h3>
                  <button 
                    onClick={() => handleCopy(htmlCode, 'html-code')}
                    className="p-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                    title="Copy HTML code"
                  >
                    {copiedSection === 'html-code' ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="mt-2">
                  <SyntaxHighlighter 
                    language="html" 
                    style={atomDark}
                    customStyle={{
                      borderRadius: '0.375rem',
                      padding: '1rem',
                      backgroundColor: 'rgba(17, 24, 39, 0.8)'
                    }}
                  >
                    {htmlCode}
                  </SyntaxHighlighter>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-amber-400 font-medium mb-2">Preview</h4>
                  <div className="p-4 bg-white text-black rounded-lg">
                    <div dangerouslySetInnerHTML={{ __html: htmlCode }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      } else if (generatedContent.contentType === 'product_title') {
        // For product titles, show a more focused display
        return (
          <div className="space-y-6">
            <div className="absolute top-2 right-2">
              <button 
                onClick={() => handleCopy(generatedContent.content, 'full-content')}
                className="p-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
              >
                {copiedSection === 'full-content' ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-6 border border-purple-800/50">
              <h3 className="text-xl font-medium text-center mb-6">Generated Title Options</h3>
              
              <div className="space-y-4">
                {generatedContent.content.split('\n\n').filter(Boolean).map((title, index) => {
                  // Clean up the title (remove numbering, etc.)
                  const cleanTitle = title.replace(/^\d+\.\s*/, '').replace(/^["-]\s*/, '').trim();
                  
                  return (
                    <div key={index} className="bg-gray-800/70 rounded-lg p-3 border border-gray-700">
                      <div className="flex justify-between items-start">
                        <p className="text-white font-medium">{cleanTitle}</p>
                        <button 
                          onClick={() => handleCopy(cleanTitle, `title-${index}`)}
                          className="p-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors ml-2"
                        >
                          {copiedSection === `title-${index}` ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 flex items-center">
                        <span className={`inline-block w-2 h-2 rounded-full mr-1 ${cleanTitle.length <= 200 ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                        {cleanTitle.length} characters
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      } else {
        // For other content types, use the markdown renderer with improved styling
        return (
          <div className="relative">
            <div className="absolute top-2 right-2">
              <button 
                onClick={() => handleCopy(generatedContent.content, 'full-content')}
                className="p-1.5 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors flex items-center"
              >
                {copiedSection === 'full-content' ? <Check size={16} className="mr-1" /> : <Copy size={16} className="mr-1" />}
                <span className="text-xs">Copy</span>
              </button>
            </div>
            
            <div className="prose prose-invert prose-purple max-w-none">
              <ReactMarkdown
                components={{
                  code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter
                        language={match[1]}
                        style={atomDark}
                        customStyle={{
                          borderRadius: '0.375rem',
                          marginTop: '1rem',
                          marginBottom: '1rem'
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  },
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4 text-white" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3 text-white" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2 text-white" {...props} />,
                  p: ({node, ...props}) => <p className="my-3 text-gray-300" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 my-3 space-y-1 text-gray-300" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-3 space-y-1 text-gray-300" {...props} />,
                  li: ({node, ...props}) => <li className="my-1" {...props} />,
                  a: ({node, ...props}) => <a className="text-purple-400 hover:text-purple-300 underline" {...props} />,
                  blockquote: ({node, ...props}) => (
                    <blockquote className="border-l-4 border-purple-500 pl-4 italic my-4 text-gray-400" {...props} />
                  ),
                  hr: ({node, ...props}) => <hr className="my-6 border-gray-700" {...props} />,
                  table: ({node, ...props}) => (
                    <div className="overflow-x-auto my-6">
                      <table className="min-w-full divide-y divide-gray-700" {...props} />
                    </div>
                  ),
                  thead: ({node, ...props}) => <thead className="bg-gray-800" {...props} />,
                  th: ({node, ...props}) => <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider" {...props} />,
                  td: ({node, ...props}) => <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300" {...props} />
                }}
              >
                {generatedContent.content}
              </ReactMarkdown>
            </div>
            
            {/* If there's HTML in the content, show a preview */}
            {generatedContent.content.includes('<') && generatedContent.content.includes('>') && (
              <div className="mt-8 border-t border-gray-700 pt-6">
                <h3 className="text-lg font-medium mb-4">HTML Preview</h3>
                <div className="p-6 bg-white text-black rounded-lg">
                  <div dangerouslySetInnerHTML={{ 
                    __html: generatedContent.content
                      .replace(/```html/g, '')
                      .replace(/```/g, '')
                      .match(/<[^>]*>[^<]*<\/[^>]*>|<[^/>]*\/>/g)?.join('') || ''
                  }} />
                </div>
              </div>
            )}
          </div>
        );
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Generated {generationTypeLabels[generatedContent.contentType] || 'Content'}</h3>
            <div className="text-sm text-gray-400">
              {new Date(generatedContent.generatedAt).toLocaleString()}
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Product: {selectedProduct.name}
          </p>
        </div>
        
        {renderContent()}
        
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep(2)}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back
          </button>
          
          <button
            onClick={resetWizard}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center"
          >
            Start New Generation
          </button>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
          Listing Wizard
        </h1>
        <p className="mt-2 text-gray-400">
          Generate high-converting titles, SEO keywords, and descriptions for your products
        </p>
      </div>
      
      {/* Steps indicator */}
      <div className="flex items-center mb-8">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-purple-600' : 'bg-gray-700'}`}>
          <Package size={16} />
        </div>
        <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-700'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-purple-600' : 'bg-gray-700'}`}>
          <Search size={16} />
        </div>
        <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-purple-600' : 'bg-gray-700'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-purple-600' : 'bg-gray-700'}`}>
          <FileCheck size={16} />
        </div>
      </div>
      
      {/* Content based on current step */}
      <motion.div
        key={`step-${step}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-900/60 border border-gray-800 rounded-xl p-6"
      >
        {step === 1 && renderSelectProduct()}
        {step === 2 && renderSelectGenerationType()}
        {step === 3 && renderResults()}
      </motion.div>
    </div>
  );
};

export default ListingWizard;