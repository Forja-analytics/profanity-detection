import { NextRequest, NextResponse } from 'next/server';
import { deleteWhitelistWord, updateWhitelistWord } from "@/lib/database";

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
    const phrase =
      typeof body?.phrase === "string"
        ? body.phrase.trim().toLowerCase()
        : undefined;

    const updated = await updateWhitelistWord(idNum, { phrase });

    if (!updated) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    const msg = String(error?.message || "");
    if (msg.toLowerCase().includes("already exists")) {
      return NextResponse.json({ error: msg }, { status: 409 });
    }
    console.error("Error updating whitelist word:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}