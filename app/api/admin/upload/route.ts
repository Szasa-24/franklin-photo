import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db';
import { photos } from '@/src/db/schema';
import { verifyAuth } from '@/src/lib/auth';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import crypto from 'crypto';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const schoolIdStr = formData.get('schoolId') as string;

    if (!file || !schoolIdStr) {
      return NextResponse.json({ error: 'Missing file or schoolId' }, { status: 400 });
    }

    const schoolId = parseInt(schoolIdStr);
    const buffer = Buffer.from(await file.arrayBuffer());
    
    const hash = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.name) || '.jpg';
    const filename = `${hash}${ext}`;
    const thumbFilename = `thumb_${filename}`;

    const thumbnailBuffer = await sharp(buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    let publicOriginalPath = '';
    let publicThumbnailPath = '';

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Use Vercel Blob
      const originalBlob = await put(`uploads/${filename}`, buffer, { access: 'public' });
      const thumbBlob = await put(`thumbnails/${thumbFilename}`, thumbnailBuffer, { access: 'public' });
      
      publicOriginalPath = originalBlob.url;
      publicThumbnailPath = thumbBlob.url;
    } else {
      // Use local fs
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      const thumbnailsDir = path.join(process.cwd(), 'public', 'thumbnails');
      
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      if (!fs.existsSync(thumbnailsDir)) fs.mkdirSync(thumbnailsDir, { recursive: true });

      fs.writeFileSync(path.join(uploadsDir, filename), buffer);
      fs.writeFileSync(path.join(thumbnailsDir, thumbFilename), thumbnailBuffer);

      publicOriginalPath = `/uploads/${filename}`;
      publicThumbnailPath = `/thumbnails/${thumbFilename}`;
    }

    const inserted = await db.insert(photos).values({
      schoolId,
      originalPath: publicOriginalPath,
      thumbnailPath: publicThumbnailPath,
      filename: file.name
    }).returning({ id: photos.id, thumbnailPath: photos.thumbnailPath, filename: photos.filename });

    return NextResponse.json(inserted[0]);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }
}
