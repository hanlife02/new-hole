import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

function parseLimit(value: string | null) {
  if (!value) {
    return DEFAULT_LIMIT;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }
  return Math.min(parsed, MAX_LIMIT);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { pid: string } },
) {
  try {
    const pid = Number.parseInt(params.pid, 10);
    if (!Number.isFinite(pid) || pid <= 0) {
      return NextResponse.json(
        { error: 'PID必须是有效的数字' },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get('limit'));
    const cursorParam = searchParams.get('cursor');
    const cursor = cursorParam ? Number.parseInt(cursorParam, 10) : undefined;

    let commentsQuery = `
      SELECT *
      FROM comments
      WHERE pid = $1
      ORDER BY created_at ASC
      LIMIT $2
    `;
    let queryParams: Array<number> = [pid, limit];

    if (Number.isFinite(cursor)) {
      commentsQuery = `
        SELECT *
        FROM comments
        WHERE pid = $1
          AND cid > $2
        ORDER BY created_at ASC
        LIMIT $3
      `;
      queryParams = [pid, cursor as number, limit];
    }

    const commentsResult = await pool.query(commentsQuery, queryParams);
    const comments = commentsResult.rows;
    const lastComment = comments.at(-1);

    return NextResponse.json({
      comments,
      nextCursor: lastComment ? lastComment.cid : null,
      hasMore: Boolean(lastComment) && comments.length === limit,
    });
  } catch (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json(
      { error: '获取评论失败' },
      { status: 500 },
    );
  }
}
