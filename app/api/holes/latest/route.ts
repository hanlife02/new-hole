import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');

    const latestPidQuery = 'SELECT pid FROM latest_pid WHERE id = 1';
    const latestPidResult = await pool.query(latestPidQuery);

    if (latestPidResult.rows.length === 0) {
      return NextResponse.json({ holes: [] });
    }

    const latestPid = latestPidResult.rows[0].pid;
    const startPid = latestPid - offset;
    const endPid = Math.max(1, startPid - limit + 1);

    const holesQuery = `
      SELECT * FROM holes
      WHERE pid <= $1 AND pid >= $2
      ORDER BY pid DESC
    `;

    const holesResult = await pool.query(holesQuery, [startPid, endPid]);
    const holes = holesResult.rows;

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
      hasMore: endPid > 1
    });
  } catch (error) {
    console.error('获取最新树洞失败:', error);
    return NextResponse.json(
      { error: '获取最新树洞失败' },
      { status: 500 }
    );
  }
}