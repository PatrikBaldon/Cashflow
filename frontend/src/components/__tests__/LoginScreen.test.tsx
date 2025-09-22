import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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
    expect(screen.getByText('Accedi al sistema')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nome utente')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Accedi' })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<LoginScreen />);
    
    const loginButton = screen.getByRole('button', { name: 'Accedi' });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('Nome utente richiesto')).toBeInTheDocument();
      expect(screen.getByText('Password richiesta')).toBeInTheDocument();
    });
  });

  it('calls login API with correct credentials', async () => {
    mockElectronAPI.auth.login.mockResolvedValue({
      success: true,
      user: { id: '1', username: 'test', role: 'admin' }
    });

    render(<LoginScreen />);
    
    const usernameInput = screen.getByPlaceholderText('Nome utente');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: 'Accedi' });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(mockElectronAPI.auth.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'testpass'
      });
    });
  });

  it('shows error message on login failure', async () => {
    mockElectronAPI.auth.login.mockResolvedValue({
      success: false,
      error: 'Credenziali non valide'
    });

    render(<LoginScreen />);
    
    const usernameInput = screen.getByPlaceholderText('Nome utente');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: 'Accedi' });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('Credenziali non valide')).toBeInTheDocument();
    });
  });
});
