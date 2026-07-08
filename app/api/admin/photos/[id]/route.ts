import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db';
import { photos } from '@/src/db/schema';
import { verifyAuth } from '@/src/lib/auth';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { del } from '@vercel/blob';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const photoId = parseInt(id);

    // Get photo record to find physical files
    const photoRecord = await db.select().from(photos).where(eq(photos.id, photoId));
    
    if (photoRecord.length === 0) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    const photo = photoRecord[0];

    if (process.env.BLOB_READ_WRITE_TOKEN && photo.originalPath.startsWith('https://')) {
      try {
        await del(photo.originalPath);
        await del(photo.thumbnailPath);
      } catch (e) {
        console.error('Error deleting blob:', e);
      }
    } else {
      // Delete physical files
      try {
        const originalFilePath = path.join(process.cwd(), 'public', photo.originalPath);
        const thumbnailFilePath = path.join(process.cwd(), 'public', photo.thumbnailPath);
        
        if (fs.existsSync(originalFilePath)) fs.unlinkSync(originalFilePath);
        if (fs.existsSync(thumbnailFilePath)) fs.unlinkSync(thumbnailFilePath);
      } catch (fsError) {
        console.error('Error deleting physical file:', fsError);
      }
    }

    // Delete from DB
    await db.delete(photos).where(eq(photos.id, photoId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
