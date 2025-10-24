import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pid = searchParams.get('pid');

    if (!pid) {
      return NextResponse.json(
        { error: 'PID参数是必需的' },
        { status: 400 }
      );
    }

    const pidNumber = parseInt(pid);
    if (isNaN(pidNumber)) {
      return NextResponse.json(
        { error: 'PID必须是有效的数字' },
        { status: 400 }
      );
    }

    const holeQuery = 'SELECT * FROM holes WHERE pid = $1';
    const holeResult = await pool.query(holeQuery, [pidNumber]);

    if (holeResult.rows.length === 0) {
      return NextResponse.json(
        { error: '未找到指定PID的树洞' },
        { status: 404 }
      );
    }

    const hole = holeResult.rows[0];

    const commentsQuery = `
      SELECT * FROM comments
      WHERE pid = $1
      ORDER BY created_at ASC
    `;
    const commentsResult = await pool.query(commentsQuery, [pidNumber]);

    const holeWithComments = {
      ...hole,
      comments: commentsResult.rows
    };

    return NextResponse.json({ hole: holeWithComments });
  } catch (error) {
    console.error('PID查询失败:', error);
    return NextResponse.json(
      { error: 'PID查询失败' },
      { status: 500 }
    );
  }
}