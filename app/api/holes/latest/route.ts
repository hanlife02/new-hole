import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '0');
  const limit = 20;
  const offset = page * limit;

  try {
    const latestPidResult = await pool.query('SELECT pid FROM latest_pid WHERE id = 1');
    const latestPid = latestPidResult.rows[0]?.pid || 0;

    const holesResult = await pool.query(`
      SELECT h.*,
        COALESCE(
          json_agg(
            json_build_object(
              'cid', c.cid,
              'text', c.text,
              'name', c.name,
              'replied_to_cid', c.replied_to_cid,
              'created_at', c.created_at
            ) ORDER BY c.created_at ASC
          ) FILTER (WHERE c.cid IS NOT NULL),
          '[]'
        ) as comments
      FROM holes h
      LEFT JOIN comments c ON h.pid = c.pid
      WHERE h.pid <= $1
      GROUP BY h.id, h.pid, h.text, h.type, h.created_at, h.updated_at, h.reply, h.likenum, h.image_response, h.extra
      ORDER BY h.pid DESC
      LIMIT $2 OFFSET $3
    `, [latestPid, limit, offset]);

    return NextResponse.json(holesResult.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}