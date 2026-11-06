-- Run once after schema.sql. Starter rows are inserted only when the tables are empty.
insert into authors(name)
select name from (values
  ('Chinua Achebe'), ('Chimamanda Ngozi Adichie'), ('Wole Soyinka'),
  ('Buchi Emecheta'), ('Ben Okri')
) as v(name)
where not exists (select 1 from authors);

insert into members(name, phone)
select name, phone from (values
  ('Bola Ade', '08030000001'), ('Tunde Bello', '08030000002'),
  ('Ada Okafor', '08030000003'), ('Kemi James', null), ('Emeka Nwosu', '08030000005')
) as v(name, phone)
where not exists (select 1 from members);

insert into books(title, year, author_id)
select v.title, v.year, a.id
from (values
  ('Things Fall Apart', 1958, 'Chinua Achebe'),
  ('No Longer at Ease', 1960, 'Chinua Achebe'),
  ('Arrow of God', 1964, 'Chinua Achebe'),
  ('Half of a Yellow Sun', 2006, 'Chimamanda Ngozi Adichie'),
  ('Purple Hibiscus', 2003, 'Chimamanda Ngozi Adichie'),
  ('The Man Died', 1972, 'Wole Soyinka'),
  ('The Joys of Motherhood', 1979, 'Buchi Emecheta'),
  ('The Bride Price', 1976, 'Buchi Emecheta'),
  ('The Famished Road', 1991, 'Ben Okri'),
  ('Stars of the New Curfew', 1988, 'Ben Okri')
) as v(title, year, author_name)
join authors a on a.name = v.author_name
where not exists (select 1 from books);

-- Two books are initially on loan, if there are no loan records yet.
insert into loans(book_id, member_id, borrowed_on, due_on)
select b.id, m.id, current_date - 3, current_date + 11
from books b
cross join members m
where b.title = 'Things Fall Apart' and m.name = 'Bola Ade'
  and not exists (select 1 from loans);

insert into loans(book_id, member_id, borrowed_on, due_on)
select b.id, m.id, current_date - 1, current_date + 13
from books b
cross join members m
where b.title = 'Half of a Yellow Sun' and m.name = 'Tunde Bello'
  and (select count(*) from loans) = 1;
