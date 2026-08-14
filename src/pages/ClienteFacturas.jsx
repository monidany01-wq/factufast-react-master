import React, {
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';
import { clearClienteSesion } from '../utils/session';

function ClienteFacturas() {
  const navigate = useNavigate();
  const nit = sessionStorage.getItem("cliente_nit");
  const nombre = sessionStorage.getItem("cliente_nombre");
  const [facturas, setFacturas] = useState([]);

  useEffect(() => {
    fetch(`http://localhost/factufast-api/clientes_portal/mis_facturas.php?nit=${nit}`)
      .then(res => res.json())
      .then(data => setFacturas(data))
      .catch(() => alert("Error cargando facturas"));
  }, [nit]);

  const cerrarSesion = () => {
    if (!window.confirm("¿Estás seguro que deseas cerrar sesión?")) return;
    clearClienteSesion();
    navigate("/cliente/login", { replace: true });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#1a1a1a",
      fontFamily: "Arial, Helvetica, sans-serif",
      padding: "30px"
    }}>

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        borderBottom: "1px solid #8A7700",
        paddingBottom: "16px"
      }}>
        <div>
          <h1 style={{ color: "#C9BD86", fontSize: "22px",
            letterSpacing: "2px", margin: 0 }}>FACTUFAST</h1>
          <p style={{ color: "#aaa", fontSize: "13px", margin: "4px 0 0" }}>
            Bienvenido, {nombre}
          </p>
        </div>
        <button onClick={cerrarSesion} style={{
          backgroundColor: "transparent",
          border: "1px solid #8A7700",
          color: "#C9BD86",
          padding: "8px 18px",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "13px"
        }}>Cerrar sesión</button>
      </div>

      <h2 style={{ color: "#C9BD86", fontSize: "18px",
        marginBottom: "20px" }}>Mis facturas</h2>

      {facturas.length === 0 ? (
        <p style={{ color: "#aaa" }}>No tienes facturas registradas.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["# Factura", "Fecha", "Estado", "Detalle"].map(h => (
                <th key={h} style={{
                  background: "#8A7700",
                  color: "white",
                  padding: "12px",
                  textAlign: "center",
                  fontWeight: "500"
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {facturas.map((f, i) => (
              <tr key={i} style={{
                background: i % 2 === 0 ? "#2b2b2b" : "#222"
              }}>
                <td style={tdStyle}>{f.id_factura}</td>
                <td style={tdStyle}>{f.fecha_emision}</td>
                <td style={{
                  ...tdStyle,
                  color: f.estado === "ANULADA" ? "#ff6b6b" : "#4caf50",
                  fontWeight: "bold"
                }}>{f.estado}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => navigate(`/cliente/factura/${f.id_factura}`)}
                    style={{
                      padding: "6px 16px",
                      backgroundColor: "#8A7700",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "13px"
                    }}>
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const tdStyle = {
  padding: "10px",
  textAlign: "center",
  color: "#f1eaea",
  borderBottom: "1px solid #333"
};

export default ClienteFacturas;