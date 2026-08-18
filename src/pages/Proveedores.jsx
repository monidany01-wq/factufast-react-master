import React, { useEffect, useState } from 'react';
import './Listados.css';

function Proveedores() {
  const [proveedores, setProveedores] = useState([]);

  const [nit, setNit] = useState('');
  const [nombre, setNombre] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [direccion, setDireccion] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');

  const ciudadesColombia = [
    'Bogotá',
    'Medellín',
    'Cali',
    'Barranquilla',
    'Cartagena',
    'Bucaramanga',
    'Pereira',
    'Manizales',
    'Ibagué',
    'Cúcuta',
    'Santa Marta',
    'Neiva',
    'Sincelejo',
    'Montería',
    'Pasto',
    'Armenia',
    'Villavicencio',
    'Tunja',
    'Popayán'
  ];

  const [editando, setEditando] = useState(false);
  const [idProveedor, setIdProveedor] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    obtenerProveedores();
  }, []);

  const obtenerProveedores = () => {
    setCargando(true);

    fetch('http://localhost/factufast-api/proveedores/listar.php')
      .then((res) => res.json())
      .then((data) => setProveedores(Array.isArray(data) ? data : []))
      .catch(() => alert('Error cargando proveedores'))
      .finally(() => setCargando(false));
  };

  const validarFormulario = () => {
    if (!nit || !nombre || !ciudad || !direccion || !correo || !telefono) {
      alert('Todos los campos son obligatorios');
      return false;
    }

    if (!correo.includes('@')) {
      alert('Ingrese un correo valido');
      return false;
    }

    // Validar que el NIT no exista en otro proveedor
    const nitExistente = proveedores.find(p => 
      p.NIT === nit.trim() && 
      p.id_proveedor !== idProveedor // Permitir el mismo NIT si se está editando el mismo proveedor
    );
    if(nitExistente) {
      alert('Este número de NIT ya existe en otro proveedor.');
      return false;
    }

    return true;
  };

  const datosProveedor = () => ({
    NIT: nit,
    nombre_proveedor: nombre,
    ciudad_proveedor: ciudad,
    direccion_proveedor: direccion,
    correo_proveedor: correo,
    telefono_proveedor: telefono,
  });

  const registrarProveedor = (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    if (!window.confirm('¿Estás seguro que deseas registrar este proveedor?')) return;

    fetch('http://localhost/factufast-api/proveedores/guardar.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosProveedor()),
    })
      .then((res) => res.json())
      .then((data) => {
        if(data.error){
          alert(data.error);
        } else if(data.success){
          obtenerProveedores();
          limpiarFormulario();
          alert('Proveedor registrado');
        }
      })
      .catch(() => alert('Error conectando con el servidor'));
  };

  const eliminarProveedor = (id) => {

  const proveedor = proveedores.find(
    p => p.id_proveedor === id
  );

  if(proveedor?.nombre_proveedor === "PROVEEDOR GENERAL"){
    alert("No se puede eliminar el Proveedor General");
    return;
  }

  if (!window.confirm('¿Eliminar proveedor?')) return;

  fetch(`http://localhost/factufast-api/proveedores/eliminar.php?id=${id}`)
    .then((res) => res.json())
    .then((data) => {
      if(data.error){
        alert(data.error);
      } else if(data.success){
        obtenerProveedores();
        alert('Proveedor eliminado correctamente');
      }
    })
    .catch(() => alert('Error eliminando proveedor'));
};

  const cambiarEstadoProveedor = (prov) => {
    if(prov.nombre_proveedor === "PROVEEDOR GENERAL"){
      alert("No se puede cambiar estado del Proveedor General");
      return;
    }

    const nuevoEstado = (prov.estado || "activo") === "activo" ? "inactivo" : "activo";
    
    if (!window.confirm(`¿Cambiar estado a ${nuevoEstado}?`)) return;

    fetch("http://localhost/factufast-api/proveedores/cambiar-estado.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id_proveedor: prov.id_proveedor,
        estado: nuevoEstado
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        obtenerProveedores();
      } else {
        alert(data.error || "Error cambiando estado");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Error cambiando estado del proveedor");
    });
  };

  const editarProveedor = (prov) => {

  if(prov.nombre_proveedor === "PROVEEDOR GENERAL"){
    alert("No se puede editar el Proveedor General");
    return;
  }

  setEditando(true);
  setIdProveedor(prov.id_proveedor);
  setNit(prov.NIT || '');
  setNombre(prov.nombre_proveedor || '');
  setCiudad(prov.ciudad_proveedor || '');
  setDireccion(prov.direccion_proveedor || '');
  setCorreo(prov.correo_proveedor || '');
  setTelefono(prov.telefono_proveedor || '');
};

  const actualizarProveedor = (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    if (!window.confirm('¿Estás seguro que deseas actualizar este proveedor?')) return;

    fetch('http://localhost/factufast-api/proveedores/actualizar.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_proveedor: idProveedor,
        ...datosProveedor(),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if(data.error){
          alert(data.error);
        } else if(data.success){
          obtenerProveedores();
          limpiarFormulario();
          alert('Proveedor actualizado');
        }
      })
      .catch(() => alert('Error actualizando proveedor'));
  };

  const limpiarFormulario = () => {
    setNit('');
    setNombre('');
    setCiudad('');
    setDireccion('');
    setCorreo('');
    setTelefono('');
    setEditando(false);
    setIdProveedor(null);
  };

  const textoBusqueda = busqueda.toLowerCase();

  const proveedoresFiltrados = proveedores.filter(
    (prov) =>
      String(prov.nombre_proveedor || '').toLowerCase().includes(textoBusqueda) ||
      String(prov.NIT || '').toLowerCase().includes(textoBusqueda) ||
      String(prov.ciudad_proveedor || '').toLowerCase().includes(textoBusqueda)
  );

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
        <div>
          <h2>Proveedores</h2>
          <p>Gestiona los datos de contacto y ubicación de tus proveedores.</p>
        </div>
      </div>

      <form onSubmit={editando ? actualizarProveedor : registrarProveedor}>
        <h3>{editando ? 'Editar proveedor' : 'Registrar proveedor'}</h3>

        <input
  placeholder="NIT *"
  value={nit}
  onChange={(e) => setNit(e.target.value.replace(/\D/g, ''))}
  required
