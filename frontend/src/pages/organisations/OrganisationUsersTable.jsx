import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const mockUsers = [
  {
    _id: "1",
    name: "Admin User",
    email: "admin@test.com",
    role: "ADMIN",
    status: "Active",
    createdAt: "2026-04-01",
  },
];

function roleBadge(roleValue) {
  const normalized = String(roleValue || "").toLowerCase();
  if (normalized === "admin") {
    return <span className="inline-block rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">Admin</span>;
  }
  if (normalized === "system_admin") {
    return (
      <span className="inline-block rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900">
        System Admin
      </span>
    );
  }
  if (normalized === "employee") {
    return (
      <span className="inline-block rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
        Employee
      </span>
    );
  }
  return (
    <span className="inline-block rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
      {String(roleValue || "User")}
    </span>
  );
}

function OrganisationUsersTable() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await axiosInstance.get("/users?role=EMPLOYEE");
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to load users:", error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, []);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">Name</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">Email</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">Role</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">Status</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">Created</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                Loading users...
              </td>
            </tr>
          ) : (
            (users.length ? users : mockUsers).map((user) => (
              <tr key={user._id || user.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80">
                <td className="px-4 py-4 font-medium text-slate-900">{user.name || "—"}</td>
                <td className="px-4 py-4 text-slate-600">{user.email || "—"}</td>
                <td className="px-4 py-4">{user.designation || roleBadge(user.role)}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    {user.status || "Active"}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-500">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => console.log("Edit", user._id)}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setUsers((prev) => prev.filter((u) => u._id !== user._id))}
                      className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default OrganisationUsersTable;
