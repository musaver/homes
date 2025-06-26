export async function sendTextEmail(to: string, subject: string, text: string) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Musaver', email: 'musaver@lmsyl.shop' },
      to: [{ email: to }],
      subject,
      textContent: text,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    console.error('Brevo Error:', error);
    throw new Error(error.message || 'Failed to send email');
  }

  return await res.json();
}

export async function sendWelcomeEmail(to: string, name?: string) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Musaver', email: 'musaver@lmsyl.shop' },
      to: [{ email: to }],
      subject: 'Welcome to the Platform!',
      textContent: `Hello${name ? ` ${name}` : ''}, thanks for signing up!`,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    console.error('Failed to send email via Brevo:', error);
    throw new Error(error.message || 'Brevo email failed');
  }

  return await res.json();
}

export async function sendOrderConfirmationEmail(
  to: string, 
  orderNumber: string, 
  customerName: string, 
  orderAmounts: {
    subtotal: number;
    vatAmount: number;
    serviceAmount: number;
    total: number;
  },
  orderItems: Array<{
    productName: string;
    quantity: number;
    price: number;
    variations?: string;
    addons?: string;
    taxes?: {
      vatAmount: number;
      serviceAmount: number;
      totalTaxAmount: number;
      finalAmount: number;
    };
  }>,
  serviceDate?: string,
  serviceTime?: string,
  specialInstructions?: string
) {
  const itemsText = orderItems.map(item => {
    let itemText = `• ${item.productName} (Qty: ${item.quantity}) - ${String.fromCharCode(0xe001)} ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (item.variations) {
      itemText += `\n  Variations: ${item.variations}`;
    }
    if (item.addons) {
      itemText += `\n  Add-ons: ${item.addons}`;
    }
    if (item.taxes) {
      itemText += `\n  VAT (${item.taxes.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
      itemText += `\n  Service Tax (${item.taxes.serviceAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
    }
    return itemText;
  }).join('\n\n');

  // Format service date and time for display
  const formatServiceDateTime = () => {
    if (!serviceDate || !serviceTime) return '';
    
    const date = new Date(serviceDate);
    const formattedDate = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Convert 24-hour time to 12-hour format
    const [hours, minutes] = serviceTime.split(':');
    const hour12 = parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours);
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    const formattedTime = `${hour12 === 0 ? 12 : hour12}:${minutes} ${ampm}`;
    
    return `\nScheduled Service:
Date: ${formattedDate}
Time: ${formattedTime}`;
  };

  const emailText = `
Dear ${customerName},

Thank you for your order! We've received your order and it's being processed.

Order Details:
Order Number: ${orderNumber}
Subtotal: ${String.fromCharCode(0xe001)} ${orderAmounts.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
VAT: ${String.fromCharCode(0xe001)} ${orderAmounts.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Service Tax: ${String.fromCharCode(0xe001)} ${orderAmounts.serviceAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Total Amount: ${String.fromCharCode(0xe001)} ${orderAmounts.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${formatServiceDateTime()}

Items Ordered:
${itemsText}${specialInstructions ? `\n\nSpecial Instructions:\n${specialInstructions}` : ''}

Your order status is currently "Pending" and will be updated once our team reviews and approves it.

You'll receive another email when your order status changes.

If you have any questions about your order, please contact us and reference your order number.

Thank you for choosing our services!

Best regards,
Team Quick Repair Homes
  `.trim();

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Musaver', email: 'musaver@lmsyl.shop' },
      to: [{ email: to }],
      subject: `Order Confirmation - ${orderNumber}`,
      textContent: emailText,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    console.error('Failed to send order confirmation email via Brevo:', error);
    throw new Error(error.message || 'Order confirmation email failed');
  }

  return await res.json();
}
