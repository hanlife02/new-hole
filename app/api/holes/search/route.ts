import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keywords = searchParams.get('keywords');
  const searchType = searchParams.get('type') || 'and';
  const page = parseInt(searchParams.get('page') || '0');
  const limit = 20;
  const offset = page * limit;

  if (!keywords) {
    return NextResponse.json({ error: 'Keywords required' }, { status: 400 });
  }

  const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);

  let whereCondition = '';
  const queryParams: any[] = [];

  if (searchType === 'and') {
    whereCondition = keywordList.map((_, index) => {
      queryParams.push(`%${keywordList[index]}%`);
      return `h.text ILIKE $${queryParams.length}`;
    }).join(' AND ');
  } else {
    whereCondition = keywordList.map((_, index) => {
      queryParams.push(`%${keywordList[index]}%`);
      return `h.text ILIKE $${queryParams.length}`;
    }).join(' OR ');
  }

  queryParams.push(limit, offset);

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
      WHERE ${whereCondition}
      GROUP BY h.id, h.pid, h.text, h.type, h.created_at, h.updated_at, h.reply, h.likenum, h.image_response, h.extra
      ORDER BY h.created_at DESC
      LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
    `, queryParams);

    return NextResponse.json(holesResult.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}