import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Changed from 'prisma' to 'db'

export async function POST(request: Request) {
  try {
    // Ensure you are using 'db' here as well
    const body = await request.json();
    const user = await db.user.create({
      data: body,
    });
    return NextResponse.json(user);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}