import { NextResponse } from 'next/server';
import { getPatientsWithRelations } from '../../actions';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getPatientsWithRelations();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err.message || String(err), 
      data: [] 
    }, { status: 500 });
  }
}
