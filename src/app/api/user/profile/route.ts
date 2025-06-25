import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions} from '@/lib/auth';
import { db } from '@/lib/db';
import { user } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user data from database
    const [userData] = await db
      .select()
      .from(user)
      .where(eq(user.email, session.user.email))
      .limit(1);

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user profile data
    const profile = {
      name: userData.name || '',
      email: userData.email,
      phone: userData.phone || '',
      address: userData.address || '',
      city: userData.city || '',
      state: userData.state || '',
      postalCode: userData.postalCode || '',
      country: userData.country || 'UAE',
      gender: userData.firstName || '', // Using firstName field for gender temporarily
      emergencyContact: userData.lastName || '', // Using lastName field for emergency contact temporarily
      emergencyPhone: userData.displayName || '', // Using displayName field for emergency phone temporarily
    };

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profileData = await request.json();

    // Validate required fields
    if (!profileData.name || !profileData.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, session.user.email))
      .limit(1);

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user data in database
    await db
      .update(user)
      .set({
        name: profileData.name,
        phone: profileData.phone || null,
        address: profileData.address || null,
        city: profileData.city || null,
        state: profileData.state || null,
        postalCode: profileData.postalCode || null,
        country: profileData.country || 'UAE',
        firstName: profileData.gender || null, // Using firstName field for gender temporarily
        lastName: profileData.emergencyContact || null, // Using lastName field for emergency contact temporarily
        displayName: profileData.emergencyPhone || null, // Using displayName field for emergency phone temporarily
        updatedAt: new Date(),
      })
      .where(eq(user.email, session.user.email));

    console.log('Profile updated successfully for user:', session.user.email);

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      profile: profileData 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 