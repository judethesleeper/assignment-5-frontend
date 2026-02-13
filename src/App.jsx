import { useEffect, useState, useCallback, useRef } from "react";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    username: "", email: "", password: "", firstname: "", lastname: "",
  });
  const [editingId, setEditingId] = useState(null);
  const fileInputRef = useRef(null); 

  const API_URL = import.meta.env.VITE_API_URL + "/api/user";
  const BACKEND_URL = import.meta.env.VITE_API_URL; 

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setUsers(data); 
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }, [API_URL]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchUsers();
    };
    fetchData();
  }, [fetchUsers]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const response = await fetch(`${API_URL}/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstname: formData.firstname,
            lastname: formData.lastname,
          }),
        });
        if (response.ok) {
          setEditingId(null);
          alert("User updated successfully");
        }
      } else {
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
      setFormData({ username: "", email: "", password: "", firstname: "", lastname: "" });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleImageUpload = async (id) => {
    const file = fileInputRef.current?.files[0];
    if (!file) {
      alert("Please select a file.");
      return;
    }

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/${id}/image`, {
        method: "POST",
        body: uploadData,
      });

      if (response.ok) {
        alert("Image updated successfully.");
        fetchUsers(); 
      } else {
        const errData = await response.json();
        alert(`Failed to update image: ${errData.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading image.");
    }
  };

  const startEdit = (user) => {
    setEditingId(user._id);
    setFormData({
      username: user.username, email: user.email, password: "", 
      firstname: user.firstname, lastname: user.lastname,
    });
  };

  return (
    <div className="container" style={{ padding: "20px" }}>
      <h1>User Profile Management</h1>

      <div className="form-box" style={{ marginBottom: "20px", border: "1px solid #ddd", padding: "15px", borderRadius: "8px" }}>
        <h3>{editingId ? "Edit User" : "Add New User"}</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} disabled={!!editingId} required />
          <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} disabled={!!editingId} required />
          {!editingId && <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required /> }
          <input name="firstname" placeholder="First Name" value={formData.firstname} onChange={handleChange} required />
          <input name="lastname" placeholder="Last Name" value={formData.lastname} onChange={handleChange} required />
          
          <button type="submit" style={{ cursor: "pointer" }}>{editingId ? "Update User" : "Add User"}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({ username: "", email: "", password: "", firstname: "", lastname: "" }); }}>Cancel</button>}
        </form>
      </div>

      <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#f0f0f0" }}>
          <tr>
            <th>Profile Image</th>
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
                <td style={{ textAlign: "center" }}>
                  {user.profileImage ? (
                    <img src={`${BACKEND_URL}${user.profileImage}`} width="60" height="60" style={{ borderRadius: "50%", objectFit: "cover" }} alt="profile" />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td>{user._id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.firstname}</td>
                <td>{user.lastname}</td>
                <td>
                  <div style={{ marginBottom: "10px" }}>
                    <button onClick={() => startEdit(user)} style={{ marginRight: "5px" }}>Edit</button>
                    <button onClick={() => handleDelete(user._id)} style={{ color: "red" }}>Delete</button>
                  </div>
                  <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                    <input type="file" ref={fileInputRef} accept="image/*" style={{ width: "150px", fontSize: "12px" }} />
                    <button onClick={() => handleImageUpload(user._id)} style={{ fontSize: "12px", cursor: "pointer" }}>Upload Image</button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="7" style={{ textAlign: "center" }}>No users found. Add one above!</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;