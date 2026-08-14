import { Navigate } from 'react-router-dom';
import { getUsuarioSesion } from '../utils/session';

function PrivateRoute({ children, rolPermitido }) {
  const usuario = getUsuarioSesion();

  if (!usuario) return <Navigate to="/login" replace />;

  if (rolPermitido && usuario.rol !== rolPermitido) {
    return <Navigate to="/sin-permiso" replace />;
  }

  return children;
}

export default PrivateRoute;