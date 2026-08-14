/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useEffect, useMemo, useState } from 'react';
import './Facturas.css';

function Facturas() {

  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productosVenta, setProductosVenta] = useState([]);
  const [cliente, setCliente] = useState('');
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [clienteData, setClienteData] = useState(null);
  const [usuarioSesion, setUsuarioSesion] = useState({ id: null, nombre: '' });
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const usuario = JSON.parse(sessionStorage.getItem('usuario') || '{}');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    cargarDatosIniciales();

    setUsuarioSesion({
      id: usuario.id || usuario.id_usuario || null,
      nombre: usuario.nombre || usuario.nombre_usuario || '',
    });
  }, []);

  const cargarDatosIniciales = async () => {
    setCargando(true);

    try {
      await Promise.all([cargarProductos(), cargarClientes()]);
    } catch (error) {
      console.error(error);
      alert('Error cargando datos de facturacion');
    } finally {
      setCargando(false);
    }
  };

  const cargarProductos = async () => {
    const res = await fetch('http://localhost/factufast-api/inventario/listar.php');
    const data = await res.json();
    setProductos(Array.isArray(data.inventario) ? data.inventario : []);
  };

  const cargarClientes = async () => {
    const res = await fetch('http://localhost/factufast-api/clientes/listar.php');
    const data = await res.json();
    setClientes(Array.isArray(data) ? data : []);
  };

  const formato = (num) => Number(num || 0).toLocaleString('es-CO');

  const normalizarIva = (iva) => {
    const valor = Number(iva || 0);
    if (Number.isNaN(valor) || valor <= 0) {
      return 0.19;
    }
    return valor > 1 ? valor / 100 : valor;
  };

  const validarIvaProducto = (iva) => {
    const ivaNormalizado = normalizarIva(iva);
    return !Number.isNaN(ivaNormalizado) && ivaNormalizado > 0 && ivaNormalizado <= 1;
  };

  const productosDisponibles = productos.filter((p) => Number(p.stock || 0) > 0);
  const clientesFiltrados = clientes.filter((c) =>
  String(c.nombre_cliente || '')
    .toLowerCase()
    .includes(busquedaCliente.toLowerCase())
);
  const agregarProducto = (id) => {
    if (!id) return;

    const prod = productos.find((p) => String(p.id_productos) === String(id));

    if (!prod) return;

    if (!validarIvaProducto(prod.iva)) {
      alert('IVA inválido para este producto');
      return;
    }

    if (Number(prod.stock || 0) <= 0) {
      alert('Producto sin stock');
      return;
    }

    const existe = productosVenta.find((p) => String(p.id_productos) === String(id));

    if (existe) {
      alert('Producto ya agregado');
      return;
    }

    const precio = Number(prod.precio_venta || prod.precio_salida || 0);
    const precioCompra = Number(prod.precio_compra || prod.precio_entrada || 0);

    setProductosVenta([
      ...productosVenta,
      {
        id_productos: prod.id_productos,
        nombre_producto: prod.nombre_producto,
        precio,
        precio_compra: precioCompra,
        precio_entrada: precioCompra,
        precio_venta: precio,
        iva: normalizarIva(prod.iva),
        stock: Number(prod.stock || 0),
        cantidad: 1,
        subtotal: precio,
      },
    ]);
  };

  const cambiarCantidad = (id, cantidad) => {
    const nuevaCantidad = Number(cantidad || 1);

    setProductosVenta(
      productosVenta.map((p) => {
        if (String(p.id_productos) !== String(id)) return p;

        if (nuevaCantidad <= 0) {
          return { ...p, cantidad: 1, subtotal: p.precio };
        }

        if (nuevaCantidad > p.stock) {
          alert('Stock insuficiente');
          return p;
        }

        return {
          ...p,
          cantidad: nuevaCantidad,
          subtotal: nuevaCantidad * p.precio,
        };
      })
    );
  };

  const eliminarProductoVenta = (id) => {
    setProductosVenta(productosVenta.filter((p) => String(p.id_productos) !== String(id)));
  };

  const seleccionarCliente = (id) => {
    setCliente(id);
    setClienteData(clientes.find((c) => String(c.id_cliente) === String(id)) || null);
  };

  const subtotal = useMemo(
    () => productosVenta.reduce((total, p) => total + Number(p.subtotal || 0), 0),
    [productosVenta]
  );

  const ivaTotal = useMemo(
    () =>
      productosVenta.reduce(
        (total, p) => total + Number(p.subtotal || 0) * normalizarIva(p.iva),
        0
      ),
    [productosVenta]
  );

  const total = subtotal + ivaTotal;

  const limpiarFactura = () => {
    setProductosVenta([]);
    setCliente('');
    setClienteData(null);
  };

  const guardarFactura = async () => {
    if (!window.confirm('¿Estás seguro que deseas guardar la factura?')) return;
    if (!usuarioSesion.id) {
      alert('Usuario no valido');
      return;
    }

    if (!cliente) {
      alert('Seleccione cliente');
      return;
    }

    if (productosVenta.length === 0) {
      alert('Agregue productos');
      return;
    }

    const factura = {
      cliente: Number(cliente),
      id_usuario: usuarioSesion.id,
      subtotal,
      iva: ivaTotal,
      total,
      productos: productosVenta.map((p) => ({
        id_producto: p.id_productos,
        cantidad: p.cantidad,
        precio: p.precio,
        precio_compra: p.precio_compra,
        precio_entrada: p.precio_compra,
        precio_venta: p.precio,
        iva: p.iva,
        subtotal: p.subtotal,
      })),
    };

    setGuardando(true);

    try {
      const res = await fetch('http://localhost/factufast-api/facturas/guardar.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(factura),
      });

      const data = await res.json();

      if (data.success) {
        limpiarFactura();
        window.open(`${window.location.origin}/factura/${data.id_factura}`, '_blank');
      } else {
        alert(data.error || 'Error guardando factura');
      }
    } catch (error) {
      console.error(error);
      alert('Error conectando con el servidor');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="facturas-page">
      <h2>Facturación</h2>
      <p>Generar nueva factura</p>

      {cargando ? (
        <p>Cargando datos...</p>
      ) : (
        <>
          <div className="factura-card">
            <h3>Cliente</h3>

            <input
  type="text"
  placeholder="Buscar cliente..."
  value={busquedaCliente}
  onChange={(e) => {
    setBusquedaCliente(e.target.value);
  }}
/>

{busquedaCliente && (
  <div
    style={{
      maxHeight: "200px",
      overflowY: "auto",
      border: "1px solid #ccc",
      background: "#fff"
    }}
  >
    {clientesFiltrados.map((c) => (
      <div
        key={c.id_cliente}
        style={{
          padding: "8px",
          cursor: "pointer",
          borderBottom: "1px solid #eee"
        }}
        onClick={() => {
          seleccionarCliente(c.id_cliente);
          setBusquedaCliente(c.nombre_cliente);
        }}
      >
        {c.nombre_cliente}
      </div>
    ))}
  </div>
)}

            {clienteData && (
              <div className="factura-grid" style={{ gap: '16px' }}>
                <div>
                  <strong>Documento</strong>
                  <p>{clienteData.nit_cliente || 'No registrado'}</p>
                </div>
                <div>
                  <strong>Teléfono</strong>
                  <p>{clienteData.telefono_cliente || 'No registrado'}</p>
                </div>
              </div>
            )}
          </div>

          <div className="factura-card">
            <h3>Agregar producto</h3>

            <select className="producto-select" value="" onChange={(e) => agregarProducto(e.target.value)}>
              <option value="">Seleccione producto</option>
              {productosDisponibles.map((p, index) => (
                <option
                  key={p.id_productos}
                  value={p.id_productos}
                  style={{
                    backgroundColor: index % 2 === 0 ? '#f8fafc' : '#ffffff',
                    color: '#111827',
                  }}
                  title={`Precio: $${formato(p.precio_venta)} • Stock: ${p.stock}`}
                >
                  {p.nombre_producto}
                </option>
              ))}
            </select>

            {productosDisponibles.length === 0 && (
              <p style={{ color: '#b71c1c', fontWeight: 600 }}>
                No hay productos disponibles en stock.
              </p>
            )}
          </div>

          <div className="factura-card">
            <h3>Productos agregados</h3>
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio unitario</th>
                  <th>Cantidad</th>
                  <th>IVA</th>
                  <th>Subtotal</th>
                  <th>Accion</th>
                </tr>
              </thead>

              <tbody>
                {productosVenta.length ? (
                  productosVenta.map((p) => (
                    <tr key={p.id_productos}>
                      <td>{p.nombre_producto}</td>
                      <td>${formato(p.precio)}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          max={p.stock}
                          value={p.cantidad}
                          onChange={(e) => cambiarCantidad(p.id_productos, e.target.value)}
                        />
                      </td>
                      <td>${formato(p.subtotal * p.iva)}</td>
                      <td>${formato(p.subtotal)}</td>
                      <td>
                        <button type="button" onClick={() => eliminarProductoVenta(p.id_productos)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No hay productos agregados</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="factura-totales">
            <h4>Subtotal</h4>
            <p>${formato(subtotal)}</p>
            <h4>IVA</h4>
            <p>${formato(ivaTotal)}</p>
            <h3>Total</h3>
            <p>${formato(total)}</p>
          </div>

          <div className="factura-actions" style={{ marginTop: '20px' }}>
            <button
              type="button"
              className="btn-registrar btn-large"
              onClick={guardarFactura}
              disabled={guardando}
            >
              {guardando ? 'Generando factura...' : 'Generar factura'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Facturas;