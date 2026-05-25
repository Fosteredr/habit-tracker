import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Heart, Award, LogOut, BookOpen } from 'lucide-react';

//const API_URL = 'http://localhost:5000/api';
//const API_URL = 'http://192.168.56.1';
//const API_URL = 'https://early-carpets-sip.loca.lt/api'
//const API_URL = 'https://vercel.com/foster-s-projects1/habit-tracker/4ZUZVu5pQaGdZWMQEbFdaFgVkDxa'
//const API_URL = 'https://habit-tracker-inky-seven.vercel.app/api';
const API_URL = 'https://habit-tracker-inky-seven.vercel.app/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [isRegister, setIsRegister] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [habits, setHabits] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [moodScore, setMoodScore] = useState(0);
  const [note, setNote] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (token) {
      fetchHabits();
      fetchReflections();
    }
  }, [token]);
  const fetchHabits = async () => {
    try {
      const res = await fetch(`${API_URL}/habits`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setHabits(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchReflections = async () => {
    try {
      const res = await fetch(`${API_URL}/reflections`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReflections(data);
        const todayRef = data.find(r => r.date === todayStr);
        if (todayRef) {
          setMoodScore(todayRef.moodScore);
          setNote(todayRef.note);
        }
      }
    } catch (err) { console.error(err); }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isRegister ? 'register' : 'login';
    try {
      const res = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.message || 'Помилка авторизації');
        return;
      }
      if (isRegister) {
        alert('Реєстрація успішна! Увійдіть.');
        setIsRegister(false);
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      }
    } catch (err) { setAuthError('Немає зв’язку з сервером Backend.'); }
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken('');
    setUser(null);
    setHabits([]);
    setReflections([]);
    setMoodScore(0);
    setNote('');
  };

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    try {
      const res = await fetch(`${API_URL}/habits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newHabitTitle })
      });
      if (res.ok) {
        setNewHabitTitle('');
        fetchHabits();
      }
    } catch (err) { console.error(err); }
  };

  const handleToggleHabit = async (id) => {
    try {
      const res = await fetch(`${API_URL}/habits/${id}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: todayStr })
      });
      if (res.ok) fetchHabits();
    } catch (err) { console.error(err); }
  };

  const handleDeleteHabit = async (id) => {
    if (!confirm('Видалити цю звичку?')) return;
    try {
      const res = await fetch(`${API_URL}/habits/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchHabits();
    } catch (err) { console.error(err); }
  };

  const handleSaveReflection = async () => {
    if (moodScore === 0) {
      alert('Оберіть настрій.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/reflections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ moodScore, note, date: todayStr })
      });
      if (res.ok) {
        alert('Рефлексію збережено!');
        fetchReflections();
      }
    } catch (err) { console.error(err); }
  };
  // ЕКРАН АВТОРИЗАЦІЇ (Вхід / Реєстрація)
  if (!token) {
    return (
      <div className="auth-container">
        <h2 className="auth-title">{isRegister ? 'Реєстрація кабінету' : 'Вхід у систему'}</h2>
        {authError && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{authError}</p>}
        <form onSubmit={handleAuthSubmit}>
          {isRegister && (
            <div className="form-group">
              <label>Ваше ім'я</label>
              <input type="text" className="form-input" required
                value={authForm.name} onChange={e => setAuthForm({ ...authForm, name: e.target.value })} />
            </div>
          )}
          <div className="form-group">
            <label>Електронна пошта</label>
            <input type="email" className="form-input" required
              value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <input type="password" className="form-input" required
              value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} />
          </div>
          <button type="submit" className="btn">{isRegister ? 'Зареєструватися' : 'Увійти'}</button>
        </form>
        <p className="auth-toggle" onClick={() => { setIsRegister(!isRegister); setAuthError(''); }}>
          {isRegister ? 'Вже є акаунт? ' : 'Немає акаунту? '} <span>{isRegister ? 'Увійти' : 'Створити'}</span>
        </p>
      </div>
    );
  }

  // ГОЛОВНИЙ ЕКРАН ЗАСТОСУНКУ (Особистий дашборд)
  return (
    <div className="dashboard">
      <div className="header">
        <div>
          <h1>Вітаємо, {user?.name}!</h1>
          <p style={{ color: 'var(--text-muted)' }}>Сьогодні: {todayStr}</p>
        </div>
        <button onClick={handleLogout} className="btn" style={{ width: 'auto', background: '#edf2f7', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <LogOut size={16} /> Вихід
        </button>
      </div>

      <div className="grid">
        {/* ЛІВА КОЛОНКА - ТРЕКЕР ЗВИЧОК */}
        <div>
          <div className="card">
            <h2 className="card-title"><Award size={20} color="var(--primary)" /> Мої звички на сьогодні</h2>
            <form onSubmit={handleAddHabit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input type="text" className="form-input" placeholder="Нова звичка (наприклад, Спорт, Читання)..."
                value={newHabitTitle} onChange={e => setNewHabitTitle(e.target.value)} />
              <button type="submit" className="btn" style={{ width: 'auto', padding: '10px 20px' }}><Plus size={20} /></button>
            </form>

            {habits.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Ви ще не додали жодної звички. Створіть першу за допомогою форми вище.</p>
            ) : (
              habits.map(habit => {
                const isCompletedToday = habit.history.includes(todayStr);
                return (
                  <div key={habit._id} className="habit-item">
                    <div>
                      <strong style={{ textDecoration: isCompletedToday ? 'line-through' : 'none', color: isCompletedToday ? 'var(--text-muted)' : 'inherit' }}>
                        {habit.title}
                      </strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Виконано днів всього: {habit.history.length}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button onClick={() => handleToggleHabit(habit._id)} className={`habit-btn ${isCompletedToday ? 'completed' : 'pending'}`}>
                        {isCompletedToday ? 'Виконано' : 'Відмітити'}
                      </button>
                      <Trash2 size={18} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => handleDeleteHabit(habit._id)} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ПРАВА КОЛОНКА - МОДУЛЬ РЕФЛЕКСІЇ */}
        <div>
          <div className="card">
            <h2 className="card-title"><Heart size={20} color="#ef4444" /> Мій настрій & Рефлексія</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '10px' }}>Як ви почуваєтеся сьогодні?</p>
            <div className="mood-selector">
              {[1, 2, 3, 4, 5].map(score => (
                <button key={score} 
                  className={`mood-btn ${moodScore === score ? 'active' : ''}`}
                  style={{ backgroundColor: moodScore === score ? `var(--mood-${score})` : '#f1f5f9', color: moodScore === score ? 'white' : 'inherit' }}
                  onClick={() => setMoodScore(score)}>
                  {score}
                </button>
              ))}
            </div>
            <div className="form-group">
              <label><BookOpen size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Щоденник думок</label>
              <textarea className="form-input" style={{ height: '100px', resize: 'none' }} placeholder="Запишіть свої рефлексії за сьогодні..."
                value={note} onChange={e => setNote(e.target.value)}></textarea>
            </div>
            <button onClick={handleSaveReflection} className="btn" style={{ background: 'var(--success)' }}>Зберегти рефлексію</button>
          </div>
        </div>
      </div>
    </div>
  );
}
