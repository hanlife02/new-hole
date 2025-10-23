import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { pid: string } }
) {
  const pid = parseInt(params.pid);

  if (isNaN(pid)) {
    return NextResponse.json({ error: 'Invalid PID' }, { status: 400 });
  }

  try {
    const holeResult = await pool.query(`
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
      WHERE h.pid = $1
      GROUP BY h.id, h.pid, h.text, h.type, h.created_at, h.updated_at, h.reply, h.likenum, h.image_response, h.extra
    `, [pid]);

    if (holeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Hole not found' }, { status: 404 });
    }

    return NextResponse.json(holeResult.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}