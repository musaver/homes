/**
 * Format price with comma separators (WITHOUT currency symbol)
 * Use with CurrencySymbol component: <CurrencySymbol /> {formatPrice(price)}
 * @param price - Price as string or number
 * @returns Formatted price string without currency symbol
 */
export const formatPrice = (price: string | number): string => {
  const num = Number(price);
  if (isNaN(num)) {
    return '0.00';
  }
  return num.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

/**
 * Format price with custom currency symbol (for backwards compatibility and email templates)
 * @param price - Price as string or number
 * @returns Formatted price string with custom currency symbol
 */
export const formatPriceWithCurrency = (price: string | number): string => {
  const num = Number(price);
  if (isNaN(num)) {
    return `${String.fromCharCode(0xe001)} 0.00`;
  }
  return `${String.fromCharCode(0xe001)} ${num.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

/**
 * Format price with custom currency symbol as HTML string (for templates)
 * @param price - Price as string or number
 * @returns HTML string with formatted price and currency symbol
 */
export const formatPriceWithSymbolHTML = (price: string | number): string => {
  const num = Number(price);
  if (isNaN(num)) {
    return `<span class="currency-symbol">&#xe001;</span> 0.00`;
  }
  return `<span class="currency-symbol">&#xe001;</span> ${num.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

/**
 * Format price range for variable products
 * @param minPrice - Minimum price
 * @param maxPrice - Maximum price
 * @returns Formatted price range string
 */
export const formatPriceRange = (minPrice: number, maxPrice: number): string => {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice);
  }
  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
};

/**
 * Get the currency symbol as HTML entity
 * @returns Currency symbol HTML entity
 */
export const getCurrencySymbol = (): string => {
  return '&#xe001;';
};

/**
 * Get the currency symbol as character
 * @returns Currency symbol character
 */
export const getCurrencySymbolChar = (): string => {
  return String.fromCharCode(0xe001);
};

export default formatPrice; 