const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

/**
 * Scrapes product data from various e-commerce websites
 * @param {string} url - The product URL to scrape
 * @returns {Object} - Extracted product data
 */
async function scrapeProduct(url) {
  console.log(`[productScraper] Starting to scrape: ${url}`);
  
  let browser;
  try {
    const domain = new URL(url).hostname;
    console.log(`[productScraper] Detected domain: ${domain}`);
    
    // Launch browser with additional options to avoid detection
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--window-size=1920,1080',
      ]
    });
    
    const page = await browser.newPage();
    
    // Set extra headers to look more like a real browser
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    });
    
    // Set viewport and user agent to mimic real browser
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36');
    
    console.log(`[productScraper] Navigating to URL: ${url}`);
    
    // Navigate to URL with retry mechanism
    let retries = 3;
    let content = '';
    
    while (retries > 0) {
      try {
        // Add random delay to avoid detection - using setTimeout instead of waitForTimeout
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        const response = await page.goto(url, { 
          waitUntil: 'networkidle2', 
          timeout: 60000 
        });
        
        console.log(`[productScraper] Page loaded with status: ${response.status()}`);
        
        if (response.status() === 200) {
          // Check for CAPTCHA or robot detection
          const pageContent = await page.content();
          if (pageContent.includes('captcha') || 
              pageContent.includes('robot') || 
              pageContent.includes('verify you are a human')) {
            console.log('[productScraper] CAPTCHA or robot check detected');
            throw new Error('CAPTCHA detected');
          }
          
          // Scroll down to load lazy-loaded content
          console.log('[productScraper] Auto-scrolling page');
          await autoScroll(page);
          
          // Wait for dynamic content to load - using setTimeout instead of waitForTimeout
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Get page content
          content = await page.content();
          console.log(`[productScraper] Content retrieved, length: ${content.length}`);
          break;
        } else {
          throw new Error(`Received status code: ${response.status()}`);
        }
      } catch (error) {
        retries--;
        console.log(`[productScraper] Retry attempt left: ${retries}, Error: ${error.message}`);
        if (retries === 0) throw error;
        
        // Wait before retrying - using setTimeout instead of waitForTimeout
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    const $ = cheerio.load(content);
    
    // Take screenshot for debugging
    const screenshotPath = `product-screenshot-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`[productScraper] Screenshot saved to: ${screenshotPath}`);
    
    // Universal product data extraction
    console.log('[productScraper] Extracting product data');
    
    const title = extractTitle($);
    console.log(`[productScraper] Title: ${title}`);
    
    const price = extractPrice($);
    console.log(`[productScraper] Price: ${price}`);
    
    const description = extractDescription($);
    console.log(`[productScraper] Description length: ${description?.length || 0}`);
    
    const images = await extractAllImages($, page);
    console.log(`[productScraper] Images found: ${images.length}`);
    
    const rating = extractRating($);
    console.log(`[productScraper] Rating: ${rating}`);
    
    const reviews = extractReviews($);
    console.log(`[productScraper] Reviews found: ${reviews.length}`);
    
    const specifications = extractSpecifications($);
    console.log(`[productScraper] Specifications length: ${specifications?.length || 0}`);
    
    const features = extractFeatures($);
    console.log(`[productScraper] Features found: ${features.length}`);
    
    const productData = {
      title,
      price,
      description,
      images,
      rating,
      reviews,
      specifications,
      features,
      sourceUrl: url,
      platform: domain,
      category: extractCategory($, domain)
    };
    
    console.log(`[productScraper] Successfully scraped data from: ${url}`);
    
    return productData;
  } catch (error) {
    console.error(`[productScraper] Error scraping ${url}:`, error);
    throw new Error(`Failed to scrape product: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
      console.log('[productScraper] Browser closed');
    }
  }
}

/**
 * Auto-scrolls the page to load lazy content
 */
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        
        if (totalHeight >= scrollHeight || totalHeight > 10000) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

/**
 * Extracts the product title using multiple selectors
 */
function extractTitle($) {
  const selectors = [
    'h1', // Generic h1 tag
    '#productTitle', // Amazon
    '.product-title', // Alibaba
    '.B_NuCI', // Flipkart
    '.wt-text-body-01', // Etsy
    '.ProductTitle__ProductTitleContainer-sc-1os0jcn-0', // Meesho
    '[data-testid="product-title"]', // Modern sites
    '[itemprop="name"]', // Schema.org markup
    'title' // Fallback to page title
  ];
  
  return extractWithSelectors($, selectors) || $('title').text().trim();
}