/>

        <input
          placeholder="Nombre proveedor *"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <select
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          required
        >
          <option value="">Ciudad *</option>
          {ciudadesColombia.map((ciudadItem) => (
            <option key={ciudadItem} value={ciudadItem}>
              {ciudadItem}
            </option>
          ))}
        </select>

        <input
          placeholder="Dirección *"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Correo *"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />

       <input
  placeholder="Teléfono *"
  value={telefono}
  onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
  required
/>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
          <button type="submit" className="btn-registrar btn-large">{editando ? 'Actualizar' : 'Registrar'}</button>
          {editando && (
            <button type="button" className="boton-secundario" onClick={limpiarFormulario}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <input
  placeholder="Buscar proveedor por nombre, NIT o ciudad"
  value={busqueda}
  onChange={(e)=>setBusqueda(e.target.value)}
  style={{
    width:"300px",
    padding:"8px",
    marginBottom:"15px"
  }}
/>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>NIT</th>
            <th>Nombre</th>
            <th>Ciudad</th>
            <th>Dirección</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {cargando ? (
            <tr>
              <td colSpan="9">Cargando proveedores...</td>
            </tr>
          ) : proveedoresFiltrados.length ? (
            proveedoresFiltrados.map((prov) => (
              <tr key={prov.id_proveedor}>
                <td>{prov.id_proveedor}</td>
                <td>{prov.NIT}</td>
                <td>{prov.nombre_proveedor}</td>
                <td>{prov.ciudad_proveedor}</td>
                <td>{prov.direccion_proveedor}</td>
                <td>{prov.correo_proveedor}</td>
                <td>{prov.telefono_proveedor}</td>
                <td style={{
                  color: (prov.estado || "activo") === "activo" ? "#22c55e" : "#ef4444",
                  fontWeight: "bold"
                }}>
                  {(prov.estado || "activo").toUpperCase()}
                </td>
                <td>

  {prov.nombre_proveedor !== "PROVEEDOR GENERAL" && (
    <>
      <button
        type="button"
        onClick={() => editarProveedor(prov)}
      >
        Editar
      </button>

      <button
        onClick={() => cambiarEstadoProveedor(prov)}
        style={{
          marginLeft: '6px',
          backgroundColor: (prov.estado || "activo") === "activo" ? "#ef4444" : "#22c55e",
          color: "white"
        }}
      >
        {(prov.estado || "activo") === "activo" ? "Desactivar" : "Activar"}
      </button>
    </>
  )}

</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9">No hay proveedores para mostrar</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Proveedores;