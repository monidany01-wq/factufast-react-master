/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import './Listados.css';

function FacturaAnular() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [factura, setFactura] = useState(null);
  const [detalle, setDetalle] = useState([]);

  const cargarFactura = useCallback(() => {
    fetch(`http://localhost/factufast-api/facturas/detalle.php?id=${id}`)
      .then(res => res.json())
      .then(data => {
        setFactura(data.factura || {});
        setDetalle(data.detalle || []);
      })
      .catch(() => {
        alert("Error cargando factura");
      });
  }, [id]);

  useEffect(() => {
    cargarFactura();
  }, [cargarFactura]);

  const subtotal = detalle.reduce(
    (acc, item) => acc + (Number(item.precio_unitario || 0) * Number(item.cantidad || 0)),
    0
  );

  const iva = detalle.reduce(
    (acc, item) => acc + (Number(item.precio_unitario || 0) * Number(item.cantidad || 0) * Number(item.iva || 0)),
    0
  );

  const total = subtotal + iva;

  const cerrarVentana = () => {
    if (window.opener) {
      try {
        window.opener.location.reload();
      } catch (error) {
        console.error("No se pudo recargar la ventana principal", error);
      }
    }

    setTimeout(() => {
      if (window.opener) {
        window.close();
        return;
      }

      navigate("/facturas");
    }, 800);
  };

  const anularFactura = async () => {
    if (factura.estado === "ANULADA") {
      alert("Esta factura ya está anulada");
      return;
    }

    const confirmar = window.confirm("¿Seguro que deseas anular esta factura?");
    if (!confirmar) return;

    try {
      const res = await fetch(`http://localhost/factufast-api/facturas/anular.php?id=${id}`);
      const data = await res.json();

      if (data.success) {
        setFactura({ ...factura, estado: "ANULADA" });
        alert(data.mensaje || "Factura anulada correctamente");
        cerrarVentana();
      } else {
        alert(data.error || "No se pudo anular");
      }

    } catch (error) {
      console.error(error);
      alert("Error al anular factura");
    }
  };

  if (!factura) {
    return (
      <div style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, Helvetica, sans-serif"
      }}>
        <p>Cargando factura...</p>
      </div>
    );
  }

  return (
    <div className="gerente-container">

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "16px",
        marginBottom: "22px"
      }}>
        <div>
          <h2 style={{ marginBottom: "8px" }}>
            Anular factura #{factura.id_factura}
          </h2>
          <p>
            Revisa el detalle antes de confirmar la anulación. Esta acción devolverá los productos al inventario.
          </p>
        </div>

        <span style={{
          display: "inline-block",
          padding: "8px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "bold",
          color: factura.estado === "ANULADA" ? "#991b1b" : "#166534",
          background: factura.estado === "ANULADA" ? "#fee2e2" : "#dcfce7",
          border: factura.estado === "ANULADA" ? "1px solid #fecaca" : "1px solid #bbf7d0"
        }}>
          {factura.estado || "ACTIVA"}
        </span>
      </div>

      <div className="info-box">
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px"
        }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#64748b" }}>
              Cliente
            </p>
            <strong>{factura.nombre_cliente || "No registrado"}</strong>
          </div>

          <div>
            <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#64748b" }}>
              Factura
            </p>
            <strong>#{factura.id_factura}</strong>
          </div>

          <div>
            <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#64748b" }}>
              Estado
            </p>
            <strong>{factura.estado || "ACTIVA"}</strong>
          </div>
        </div>
      </div>

      <h3>Detalle de productos</h3>

      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio unitario</th>
            <th>Subtotal</th>
          </tr>
        </thead>

        <tbody>
          {detalle.length > 0 ? (
            detalle.map((item, i) => (
              <tr key={i}>
                <td>{item.nombre_producto}</td>
                <td>{item.cantidad}</td>
                <td>${Number(item.precio_unitario || 0).toLocaleString("es-CO")}</td>
                <td>${Number(item.subtotal || 0).toLocaleString("es-CO")}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No hay productos</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        marginTop: "18px"
      }}>
        <div style={{
          width: "100%",
          maxWidth: "320px",
          background: "#ffffff",
          border: "1px solid rgba(15, 23, 42, 0.08)",
          borderRadius: "8px",
          padding: "18px",
          boxShadow: "0 8px 18px rgba(15, 23, 42, 0.08)"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
            color: "#475569"
          }}>
            <span>Subtotal</span>
            <strong>${subtotal.toLocaleString("es-CO")}</strong>
          </div>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "12px",
            color: "#475569"
          }}>
            <span>IVA</span>
            <strong>${iva.toLocaleString("es-CO")}</strong>
          </div>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(15, 23, 42, 0.12)",
            paddingTop: "12px",
            fontSize: "18px",
            color: "#111827"
          }}>
            <span>Total</span>
            <strong>${total.toLocaleString("es-CO")}</strong>
          </div>
        </div>
      </div>

      <div style={{
        display: "flex",
        gap: "10px",
        justifyContent: "flex-end",
        marginTop: "22px",
        flexWrap: "wrap"
      }}>
        <button
          type="button"
          onClick={() => navigate("/facturas")}
          className="boton-secundario"
        >
          Volver
        </button>

        {factura.estado !== "ANULADA" ? (
          <button
            type="button"
            onClick={anularFactura}
            className="btn-danger"
          >
            Anular factura
          </button>
        ) : (
          <span style={{
            color: "#991b1b",
            background: "#fee2e2",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            padding: "9px 12px",
            fontWeight: "bold",
            fontSize: "13px"
          }}>
            Esta factura ya fue anulada
          </span>
        )}
      </div>

    </div>
  );
}

export default FacturaAnular;