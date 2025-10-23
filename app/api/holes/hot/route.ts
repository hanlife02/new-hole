import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get('timeRange') || '24h';
  const sortBy = searchParams.get('sortBy') || 'stars';
  const threshold = parseInt(searchParams.get('threshold') || '20');
  const page = parseInt(searchParams.get('page') || '0');
  const limit = 20;
  const offset = page * limit;

  let timeCondition = '';
  switch (timeRange) {
    case '24h':
      timeCondition = "AND h.created_at >= NOW() - INTERVAL '24 hours'";
      break;
    case '3d':
      timeCondition = "AND h.created_at >= NOW() - INTERVAL '3 days'";
      break;
    case '7d':
      timeCondition = "AND h.created_at >= NOW() - INTERVAL '7 days'";
      break;
  }

  let orderBy = '';
  let thresholdCondition = '';
  switch (sortBy) {
    case 'stars':
      orderBy = 'ORDER BY h.likenum DESC';
      thresholdCondition = `AND h.likenum >= ${threshold}`;
      break;
    case 'replies':
      orderBy = 'ORDER BY h.reply DESC';
      thresholdCondition = `AND h.reply >= ${threshold}`;
      break;
    case 'combined':
      orderBy = 'ORDER BY (h.likenum + h.reply) DESC';
      thresholdCondition = `AND (h.likenum + h.reply) >= ${threshold}`;
      break;
  }

  try {
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
      WHERE 1=1 ${timeCondition} ${thresholdCondition}
      GROUP BY h.id, h.pid, h.text, h.type, h.created_at, h.updated_at, h.reply, h.likenum, h.image_response, h.extra
      ${orderBy}
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    return NextResponse.json(holesResult.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}