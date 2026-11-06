"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/db";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}
function message(text: string): never {
  redirect("/?message=" + encodeURIComponent(text));
}

export async function addBook(formData: FormData) {
  const title = value(formData, "title");
  const author = value(formData, "author");
  const yearText = value(formData, "year");
  const year = Number(yearText);
  if (!title) message("Please enter a book title.");
  if (!author) message("Please enter an author.");
  if (!/^\d{1,4}$/.test(yearText) || !Number.isInteger(year) || year < 1 || year > new Date().getFullYear() + 1) {
    message("Enter a valid year (for example, 1987).");
  }
  const rows = await sql`insert into authors(name) values (${author})
    on conflict (name) do update set name = excluded.name returning id`;
  await sql`insert into books(title, year, author_id) values (${title}, ${year}, ${rows[0].id})`;
  revalidatePath("/");
  revalidatePath("/members");
  message("Book added successfully.");
}

export async function updateBook(formData: FormData) {
  const id = Number(value(formData, "id"));
  const title = value(formData, "title");
  const author = value(formData, "author");
  const yearText = value(formData, "year");
  const year = Number(yearText);
  if (!Number.isInteger(id) || id < 1) message("Invalid book.");
  if (!title) message("Please enter a book title.");
  if (!author) message("Please enter an author.");
  if (!/^\d{1,4}$/.test(yearText) || !Number.isInteger(year) || year < 1 || year > new Date().getFullYear() + 1) {
    message("Enter a valid year.");
  }
  const rows = await sql`insert into authors(name) values (${author})
    on conflict (name) do update set name = excluded.name returning id`;
  await sql`update books set title = ${title}, year = ${year}, author_id = ${rows[0].id} where id = ${id}`;
  revalidatePath("/");
  message("Book updated.");
}

export async function deleteBook(formData: FormData) {
  const id = Number(value(formData, "id"));
  if (!Number.isInteger(id) || id < 1) message("Invalid book.");
  const active = await sql`select id from loans where book_id = ${id} and returned_on is null limit 1`;
  if (active.length) message("This book is on loan. Record its return before deleting it.");
  await sql`delete from books where id = ${id}`;
  revalidatePath("/");
  message("Book deleted.");
}

export async function addMember(formData: FormData) {
  const name = value(formData, "name");
  const phone = value(formData, "phone");
  if (!name) redirect("/members?message=" + encodeURIComponent("Please enter the member's name."));
  await sql`insert into members(name, phone) values (${name}, ${phone || null})`;
  revalidatePath("/members");
  redirect("/members?message=" + encodeURIComponent("Member added successfully."));
}

export async function lendBook(formData: FormData) {
  const bookId = Number(value(formData, "book_id"));
  const memberId = Number(value(formData, "member_id"));
  if (!Number.isInteger(bookId) || !Number.isInteger(memberId)) message("Choose a valid book and member.");
  const existing = await sql`select id from loans where book_id = ${bookId} and returned_on is null`;
  if (existing.length) message("That book is already on loan.");
  const inserted = await sql`
    insert into loans(book_id, member_id, borrowed_on, due_on)
    values (${bookId}, ${memberId}, current_date, current_date + 14)
    on conflict do nothing returning id`;
  if (!inserted.length) message("That book has just been lent to someone else. Refresh and try again.");
  revalidatePath("/");
  message("Loan recorded. It is due in 14 days.");
}

export async function returnBook(formData: FormData) {
  const loanId = Number(value(formData, "loan_id"));
  if (!Number.isInteger(loanId)) message("Invalid loan.");
  await sql`update loans set returned_on = current_date where id = ${loanId} and returned_on is null`;
  revalidatePath("/");
  message("Book return recorded. The book is now available.");
}
