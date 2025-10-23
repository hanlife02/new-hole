import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const [holesResult, commentsResult] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM holes'),
      pool.query('SELECT COUNT(*) FROM comments')
    ]);

    return NextResponse.json({
      holes: parseInt(holesResult.rows[0].count),
      comments: parseInt(commentsResult.rows[0].count)
    });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}