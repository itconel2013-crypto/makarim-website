import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized } from '@/lib/auth';
import { loadBookings, archiveBooking, deleteBooking, deleteAllSynced } from '@/lib/db';

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
    // Delete all CRM-synced entries permanently
    const count = deleteAllSynced();
    return NextResponse.json({ success: true, deleted: count });
  }
  if (id) {
    const numId = Number(id);
    // If synced → delete from DB; if not synced → only archive (hide)
    const deleted = deleteBooking(numId);
    if (!deleted) archiveBooking(numId);
    return NextResponse.json({ success: true, id, deleted });
  }
  return NextResponse.json({ error: 'id oder all erforderlich' }, { status: 400 });
}
