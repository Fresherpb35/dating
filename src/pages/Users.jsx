import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false); // <-- form visibility

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    age: "",
    city: "",
    country: "",
    number: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error("Error fetching users:", error);
    else setUsers(data);
    setLoading(false);
  }

  async function handleAddUser(e) {
  e.preventDefault();

  if (!newUser.username || !newUser.email) {
    alert("Please fill in Username and Email!");
    return;
  }

  setAdding(true);

  const insertData = {
    username: newUser.username.trim(),
    email: newUser.email.trim(),
    age: newUser.age ? parseInt(newUser.age) : null,
    city: newUser.city.trim() || null,
    country: newUser.country.trim() || null,
    number: newUser.number.trim() || null,
  };

  const { data, error } = await supabase.from("users").insert([insertData]).select();

  setAdding(false);

  if (error) {
    console.error("Error adding user:", error);
    alert("Failed to add user: " + error.message);
  } else {
    alert("✅ User added successfully!");
    setUsers([data[0], ...users]);
    setNewUser({ username: "", email: "", age: "", city: "", country: "", number: "" });
  }
}


  async function handleDelete(id) {
    const confirmDelete = confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    setDeleting(true);
    const { error } = await supabase.from("users").delete().eq("id", id);
    setDeleting(false);

    if (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user!");
    } else {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      alert("User deleted successfully!");
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen w-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-pink-500"></div>
      </div>
    );

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="w-full px-3 py-4 sm:px-4 sm:py-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
          👥 All Registered Users
        </h1>
        {/* Add User toggle button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition"
        >
          {showForm ? "✖ Close Form" : "➕ Add User"}
        </button>
      </div>

      {/* Add User Form */}
      {showForm && (
  <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6 mb-6">
    <h2 className="text-lg font-bold mb-4 text-gray-800">➕ Add New User</h2>
    <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {["username", "email", "age", "city", "country", "number"].map((field) => (
        <div key={field} className="flex flex-col">
          <label className="mb-1 text-gray-700 font-medium capitalize">
            {field === "number" ? "Phone" : field} {field === "username" || field === "email" ? "*" : ""}
          </label>
          <input
            type={field === "email" ? "email" : field === "age" ? "number" : "text"}
            placeholder={`Enter ${field === "number" ? "phone number" : field}`}
            value={newUser[field]}
            onChange={(e) => setNewUser({ ...newUser, [field]: e.target.value })}
            className="border p-2 rounded-md focus:ring-2 focus:ring-pink-400 text-gray-800 placeholder-gray-400"
          />
        </div>
      ))}

      <div className="col-span-full flex justify-end mt-2">
        <button
          type="submit"
          disabled={adding}
          className="bg-pink-600 text-white py-2 px-6 rounded-md hover:bg-pink-700 transition"
        >
          {adding ? "Adding..." : "➕ Add User"}
        </button>
      </div>
    </form>
  </div>
)}


      {/* User Table */}
      <div className="flex-1 w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-pink-600 text-white text-left text-xs sm:text-sm">
                <th className="p-2 sm:p-3">#</th>
                <th className="p-2 sm:p-3">Username</th>
                <th className="p-2 sm:p-3">Email</th>
                <th className="p-2 sm:p-3">Age</th>
                <th className="p-2 sm:p-3">City</th>
                <th className="p-2 sm:p-3">Country</th>
                <th className="p-2 sm:p-3">Phone</th>
                <th className="p-2 sm:p-3">Verified</th>
                <th className="p-2 sm:p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs sm:text-sm">
              {users.length > 0 ? (
                users.map((user, i) => (
                  <tr key={user.id} className="border-b hover:bg-gray-100 transition">
                    <td className="p-2 sm:p-3">{i + 1}</td>
                    <td className="p-2 sm:p-3 font-medium text-gray-800">{user.username || "N/A"}</td>
                    <td className="p-2 sm:p-3 text-gray-700 truncate max-w-[150px]">{user.email || "N/A"}</td>
                    <td className="p-2 sm:p-3 text-gray-700">{user.age ?? "N/A"}</td>
                    <td className="p-2 sm:p-3 text-gray-700">{user.city || "N/A"}</td>
                    <td className="p-2 sm:p-3 text-gray-700">{user.country || "N/A"}</td>
                    <td className="p-2 sm:p-3 text-gray-700">{user.number || "N/A"}</td>
                    <td className="p-2 sm:p-3 text-center">
                      {user.verification_status === "verified" ? (
                        <span className="text-green-600 font-semibold">✅</span>
                      ) : (
                        <span className="text-red-500 font-semibold">❌</span>
                      )}
                    </td>
                    <td className="p-2 sm:p-3 text-center">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs sm:text-sm"
                        disabled={deleting}
                      >
                        {deleting ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center p-3 sm:p-4 text-gray-500 italic">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
