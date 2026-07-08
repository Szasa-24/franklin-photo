import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db';
import { schools } from '@/src/db/schema';
import { verifyAuth } from '@/src/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const allSchools = await db.select({
      id: schools.id,
      name: schools.name,
      createdAt: schools.createdAt,
      passwordPlain: schools.passwordPlain,
    }).from(schools);
    
    return NextResponse.json(allSchools);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, password } = await req.json();
    if (!name || !password) {
      return NextResponse.json({ error: 'Missing name or password' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const inserted = await db.insert(schools).values({
      name,
      passwordHash,
      passwordPlain: password,
    }).returning({ id: schools.id, name: schools.name, createdAt: schools.createdAt, passwordPlain: schools.passwordPlain });

    return NextResponse.json(inserted[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create school' }, { status: 500 });
  }
}
