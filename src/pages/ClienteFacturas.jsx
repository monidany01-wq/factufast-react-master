import React, {
  useEffect,
  useState,
} from 'react';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import '../layout/layout.css';
import { clearClienteSesion } from '../utils/session';
import logo from '../assets/logo.png';

function ClienteFacturas() {
  const numeroWhatsApp = '573144571556';
  const mensajeWhatsApp = encodeURIComponent('Hola, necesito ayuda con FACTUFAST.');
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

  const descargarFactura = async (id_factura) => {
    try {
      // Obtener datos de la factura
      const resFactura = await fetch(`http://localhost/factufast-api/facturas/factura.php?id=${id_factura}`);
      const factura = await resFactura.json();
      
      // Obtener detalle de la factura
      const resDetalle = await fetch(`http://localhost/factufast-api/facturas/detalle.php?id=${id_factura}`);
      const detalleData = await resDetalle.json();
      const detalle = detalleData.detalle || [];

      // Crear contenedor temporal para el PDF
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
tempDiv.style.left = '-10000px';
tempDiv.style.top = '0';
tempDiv.style.width = '210mm';
tempDiv.style.background = 'white';
      tempDiv.innerHTML = `
        <div style="width: 210mm; padding: 20px; background: white; color: black; font-family: Arial;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div style="display: flex; gap: 10px;">
              <img src="${logo}" alt="logo" style="width: 70px;" />
              <div>
                <h2 style="margin: 0;">FACTUFAST</h2>
                <p style="margin: 0;">NIT: 123456789-0</p>
                <p style="margin: 0;">Tel: 3024698432</p>
                <p style="margin: 0;">Maicao - La Guajira</p>
              </div>
            </div>
            <div style="text-align: right;">
              <h3 style="margin: 0;">FAC-${String(id_factura).padStart(4, "0")}</h3>
              <p style="margin: 0;">${factura.fecha_emision}</p>
            </div>
          </div>

          <p style="font-size: 12px;">
            Resolución XXX No. 123456789
            Rango autorizado: 0001 - 5000
          </p>

          <div style="margin: 20px 0; border-top: 1px solid #ccc; padding-top: 10px;">
            <p><b>Cliente:</b> ${factura.nombre_cliente}</p>
            <p><b>Documento:</b> ${factura.nit_cliente}</p>
            <p><b>Atendido por:</b> ${factura.nombre_usuario}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f0f0f0;">
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Producto</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: center;">Cantidad</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: right;">Precio</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${detalle.map(item => {
                const precio = Number(item.precio_unitario || item.precio_venta || 0);
                const subtotal = precio * Number(item.cantidad);
                return `
                  <tr>
                    <td style="border: 1px solid #ccc; padding: 8px;">${item.nombre_producto}</td>
                    <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${item.cantidad}</td>
                    <td style="border: 1px solid #ccc; padding: 8px; text-align: right;">$${precio.toLocaleString("es-CO")}</td>
                    <td style="border: 1px solid #ccc; padding: 8px; text-align: right;">$${subtotal.toLocaleString("es-CO")}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div style="text-align: right; margin-top: 20px;">
            <p><b>Subtotal: $${detalle.reduce((acc, item) => {
              const precio = Number(item.precio_unitario || item.precio_venta || 0);
              return acc + (precio * Number(item.cantidad));
            }, 0).toLocaleString("es-CO")}</b></p>
            <p><b>IVA (19%): $${(detalle.reduce((acc, item) => {
              const precio = Number(item.precio_unitario || item.precio_venta || 0);
              return acc + (precio * Number(item.cantidad));
            }, 0) * 0.19).toLocaleString("es-CO")}</b></p>
            <h2 style="margin: 10px 0 0;">Total: $${(detalle.reduce((acc, item) => {
              const precio = Number(item.precio_unitario || item.precio_venta || 0);
              return acc + (precio * Number(item.cantidad));
            }, 0) * 1.19).toLocaleString("es-CO")}</h2>
          </div>

          <hr style="margin-top: 30px;" />
          <p style="font-size: 12px; text-align: center;">
            FACTUFAST © 2026 - Sistema de Facturación
          </p>
        </div>
      `;

      document.body.appendChild(tempDiv);

      // Generar PDF
      const input = tempDiv.querySelector('div');
      html2canvas(input, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }

        pdf.save(`factura-${id_factura}.pdf`);
        document.body.removeChild(tempDiv);
      }).catch(err => {
        console.error('Error generando PDF:', err);
        alert('Error al descargar la factura');
        document.body.removeChild(tempDiv);
      });
    } catch (error) {
      console.error('Error descargando factura:', error);
      alert('Error al descargar la factura');
    }
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
              {["# Factura", "Fecha", "Estado", "Acciones"].map(h => (
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
                <td style={{...tdStyle, display: "flex", gap: "8px", justifyContent: "center"}}>
                  <button
                    onClick={() => navigate(`/cliente/factura/${f.id_factura}`)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#8A7700",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "13px"
                    }}>
                    Ver detalle
                  </button>
                  <button
                    onClick={() => descargarFactura(f.id_factura)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#4caf50",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "13px"
                    }}>
                    📥 Descargar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <a
        href={`https://wa.me/${numeroWhatsApp}?text=${mensajeWhatsApp}`}
        target="_blank"
        rel="noreferrer"
        className="whatsapp-help-button"
        aria-label="Solicitar ayuda por WhatsApp"
      >
        <span className="whatsapp-help-icon">✆</span>
        <span className="whatsapp-help-text">Ayuda</span>
      </a>
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