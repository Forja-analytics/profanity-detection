import { NextRequest, NextResponse } from 'next/server';
import { deleteBlacklistWord } from '@/lib/database';

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

    await deleteBlacklistWord(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blacklist word:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}