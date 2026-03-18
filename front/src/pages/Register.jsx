import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      // Appel à la route de création d'utilisateur
      await apiClient.post('/users', { username, email, password });
      
      setSuccess(true);
      setUsername('');
      setEmail('');
      setPassword('');
      alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.panel}>
        <h2 style={styles.title}>🌿 Rejoindre la Jungle</h2>
        {error && <p style={styles.errorText}>{error}</p>}
        {success && <p style={styles.successText}>Inscription réussie !</p>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <input 
            type="text" 
            placeholder="Nom d'utilisateur" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required 
            style={styles.input}
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            style={styles.input}
          />
          <input 
            type="password" 
            placeholder="Mot de passe (min 6 caractères)" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            style={styles.input}
          />
          <button type="submit" style={styles.btnPrimary}>S'inscrire</button>
        </form>
        <p style={styles.footerText}>
          Déjà un explorateur ? <Link to="/login" style={styles.link}>Se connecter</Link>
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
  successText: { color: '#2ed573', fontSize: '14px', marginBottom: '15px', fontWeight: 'bold', textAlign: 'center' },
  footerText: { marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#57606f' },
  link: { color: '#2e7d32', textDecoration: 'none', fontWeight: 'bold' }
};