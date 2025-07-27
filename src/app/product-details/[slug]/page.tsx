'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import CurrencySymbol from '@/components/CurrencySymbol';
import LoadingSpinner from '@/components/LoadingSpinner';

import { normalizeVariationAttributes } from '../../../utils/jsonUtils';
import { addToCart, clearCart, type CartItem } from '../../../utils/cart';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { calculateTaxes, fetchTaxSettings, formatTaxAmount } from '../../../utils/taxUtils';
import { storeLastVisitedPage } from '@/utils/navigation';

/* ───────────────────────────────────────────────────────────
   Utilities
   ────────────────────────────────────────────────────────── */

/** Recursively JSON-parse *encoded* data until it is no longer a string. */
const deepParseJSON = (value: any, maxDepth = 3) => {
  let parsed = value;
  let depth  = 0;

  while (typeof parsed === 'string' && depth < maxDepth) {
    try {
      parsed = JSON.parse(parsed);
      depth += 1;
    } catch {
      break;            // stop when the string isn't valid JSON
    }
  }
  return parsed;
};

const formatPrice = (price: string | number) => {
  const num = Number(price);
  return `${String.fromCharCode(0xe001)} ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/* ───────────────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────────────── */

interface ProductAddon {
  id: string;
  productId: string;
  addonId: string;
  price: string;
  isRequired: boolean;
  sortOrder: number;
  isActive: boolean;
  addonTitle: string;
  addonPrice: string;
  addonDescription?: string;
  addonImage?: string;
  addonSortOrder: number;
  addonGroupId?: string;
  groupTitle?: string;
  groupDescription?: string;
  groupSortOrder?: number;
}

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  sku?: string;
  price: string;
  comparePrice?: string;
  costPrice?: string;
  images?: any;
  banner?: string;
  categoryId?: string;
  subcategoryId?: string;
  tags?: any;
  weight?: string;
  dimensions?: any;
  isFeatured: boolean;
  isActive: boolean;
  isDigital: boolean;
  requiresShipping: boolean;
  taxable: boolean;
  metaTitle?: string;
  metaDescription?: string;
  productType: string;
  variationAttributes?: any;
  createdAt: string;
  updatedAt: string;
  categoryName?: string;
  addons?: ProductAddon[];
}

/* ───────────────────────────────────────────────────────────
   Variation Selector
   ────────────────────────────────────────────────────────── */

const VariationSelector: React.FC<{
  variationAttributes: any;        // accepts string *or* array
  productType: string;
  basePrice: string;
  product: ProductData;
  onPriceChange?: (price: number) => void;
  onVariationComplete?: (isComplete: boolean) => void;
  onSelectionChange?: (selections: Record<string, string>) => void;
  onAddToCart?: () => void;
}> = ({ variationAttributes, productType, basePrice, product, onPriceChange, onVariationComplete, onSelectionChange, onAddToCart }) => {
  /** Make sure we *always* work with an array using our normalized function */
  const attrs = useMemo<any[]>(() => {
    const normalized = normalizeVariationAttributes(variationAttributes);
    
    // Debug: log the parsed attributes to understand structure
    if (normalized.length > 0) {
      console.log('Normalized variation attributes:', normalized);
      // Log the first attribute's values to see the structure
      if (normalized[0]?.values?.length > 0) {
        console.log('Sample variation value:', normalized[0].values[0]);
      }
    }
    
    return normalized;
  }, [variationAttributes]);

  const [selected, setSelected] = useState<Record<string, string>>({});
  const [dynamicPrice, setDynamicPrice] = useState<number>(parseFloat(basePrice) || 0);
  const [priceLoading, setPriceLoading] = useState<boolean>(false);

  /* Build initial state when attributes arrive */
  useEffect(() => {
    if (attrs.length) {
      const init: Record<string, string> = {};
      attrs.forEach((a) => (init[a.name] = ''));  // Use attribute name instead of slug
      setSelected(init);
    }
  }, [attrs]);

  /* Helpers */
  const change = (attributeName: string, value: string) => {
    setSelected((s) => ({ ...s, [attributeName]: value }));
  };
  
  const selectedCount   = Object.values(selected).filter(Boolean).length;
  const allChosen       = attrs.length > 0 && attrs.every((a) => selected[a.name]);
  const progressPercent = attrs.length ? (selectedCount / attrs.length) * 100 : 0;

  /* Calculate dynamic price based on selected variations */
  useEffect(() => {
    const fetchVariantPrice = async () => {
      if (allChosen) {
        setPriceLoading(true);
        
        // Declare variables in outer scope so they're available in catch block
        let productId: string | undefined;
        const variationCombination: Record<string, string> = {};
        
        try {
          // Get the product ID from the current product context
          productId = product?.id;
          if (!productId) {
            console.error('🚨 Product ID not available! Product object:', product);
            setPriceLoading(false);
            return;
          }
          
          console.log('✅ Product ID available:', productId);

          // Prepare the variation combination for the API call using attribute names
          attrs.forEach((attr) => {
            const selectedValue = selected[attr.name];
            if (selectedValue) {
              // Use the selected value directly since we're already storing the actual value
              variationCombination[attr.name] = selectedValue;
            }
          });

          console.log('🔍 Debug - Current selected state:', selected);
          console.log('🔍 Debug - Attributes structure:', attrs);
          console.log('🔍 Debug - Variation combination being sent:', variationCombination);
          console.log('🔍 Debug - Product ID:', productId);
          
          // Also test if we can reach our debug endpoint
          console.log('🔍 Debug - Testing debug endpoint...');
          fetch(`/api/debug/variants/${productId}`)
            .then(res => res.json())
            .then(data => console.log('🔍 Debug endpoint response:', data))
            .catch(err => console.log('🔍 Debug endpoint error:', err));

          // Make API call to get variant price
          const response = await fetch('/api/products/variant-price', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productId: productId,
              variationCombination: variationCombination
            })
          });

          const responseData = await response.json();
          console.log('🔄 API Response:', responseData);
          
          if (response.ok) {
            if (responseData.success) {
              const variantPrice = parseFloat(responseData.price) || parseFloat(basePrice) || 0;
              console.log(`✅ Successfully fetched variant price: AED ${variantPrice} for combination:`, variationCombination);
              console.log('📊 Full variant data:', responseData);
              
              setDynamicPrice(variantPrice);
              // Calculate the price difference from base price
              const priceDifference = variantPrice - parseFloat(basePrice);
              onPriceChange?.(priceDifference);
            } else {
              console.warn('⚠️ API returned unsuccessful response:', responseData);
              throw new Error(responseData.error || 'Variant price fetch unsuccessful');
            }
          } else {
            console.error('❌ API call failed with status:', response.status, responseData);
            throw new Error(responseData.error || `API Error: ${response.status}`);
          }
        } catch (error) {
          console.error('🚨 Error fetching variant price:', error);
          console.error('🚨 Full error details:', {
            error: error,
            selected: selected,
            attrs: attrs,
            product: product,
            productId: productId,
            variationCombination: variationCombination
          });
          // Fallback to base price if API call fails
          const baseNum = parseFloat(basePrice) || 0;
          setDynamicPrice(baseNum);
          onPriceChange?.(0); // No price difference from base
        } finally {
          setPriceLoading(false);
        }
      } else {
        // Not all variations selected, show base price
        const baseNum = parseFloat(basePrice) || 0;
        setDynamicPrice(baseNum);
        onPriceChange?.(0); // No price difference from base
        setPriceLoading(false);
      }
      
      onVariationComplete?.(allChosen);
      onSelectionChange?.(selected);
    };

    fetchVariantPrice();
  }, [selected, allChosen, attrs, basePrice, onPriceChange, onVariationComplete, onSelectionChange, product?.id]);

  const resetSelection = () => {
    const init: Record<string, string> = {};
    attrs.forEach((a) => (init[a.name] = ''));
    setSelected(init);
    // Reset to base price
    const baseNum = parseFloat(basePrice) || 0;
    setDynamicPrice(baseNum);
    onPriceChange?.(0); // No price difference from base
  };

  /* Early exits */
  if (productType !== 'variable')
    return (
      <div className="alert alert-info">
        <i className="fas fa-info-circle me-2" />
        This product is not variable.
      </div>
    );

  if (!attrs.length)
    return (
      <div className="alert alert-warning">
        <i className="fas fa-exclamation-triangle me-2" />
        No variation attributes found for this variable product.
      </div>
    );

  /* UI */
  return (
    <div className="variation-selector">
      {/* Header */}

      {/* Price Display */}
      {priceLoading && (
        <div className="mb-3">
          <div className="d-flex align-items-center">
            
            <small className="text-muted">Calculating price...</small>
          </div>
        </div>
      )}

      {/* Current Price Display 
      {allChosen && !priceLoading && (
        <div className="mb-3 p-3 bg-success bg-opacity-10 border border-success rounded">
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-semibold text-success">✅ Variant Price:</span>
                                        <span className="h5 mb-0 text-success"><CurrencySymbol /> {dynamicPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}*/}

      {/* Attribute groups */}
      {attrs.map((attribute) => {
        const current = selected[attribute.name] || '';

        return (
          <div key={attribute.id} className="attribute-group mb-4">
            <div className="attribute-header mb-3">
              <h6 className="attribute-name mb-1">
                {attribute.name}
                {/* <span className="text-muted ms-2">({attribute.type})</span> */}
                {current && <span className="badge bg-primary ms-2">{current}</span>}
              </h6>
              {attribute.description && <small className="text-muted">{attribute.description}</small>}
            </div>

            {/* — select dropdown — */}
            {(attribute.type === 'select' || attribute.values?.length > 5) && (
              <select
                className="form-select"
                value={current}
                onChange={(e) => change(attribute.name, e.target.value)}
                disabled={priceLoading}
              >
                <option value="">Choose {attribute.name.toLowerCase()}…</option>
                {attribute.values?.map((o: any) => (
                  <option key={o.id} value={o.value}>
                    {o.value}
                  </option>
                ))}
              </select>
            )}

            {/* — colour swatches — */}
            {attribute.type === 'color' && (
              <div className="color-options d-flex flex-wrap gap-2">
                {attribute.values?.map((o: any) => {
                  const isSel = current === o.value;
                  return (
                    <div
                      key={o.id}
                      className={`color-option ${isSel ? 'selected' : ''} ${priceLoading ? 'disabled' : ''}`}
                      onClick={() => !priceLoading && change(attribute.name, o.value)}
                      title={o.value}
                    >
                      <div
                        className="color-swatch"
                        style={{
                          backgroundColor : o.colorCode || '#ccc',
                          width           : 40,
                          height          : 40,
                          borderRadius    : '50%',
                          border          : isSel ? '3px solid #007bff' : '2px solid #dee2e6',
                          cursor          : priceLoading ? 'not-allowed' : 'pointer',
                          opacity         : priceLoading ? 0.6 : 1,
                        }}
                      />
                      <small className="color-label text-center mt-1 d-block">{o.value}</small>
                    </div>
                  );
                })}
              </div>
            )}

            {/* — image options — */}
            {attribute.type === 'image' && (
              <div className="image-options d-flex flex-wrap gap-3">
                {attribute.values?.map((o: any) => {
                  const isSel = current === o.value;
                  return (
                    <div
                      key={o.id}
                      className={`image-option ${isSel ? 'selected' : ''} ${priceLoading ? 'disabled' : ''}`}
                      onClick={() => !priceLoading && change(attribute.name, o.value)}
                    >
                      {o.image ? (
                        <img
                          src={o.image}
                          alt={o.value}
                          style={{
                            width        : 60,
                            height       : 60,
                            objectFit    : 'cover',
                            borderRadius : 8,
                            border       : isSel ? '3px solid #007bff' : '2px solid #dee2e6',
                            cursor       : priceLoading ? 'not-allowed' : 'pointer',
                            opacity      : priceLoading ? 0.6 : 1,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width        : 60,
                            height       : 60,
                            background   : '#f8f9fa',
                            borderRadius : 8,
                            display      : 'flex',
                            alignItems   : 'center',
                            justifyContent: 'center',
                            border       : isSel ? '3px solid #007bff' : '2px solid #dee2e6',
                            cursor       : priceLoading ? 'not-allowed' : 'pointer',
                            opacity      : priceLoading ? 0.6 : 1,
                          }}
                        >
                          <i className="fas fa-image text-muted" />
                        </div>
                      )}
                      <small className="image-label text-center mt-1 d-block">{o.value}</small>
                    </div>
                  );
                })}
              </div>
            )}

            {/* — buttons / radio (default) — */}
            {(!['select', 'color', 'image'].includes(attribute.type) && attribute.values?.length <= 5) && (
              <div className="button-radio-options d-flex flex-wrap gap-2">
                {attribute.values?.map((o: any) => {
                  const isSelected = current === o.value;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      className={`btn ${isSelected ? 'btn-primary' : 'btn-outline-secondary'} ${priceLoading ? 'disabled' : ''}`}
                      onClick={() => !priceLoading && change(attribute.name, o.value)}
                      disabled={priceLoading}
                      style={{
                        borderRadius: '8px',
                        padding: '10px 20px',
                        fontWeight: '500',
                        border: isSelected ? '2px solid #007bff' : '2px solid #dee2e6',
                        backgroundColor: isSelected ? '#007bff' : '#fff',
                        color: isSelected ? '#fff' : '#495057',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span className="option-value">{o.value}</span>
                      {o.description && (
                        <small className="d-block mt-1" style={{ 
                          opacity: 0.8,
                          fontSize: '0.75rem'
                        }}>
                          {o.description}
                        </small>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selected badge 
            {current && (
              <div className="selected-indicator mt-2">
                <small className="text-success">
                  <i className="fas fa-check-circle me-1" />
                  Selected:{' '}
                  <strong>{attribute.values?.find((v: any) => v.value === current)?.value}</strong>
                </small>
              </div>
            )}*/}
          </div>
        );
      })}

      {/* Actions and Summary */}
      
          {/*
          <div className="col-md-6">
            {!allChosen && selectedCount === 0 && (
              <>
                <h6 className="mb-1">Base Price:</h6>
                <h4 className="text-muted mb-0">{formatPrice(basePrice)}</h4>
                <small className="text-muted">Select variations to see final price</small>
              </>
            )}
            {!allChosen && selectedCount > 0 && (
              <>
                <h6 className="mb-1">Base Price:</h6>
                <h4 className="text-muted mb-0">{formatPrice(basePrice)}</h4>
                <small className="text-warning">
                  <i className="fas fa-info-circle me-1" />
                  Select all variations ({selectedCount}/{attrs.length}) to see final price
                </small>
              </>
            )}
          </div>*/}
          
            {/*<button
              type="button"
              className="btn btn-outline-secondary me-2"
              onClick={resetSelection}
              disabled={priceLoading || selectedCount === 0}
            >
              <i className="fas fa-undo me-1" />
              Reset
            </button>*/}
            {/* Button removed - using central button now */}
            {!allChosen && (
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2" />
                Please select all variations to see final price
              </div>
            )}
    </div>
  );
};

/* ───────────────────────────────────────────────────────────
   Grouped Addons Selector
   ────────────────────────────────────────────────────────── */

const GroupedAddonsSelector: React.FC<{
  addons: ProductAddon[];
  productType: string;
  basePrice: string;
  onCheckoutReady?: (isReady: boolean) => void;
  onSelectionChange?: (selectedAddons: Array<{addonId: string, title: string, price: number, quantity: number, groupTitle: string}>) => void;
  onAddToCart?: () => void;
  onPriceChange?: (price: number) => void;
}> = ({ addons, productType, basePrice, onCheckoutReady, onSelectionChange, onAddToCart, onPriceChange }) => {
  const [addonQuantities, setAddonQuantities] = useState<{[key: string]: number}>({});

  // Group addons by group title
  const groupedAddons = useMemo(() => {
    const groups: { [key: string]: ProductAddon[] } = {};
    
    addons.forEach(addon => {
      const groupKey = addon.groupTitle || 'Ungrouped';
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(addon);
    });

    // Sort groups by group sort order, then sort addons within each group
    const sortedGroups = Object.entries(groups)
      .sort(([, a], [, b]) => {
        const aSort = a[0]?.groupSortOrder || 999;
        const bSort = b[0]?.groupSortOrder || 999;
        return aSort - bSort;
      })
      .map(([groupTitle, groupAddons]) => ({
        title: groupTitle,
        description: groupAddons[0]?.groupDescription,
        addons: groupAddons.sort((a, b) => a.addonSortOrder - b.addonSortOrder)
      }));

    return sortedGroups;
  }, [addons]);

  const updateAddonQuantity = (addonId: string, quantity: number) => {
    setAddonQuantities(prev => ({
      ...prev,
      [addonId]: Math.max(0, quantity)
    }));
  };

  const getAddonQuantity = (addonId: string) => addonQuantities[addonId] || 0;

  // Calculate total addon price and check if any addons are selected
  const { totalAddonPrice, hasSelectedAddons } = useMemo(() => {
    const selected = Object.entries(addonQuantities).filter(([, qty]) => qty > 0);
    const total = selected.reduce((sum, [addonId, qty]) => {
      const addon = addons.find(a => a.addonId === addonId);
      if (!addon) return sum;
      const price = parseFloat(addon.price || addon.addonPrice);
      return sum + (price * qty);
    }, 0);
    
    return {
      totalAddonPrice: total,
      hasSelectedAddons: selected.length > 0
    };
  }, [addonQuantities, addons]);

  // Notify parent when checkout readiness changes
  useEffect(() => {
    // For group products, addons are required. For other types, they're optional
    const isReady = productType === 'group' ? hasSelectedAddons : true;
    onCheckoutReady?.(isReady);
  }, [hasSelectedAddons, onCheckoutReady, productType]);

  // Notify parent when addon selection changes
  useEffect(() => {
    const selectedAddons = Object.entries(addonQuantities)
      .filter(([, qty]) => qty > 0)
      .map(([addonId, qty]) => {
        const addon = addons.find(a => a.addonId === addonId);
        return {
          addonId,
          title: addon?.addonTitle || '',
          price: parseFloat(addon?.price || addon?.addonPrice || '0'),
          quantity: qty,
          groupTitle: addon?.groupTitle || 'Ungrouped'
        };
      });
    onSelectionChange?.(selectedAddons);
    
    // Update parent's price with addon total
    if (onPriceChange) {
      onPriceChange(totalAddonPrice); // Just pass the addon price, not the total
    }
  }, [addonQuantities, addons, onSelectionChange, totalAddonPrice, basePrice, onPriceChange]);

  const resetAddons = () => {
    setAddonQuantities({});
  };

  // Show addons for all product types now
  // if (productType !== 'group') {
  //   return null;
  // }

      if (!addons || addons.length === 0) {
      return null; // Don't show anything if no addons available
    }

  return (
    <div className="grouped-addons-selector">
      

      {groupedAddons.map((group, groupIndex) => (
        <div key={groupIndex} className="addon-group mb-4">
          {/* Group Header */}
          <div className="group-header mb-3">
            <h6 className="group-title mb-1">{group.title}</h6>
            {group.description && (
              <small className="text-muted">{group.description}</small>
            )}
          </div>

          {/* Group Addons */}
          <div className="group-addons">
            {group.addons.map((addon) => {
              const quantity = getAddonQuantity(addon.addonId);
              const addonPrice = parseFloat(addon.price || addon.addonPrice);

              return (
                <div key={addon.addonId} className="addon-item d-flex justify-content-between align-items-center py-3 border-bottom">
                  <div className="addon-info flex-grow-1">
                    <div className="addon-title fw-medium">{addon.addonTitle}</div>
                    {addon.addonDescription && (
                      <div className="addon-description text-muted small mt-1">
                        {addon.addonDescription}
                      </div>
                    )}
                    {addon.isRequired && (
                      <span className="badge bg-warning text-dark small mt-1">Required</span>
                    )}
                  </div>

                  <div className="addon-controls d-flex align-items-center">
                    <div className="quantity-controls d-flex align-items-center me-3">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => updateAddonQuantity(addon.addonId, quantity - 1)}
                        disabled={quantity <= 0}
                        style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <i className="fas fa-minus" style={{ fontSize: '12px' }}></i>
                      </button>
                      
                      <span className="quantity-display mx-3 fw-medium" style={{ minWidth: '20px', textAlign: 'center' }}>
                        {quantity}
                      </span>
                      
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => updateAddonQuantity(addon.addonId, quantity + 1)}
                        style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <i className="fas fa-plus" style={{ fontSize: '12px' }}></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Summary - buttons removed, using central button now */}
      {productType === 'group' && !hasSelectedAddons && (
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle me-2" />
          Please select at least one addon to continue
        </div>
      )}
      
    </div>
  );
};

/* ───────────────────────────────────────────────────────────
   Page component
   ────────────────────────────────────────────────────────── */

export default function ProjectDetailsPage() {
  const { slug }          = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  
  // State for pricing and checkout readiness
  const [basePrice, setBasePrice] = useState<number>(0);
  const [variationPrice, setVariationPrice] = useState<number>(0);
  const [addonPrice, setAddonPrice] = useState<number>(0);
  const [variationComplete, setVariationComplete] = useState<boolean>(false);
  const [checkoutReady, setCheckoutReady] = useState<boolean>(false);
  
  // State for cart data
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [selectedAddons, setSelectedAddons] = useState<Array<{addonId: string, title: string, price: number, quantity: number, groupTitle: string}>>([]);
  const [addingToCart, setAddingToCart] = useState(false);

  // Calculate current price from all components
  const currentPrice = useMemo(() => {
    const total = basePrice + variationPrice + addonPrice;
    console.log('Price calculation:', { basePrice, variationPrice, addonPrice, total });
    return total;
  }, [basePrice, variationPrice, addonPrice]);

  const [taxSettings, setTaxSettings] = useState<{
    vatTax: { enabled: boolean; type: 'percentage' | 'fixed'; value: number } | null;
    serviceTax: { enabled: boolean; type: 'percentage' | 'fixed'; value: number } | null;
  } | null>(null);

  const [taxCalculation, setTaxCalculation] = useState<{
    vatAmount: number;
    serviceAmount: number;
    totalTaxAmount: number;
    finalAmount: number;
  }>({
    vatAmount: 0,
    serviceAmount: 0,
    totalTaxAmount: 0,
    finalAmount: 0,
  });

  /* Store current URL when component mounts */
  useEffect(() => {
    const currentUrl = `/product-details/${slug}`;
    storeLastVisitedPage(currentUrl);
  }, [slug]);

  /* Clear cart when component mounts */
  useEffect(() => {
    // Clear the cart when opening a product details page
    clearCart();
    console.log('🛒 Cart cleared - starting fresh for new product');
  }, []); // Run only once when component mounts

  /* Fetch product data */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok)
          throw new Error(res.status === 404 ? 'Product not found' : 'Failed to fetch product');

        const productData = await res.json();
        setProduct(productData);
        setBasePrice(parseFloat(productData.price) || 0);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  /* Derived data (handles single- / double-encoded JSON) */
  const images             = useMemo(() => deepParseJSON(product?.images),             [product]);
  const tags               = useMemo(() => deepParseJSON(product?.tags),               [product]);
  const dimensions         = useMemo(() => deepParseJSON(product?.dimensions),         [product]);
  const variationAttributes= useMemo(() => normalizeVariationAttributes(product?.variationAttributes),[product]);

  /* Fetch tax settings */
  useEffect(() => {
    const getTaxSettings = async () => {
      try {
        const settings = await fetchTaxSettings();
        setTaxSettings(settings);
      } catch (error) {
        console.error('Error fetching tax settings:', error);
      }
    };
    getTaxSettings();
  }, []);

  /* Calculate taxes whenever price changes */
  useEffect(() => {
    if (taxSettings && product?.taxable) {
      const taxes = calculateTaxes(currentPrice, taxSettings.vatTax, taxSettings.serviceTax);
      setTaxCalculation(taxes);
    } else {
      setTaxCalculation({
        vatAmount: 0,
        serviceAmount: 0,
        totalTaxAmount: 0,
        finalAmount: currentPrice,
      });
    }
  }, [currentPrice, taxSettings, product?.taxable]);

  /* Add to cart handler */
  const handleAddToCart = async () => {
    if (!product) return;

    // Check if user is logged in
    if (!session) {
      // Store current URL and redirect to login
      const returnUrl = `/product-details/${slug}`;
      router.push(`/login-register?callbackUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    setAddingToCart(true);

    try {
      // Create cart item with tax information
      const cartItem: CartItem = {
        productId: product.id,
        productTitle: product.name,
        productPrice: currentPrice,
        variationPrice: variationPrice, // Store variation price separately
        quantity: 1,
        selectedVariations: selectedVariations,
        selectedAddons: selectedAddons,
        productImage: images?.[0] || '',
        productSku: product.sku || '',
        taxes: {
          vatAmount: taxCalculation.vatAmount,
          serviceAmount: taxCalculation.serviceAmount,
          totalTaxAmount: taxCalculation.totalTaxAmount,
          finalAmount: taxCalculation.finalAmount,
        },
      };

      // Add to cart
      addToCart(cartItem);

      // Redirect to checkout
      router.push('/checkout');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  /* ─ Loading & error UI (unchanged) ─ */
  if (loading) {
    return (
      <>
      <Header />
        <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: 400 }}>
                        <LoadingSpinner size="medium" color="#0d6efd" />
        </div>
      <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
      <Header />
        <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: 400 }}>
          <div className="text-center">
            <h2>Product Not Found</h2>
            <p className="text-muted">{error || 'The requested product could not be found.'}</p>
            <Link href="/all-categories" className="th-btn">
              Back to Categories <i className="far fa-arrow-right ms-2" />
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  /* ─────────────────────────────────────────────────────────
     MAIN RENDER (identical to your old layout, but with the
     new VariationSelector)
     ──────────────────────────────────────────────────────── */

  return (
    <>
<Header />
      {/* Breadcrumb Area */}
      <div className="breadcumb-wrapper background-image shape-mockup-wrap" style={{backgroundImage: 'url(/assets/img/bg/breadcrumb-bg.jpg)'}}>
          <div className="breadcrumb-bottom-shape"><Image src="/assets/img/bg/breadcrumb-bottom.png" alt="shape" width={100} height={100}/></div>
          <div className="shape-mockup breadcrumb-left jump-reverse"><Image src="/assets/img/icon/breadcrumb-left.png" alt="shape" width={100} height={100}/></div>
          <div className="shape-mockup breadcrumb-right jump"><Image src="/assets/img/icon/breadcrumb-right.png" alt="shape" width={100} height={100}/></div>
          <div className="container">
              <div className="breadcumb-content">
                  <h1 className="breadcumb-title">{product.name} </h1>
                  <ul className="breadcumb-menu">
                      <li><Link href="/">Home</Link></li>
                      <li><Link href="/all-categories">Categories</Link></li>
                      <li>{product.name}</li>
                  </ul>
              </div>
          </div>
      </div>
      {/* Breadcrumb */}



      

        <section className="space-top space-extra2-bottom">
            <div className="container">
                <div className="row">
                    <div className="col-xxl-8 col-lg-8">
                        <div className="page-single mb-30">
                            <div className="page-img">
                               <Image 
                              src={product.banner || "/assets/img/service/service_details.jpg"} 
                              alt={product.name} 
                              width={1000} 
                              height={200} 
                              style={{height: '270px'}}
                              className="w-100" />
                            </div>
                            <div className="page-content">
                                {/*<h2 className="sec-title page-title">{product.name}</h2>*/}
                                <div 
                                    className="product-description"
                                    dangerouslySetInnerHTML={{ __html: product.description || '' }}
                                />
                            
                            
                            {/* Product Variations - After Description */}
                            {product.productType === 'variable' && (

                            <VariationSelector
                              variationAttributes={variationAttributes}
                              productType={product.productType}
                              basePrice={product.price}
                              product={product}
                              onPriceChange={setVariationPrice}
                              onVariationComplete={setVariationComplete}
                              onSelectionChange={setSelectedVariations}
                              onAddToCart={handleAddToCart}
                            />

                            )}

                            {/* Product Addons - After Description - Show for all product types */}
                            {product.addons && product.addons.length > 0 && (

                            <GroupedAddonsSelector
                              addons={product.addons || []}
                              productType={product.productType}
                              basePrice={product.price}
                              onCheckoutReady={setCheckoutReady}
                              onSelectionChange={setSelectedAddons}
                              onAddToCart={handleAddToCart}
                              onPriceChange={setAddonPrice}
                            />

                            )}

                            {/* Universal Book Now button - handles all product types */}
                            <div className="universal-checkout">
                              <button
                                type="button"
                                className="th-btn"
                                onClick={handleAddToCart}
                                disabled={
                                  addingToCart || 
                                  (product.productType === 'variable' && !variationComplete) ||
                                  (product.productType === 'group' && !checkoutReady)
                                }
                              >
                                {addingToCart ? (
                                  <>
                                    <LoadingSpinner size="small" color="#ffffff" className="me-2" />
                                    Adding to Cart...
                                  </>
                                ) : (
                                  <>
                                    Book Now
                                  </>
                                )}
                              </button>
                            </div>

                            {!session && (
                            <p className="text-muted small mt-2">
                            <i className="fas fa-info-circle me-1"></i>
                            You'll be redirected to login first
                            </p>
                            )}
                            
                            
                            </div>
                        </div>
                    </div>
                    <div className="col-xxl-4 col-lg-4">
                      <aside className="sidebar-area">
                        <div className="order-summary-widget">
                          <h4 className="summary-title">Summary</h4>
                          
                          <div className="product-info">
                            <h5 className="product-name">{product.name}</h5>
                            
                            {/* Show selected variations */}
                            {product.productType === 'variable' && Object.values(selectedVariations).some(v => v) && (
                              <div className="variations-display">
                                {Object.entries(selectedVariations)
                                  .filter(([, value]) => value)
                                  .map(([key, value], index, array) => (
                                    <span key={key} className="variation-item">
                                      {key}: {value}
                                      {index < array.length - 1 && '    '}
                                    </span>
                                  ))}
                              </div>
                            )}
                          </div>

                          {/* Show selected addons for reference only */}
                          {selectedAddons && selectedAddons.length > 0 && (
                            <div className="addons-section">
                              <h6 className="section-title">Selected Add-ons</h6>
                              <div className="addons-list">
                                {selectedAddons.map((addon, index) => (
                                  <div key={index} className="addon-item">
                                    <div className="addon-info">
                                      <span className="addon-name">{addon.title}</span>
                                      {addon.quantity > 1 && (
                                        <span className="addon-quantity"> × {addon.quantity}</span>
                                      )}
                                    </div>
                                    <div className="addon-note">
                                      <span className="text-muted">Included</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <hr className="summary-divider" />

                          <div className="total-section">
                            {/* Base Price */}
                            <div className="total-row">
                              <span className="total-label">Base Price:</span>
                              <span className="total-amount">
                                <CurrencySymbol /> {basePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>

                            {/* Variation Price Difference */}
                            {variationPrice !== 0 && (
                              <div className="total-row">
                                <span className="total-label">Variation Adjustment:</span>
                                <span className="total-amount">
                                  <CurrencySymbol /> {variationPrice > 0 ? '+' : ''}{variationPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                            )}

                            {/* Addon Price */}
                            {addonPrice > 0 && (
                              <div className="total-row">
                                <span className="total-label">Add-ons:</span>
                                <span className="total-amount">
                                  <CurrencySymbol /> +{addonPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                            )}

                            {/* Subtotal */}
                            <div className="total-row subtotal-row">
                              <span className="total-label">Subtotal:</span>
                              <span className="total-amount">
                                <CurrencySymbol /> {currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>

                            {/* VAT Tax */}
                            {product?.taxable && taxSettings?.vatTax?.enabled && (
                              <div className="total-row">
                                <span className="total-label">
                                  VAT ({taxSettings.vatTax.type === 'percentage' ? `${taxSettings.vatTax.value}%` : 'Fixed'}):
                                </span>
                                <span className="total-amount">
                                  <CurrencySymbol /> {formatTaxAmount(taxCalculation.vatAmount)}
                                </span>
                              </div>
                            )}

                            {/* Service Tax */}
                            {product?.taxable && taxSettings?.serviceTax?.enabled && (
                              <div className="total-row">
                                <span className="total-label">
                                  Service Tax ({taxSettings.serviceTax.type === 'percentage' ? `${taxSettings.serviceTax.value}%` : 'Fixed'}):
                                </span>
                                <span className="total-amount">
                                  <CurrencySymbol /> {formatTaxAmount(taxCalculation.serviceAmount)}
                                </span>
                              </div>
                            )}

                            {/* Total Tax Amount */}
                            {product?.taxable && taxCalculation.totalTaxAmount > 0 && (
                              <div className="total-row">
                                <span className="total-label">Total Tax:</span>
                                <span className="total-amount">
                                  <CurrencySymbol /> {formatTaxAmount(taxCalculation.totalTaxAmount)}
                                </span>
                              </div>
                            )}

                            <hr className="summary-divider" />

                            {/* Final Total */}
                            <div className="total-row grand-total">
                              <span className="total-label">Total Amount:</span>
                              <span className="total-amount">
                                <CurrencySymbol /> {formatTaxAmount(taxCalculation.finalAmount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </aside>
                    </div>
                </div>
            </div>
        </section>

     

<Footer />

      <style jsx>{`
        .test-currency {
          font-family: 'currency-symbol-v2', Arial, sans-serif;
          font-size: 2rem;
          color: #007bff;
        }
        .sidebar-area {
          position: sticky;
          top: 120px;
          align-self: flex-start;
        }

        .order-summary-widget {
          background: #ffffff;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
          margin-bottom: 2rem;
        }

        .summary-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1.5rem;
          padding-bottom: 0;
        }

        .product-info {
          margin-bottom: 1rem;
        }

        .product-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        .variations-display {
          font-size: 0.95rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .variation-item {
          background: #f2f2f2;
          padding: 5px 12px;
          margin-bottom: 5px;
          display: inline-block;
          -webkit-border-radius: 24px;
          -moz-border-radius: 24px;
          border-radius: 24px;
          font-weight: 500;
          color: black;
        }

        .addons-section {
          margin-bottom: 1rem;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.75rem;
        }

        .addons-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .addon-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .addon-item:last-child {
          border-bottom: none;
        }

        .addon-info {
          flex: 1;
        }

        .addon-name {
          font-size: 0.9rem;
          color: #374151;
          font-weight: 500;
        }

        .addon-quantity {
          font-size: 0.8rem;
          color: #6b7280;
          font-weight: 400;
        }

        .addon-note {
          font-size: 0.8rem;
          color: #6b7280;
          font-style: italic;
        }

        .summary-divider {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 0.75rem 0;
        }

        .price-breakdown {
          margin-bottom: 1rem;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .price-label {
          font-size: 0.95rem;
          color: #6b7280;
          font-weight: 400;
        }

        .price-value {
          font-size: 0.95rem;
          color: #1f2937;
          font-weight: 500;
        }

        .addons-section {
          margin-bottom: 0.75rem;
        }

        .addons-section .price-label {
          display: block;
          margin-bottom: 0.5rem;
        }

        .addons-list {
          margin-left: 0;
        }

        .addon-group {
          margin-bottom: 0.75rem;
        }

        .addon-group:last-child {
          margin-bottom: 0;
        }

        .addon-group-header {
          font-size: 0.9rem;
          color: #374151;
          font-weight: 600;
          margin-bottom: 0.25rem;
          margin-left: 0.25rem;
        }

        .addon-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          padding-left: 0.5rem;
        }

        .addon-name {
          font-size: 0.9rem;
          color: #6b7280;
          flex: 1;
        }

        .addon-price {
          font-size: 0.9rem;
          color: #1f2937;
          font-weight: 500;
        }

        .quantity-section {
          margin-bottom: 1rem;
        }

        .quantity-value {
          font-size: 0.95rem;
          color: #1f2937;
          font-weight: 500;
        }

        .total-section {
          padding-top: 0.5rem;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .total-row.font-bold {
          font-weight: bold;
          font-size: 1.1rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }

        .total-label {
          font-size: 0.95rem;
          color: #6b7280;
          font-weight: 400;
        }

        .total-amount {
          font-size: 0.95rem;
          color: #1f2937;
          font-weight: 500;
        }

        .subtotal-row {
          border-top: 1px solid #e5e7eb;
          padding-top: 0.75rem;
          margin-top: 0.5rem;
        }

        .subtotal-row .total-label {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .subtotal-row .total-amount {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .grand-total .total-label {
          font-size: 1.1rem;
          color: #1f2937;
          font-weight: 700;
        }

        .grand-total .total-amount {
          font-size: 1.25rem;
          color: #3b82f6;
          font-weight: 700;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .order-summary-widget {
            padding: 20px;
          }
          
          .summary-title {
            font-size: 1.3rem;
          }
          
          .total-amount {
            font-size: 1.15rem;
          }
        }
      `}</style>
    
    </>
  );
}