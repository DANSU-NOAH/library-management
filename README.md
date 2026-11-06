# Library Manager

A responsive Next.js lending-library app built to match the supplied Sunday 1 November student guide.

## What's included

- Books page (`/`): list books, author, publication year and live availability.
- Add, edit and delete books, with validation and protection against deleting a book on loan.
- Members page (`/members`): add members; phone number is optional.
- Lend an available book to a member for 14 days and record returns.
- JSON endpoint (`/api/books`).
- PostgreSQL schema and starter seed data in `db/`.

## Before you start

You need access to your group's Supabase project and its **Session pooler** connection string. Ask your captain for the connection string. Do not put it in source code or commit it to Git.

## 1. Put the folder in your group repository

Copy this `library` folder into the root of your group repository. The expected structure is:

```text
group-repo/
  library/
    app/
    db/
    package.json
    ...
```

## 2. Create the database tables and starter rows

In your group's Supabase project, open **SQL Editor**.

1. Copy all of `db/schema.sql` into a new SQL query and run it.
2. Copy all of `db/seed.sql` into a new SQL query and run it once.
3. Open **Table Editor** and confirm the four tables (`authors`, `books`, `members`, `loans`) contain starter rows.

Do not run the seed file repeatedly; it is intended as one-time starter data.

## 3. Run locally (optional)

From the `library` folder:

```bash
npm install
```

Create a file named `.env.local` inside `library`:

```env
DATABASE_URL=PASTE_YOUR_GROUP_SESSION_POOLER_CONNECTION_STRING_HERE
```

Then run:

```bash
npm run dev
```

Open http://localhost:3000.

`.env.local` is ignored by Git. Never commit it or paste the connection string into a source file.

## 4. Test the acceptance criteria

1. Books display author and either `Available` or `On loan` with member and due date.
2. Try adding a book with an empty title or author and an invalid year; it should be rejected.
3. Add **Anthills of the Savannah**, **Chinua Achebe**, **1987**. Chinua Achebe should remain one author record.
4. Lend it to a member. The due date should be 14 days from the lending date.
5. Try deleting it while it is on loan; the app must refuse.
6. Record its return, edit the year to 1988, then delete it.
7. Try adding a member with no name; it should be rejected. Add **Bola Ade**.
8. Open the app on a phone and confirm the same database-backed data appears.
9. Open `/api/books` and confirm JSON is returned.

## 5. Deploy to Vercel

From the `library` folder:

```bash
npx vercel link
npx vercel env add DATABASE_URL production
npx vercel --prod
```

When prompted for the environment variable value, paste your group's Supabase Session pooler connection string. Vercel does not automatically read your local `.env.local`.

Post the deployed URL in your group chat and test it on a phone. The API should be at `https://YOUR-DEPLOYED-DOMAIN/api/books`.

## Git safety and pull request workflow

Before every commit:

```bash
git status
```

Check that `.env.local` is not listed. Commit and push only the code and SQL files. Follow your captain's branch and pull-request process.

## Troubleshooting

- `DATABASE_URL is missing`: create `library/.env.local` and check the variable name.
- `password authentication failed`: ask your captain to confirm the connection string.
- `relation "books" does not exist`: run `db/schema.sql` in the correct Supabase project.
- `Cannot find module 'postgres'`: run `npm install` inside `library`.
- Live site works locally but not on Vercel: add `DATABASE_URL` to Vercel production and redeploy.

## Security notes

All database values are passed as SQL parameters using the `postgres` tagged-template API. The connection string is read from an environment variable. This student demo intentionally has no login, as specified in the supplied guide; do not use it for private or sensitive library data without adding authentication and access controls.
