import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const requestBody = await request.json();
  const { name, email, relation, comment } = requestBody;

  try {
    if (!name || !email || !relation || !comment)
      throw new Error("All the fields are required");

    const commentExists =
      await sql`SELECT Comment FROM Testimonials WHERE Email = ${email};`;

    if (commentExists.rowCount === 0) {
      await sql`INSERT INTO Testimonials (Name, Email, Relation, Comment) VALUES (${name}, ${email}, ${relation}, ${comment})`;
    } else {
      await sql`UPDATE Testimonials SET Comment = ${comment} WHERE Email = ${email}`;
    }

    const comments =
      await sql`SELECT Name, Relation, Comment, Approved FROM Testimonials WHERE Approved = true;`;

    return NextResponse.json({ comments }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
