import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db';
import { photos } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.GEMINI_API_KEY || 'fallback_secret_key_for_jwt_only';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const schoolId = decoded.schoolId;

    const schoolPhotos = await db.select({
      id: photos.id,
      thumbnailPath: photos.thumbnailPath,
      originalPath: photos.originalPath,
      filename: photos.filename,
    })
    .from(photos)
    .where(eq(photos.schoolId, schoolId));
    
    return NextResponse.json(schoolPhotos);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}
