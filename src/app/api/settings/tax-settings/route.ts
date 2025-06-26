import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings } from '@/lib/schema';
import { eq } from 'drizzle-orm';

const VAT_TAX_KEY = 'vat_tax_settings';
const SERVICE_TAX_KEY = 'service_tax_settings';

interface TaxSetting {
  enabled: boolean;
  type: 'percentage' | 'fixed';
  value: number;
}

export async function GET() {
  try {
    // Get both VAT and Service tax settings
    const taxSettings = await db
      .select()
      .from(settings)
      .where(
        eq(settings.key, VAT_TAX_KEY)
      );
    
    const serviceSettings = await db
      .select()
      .from(settings)
      .where(
        eq(settings.key, SERVICE_TAX_KEY)
      );
    
    const allTaxSettings = [...taxSettings, ...serviceSettings];

    let vatTax: TaxSetting | null = null;
    let serviceTax: TaxSetting | null = null;

    // Parse existing settings
    for (const setting of allTaxSettings) {
      try {
        const parsedValue = JSON.parse(setting.value);
        if (setting.key === VAT_TAX_KEY) {
          vatTax = parsedValue;
        } else if (setting.key === SERVICE_TAX_KEY) {
          serviceTax = parsedValue;
        }
      } catch (error) {
        console.error(`Error parsing ${setting.key}:`, error);
      }
    }

    return NextResponse.json({
      vatTax,
      serviceTax
    });
  } catch (error) {
    console.error('Error getting tax settings:', error);
    return NextResponse.json({ error: 'Failed to get tax settings' }, { status: 500 });
  }
} 