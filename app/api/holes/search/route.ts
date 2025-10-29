import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ensureSearchInfrastructure } from '@/lib/searchSetup';
import { RECENT_HOLE_LIMIT } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    try {
      await ensureSearchInfrastructure();
    } catch (setupError) {
      console.warn('关键词搜索索引初始化失败:', setupError);
    }

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

    const keywordParams: Array<string | number> = [];
    const conditions = keywordList.map((keyword) => {
      keywordParams.push(`%${keyword}%`);
      return `text ILIKE $${keywordParams.length}`;
    });

    const conjunction = searchType === 'and' ? ' AND ' : ' OR ';
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(conjunction)}` : '';

    const limitPosition = keywordParams.length + 1;
    const offsetPosition = keywordParams.length + 2;
    const holesParams: Array<string | number> = [...keywordParams, limit, offset];

    const holesQuery = `
      WITH recent_holes AS (
        SELECT *
        FROM holes
        ORDER BY created_at DESC
        LIMIT ${RECENT_HOLE_LIMIT}
      )
      SELECT *
      FROM recent_holes
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${limitPosition} OFFSET $${offsetPosition}
    `;

    const countQuery = `
      WITH recent_holes AS (
        SELECT *
        FROM holes
        ORDER BY created_at DESC
        LIMIT ${RECENT_HOLE_LIMIT}
      )
      SELECT COUNT(*) as total
      FROM recent_holes
      ${whereClause}
    `;

    const [holesResult, countResult] = await Promise.all([
      pool.query(holesQuery, holesParams),
      pool.query(countQuery, keywordParams)
    ]);

    const holes = holesResult.rows;
    const total = parseInt(countResult.rows[0].total);

    return NextResponse.json({
      holes,
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
