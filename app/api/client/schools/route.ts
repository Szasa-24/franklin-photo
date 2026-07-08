import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { schools } from '@/src/db/schema';

export async function GET() {
  try {
    const availableSchools = await db.select({
      id: schools.id,
      name: schools.name,
    }).from(schools);
    
    return NextResponse.json(availableSchools);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch schools' }, { status: 500 });
  }
}
