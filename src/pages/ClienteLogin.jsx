import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

function ClienteLogin() {
  const navigate = useNavigate();
  const [nit, setNit] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [modo, setModo] = useState("login"); // "login" | "verificar" | "crear" | "recuperar"
  const [error, setError] = useState("");
  const [passwordRecuperar, setPasswordRecuperar] = useState("");
  const [confirmarRecuperar, setConfirmarRecuperar] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [verPasswordNueva, setVerPasswordNueva] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [verPasswordRecuperar, setVerPasswordRecuperar] = useState(false);
  const [verConfirmarRecuperar, setVerConfirmarRecuperar] = useState(false);

  // ESTILOS LOCALES
  const labelStyle = {
    display: "block",
    color: "#fff",
    fontSize: "14px",
    marginBottom: "6px",
    textAlign: "left"
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    background: "#3b3b3b",
    border: "1px solid #555",
    borderRadius: "5px",
    color: "#fff",
    marginBottom: "14px",
    boxSizing: "border-box"
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
    marginTop: "10px"
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

  // VERIFICAR IDENTIDAD — NIT + correo
  const handleVerificar = async () => {
    if (!nit || !correo) return setError("Ingresa tu NIT y correo");

    const res = await fetch("http://localhost/factufast-api/clientes_portal/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nit, correo, solo_verificar: true })
    });
    const data = await res.json();

    if (data.success && data.sin_password) {
      setError("");
      setModo("crear");
    } else if (data.success && !data.sin_password) {
      setError("Este NIT ya tiene contraseña, inicia sesión normalmente.");
      setModo("login");
    } else {
      setError(data.mensaje);
    }
  };

  // CREAR CONTRASEÑA
  const handleCrearPassword = async () => {
    if (!passwordNueva || passwordNueva.length < 4)
      return setError("Mínimo 4 caracteres");
    if (passwordNueva !== confirmar)
      return setError("Las contraseñas no coinciden");

    const res = await fetch("http://localhost/factufast-api/clientes_portal/registro_password.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nit, correo, password: passwordNueva })
    });
    const data = await res.json();

    if (data.success) {
      setError("");
      setModo("login");
      alert("Contraseña creada. Ahora inicia sesión.");
    } else {
      setError(data.mensaje);
    }
  };

  // RECUPERAR CONTRASEÑA
  const handleRecuperarPassword = async () => {
    if (!nit || !correo)
      return setError("Ingresa NIT y correo");

    if (passwordRecuperar.length < 4)
      return setError("La contraseña debe tener mínimo 4 caracteres");

    if (passwordRecuperar !== confirmarRecuperar)
      return setError("Las contraseñas no coinciden");

    const res = await fetch("http://localhost/factufast-api/clientes_portal/recuperar_password.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nit, correo, password: passwordRecuperar })
    });

    const data = await res.json();

    if (data.success) {
      alert("Contraseña actualizada correctamente");
      setModo("login");
      setError("");
      setPasswordRecuperar("");
      setConfirmarRecuperar("");
    } else {
      setError(data.mensaje);
    }
  };

  // LOGIN NORMAL
  const handleLogin = async () => {
    if (!nit || !password) return setError("Ingresa tu NIT y contraseña");

    const res = await fetch("http://localhost/factufast-api/clientes_portal/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nit, password })
    });
    const data = await res.json();

    if (data.success) {
      localStorage.setItem("cliente_nit", data.nit);
      localStorage.setItem("cliente_nombre", data.nombre);
      localStorage.setItem("cliente_id", data.id_cliente);
      navigate("/cliente/facturas");
    } else {
      setError(data.mensaje);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#1a1a1a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial, Helvetica, sans-serif"
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

        {/* LOGO */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <img src={logo} alt="logo" style={{ width: "50px", marginBottom: "8px" }} />
          <h1 style={{ color: "#C9BD86", fontSize: "28px", letterSpacing: "2px", margin: 0 }}>
            FACTUFAST
          </h1>
          <p style={{ color: "#aaa", fontSize: "13px", marginTop: "4px" }}>
            Portal del cliente
          </p>
        </div>

        {error && (
          <p style={{ color: "#ff6b6b", textAlign: "center", fontSize: "13px", marginBottom: "14px" }}>
            {error}
          </p>
        )}

        {/* ===== LOGIN NORMAL ===== */}
        {modo === "login" && (
          <>
            <button
              onClick={() => navigate("/")}
              style={{
                width: "100%",
                padding: "10px",
                background: "transparent",
                color: "#C9BD86",
                border: "1px solid #C9BD86",
                borderRadius: "5px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "14px",
                marginBottom: "16px"
              }}
            >
              Volver al inicio
            </button>

            <label style={labelStyle}>NIT</label>
            <input
  style={inputStyle}
  type="text"
  value={nit}

  onChange={(e)=>{

    const valor = e.target.value;

    if(/^\d*$/.test(valor)){

      setNit(valor);

    }

  }}

  inputMode="numeric"

  pattern="[0-9]*"

  maxLength="10"

  placeholder="Tu número de NIT"

/>

            <label style={labelStyle}>Contraseña</label>
            <div style={inputContainerStyle}>
              <input
                type={verPassword ? "text" : "password"}
                style={{ ...inputStyle, paddingRight: "75px" }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Tu contraseña"
              />
              <button
                type="button"
                onClick={() => setVerPassword(!verPassword)}
                style={ojoBtnStyle}
              >
                {verPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>

            <button onClick={handleLogin} style={btnStyle}>Ingresar</button>

            <p style={{ textAlign: "center", marginTop: "16px", marginBottom: "0px", fontSize: "13px" }}>
              <span onClick={() => { setModo("recuperar"); setError(""); }} style={{ color: "#C9BD86", cursor: "pointer", textDecoration: "underline" }}>
                ¿Olvidaste tu contraseña?
              </span>
            </p>

            <p style={{ textAlign: "center", marginTop: "12px", fontSize: "13px", color: "#aaa" }}>
              ¿Primera vez?{" "}
              <span onClick={() => { setModo("verificar"); setError(""); }} style={{ color: "#C9BD86", cursor: "pointer" }}>
                Crea tu contraseña aquí
              </span>
            </p>
          </>
        )}

        {/* ===== VERIFICAR IDENTIDAD ===== */}
        {modo === "verificar" && (
          <>
            <p style={{ color: "#C9BD86", fontSize: "13px", marginBottom: "14px", textAlign: "center" }}>
              Ingresa tu NIT y el correo con el que estás registrado
            </p>

            <label style={labelStyle}>NIT</label>
            <input style={inputStyle} type="text" value={nit} onChange={e => setNit(e.target.value)} placeholder="Tu número de NIT" />

            <label style={labelStyle}>Correo registrado</label>
            <input style={inputStyle} type="email" value={correo} onChange={e => setCorreo(e.target.value)} placeholder="Tu correo" />

            <button onClick={handleVerificar} style={btnStyle}>Verificar</button>

            <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px" }}>
              <span onClick={() => { setModo("login"); setError(""); }} style={{ color: "#C9BD86", cursor: "pointer", textDecoration: "underline" }}>
                ← Volver al login
              </span>
            </p>
          </>
        )}

        {/* ===== CREAR CONTRASEÑA ===== */}
        {modo === "crear" && (
          <>
            <label style={labelStyle}>Nueva Contraseña</label>
            <div style={inputContainerStyle}>
              <input
                type={verPasswordNueva ? "text" : "password"}
                style={{ ...inputStyle, paddingRight: "75px" }}
                value={passwordNueva}
                onChange={e => setPasswordNueva(e.target.value)}
                placeholder="Mínimo 4 caracteres"
              />
              <button
                type="button"
                onClick={() => setVerPasswordNueva(!verPasswordNueva)}
                style={ojoBtnStyle}
              >
                {verPasswordNueva ? "Ocultar" : "Mostrar"}
              </button>
            </div>

            <label style={labelStyle}>Confirmar Contraseña</label>
            <div style={inputContainerStyle}>
              <input
                type={verConfirmar ? "text" : "password"}
                style={{ ...inputStyle, paddingRight: "75px" }}
                value={confirmar}
                onChange={e => setConfirmar(e.target.value)}
                placeholder="Repite tu contraseña"
              />
              <button
                type="button"
                onClick={() => setVerConfirmar(!verConfirmar)}
                style={ojoBtnStyle}
              >
                {verConfirmar ? "Ocultar" : "Mostrar"}
              </button>
            </div>

            <button onClick={handleCrearPassword} style={btnStyle}>Guardar contraseña</button>
          </>
        )}

        {/* ===== RECUPERAR CONTRASEÑA ===== */}
        {modo === "recuperar" && (
          <>
            <p style={{ color: "#C9BD86", fontSize: "13px", marginBottom: "14px", textAlign: "center" }}>
              Recuperar contraseña
            </p>

            <label style={labelStyle}>NIT</label>
            <input style={inputStyle} type="text" value={nit} onChange={(e) => setNit(e.target.value)} placeholder="Tu NIT" />

            <label style={labelStyle}>Correo registrado</label>
            <input style={inputStyle} type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="Tu correo" />

            <label style={labelStyle}>Nueva contraseña</label>
            <div style={inputContainerStyle}>
              <input
                type={verPasswordRecuperar ? "text" : "password"}
                style={{ ...inputStyle, paddingRight: "75px" }}
                value={passwordRecuperar}
                onChange={(e) => setPasswordRecuperar(e.target.value)}
                placeholder="Nueva contraseña"
              />
              <button
                type="button"
                onClick={() => setVerPasswordRecuperar(!verPasswordRecuperar)}
                style={ojoBtnStyle}
              >
                {verPasswordRecuperar ? "Ocultar" : "Mostrar"}
              </button>
            </div>

            <label style={labelStyle}>Confirmar contraseña</label>
            <div style={inputContainerStyle}>
              <input
                type={verConfirmarRecuperar ? "text" : "password"}
                style={{ ...inputStyle, paddingRight: "75px" }}
                value={confirmarRecuperar}
                onChange={(e) => setConfirmarRecuperar(e.target.value)}
                placeholder="Confirmar contraseña"
              />
              <button
                type="button"
                onClick={() => setVerConfirmarRecuperar(!verConfirmarRecuperar)}
                style={ojoBtnStyle}
              >
                {verConfirmarRecuperar ? "Ocultar" : "Mostrar"}
              </button>
            </div>

            <button onClick={handleRecuperarPassword} style={btnStyle}>Actualizar contraseña</button>

            <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px" }}>
              <span onClick={() => { setModo("login"); setError(""); }} style={{ color: "#C9BD86", cursor: "pointer", textDecoration: "underline" }}>
                ← Volver al login
              </span>
            </p>
          </>
        )}

      </div>
    </div>
  );
}

export default ClienteLogin;