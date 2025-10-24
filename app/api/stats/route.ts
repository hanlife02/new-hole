import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// 强制动态渲染，禁用静态生成
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const holesCountQuery = 'SELECT COUNT(*) as count FROM holes';
    const commentsCountQuery = 'SELECT COUNT(*) as count FROM comments';

    const [holesResult, commentsResult] = await Promise.all([
      pool.query(holesCountQuery),
      pool.query(commentsCountQuery)
    ]);

    const holesCount = parseInt(holesResult.rows[0].count);
    const commentsCount = parseInt(commentsResult.rows[0].count);

    return NextResponse.json({
      holes: holesCount,
      comments: commentsCount
    });
  } catch (error) {
    console.error('获取统计信息失败:', error);
    return NextResponse.json(
      { error: '获取统计信息失败' },
      { status: 500 }
    );
  }
}