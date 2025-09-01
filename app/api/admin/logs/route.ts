import { NextResponse } from 'next/server';
import { getEvaluationLogs } from '@/lib/database';

export async function GET() {
  try {
    const logs = await getEvaluationLogs();
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}