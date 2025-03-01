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
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    // Generate a random user agent for desktop browsers
    const userAgent = new UserAgent({ 
      deviceCategory: 'desktop',
      platform: 'MacIntel'
    }).toString();
    
    // Launch browser with stealth plugin
    browser = await puppeteer.launch({
      headless: false, // Visible browser for manual CAPTCHA solving
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
    
    // Set cookies to mimic a returning user
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
    
    // Set extra headers to mimic a real browser
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Referer': 'https://www.google.com/'
    });
    
    // Mask WebDriver to avoid detection
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      window.chrome = { runtime: {}, loadTimes: () => {}, csi: () => {}, app: {} };
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: Notification.permission })
          : originalQuery(parameters);
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
          { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: 'Portable Document Format' },
          { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' }
        ]
      });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    });
    
    console.log(`[productScraper] Navigating to URL: ${url}`);
    
    // Navigate to URL with retry logic
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    console.log(`[productScraper] Page loaded`);
    
    // Take screenshot for debugging
    const screenshotPath = path.join(screenshotsDir, `product-screenshot-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`[productScraper] Screenshot saved to: ${screenshotPath}`);
    
    // Check for CAPTCHA
    const hasCaptcha = await page.evaluate(() => {
      return document.body.textContent.toLowerCase().includes('captcha') ||
             document.body.textContent.toLowerCase().includes('robot') ||
             document.body.textContent.toLowerCase().includes('verify you are a human');
    });
    
    if (hasCaptcha) {
      console.log('[productScraper] CAPTCHA detected - waiting for manual solving');
      await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds for manual solving
      const afterCaptchaScreenshot = path.join(screenshotsDir, `after-captcha-${Date.now()}.png`);
      await page.screenshot({ path: afterCaptchaScreenshot, fullPage: true });
      console.log(`[productScraper] Post-CAPTCHA screenshot saved to: ${afterCaptchaScreenshot}`);
    }
    
    // Simulate human-like behavior
    await simulateHumanBehavior(page);
    
    // Scroll to load lazy content
    await autoScroll(page);
    
    // Wait for dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get page content
    const content = await page.content();
    const $ = cheerio.load(content);
    
    // Extract product data based on domain
    let productData = {};
    if (domain.includes('amazon')) {
      productData = extractAmazonData($, page, url);
    } else if (domain.includes('flipkart')) {
      productData = extractFlipkartData($, url);
    } else {
      productData = extractGenericData($, url); // Fallback for other platforms
    }
    
    console.log(`[productScraper] Successfully scraped data from: ${url}`);
    return productData;
  } catch (error) {
    console.error(`[productScraper] Error scraping ${url}:`, error);
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
      category: 'Unknown'
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
  for (let i = 0; i < 5; i++) {
    const x = 100 + Math.floor(Math.random() * 700);
    const y = 100 + Math.floor(Math.random() * 700);
    await page.mouse.move(x, y);
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  }
  await page.evaluate(() => window.scrollBy(0, 300 + Math.random() * 400));
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
 * Extracts Amazon-specific product data
 */
function extractAmazonData($, page, url) {
  const title = $('#productTitle').text().trim() || $('h1.a-size-large').text().trim();
  const price = $('.a-price .a-offscreen').first().text().trim() || $('#priceblock_ourprice').text().trim();
  const description = $('#productDescription p').text().trim() || $('#feature-bullets').text().trim();
  const images = [];
  $('#altImages img, .imgTagWrapper img').each((i, el) => {
    const src = $(el).attr('src');
    if (src && !src.includes('data:image') && !images.includes(src)) {
      images.push(src.replace(/_[S|T]C_/, '_AC_'));
    }
  });
  const rating = $('#acrPopover').attr('title') || $('.a-icon-star').first().text().trim();
  const reviews = $('.a-row.a-spacing-small.review-data').map((i, el) => $(el).text().trim()).get().filter(t => t.length > 10);
  const specifications = $('#productDetails_techSpec_section_1').text().trim() || $('#detailBullets_feature_div').text().trim();
  const features = $('#feature-bullets li').map((i, el) => $(el).text().trim()).get().filter(t => t.length > 5);
  const category = $('#wayfinding-breadcrumbs_feature_div').text().trim() || $('.a-breadcrumb').text().trim();

  return {
    title: title || 'Amazon Product',
    price: price || 'Not available',
    description: description || 'Not available',
    images,
    rating: rating || 'Not available',
    reviews: reviews.slice(0, 10),
    specifications: specifications || 'Not available',
    features: features.slice(0, 15),
    sourceUrl: url,
    platform: 'amazon',
    category: category || 'Unknown'
  };
}

/**
 * Extracts Flipkart-specific product data
 */
/**
 * Extracts Flipkart-specific product data
 */
function extractFlipkartData($, url) {
    console.log('[productScraper] Extracting Flipkart data');
  
    // Extract title
    const title = $('span.B_NuCI').text().trim() || $('h1.yhB1nd').text().trim() || 'Flipkart Product';
    console.log(`[productScraper] Flipkart title: ${title}`);
  
    // Extract price
    let price = $('div._30jeq3._16Jk6d').text().trim();
    if (!price) {
      price = $('div[class*="_30jeq3"]').first().text().trim() || 'Not available';
    }
    console.log(`[productScraper] Flipkart price: ${price}`);
  
    // Extract description
    const description = $('div._1mXcCf.RmoJUa').text().trim() || $('div._1UhVsV').text().trim() || 'Not available';
    console.log(`[productScraper] Flipkart description length: ${description.length}`);
  
    // Extract images
    const images = [];
    $('div._396cs4._2amPTt._3qGmMb img').each((i, el) => {
      let src = $(el).attr('src');
      if (src && !src.includes('data:image')) {
        // Convert to higher resolution
        src = src.replace(/128\/128/g, '832/832');
        images.push(src);
      }
    });
    console.log(`[productScraper] Flipkart images found: ${images.length}`);
  
    // Extract rating
    const rating = $('div._3LWZlK').first().text().trim() || 'Not available';
    console.log(`[productScraper] Flipkart rating: ${rating}`);
  
    // Extract reviews count
    const reviewsCount = $('span._2_R_DZ').text().trim() || 'Not available';
    console.log(`[productScraper] Flipkart reviews count: ${reviewsCount}`);
  
    // Extract reviews
    const reviews = [];
    $('div.t-ZTKy').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 10) {
        reviews.push(text);
      }
    });
    console.log(`[productScraper] Flipkart reviews found: ${reviews.length}`);
  
    // Extract specifications
    const specifications = {};
    $('div._3k-BhJ').each((i, section) => {
      const sectionTitle = $(section).find('.flxcaE').text().trim();
      const specs = {};
      $(section).find('tr._1s_Smc.row').each((j, row) => {
        const key = $(row).find('td._1hKmbr').text().trim();
        const value = $(row).find('td._2vZqPX').text().trim();
        if (key && value) {
          specs[key] = value;
        }
      });
      if (sectionTitle && Object.keys(specs).length > 0) {
        specifications[sectionTitle] = specs;
      }
    });
    const specsAvailable = Object.keys(specifications).length > 0 ? specifications : 'Not available';
    console.log(`[productScraper] Flipkart specifications: ${JSON.stringify(specsAvailable)}`);
  
    // Extract features
    const features = [];
    $('div._2418kt li').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 5) {
        features.push(text);
      }
    });
    console.log(`[productScraper] Flipkart features found: ${features.length}`);
  
    // Extract category from breadcrumbs
    const category = $('div._2olh4r a').map((i, el) => $(el).text().trim()).get().join(' > ') || 'Other';
    console.log(`[productScraper] Flipkart category: ${category}`);
  
    return {
      title,
      price,
      description,
      images: images.filter(img => img && typeof img === 'string'),
      rating,
      reviews: reviews.slice(0, 10),
      specifications: specsAvailable,
      features: features.slice(0, 15),
      sourceUrl: url,
      platform: 'flipkart',
      category
    };
  }

/**
 * Extracts data from generic e-commerce sites
 */
function extractGenericData($, url) {
  const title = $('h1').first().text().trim() || $('title').text().trim() || $('meta[property="og:title"]').attr('content');
  const priceSelectors = ['.price', '[itemprop="price"]', '.product-price', '.offer-price', '.current-price', '.sale-price'];
  let price = '';
  for (const selector of priceSelectors) {
    price = $(selector).first().text().trim();
    if (price) break;
  }
  const description = $('[itemprop="description"]').text().trim() || $('.product-description, .description').text().trim() || $('meta[property="og:description"]').attr('content');
  const images = [];
  $('img[itemprop="image"], .product-image img, .gallery img').each((i, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src');
    if (src && !src.includes('data:image') && !images.includes(src)) images.push(src);
  });
  const rating = $('[itemprop="ratingValue"]').text().trim() || $('.rating, .stars').text().trim();
  const reviews = $('.review, .customer-review, [itemprop="review"]').map((i, el) => $(el).text().trim()).get().filter(t => t.length > 10);
  const specifications = $('.specifications, .product-specs, .tech-specs').text().trim();
  const features = $('.features li, .product-features li').map((i, el) => $(el).text().trim()).get().filter(t => t.length > 5);
  const category = $('.breadcrumb, [itemprop="breadcrumb"]').text().trim();

  return {
    title: title || 'Unknown Product',
    price: price || 'Not available',
    description: description || 'Not available',
    images,
    rating: rating || 'Not available',
    reviews: reviews.slice(0, 10),
    specifications: specifications || 'Not available',
    features: features.slice(0, 15),
    sourceUrl: url,
    platform: new URL(url).hostname,
    category: category || 'Unknown'
  };
}

module.exports = { scrapeProduct };