const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cheerio = require('cheerio');
const UserAgent = require('user-agents');
const fs = require('fs');
const path = require('path');
const CaptchaSolver = require('captcha-solver');

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
    
    // Generate a random user agent - specifically for desktop browsers
    const userAgent = new UserAgent({ 
      deviceCategory: 'desktop',
      platform: 'MacIntel'
    }).toString();
    
    // Launch browser with stealth plugin
    browser = await puppeteer.launch({
      headless: false, // Use visible browser for Amazon
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--window-size=1920,1080',
        '--disable-blink-features=AutomationControlled'
      ],
      ignoreHTTPSErrors: true
    });
    
    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(userAgent);
    
    // Set cookies to appear more like a returning user
    await page.setCookie({
      name: 'session-id',
      value: `${Date.now()}`,
      domain: `.${domain}`,
      path: '/',
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });
    
    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Referer': 'https://www.google.com/'
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
        loadTimes: function() {},
        csi: function() {},
        app: {}
      };
      
      // Pass Permissions test
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
      
      // Overwrite the `plugins` property
      Object.defineProperty(navigator, 'plugins', {
        get: () => {
          const plugins = [
            { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
            { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: 'Portable Document Format' },
            { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' }
          ];
          
          plugins.item = function(index) { return this[index]; };
          plugins.namedItem = function(name) {
            for (const plugin of plugins) {
              if (plugin.name === name) return plugin;
            }
            return null;
          };
          
          return plugins;
        }
      });
      
      // Overwrite the `languages` property
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
    });
    
    console.log(`[productScraper] Navigating to URL: ${url}`);
    
    // Navigate to URL
    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 60000 
    });
    
    console.log(`[productScraper] Page loaded`);
    
    // Take screenshot for debugging
    const screenshotPath = path.join(screenshotsDir, `product-screenshot-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`[productScraper] Screenshot saved to: ${screenshotPath}`);
    
    // Check for CAPTCHA
    const hasCaptcha = await page.evaluate(() => {
      return document.body.textContent.includes('captcha') || 
             document.body.textContent.includes('robot') || 
             document.body.textContent.includes('verify you are a human');
    });
    
    if (hasCaptcha) {
      console.log('[productScraper] CAPTCHA detected - waiting for manual solving');
      
      // Wait for manual CAPTCHA solving (30 seconds)
      await new Promise(resolve => setTimeout(resolve, 30000));
      
      // Take another screenshot after CAPTCHA solving attempt
      const afterCaptchaScreenshot = path.join(screenshotsDir, `after-captcha-${Date.now()}.png`);
      await page.screenshot({ path: afterCaptchaScreenshot, fullPage: true });
      console.log(`[productScraper] Post-CAPTCHA screenshot saved to: ${afterCaptchaScreenshot}`);
    }
    
    // Simulate human-like behavior
    await simulateHumanBehavior(page);
    
    // Scroll to load lazy content
    await autoScroll(page);
    
    // Wait for product details to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get page content
    const content = await page.content();
    const $ = cheerio.load(content);
    
    // Extract product data based on the domain
    let productData = {};
    
    if (domain.includes('amazon')) {
      productData = extractAmazonData($, page, url);
    } else if (domain.includes('flipkart')) {
      productData = extractFlipkartData($, url);
    } else {
      // Generic extraction for unknown platforms
      productData = extractGenericData($, url);
    }
    
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
 * Extract Amazon product data
 */
function extractAmazonData($, page, url) {
  console.log('[productScraper] Extracting Amazon data');
  
  // Extract title
  const title = $('#productTitle').text().trim() || 
                $('h1.a-size-large').text().trim();
  
  console.log(`[productScraper] Amazon title: ${title}`);
  
  // Extract price
  let price = $('.a-price .a-offscreen').first().text().trim() || 
              $('.a-price .a-price-whole').first().text().trim() || 
              $('#priceblock_ourprice').text().trim() || 
              $('#priceblock_dealprice').text().trim();
  
  console.log(`[productScraper] Amazon price: ${price}`);
  
  // Extract description
  const description = $('#productDescription p').text().trim() || 
                      $('#feature-bullets').text().trim() || 
                      $('.a-expander-content').text().trim();
  
  console.log(`[productScraper] Amazon description length: ${description?.length || 0}`);
  
  // Extract images
  const images = [];
  
  // Try to get images from the main image
  const mainImage = $('#landingImage').attr('src') || $('#imgBlkFront').attr('src');
  if (mainImage) {
    images.push(mainImage);
  }
  
  // Try to get images from thumbnails
  $('#altImages img').each((i, el) => {
    const src = $(el).attr('src');
    if (src && !src.includes('data:image') && !src.includes('blank.gif') && !images.includes(src)) {
      // Convert thumbnail URL to full-size image URL
      const fullSizeSrc = src.replace(/_[S|T]C_/, '_AC_');
      images.push(fullSizeSrc);
    }
  });
  
  // Try to get images from the image gallery
  $('.imgTagWrapper img').each((i, el) => {
    const src = $(el).attr('src');
    if (src && !src.includes('data:image') && !src.includes('blank.gif') && !images.includes(src)) {
      images.push(src);
    }
  });
  
  console.log(`[productScraper] Amazon images found: ${images.length}`);
  
  // Extract rating
  const rating = $('#acrPopover').attr('title') || 
                $('.a-icon-star').first().text().trim();
  
  console.log(`[productScraper] Amazon rating: ${rating}`);
  
  // Extract reviews
  const reviews = [];
  $('.a-row.a-spacing-small.review-data').each((i, el) => {
    const text = $(el).text().trim();
    if (text && text.length > 10) {
      reviews.push(text);
    }
  });
  
  console.log(`[productScraper] Amazon reviews found: ${reviews.length}`);
  
  // Extract specifications
  const specifications = $('#productDetails_techSpec_section_1').text().trim() || 
                        $('#detailBullets_feature_div').text().trim() || 
                        $('.a-section.a-spacing-small.a-spacing-top-small').text().trim();
  
  console.log(`[productScraper] Amazon specifications length: ${specifications?.length || 0}`);
  
  // Extract features
  const features = [];
  $('#feature-bullets li').each((i, el) => {
    const text = $(el).text().trim();
    if (text && text.length > 5 && !features.includes(text)) {
      features.push(text);
    }
  });
  
  console.log(`[productScraper] Amazon features found: ${features.length}`);
  
  // Extract category from breadcrumbs
  const category = $('#wayfinding-breadcrumbs_feature_div').text().trim() || 
                  $('.a-breadcrumb').text().trim();
  
  return {
    title: title || 'Amazon Product',
    price: price || 'Price not available',
    description: description || 'Description not available',
    images: images.filter(img => img && typeof img === 'string'),
    rating: rating || 'Rating not available',
    reviews: reviews.slice(0, 10),
    specifications: specifications || 'Specifications not available',
    features: features.slice(0, 15),
    sourceUrl: url,
    platform: 'amazon',
    category: category || 'Other'
  };
}

/**
 * Extract Flipkart product data
 */
function extractFlipkartData($, url) {
  console.log('[productScraper] Extracting Flipkart data');
  
  // Extract title
  const title = $('.B_NuCI').text().trim() || 
                $('h1.yhB1nd').text().trim() || 
                $('span.B_NuCI').text().trim();
  
  console.log(`[productScraper] Flipkart title: ${title}`);
  
  // Extract price
  let price = $('._30jeq3').text().trim();
  
  // If price contains special offers, try to get the actual price
  if (!price || price.includes('Bank Offer')) {
    price = $('div[class*="_30jeq3"]').first().text().trim();
  }
  
  console.log(`[productScraper] Flipkart price: ${price}`);
  
  // Extract description
  const description = $('._1mXcCf').text().trim() || 
                      $('._1AN87F').text().trim();
  
  console.log(`[productScraper] Flipkart description length: ${description?.length || 0}`);
  
  // Extract images
  const images = [];
  $('img[class*="q6DClP"]').each((i, el) => {
    const src = $(el).attr('src');
    if (src && !src.includes('data:image') && !images.includes(src)) {
      // Convert to larger image URL if possible
      const largerSrc = src.replace(/128\/128/g, '832/832');
      images.push(largerSrc);
    }
  });
  
  // If no images found, try other selectors
  if (images.length === 0) {
    $('img[class*="_396cs4"]').each((i, el) => {
      const src = $(el).attr('src');
      if (src && !src.includes('data:image') && !images.includes(src)) {
        images.push(src);
      }
    });
  }
  
  console.log(`[productScraper] Flipkart images found: ${images.length}`);
  
  // Extract rating
  const rating = $('._3LWZlK').first().text().trim();
  
  console.log(`[productScraper] Flipkart rating: ${rating}`);
  
  // Extract reviews count
  const reviewsCount = $('span[class*="_2_R_DZ"]').text().trim();
  
  console.log(`[productScraper] Flipkart reviews count: ${reviewsCount}`);
  
  // Extract reviews
  const reviews = [];
  $('.t-ZTKy').each((i, el) => {
    const text = $(el).text().trim();
    if (text && text.length > 10) {
      reviews.push(text);
    }
  });
  
  console.log(`[productScraper] Flipkart reviews found: ${reviews.length}`);
  
  // Extract specifications
  const specifications = $('._14cfVK').text().trim() || 
                        $('div[class*="_3k-BhJ"]').text().trim();
  
  console.log(`[productScraper] Flipkart specifications length: ${specifications?.length || 0}`);
  
  // Extract features
  const features = [];
  $('._2418kt li, ._1133chaP li').each((i, el) => {
    const text = $(el).text().trim();
    if (text && text.length > 5 && !features.includes(text)) {
      features.push(text);
    }
  });
  
  // If no features found, try to extract from highlights
  if (features.length === 0) {
    $('div:contains("Highlights") + div li').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 5 && !features.includes(text)) {
        features.push(text);
      }
    });
  }
  
  console.log(`[productScraper] Flipkart features found: ${features.length}`);
  
  // Extract category from breadcrumbs
  const category = $('._3GIHBu').text().trim() || 
                  $('a[class*="_2whKao"]').map((i, el) => $(el).text().trim()).get().join(' > ');
  
  return {
    title: title || 'Flipkart Product',
    price: price || 'Price not available',
    description: description || 'Description not available',
    images: images.filter(img => img && typeof img === 'string'),
    rating: rating || 'Rating not available',
    reviews: reviews.slice(0, 10),
    specifications: specifications || 'Specifications not available',
    features: features.slice(0, 15),
    sourceUrl: url,
    platform: 'flipkart',
    category: category || 'Other'
  };
}

/**
 * Extract data from generic e-commerce sites
 */
function extractGenericData($, url) {
  console.log('[productScraper] Extracting generic data');
  
  // Extract title
  const title = $('h1').first().text().trim() || 
                $('title').text().trim() || 
                $('meta[property="og:title"]').attr('content');
  
  console.log(`[productScraper] Generic title: ${title}`);
  
  // Extract price
  const priceSelectors = [
    '.price', 
    '[itemprop="price"]', 
    '.product-price', 
    '.offer-price',
    '.current-price',
    '.sale-price'
  ];
  
  let price = '';
  for (const selector of priceSelectors) {
    const priceElement = $(selector).first();
    if (priceElement.length > 0) {
      price = priceElement.text().trim();
      if (price) break;
    }
  }
  
  console.log(`[productScraper] Generic price: ${price}`);
  
  // Extract description
  const description = $('[itemprop="description"]').text().trim() || 
                      $('.product-description').text().trim() || 
                      $('.description').text().trim() || 
                      $('meta[property="og:description"]').attr('content');
  
  console.log(`[productScraper] Generic description length: ${description?.length || 0}`);
  
  // Extract images
  const images = [];
  $('img[itemprop="image"], .product-image img, .gallery img').each((i, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src');
    if (src && !src.includes('data:image') && !images.includes(src)) {
      images.push(src);
    }
  });
  
  console.log(`[productScraper] Generic images found: ${images.length}`);
  
  // Extract rating
  const rating = $('[itemprop="ratingValue"]').text().trim() || 
                $('.rating').text().trim() || 
                $('.stars').text().trim();
  
  console.log(`[productScraper] Generic rating: ${rating}`);
  
  // Extract reviews
  const reviews = [];
  $('.review, .customer-review, [itemprop="review"]').each((i, el) => {
    const text = $(el).text().trim();
    if (text && text.length > 10) {
      reviews.push(text);
    }
  });
  
  console.log(`[productScraper] Generic reviews found: ${reviews.length}`);
  
  // Extract specifications
  const specifications = $('.specifications').text().trim() || 
                        $('.product-specs').text().trim() || 
                        $('.tech-specs').text().trim();
  
  console.log(`[productScraper] Generic specifications length: ${specifications?.length || 0}`);
  
  // Extract features
  const features = [];
  $('.features li, .product-features li').each((i, el) => {
    const text = $(el).text().trim();
    if (text && text.length > 5 && !features.includes(text)) {
      features.push(text);
    }
  });
  
  console.log(`[productScraper] Generic features found: ${features.length}`);
  
  // Extract category
  const category = $('.breadcrumb').text().trim() || 
                  $('[itemprop="breadcrumb"]').text().trim();
  
  return {
    title: title || 'Product',
    price: price || 'Price not available',
    description: description || 'Description not available',
    images: images.filter(img => img && typeof img === 'string'),
    rating: rating || 'Rating not available',
    reviews: reviews.slice(0, 10),
    specifications: specifications || 'Specifications not available',
    features: features.slice(0, 15),
    sourceUrl: url,
    platform: new URL(url).hostname,
    category: category || 'Other'
  };
}

module.exports = { scrapeProduct };