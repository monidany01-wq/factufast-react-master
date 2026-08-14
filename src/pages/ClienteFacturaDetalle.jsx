import React, {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

function ClienteFacturaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const nombre = sessionStorage.getItem("cliente_nombre");
  const [factura, setFactura] = useState(null);
  const [detalle, setDetalle] = useState([]);

  useEffect(() => {
    fetch(`http://localhost/factufast-api/facturas/detalle.php?id=${id}`)
      .then(res => res.json())
      .then(data => {
        setFactura(data.factura || {});
        setDetalle(data.detalle || []);
      })
      .catch(() => alert("Error cargando factura"));
  }, [id]);

  const subtotal = detalle.reduce(
    (acc, item) => acc + (Number(item.precio_unitario || 0) * Number(item.cantidad || 0)), 0
  );
  const iva = detalle.reduce(
    (acc, item) => acc + (Number(item.precio_unitario || 0) * Number(item.cantidad || 0) * Number(item.iva || 0)), 0
  );
  const total = subtotal + iva;

  if (!factura) return (
    <div style={{ minHeight: "100vh", background: "#1a1a1a",
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#C9BD86" }}>Cargando...</p>
    </div>
  );

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
            Detalle de factura
          </p>
        </div>
        <button onClick={() => navigate("/cliente/facturas")} style={{
          backgroundColor: "transparent",
          border: "1px solid #8A7700",
          color: "#C9BD86",
          padding: "8px 18px",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "13px"
        }}>
          ← Volver
        </button>
      </div>

      {/* INFO FACTURA */}
      <div style={{
        background: "#2b2b2b",
        border: "1px solid #8A7700",
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "24px"
      }}>
        <p style={{ color: "#f1eaea", margin: "6px 0" }}>
          <span style={{ color: "#C9BD86" }}>Factura #:</span> {factura.id_factura}
        </p>
        <p style={{ color: "#f1eaea", margin: "6px 0" }}>
          <span style={{ color: "#C9BD86" }}>Cliente:</span> {nombre}
        </p>
        <p style={{ color: "#f1eaea", margin: "6px 0" }}>
          <span style={{ color: "#C9BD86" }}>Fecha:</span> {factura.fecha_emision}
        </p>
        <p style={{ margin: "6px 0" }}>
          <span style={{ color: "#C9BD86" }}>Estado:</span>{" "}
          <span style={{
            color: factura.estado === "ANULADA" ? "#ff6b6b" : "#4caf50",
            fontWeight: "bold"
          }}>{factura.estado}</span>
        </p>
      </div>

      {/* TABLA PRODUCTOS */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
        <thead>
          <tr>
            {["Producto", "Cantidad", "Precio unitario", "Subtotal"].map(h => (
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
          {detalle.map((item, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#2b2b2b" : "#222" }}>
              <td style={tdStyle}>{item.nombre_producto}</td>
              <td style={tdStyle}>{item.cantidad}</td>
              <td style={tdStyle}>
                ${Number(item.precio_unitario || 0).toLocaleString("es-CO")}
              </td>
              <td style={tdStyle}>
                ${Number(item.subtotal || 0).toLocaleString("es-CO")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTALES */}
      <div style={{
        background: "#2b2b2b",
        border: "1px solid #8A7700",
        borderRadius: "8px",
        padding: "20px",
        maxWidth: "300px",
        marginLeft: "auto"
      }}>
        <p style={{ color: "#f1eaea", margin: "6px 0",
          display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#C9BD86" }}>Subtotal:</span>
          ${subtotal.toLocaleString("es-CO")}
        </p>
        <p style={{ color: "#f1eaea", margin: "6px 0",
          display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#C9BD86" }}>IVA:</span>
          ${iva.toLocaleString("es-CO")}
        </p>
        <hr style={{ borderColor: "#8A7700", margin: "10px 0" }} />
        <p style={{ color: "#C9BD86", margin: "6px 0", fontSize: "18px",
          fontWeight: "bold", display: "flex", justifyContent: "space-between" }}>
          <span>Total:</span>
          ${total.toLocaleString("es-CO")}
        </p>
      </div>

    </div>
  );
}

const tdStyle = {
  padding: "10px",
  textAlign: "center",
  color: "#f1eaea",
  borderBottom: "1px solid #333"
};

export default ClienteFacturaDetalle;