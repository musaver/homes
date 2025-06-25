import { useState, useEffect, useCallback } from 'react';

interface VariantData {
  id: string;
  title: string;
  price: number;
  comparePrice?: number;
  sku: string;
  inventoryQuantity: number;
  attributes: { [key: string]: string };
  isActive: boolean;
}

interface PriceMatrix {
  [key: string]: {
    id: string;
    title: string;
    price: number;
    comparePrice?: number;
    sku: string;
    inventoryQuantity: number;
  };
}

interface AttributeOption {
  name: string;
  values: string[];
}

interface ProductPricingData {
  success: boolean;
  productId: string;
  totalVariants: number;
  variants: VariantData[];
  priceMatrix: PriceMatrix;
  availableAttributes: AttributeOption[];
}

/**
 * React hook for product pricing with variant combinations
 * Provides easy price lookup and attribute management
 */
export function useProductPricing(productSlug: string) {
  const [data, setData] = useState<ProductPricingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch product pricing data
  useEffect(() => {
    if (!productSlug) return;

    let isMounted = true;

    const fetchPricingData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/products/${productSlug}/variants`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch pricing data: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (isMounted) {
          setData(result);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch pricing data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPricingData();

    return () => {
      isMounted = false;
    };
  }, [productSlug]);

  /**
   * Generate a lookup key for the price matrix
   */
  const generateAttributeKey = useCallback((attributes: { [key: string]: string }): string => {
    return Object.keys(attributes)
      .sort()
      .map(key => `${key}:${attributes[key]}`)
      .join('|');
  }, []);

  /**
   * Get price by attribute combination - O(1) lookup
   */
  const getPriceByAttributes = useCallback((attributes: { [key: string]: string }) => {
    if (!data) return null;

    const key = generateAttributeKey(attributes);
    return data.priceMatrix[key] || null;
  }, [data, generateAttributeKey]);

  /**
   * Check if a variant exists for the given attribute combination
   */
  const variantExists = useCallback((attributes: { [key: string]: string }): boolean => {
    if (!data) return false;

    const key = generateAttributeKey(attributes);
    return key in data.priceMatrix;
  }, [data, generateAttributeKey]);

  /**
   * Get all available values for a specific attribute
   */
  const getAvailableValuesForAttribute = useCallback((attributeName: string): string[] => {
    if (!data) return [];

    const attribute = data.availableAttributes.find(attr => attr.name === attributeName);
    return attribute ? attribute.values : [];
  }, [data]);

  /**
   * Get the cheapest variant price
   */
  const getCheapestPrice = useCallback((): number | null => {
    if (!data || data.variants.length === 0) return null;

    return Math.min(...data.variants.map(variant => variant.price));
  }, [data]);

  /**
   * Get the most expensive variant price
   */
  const getMostExpensivePrice = useCallback((): number | null => {
    if (!data || data.variants.length === 0) return null;

    return Math.max(...data.variants.map(variant => variant.price));
  }, [data]);

  /**
   * Get price range string (e.g., "AED 10.00 - AED 25.00" or "AED 15.00" if all same price)
   */
  const getPriceRange = useCallback((): string | null => {
    if (!data || data.variants.length === 0) return null;

    const cheapest = getCheapestPrice();
    const mostExpensive = getMostExpensivePrice();

    if (cheapest === null || mostExpensive === null) return null;

    const formatPrice = (price: number) => `${String.fromCharCode(0xe001)} ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    if (cheapest === mostExpensive) {
      return formatPrice(cheapest);
    }

    return `${formatPrice(cheapest)} - ${formatPrice(mostExpensive)}`;
  }, [getCheapestPrice, getMostExpensivePrice]);

  /**
   * Get available attributes that are compatible with current selection
   */
  const getCompatibleAttributes = useCallback((currentSelection: { [key: string]: string }) => {
    if (!data) return {};

    const compatible: { [attrName: string]: Set<string> } = {};

    // Find all variants that match the current partial selection
    data.variants.forEach(variant => {
      const matches = Object.entries(currentSelection).every(([key, value]) => {
        return !value || variant.attributes[key] === value;
      });

      if (matches) {
        Object.entries(variant.attributes).forEach(([attrName, attrValue]) => {
          if (!compatible[attrName]) {
            compatible[attrName] = new Set();
          }
          compatible[attrName].add(attrValue);
        });
      }
    });

    // Convert sets to arrays
    const result: { [attrName: string]: string[] } = {};
    Object.entries(compatible).forEach(([attrName, valuesSet]) => {
      result[attrName] = Array.from(valuesSet).sort();
    });

    return result;
  }, [data]);

  return {
    data,
    loading,
    error,
    
    // Utility functions
    getPriceByAttributes,
    variantExists,
    getAvailableValuesForAttribute,
    getCheapestPrice,
    getMostExpensivePrice,
    getPriceRange,
    getCompatibleAttributes,
    generateAttributeKey,
    
    // Computed properties
    hasVariants: data ? data.totalVariants > 0 : false,
    availableAttributes: data ? data.availableAttributes : [],
    totalVariants: data ? data.totalVariants : 0,
  };
}

export default useProductPricing; 