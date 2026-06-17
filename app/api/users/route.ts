import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Check if the user already exists in your Neon database by name
    let user = await prisma.user.findUnique({
      where: { name: name }
    });

    // If they do not exist, create a new record saving their name and email
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name,
          email: email || null,
          pin: password
        }
      });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ success: false, error: "Failed to save user" }, { status: 500 });
  }
}