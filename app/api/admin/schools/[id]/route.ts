import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db';
import { schools, photos } from '@/src/db/schema';
import { verifyAuth } from '@/src/lib/auth';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { del } from '@vercel/blob';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const schoolList = await db.select().from(schools).where(eq(schools.id, parseInt(id)));
    if (schoolList.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(schoolList[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const schoolId = parseInt(id);

    // Get all photos for this school to delete physical files
    const schoolPhotos = await db.select().from(photos).where(eq(photos.schoolId, schoolId));
    
    // Delete physical files
    for (const photo of schoolPhotos) {
      if (process.env.BLOB_READ_WRITE_TOKEN && photo.originalPath.startsWith('https://')) {
        try {
          await del(photo.originalPath);
          await del(photo.thumbnailPath);
        } catch (e) {
          console.error('Error deleting blob:', e);
        }
      } else {
        try {
          const originalFilePath = path.join(process.cwd(), 'public', photo.originalPath);
          const thumbnailFilePath = path.join(process.cwd(), 'public', photo.thumbnailPath);
          
          if (fs.existsSync(originalFilePath)) fs.unlinkSync(originalFilePath);
          if (fs.existsSync(thumbnailFilePath)) fs.unlinkSync(thumbnailFilePath);
        } catch (fsError) {
          console.error('Error deleting physical file:', fsError);
          // Continue even if file deletion fails
        }
      }
    }

    // Delete photos from DB
    await db.delete(photos).where(eq(photos.schoolId, schoolId));
    
    // Delete school from DB
    await db.delete(schools).where(eq(schools.id, schoolId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete school' }, { status: 500 });
  }
}