/**
 * Extracts the product price using multiple selectors
 */
function extractPrice($) {
  const selectors = [
    '.a-price .a-offscreen', // Amazon
    '.product-price-value', // Alibaba
    '._30jeq3', // Flipkart
    '.wt-text-title-03', // Etsy
    '.ProductPrice__ProductPriceContainer-sc-1yab8o5-0', // Meesho
    '[data-testid="product-price"]', // Modern sites
    '[itemprop="price"]', // Schema.org markup
    '.price', // Common class
    'span:contains("$")', // Generic price detection
    'span:contains("₹")',
    'span:contains("€")',
    'span:contains("£")'
  ];
  
  return extractWithSelectors($, selectors);
}

/**
 * Extracts the product description using multiple selectors
 */
function extractDescription($) {
  const selectors = [
    '#productDescription', // Amazon
    '.product-description', // Alibaba
    '._1mXcCf', // Flipkart
    '.wt-content-toggle__body', // Etsy
    '.ProductDescription__ProductDescriptionContainer-sc-1w9p3us-0', // Meesho
    '[data-testid="product-description"]', // Modern sites
    '[itemprop="description"]', // Schema.org markup
    '.description', // Common class
    '.product-details',
    '#description'
  ];
  
  let description = extractWithSelectors($, selectors);
  
  // If no description found, try to get first few paragraphs
  if (!description) {
    description = $('p').slice(0, 3).map((i, el) => $(el).text().trim()).get().join(' ');
  }
  
  return description;
}

/**
 * Extracts all product images
 */
async function extractAllImages($, page) {
  // Try to extract from structured data first (most reliable)
  try {
    const structuredData = await page.evaluate(() => {
      const elements = document.querySelectorAll('script[type="application/ld+json"]');
      for (const element of elements) {
        try {
          const data = JSON.parse(element.textContent);
          if (data.image) {
            return Array.isArray(data.image) ? data.image : [data.image];
          }
        } catch (e) {
          // Continue to next element
        }
      }
      return null;
    });
    
    if (structuredData && structuredData.length > 0) {
      return structuredData;
    }
  } catch (e) {
    console.log('Error extracting structured image data:', e);
  }
  
  // Fallback to DOM extraction
  const imageSelectors = [
    // High-quality product images
    '[data-zoom-image]',
    '[data-image]',
    '[data-src]',
    '[data-lazy-src]',
    '[itemprop="image"]',
    '.product-image img',
    '.product-gallery img',
    // Platform specific
    '#imgTagWrapperId img', // Amazon
    '.magnifier-image', // Alibaba
    '._2amPTt img', // Flipkart
    '.wt-max-width-full img', // Etsy
    '.Image__ImageContainer-sc-1lpwfm-0 img', // Meesho
    // Generic image selectors
    'img[src*="product"]',
    'img[src*="large"]',
    'img[src*="zoom"]',
    'img[src*="full"]'
  ];
  
  const images = new Set();
  
  // Try each selector
  for (const selector of imageSelectors) {
    $(selector).each((i, el) => {
      // Check multiple attributes where images might be stored
      const attributes = ['src', 'data-src', 'data-zoom-image', 'data-image', 'data-lazy-src'];
      
      for (const attr of attributes) {
        const src = $(el).attr(attr);
        if (src && !src.includes('data:image') && !src.includes('blank.gif') && src.match(/\.(jpeg|jpg|png|webp)/i)) {
          // Convert relative URLs to absolute
          const absoluteSrc = src.startsWith('http') ? src : new URL(src, page.url()).href;
          images.add(absoluteSrc);
        }
      }
    });
    
    // If we found images with this selector, no need to try others
    if (images.size > 0) break;
  }
  
  // If still no images, get all images above a certain size
  if (images.size === 0) {
    await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs
        .filter(img => img.width > 200 && img.height > 200)
        .map(img => img.src);
    }).then(largeImages => {
      largeImages.forEach(src => images.add(src));
    });
  }
  
  return Array.from(images);
}

/**
 * Extracts the product rating using multiple selectors
 */
