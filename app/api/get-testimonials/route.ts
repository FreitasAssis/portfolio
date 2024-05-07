import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const comments =
      await sql`SELECT Name, Relation, Comment FROM Testimonials WHERE Approved = true;`;
    return NextResponse.json({ ...comments }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
