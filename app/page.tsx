
import { sql } from "@/db";
import {
  addBook,
  updateBook,
  deleteBook,
  lendBook,
  returnBook,
} from "./actions";

type Book = {
  id: number;
  title: string;
  year: number;
  author: string;
  status: string;
  loaned_to: string | null;
  due_on: string | Date | null;
  loan_id: number | null;
};

type Member = {
  id: number;
  name: string;
};

function dateLabel(date: string | Date | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB");
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; q?: string }>;
}) {
  const params = await searchParams;
  const search = (params.q ?? "").trim();

  const books = await sql`
    select
      b.id,
      b.title,
      b.year,
      a.name as author,
      case
        when l.id is null then 'Available'
        else 'On loan'
      end as status,
      m.name as loaned_to,
      l.due_on,
      l.id as loan_id
    from books b
    join authors a on a.id = b.author_id
    left join loans l
      on l.book_id = b.id and l.returned_on is null
    left join members m on m.id = l.member_id
    where
      ${search} = ''
      or b.title ilike ${"%" + search + "%"}
      or a.name ilike ${"%" + search + "%"}
    order by b.title asc
  ` as unknown as Book[];

  const members = await sql`
    select id, name from members order by name asc
  ` as unknown as Member[];

  const totals = await sql`
    select
      count(*)::int as total,
      count(*) filter (
        where not exists (
          select 1 from loans l
          where l.book_id = books.id and l.returned_on is null
        )
      )::int as available
    from books
  `;

  const loanCount = await sql`
    select count(*)::int as total
    from loans
    where returned_on is null
  `;

  const memberCount = await sql`
    select count(*)::int as total from members
  `;

  const totalBooks = Number(totals[0]?.total ?? 0);
  const availableBooks = Number(totals[0]?.available ?? 0);
  const activeLoans = Number(loanCount[0]?.total ?? 0);
  const totalMembers = Number(memberCount[0]?.total ?? 0);

  return (
    <main className="main-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">Library overview</div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">
            Welcome back. Here is what's happening in your library.
          </p>
        </div>

        <a href="#add-book" className="primary-button">
          + Add a book
        </a>
      </div>

      {params.message && (
        <div className="notice">{params.message}</div>
      )}

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            Total books
            <span className="stat-icon">▤</span>
          </div>
          <div className="stat-number">{totalBooks}</div>
          <div className="stat-caption">Books in your collection</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            Available books
            <span className="stat-icon">✓</span>
          </div>
          <div className="stat-number">{availableBooks}</div>
          <div className="stat-caption">Ready to be borrowed</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            Books on loan
            <span className="stat-icon">↗</span>
          </div>
          <div className="stat-number">{activeLoans}</div>
          <div className="stat-caption">Currently borrowed</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            Members
            <span className="stat-icon">♙</span>
          </div>
          <div className="stat-number">{totalMembers}</div>
          <div className="stat-caption">Registered library members</div>
        </div>
      </section>

      <section className="panel" id="add-book">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Book collection</h2>
            <p className="panel-subtitle">
              Manage your books, authors and borrowing activity.
            </p>
          </div>

          <details>
            <summary className="primary-button">
              + Add book
            </summary>
            <div className="form-panel">
              <form action={addBook}>
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="new-title">Book title</label>
                    <input
                      className="field"
                      id="new-title"
                      name="title"
                      placeholder="Enter book title"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="new-author">Author</label>
                    <input
                      className="field"
                      id="new-author"
                      name="author"
                      placeholder="Enter author name"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="new-year">Publication year</label>
                    <input
                      className="field"
                      id="new-year"
                      name="year"
                      type="number"
                      min="1"
                      max={new Date().getFullYear() + 1}
                      placeholder="e.g. 1987"
                      required
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button className="primary-button" type="submit">
                    Save book
                  </button>
                </div>
              </form>
            </div>
          </details>
        </div>

        <div className="form-panel">
          <form action="/" method="GET" className="search-form">
            <input
              className="search-input"
              name="q"
              defaultValue={search}
              placeholder="Search by book title or author..."
            />
            <button className="primary-button" type="submit">
              Search
            </button>
            {search && (
              <a href="/" className="secondary-button">
                Clear
              </a>
            )}
          </form>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Book details</th>
                <th>Year</th>
                <th>Status</th>
                <th>Borrowed by / Due</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td>
                    <div className="book-title">{book.title}</div>
                    <div className="book-author">
                      {book.author}
                    </div>
                  </td>

                  <td>{book.year}</td>

                  <td>
                    <span
                      className={
                        book.status === "Available"
                          ? "status status-available"
                          : "status status-loan"
                      }
                    >
                      {book.status}
                    </span>
                  </td>

                  <td>
                    {book.loaned_to ? (
                      <>
                        <div className="book-title">
                          {book.loaned_to}
                        </div>
                        <div className="muted">
                          Due: {dateLabel(book.due_on)}
                        </div>
                      </>
                    ) : (
                      <span className="muted">Not borrowed</span>
                    )}
                  </td>

                  <td>
                    <div className="table-actions">
                      <details>
                        <summary className="small-button">
                          Edit
                        </summary>
                        <div className="form-panel">
                          <form action={updateBook}>
                            <input
                              type="hidden"
                              name="id"
                              value={book.id}
                            />
                            <div className="form-grid">
                              <div className="form-field">
                                <label>Title</label>
                                <input
                                  className="field"
                                  name="title"
                                  defaultValue={book.title}
                                  required
                                />
                              </div>
                              <div className="form-field">
                                <label>Author</label>
                                <input
                                  className="field"
                                  name="author"
                                  defaultValue={book.author}
                                  required
                                />
                              </div>
                              <div className="form-field">
                                <label>Year</label>
                                <input
                                  className="field"
                                  name="year"
                                  type="number"
                                  defaultValue={book.year}
                                  required
                                />
                              </div>
                            </div>
                            <div className="form-actions">
                              <button
                                className="primary-button"
                                type="submit"
                              >
                                Save changes
                              </button>
                            </div>
                          </form>
                        </div>
                      </details>

                      {book.status === "Available" && members.length > 0 && (
                        <details>
                          <summary className="small-button">
                            Lend
                          </summary>
                          <div className="form-panel">
                            <form action={lendBook}>
                              <input
                                type="hidden"
                                name="book_id"
                                value={book.id}
                              />
                              <div className="form-field">
                                <label>Select member</label>
                                <select
                                  className="field"
                                  name="member_id"
                                  required
                                  defaultValue=""
                                >
                                  <option value="" disabled>
                                    Choose a member
                                  </option>
                                  {members.map((member) => (
                                    <option
                                      key={member.id}
                                      value={member.id}
                                    >
                                      {member.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <p className="muted">
                                This book will be due in 14 days.
                              </p>
                              <button
                                className="primary-button"
                                type="submit"
                              >
                                Confirm loan
                              </button>
                            </form>
                          </div>
                        </details>
                      )}

                      {book.status === "On loan" && book.loan_id && (
                        <form action={returnBook}>
                          <input
                            type="hidden"
                            name="loan_id"
                            value={book.loan_id}
                          />
                          <button
                            className="small-button"
                            type="submit"
                          >
                            Return
                          </button>
                        </form>
                      )}

                      <form action={deleteBook}>
                        <input
                          type="hidden"
                          name="id"
                          value={book.id}
                        />
                        <button
                          className="danger-button"
                          type="submit"
                          disabled={book.status === "On loan"}
                          title={
                            book.status === "On loan"
                              ? "Return the book before deleting it"
                              : "Delete book"
                          }
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}

              {books.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <div className="empty-icon">▤</div>
                      <strong>No books found</strong>
                      <p>
                        {search
                          ? "Try a different search."
                          : "Add your first book to get started."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="footer-note">
        Library Manager · Book collection and lending administration
      </p>
    </main>
  );
}
