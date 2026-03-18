import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Appel à la route de notre backend
      const response = await apiClient.post('/auth/login', { email, password });
      
      // Stockage du token et des infos utilisateur
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      navigate('/dashboard');
    } catch (err) {
      // On gère les erreurs renvoyées par notre API (ex: 400 ou 401)
      setError(err.response?.data?.message || 'Erreur lors de la connexion');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.panel}>
        <h2 style={styles.title}>🌿 Bienvenue sur TaskFlow</h2>
        {error && <p style={styles.errorText}>{error}</p>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <input 
            type="email" 
            placeholder="Votre email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            style={styles.input}
          />
          <input 
            type="password" 
            placeholder="Mot de passe" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            style={styles.input}
          />
          <button type="submit" style={styles.btnPrimary}>Se connecter</button>
        </form>
        <p style={styles.footerText}>
          Pas encore de compte ? <Link to="/register" style={styles.link}>Rejoins la jungle !</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#e8f5e9' },
  panel: { backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', boxSizing: 'border-box' },
  title: { margin: '0 0 20px 0', fontSize: '24px', color: '#2f3542', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '12px', borderRadius: '6px', border: '1px solid #dcdde1', fontSize: '14px', width: '100%', boxSizing: 'border-box', outline: 'none' },
  btnPrimary: { padding: '12px', background: 'linear-gradient(135deg, #1b5e20, #4caf50)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 4px 10px rgba(76, 175, 80, 0.3)' },
  errorText: { color: '#ff4757', fontSize: '14px', marginBottom: '15px', fontWeight: 'bold', textAlign: 'center' },
  footerText: { marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#57606f' },
  link: { color: '#2e7d32', textDecoration: 'none', fontWeight: 'bold' }
};
