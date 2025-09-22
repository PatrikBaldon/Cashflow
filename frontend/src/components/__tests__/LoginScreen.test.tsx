import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginScreen from '../LoginScreen';

// Mock del window.electronAPI
const mockElectronAPI = {
  auth: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
};

// Mock globale
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

describe('LoginScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(<LoginScreen />);
    
    expect(screen.getByText('Registro Contanti')).toBeInTheDocument();
    expect(screen.getByText('Future Dance School')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Inserisci il tuo nome')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Inserisci la password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Accedi' })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<LoginScreen />);
    
    const loginButton = screen.getByRole('button', { name: 'Accedi' });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('Nome operatore richiesto')).toBeInTheDocument();
      expect(screen.getByText('Password richiesta')).toBeInTheDocument();
    });
  });

  it('calls login API with correct credentials', async () => {
    mockElectronAPI.auth.login.mockResolvedValue({
      success: true,
      user: { id: '1', username: 'test', role: 'admin' }
    });

    render(<LoginScreen />);
    
    const usernameInput = screen.getByPlaceholderText('Inserisci il tuo nome');
    const passwordInput = screen.getByPlaceholderText('Inserisci la password');
    const loginButton = screen.getByRole('button', { name: 'Accedi' });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(mockElectronAPI.auth.login).toHaveBeenCalledWith({
        name: 'testuser',
        password: 'testpass'
      });
    });
  });

  it('calls login API on form submission', async () => {
    mockElectronAPI.auth.login.mockResolvedValue({
      success: false,
      error: 'Credenziali non valide'
    });

    render(<LoginScreen />);
    
    const usernameInput = screen.getByPlaceholderText('Inserisci il tuo nome');
    const passwordInput = screen.getByPlaceholderText('Inserisci la password');
    const loginButton = screen.getByRole('button', { name: 'Accedi' });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(mockElectronAPI.auth.login).toHaveBeenCalledWith({
        name: 'testuser',
        password: 'wrongpass'
      });
    });
  });
});
