import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const cursorParam = searchParams.get('cursor');
    const cursor = cursorParam ? parseInt(cursorParam, 10) : undefined;
    const queryLimit = Math.max(1, limit);
    const limitPlusOne = queryLimit + 1;

    let holesQuery = `
      SELECT * FROM holes
      ORDER BY pid DESC
      LIMIT $1
    `;
    const queryParams: Array<number> = [limitPlusOne];

    if (Number.isFinite(cursor)) {
      holesQuery = `
        SELECT * FROM holes
        WHERE pid < $1
        ORDER BY pid DESC
        LIMIT $2
      `;
      queryParams.splice(0, queryParams.length, cursor as number, limitPlusOne);
    }

    const holesResult = await pool.query(holesQuery, queryParams);
    const rows = holesResult.rows;
    const hasMore = rows.length > queryLimit;
    const holes = rows.slice(0, queryLimit);

    const holesWithComments = await Promise.all(
      holes.map(async (hole) => {
        const commentsQuery = `
          SELECT * FROM comments
          WHERE pid = $1
          ORDER BY created_at ASC
        `;
        const commentsResult = await pool.query(commentsQuery, [hole.pid]);

        return {
          ...hole,
          comments: commentsResult.rows
        };
      })
    );

    return NextResponse.json({
      holes: holesWithComments,
      hasMore,
    });
  } catch (error) {
    console.error('获取最新树洞失败:', error);
    return NextResponse.json(
      { error: '获取最新树洞失败' },
      { status: 500 }
    );
  }
}
