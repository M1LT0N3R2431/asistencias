UserCard.jsx


import React from "react";

export default function UserCard({ user }) {
  return (
    <div className="user-card">
      <img src={user.foto} alt={user.nombre} loading="lazy" />
      <div>
        <h4>{user.nombre}</h4>
        <p>ID: {user.id}</p>
      </div>
    </div>
  );
}