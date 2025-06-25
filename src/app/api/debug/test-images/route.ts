import { NextResponse } from 'next/server';
import { normalizeProductImages } from '@/utils/jsonUtils';

export async function GET() {
  try {
    // Test with actual data from database
    const testImageData = "\"[\\\"https://7wrvwal0c4f2v4r6.public.blob.vercel-storage.com/products/1750772961194-blob\\\"]\"";
    
    console.log('🧪 Testing normalizeProductImages function:');
    console.log('Raw data:', testImageData);
    console.log('Raw data type:', typeof testImageData);
    
    const normalized = normalizeProductImages(testImageData);
    console.log('Normalized result:', normalized);
    console.log('Normalized type:', typeof normalized);
    console.log('Is array:', Array.isArray(normalized));
    console.log('Array length:', normalized.length);
    
    if (normalized.length > 0) {
      console.log('First image:', normalized[0]);
      console.log('First image type:', typeof normalized[0]);
    }

    return NextResponse.json({
      raw: testImageData,
      rawType: typeof testImageData,
      normalized: normalized,
      normalizedType: typeof normalized,
      isArray: Array.isArray(normalized),
      length: normalized.length,
      firstImage: normalized.length > 0 ? normalized[0] : null
    });
  } catch (error) {
    console.error('Error testing image normalization:', error);
    return NextResponse.json(
      { error: 'Failed to test normalization', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 