function extractRating($) {
  const selectors = [
    '#acrPopover', // Amazon
    '.rating-star', // Alibaba
    '._3LWZlK', // Flipkart
    '.wt-screen-reader-only', // Etsy
    '.RatingBar__RatingBarContainer-sc-1bgrr1b-0', // Meesho
    '[data-testid="product-rating"]', // Modern sites
    '[itemprop="ratingValue"]', // Schema.org markup
    '.rating', // Common class
    '.stars',
    '.star-rating'
  ];
  
  return extractWithSelectors($, selectors);
}

/**
 * Extracts product reviews using multiple selectors
 */
function extractReviews($) {
  const selectors = [
    '.a-row.a-spacing-small.review-data', // Amazon
    '.review-item', // Alibaba
    '.t-ZTKy', // Flipkart
    '.review-text', // Etsy
    '.ReviewCard__ReviewCardContainer-sc-1xvrrp9-0', // Meesho
    '[data-testid="product-review"]', // Modern sites
    '[itemprop="review"]', // Schema.org markup
    '.review', // Common class
    '.customer-review',
    '.user-review'
  ];
  
  const reviews = [];
  
  for (const selector of selectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      elements.each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 10) { // Avoid empty or very short reviews
          reviews.push(text);
        }
      });
      
      if (reviews.length > 0) break;
    }
  }
  
  return reviews;
}

/**
 * Extracts product specifications using multiple selectors
 */
function extractSpecifications($) {
  const selectors = [
    '#productDetails_techSpec_section_1', // Amazon
    '#detailBullets_feature_div', // Amazon alternative
    '.product-props-list', // Alibaba
    '._14cfVK', // Flipkart
    '.wt-product-details__content', // Etsy
    '.SpecificationTable__SpecificationTableContainer-sc-10va7k1-0', // Meesho
    '[data-testid="product-specifications"]', // Modern sites
    '[itemprop="additionalProperty"]', // Schema.org markup
    '.specifications', // Common class
    '.product-specs',
    '.tech-specs',
    'table' // Fallback to any table
  ];
  
  let specs = extractWithSelectors($, selectors);
  
  // If no specs found, try to extract from tables
  if (!specs) {
    $('table').each((i, table) => {
      const tableText = $(table).text().trim();
      if (tableText.length > 50 && !specs) {
        specs = tableText;
      }
    });
  }
  
  return specs;
}

/**
 * Extracts product features using multiple selectors
 */
function extractFeatures($) {
  const selectors = [
    '#feature-bullets li', // Amazon
    '.product-feature li', // Alibaba
    '._2418kt li', // Flipkart
    '.wt-list--bullet li', // Etsy
    '.ProductFeatures__ProductFeaturesContainer-sc-1bmhj60-0 li', // Meesho
    '[data-testid="product-features"] li', // Modern sites
    '[itemprop="featureList"] li', // Schema.org markup
    '.features li', // Common class
    '.product-highlights li',
    'ul li' // Fallback to any list
  ];
  
  const features = [];
  
  for (const selector of selectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      elements.each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 5 && !features.includes(text)) {
          features.push(text);
        }
      });
      
      if (features.length > 0) break;
    }
  }
  
  // Limit to reasonable number
  return features.slice(0, 15);
}

/**
 * Helper function to extract content using multiple selectors
 */
function extractWithSelectors($, selectors) {
  for (const selector of selectors) {
    const element = $(selector).first();
    if (element.length > 0) {
      const text = element.text().trim();
      if (text) return text;
      
      // Check if it's an attribute value
      const attrValue = element.attr('content') || element.attr('value');
      if (attrValue) return attrValue;
    }
  }
  return null;
}

// Add a new function to extract category
function extractCategory($, domain) {
  const selectors = [
    '#wayfinding-breadcrumbs_feature_div', // Amazon
    '.breadcrumb', // Common class
    '[itemprop="breadcrumb"]', // Schema.org markup
    '.a-breadcrumb',
    '.product-category',
    '.category-path'
  ];
  
  let category = extractWithSelectors($, selectors);
  
  // If no category found, try to extract from meta tags
  if (!category) {
    const metaCategory = $('meta[property="product:category"]').attr('content') || 
                         $('meta[name="category"]').attr('content');
    if (metaCategory) {
      category = metaCategory;
    }
  }
  
  // If still no category, use domain-specific fallbacks
  if (!category && domain.includes('amazon')) {
    // Try Amazon-specific category extraction
    const amazonCategory = $('#nav-subnav').attr('data-category') ||
                          $('.nav-a-content').first().text().trim();
    if (amazonCategory) {
      category = amazonCategory;
    }
  }
  
  return category || 'Other';
}

module.exports = { scrapeProduct };