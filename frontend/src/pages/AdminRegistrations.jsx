import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

const AdminRegistrations = () => {
  const { id } = useParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const res = await API.get(`/events/${id}/registrations`);
        setUsers(res.data);
      } catch (error) {
        console.error("Failed to fetch registrations");
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [id]);

  if (loading) return <p>Loading registrations...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Registered Users</h2>

      {users.length === 0 ? (
        <p>No users registered yet.</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user._id}>
              {user.name} ({user.email})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminRegistrations;
