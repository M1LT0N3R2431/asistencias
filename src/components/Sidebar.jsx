import React from "react";

export default function Sidebar({ onChangeView }) {
  return (
    <div className="sidebar">
      <h2>Panel de Control</h2>
      <ul>
        <li onClick={onChangeView}>Inicio</li>
        <li>Usuarios</li>
        <li>Asistencias</li>
        <li>Configuración</li>
      </ul>
    </div>
  );
}