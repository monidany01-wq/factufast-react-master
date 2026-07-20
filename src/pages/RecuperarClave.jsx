import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Footer from '../components/Footer';
import Header from '../components/Header';

function RecuperarClave() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [mostrarCambio, setMostrarCambio] = useState(false);
  const [mostrarVerificacion, setMostrarVerificacion] = useState(false);
  const [claveNueva, setClaveNueva] = useState("");
  const [confirmarClave, setConfirmarClave] = useState("");
  const [email, setEmail] = useState("");
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [verClave, setVerClave] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);

  const limpiarMensaje = () => {
    setMensaje("");
    setTipoMensaje("");
  };

  const verificarUsuario = () => {
    limpiarMensaje();

    if (usuario.trim() === "") {
      setMensaje("Ingrese su usuario o cédula.");
      setTipoMensaje("error");
      return;
    }

    // Buscar usuario en el sistema y pedir verificación por correo
    fetch('http://localhost/factufast-api/usuarios/listar.php')
      .then(res => res.json())
      .then(data => {
        const lista = Array.isArray(data) ? data : [];
        const buscado = lista.find(u => (
          String(u.nombre_usuario || '').toLowerCase() === usuario.trim().toLowerCase() ||
          String(u.cedula_usuario || '') === usuario.trim() ||
          String(u.correo_usuario || '').toLowerCase() === usuario.trim().toLowerCase()
        ));

        if (!buscado) {
          setMensaje('Usuario no encontrado. Verifica el dato ingresado.');
          setTipoMensaje('error');
          return;
        }

        setUsuarioEncontrado(buscado);
        setMostrarVerificacion(true);
        setMensaje('Se encontró el usuario. Ingresa el correo registrado para verificar.');
        setTipoMensaje('success');
      })
      .catch(() => {
        setMensaje('Error conectando con el servidor.');
        setTipoMensaje('error');
      });
  };

  const verificarEmail = () => {
    limpiarMensaje();

    if (!usuarioEncontrado) {
      setMensaje('No se encontró usuario para verificar.');
      setTipoMensaje('error');
      return;
    }

    if (!email.trim()) {
      setMensaje('Ingresa el correo registrado.');
      setTipoMensaje('error');
      return;
    }

    if ((usuarioEncontrado.correo_usuario || '').toLowerCase() !== email.trim().toLowerCase()) {
      setMensaje('El correo no coincide con el registrado para este usuario.');
      setTipoMensaje('error');
      return;
    }

    setMostrarCambio(true);
    setMostrarVerificacion(false);
    setMensaje('Correo verificado. Ahora escribe tu nueva contraseña.');
    setTipoMensaje('success');
  };

  const cambiarClave = async () => {
    limpiarMensaje();

    if (usuario.trim() === "") {
      setMensaje("Ingrese su usuario o cédula.");
      setTipoMensaje("error");
      return;
    }

    if (claveNueva.trim() === "" || confirmarClave.trim() === "") {
      setMensaje("Debe completar ambos campos de contraseña.");
      setTipoMensaje("error");
      return;
    }

    if (claveNueva.length < 4) {
      setMensaje("La contraseña debe tener mínimo 4 caracteres.");
      setTipoMensaje("error");
      return;
    }

    if (claveNueva !== confirmarClave) {
      setMensaje("Las contraseñas no coinciden.");
      setTipoMensaje("error");
      return;
    }

    try {
      setCargando(true);

      const response = await fetch(
        "http://localhost/factufast-api/usuarios/reset_password.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            usuario: usuario.trim(),
            clave: claveNueva
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        setMensaje("Contraseña actualizada correctamente. Redirigiendo al login...");
        setTipoMensaje("success");

        setTimeout(() => {
          navigate("/login");
        }, 1200);
      } else {
        setMensaje(data.mensaje || "No se pudo cambiar la contraseña.");
        setTipoMensaje("error");
      }

    } catch (error) {
      console.error(error);
      setMensaje("Error conectando con el servidor.");
      setTipoMensaje("error");
    } finally {
      setCargando(false);
    }
  };

  const labelStyle = {
    display: "block",
    color: "#fff",
    fontSize: "14px",
    marginBottom: "6px",
    textAlign: "left"
  };

  const inputStyle = {
    width: "100%",
    padding: "11px",
    background: "#3b3b3b",
    border: "1px solid #555",
    borderRadius: "5px",
    color: "#fff",
    marginBottom: "14px",
    boxSizing: "border-box",
    outline: "none"
  };

  const inputContainerStyle = {
    position: "relative",
    width: "100%",
    marginBottom: "14px"
  };

  const ojoBtnStyle = {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#C9BD86",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold"
  };

  const btnStyle = {
    width: "100%",
    padding: "12px",
    background: "#C9BD86",
    color: "#1a1a1a",
    border: "none",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "15px",
    marginTop: "8px"
  };

  const btnOutlineStyle = {
    width: "100%",
    padding: "10px",
    background: "transparent",
    color: "#C9BD86",
    border: "1px solid #C9BD86",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
    marginTop: "16px"
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#1a1a1a",
      display: "flex",
      flexDirection: "column"
    }}>
      <Header />

      <div style={{
        flex: 1,
        background: "#1a1a1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, Helvetica, sans-serif",
        padding: "35px 20px",
        boxSizing: "border-box"
      }}>

        <div style={{
          background: "#2b2b2b",
          border: "1px solid #8A7700",
          borderRadius: "10px",
          padding: "40px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.5)"
        }}>

          <h2 style={{
            color: "#C9BD86",
            fontSize: "26px",
            textAlign: "center",
            margin: "0 0 8px"
          }}>
            Recuperar Contraseña
          </h2>

          <p style={{
            color: "#aaa",
            fontSize: "13px",
            textAlign: "center",
            marginTop: "4px",
            marginBottom: "24px"
          }}>
            Ingresa tu usuario o cédula para cambiar tu contraseña.
          </p>

          {mensaje && (
            <p style={{
              color: tipoMensaje === "success" ? "#8ee59b" : "#ff6b6b",
              textAlign: "center",
              fontSize: "13px",
              marginBottom: "14px"
            }}>
              {mensaje}
            </p>
          )}

          <label style={labelStyle}>Usuario o cédula</label>
          <input
            type="text"
            placeholder="Usuario o cédula"
            value={usuario}
            disabled={mostrarCambio}
            onChange={(e) => setUsuario(e.target.value)}
            style={{
              ...inputStyle,
              opacity: mostrarCambio ? 0.75 : 1
            }}
          />

          {!mostrarCambio && !mostrarVerificacion && (
            <button onClick={verificarUsuario} style={btnStyle}>Continuar</button>
          )}

          {mostrarVerificacion && (
            <>
              <label style={labelStyle}>Correo registrado</label>
              <input
                type="email"
                placeholder="Correo registrado"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
              <button onClick={verificarEmail} style={btnStyle}>Verificar correo</button>
            </>
          )}

          {mostrarCambio && (
            <div style={{ marginTop: "6px" }}>

              <label style={labelStyle}>Nueva contraseña</label>
              <div style={inputContainerStyle}>
                <input
                  type={verClave ? "text" : "password"}
                  placeholder="Nueva contraseña"
                  value={claveNueva}
                  onChange={(e) => setClaveNueva(e.target.value)}
                  style={{ ...inputStyle, paddingRight: "75px" }}
                />
                <button
                  type="button"
                  onClick={() => setVerClave(!verClave)}
                  style={ojoBtnStyle}
                >
                  {verClave ? "Ocultar" : "Mostrar"}
                </button>
              </div>

              <label style={labelStyle}>Confirmar contraseña</label>
              <div style={inputContainerStyle}>
                <input
                  type={verConfirmar ? "text" : "password"}
                  placeholder="Confirmar contraseña"
                  value={confirmarClave}
                  onChange={(e) => setConfirmarClave(e.target.value)}
                  style={{ ...inputStyle, paddingRight: "75px" }}
                />
                <button
                  type="button"
                  onClick={() => setVerConfirmar(!verConfirmar)}
                  style={ojoBtnStyle}
                >
                  {verConfirmar ? "Ocultar" : "Mostrar"}
                </button>
              </div>

              <button
                onClick={cambiarClave}
                disabled={cargando}
                style={{
                  ...btnStyle,
                  opacity: cargando ? 0.7 : 1,
                  cursor: cargando ? "not-allowed" : "pointer"
                }}
              >
                {cargando ? "Guardando..." : "Guardar nueva contraseña"}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate("/login")}
            style={btnOutlineStyle}
          >
            Volver al login
          </button>

        </div>
      </div>

      <Footer />
    </div>
  );
}

export default RecuperarClave;