'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.username || !formData.password) {
    setError('Por favor completa todos los campos');
    return;
  }

  setLoading(true);

  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: formData.username,
        password: formData.password
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Éxito
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      router.push('/truco');
    } else {
      // Error del servidor
      setError(data.error || 'Usuario o contraseña incorrectos');
    }
  } catch (err) {
    // Error de conexión
    console.error('Error en login:', err);
    setError('Error de conexión. Verifica que el servidor esté activo en http://localhost:3001');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className={styles.container}>
      <div className={`${styles.card} animate-slideUp`}>
        <button 
          onClick={() => router.push('/inicio')}
          className={styles.btnBack}
        >
          ← Volver
        </button>

        <div className={styles.header}>
          <div className={styles.icon}>🔑</div>
          <h2 className={styles.title}>Iniciar Sesión</h2>
          <p className={styles.subtitle}>Ingresa tus datos</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Usuario</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Tu nombre de usuario"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Tu contraseña"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className={styles.error}>
              <span className={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={styles.btnSubmit}
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                Ingresando...
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>¿No tenes cuenta?</p>
          <button 
            onClick={() => router.push('/registro')}
            className={styles.btnLink}
          >
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
}