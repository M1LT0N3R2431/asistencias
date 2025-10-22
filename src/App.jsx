import { useState } from "react";
import "./App.css";

function App() {
  const [vista, setVista] = useState("login"); // login | user | admin
  const [ubicacion, setUbicacion] = useState(""); // Tapachula o Tuxtla
  const [admin, setAdmin] = useState({ correo: "", password: "" });
  const [asistencias, setAsistencias] = useState([]);

  // Lista simulada de empleados
  const empleados = [
    { id: 1, nombre: "Ana López", ubicacion: "Tapachula" },
    { id: 2, nombre: "Carlos Gómez", ubicacion: "Tuxtla Gutiérrez" },
  ];

  // Datos del administrador
  const adminValido = { correo: "admin@empresa.com", password: "1234" };

  // Simula el reconocimiento facial
  const escanearRostro = (id) => {
    const empleado = empleados.find((e) => e.id === id);
    if (!empleado) return;

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
      alert(`Salida registrada para ${empleado.nombre} (${hora})`);
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
      alert(`Entrada registrada para ${empleado.nombre} (${hora})`);
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
    <div className="app">
      {vista === "login" && (
        <div className="login">
          <h1>Bienvenido al Sistema de Asistencias</h1>
          <p>Selecciona tu tipo de acceso:</p>
          <button onClick={() => setVista("user")}>Sede (Usuario)</button>
          <button onClick={() => setVista("loginAdmin")}>Administrador</button>
        </div>
      )}

      {vista === "loginAdmin" && (
        <div className="login-admin">
          <h2>Acceso Administrador</h2>
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
          <button onClick={loginAdmin}>Ingresar</button>
          <button onClick={() => setVista("login")}>Volver</button>
        </div>
      )}

      {vista === "user" && (
        <div className="usuario">
          <h2>Registro de Asistencias</h2>
          <p>Selecciona tu sede:</p>
          <select
            onChange={(e) => setUbicacion(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              -- Selecciona --
            </option>
            <option value="Tapachula">Tapachula</option>
            <option value="Tuxtla Gutiérrez">Tuxtla Gutiérrez</option>
          </select>

          {ubicacion && (
            <div className="lista-empleados">
              <h3>Empleados en {ubicacion}</h3>
              {empleados
                .filter((e) => e.ubicacion === ubicacion)
                .map((emp) => (
                  <div key={emp.id} className="empleado-card">
                    <p>
                      <b>{emp.nombre}</b> <br />
                      ID: {emp.id} <br />
                      Ubicación: {emp.ubicacion}
                    </p>
                    <button onClick={() => escanearRostro(emp.id)}>
                      Escanear rostro
                    </button>
                  </div>
                ))}
            </div>
          )}
          <button onClick={() => setVista("login")}>Cerrar sesión</button>
        </div>
      )}

      {vista === "admin" && (
        <div className="admin">
          <h2>Panel de Administrador</h2>
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
          <button onClick={() => setVista("login")}>Cerrar sesión</button>
        </div>
      )}
    </div>
  );
}

export default App;
