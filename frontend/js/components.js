const { useState, useEffect, createContext, useContext } = React;

// Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userData = await window.apiClient.getMe();
                    setUser(userData);
                } catch (error) {
                    console.error('Auth check failed:', error);
                    window.apiClient.removeToken();
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await window.apiClient.login(email, password);
            window.apiClient.setToken(response.token);
            setUser(response.user);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const signup = async (name, email, password) => {
        try {
            const response = await window.apiClient.signup(name, email, password);
            window.apiClient.setToken(response.token);
            setUser(response.user);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        window.apiClient.removeToken();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Navigation Component
const Navigation = ({ openAuthModal }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    if (user && !isAdmin) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, isAdmin]);

  const loadNotifications = async () => {
    try {
      const res = await window.apiClient.getNotifications();
      setNotifications(res);
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    try {
      await window.apiClient.markAllNotificationsRead();
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const markRead = async (id) => {
    try {
      await window.apiClient.markNotificationRead(id);
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const NavLink = ({ href, children }) => (
    <a href={href} className="px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-700/60">
      {children}
    </a>
  );
  return (
    <nav className="backdrop-blur bg-slate-900/70 border-b border-slate-800 relative z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.hash = user ? (isAdmin ? '#admin-overview' : '#discover') : '#'}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center font-bold text-white">SS</div>
            <h1 className="text-xl font-semibold text-white">SkillSwap</h1>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            {!user && (
              <>
                <button onClick={() => openAuthModal('login')} className="px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-700/60">Login</button>
                <button onClick={() => openAuthModal('signup')} className="ml-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-brand-600 hover:to-brand-700">Sign Up</button>
              </>
            )}
            {user && !isAdmin && (
              <>
                <NavLink href="#discover">Discover</NavLink>
                <NavLink href="#messages">Messages</NavLink>
                <NavLink href="#requests">My Swaps</NavLink>
                <NavLink href="#profile">Profile</NavLink>
                
                <div className="relative ml-2">
                  <button onClick={() => setShowDropdown(!showDropdown)} className="relative p-2 text-slate-300 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-slate-900"></span>
                    )}
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                        <h3 className="font-semibold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-brand-400 hover:text-brand-300">Mark all read</button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-slate-400 text-sm">No notifications yet.</div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} onClick={() => markRead(n.id)} className={`p-4 border-b border-slate-700/50 cursor-pointer hover:bg-slate-700/50 transition-colors ${!n.is_read ? 'bg-slate-800/80' : 'bg-transparent'}`}>
                              <p className={`text-sm ${!n.is_read ? 'text-white font-medium' : 'text-slate-300'}`}>{n.message}</p>
                              <span className="text-[10px] text-slate-500 mt-1 block">{new Date(n.created_at).toLocaleTimeString()}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={logout} className="ml-4 bg-slate-700 text-white px-3 py-2 rounded-md text-sm hover:bg-slate-600">Sign Out</button>
              </>
            )}
            {user && isAdmin && (
              <>
                <NavLink href="#admin-overview">Overview</NavLink>
                <NavLink href="#admin-stats">Stats</NavLink>
                <NavLink href="#admin-users">Users</NavLink>
                <button onClick={logout} className="ml-2 bg-slate-700 text-white px-3 py-2 rounded-md text-sm hover:bg-slate-600">Sign Out</button>
              </>
            )}
          </div>
          <button className="md:hidden text-slate-200" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-800">
            {!user && (
              <div className="space-y-2">
                <button onClick={() => openAuthModal('login')} className="block w-full text-left px-3 py-2 rounded-md text-slate-200">Login</button>
                <button onClick={() => openAuthModal('signup')} className="block w-full text-left px-3 py-2 rounded-md bg-brand-600 text-white">Sign Up</button>
              </div>
            )}
            {user && !isAdmin && (
              <div className="space-y-2">
                <a href="#discover" className="block px-3 py-2 rounded-md text-slate-200">Discover</a>
                <a href="#messages" className="block px-3 py-2 rounded-md text-slate-200">Messages</a>
                <a href="#requests" className="block px-3 py-2 rounded-md text-slate-200">My Swaps</a>
                <a href="#profile" className="block px-3 py-2 rounded-md text-slate-200">Profile</a>
                <button onClick={logout} className="w-full text-left mt-2 px-3 py-2 rounded-md bg-slate-700 text-white">Sign Out</button>
              </div>
            )}
            {user && isAdmin && (
              <div className="space-y-2">
                <a href="#admin-overview" className="block px-3 py-2 rounded-md text-slate-200">Overview</a>
                <a href="#admin-stats" className="block px-3 py-2 rounded-md text-slate-200">Stats</a>
                <a href="#admin-users" className="block px-3 py-2 rounded-md text-slate-200">Users</a>
                <button onClick={logout} className="w-full text-left mt-2 px-3 py-2 rounded-md bg-slate-700 text-white">Sign Out</button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

// AuthModal Component
const AuthModal = ({ isOpen, onClose, initialTab = 'login' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setError('');
      setEmail('');
      setPassword('');
      setName('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        const res = await login(email, password);
        onClose();
        // Allow time for modal close animation before hash change
        setTimeout(() => {
            const nextHash = res.user && res.user.role === 'admin' ? 'admin-overview' : 'discover';
            window.location.hash = `#${nextHash}`;
        }, 50);
      } else {
        await signup(name, email, password);
        onClose();
        setTimeout(() => {
            window.location.hash = '#discover';
        }, 50);
      }
    } catch (error) {
      console.error('Auth Error:', error);
      setError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl transform transition-all animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="flex flex-col items-center space-y-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center font-bold text-white">SS</div>
          <h2 className="text-2xl font-semibold text-white">Welcome to SkillSwap</h2>
        </div>

        <div className="flex bg-slate-900/50 p-1 rounded-full mb-6 border border-slate-700/50">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${activeTab === 'login' ? 'bg-white text-slate-900 shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${activeTab === 'signup' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Sign Up
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}
          
          {activeTab === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
              <input type="text" required
                     className="w-full px-4 py-3 rounded-full bg-slate-900/70 border border-slate-700 placeholder-slate-500 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                     placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
            <input type="email" required
                   className="w-full px-4 py-3 rounded-full bg-slate-900/70 border border-slate-700 placeholder-slate-500 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                   placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input type="password" required minLength={activeTab === 'signup' ? 6 : 1}
                   className="w-full px-4 py-3 rounded-full bg-slate-900/70 border border-slate-700 placeholder-slate-500 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                   placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          
          <button type="submit" disabled={loading}
                  className="w-full py-3 mt-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 text-white font-medium hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 transition-all shadow-lg shadow-brand-500/25">
            {loading ? 'Please wait...' : activeTab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Landing Page Component
const LandingPage = ({ openAuthModal }) => {
  return (
    <div className="min-h-[90vh] flex flex-col text-slate-100">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 font-medium text-sm mb-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
            A New Way to Learn & Teach
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight animate-in slide-in-from-bottom-8 fade-in duration-700">
            Share Skills, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">Build Community</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed animate-in slide-in-from-bottom-10 fade-in duration-1000">
            Connect with talented individuals and exchange knowledge. Learn something new while teaching what you know best—completely free, no money involved.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-in slide-in-from-bottom-12 fade-in duration-1000">
            <button onClick={() => openAuthModal('signup')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-600 text-white font-medium text-lg hover:bg-brand-500 transition-all shadow-lg shadow-brand-500/25 hover:scale-105">
              Get Started
            </button>
            <button onClick={() => openAuthModal('login')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-800 text-white font-medium text-lg border border-slate-700 hover:bg-slate-700 transition-all hover:scale-105">
              Use Website
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-slate-900/50 border-t border-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How SkillSwap Works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Three simple steps to start learning and teaching today.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-2xl text-center hover:bg-slate-800/60 transition-colors group">
              <div className="w-20 h-20 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-400 text-3xl group-hover:scale-110 group-hover:bg-brand-500/20 transition-all duration-300">
                🔍
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">1. Discover</h3>
              <p className="text-slate-400 leading-relaxed">Search through our community to find people who have the skills you want to learn, and who want to learn the skills you have to offer.</p>
            </div>
            
            <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-2xl text-center hover:bg-slate-800/60 transition-colors group">
              <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-400 text-3xl group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
                🤝
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">2. Request</h3>
              <p className="text-slate-400 leading-relaxed">Send a swap request detailing what you'll teach in exchange for what you want to learn. Wait for them to accept your request.</p>
            </div>
            
            <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-2xl text-center hover:bg-slate-800/60 transition-colors group">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400 text-3xl group-hover:scale-110 group-hover:bg-green-500/20 transition-all duration-300">
                🎓
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">3. Learn</h3>
              <p className="text-slate-400 leading-relaxed">Connect off-platform to exchange knowledge. Once the swap is finished, mark the request as completed on your dashboard!</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-20 text-center px-4">
        <h2 className="text-3xl font-bold text-white mb-6">Ready to start swapping?</h2>
        <p className="text-slate-400 mb-8 max-w-xl mx-auto">Join hundreds of others who are learning new skills for free.</p>
        <button onClick={() => openAuthModal('signup')} className="px-8 py-4 rounded-full bg-white text-slate-900 font-bold text-lg hover:bg-slate-200 transition-all shadow-lg hover:scale-105">
          Join SkillSwap Today
        </button>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800 text-center text-slate-500">
        <p>© 2026 SkillSwap Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

// Loading Component
const Loading = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
      <p className="mt-4 text-slate-400">Loading...</p>
    </div>
  </div>
);

const Section = ({ title, children, right }) => (
  <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {right}
    </div>
    {children}
  </div>
);

const Stat = ({ label, value, icon }) => (
  <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-slate-400 text-sm">{label}</div>
        <div className="text-2xl font-semibold text-white">{value}</div>
      </div>
      <div className="w-10 h-10 rounded-lg bg-brand-600/20 text-brand-400 flex items-center justify-center">{icon}</div>
    </div>
  </div>
);

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [latest, setLatest] = useState([]);
  const [topSkills, setTopSkills] = useState([]);
  useEffect(() => {
    const load = async () => {
      try {
        const s = await window.apiClient.getAdminStats();
        const u = await window.apiClient.getAdminUsers({ limit: 8 });
        const r = await window.apiClient.getRequests({ page: 1, limit: 5 });
        setStats(s);
        setUsers(u.users || []);
        setLatest(r.requests || []);
        const allSkills = [];
        (u.users || []).forEach(x => {
          (x.skills_offered || []).forEach(s => allSkills.push(s));
          (x.skills_wanted || []).forEach(s => allSkills.push(s));
        });
        const counts = allSkills.reduce((acc, s) => { acc[s] = (acc[s] || 0) + 1; return acc; }, {});
        const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8);
        setTopSkills(sorted);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  if (loading) return <Loading />;
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total Users" value={stats.totalUsers} icon={<span>👥</span>} />
        <Stat label="Active Users" value={stats.activeUsers} icon={<span>✅</span>} />
        <Stat label="Swap Requests" value={stats.totalRequests} icon={<span>🔄</span>} />
        <Stat label="Completed" value={stats.completedRequests} icon={<span>🏁</span>} />
      </div>
      <Section title="Recent Users">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="text-left py-2 pr-3 font-medium">Name</th>
                <th className="text-left py-2 pr-3 font-medium">Email</th>
                <th className="text-left py-2 pr-3 font-medium">Role</th>
                <th className="text-left py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-slate-200">
              {users.map(u => (
                <tr key={u.id} className="border-t border-slate-700/70">
                  <td className="py-2 pr-3">{u.first_name || 'User'}</td>
                  <td className="py-2 pr-3">{u.email}</td>
                  <td className="py-2 pr-3">{u.role}</td>
                  <td className="py-2">{u.is_blocked ? <span className="px-2 py-1 rounded bg-red-500/20 text-red-300">Blocked</span> : <span className="px-2 py-1 rounded bg-green-500/20 text-green-300">Active</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Section title="Latest Requests">
          <div className="space-y-3">
            {latest.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-700">
                <div className="text-sm">
                  <div className="text-slate-200">{r.sender.first_name || 'User'} → {r.receiver.first_name || 'User'}</div>
                  <div className="text-slate-400">{r.skill_offered} for {r.skill_requested}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  r.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                  r.status === 'accepted' ? 'bg-green-500/20 text-green-300' :
                  r.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                  'bg-slate-600/30 text-slate-200'
                }`}>{r.status}</span>
              </div>
            ))}
            {latest.length === 0 && <div className="text-slate-400 text-sm">No recent requests</div>}
          </div>
        </Section>
        <Section title="Top Skills" >
          <div className="flex flex-wrap gap-2">
            {topSkills.map(([skill, count])=>(
              <span key={skill} className="px-3 py-1 rounded-full bg-brand-600/20 text-brand-300 text-sm">{skill} <span className="opacity-70">({count})</span></span>
            ))}
            {topSkills.length === 0 && <div className="text-slate-400 text-sm">No skills data</div>}
          </div>
        </Section>
        <Section title="System Health">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Pending" value={stats.pendingRequests} icon={<span>⏳</span>} />
            <Stat label="Completed" value={stats.completedRequests} icon={<span>🏁</span>} />
            <Stat label="Blocked" value={stats.blockedUsers} icon={<span>⛔</span>} />
          </div>
        </Section>
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  
  const load = async () => {
    setLoading(true);
    try {
      const resp = await window.apiClient.getAdminUsers({ search: query, page, limit });
      setUsers(resp.users || []);
      setTotal(resp.total || 0);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { load(); }, [page, limit]);
  
  const toggleBlock = async (u) => {
    if (u.is_blocked) {
      await window.apiClient.unblockUser(u.id);
    } else {
      await window.apiClient.blockUser(u.id);
    }
    load();
  };
  
  const delUser = async (u) => {
    if (confirm(`Delete user ${u.first_name}?`)) {
      await window.apiClient.deleteUser(u.id);
      load();
    }
  };
  
  const addUser = async () => {
    await window.apiClient.createAdminUser(form);
    setAdding(false);
    setForm({ name: '', email: '', password: '', role: 'user' });
    load();
  };
  
  const totalPages = Math.ceil(total / limit);
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Section title="Users" right={
        <div className="flex items-center space-x-2">
          <button onClick={()=>setAdding(true)} className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium transition-colors">
            + Add User
          </button>
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search users..."
                 className="px-4 py-2 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 w-64"/>
          <button onClick={load} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors">Search</button>
        </div>
      }>
        {adding && (
          <div className="mb-6 p-6 rounded-xl bg-slate-900/60 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Add New User</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Full name" className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-brand-600 focus:outline-none"/>
              <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="Email" className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-brand-600 focus:outline-none"/>
              <input value={form.password} onChange={e=>setForm({...form, password:e.target.value})} placeholder="Password" type="password" className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-brand-600 focus:outline-none"/>
              <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-brand-600 focus:outline-none">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="mt-4 flex space-x-3">
              <button onClick={addUser} className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium transition-colors">Create User</button>
              <button onClick={()=>setAdding(false)} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors">Cancel</button>
            </div>
          </div>
        )}
        {loading ? <Loading/> : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">User</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-center py-3 px-4 font-semibold">Role</th>
                    <th className="text-center py-3 px-4 font-semibold">Status</th>
                    <th className="text-center py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-slate-200">
                  {users.map(u => (
                    <tr key={u.id} className="border-t border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm">
                            {u.first_name?.[0] || 'U'}
                          </div>
                          <span className="font-medium">{u.first_name || 'User'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{u.email}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-300'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {u.is_blocked ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">🔴 Blocked</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">🟢 Active</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={()=>toggleBlock(u)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${u.is_blocked ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-yellow-600 hover:bg-yellow-500 text-white'}`}>
                            {u.is_blocked ? '✓ Unblock' : '🚫 Block'}
                          </button>
                          <button onClick={()=>delUser(u)} className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-colors">
                            🗑 Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>Show</span>
                <select value={limit} onChange={e=>setLimit(Number(e.target.value))} className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <span>per page</span>
                <span className="ml-4">Showing {((page-1)*limit)+1}-{Math.min(page*limit, total)} of {total}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  Previous
                </button>
                <span className="px-4 py-2 text-slate-300">Page {page} of {totalPages}</span>
                <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </Section>
    </div>
  );
};

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [timeframe, setTimeframe] = useState('7');
  
  useEffect(() => {
    const load = async () => setStats(await window.apiClient.getAdminStats());
    load();
  }, []);
  
  if (!stats) return <Loading/>;
  
  const blockedUsers = stats.totalUsers - stats.activeUsers;
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Stats Cards - 3 per row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Stat label="Total Users" value={stats.totalUsers} icon={<span>👥</span>} />
        <Stat label="Active Users" value={stats.activeUsers} icon={<span>✅</span>} />
        <Stat label="Blocked Users" value={blockedUsers} icon={<span>⛔</span>} />
        <Stat label="Swap Requests" value={stats.totalRequests} icon={<span>🔄</span>} />
        <Stat label="Pending Requests" value={stats.pendingRequests} icon={<span>⏳</span>} />
        <Stat label="Completed Swaps" value={stats.completedRequests} icon={<span>🏁</span>} />
      </div>
      
      {/* Activity Chart */}
      <Section title="Activity Overview" right={
        <select value={timeframe} onChange={e=>setTimeframe(e.target.value)} className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 3 months</option>
        </select>
      }>
        <div className="relative">
          {/* Y-axis label */}
          <div className="absolute -left-8 top-0 bottom-0 flex items-center">
            <span className="text-xs text-slate-500 transform -rotate-90">Activity Count</span>
          </div>
          
          {/* Chart */}
          <div className="grid grid-cols-12 gap-2 h-48 items-end pl-4">
            {Array.from({length: 12}).map((_,i)=>{
              const height = 20 + Math.random()*70;
              return (
                <div key={i} className="relative group">
                  <div 
                    className="bg-brand-600/40 hover:bg-brand-600/60 transition-all rounded-t cursor-pointer" 
                    style={{height: `${height}%`}}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Day {i+1}: {Math.floor(height)}
                    </div>
                  </div>
                  {/* X-axis labels */}
                  <div className="text-xs text-slate-500 text-center mt-2">D{i+1}</div>
                </div>
              );
            })}
          </div>
          
          {/* X-axis label */}
          <div className="text-center mt-2">
            <span className="text-xs text-slate-500">Days</span>
          </div>
        </div>
      </Section>
    </div>
  );
};

// Export components
window.SkillSwapComponents = {
    AuthProvider,
    Navigation,
    AuthModal,
    LandingPage,
    Loading,
    useAuth,
    AdminOverview,
    AdminUsers,
    AdminStats
};
