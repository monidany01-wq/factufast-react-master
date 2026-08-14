import { Navigate } from 'react-router-dom';

function PrivateRouteCliente({ children }) {
  const cliente = sessionStorage.getItem('cliente_nit');

  if (!cliente) {
    return <Navigate to="/cliente/login" replace />;
  }

  return children;
}

export default PrivateRouteCliente;