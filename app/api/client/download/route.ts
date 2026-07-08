import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db';
import { photos, schools } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs';

const JWT_SECRET = process.env.GEMINI_API_KEY || 'fallback_secret_key_for_jwt_only';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return new NextResponse('Invalid token', { status: 401 });
    }

    const schoolId = decoded.schoolId;

    const schoolRecord = await db.select().from(schools).where(eq(schools.id, schoolId));
    if (schoolRecord.length === 0) {
      return new NextResponse('School not found', { status: 404 });
    }

    const schoolPhotos = await db.select().from(photos).where(eq(photos.schoolId, schoolId));
    
    const archive = archiver('zip', {
      zlib: { level: 5 } // Sets the compression level.
    });

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    archive.on('data', (chunk) => writer.write(chunk));
    archive.on('end', () => writer.close());
    archive.on('error', (err) => {
      console.error(err);
      writer.abort(err);
    });

    for (const photo of schoolPhotos) {
      if (photo.originalPath.startsWith('https://')) {
        try {
          const res = await fetch(photo.originalPath);
          if (res.ok) {
            const arrayBuffer = await res.arrayBuffer();
            archive.append(Buffer.from(arrayBuffer), { name: photo.filename });
          }
        } catch (e) {
          console.error('Failed to fetch blob for zip', e);
        }
      } else {
        const filePath = path.join(process.cwd(), 'public', photo.originalPath);
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: photo.filename });
        }
      }
    }

    archive.finalize();

    return new NextResponse(stream.readable, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="franklin_photo_${schoolRecord[0].name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip"`
      }
    });

  } catch (error) {
    console.error(error);
    return new NextResponse('Failed to generate zip', { status: 500 });
  }
}
