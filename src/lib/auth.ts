import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';

export async function verifyAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const allowedEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'sandorhatalovics@gmail.com,galferenc18@gmail.com').split(',').map(e => e.trim());
    
    if (!decoded.email || !allowedEmails.includes(decoded.email)) {
      console.error('Unauthorized email access attempt:', decoded.email);
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Firebase verifyIdToken error:', error);
    return null;
  }
}
