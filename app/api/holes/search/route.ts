import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keywords = searchParams.get('keywords');
    const searchType = searchParams.get('searchType') || 'or';
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!keywords || !keywords.trim()) {
      return NextResponse.json(
        { error: '关键词不能为空' },
        { status: 400 }
      );
    }

    const keywordList = keywords.trim().split(/\s+/).filter(k => k.length > 0);

    if (keywordList.length === 0) {
      return NextResponse.json(
        { error: '请输入有效的关键词' },
        { status: 400 }
      );
    }

    let whereCondition = '';
    let queryParams: string[] = [];

    if (searchType === 'and') {
      const conditions = keywordList.map((_, index) => {
        queryParams.push(`%${keywordList[index]}%`);
        return `text ILIKE $${queryParams.length}`;
      });
      whereCondition = `WHERE ${conditions.join(' AND ')}`;
    } else {
      const conditions = keywordList.map((_, index) => {
        queryParams.push(`%${keywordList[index]}%`);
        return `text ILIKE $${queryParams.length}`;
      });
      whereCondition = `WHERE ${conditions.join(' OR ')}`;
    }

    queryParams.push(limit.toString());
    queryParams.push(offset.toString());

    const holesQuery = `
      SELECT * FROM holes
      ${whereCondition}
      ORDER BY created_at DESC
      LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
    `;

    const countQuery = `
      SELECT COUNT(*) as total FROM holes
      ${whereCondition}
    `;

    const [holesResult, countResult] = await Promise.all([
      pool.query(holesQuery, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2))
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
      hasMore: offset + limit < total,
      searchInfo: {
        keywords: keywordList,
        searchType,
        total
      }
    });
  } catch (error) {
    console.error('关键词搜索失败:', error);
    return NextResponse.json(
      { error: '关键词搜索失败' },
      { status: 500 }
    );
  }
}