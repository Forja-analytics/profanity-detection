import { NextRequest, NextResponse } from 'next/server';
import { getBlacklist, addBlacklistWord } from '@/lib/database';

export const dynamic = 'force-dynamic'; // 👈 ESTA ES LA ÚNICA LÍNEA NUEVA

export async function GET() {
  try {
    const blacklist = await getBlacklist();
    return NextResponse.json(blacklist);
  } catch (error) {
    console.error('Error fetching blacklist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phrase, severity } = await request.json();

    if (!phrase || typeof phrase !== 'string') {
      return NextResponse.json(
        { error: 'Phrase is required' },
        { status: 400 }
      );
    }

    if (!severity || typeof severity !== 'number' || severity < 1 || severity > 3) {
      return NextResponse.json(
        { error: 'Severity must be between 1 and 3' },
        { status: 400 }
      );
    }

    const word = await addBlacklistWord(phrase.toLowerCase(), severity);
    return NextResponse.json(word);
  } catch (error) {
    console.error('Error adding blacklist word:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
