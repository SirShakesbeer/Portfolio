import { NextRequest, NextResponse } from 'next/server';
import { getProjects } from '@/lib/db';

export async function GET(_req: NextRequest) {
  try {
    const projects = getProjects();
    return NextResponse.json(projects);
  } catch (err) {
    console.error('[GET /api/projects]', err);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
