
import { sql } from "@/db";
import { addMember } from "../actions";

type Member = {
  id: number;
  name: string;
  phone: string | null;
  active_loans: number;
};

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;

  const members = await sql`
    select
      m.id,
      m.name,
      m.phone,
      count(l.id)::int as active_loans
    from members m
    left join loans l
      on l.member_id = m.id and l.returned_on is null
    group by m.id, m.name, m.phone
    order by m.name asc
  ` as unknown as Member[];

  return (
    <main className="main-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">People and accounts</div>
          <h1 className="page-title">Members</h1>
          <p className="page-description">
            Register members and keep track of library borrowers.
          </p>
        </div>
      </div>

      {params.message && (
        <div className="notice">{params.message}</div>
      )}

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            Registered members
            <span className="stat-icon">♙</span>
          </div>
          <div className="stat-number">{members.length}</div>
          <div className="stat-caption">
            People in your library
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            Active borrowers
            <span className="stat-icon">↗</span>
          </div>
          <div className="stat-number">
            {members.filter((m) => m.active_loans > 0).length}
          </div>
          <div className="stat-caption">
            Members with books on loan
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Register a member</h2>
            <p className="panel-subtitle">
              Add someone to your library membership list.
            </p>
          </div>
        </div>

        <div className="form-panel">
          <form action={addMember}>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="member-name">Full name</label>
                <input
                  className="field"
                  id="member-name"
                  name="name"
                  placeholder="Enter member's full name"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="member-phone">Phone number</label>
                <input
                  className="field"
                  id="member-phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter phone number (optional)"
                />
              </div>
            </div>

            <div className="form-actions">
              <button className="primary-button" type="submit">
                + Register member
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 25 }}>
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Member directory</h2>
            <p className="panel-subtitle">
              All registered library members.
            </p>
          </div>
          <span className="status status-available">
            {members.length} members
          </span>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Phone number</th>
                <th>Active loans</th>
                <th>Membership status</th>
              </tr>
            </thead>

            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="member-cell">
                      <div className="member-avatar">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="book-title">
                        {member.name}
                      </div>
                    </div>
                  </td>

                  <td>{member.phone || "Not provided"}</td>

                  <td>{member.active_loans}</td>

                  <td>
                    <span className="status status-available">
                      Registered
                    </span>
                  </td>
                </tr>
              ))}

              {members.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <div className="empty-icon">♙</div>
                      <strong>No members registered yet</strong>
                      <p>
                        Use the registration form above to add your first member.
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
        Library Manager · Member administration
      </p>
    </main>
  );
}
