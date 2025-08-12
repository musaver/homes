import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { orders, user } from '@/lib/schema';
import { v4 as uuidv4 } from 'uuid';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      productId,
      productName,
      fullName, 
      phoneNumber, 
      emailAddress,
      serviceType,
      consultationDate,
      consultationTime,
      additionalNotes
    } = body;

    // Validate required fields
    if (!fullName || !phoneNumber || !emailAddress || !serviceType || !consultationDate || !consultationTime) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      return NextResponse.json({ 
        error: 'Invalid email address format' 
      }, { status: 400 });
    }

    // Validate date (must be today or future)
    const selectedDate = new Date(consultationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return NextResponse.json({ 
        error: 'Consultation date must be today or in the future' 
      }, { status: 400 });
    }

    // Get session (optional for consultations)
    const session = await getServerSession(authOptions);
    
    // If user is logged in, update their profile
    if (session?.user?.email) {
      try {
        await db
          .update(user)
          .set({
            name: fullName,
            phone: phoneNumber || null,
            updatedAt: new Date(),
          })
          .where(eq(user.email, session.user.email));
      } catch (profileError) {
        console.error('Failed to update user profile:', profileError);
        // Don't fail the consultation if profile update fails
      }
    }

    // Generate consultation order number (CONS-YYYYMMDD-XXX)
    const orderNumber = `CONS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // Create consultation record in orders table with special consultation fields
    const consultationId = uuidv4();
    
    // Create special consultation notes
    const consultationNotes = [
      `=== CONSULTATION BOOKING ===`,
      `Product: ${productName}`,
      `Service Type: ${serviceType}`,
      `Consultation Date: ${consultationDate}`,
      `Consultation Time: ${consultationTime}`,
      additionalNotes ? `Additional Notes: ${additionalNotes}` : '',
    ].filter(note => note).join('\n');

    await db.insert(orders).values({
      id: consultationId,
      orderNumber,
      userId: session?.user?.id || null,
      email: emailAddress,
      phone: phoneNumber,
      status: 'consultation_pending', // Special status for consultations
      paymentStatus: 'not_applicable', // Consultations are free
      subtotal: 0, // Free consultation
      taxAmount: '0,0',
      totalAmount: 0,
      shippingAddress1: 'N/A - Consultation Only',
      shippingCity: null,
      shippingState: null,
      shippingPostalCode: null,
      shippingCountry: 'UAE',
      notes: consultationNotes,
      serviceDate: consultationDate,
      serviceTime: consultationTime,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send consultation confirmation email
    try {
      const emailData = {
        orderNumber,
        userName: fullName,
        userEmail: emailAddress,
        phone: phoneNumber,
        serviceDate: consultationDate,
        serviceTime: consultationTime,
        serviceType: serviceType,
        productName,
        additionalNotes: additionalNotes || 'None',
        isConsultation: true
      };

      await sendOrderConfirmationEmail(emailData);
      console.log('✅ Consultation confirmation email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send consultation confirmation email:', emailError);
      // Don't fail the consultation if email fails
    }

    console.log('✅ Consultation booked successfully:', {
      orderNumber,
      fullName,
      phoneNumber,
      emailAddress,
      serviceType: serviceType,
      consultationDate,
      consultationTime,
      productName
    });

    return NextResponse.json({
      success: true,
      consultationNumber: orderNumber,
      message: 'Consultation booked successfully! We will contact you shortly to confirm the details.',
      consultation: {
        id: consultationId,
        orderNumber,
        fullName,
        phoneNumber,
        emailAddress,
        serviceType: serviceType,
        consultationDate,
        consultationTime,
        productName,
        additionalNotes
      }
    });

  } catch (error) {
    console.error('Error booking consultation:', error);
    return NextResponse.json({ 
      error: 'Failed to book consultation. Please try again.' 
    }, { status: 500 });
  }
}
