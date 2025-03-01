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
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0'
    };

    const response = await axios.get(url, { headers });
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
                $('h1#title span.a-size-large').text().trim() ||
                $('h1.a-size-large').text().trim();
  
  console.log(`[productScraper] Amazon title: ${title}`);
  
  // Extract price
  let price = '';
  const priceWhole = $('.a-price-whole').first().text().trim();
  const priceSymbol = $('.a-price-symbol').first().text().trim();
  
  if (priceWhole) {
    price = `${priceSymbol}${priceWhole}`;
  } else {
    // Try alternative price selectors
    price = $('#priceblock_ourprice').text().trim() ||
            $('#priceblock_dealprice').text().trim() ||
            $('.a-color-price').first().text().trim() ||
            'Price not available';
  }
  
  // Extract description
  const description = $('#productDescription p').text().trim() ||
                     $('#feature-bullets .a-list-item').map((i, el) => $(el).text().trim()).get().join(' ') ||
                     'Description not available';
  
  // Extract images
  const images = [];
  
  // Try to get images from image gallery
  $('#imgTagWrapperId img, #imageBlock img, #altImages img').each((i, el) => {
    const src = $(el).attr('src') || $(el).attr('data-old-hires') || $(el).attr('data-a-dynamic-image');
    if (src && !images.includes(src) && src.includes('http')) {
      images.push(src);
    }
  });
  
  // Extract from data-a-dynamic-image JSON if available
  $('[data-a-dynamic-image]').each((i, el) => {
    try {
      const imageData = JSON.parse($(el).attr('data-a-dynamic-image'));
      if (imageData) {
        Object.keys(imageData).forEach(key => {
          if (key.includes('http') && !images.includes(key)) {
            images.push(key);
          }
        });
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  });
  
  // Extract rating
  const rating = $('.a-icon-star').first().text().trim() ||
                $('.a-icon-alt').first().text().trim() ||
                'Rating not available';
  
  // Extract reviews
  const reviews = [];
  $('#customerReviews .a-row, .review .a-row').each((i, el) => {
    const reviewText = $(el).text().trim();
    if (reviewText.length > 10 && !reviews.includes(reviewText)) {
      reviews.push(reviewText);
    }
  });
  
  // Extract specifications/features
  const features = [];
  $('#feature-bullets .a-list-item').each((i, el) => {
    const feature = $(el).text().trim();
    if (feature && feature.length > 0) {
      features.push(feature);
    }
  });
  
  // Extract technical details
  const specifications = {};
  $('#productDetails_techSpec_section_1 tr, #productDetails_detailBullets_sections1 tr, .a-keyvalue tr').each((i, el) => {
    const key = $(el).find('th').text().trim();
    const value = $(el).find('td').text().trim();
    if (key && value) {
      specifications[key] = value;
    }
  });
  
  // Extract category
  const category = $('#wayfinding-breadcrumbs_feature_div li').last().text().trim() ||
                  $('#nav-subnav .nav-a-content').first().text().trim() ||
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
                $('h1.yhB1nd').text().trim() || 
                $('span.B_NuCI').text().trim() ||
                $('h1._35KyD6').text().trim() ||
                $('h1').first().text().trim();
  
  console.log(`[productScraper] Flipkart title: ${title}`);
  
  // Extract price
  const price = $('._30jeq3._16Jk6d').text().trim() ||
               $('._30jeq3').text().trim() ||
               $('div._30jeq3').text().trim() ||
               $('div._3qQ9m1').text().trim() ||
               'Price not available';
  
  // Extract description
  const description = $('._1mXcCf.RmoJUa').text().trim() ||
                     $('._1AN87F').text().trim() ||
                     $('._6K-7Co').text().trim() ||
                     $('div._1mXcCf p').text().trim() ||
                     'Description not available';
  
  // Extract images
  const images = [];
  
  // Try multiple image selectors
  $('._396cs4._2amPTt._3qGmMb, .q6DClP, ._3kidJX img, ._2r_T1I, ._3exPp9 img').each((i, el) => {
    let src = $(el).attr('src');
    
    // Handle srcset attribute
    if (!src) {
      const srcset = $(el).attr('srcset');
      if (srcset) {
        src = srcset.split(',')[0].split(' ')[0];
      }
    }
    
    // Handle data-src attribute
    if (!src) {
      src = $(el).attr('data-src');
    }
    
    if (src && !images.includes(src)) {
      // Convert relative URLs to absolute
      if (!src.startsWith('http')) {
        src = 'https:' + src;
      }
      
      // Replace low-quality image URLs with high-quality versions
      src = src.replace(/\d+\/\d+/, '832/832');
      
      images.push(src);
    }
  });
  
  // Extract rating
  const rating = $('._3LWZlK').first().text().trim() ||
                $('div._2d4LTz').text().trim() ||
                $('div._3LWZlK').text().trim() ||
                'Rating not available';
  
  // Extract reviews
  const reviews = [];
  $('.t-ZTKy div, .col ._2wzgFH, ._2-N8zT').each((i, el) => {
    const reviewText = $(el).text().trim();
    if (reviewText.length > 10 && !reviews.includes(reviewText)) {
      reviews.push(reviewText);
    }
  });
  
  // Extract specifications
  const specifications = {};
  $('._14cfVK, ._3Rrcbo, ._3_6Uyw').each((i, el) => {
    const rows = $(el).find('tr');
    rows.each((j, row) => {
      const key = $(row).find('td').first().text().trim();
      const value = $(row).find('td').last().text().trim();
      if (key && value) {
        specifications[key] = value;
      }
    });
  });
  
  // Extract features
  const features = [];
  $('._2418kt, ._3xWLK0, ._3YhLQA').each((i, el) => {
    const feature = $(el).text().trim();
    if (feature && feature.length > 0 && !feature.includes('Super')) {
      features.push(feature);
    }
  });
  
  // Extract from feature list
  $('._2cM9lP li, ._3_6Uyw li').each((i, el) => {
    const feature = $(el).text().trim();
    if (feature && feature.length > 0) {
      features.push(feature);
    }
  });
  
  // Extract category
  const category = $('._1MR4o5').text().trim() ||
                  $('a._2whKao').last().text().trim() ||
                  'Electronics';
  
  // Wait for dynamic content to load
  const waitForContentPromise = new Promise(resolve => setTimeout(resolve, 2000));
  
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

module.exports = { scrapeProduct };