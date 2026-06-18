import { NextRequest, NextResponse } from 'next/server';
import { loadContent, saveContent } from '@/lib/db';

function deepMerge(target: any, source: any): any {
  if (typeof source !== 'object' || source === null) return source;
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      result[key] = deepMerge(target?.[key] ?? {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

/**
 * GET /api/content
 * Retrieve all CMS content
 */
export async function GET() {
  try {
    const content = await loadContent();
    return NextResponse.json(content);
  } catch (error) {
    console.error('GET /api/content failed:', error);
    return NextResponse.json(
      { error: 'Failed to load content' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/content
 * Update CMS content (entire store or merge)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Load current content and merge
    const current = await loadContent();
    const updated = { ...current, ...body };
    
    // Save to database
    await saveContent(updated);
    
    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('POST /api/content failed:', error);
    return NextResponse.json(
      { error: 'Failed to save content' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/content
 * Partial update: deep-merges { c: Partial<CMSContent> } or { media: [...] }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const current = await loadContent();
    const updated = deepMerge(current, body);
    await saveContent(updated);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PATCH /api/content failed:', error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}
