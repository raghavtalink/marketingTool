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
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Scrapes product data from a given URL
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

    // Launch Puppeteer browser
    browser = await puppeteer.launch({
      headless: false, // Set to true in production; false for debugging
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--window-size=1920,1080',
      ],
    });

    // Create a new page instance
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    // Pass the page to extractFlipkartData
    const productData = await extractFlipkartData(page, url);

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
      platform: domain,
      category: 'Unknown',
    };
  } finally {
    if (browser) {
      await browser.close();
      console.log('[productScraper] Browser closed');
    }
  }
}

/**
 * Extracts product data from Flipkart using the provided page
 * @param {Page} page - Puppeteer Page instance
 * @param {string} url - The product URL to scrape
 * @returns {Object} - Extracted product data
 */
async function extractFlipkartData(page, url) {
  console.log('[productScraper] Extracting Flipkart data');

  // Navigate to the page
  console.log(`[productScraper] Navigating to URL: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Wait for key element to ensure page is loaded
  await page.waitForSelector('div.Nx9bqj.CxhGGd.yKS4la', { timeout: 10000 });

  // Extract data
  const productData = await page.evaluate((url) => {
    const getText = (selector) => {
      const element = document.querySelector(selector);
      return element ? element.textContent.trim() : '';
    };

    const title = getText('span.VU-ZEz') || 'Flipkart Product';
    const price = getText('div.Nx9bqj.CxhGGd.yKS4la') || 'Not available';
    const description = getText('div._4gvKMe > div.yN+eNk.w9jEaj > p') || 'Not available';
    const rating = getText('div.ipqd2A') || 'Not available';

    const images = Array.from(document.querySelectorAll('img.q6DClP')).map((img) =>
      img.src.replace(/128\/128/g, '832/832')
    );

    return {
      title,
      price,
      description,
      images,
      rating,
      reviews: [], // Add review extraction if needed
      specifications: 'Not available', // Add specs extraction if needed
      features: [], // Add features extraction if needed
      sourceUrl: url,
      platform: 'flipkart',
    };
  }, url);

  // Save screenshot for debugging
  const screenshotPath = path.join(
    __dirname,
    '../screenshots',
    `product-screenshot-${Date.now()}.png`
  );
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`[productScraper] Screenshot saved to: ${screenshotPath}`);

  return productData;
}

// Example usage
(async () => {
  const url =
    'https://www.flipkart.com/samsung-t7-shield-1tb-usb-3-2-gen-2-10-gbps-ip65-rated-speed-upto-1050-mb-s-mu-pe1t0k-1-tb-external-solid-state-drive-ssd/p/itmd6019e2419a6b?pid=ACCGDTJ2HZTKPZER&lid=LSTACCGDTJ2HZTKPZERQUKR3M&marketplace=FLIPKART&q=external+ssd&store=6bo%2Fjdy%2Fdus%2Fwbv&srno=s_1_1&otracker=search&otracker1=search&fm=organic&iid=en_FX-8es6oikH0bmHuAksCEoNIfHc4FEYfsI2alFHJqh2DNeJN50AUBV_7YkMTZrQqF2tgnXvI31TuK-AFrDeZpfUFjCTyOHoHZs-Z5_PS_w0%3D&ppt=pp&ppn=pp&ssid=rptl5abfgg0000001740826297065&qH=db7fb5cdcafefc0e';
  const data = await scrapeProduct(url);
  console.log(data);
})();

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