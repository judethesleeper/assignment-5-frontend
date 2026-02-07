import { useEffect, useState, useCallback } from "react";
import "./App.css";

function App() {
  // State to store the list of users
  const [users, setUsers] = useState([]);
  
  // State to handle form input values
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstname: "",
    lastname: "",
  });

  // State to track if we are editing a user (null = creating new)
  const [editingId, setEditingId] = useState(null);

  // Get API URL from .env file
  const API_URL = import.meta.env.VITE_API_URL + "/api/user";

  // --- 1. READ (GET) ---
  // Fix: Wrapped in useCallback to prevent infinite loops in useEffect
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setUsers(data); 
    } catch (err) {
      // Fix: We use console.error so the 'err' variable is not considered "unused"
      console.error("Error fetching users:", err);
    }
  }, [API_URL]);

  // Fix: Fetch users only when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchData();
  }, [API_URL]);

  // --- Handle Input Changes ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- 2. CREATE (POST) & 3. UPDATE (PATCH) ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    try {
      if (editingId) {
        // Update Mode (PATCH)
        const response = await fetch(`${API_URL}/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstname: formData.firstname,
            lastname: formData.lastname,
          }),
        });
        if (response.ok) {
          setEditingId(null); // Exit edit mode
          alert("User updated successfully");
        }
      } else {
        // Create Mode (POST)
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          alert("User created successfully");
        } else {
          const errorData = await response.json();
          alert("Error: " + errorData.message);
        }
      }
      // Clear form and refresh list
      setFormData({
        username: "",
        email: "",
        password: "",
        firstname: "",
        lastname: "",
      });
      fetchUsers();
    } catch (err) {
      // Fix: Log the error to ensure variable is used
      console.error(err);
      alert("Operation failed");
    }
  };

  // --- 4. DELETE ---
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      // Send DELETE request
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      fetchUsers(); // Refresh list
    } catch (err) {
      // Fix: Log the error to ensure variable is used
      console.error(err);
      alert("Delete failed");
    }
  };

  // --- Helper to Fill Form for Editing ---
  const startEdit = (user) => {
    setEditingId(user._id);
    setFormData({
      username: user.username,
      email: user.email,
      password: "", // Password is typically not edited directly this way or shown
      firstname: user.firstname,
      lastname: user.lastname,
    });
  };

  return (
    <div className="container" style={{ padding: "20px" }}>
      <h1>User Management Assignment</h1>

      {/* User Form */}
      <div
        className="form-box"
        style={{
          marginBottom: "20px",
          border: "1px solid #ddd",
          padding: "15px",
          borderRadius: "8px",
        }}
      >
        <h3>{editingId ? "Edit User" : "Add New User"}</h3>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
        >
          <input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            disabled={!!editingId} // Cannot change username in edit mode
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            disabled={!!editingId} // Cannot change email in edit mode
            required
          />
          {!editingId && (
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          )}
          <input
            name="firstname"
            placeholder="First Name"
            value={formData.firstname}
            onChange={handleChange}
            required
          />
          <input
            name="lastname"
            placeholder="Last Name"
            value={formData.lastname}
            onChange={handleChange}
            required
          />

          <button type="submit" style={{ cursor: "pointer" }}>
            {editingId ? "Update User" : "Add User"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setFormData({
                  username: "",
                  email: "",
                  password: "",
                  firstname: "",
                  lastname: "",
                });
              }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* User List Table */}
      <table
        border="1"
        cellPadding="10"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead style={{ backgroundColor: "#f0f0f0" }}>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.firstname}</td>
                <td>{user.lastname}</td>
                <td>
                  <button
                    onClick={() => startEdit(user)}
                    style={{ marginRight: "5px" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    style={{ color: "red" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No users found. Add one above!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;