import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    const sortBy = searchParams.get('sortBy') || 'both';
    const threshold = parseInt(searchParams.get('threshold') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');

    let timeCondition = '';
    const now = new Date();

    switch (timeRange) {
      case '24h':
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        timeCondition = `AND created_at >= '${yesterday.toISOString()}'`;
        break;
      case '3d':
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        timeCondition = `AND created_at >= '${threeDaysAgo.toISOString()}'`;
        break;
      case '7d':
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        timeCondition = `AND created_at >= '${sevenDaysAgo.toISOString()}'`;
        break;
    }

    let orderBy = '';
    let whereCondition = '';

    switch (sortBy) {
      case 'star':
        whereCondition = `WHERE likenum >= ${threshold}`;
        orderBy = 'ORDER BY likenum DESC, created_at DESC';
        break;
      case 'reply':
        whereCondition = `WHERE reply >= ${threshold}`;
        orderBy = 'ORDER BY reply DESC, created_at DESC';
        break;
      case 'both':
        whereCondition = `WHERE (likenum + reply) >= ${threshold}`;
        orderBy = 'ORDER BY (likenum + reply) DESC, created_at DESC';
        break;
    }

    const holesQuery = `
      SELECT * FROM holes
      ${whereCondition} ${timeCondition}
      ${orderBy}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countQuery = `
      SELECT COUNT(*) as total FROM holes
      ${whereCondition} ${timeCondition}
    `;

    const [holesResult, countResult] = await Promise.all([
      pool.query(holesQuery),
      pool.query(countQuery)
    ]);

    const holes = holesResult.rows;
    const total = parseInt(countResult.rows[0].total);

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
      total,
      hasMore: offset + limit < total
    });
  } catch (error) {
    console.error('获取热点树洞失败:', error);
    return NextResponse.json(
      { error: '获取热点树洞失败' },
      { status: 500 }
    );
  }
}