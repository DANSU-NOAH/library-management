-- Library Manager database schema
create table if not exists authors (
  id serial primary key,
  name text not null unique
);

create table if not exists books (
  id serial primary key,
  title text not null,
  year integer not null check (year between 1 and 9999),
  author_id integer not null references authors(id) on delete restrict
);

create table if not exists members (
  id serial primary key,
  name text not null,
  phone text
);

create table if not exists loans (
  id serial primary key,
  book_id integer not null references books(id) on delete cascade,
  member_id integer not null references members(id) on delete restrict,
  borrowed_on date not null default current_date,
  due_on date not null,
  returned_on date
);

-- A book may have many historical loans, but only one active loan.
create unique index if not exists one_active_loan_per_book
  on loans(book_id) where returned_on is null;

create index if not exists loans_member_id_idx on loans(member_id);
create index if not exists loans_book_id_idx on loans(book_id);
