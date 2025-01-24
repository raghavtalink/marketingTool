// src/components/DynamicPricing/formatters.js

export const formatCurrency = (amount, currency = 'USD') => {
    if (isNaN(amount)) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };