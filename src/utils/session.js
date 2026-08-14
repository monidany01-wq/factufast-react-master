export function getUsuarioSesion() {
  try {
    const raw = sessionStorage.getItem('usuario');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

export function setUsuarioSesion(usuario) {
  sessionStorage.setItem('usuario', JSON.stringify(usuario));
}

export function clearUsuarioSesion() {
  sessionStorage.removeItem('usuario');
  localStorage.removeItem('usuario');
}

export function getClienteSesion() {
  return {
    nit: sessionStorage.getItem('cliente_nit'),
    nombre: sessionStorage.getItem('cliente_nombre'),
    id: sessionStorage.getItem('cliente_id'),
  };
}

export function setClienteSesion({ nit, nombre, id }) {
  if (nit) sessionStorage.setItem('cliente_nit', nit);
  if (nombre) sessionStorage.setItem('cliente_nombre', nombre);
  if (id) sessionStorage.setItem('cliente_id', id);
}

export function clearClienteSesion() {
  sessionStorage.removeItem('cliente_nit');
  sessionStorage.removeItem('cliente_nombre');
  sessionStorage.removeItem('cliente_id');
  localStorage.removeItem('cliente_nit');
  localStorage.removeItem('cliente_nombre');
  localStorage.removeItem('cliente_id');
}
