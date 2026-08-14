import { useNavigate } from 'react-router-dom';

import logo from '../assets/logo.png';
import salir from '../assets/salida.png';
import { clearUsuarioSesion, getUsuarioSesion } from '../utils/session';

function Header() {

  const navigate = useNavigate();

  const usuarioObj = getUsuarioSesion() || {};
  const nombre = usuarioObj.nombre || "Usuario";
  const rol    = usuarioObj.rol    || "";

  const cerrarSesion = () => {
    if (!window.confirm("¿Estás seguro que deseas cerrar sesión?")) return;
    clearUsuarioSesion();
    navigate("/login", { replace: true });
  };

  return (
      <div style={{
        background: "#8a7500",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "15px"
      }}>

      {/* LOGO */}
      <img src={logo} alt="logo" style={{ width: "90px" }} />

      {/* TEXTO CENTRAL */}
      <div style={{ textAlign: "center", flex: 1 }}>
        <h1 style={{ margin: 0 }}>FACTUFAST</h1>
        <p style={{ margin: 0 }}>Facturación rápida, negocios sin límites</p>
      </div>

      {/* USUARIO */}
      <div style={{ textAlign: "right", color: "white" }}>
        <div style={{ fontSize: "16px", fontWeight: "bold" }}>Bienvenido {nombre}</div>
        <div style={{ fontSize: "14px" }}>Rol: {rol}</div>
        <img
          src={salir}
          alt="salir"
          onClick={cerrarSesion}
          style={{ width: "80px", cursor: "pointer", marginTop: "5px" }}
        />
      </div>

    </div>
  );
}

export default Header;