import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db';
import { schools } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.GEMINI_API_KEY || 'fallback_secret_key_for_jwt_only';

export async function POST(req: NextRequest) {
  try {
    const { schoolId, password } = await req.json();
    if (!schoolId || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const schoolRecord = await db.select().from(schools).where(eq(schools.id, parseInt(schoolId)));
    if (schoolRecord.length === 0) {
      return NextResponse.json({ error: 'Hibás intézmény vagy jelszó' }, { status: 401 });
    }

    const school = schoolRecord[0];
    const match = await bcrypt.compare(password, school.passwordHash);

    if (!match) {
      return NextResponse.json({ error: 'Hibás intézmény vagy jelszó' }, { status: 401 });
    }

    const token = jwt.sign({ schoolId: school.id }, JWT_SECRET, { expiresIn: '2h' });

    return NextResponse.json({ token, school: { id: school.id, name: school.name } });
  } catch (error) {
    console.error('Client login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
