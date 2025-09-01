import { NextRequest, NextResponse } from 'next/server';
import { getWhitelist, addWhitelistWord } from '@/lib/database';

export async function GET() {
  try {
    const whitelist = await getWhitelist();
    return NextResponse.json(whitelist);
  } catch (error) {
    console.error('Error fetching whitelist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phrase } = await request.json();

    if (!phrase || typeof phrase !== 'string') {
      return NextResponse.json(
        { error: 'Phrase is required' },
        { status: 400 }
      );
    }

    const word = await addWhitelistWord(phrase.toLowerCase());
    return NextResponse.json(word);
  } catch (error) {
    console.error('Error adding whitelist word:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}