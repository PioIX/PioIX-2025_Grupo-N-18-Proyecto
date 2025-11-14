'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function RegistroPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (formData.username.length < 3) {
      setError('El usuario debe tener al menos 3 caracteres');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email inválido');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        router.push('/truco');
      } else {
        setError(data.error || 'Error al crear la cuenta');
      }
    } catch (err) {
      console.error('Error en registro:', err);
      setError('Error de conexión. Verifica que el servidor esté activo.');
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
          <div className={styles.icon}>✨</div>
          <h2 className={styles.title}>Crear Cuenta</h2>
          <p className={styles.subtitle}>Unite y comenza a jugar</p>
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
              placeholder="Elige un nombre de usuario"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="tu@email.com"
              disabled={loading}
              autoComplete="email"
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
              placeholder="Mínimo 6 caracteres"
              disabled={loading}
              autoComplete="new-password"
            />
            <div className={styles.passwordHint}>
              <span className={formData.password.length >= 6 ? styles.checkValid : styles.checkInvalid}>
                {formData.password.length >= 6 ? '✓' : '○'}
              </span>
              <span>Al menos 6 caracteres</span>
            </div>
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
                Creando cuenta...
              </>
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>¿Ya tenes cuenta?</p>
          <button 
            onClick={() => router.push('/login')}
            className={styles.btnLink}
          >
            Inicia sesión aquí
          </button>
        </div>
      </div>
    </div>
  );
}