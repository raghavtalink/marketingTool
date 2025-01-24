export const formatCurrency = (amount, currency = 'USD') => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      // Fallback formatting if the currency code is not supported
      return `${currency} ${amount.toFixed(2)}`;
    }
  };
  
  export const getCurrencySymbol = (currency = 'USD') => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      })
        .formatToParts(0)
        .find(part => part.type === 'currency').value;
    } catch (error) {
      return currency;
    }
  };