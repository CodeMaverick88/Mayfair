import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set');
}

const pool = new Pool({
  connectionString,
  // Optional: add ssl: { rejectUnauthorized: false } depending on provider (Neon usually works without this)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      password,
      country,
      phone,
      createdAt,
    } = body as {
      name?: string;
      email?: string;
      password?: string;
      country?: string;
      phone?: string;
      createdAt?: number;
    };

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const now = createdAt ?? Date.now();

    const query = `
      INSERT INTO users (name, email, password, country, phone, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE
        SET name = EXCLUDED.name,
            password = EXCLUDED.password,
            country = EXCLUDED.country,
            phone = EXCLUDED.phone,
            created_at = EXCLUDED.created_at
      RETURNING id, email;
    `;

    const values = [name, email, password, country ?? null, phone ?? null, now];

    const result = await pool.query(query, values);

    return NextResponse.json({ ok: true, user: result.rows[0] });
  } catch (err) {
    console.error('Error saving user to DB', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}