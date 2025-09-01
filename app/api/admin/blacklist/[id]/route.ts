import { NextRequest, NextResponse } from 'next/server';
import { deleteBlacklistWord } from '@/lib/database';
import { updateBlacklistWord } from "@/lib/database";

export const dynamic = "force-dynamic";

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

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const idNum = Number(params.id);
    if (!Number.isInteger(idNum)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const phrase = body?.phrase ? String(body.phrase).trim().toLowerCase() : undefined;
    const severity = body?.severity ? Number(body.severity) : undefined;

    const updated = await updateBlacklistWord(idNum, { phrase, severity });

    if (!updated) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating blacklist word:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}