import { NextRequest, NextResponse } from 'next/server';
import { deleteWhitelistWord } from '@/lib/database';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    await deleteWhitelistWord(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting whitelist word:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}