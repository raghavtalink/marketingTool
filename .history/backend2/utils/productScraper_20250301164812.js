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
  
  try {
    // Set headers to mimic a browser request
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1'
    };

    // Add a random delay to avoid detection (1-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const response = await axios.get(url, { 
      headers,
      timeout: 10000,
      maxRedirects: 5
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Determine platform from URL
    let productData;
    if (url.includes('amazon.in') || url.includes('amazon.com')) {
      productData = extractAmazonData($, url);
    } else if (url.includes('flipkart.com')) {
      productData = extractFlipkartData($, url);
    } else {
      throw new Error('Unsupported platform');
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
                $('h1#title span').text().trim() ||
                $('span.product-title-word-break').text().trim();
  
  console.log('[productScraper] Amazon title:', title);
  
  // Extract price
  let price = '';
  const priceWhole = $('.a-price-whole').first().text().trim();
  const priceSymbol = $('.a-price-symbol').first().text().trim();
  
  if (priceWhole) {
    price = `${priceSymbol}${priceWhole}`;
  } else {
    price = $('#priceblock_ourprice').text().trim() ||
            $('#priceblock_dealprice').text().trim() ||
            $('.a-price .a-offscreen').first().text().trim() ||
            'Price not available';
  }
  
  // Extract description
  const description = $('#productDescription p').text().trim() ||
                     $('#feature-bullets .a-list-item').map((i, el) => $(el).text().trim()).get().join(' ') ||
                     'Description not available';
  
  // Extract images
  const images = [];
  
  // Try to get images from data-a-dynamic-image attribute
  const dynamicImageData = $('#landingImage').attr('data-a-dynamic-image') || 
                          $('#imgBlkFront').attr('data-a-dynamic-image');
  
  if (dynamicImageData) {
    try {
      const imageObj = JSON.parse(dynamicImageData);
      images.push(...Object.keys(imageObj));
    } catch (e) {
      console.error('[productScraper] Error parsing dynamic image data:', e.message);
    }
  }
  
  // Fallback image extraction
  if (images.length === 0) {
    $('#altImages img').each((i, el) => {
      const src = $(el).attr('src');
      if (src && !src.includes('sprite') && !src.includes('gif')) {
        // Convert thumbnail URL to full-size image URL
        const fullSizeUrl = src.replace(/_[S|T]C_/, '_AC_');
        images.push(fullSizeUrl);
      }
    });
  }
  
  // Add main image if available
  const mainImage = $('#landingImage').attr('src') || $('#imgBlkFront').attr('src');
  if (mainImage && !images.includes(mainImage)) {
    images.unshift(mainImage);
  }
  
  // Extract rating
  const rating = $('.a-icon-star').first().text().trim() ||
                $('.a-icon-alt').first().text().trim() ||
                'Rating not available';
  
  // Extract reviews
  const reviews = [];
  $('#customerReviews .a-section').each((i, el) => {
    if (i < 10) { // Limit to 10 reviews
      const reviewText = $(el).find('.a-text-content').text().trim();
      const reviewTitle = $(el).find('.a-text-bold').text().trim();
      if (reviewText && reviewTitle) {
        reviews.push(`${reviewTitle}: ${reviewText}`);
      }
    }
  });
  
  // Extract specifications
  let specifications = '';
  
  // Try to extract from technical details table
  const techDetails = {};
  $('#productDetails_techSpec_section_1 tr, #productDetails_detailBullets_sections1 tr').each((i, el) => {
    const key = $(el).find('th').text().trim();
    const value = $(el).find('td').text().trim();
    if (key && value) {
      techDetails[key] = value;
    }
  });
  
  // Also try the detail bullets format
  $('#detailBullets_feature_div li').each((i, el) => {
    const text = $(el).text().trim();
    const parts = text.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join(':').trim();
      techDetails[key] = value;
    }
  });
  
  // Convert specifications object to string
  if (Object.keys(techDetails).length > 0) {
    specifications = Object.entries(techDetails)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  } else {
    specifications = 'Specifications not available';
  }
  
  // Extract features
  const features = [];
  $('#feature-bullets .a-list-item').each((i, el) => {
    const feature = $(el).text().trim();
    if (feature) {
      features.push(feature);
    }
  });
  
  // Extract category
  const category = $('#wayfinding-breadcrumbs_feature_div li').last().text().trim() ||
                  'Electronics';
  
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
  
  console.log('[productScraper] Flipkart title:', title);
  
  // Extract price
  let price = '';
  const priceElement = $('._30jeq3._16Jk6d').text().trim() || 
                      $('._30jeq3').text().trim() || 
                      $('._1vC4OE._3qQ9m1').text().trim();
  
  if (priceElement) {
    price = priceElement.replace(/^₹/, '').trim();
  }
  
  // Extract description
  const description = $('._1mXcCf.RmoJUa').text().trim() || 
                     $('._1AN87F').text().trim() || 
                     $('._6K-7Co').text().trim() || 
                     $('._2o-xpa').text().trim();
  
  // Extract images
  const images = [];
  
  // Method 1: Standard image containers
  $('._2r_T1I, ._3exPp9, ._396QI4, ._2amPTt img').each((i, el) => {
    const src = $(el).attr('src');
    if (src && !src.includes('data:image')) {
      const fullSrc = src.replace(/\d+x\d+/, '832x832');
      images.push(fullSrc);
    }
  });
  
  // Method 2: Lazy-loaded images
  $('img[data-src]').each((i, el) => {
    const src = $(el).attr('data-src');
    if (src && !src.includes('data:image')) {
      const fullSrc = src.replace(/\d+x\d+/, '832x832');
      images.push(fullSrc);
    }
  });
  
  // Method 3: Background images in divs
  $('.CXW8mj, ._3GnUWp, ._1AJkS4').each((i, el) => {
    const style = $(el).attr('style');
    if (style && style.includes('background-image')) {
      const match = style.match(/url\(['"]?(.*?)['"]?\)/);
      if (match && match[1]) {
        images.push(match[1]);
      }
    }
  });
  
  // Extract rating
  const rating = $('._3LWZlK').text().trim() || 
                $('._2d4LTz').text().trim() || 
                $('div._1lRcqv div._3LWZlK').text().trim();
  
  // Extract reviews
  const reviews = [];
  $('._16PBlm, .t-ZTKy, ._2-N8zT').each((i, el) => {
    const reviewText = $(el).find('.t-ZTKy').text().trim() || 
                      $(el).find('._6K-7Co').text().trim() || 
                      $(el).text().trim();
    
    if (reviewText && reviewText.length > 0) {
      reviews.push(reviewText);
    }
  });
  
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
    specifications = 'Specifications not available';
  }
  
  // Extract features
  const features = [];
  $('._2418kt, ._3xWLK0, ._3YhLQA, ._1UhVsV li, ._1mXcCf li').each((i, el) => {
    const feature = $(el).text().trim();
    if (feature && feature.length > 0 && !feature.includes('Super')) {
      features.push(feature);
    }
  });
  
  // Extract category
  const category = $('._1MR4o5').text().trim() ||
                  $('a._2whKao').last().text().trim() ||
                  $('._1KOcBL').text().trim() ||
                  'Electronics';
  
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

module.exports = { scrapeProduct };