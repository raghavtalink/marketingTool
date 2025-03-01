const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cheerio = require('cheerio');
const UserAgent = require('user-agents');
const fs = require('fs');
const path = require('path');
const CaptchaSolver = require('captcha-solver');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Add stealth plugin to puppeteer
puppeteer.use(StealthPlugin());

/**
 * Scrapes product data from various e-commerce websites
 * @param {string} url - The product URL to scrape
 * @returns {Object} - Extracted product data
 */
async function scrapeProduct(url) {
  console.log(`[productScraper] Scraping URL: ${url}`);
  
  let browser = null;
  
  try {
    // Launch browser with stealth mode
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
      ]
    });
    
    const page = await browser.newPage();
    
    // Set a random user agent
    const userAgent = new UserAgent();
    await page.setUserAgent(userAgent.toString());
    
    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0'
    });
    
    // Set viewport
    await page.setViewport({
      width: 1920,
      height: 1080
    });
    
// Navigate to URL with timeout
await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  
  // Simulate human behavior
  await simulateHumanBehavior(page);
  
  // Auto-scroll to load lazy content
  await autoScroll(page);
  
  // Wait for content to load - using page.evaluate instead of waitForTimeout
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));
  
    
    // Get page content
    const html = await page.content();
    const $ = cheerio.load(html);
    
    // Determine platform from URL
    let productData;
    if (url.includes('amazon.in') || url.includes('amazon.com')) {
      productData = extractAmazonData($, url);
    } else if (url.includes('flipkart.com')) {
      productData = extractFlipkartData($, url);
    } else {
      productData = extractGenericData($, url);
    }
    
    // Add unique ID
    productData.id = uuidv4();
    
    // Convert specifications object to string if needed
    if (typeof productData.specifications === 'object' && productData.specifications !== null) {
      productData.specifications = JSON.stringify(productData.specifications);
    }
    
    return productData;
  } catch (error) {
    console.error(`[productScraper] Error scraping product: ${error.message}`);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
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
function extractAmazonData($, url) {
  console.log('[productScraper] Extracting Amazon data');
  
  // Extract title
  const title = $('#productTitle').text().trim() || 
                $('h1#title span').text().trim();
  
  console.log(`[productScraper] Amazon title: ${title}`);
  
  // Extract price
  let price = '';
  const priceWhole = $('.a-price-whole').first().text().trim();
  const priceFraction = $('.a-price-fraction').first().text().trim();
  
  if (priceWhole) {
    price = priceWhole + (priceFraction ? '.' + priceFraction : '');
  } else {
    price = $('#priceblock_ourprice').text().trim() || 
            $('#priceblock_dealprice').text().trim() || 
            $('.a-price .a-offscreen').first().text().trim();
  }
  
  // Clean up price
  if (price) {
    price = price.replace(/[^\d.]/g, '');
  }
  
  console.log(`[productScraper] Amazon price: ${price}`);
  
  // Extract description
  const description = $('#productDescription').text().trim() || 
                     $('#feature-bullets').text().trim() || 
                     $('.a-expander-content').text().trim();
  
  console.log(`[productScraper] Amazon description length: ${description?.length || 0}`);
  
  // Extract images
  const images = [];
  
  // Method 1: From image gallery
  $('#imgTagWrapperId img, #imgBlkFront, #landingImage').each((i, el) => {
    const src = $(el).attr('src') || $(el).attr('data-old-hires');
    if (src && !images.includes(src)) {
      images.push(src);
    }
  });
  
  // Method 2: From data-a-dynamic-image attribute (JSON of image URLs)
  const dynamicImageAttr = $('#landingImage').attr('data-a-dynamic-image');
  if (dynamicImageAttr) {
    try {
      const dynamicImages = JSON.parse(dynamicImageAttr);
      for (const imgUrl in dynamicImages) {
        if (!images.includes(imgUrl)) {
          images.push(imgUrl);
        }
      }
    } catch (e) {
      console.error('[productScraper] Error parsing dynamic images:', e.message);
    }
  }
  
  // Method 3: From thumbnail images
  $('.imageThumbnail img').each((i, el) => {
    const src = $(el).attr('src');
    if (src) {
      // Convert thumbnail URL to full-size image URL
      const fullSrc = src.replace(/(._SS\d+_)/, '._SL1500_');
      if (!images.includes(fullSrc)) {
        images.push(fullSrc);
      }
    }
  });
  
  console.log(`[productScraper] Amazon images found: ${images.length}`);
  
  // Extract rating
  const rating = $('.a-icon-star').first().text().trim() || 
                $('#acrPopover').text().trim();
  
  console.log(`[productScraper] Amazon rating: ${rating}`);
  
  // Extract reviews
  const reviews = [];
  $('.a-expander-content').each((i, el) => {
    const text = $(el).text().trim();
    if (text && text.length > 10) {
      reviews.push(text);
    }
  });
  
  console.log(`[productScraper] Amazon reviews found: ${reviews.length}`);
  
  // Extract specifications
  let specifications = '';
  const specDetails = {};
  
  // Method 1: From product details table
  $('#productDetails_techSpec_section_1 tr, #productDetails_detailBullets_sections1 tr').each((i, el) => {
    const key = $(el).find('th').text().trim();
    const value = $(el).find('td').text().trim();
    if (key && value) {
      specDetails[key] = value;
    }
  });
  
  // Method 2: From detail bullets
  $('#detailBullets_feature_div li').each((i, el) => {
    const text = $(el).text().trim();
    const parts = text.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join(':').trim();
      specDetails[key] = value;
    }
  });
  
  // Convert specifications object to string
  if (Object.keys(specDetails).length > 0) {
    specifications = Object.entries(specDetails)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  } else {
    specifications = $('#productDetails_techSpec_section_1').text().trim() || 
                    $('#detailBullets_feature_div').text().trim() || 
                    $('.a-section.a-spacing-small.a-spacing-top-small').text().trim();
  }
  
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
    images: images.filter(img => img && typeof img === 'string').slice(0, 10),
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
                $('._35KyD6').text().trim() || 
                $('h1.yhB1nd').text().trim() || 
                $('span.B_NuCI').text().trim();
  
  console.log(`[productScraper] Flipkart title: ${title}`);
  
  // Extract price
  let price = '';
  const priceElement = $('._30jeq3._16Jk6d').text().trim() || 
                      $('._30jeq3').text().trim() || 
                      $('._1vC4OE._3qQ9m1').text().trim();
  
  if (priceElement) {
    price = priceElement.replace(/^₹/, '').trim();
  }
  
  // If price contains special offers, try to get the actual price
  if (!price || price.includes('Bank Offer')) {
    price = $('div[class*="_30jeq3"]').first().text().trim().replace(/^₹/, '').trim();
  }
  
  console.log(`[productScraper] Flipkart price: ${price}`);
  
  // Extract description
  const description = $('._1mXcCf.RmoJUa').text().trim() || 
                     $('._1AN87F').text().trim() || 
                     $('._6K-7Co').text().trim() || 
                     $('._2o-xpa').text().trim();
  
  console.log(`[productScraper] Flipkart description length: ${description?.length || 0}`);
  
  // Extract images
  const images = [];
  
  // Method 1: Standard image containers
  $('._2r_T1I, ._3exPp9, ._396QI4, ._2amPTt img, img[class*="q6DClP"]').each((i, el) => {
    const src = $(el).attr('src');
    if (src && !src.includes('data:image') && !images.includes(src)) {
      const fullSrc = src.replace(/\d+x\d+/, '832x832');
      images.push(fullSrc);
    }
  });
  
  // Method 2: Lazy-loaded images
  $('img[data-src]').each((i, el) => {
    const src = $(el).attr('data-src');
    if (src && !src.includes('data:image') && !images.includes(src)) {
      const fullSrc = src.replace(/\d+x\d+/, '832x832');
      images.push(fullSrc);
    }
  });
  
  // Method 3: Background images in divs
  $('.CXW8mj, ._3GnUWp, ._1AJkS4').each((i, el) => {
    const style = $(el).attr('style');
    if (style && style.includes('background-image')) {
      const match = style.match(/url\(['"]?(.*?)['"]?\)/);
      if (match && match[1] && !images.includes(match[1])) {
        images.push(match[1]);
      }
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
  const rating = $('._3LWZlK').first().text().trim() || 
                $('._2d4LTz').text().trim() || 
                $('div._1lRcqv div._3LWZlK').text().trim();
  
  console.log(`[productScraper] Flipkart rating: ${rating}`);
  
  // Extract reviews count
  const reviewsCount = $('span[class*="_2_R_DZ"]').text().trim();
  
  console.log(`[productScraper] Flipkart reviews count: ${reviewsCount}`);
  
  // Extract reviews
  const reviews = [];
  $('._16PBlm, .t-ZTKy, ._2-N8zT').each((i, el) => {
    const reviewText = $(el).find('.t-ZTKy').text().trim() || 
                      $(el).find('._6K-7Co').text().trim() || 
                      $(el).text().trim();
    
    if (reviewText && reviewText.length > 10 && !reviews.includes(reviewText)) {
      reviews.push(reviewText);
    }
  });
  
  console.log(`[productScraper] Flipkart reviews found: ${reviews.length}`);
  
  // Extract specifications
  let specifications = '';
  const specDetails = {};
  
  // Method 1: Table format
  $('._14cfVK tr, ._3k-BhJ tr, ._1s_Smc tr').each((i, el) => {
    const key = $(el).find('td').eq(0).text().trim();
    const value = $(el).find('td').eq(1).text().trim();
    if (key && value) {
      specDetails[key] = value;
    }
  });
  
  // Method 2: List format
  $('._2418kt, ._3YhLQA, ._1UhVsV li').each((i, el) => {
    const text = $(el).text().trim();
    const parts = text.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join(':').trim();
      specDetails[key] = value;
    }
  });
  
  // Convert specifications object to string
  if (Object.keys(specDetails).length > 0) {
    specifications = Object.entries(specDetails)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  } else {
    specifications = $('._14cfVK').text().trim() || 
                    $('div[class*="_3k-BhJ"]').text().trim();
  }
  
  console.log(`[productScraper] Flipkart specifications length: ${specifications?.length || 0}`);
  
  // Extract features
  const features = [];
  $('._2418kt, ._3xWLK0, ._3YhLQA, ._1UhVsV li, ._1mXcCf li, ._2418kt li, ._1133chaP li').each((i, el) => {
    const feature = $(el).text().trim();
    if (feature && feature.length > 5 && !features.includes(feature)) {
      features.push(feature);
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
  
  // Extract category
  const category = $('._1MR4o5').text().trim() ||
                  $('a._2whKao').last().text().trim() ||
                  $('._1KOcBL').text().trim() ||
                  $('._3GIHBu').text().trim() || 
                  $('a[class*="_2whKao"]').map((i, el) => $(el).text().trim()).get().join(' > ');
  
  return {
    title: title || 'Flipkart Product',
    price: price || 'Price not available',
    description: description || 'Description not available',
    images: images.filter(img => img && typeof img === 'string').slice(0, 10),
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
    images: images.filter(img => img && typeof img === 'string').slice(0, 10),
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