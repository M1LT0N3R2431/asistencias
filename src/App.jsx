import React, { useEffect, useState, useRef } from "react";
import Webcam from "react-webcam";

/* Material UI */
import {
  AppBar, Toolbar, Typography, Box, Button, TextField, Divider,
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  Paper, Select, MenuItem, FormControl, InputLabel, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import LogoutIcon from "@mui/icons-material/Logout";

import "./App.css";

/* Datos iniciales: empleados (puedes ampliar) */
const EMPLEADOS_INICIALES = [
  { id: "E001", nombre: "Ana López", ubicacion: "Tapachula" },
  { id: "E002", nombre: "Carlos Gómez", ubicacion: "Tuxtla Gutiérrez" },
  { id: "E003", nombre: "María Torres", ubicacion: "Tapachula" },
  { id: "E004", nombre: "Luis Pérez", ubicacion: "Tuxtla Gutiérrez" },
];

const ADMIN_CRED = { correo: "admin@empresa.com", password: "1234" };

/* helper para localStorage */
const STORAGE_KEY = "asistencias_v1";

export default function App() {
  const [view, setView] = useState("home"); // 'home'|'employee'|'admin'
  const [ubicacion, setUbicacion] = useState("");
  const [empleados] = useState(EMPLEADOS_INICIALES);
  const [asistencias, setAsistencias] = useState([]);
  const [adminForm, setAdminForm] = useState({ correo: "", password: "" });
  const webcamRef = useRef(null);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [rowsPerPage] = useState(10);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setAsistencias(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(asistencias));
  }, [asistencias]);

  /* Simulación de "reconocimiento facial": tomamos snapshot y registramos */
  const handleScan = async (emp) => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    const hora = new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

    // Si ya hay registro sin salida -> registrar salida
    const openRecord = asistencias.find(r => r.id === emp.id && !r.salida);
    if (openRecord) {
      const updated = asistencias.map(r => r.id === emp.id ? { ...r, salida: hora, fotoSalida: imageSrc } : r);
      setAsistencias(updated);
      alert(`Salida registrada para ${emp.nombre} (${hora})`);
    } else {
      // registrar entrada
      const nuevo = {
        id: emp.id,
        nombre: emp.nombre,
        ubicacion: emp.ubicacion,
        entrada: hora,
        salida: "",
        fotoEntrada: imageSrc,
        estatus: "present" // por defecto, puedes ajustar por hora de entrada si quieres
      };
      setAsistencias(prev => [nuevo, ...prev]);
      alert(`Entrada registrada para ${emp.nombre} (${hora})`);
    }
  };

  const handleAdminLogin = () => {
    if (adminForm.correo === ADMIN_CRED.correo && adminForm.password === ADMIN_CRED.password) {
      setView("admin");
    } else {
      alert("Credenciales incorrectas");
    }
  };

  const clearAll = () => {
    if (confirm("¿Borrar todos los registros de asistencia?")) {
      setAsistencias([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const exportCSV = () => {
    if (!asistencias.length) { alert("No hay registros para exportar."); return; }
    const header = ["ID","Nombre","Ubicación","Entrada","Salida"];
    const rows = asistencias.map(a => [a.id, a.nombre, a.ubicacion, a.entrada, a.salida || ""]);
    const csvContent = [header, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `asistencias_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* filtros para admin */
  const filtered = asistencias.filter(a =>
    (a.nombre.toLowerCase().includes(filterText.toLowerCase()) || a.id.toLowerCase().includes(filterText.toLowerCase()))
  );

  /* Vista: Home con opciones */
  if (view === "home") {
    return (
      <div className="app-root">
        <div className="sidebar">
          <div className="brand">Employee MS</div>
          <List>
            <ListItem button onClick={() => setView("home")}>
              <ListItemIcon><HomeIcon style={{ color: "#fff" }} /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>

            <ListItem button onClick={() => setView("employee")}>
              <ListItemIcon><CameraAltIcon style={{ color: "#fff" }} /></ListItemIcon>
              <ListItemText primary="Registro (Empleado)" />
            </ListItem>

            <ListItem button onClick={() => setView("admin")}>
              <ListItemIcon><PeopleIcon style={{ color: "#fff" }} /></ListItemIcon>
              <ListItemText primary="Administrador" />
            </ListItem>
          </List>

          <Divider />
          <div style={{ marginTop: 12 }}>
            <Button variant="contained" color="secondary" onClick={() => setView("admin")}>Ir a Admin</Button>
          </div>
        </div>

        <div className="main">
          <Box className="topbar">
            <Typography variant="h5">Bienvenido — Sistema de Asistencias</Typography>
            <div>
              <Button onClick={() => { setView("admin"); }}>Iniciar sesión Admin</Button>
            </div>
          </Box>

          <Paper style={{ padding: 16 }}>
            <Typography variant="subtitle1">¿Qué deseas hacer?</Typography>
            <Divider style={{ margin: "12px 0" }} />
            <Box display="flex" gap={2} flexWrap="wrap">
              <Button variant="contained" onClick={() => setView("employee")}>Ir a registro por sede</Button>
              <Button variant="outlined" onClick={() => { setView("admin"); }}>Panel administrador</Button>
              <Button variant="outlined" color="error" onClick={clearAll}>Borrar todo (localStorage)</Button>
              <Button variant="outlined" onClick={exportCSV}>Exportar CSV</Button>
            </Box>
          </Paper>

          <Box mt={3}>
            <Typography variant="h6">Resumen rápido</Typography>
            <Box display="flex" gap={3} mt={1}>
              <Paper style={{ padding: 16, minWidth: 180 }}>
                <Typography variant="subtitle2">Registros totales</Typography>
                <Typography variant="h5">{asistencias.length}</Typography>
              </Paper>
              <Paper style={{ padding: 16, minWidth: 180 }}>
                <Typography variant="subtitle2">Empleados</Typography>
                <Typography variant="h5">{empleados.length}</Typography>
              </Paper>
            </Box>
          </Box>
        </div>
      </div>
    );
  }

  /* Vista: Empleado (registro por sede) */
  if (view === "employee") {
    return (
      <div className="app-root">
        <div className="sidebar">
          <div className="brand">Employee MS</div>
          <List>
            <ListItem button onClick={() => setView("home")}>
              <ListItemIcon><HomeIcon style={{ color: "#fff" }} /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button onClick={() => setView("employee")}>
              <ListItemIcon><CameraAltIcon style={{ color: "#fff" }} /></ListItemIcon>
              <ListItemText primary="Registro (Empleado)" />
            </ListItem>
            <ListItem button onClick={() => setView("admin")}>
              <ListItemIcon><PeopleIcon style={{ color: "#fff" }} /></ListItemIcon>
              <ListItemText primary="Administrador" />
            </ListItem>
          </List>
          <Divider />
          <Button startIcon={<LogoutIcon />} onClick={() => setView("home")} style={{ marginTop: "auto" }}>Cerrar</Button>
        </div>

        <div className="main">
          <Box className="topbar">
            <Typography variant="h6">Registro de Asistencia — Empleados</Typography>
            <div>
              <Button onClick={() => setView("home")}>Volver</Button>
            </div>
          </Box>

          <Paper style={{ padding: 16 }}>
            <FormControl fullWidth>
              <InputLabel id="ubic-label">Selecciona sede</InputLabel>
              <Select
                labelId="ubic-label"
                value={ubicacion}
                label="Selecciona sede"
                onChange={(e) => setUbicacion(e.target.value)}
              >
                <MenuItem value={"Tapachula"}>Tapachula</MenuItem>
                <MenuItem value={"Tuxtla Gutiérrez"}>Tuxtla Gutiérrez</MenuItem>
              </Select>
            </FormControl>

            {ubicacion && (
              <>
                <Box mt={2}>
                  <Typography variant="subtitle1">Empleados en {ubicacion}</Typography>
                  <Divider style={{ margin: "8px 0" }} />
                  {empleados.filter(e => e.ubicacion === ubicacion).map(emp => (
                    <div key={emp.id} className="employee-card">
                      <div>
                        <Typography variant="subtitle1">{emp.nombre}</Typography>
                        <Typography variant="caption">ID: {emp.id} • {emp.ubicacion}</Typography>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Button variant="outlined" onClick={() => { setSelectedEmp(emp); }}>
                          Abrir cámara
                        </Button>
                        <Button variant="contained" onClick={() => handleScan(emp)}>Escanear (rápido)</Button>
                      </div>
                    </div>
                  ))}
                </Box>

                {/* Webcam modal-like box */}
                {selectedEmp && (
                  <Box mt={2} className="webcam-box">
                    <Typography variant="subtitle1">Cámara — {selectedEmp.nombre}</Typography>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      width={400}
                      videoConstraints={{ facingMode: "user" }}
                    />
                    <Box mt={1} display="flex" gap={1}>
                      <Button variant="contained" onClick={() => handleScan(selectedEmp)}>Tomar foto y registrar</Button>
                      <Button variant="outlined" onClick={() => setSelectedEmp(null)}>Cerrar</Button>
                    </Box>
                  </Box>
                )}
              </>
            )}
          </Paper>
        </div>
      </div>
    );
  }

  /* Vista: Admin (requiere login si no autenticado) */
  if (view === "admin") {
    // if adminForm not valid and not logged in through login flow, show login form
    const isLoggedIn = true; // con este ejemplo el admin entra directamente desde home -> admin
    // para simplificar, mantendremos una comprobación: si adminForm coincide con credenciales, ya se está en admin.
    // pero como permitimos navegar a "admin" desde home, mostramos un login si no se ha validado.
    const showLogin = !(adminForm.correo === ADMIN_CRED.correo && adminForm.password === ADMIN_CRED.password);

    return (
      <div className="app-root">
        <div className="sidebar">
          <div className="brand">Employee MS</div>
          <List>
            <ListItem button onClick={() => setView("home")}>
              <ListItemIcon><HomeIcon style={{ color: "#fff" }} /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button onClick={() => setView("employee")}>
              <ListItemIcon><CameraAltIcon style={{ color: "#fff" }} /></ListItemIcon>
              <ListItemText primary="Registro (Empleado)" />
            </ListItem>
            <ListItem button onClick={() => setView("admin")}>
              <ListItemIcon><PeopleIcon style={{ color: "#fff" }} /></ListItemIcon>
              <ListItemText primary="Administrador" />
            </ListItem>
          </List>

          <Divider />
          <Button startIcon={<LogoutIcon />} onClick={() => { setAdminForm({ correo: "", password: "" }); setView("home"); }} style={{ marginTop: "auto" }}>Cerrar sesión</Button>
        </div>

        <div className="main">
          <Box className="topbar">
            <Typography variant="h6">Panel de Administrador</Typography>
            <div>
              <Button onClick={exportCSV}>Exportar CSV</Button>
            </div>
          </Box>

          {showLogin ? (
            <Paper style={{ padding: 24, maxWidth: 480 }}>
              <Typography variant="h6">Iniciar sesión administrador</Typography>
              <TextField fullWidth label="Correo" value={adminForm.correo} onChange={e => setAdminForm({ ...adminForm, correo: e.target.value })} style={{ marginTop: 12 }} />
              <TextField fullWidth label="Contraseña" type="password" value={adminForm.password} onChange={e => setAdminForm({ ...adminForm, password: e.target.value })} style={{ marginTop: 12 }} />
              <Box mt={2} display="flex" gap={1}>
                <Button variant="contained" onClick={handleAdminLogin}>Ingresar</Button>
                <Button variant="outlined" onClick={() => setView("home")}>Volver</Button>
              </Box>
              <Typography variant="caption" display="block" mt={1}>Credenciales demo: admin@empresa.com / 1234</Typography>
            </Paper>
          ) : (
            <>
              <Paper style={{ padding: 12, marginBottom: 12 }}>
                <Box display="flex" gap={2} alignItems="center">
                  <TextField label="Buscar por nombre o ID" value={filterText} onChange={(e) => setFilterText(e.target.value)} />
                  <Button onClick={() => { setFilterText(""); }}>Limpiar</Button>
                  <Button color="error" onClick={clearAll}>Borrar todo</Button>
                </Box>
              </Paper>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>S No</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Emp Id</TableCell>
                      <TableCell>Ubicación</TableCell>
                      <TableCell>Entrada</TableCell>
                      <TableCell>Salida</TableCell>
                      <TableCell>Foto</TableCell>
                      <TableCell>Acción</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">Sin registros</TableCell>
                      </TableRow>
                    ) : (
                      filtered.slice(0, rowsPerPage).map((r, i) => (
                        <TableRow key={i}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{r.nombre}</TableCell>
                          <TableCell>{r.id}</TableCell>
                          <TableCell>{r.ubicacion}</TableCell>
                          <TableCell>{r.entrada}</TableCell>
                          <TableCell>{r.salida || "-"}</TableCell>
                          <TableCell>
                            {r.fotoEntrada ? <img src={r.fotoEntrada} alt="entrada" width={50} /> : "-"}
                          </TableCell>
                          <TableCell>
                            <Button size="small" onClick={() => {
                              // marcar sick / absent / present cycled
                              const next = r.estatus === "present" ? "sick" : r.estatus === "sick" ? "absent" : "present";
                              setAsistencias(prev => prev.map(x => x.id === r.id ? { ...x, estatus: next } : x));
                            }}>
                              Cambiar estatus ({r.estatus || "present"})
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}
