const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cheerio = require('cheerio');
const UserAgent = require('user-agents');
const fs = require('fs');
const path = require('path');

// Add stealth plugin to puppeteer
puppeteer.use(StealthPlugin());

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
    
    // Create screenshots directory if it doesn't exist
    const screenshotsDir = path.join(__dirname, '../screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    // Generate a random user agent
    const userAgent = new UserAgent({ deviceCategory: 'desktop' });
    
    // Launch browser with stealth plugin
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--window-size=1920,1080',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage'
      ],
      ignoreHTTPSErrors: true
    });
    
    const page = await browser.newPage();
    
    // Randomize viewport size slightly
    const width = 1920 + Math.floor(Math.random() * 100);
    const height = 1080 + Math.floor(Math.random() * 100);
    await page.setViewport({ width, height });
    
    // Set a realistic user agent
    await page.setUserAgent(userAgent.toString());
    
    // Set extra headers to look more like a real browser
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1'
    });
    
    // Mask WebDriver
    await page.evaluateOnNewDocument(() => {
      // Pass WebDriver test
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
      
      // Pass Chrome test
      window.chrome = {
        runtime: {},
      };
      
      // Pass Permissions test
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
      
      // Overwrite the `plugins` property to use a custom getter
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      
      // Overwrite the `languages` property to use a custom getter
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
    });
    
    console.log(`[productScraper] Navigating to URL: ${url}`);
    
    // Try different approaches to bypass anti-bot measures
    let content = '';
    let success = false;
    
    // Approach 1: Direct navigation with stealth and human-like behavior
    try {
      // Add random delay before navigation
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      const response = await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 60000 
      });
      
      console.log(`[productScraper] Page loaded with status: ${response.status()}`);
      
      // Check for CAPTCHA
      const pageContent = await page.content();
      if (!pageContent.includes('captcha') && 
          !pageContent.includes('robot') && 
          !pageContent.includes('verify you are a human')) {
        
        // Simulate human-like behavior
        await simulateHumanBehavior(page);
        
        // Scroll to load lazy content
        await autoScroll(page);
        
        // Wait for dynamic content
        await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
        
        content = await page.content();
        success = true;
      } else {
        console.log('[productScraper] CAPTCHA detected in direct approach');
        
        // Take screenshot of CAPTCHA for debugging
        const captchaScreenshotPath = path.join(screenshotsDir, `captcha-${Date.now()}.png`);
        await page.screenshot({ path: captchaScreenshotPath, fullPage: true });
        console.log(`[productScraper] CAPTCHA screenshot saved to: ${captchaScreenshotPath}`);
      }
    } catch (error) {
      console.log(`[productScraper] Direct approach failed: ${error.message}`);
    }
    
    // Approach 2: Try using a Google cache version if direct approach failed
    if (!success) {
      try {
        console.log('[productScraper] Trying Google cache version');
        const cacheUrl = `https://webcache.googleusercontent.com/search?q=cache:${encodeURIComponent(url)}`;
        
        await page.goto(cacheUrl, { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        content = await page.content();
        if (content.length > 5000) { // Basic check that we got meaningful content
          success = true;
          console.log('[productScraper] Successfully loaded from Google cache');
        }
      } catch (error) {
        console.log(`[productScraper] Google cache approach failed: ${error.message}`);
      }
    }
    
    // Approach 3: Try using a mobile user agent if previous approaches failed
    if (!success) {
      try {
        console.log('[productScraper] Trying with mobile user agent');
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1');
        
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check for CAPTCHA
        const pageContent = await page.content();
        if (!pageContent.includes('captcha') && 
            !pageContent.includes('robot') && 
            !pageContent.includes('verify you are a human')) {
          
          await autoScroll(page);
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          content = await page.content();
          success = true;
          console.log('[productScraper] Successfully loaded with mobile user agent');
        }
      } catch (error) {
        console.log(`[productScraper] Mobile user agent approach failed: ${error.message}`);
      }
    }
    
    // Approach 4: Try using a different referrer
    if (!success) {
      try {
        console.log('[productScraper] Trying with Google referrer');
        
        await page.setExtraHTTPHeaders({
          'Referer': 'https://www.google.com/'
        });
        
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check for CAPTCHA
        const pageContent = await page.content();
        if (!pageContent.includes('captcha') && 
            !pageContent.includes('robot') && 
            !pageContent.includes('verify you are a human')) {
          
          await autoScroll(page);
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          content = await page.content();
          success = true;
          console.log('[productScraper] Successfully loaded with Google referrer');
        }
      } catch (error) {
        console.log(`[productScraper] Google referrer approach failed: ${error.message}`);
      }
    }
    
    // Approach 5: Try using a different browser profile
    if (!success) {
      try {
        console.log('[productScraper] Trying with Firefox profile');
        
        await browser.close();
        
        // Launch a new browser with Firefox profile
        browser = await puppeteer.launch({
          headless: 'new',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0'
          ]
        });
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check for CAPTCHA
        const pageContent = await page.content();
        if (!pageContent.includes('captcha') && 
            !pageContent.includes('robot') && 
            !pageContent.includes('verify you are a human')) {
          
          await autoScroll(page);
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          content = await page.content();
          success = true;
          console.log('[productScraper] Successfully loaded with Firefox profile');
        }
      } catch (error) {
        console.log(`[productScraper] Firefox profile approach failed: ${error.message}`);
      }
    }
    
    // If all approaches failed, try to extract from minimal data
    if (!success) {
      console.log('[productScraper] All approaches failed, attempting to extract from minimal data');
      
      // Try one last time with minimal interaction
      try {
        await browser.close();
        
        browser = await puppeteer.launch({
          headless: 'new',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-javascript',  // Disable JavaScript to avoid detection
            '--incognito'            // Use incognito mode
          ]
        });
        
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Go directly to the page with minimal waiting
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        content = await page.content();
        
        // Even if we got a CAPTCHA, try to extract what we can
        console.log('[productScraper] Attempting extraction from minimal data');
      } catch (error) {
        console.log(`[productScraper] Minimal extraction approach failed: ${error.message}`);
        throw new Error('All scraping approaches failed');
      }
    }
    
    // Take screenshot for debugging
    const screenshotPath = path.join(screenshotsDir, `product-screenshot-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`[productScraper] Screenshot saved to: ${screenshotPath}`);
    
    const $ = cheerio.load(content);
    
    // Universal product data extraction
    console.log('[productScraper] Extracting product data');
    
    const title = extractTitle($) || extractMetaTitle($);
    console.log(`[productScraper] Title: ${title}`);
    
    const price = extractPrice($);
    console.log(`[productScraper] Price: ${price}`);
    
    const description = extractDescription($) || extractMetaDescription($);
    console.log(`[productScraper] Description length: ${description?.length || 0}`);
    
    const images = await extractAllImages($, page) || [];
    console.log(`[productScraper] Images found: ${images.length}`);
    
    const rating = extractRating($) || 'Not available';
    console.log(`[productScraper] Rating: ${rating}`);
    
    const reviews = extractReviews($) || [];
    console.log(`[productScraper] Reviews found: ${reviews.length}`);
    
    const specifications = extractSpecifications($) || 'Not available';
    console.log(`[productScraper] Specifications length: ${specifications?.length || 0}`);
    
    const features = extractFeatures($) || [];
    console.log(`[productScraper] Features found: ${features.length}`);
    
    const productData = {
      title: title || 'Product Title Not Available',
      price: price || 'Price Not Available',
      description: description || 'Description Not Available',
      images,
      rating,
      reviews,
      specifications,
      features,
      sourceUrl: url,
      platform: domain,
      category: extractCategory($, domain) || 'Other'
    };
    
    console.log(`[productScraper] Successfully scraped data from: ${url}`);
    
    return productData;
  } catch (error) {
    console.error(`[productScraper] Error scraping ${url}:`, error);
    
    // Return partial data if possible
    return {
      title: 'Could not retrieve product data',
      price: 'Not available',
      description: `Failed to scrape product data: ${error.message}`,
      images: [],
      rating: 'Not available',
      reviews: [],
      specifications: 'Not available',
      features: [],
      sourceUrl: url,
      platform: new URL(url).hostname,
      category: 'Other'
    };
  } finally {
    if (browser) {
      await browser.close();
      console.log('[productScraper] Browser closed');
    }
  }
}

/**
 * Simulates human-like behavior on the page
 */
async function simulateHumanBehavior(page) {
  // Random mouse movements
  for (let i = 0; i < 5; i++) {
    const x = 100 + Math.floor(Math.random() * 700);
    const y = 100 + Math.floor(Math.random() * 700);
    await page.mouse.move(x, y);
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  }
  
  // Random scrolling
  await page.evaluate(() => {
    window.scrollBy(0, 300 + Math.random() * 400);
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
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
 * Extract title from meta tags if normal extraction fails
 */
function extractMetaTitle($) {
  return $('meta[property="og:title"]').attr('content') || 
         $('meta[name="twitter:title"]').attr('content') || 
         $('meta[name="title"]').attr('content');
}

/**
 * Extract description from meta tags if normal extraction fails
 */
function extractMetaDescription($) {
  return $('meta[property="og:description"]').attr('content') || 
         $('meta[name="twitter:description"]').attr('content') || 
         $('meta[name="description"]').attr('content');
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