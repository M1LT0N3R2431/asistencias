import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

const MODEL_URL = "/models";

export default function AdminDashboard({ onBack, onReload }) {
  const webcamRef = useRef(null);
  const [nombre, setNombre] = useState("");
  const [id, setId] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadModels() {
      try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      } catch (err) {
        console.error("Error cargando modelos:", err);
      }
      loadUsersFromStorage();
    }
    loadModels();
  }, []);

  function loadUsersFromStorage() {
    const raw = localStorage.getItem("registeredUsers");
    const arr = raw ? JSON.parse(raw) : [];
    setUsuarios(arr);
  }

  async function handleRegister() {
    if (!nombre || !id) {
      setStatus("Completa nombre e ID");
      return;
    }
    if (!webcamRef.current) {
      setStatus("Webcam no disponible");
      return;
    }
    try {
      const video = webcamRef.current.video;
      if (!video || video.readyState !== 4) {
        setStatus("La cámara no está lista");
        return;
      }

      const detection = await faceapi
        .detectSingleFace(video, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStatus("No se detectó rostro.");
        return;
      }

      const descriptor = Array.from(detection.descriptor);
      const foto = webcamRef.current.getScreenshot();

      const raw = localStorage.getItem("registeredUsers");
      const arr = raw ? JSON.parse(raw) : [];

      if (arr.find((u) => u.id === id)) {
        setStatus("Ya existe un usuario con ese ID");
        return;
      }

      const nuevo = { id, nombre, foto, descriptor };
      arr.push(nuevo);
      localStorage.setItem("registeredUsers", JSON.stringify(arr));
      setUsuarios(arr);
      setNombre("");
      setId("");
      setStatus("Usuario registrado correctamente.");
      onReload && onReload();
    } catch (err) {
      console.error(err);
      setStatus("Error registrando usuario.");
    }
  }

  function handleDelete(uid) {
    if (!confirm("Eliminar usuario?")) return;
    const raw = localStorage.getItem("registeredUsers");
    const arr = raw ? JSON.parse(raw) : [];
    const filtered = arr.filter((u) => u.id !== uid);
    localStorage.setItem("registeredUsers", JSON.stringify(filtered));
    setUsuarios(filtered);
    onReload && onReload();
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Panel de Administración</h2>
        <div>
          <button onClick={onBack} className="btn-outline">Volver</button>
        </div>
      </div>

      <div className="admin-grid">
        <div className="card">
          <h3>Registrar nuevo usuario</h3>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "user" }}
            width={320}
            height={240}
          />
          <input placeholder="ID (ej: 59)" value={id} onChange={(e) => setId(e.target.value)} />
          <input placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 10 }}>
            <button onClick={handleRegister}>Registrar rostro</button>
            <button onClick={() => { setNombre(""); setId(""); setStatus(""); }} className="btn-outline">Limpiar</button>
          </div>
          <p className="muted">{status}</p>
        </div>

        <div className="card">
          <h3>Usuarios registrados</h3>
          {usuarios.length === 0 ? (
            <p className="muted">No hay usuarios registrados</p>
          ) : (
            <div className="users-list">
              {usuarios.map((u) => (
                <div key={u.id} className="user-row">
                  <img src={u.foto} alt={u.nombre} />
                  <div className="user-meta">
                    <strong>{u.nombre}</strong>
                    <small>ID: {u.id}</small>
                  </div>
                  <div>
                    <button className="btn-small" onClick={() => handleDelete(u.id)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
