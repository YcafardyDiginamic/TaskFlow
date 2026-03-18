import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);

  // État du formulaire de création
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    categoryName: ''
  });

  // États pour les filtres de recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // On récupère les infos de l'utilisateur connecté
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user.id) {
      navigate('/login');
      return;
    }
    const fetchTasks = async () => {
      try {
        const response = await apiClient.get(`/tasks/user/${user.id}`);
        setTasks(response.data);
      } catch (err) {
        setError('Erreur lors du chargement des tâches');
      }
    };
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get(`/categories/user/${user.id}`);
        setCategories(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des catégories', err);
      }
    };

    fetchTasks();
    fetchCategories();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      let finalCategoryId = undefined;

      // Gestion de la catégorie à la volée (recherche ou création)
      if (newTask.categoryName && newTask.categoryName.trim()) {
        const catName = newTask.categoryName.trim();
        const existingCategory = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
        
        if (existingCategory) {
          finalCategoryId = existingCategory.id || existingCategory._id;
        } else {
          // Si elle n'existe pas, on la crée
          const catResponse = await apiClient.post('/categories', { name: catName, userId: user.id });
          finalCategoryId = catResponse.data.id || catResponse.data._id;
          setCategories([...categories, catResponse.data]); // Mise à jour de la liste des catégories
        }
      }

      const payload = { ...newTask };
      delete payload.categoryName;
      if (finalCategoryId) payload.categoryId = finalCategoryId;
      else delete payload.categoryId;
      if (!payload.dueDate) delete payload.dueDate; // Retire si vide

      if (editingTaskId) {
        // Mode Édition
        const response = await apiClient.put(`/tasks/${editingTaskId}`, payload);
        setTasks(tasks.map(t => (t._id === editingTaskId || t.id === editingTaskId) ? response.data : t));
        setEditingTaskId(null);
      } else {
        // Mode Création
        payload.userId = user.id;
        const response = await apiClient.post('/tasks', payload);
        setTasks([...tasks, response.data]);
      }

      // Réinitialise le formulaire
      setNewTask({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', categoryName: '' });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement de la tâche");
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const response = await apiClient.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => (t._id === taskId || t.id === taskId) ? response.data : t));
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await apiClient.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId && t.id !== taskId));
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleEditClick = (task) => {
    setEditingTaskId(task.id || task._id);
    const cat = categories.find(c => (c.id || c._id) === task.categoryId);
    setNewTask({
      title: task.title,
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '', // Format YYYY-MM-DD pour l'input date
      categoryName: cat ? cat.name : ''
    });
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setNewTask({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', categoryName: '' });
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
    // Le timeout permet au navigateur de générer l'image fantôme opaque avant de rendre la carte transparente
    setTimeout(() => setDraggedTaskId(taskId), 0);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      const task = tasks.find(t => (t._id === taskId || t.id === taskId));
      if (task && (task.status || 'todo') !== newStatus) {
        handleUpdateStatus(taskId, newStatus);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Nécessaire pour autoriser le drop HTML5
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Application des filtres sur la liste des tâches
  const filteredTasks = tasks.filter(task => {
    const matchSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = filterStatus ? task.status === filterStatus : true;
    const matchCategory = filterCategory ? task.categoryId === filterCategory : true;
    return matchSearch && matchStatus && matchCategory;
  });

  const renderColumn = (columnTitle, targetStatus) => {
    const columnTasks = filteredTasks.filter(t => (t.status || 'todo') === targetStatus);

    return (
      <div 
        style={styles.kanbanColumn}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, targetStatus)}
      >
        <h3 style={styles.columnTitle}>{columnTitle} <span>({columnTasks.length})</span></h3>
        
        {columnTasks.map(task => (
          <div 
            key={task.id || task._id} 
            style={{
              ...styles.taskCard,
              opacity: draggedTaskId === (task.id || task._id) ? 0.3 : 1
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, task.id || task._id)}
            onDragEnd={handleDragEnd}
          >
            <div style={styles.cardHeader}>
              <h4 style={styles.taskTitle}>{task.title}</h4>
              <span style={{ ...styles.badge, backgroundColor: getPriorityColor(task.priority) }}>{task.priority}</span>
            </div>
            {task.description && <p style={styles.taskDesc}>{task.description}</p>}
            {task.dueDate && <p style={styles.taskDate}>📅 {new Date(task.dueDate).toLocaleDateString()}</p>}
            
            <div style={styles.cardActions}>
              <div>
                {targetStatus !== 'todo' && <button style={styles.btnAction} onClick={() => handleUpdateStatus(task.id || task._id, 'todo')}>&larr;</button>}
                {targetStatus !== 'in_progress' && <button style={styles.btnAction} onClick={() => handleUpdateStatus(task.id || task._id, 'in_progress')}>{targetStatus === 'todo' ? 'Go' : 'En cours'}</button>}
                {targetStatus !== 'done' && <button style={styles.btnAction} onClick={() => handleUpdateStatus(task.id || task._id, 'done')}>&rarr;</button>}
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button style={{ ...styles.btnAction, color: '#e67e22' }} onClick={() => handleEditClick(task)}>✏️</button>
                <button style={{ ...styles.btnAction, color: '#dc3545', fontWeight: 'bold' }} onClick={() => handleDeleteTask(task.id || task._id)}>✖</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h2 style={{ margin: 0 }}>🎯 TaskFlow | {user.username}</h2>
        <button onClick={handleLogout} style={styles.btnLogout}>Déconnexion</button>
      </header>

      <div style={styles.mainLayout}>
        {/* Sidebar : Formulaire + Filtres */}
        <aside style={styles.sidebar}>
          <div style={styles.panel}>
            <h3 style={{ color: '#2e7d32' }}>{editingTaskId ? '✏️ Modifier la Tâche' : '➕ Nouvelle Tâche'}</h3>
            {error && <p style={styles.errorText}>{error}</p>}
            <form onSubmit={handleCreateTask} style={styles.form}>
              <input type="text" placeholder="Titre *" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required style={styles.input} />
              <textarea placeholder="Description" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} style={styles.input} rows="3" />
              <div style={styles.row}>
                <select value={newTask.status} onChange={e => setNewTask({...newTask, status: e.target.value})} style={styles.input}>
                  <option value="todo">À faire</option><option value="in_progress">En cours</option><option value="done">Terminé</option>
                </select>
                <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})} style={styles.input}>
                  <option value="low">Basse</option><option value="medium">Moyenne</option><option value="high">Haute</option>
                </select>
              </div>
              <input type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} style={styles.input} />
              <input 
                type="text" 
                placeholder="Catégorie (optionnelle, max 50 car.)" 
                maxLength="50" 
                value={newTask.categoryName} 
                onChange={e => setNewTask({...newTask, categoryName: e.target.value})} 
                style={styles.input} 
              />
              <div style={styles.row}>
                <button type="submit" style={{ ...styles.btnPrimary, flex: 1 }}>{editingTaskId ? 'Enregistrer' : 'Créer'}</button>
                {editingTaskId && (
                  <button type="button" onClick={handleCancelEdit} style={{ ...styles.btnSecondary, flex: 1 }}>Annuler</button>
                )}
              </div>
            </form>
          </div>

          <div style={styles.panel}>
            <h3>🔍 Filtres</h3>
            <div style={styles.form}>
              <input type="text" placeholder="Rechercher (mot-clé)..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={styles.input} />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={styles.input}>
                <option value="">Tous les statuts</option>
                <option value="todo">À faire</option><option value="in_progress">En cours</option><option value="done">Terminé</option>
              </select>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={styles.input}>
                <option value="">Toutes les catégories</option>
                {categories.length === 0 && <option value="" disabled>Aucune catégorie créée</option>}
                {categories.map(c => (
                  <option key={c.id || c._id} value={c.id || c._id} style={{ color: c.color || '#333', fontWeight: 'bold' }}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* Kanban Board */}
        <main style={styles.kanbanBoard}>
          {renderColumn('À faire', 'todo')}
          {renderColumn('En cours', 'in_progress')}
          {renderColumn('Terminé', 'done')}
        </main>
      </div>
    </div>
  );
}

// Fonctions utilitaires et styles
const getPriorityColor = (p) => {
  if (p === 'high') return '#ff4757'; // Rouge vif
  if (p === 'medium') return '#ffa502'; // Orange vif
  return '#2ed573'; // Vert vif
};

const styles = {
  container: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', display: 'flex', flexDirection: 'column', backgroundColor: '#e8f5e9' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', background: 'linear-gradient(135deg, #1b5e20, #4caf50)', color: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 10 },
  btnLogout: { padding: '8px 16px', backgroundColor: '#ff4757', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(255, 71, 87, 0.4)' },
  mainLayout: { display: 'flex', flex: 1, padding: '20px', gap: '20px', overflow: 'hidden' },
  sidebar: { width: '300px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '5px' },
  panel: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { padding: '12px', borderRadius: '6px', border: '1px solid #dcdde1', fontSize: '14px', width: '100%', boxSizing: 'border-box', outline: 'none' },
  row: { display: 'flex', gap: '10px' },
  btnPrimary: { padding: '12px', background: 'linear-gradient(135deg, #1b5e20, #4caf50)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 4px 10px rgba(76, 175, 80, 0.3)' },
  btnSecondary: { padding: '12px', background: 'linear-gradient(135deg, #7f8c8d, #95a5a6)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 4px 10px rgba(127, 140, 141, 0.3)' },
  kanbanBoard: { flex: 1, display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' },
  kanbanColumn: { flex: 1, minWidth: '300px', backgroundColor: '#f1f2f6', padding: '15px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' },
  columnTitle: { margin: 0, paddingBottom: '10px', borderBottom: '3px solid #ced6e0', display: 'flex', justifyContent: 'space-between', color: '#2f3542', fontSize: '18px' },
  taskCard: { backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', borderLeft: '5px solid #4caf50', display: 'flex', flexDirection: 'column', cursor: 'grab' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  taskTitle: { margin: 0, fontSize: '16px', color: '#2f3542', fontWeight: 'bold' },
  badge: { fontSize: '12px', padding: '4px 10px', borderRadius: '12px', color: '#fff', fontWeight: 'bold', textShadow: '0 1px 1px rgba(0,0,0,0.2)' },
  taskDesc: { margin: '0 0 10px 0', fontSize: '14px', color: '#57606f', lineHeight: '1.4' },
  taskDate: { margin: '0 0 10px 0', fontSize: '12px', color: '#747d8c', fontWeight: 'bold' },
  cardActions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  btnAction: { padding: '6px 12px', border: 'none', backgroundColor: '#dfe4ea', color: '#2f3542', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  errorText: { color: '#ff4757', fontSize: '14px', marginBottom: '10px', fontWeight: 'bold' }
};