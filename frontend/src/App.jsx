import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Heart, Award, LogOut, BookOpen, Pencil } from 'lucide-react';

// Базова адреса API бере значення з env, а не з хардкоду
//const API_URL = import.meta.env.VITE_API_URL || '/api';
//const API_URL = import.meta.env.VITE_API_URL || 'https://habit-tracker-jygvym5lc-foster-s-projects1.vercel.app/api';
const API_URL = import.meta.env.VITE_API_URL || '/api';
// Безпечне приведення дати до YYYY-MM-DD
const normalizeDate = (value) => String(value || '').slice(0, 10);

// Поточна дата у локальному форматі
const getTodayStr = () => new Date().toLocaleDateString('sv-SE');

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [isRegister, setIsRegister] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [actionError, setActionError] = useState('');
  const [habits, setHabits] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [moodScore, setMoodScore] = useState(0);
  const [note, setNote] = useState('');

  const todayStr = getTodayStr();

 // Єдиний helper для авторизованих запитів
const authRequest = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  const raw = await res.text();
  let data = null;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = { message: raw };
  }

  if (!res.ok) {
    const details = data?.error ? `: ${data.error}` : '';
    throw new Error((data?.message || `HTTP ${res.status}`) + details);
  }

  return data;
};

  // Завантаження даних після входу
  useEffect(() => {
    if (token) {
      fetchHabits();
      fetchReflections();
      fetchAnalytics();
    }
  }, [token]);

  const fetchHabits = async () => {
    try {
      const data = await authRequest('/habits');
      setHabits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('FETCH HABITS ERROR:', err);
      setActionError(err.message || 'Не вдалося завантажити звички.');
    }
  };

  const fetchReflections = async () => {
    try {
      const data = await authRequest('/reflections');
      setReflections(Array.isArray(data) ? data : []);

      const todayRef = (Array.isArray(data) ? data : []).find(
        (r) => normalizeDate(r.date) === todayStr
      );

      if (todayRef) {
        setMoodScore(todayRef.moodScore || 0);
        setNote(todayRef.note || '');
      }
    } catch (err) {
      console.error('FETCH REFLECTIONS ERROR:', err);
      setActionError(err.message || 'Не вдалося завантажити рефлексії.');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await authRequest('/reflections/analytics');
      setAnalytics(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('FETCH ANALYTICS ERROR:', err);
      setActionError(err.message || 'Не вдалося завантажити статистику.');
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setActionError('');

    const endpoint = isRegister ? 'register' : 'login';

    try {
      const res = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.message || 'Помилка авторизації');
        return;
      }

      if (isRegister) {
        alert('Реєстрація успішна! Увійдіть.');
        setIsRegister(false);
        setAuthForm({ name: '', email: '', password: '' });
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        setAuthForm({ name: '', email: '', password: '' });
      }
    } catch (err) {
      setAuthError('Немає зв’язку з сервером Backend.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setHabits([]);
    setReflections([]);
    setAnalytics([]);
    setMoodScore(0);
    setNote('');
    setNewHabitTitle('');
    setAuthError('');
    setActionError('');
  };

  const handleAddHabit = async (e) => {
    e.preventDefault();
    setActionError('');

    const title = newHabitTitle.trim();
    if (!title) return;

    try {
      await authRequest('/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      setNewHabitTitle('');
      fetchHabits();
    } catch (err) {
      console.error('ADD HABIT ERROR:', err);
      setActionError(err.message || 'Не вдалося додати звичку.');
    }
  };

  const handleEditHabit = async (habit) => {
    const newTitle = window.prompt('Нова назва звички:', habit.title);
    if (!newTitle || !newTitle.trim()) return;

    setActionError('');

    try {
      await authRequest(`/habits/${habit._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          frequency: habit.frequency || 'щоденно',
        }),
      });

      fetchHabits();
    } catch (err) {
      console.error('EDIT HABIT ERROR:', err);
      setActionError(err.message || 'Не вдалося редагувати звичку.');
    }
  };

  const handleToggleHabit = async (id) => {
    setActionError('');

    try {
      await authRequest(`/habits/${id}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: todayStr }),
      });

      fetchHabits();
    } catch (err) {
      console.error('TOGGLE HABIT ERROR:', err);
      setActionError(err.message || 'Не вдалося змінити статус звички.');
    }
  };

  const handleDeleteHabit = async (id) => {
    if (!window.confirm('Видалити цю звичку?')) return;

    setActionError('');

    try {
      await authRequest(`/habits/${id}`, {
        method: 'DELETE',
      });

      fetchHabits();
    } catch (err) {
      console.error('DELETE HABIT ERROR:', err);
      setActionError(err.message || 'Не вдалося видалити звичку.');
    }
  };

  const handleSaveReflection = async () => {
    if (moodScore === 0) {
      alert('Оберіть настрій.');
      return;
    }

    setActionError('');

    try {
      await authRequest('/reflections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moodScore,
          note,
          date: todayStr,
        }),
      });

      alert('Рефлексію збережено!');
      fetchReflections();
      fetchAnalytics();
    } catch (err) {
      console.error('SAVE REFLECTION ERROR:', err);
      setActionError(err.message || 'Не вдалося зберегти рефлексію.');
    }
  };

  // Локальна статистика для швидкого відображення
  const averageMood = useMemo(() => {
    if (!reflections.length) return 0;
    const sum = reflections.reduce((acc, item) => acc + Number(item.moodScore || 0), 0);
    return (sum / reflections.length).toFixed(1);
  }, [reflections]);

  const completedTodayCount = useMemo(() => {
    return habits.filter((habit) => (habit.history || []).includes(todayStr)).length;
  }, [habits, todayStr]);

  const recentAnalytics = useMemo(() => {
    return [...analytics].slice(-7);
  }, [analytics]);

  // Екран авторизації
  if (!token) {
    return (
      <div className="auth-container">
        <h2 className="auth-title">
          {isRegister ? 'Реєстрація кабінету' : 'Вхід у систему'}
        </h2>

        {authError && (
          <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>
            {authError}
          </p>
        )}

        <form onSubmit={handleAuthSubmit}>
          {isRegister && (
            <div className="form-group">
              <label>Ваше ім'я</label>
              <input
                type="text"
                className="form-input"
                required
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
              />
            </div>
          )}

          <div className="form-group">
            <label>Електронна пошта</label>
            <input
              type="email"
              className="form-input"
              required
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Пароль</label>
            <input
              type="password"
              className="form-input"
              required
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            />
          </div>

          <button type="submit" className="btn">
            {isRegister ? 'Зареєструватися' : 'Увійти'}
          </button>
        </form>

        <p
          className="auth-toggle"
          onClick={() => {
            setIsRegister(!isRegister);
            setAuthError('');
          }}
        >
          {isRegister ? 'Вже є акаунт? ' : 'Немає акаунту? '}
          <span>{isRegister ? 'Увійти' : 'Створити'}</span>
        </p>
      </div>
    );
  }

  // Основний дашборд
  return (
    <div className="dashboard">
      <div className="header">
        <div>
          <h1>Вітаємо, {user?.name}!</h1>
          <p style={{ color: 'var(--text-muted)' }}>Сьогодні: {todayStr}</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="btn"
          style={{
            width: 'auto',
            background: '#edf2f7',
            color: '#4a5568',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <LogOut size={16} /> Вихід
        </button>
      </div>

      {actionError && (
        <p style={{ color: '#ef4444', marginBottom: '16px', fontWeight: 600 }}>
          {actionError}
        </p>
      )}

      <div className="grid">
        <div>
          <div className="card">
            <h2 className="card-title">
              <Award size={20} color="var(--primary)" /> Мої звички на сьогодні
            </h2>

            <form
              onSubmit={handleAddHabit}
              style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}
            >
              <input
                type="text"
                className="form-input"
                placeholder="Нова звичка (наприклад, Спорт, Читання)..."
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
              />
              <button
                type="submit"
                className="btn"
                style={{ width: 'auto', padding: '10px 20px' }}
              >
                <Plus size={20} />
              </button>
            </form>

            {habits.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>
                Ви ще не додали жодної звички. Створіть першу за допомогою форми вище.
              </p>
            ) : (
              habits.map((habit) => {
                const isCompletedToday = (habit.history || []).includes(todayStr);

                return (
                  <div key={habit._id} className="habit-item">
                    <div>
                      <strong
                        style={{
                          textDecoration: isCompletedToday ? 'line-through' : 'none',
                          color: isCompletedToday ? 'var(--text-muted)' : 'inherit',
                        }}
                      >
                        {habit.title}
                      </strong>

                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Виконано днів всього: {(habit.history || []).length}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleHabit(habit._id)}
                        className={`habit-btn ${isCompletedToday ? 'completed' : 'pending'}`}
                      >
                        {isCompletedToday ? 'Виконано' : 'Відмітити'}
                      </button>

                      <Pencil
                        size={18}
                        color="#3b82f6"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleEditHabit(habit)}
                      />

                      <Trash2
                        size={18}
                        color="#ef4444"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleDeleteHabit(habit._id)}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="card">
            <h2 className="card-title">Коротка статистика</h2>
            <p>Звичок виконано сьогодні: <strong>{completedTodayCount}</strong></p>
            <p>Усього звичок: <strong>{habits.length}</strong></p>
            <p>Середній настрій: <strong>{averageMood}</strong></p>
            <p>Усього рефлексій: <strong>{reflections.length}</strong></p>
          </div>
        </div>

        <div>
          <div className="card">
            <h2 className="card-title">
              <Heart size={20} color="#ef4444" /> Мій настрій & Рефлексія
            </h2>

            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Як ви почуваєтеся сьогодні?
            </p>

            <div className="mood-selector">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  type="button"
                  key={score}
                  className={`mood-btn ${moodScore === score ? 'active' : ''}`}
                  style={{
                    backgroundColor: moodScore === score ? `var(--mood-${score})` : '#f1f5f9',
                    color: moodScore === score ? 'white' : 'inherit',
                  }}
                  onClick={() => setMoodScore(score)}
                >
                  {score}
                </button>
              ))}
            </div>

            <div className="form-group">
              <label>
                <BookOpen size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                Щоденник думок
              </label>

              <textarea
                className="form-input"
                style={{ height: '100px', resize: 'none' }}
                placeholder="Запишіть свої рефлексії за сьогодні..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={handleSaveReflection}
              className="btn"
              style={{ background: 'var(--success)' }}
            >
              Зберегти рефлексію
            </button>
          </div>

          <div className="card">
            <h2 className="card-title">Останні 7 днів рефлексії</h2>

            {recentAnalytics.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>
                Даних для побудови статистики поки що недостатньо.
              </p>
            ) : (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', height: '120px' }}>
                {recentAnalytics.map((item) => (
                  <div key={`${item.date}-${item.moodScore}`} style={{ textAlign: 'center', flex: 1 }}>
                    <div
                      style={{
                        height: `${Number(item.moodScore) * 20}px`,
                        borderRadius: '8px 8px 0 0',
                        background: 'var(--primary)',
                        marginBottom: '6px',
                      }}
                    />
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {normalizeDate(item.date)}
                    </div>
                    <div style={{ fontSize: '12px' }}>{item.moodScore}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
