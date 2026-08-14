import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  localStorage.clear();
  window.history.pushState({}, '', '/login');
});

test('renderiza la aplicación sin errores', () => {
  render(<App />);
});

test('no debe permitir acceso si solo existe la sesión vieja en localStorage', () => {
  localStorage.setItem('usuario', JSON.stringify({ rol: 'Administrador' }));
  sessionStorage.clear();
  window.history.pushState({}, '', '/admin');

  render(<App />);

  expect(screen.getByText(/Iniciar Sesión/i)).toBeInTheDocument();
});

test('el rol administrador no muestra el módulo de usuarios', () => {
  sessionStorage.setItem('usuario', JSON.stringify({ rol: 'Administrador' }));
  localStorage.clear();
  window.history.pushState({}, '', '/admin');

  render(<App />);

  expect(screen.queryByRole('link', { name: /usuarios/i })).not.toBeInTheDocument();
});
