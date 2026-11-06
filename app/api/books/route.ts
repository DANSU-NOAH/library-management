import { NextResponse } from "next/server";
import { sql } from "@/db";

export async function GET() {
  const books = await sql`
    select b.id, b.title, b.year, a.name as author,
      case when l.id is null then 'Available' else 'On loan' end as status,
      m.name as loaned_to,
      l.due_on
    from books b
    join authors a on a.id = b.author_id
    left join loans l on l.book_id = b.id and l.returned_on is null
    left join members m on m.id = l.member_id
    order by b.title asc`;
  return NextResponse.json(books);
}
