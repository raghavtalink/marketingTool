import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  
  const [generateDescription] = useMutation(GENERATE_CONTENT, {
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
    
    const productId = selectedProduct.id;
    
    switch(generationType) {
      case 'seo':
        generateSEOTags({
          variables: {
            input: {
              productId
            }
          }
        });
        break;
      case 'title':
        generateTitle({
          variables: {
            input: {
              productId
            }
          }
        });
        break;
      case 'description':
        generateDescription({
          variables: {
            input: {
              productId,
              promptType: "product_description",
              sentiment: "positive"
            }
          }
        });
        break;
      case 'full':
        generateFullListing({
          variables: {
            input: {
              productId
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
    const generationTypes = [
      { 
        id: 'seo', 
        name: 'SEO Tags', 
        icon: <Tag size={24} />,
        description: 'Generate SEO meta tags, keywords, and hashtags to improve visibility'
      },
      { 
        id: 'title', 
        name: 'Product Title', 
        icon: <Type size={24} />,
        description: 'Create attention-grabbing, keyword-rich product titles'
      },
      { 
        id: 'description', 
        name: 'Product Description', 
        icon: <FileText size={24} />,
        description: 'Generate compelling product descriptions that convert'
      },
      { 
        id: 'full', 
        name: 'Full Listing', 
        icon: <FileCheck size={24} />,
        description: 'Create a complete product listing with title, description, and features'
      }
    ];

    return (
      <div className="space-y-6">
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
        
        // More robust extraction of meta description
        let metaDescription = '';
        const metaDescriptionRegexes = [
          /Meta Description[^"]*"([^"]+)"/i,
          /Meta Description[^:]*:\s*"([^"]+)"/i,
          /Meta Description[^:]*:\s*(.+?)(?=\n|$)/i
        ];
        
        for (const regex of metaDescriptionRegexes) {
          const match = content.match(regex);
          if (match && match[1]) {
            metaDescription = match[1].trim();
            break;
          }
        }
        
        // Extract focus keywords with more robust patterns
        let focusKeywords = [];
        const focusKeywordsSection = content.match(/Focus Keywords[^:]*:([\s\S]*?)(?=Secondary Keywords|Suggested Hashtags|HTML|$)/i);
        
        if (focusKeywordsSection && focusKeywordsSection[1]) {
          focusKeywords = focusKeywordsSection[1]
            .split('\n')
            .map(line => line.replace(/^[-•*]\s*|^\d+\.\s*|^"?|"?$/g, '').trim())
            .filter(Boolean);
        }
        
        // Extract secondary keywords
        let secondaryKeywords = [];
        const secondaryKeywordsSection = content.match(/Secondary Keywords[^:]*:([\s\S]*?)(?=Focus Keywords|Suggested Hashtags|HTML|$)/i);
        
        if (secondaryKeywordsSection && secondaryKeywordsSection[1]) {
          secondaryKeywords = secondaryKeywordsSection[1]
            .split('\n')
            .map(line => line.replace(/^[-•*]\s*|^\d+\.\s*|^"?|"?$/g, '').trim())
            .filter(Boolean);
        }
        
        // Extract hashtags
        let hashtags = [];
        const hashtagsSection = content.match(/Suggested Hashtags[^:]*:([\s\S]*?)(?=Focus Keywords|Secondary Keywords|HTML|$)/i);
        
        if (hashtagsSection && hashtagsSection[1]) {
          // First try to extract hashtags that are on separate lines
          const hashtagLines = hashtagsSection[1]
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean);
          
          // Process each line to extract hashtags
          for (const line of hashtagLines) {
            // If the line contains hashtags, extract them
            if (line.includes('#')) {
              const tagsInLine = line.split(/\s+/)
                .filter(word => word.startsWith('#'))
                .map(tag => tag.replace(/[,.]$/, ''));
              hashtags = [...hashtags, ...tagsInLine];
            } else {
              // If no hashtag symbol, add it (assuming it's a hashtag without the # symbol)
              const cleanedTag = line.replace(/^[-•*]\s*|^\d+\.\s*|^"?|"?$/g, '').trim();
              if (cleanedTag) hashtags.push(`#${cleanedTag}`);
            }
          }
          
          // Remove duplicates
          hashtags = [...new Set(hashtags)];
        }
        
        // Extract HTML code - look for both code blocks and HTML tags
        let htmlCode = '';
        
        // First try to find HTML code in a code block
        const htmlCodeBlock = content.match(/```(?:html)?\s*([\s\S]*?)```/);
        if (htmlCodeBlock && htmlCodeBlock[1]) {
          htmlCode = htmlCodeBlock[1].trim();
        } else {
          // If no code block, try to find HTML tags section
          const htmlSection = content.match(/HTML(?:\s*Code)?[^:]*:([\s\S]*?)(?=Focus Keywords|Secondary Keywords|Suggested Hashtags|$)/i);
          if (htmlSection && htmlSection[1]) {
            // Extract anything that looks like HTML tags
            const htmlTags = htmlSection[1].match(/<[^>]+>[^<]*<\/[^>]+>|<[^/>]+\/>/g);
            if (htmlTags) {
              htmlCode = htmlTags.join('\n');
            } else {
              htmlCode = htmlSection[1].trim();
            }
          }
        }
        
        // Only show HTML preview if we have valid HTML
        const hasValidHtml = htmlCode && (
          htmlCode.includes('<') && 
          htmlCode.includes('>') && 
          !htmlCode.includes('image-url') && 
          !htmlCode.includes('replace')
        );
        
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
            {metaDescription && (
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
            )}
            
            {/* Focus Keywords */}
            {focusKeywords.length > 0 && (
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
            )}
            
            {/* Secondary Keywords */}
            {secondaryKeywords.length > 0 && (
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
            )}
            
            {/* Hashtags */}
            {hashtags.length > 0 && (
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
            )}
            
            {/* HTML Code - only show if we have valid HTML */}
            {hasValidHtml && (
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
            
            {/* If nothing was extracted properly, fall back to the original markdown display */}
            {!metaDescription && focusKeywords.length === 0 && secondaryKeywords.length === 0 && 
             hashtags.length === 0 && !hasValidHtml && (
              <div className="prose prose-invert prose-purple max-w-none">
                <ReactMarkdown
                  components={{
                    code({node, inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          language={match[1]}
                          style={atomDark}
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {generatedContent.content}
                </ReactMarkdown>
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