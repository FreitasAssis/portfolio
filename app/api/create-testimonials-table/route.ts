import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const result = await sql`CREATE TABLE IF NOT EXISTS Testimonials (
      Name VARCHAR(50),
      Email VARCHAR(100),
      Relation VARCHAR(100),
      Comment TEXT,
      Approved BOOLEAN DEFAULT FALSE
    );`;
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
