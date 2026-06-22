import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized } from '@/lib/auth';
import { loadBookings, archiveBooking, archiveAllSynced } from '@/lib/db';

export async function GET(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(loadBookings());
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id, all } = await request.json();
  if (all) {
    archiveAllSynced();
    return NextResponse.json({ success: true, action: 'archiveAllSynced' });
  }
  if (id) {
    archiveBooking(Number(id));
    return NextResponse.json({ success: true, action: 'archiveOne', id });
  }
  return NextResponse.json({ error: 'id oder all erforderlich' }, { status: 400 });
}
