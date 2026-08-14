/* eslint-disable no-unused-vars */
import './FacturaVista.css';

import React, {
  useEffect,
  useState,
} from 'react';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QRCodeCanvas } from 'qrcode.react';
import { useParams } from 'react-router-dom';

import logo from '../assets/logo.png';
import { getAppBaseUrl } from '../utils/publicUrl';

function FacturaVista() {

  const { id } = useParams();

  const [factura, setFactura] = useState(null);
  const [detalle, setDetalle] = useState([]);

  const numeroFactura = `FAC-${String(id).padStart(4, "0")}`;
  const baseUrl = getAppBaseUrl();
  const facturaUrl = `${baseUrl}/factura/${id}`;

  useEffect(() => {

    fetch(`http://127.0.0.1/factufast-api/facturas/factura.php?id=${id}`)
      .then(res => res.json())
      .then(data => setFactura(data))
      .catch(err => {
        console.error(err);
        alert("Error cargando factura");
      });

    fetch(`http://127.0.0.1/factufast-api/facturas/detalle.php?id=${id}`)
      .then(res => res.json())
      .then(data => setDetalle(data.detalle || []))
      .catch(err => {
        console.error(err);
        alert("Error cargando detalle");
      });

  }, [id]);

  const imprimir = () => window.print();

  const descargarPDF = () => {
    const input = document.getElementById("factura");
    const botones = document.querySelector(".botones");
    const botonesDisplay = botones ? botones.style.display : null;

    if (botones) {
      botones.style.display = "none";
    }

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

      pdf.save(`factura-${id}.pdf`);
    }).finally(() => {
      if (botones) {
        botones.style.display = botonesDisplay || "flex";
      }
    });
  };

  // 🔥 ENVIAR POR WHATSAPP
  const enviarWhatsApp = () => {
    const telefono = (factura.telefono_cliente || factura.celular_cliente || "").replace(/\D/g, "");
    const mensaje = encodeURIComponent(`Hola ${factura.nombre_cliente || "cliente"}, te comparto la factura ${numeroFactura}.\n\nPuedes verla aquí: ${facturaUrl}\n\nGracias por tu compra.`);

    const baseUrlWhatsApp = telefono
      ? `https://api.whatsapp.com/send?phone=${telefono}&text=${mensaje}`
      : `https://api.whatsapp.com/send?text=${mensaje}`;

    window.open(baseUrlWhatsApp, "_blank");
  };

  if (!factura) {
    return <h2>Cargando factura... (ID: {id})</h2>;
  }

  const getPrecio = (item) =>
    Number(item.precio_unitario || item.precio_venta || item.precio || 0);

  const subtotal = detalle.reduce(
    (acc, item) => acc + (getPrecio(item) * Number(item.cantidad)),
    0
  );

  const iva = subtotal * 0.19;
  const total = subtotal + iva;

  return (
    <div id="factura" className="factura-container">

      {/* HEADER */}
      <div className="factura-header">

        <div style={{ display: "flex", gap: "10px" }}>
          <img src={logo} alt="logo" style={{ width: "70px" }} />

          <div>
            <h2 style={{ margin: 0 }}>FACTUFAST</h2>
            <p style={{ margin: 0 }}>NIT: 123456789-0</p>
            <p style={{ margin: 0 }}>Tel: 3024698432</p>
            <p style={{ margin: 0 }}>Maicao - La Guajira</p>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <h3>{numeroFactura}</h3>
          <p>{factura.fecha_emision}</p>
        </div>

      </div>

      <p style={{ fontSize: "12px" }}>
        Resolución XXX No. 123456789
        Rango autorizado: 0001 - 5000
      </p>

      {/* CLIENTE */}
      <div className="factura-info">

  <p>
    <b>Cliente:</b> {factura.nombre_cliente}
  </p>

  <p>
    <b>Documento:</b> {factura.nit_cliente}
  </p>

  <p>
    <b>Atendido por:</b> {factura.nombre_usuario}
  </p>

  {factura.correo_cliente && (
    <p>
      <b>Correo:</b> {factura.correo_cliente}
    </p>
  )}

</div>

      <hr />

      {/* TABLA */}
      <table className="tabla-detalle">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Subtotal</th>
          </tr>
        </thead>

        <tbody>
          {detalle.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No hay productos
              </td>
            </tr>
          ) : (
            detalle.map((item, index) => {
              const precio = getPrecio(item);
              return (
                <tr key={index}>
                  <td>{item.nombre_producto}</td>
                  <td>{item.cantidad}</td>
                  <td>${precio.toLocaleString("es-CO")}</td>
                  <td>${(precio * item.cantidad).toLocaleString("es-CO")}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* TOTALES */}
      <div style={{ marginTop: "20px", textAlign: "right" }}>
        <h3>Subtotal: ${subtotal.toLocaleString("es-CO")}</h3>
        <h3>IVA (19%): ${iva.toLocaleString("es-CO")}</h3>
        <h2>Total: ${total.toLocaleString("es-CO")}</h2>
      </div>

      {/* QR */}
      <div style={{
        marginTop: "30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <p><b>Gracias por su compra</b></p>
          <p>FACTUFAST</p>
        </div>

        <QRCodeCanvas
          value={facturaUrl}
          size={100}
        />
      </div>

      {/* FIRMA */}
      <div style={{ marginTop: "40px" }}>
        <p>_________</p>
        <p>Firma autorizada</p>
      </div>

      {/* FOOTER */}
      <hr />
      <p style={{ fontSize: "12px", textAlign: "center" }}>
        FACTUFAST © 2026 - Sistema de Facturación
        <br />
        Luz Mery Julio - Monica Medina
      </p>

      {/* BOTONES */}
      <div className="botones" style={{ marginTop: "20px", display: "flex", gap: "10px", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={imprimir}>🖨️ Imprimir</button>
          <button onClick={descargarPDF}>📄 Descargar PDF</button>
          <button onClick={enviarWhatsApp}>
            📲 Enviar por WhatsApp
          </button>
        </div>
        <p style={{ fontSize: "12px", color: "#555", margin: 0 }}>
          WhatsApp abrirá el chat con un mensaje. Si quieres enviar el PDF, primero descárgalo y adjúntalo manualmente.
        </p>
      </div>

    </div>
  );
}

export default FacturaVista;
