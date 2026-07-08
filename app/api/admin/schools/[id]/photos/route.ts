import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db';
import { photos } from '@/src/db/schema';
import { verifyAuth } from '@/src/lib/auth';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const schoolPhotos = await db.select({
      id: photos.id,
      thumbnailPath: photos.thumbnailPath,
      originalPath: photos.originalPath,
      filename: photos.filename,
      createdAt: photos.createdAt
    })
    .from(photos)
    .where(eq(photos.schoolId, parseInt(id)))
    .orderBy(desc(photos.createdAt));
    
    return NextResponse.json(schoolPhotos);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}
