import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (apiKey === process.env.API_KEY) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}