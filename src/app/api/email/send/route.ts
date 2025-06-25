import { NextResponse } from 'next/server';
//import { z } from 'zod';
import { randomInt } from 'crypto';
import { db } from '@/lib/db';
//import { user } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
//import { v4 as uuidv4 } from 'uuid';
import { sendTextEmail } from '@/lib/email';
import { verification_tokens } from '@/lib/schema';

export async function POST(req: Request) {
  const { to, subject, message } = await req.json();

  if (!to || !subject) {
    return NextResponse.json({ error: 'Missing email or subject' }, { status: 400 });
  }

  // Generate a 6-digit OTP code
  const otp = randomInt(100000, 999999).toString();
  // Generate a random token (for magic link)
  const token = (Math.random() + 1).toString(36).substring(2);

  // Hash both for storage
  const hashedOtp = await bcrypt.hash(otp, 10);
  const hashedToken = await bcrypt.hash(token, 10);

   // Expiration time (15 minutes from now)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const email = to; // Use the email from the request
  const verificationLink = `${process.env.NEXTAUTH_URL}/verify-otp?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;

   // Upsert: replace any existing token for this email
  await db.delete(verification_tokens).where(eq(verification_tokens.identifier, email));
  await db.insert(verification_tokens).values({ identifier: email, token: hashedToken, otp: hashedOtp, expires: expiresAt });

  // Use the message from request or create default OTP message
  const emailMessage = message || `Your OTP verification code is: ${otp}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this code, please ignore this email.`;

  try {
    await sendTextEmail(to, subject, emailMessage);
    return NextResponse.json({ success: true, otp: otp }); // Include OTP in response for testing
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
