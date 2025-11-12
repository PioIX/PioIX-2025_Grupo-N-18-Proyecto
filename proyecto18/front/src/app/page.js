'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [view, setView] = useState('home'); // home, login, register
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '', 
    email: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Conectar con tu backend
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Guardar token o sesión
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/Truco');
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (err) {
      // Simulación temporal (eliminar cuando tengas backend)
      console.log('Modo simulación - Login exitoso');
      localStorage.setItem('user', JSON.stringify({ username: formData.username }));
      router.push('/Truco');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!formData.username || !formData.password || !formData.email) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      // TODO: Conectar con tu backend
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/Truco');
      } else {
        setError('Error al crear la cuenta. El usuario ya existe.');
      }
    } catch (err) {
      // Simulación temporal
      console.log('Modo simulación - Registro exitoso');
      localStorage.setItem('user', JSON.stringify({ username: formData.username }));
      router.push('/Truco');
    } finally {
      setLoading(false);
    }
  };

  // ============ VISTA HOME ============
  if (view === 'home') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.icon}>🏆</div>
            <h1 className={styles.title}>Truco Argentino</h1>
            <p className={styles.subtitle}>El juego de cartas más popular de Argentina</p>
          </div>

          <div className={styles.buttons}>
            <button 
              onClick={() => setView('login')}
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              <span className={styles.btnIcon}>🔑</span>
              Iniciar Sesión
            </button>

            <button 
              onClick={() => setView('register')}
              className={`${styles.btn} ${styles.btnSuccess}`}
            >
              <span className={styles.btnIcon}>✨</span>
              Registrarse
            </button>
          </div>

          <div className={styles.info}>
            <p>🎮 Juega vs IA o 1vs1</p>
            <p>🏆 Primer jugador en llegar a 15 puntos gana</p>
          </div>
        </div>
      </div>
    );
  }

  // ============ VISTA LOGIN ============
  if (view === 'login') {
    return (
      <div className={`${styles.container} ${styles.containerBlue}`}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.icon}>👤</div>
            <h2 className={styles.title}>Iniciar Sesión</h2>
            <p className={styles.subtitle}>Ingresa tus credenciales</p>
          </div>

          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Usuario</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className={styles.input}
                placeholder="Tu nombre de usuario"
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className={styles.input}
                placeholder="Tu contraseña"
                disabled={loading}
              />
            </div>

            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </div>

          <button
            onClick={() => setView('home')}
            className={styles.btnBack}
            disabled={loading}
          >
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  // ============ VISTA REGISTRO ============
  if (view === 'register') {
    return (
      <div className={`${styles.container} ${styles.containerGreen}`}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.icon}>✨</div>
            <h2 className={styles.title}>Crear Cuenta</h2>
            <p className={styles.subtitle}>Únete y comienza a jugar</p>
          </div>

          <div className={styles.form}>
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
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                className={styles.input}
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
              />
            </div>

            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            <button
              onClick={handleRegister}
              disabled={loading}
              className={`${styles.btn} ${styles.btnSuccess} ${styles.btnFull}`}
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </div>

          <button
            onClick={() => setView('home')}
            className={styles.btnBack}
            disabled={loading}
          >
            ← Volver
          </button>
        </div>
      </div>
    );
  }
}