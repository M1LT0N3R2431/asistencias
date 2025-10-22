import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import "./App.css";

// Lista de empleados (puede expandirse)
const empleados = [
  { id: 1, nombre: "Ana López", ubicacion: "Tapachula" },
  { id: 2, nombre: "Carlos Gómez", ubicacion: "Tuxtla Gutiérrez" },
  { id: 3, nombre: "Luis Pérez", ubicacion: "Tapachula" },
];

// Credenciales de administrador
const adminValido = { correo: "admin@empresa.com", password: "1234" };

export default function App() {
  const [vista, setVista] = useState("login"); // login | loginAdmin | user | admin
  const [ubicacion, setUbicacion] = useState("");
  const [asistencias, setAsistencias] = useState([]);
  const [admin, setAdmin] = useState({ correo: "", password: "" });
  const webcamRef = useRef(null);

  // Cargar registros previos
  useEffect(() => {
    const registrosGuardados = localStorage.getItem("asistencias");
    if (registrosGuardados) setAsistencias(JSON.parse(registrosGuardados));
  }, []);

  useEffect(() => {
    localStorage.setItem("asistencias", JSON.stringify(asistencias));
  }, [asistencias]);

  // Función para registrar entrada/salida
  const registrarAsistencia = (empleado) => {
    const hora = new Date().toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const registroExistente = asistencias.find(
      (r) => r.id === empleado.id && !r.salida
    );

    if (registroExistente) {
      // Registrar salida
      const nuevas = asistencias.map((r) =>
        r.id === empleado.id ? { ...r, salida: hora } : r
      );
      setAsistencias(nuevas);
      alert('Salida registrada para ${empleado.nombre} (${hora})');
    } else {
      // Registrar entrada
      const nueva = {
        id: empleado.id,
        nombre: empleado.nombre,
        ubicacion: empleado.ubicacion,
        entrada: hora,
        salida: "",
      };
      setAsistencias([...asistencias, nueva]);
      alert('Entrada registrada para ${empleado.nombre} (${hora})');
    }
  };

  const loginAdmin = () => {
    if (
      admin.correo === adminValido.correo &&
      admin.password === adminValido.password
    ) {
      setVista("admin");
    } else {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div className="container">
      {/* LOGIN PRINCIPAL */}
      {vista === "login" && (
        <div className="card login-card">
          <h1>Sistema de Asistencias</h1>
          <p>Selecciona tu acceso</p>
          <div className="login-buttons">
            <button onClick={() => setVista("user")}>Empleado</button>
            <button onClick={() => setVista("loginAdmin")}>Administrador</button>
          </div>
        </div>
      )}

      {/* LOGIN ADMIN */}
      {vista === "loginAdmin" && (
        <div className="card login-card">
          <h2>Administrador</h2>
          <input
            type="email"
            placeholder="Correo"
            value={admin.correo}
            onChange={(e) => setAdmin({ ...admin, correo: e.target.value })}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={admin.password}
            onChange={(e) => setAdmin({ ...admin, password: e.target.value })}
          />
          <div className="login-buttons">
            <button onClick={loginAdmin}>Ingresar</button>
            <button className="btn-outline" onClick={() => setVista("login")}>
              Volver
            </button>
          </div>
        </div>
      )}

      {/* VISTA USUARIO */}
      {vista === "user" && (
        <div className="user-view">
          <h2>Registro de Asistencias</h2>
          <p>Selecciona tu sede:</p>
          <select onChange={(e) => setUbicacion(e.target.value)} defaultValue="">
            <option value="" disabled>
              -- Selecciona --
            </option>
            <option value="Tapachula">Tapachula</option>
            <option value="Tuxtla Gutiérrez">Tuxtla Gutiérrez</option>
          </select>

          {ubicacion && (
            <>
              <div className="webcam-frame">
                <Webcam audio={false} ref={webcamRef} height={200} width={300} />
              </div>
              <div className="empleados-list">
                {empleados
                  .filter((e) => e.ubicacion === ubicacion)
                  .map((emp) => (
                    <div key={emp.id} className="empleado-card">
                      <p>
                        <b>{emp.nombre}</b>
                        <br />
                        ID: {emp.id}
                        <br />
                        Ubicación: {emp.ubicacion}
                      </p>
                      <button onClick={() => registrarAsistencia(emp)}>
                        Registrar
                      </button>
                    </div>
                  ))}
              </div>
            </>
          )}
          <button className="btn-outline" onClick={() => setVista("login")}>
            Cerrar sesión
          </button>
        </div>
      )}

      {/* PANEL ADMIN */}
      {vista === "admin" && (
        <div className="admin-panel">
          <aside className="sidebar">
            <h3>Administrador</h3>
            <ul>
              <li>📋 Asistencias</li>
              <li>👥 Empleados</li>
              <li>⚙ Configuración</li>
              <li onClick={() => setVista("login")}>🚪 Cerrar sesión</li>
            </ul>
          </aside>
          <main className="admin-content">
            <h2>Registros de Asistencia</h2>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Empleado</th>
                  <th>Ubicación</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                </tr>
              </thead>
              <tbody>
                {asistencias.length === 0 ? (
                  <tr>
                    <td colSpan="5">Sin registros</td>
                  </tr>
                ) : (
                  asistencias.map((r, i) => (
                    <tr key={i}>
                      <td>{r.id}</td>
                      <td>{r.nombre}</td>
                      <td>{r.ubicacion}</td>
                      <td>{r.entrada}</td>
                      <td>{r.salida || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </main>
        </div>
      )}
    </div>
  );
}
