import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

const MODEL_URL = "/models";

export default function FaceScanner({ onRecognized, onStatus, reload }) {
  const webcamRef = useRef(null);
  const [matcher, setMatcher] = useState(null);
  const [isLoadingModels, setIsLoadingModels] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadModels() {
      try {
        onStatus && onStatus("Cargando modelos...");
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        onStatus && onStatus("Modelos cargados.");
        await buildMatcherFromStorage();
        if (mounted) setIsLoadingModels(false);
        onStatus && onStatus("Listo. Acerca tu rostro a la cámara.");
      } catch (err) {
        console.error("Error cargando modelos:", err);
        onStatus && onStatus("Error cargando modelos.");
      }
    }

    loadModels();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    (async () => {
      if (!isLoadingModels) {
        onStatus && onStatus("Actualizando descriptores...");
        await buildMatcherFromStorage();
        onStatus && onStatus("Descriptores actualizados.");
      }
    })();
  }, [reload]);

  async function buildMatcherFromStorage() {
    const raw = localStorage.getItem("registeredUsers");
    if (!raw) {
      setMatcher(null);
      return;
    }
    const users = JSON.parse(raw);
    const labeledDescriptors = users.map((u) => {
      const descriptors = [new Float32Array(u.descriptor)];
      return new faceapi.LabeledFaceDescriptors(u.id + "|" + u.nombre, descriptors);
    });
    const fm = new faceapi.FaceMatcher(labeledDescriptors, 0.55);
    setMatcher(fm);
  }

  const detectAndRecognize = async () => {
    if (!webcamRef.current || !matcher) return;

    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) return;

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) return;

      const best = matcher.findBestMatch(detection.descriptor);
      if (best && best.label !== "unknown") {
        const [id, nombre] = best.label.split("|");
        const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
        const usuario = users.find((u) => u.id === id);
        if (usuario) {
          onRecognized && onRecognized({ id: usuario.id, nombre: usuario.nombre, foto: usuario.foto });
          registrarAsistencia(usuario);
        }
      }
    } catch (err) {
      console.error("Error en detección:", err);
    }
  };

  function registrarAsistencia(usuario) {
    const hora = new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
    const asistenciasRaw = localStorage.getItem("asistencias");
    const asistencias = asistenciasRaw ? JSON.parse(asistenciasRaw) : [];
    const registroExistente = asistencias.find((r) => r.id === usuario.id && !r.salida);
    if (registroExistente) {
      const nuevas = asistencias.map((r) => (r.id === usuario.id && !r.salida ? { ...r, salida: hora } : r));
      localStorage.setItem("asistencias", JSON.stringify(nuevas));
    } else {
      asistencias.push({ id: usuario.id, nombre: usuario.nombre, entrada: hora, salida: "" });
      localStorage.setItem("asistencias", JSON.stringify(asistencias));
    }
  }

  useEffect(() => {
    const interval = setInterval(() => { if (!isLoadingModels) detectAndRecognize(); }, 1200);
    return () => clearInterval(interval);
  }, [matcher, isLoadingModels]);

  return (
    <div className="face-scanner">
      <div className="webcam-frame">
        <Webcam
          audio={false}
          ref={webcamRef}
          mirrored
          videoConstraints={{ facingMode: "user" }}
          width={360}
          height={270}
        />
      </div>
      <p className="muted">Camara activa. {isLoadingModels ? "Cargando..." : "Listo para reconocer"}</p>
    </div>
  );
}
