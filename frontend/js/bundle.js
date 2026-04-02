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
const Navigation = () => {
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
      setNotifications(res.notifications || []);
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
    <a href={href} className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${window.location.hash === href ? 'text-white bg-brand-600 shadow-lg shadow-brand-500/30' : 'text-slate-200 hover:text-white hover:bg-slate-700/60'}`}>
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
                <a href="#login" className="px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-700/60">Login</a>
                <a href="#signup" className="ml-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-brand-600 hover:to-brand-700">Sign Up</a>
              </>
            )}
            {user && !isAdmin && (
              <>
                <NavLink href="#discover">Discover</NavLink>
                <NavLink href="#requests">My Swaps</NavLink>
                <NavLink href="#profile">Profile</NavLink>
                
                <div className="relative ml-2">
                  <button onClick={() => setShowDropdown(!showDropdown)} className={`relative p-2 text-slate-300 hover:text-white rounded-full hover:bg-slate-800 transition-all duration-200 ${unreadCount > 0 ? 'animate-bellRing' : ''}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white animate-pulse-slow">{unreadCount}</span>
                    )}
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-slideInTop z-50">
                      <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                        <h3 className="font-semibold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-brand-400 hover:text-brand-300 transition-colors">Mark all read</button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-slate-400 text-sm">No notifications yet.</div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} onClick={() => markRead(n.id)} className={`p-4 border-b border-slate-700/50 cursor-pointer hover:bg-slate-700/50 transition-all duration-200 ${!n.is_read ? 'bg-slate-800/80' : 'bg-transparent'}`}>
                              <p className={`text-sm ${!n.is_read ? 'text-white font-medium' : 'text-slate-300'}`}>{n.message}</p>
                              <span className="text-[10px] text-slate-500 mt-1 block">{new Date(n.created_at).toLocaleTimeString()}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={logout} className="ml-4 bg-slate-700 text-white px-3 py-2 rounded-md text-sm hover:bg-slate-600 transition-all duration-200 hover:shadow-lg btn-ripple">Sign Out</button>
              </>
            )}
            {user && isAdmin && (
              <>
                <NavLink href="#admin-overview">Overview</NavLink>
                <NavLink href="#admin-stats">Stats</NavLink>
                <NavLink href="#admin-users">Users</NavLink>
                <button onClick={logout} className="ml-2 bg-slate-700 text-white px-3 py-2 rounded-md text-sm hover:bg-slate-600 transition-all duration-200 btn-ripple">Sign Out</button>
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
                <a href="#login" className="block px-3 py-2 rounded-md text-slate-200">Login</a>
                <a href="#signup" className="block px-3 py-2 rounded-md bg-brand-600 text-white">Sign Up</a>
              </div>
            )}
            {user && !isAdmin && (
              <div className="space-y-2">
                <a href="#discover" className="block px-3 py-2 rounded-md text-slate-200">Discover</a>
                <a href="#requests" className="block px-3 py-2 rounded-md text-slate-200">My Requests</a>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl animate-scaleIn">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="flex flex-col items-center space-y-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center font-bold text-white shadow-lg shadow-brand-500/30">SS</div>
          <h2 className="text-2xl font-semibold text-white">Welcome to SkillSwap</h2>
        </div>

        <div className="flex bg-slate-900/50 p-1 rounded-full mb-6 border border-slate-700/50">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-all duration-300 ${activeTab === 'login' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-all duration-300 ${activeTab === 'signup' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Sign Up
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm animate-fadeIn">{error}</div>}
          
          {activeTab === 'signup' && (
            <div className="animate-fadeIn">
              <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
              <input type="text" required
                     className="w-full px-4 py-3 rounded-full bg-slate-900/70 border border-slate-700 placeholder-slate-500 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                     placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
            <input type="email" required
                   className="w-full px-4 py-3 rounded-full bg-slate-900/70 border border-slate-700 placeholder-slate-500 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                   placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input type="password" required minLength={activeTab === 'signup' ? 6 : 1}
                   className="w-full px-4 py-3 rounded-full bg-slate-900/70 border border-slate-700 placeholder-slate-500 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                   placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          
          <button type="submit" disabled={loading}
                  className="w-full py-3 mt-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 text-white font-medium hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] btn-ripple flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Please wait...</span>
              </>
            ) : (
              <span>{activeTab === 'login' ? 'Sign In' : 'Create Account'}</span>
            )}
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
            <button onClick={() => openAuthModal('signup')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-600 text-white font-medium text-lg hover:bg-brand-500 transition-all shadow-lg shadow-brand-500/25 hover:scale-105 hover:shadow-brand-500/40 btn-ripple">
              Get Started
            </button>
            <button onClick={() => openAuthModal('login')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-800 text-white font-medium text-lg border border-slate-700 hover:bg-slate-700 transition-all hover:scale-105 hover:shadow-lg btn-ripple">
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
            <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-2xl text-center hover:bg-slate-800/60 transition-all duration-300 group hover-lift">
              <div className="w-20 h-20 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-400 text-3xl group-hover:scale-110 group-hover:bg-brand-500/20 transition-all duration-300">
                🔍
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">1. Discover</h3>
              <p className="text-slate-400 leading-relaxed">Search through our community to find people who have the skills you want to learn, and who want to learn the skills you have to offer.</p>
            </div>
            
            <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-2xl text-center hover:bg-slate-800/60 transition-all duration-300 group hover-lift">
              <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-400 text-3xl group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
                🤝
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">2. Request</h3>
              <p className="text-slate-400 leading-relaxed">Send a swap request detailing what you'll teach in exchange for what you want to learn. Wait for them to accept your request.</p>
            </div>
            
            <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-2xl text-center hover:bg-slate-800/60 transition-all duration-300 group hover-lift">
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
        <button onClick={() => openAuthModal('signup')} className="px-8 py-4 rounded-full bg-white text-slate-900 font-bold text-lg hover:bg-slate-200 transition-all shadow-lg hover:scale-105 hover:shadow-xl btn-ripple">
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
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const load = async () => {
    setLoading(true);
    try {
      const resp = await window.apiClient.getAdminUsers({ search: query });
      setUsers(resp.users || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);
  const toggleBlock = async (u) => {
    if (u.is_blocked) {
      await window.apiClient.unblockUser(u.id);
    } else {
      await window.apiClient.blockUser(u.id);
    }
    load();
  };
  const delUser = async (u) => {
    await window.apiClient.deleteUser(u.id);
    load();
  };
  const addUser = async () => {
    await window.apiClient.createAdminUser(form);
    setAdding(false);
    setForm({ name: '', email: '', password: '', role: 'user' });
    load();
  };
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Section title="Users" right={
        <div className="flex items-center space-x-2">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search users"
                 className="px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600"/>
          <button onClick={load} className="px-3 py-2 rounded-lg bg-brand-600 text-white">Search</button>
          <button onClick={()=>setAdding(true)} className="px-3 py-2 rounded-lg bg-slate-700 text-white">Add User</button>
        </div>
      }>
        {adding && (
          <div className="mb-4 p-4 rounded-xl bg-slate-900/60 border border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Full name" className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100"/>
              <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="Email" className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100"/>
              <input value={form.password} onChange={e=>setForm({...form, password:e.target.value})} placeholder="Password" type="password" className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100"/>
              <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="mt-3 flex space-x-2">
              <button onClick={addUser} className="px-3 py-2 rounded-lg bg-brand-600 text-white">Create</button>
              <button onClick={()=>setAdding(false)} className="px-3 py-2 rounded-lg bg-slate-700 text-white">Cancel</button>
            </div>
          </div>
        )}
        {loading ? <Loading/> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="text-left py-2 pr-3 font-medium">Name</th>
                  <th className="text-left py-2 pr-3 font-medium">Email</th>
                  <th className="text-left py-2 pr-3 font-medium">Role</th>
                  <th className="text-left py-2 pr-3 font-medium">Blocked</th>
                  <th className="text-left py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                {users.map(u => (
                  <tr key={u.id} className="border-t border-slate-700/70">
                    <td className="py-2 pr-3">{u.first_name || 'User'}</td>
                    <td className="py-2 pr-3">{u.email}</td>
                    <td className="py-2 pr-3">{u.role}</td>
                    <td className="py-2 pr-3">{u.is_blocked ? 'Yes' : 'No'}</td>
                    <td className="py-2 space-x-2">
                      <button onClick={()=>toggleBlock(u)} className={`px-3 py-1 rounded ${u.is_blocked ? 'bg-green-600' : 'bg-yellow-600'} text-white`}>
                        {u.is_blocked ? 'Unblock' : 'Block'}
                      </button>
                      <button onClick={()=>delUser(u)} className="px-3 py-1 rounded bg-red-600 text-white">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
};

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    const load = async () => setStats(await window.apiClient.getAdminStats());
    load();
  }, []);
  if (!stats) return <Loading/>;
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Stat label="Total Users" value={stats.totalUsers} icon={<span>👥</span>} />
        <Stat label="Active Users" value={stats.activeUsers} icon={<span>✅</span>} />
        <Stat label="Blocked Users" value={stats.blockedUsers} icon={<span>⛔</span>} />
        <Stat label="Requests" value={stats.totalRequests} icon={<span>🔄</span>} />
        <Stat label="Pending" value={stats.pendingRequests} icon={<span>⏳</span>} />
        <Stat label="Completed" value={stats.completedRequests} icon={<span>🏁</span>} />
      </div>
      <Section title="Activity Overview">
        <div className="grid grid-cols-12 gap-2 h-28 items-end">
          {Array.from({length: 12}).map((_,i)=>(
            <div key={i} className="bg-brand-600/40 hover:bg-brand-600/60 transition-colors" style={{height: `${20 + Math.random()*60}%`}}></div>
          ))}
        </div>
      </Section>
    </div>
  );
};

// Removed SkillSwapComponents export

// Main App Component
const { useRef } = React;

// Swap Request Modal Component
const SwapRequestModal = ({ isOpen, onClose, userItem, onSubmit }) => {
  const [skillOffered, setSkillOffered] = useState('');
  const [skillRequested, setSkillRequested] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSkillOffered(userItem.skills_wanted && userItem.skills_wanted.length > 0 ? userItem.skills_wanted[0] : '');
      setSkillRequested(userItem.skills_offered && userItem.skills_offered.length > 0 ? userItem.skills_offered[0] : '');
      setMessage('');
    }
  }, [isOpen, userItem]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl animate-scaleIn">
        <h3 className="text-xl font-semibold text-white mb-4">Swap with {userItem.first_name}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">I will offer:</label>
            <input type="text" className="w-full px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                   value={skillOffered} onChange={(e) => setSkillOffered(e.target.value)} placeholder="e.g. JavaScript" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">I want to learn:</label>
            <input type="text" className="w-full px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                   value={skillRequested} onChange={(e) => setSkillRequested(e.target.value)} placeholder="e.g. Python" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Message (optional):</label>
            <textarea className="w-full px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                      rows="3" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Hi, let's swap skills!"></textarea>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all duration-200 btn-ripple">Cancel</button>
            <button onClick={() => onSubmit(skillOffered, skillRequested, message)}
                    className="px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-500 transition-all duration-200 hover:shadow-lg hover:shadow-brand-500/30 btn-ripple"
                    disabled={!skillOffered || !skillRequested}>Send Request</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// User Detail Modal Component
const UserDetailModal = ({ isOpen, onClose, userItem, onSwapRequest }) => {
    if (!isOpen || !userItem) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl animate-scaleIn">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="flex items-center gap-6 mb-6">
                    {userItem.profile_image ? (
                        <img src={userItem.profile_image} alt={userItem.first_name} className="w-20 h-20 rounded-full object-cover border-2 border-brand-500" />
                    ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center text-white font-bold text-2xl border-2 border-brand-500">
                            {userItem.first_name ? userItem.first_name[0].toUpperCase() : 'U'}
                        </div>
                    )}
                    <div>
                        <h2 className="text-2xl font-bold text-white">{userItem.first_name || 'Unknown'}</h2>
                        <p className="text-slate-400">{userItem.location || 'Unknown Location'}</p>
                        <div className="flex items-center gap-1 text-yellow-400 mt-1">
                            <span>⭐</span>
                            <span className="font-semibold">{userItem.rating ? userItem.rating.toFixed(1) : 'New'}</span>
                            <span className="text-slate-500 text-sm">({userItem.rating_count || 0} reviews)</span>
                        </div>
                    </div>
                </div>
                
                {userItem.bio && (
                    <div className="mb-6">
                        <h3 className="font-semibold text-slate-300 mb-2">About Me</h3>
                        <p className="text-slate-400 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">{userItem.bio}</p>
                    </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h3 className="font-semibold text-slate-300 mb-3">Skills Offered</h3>
                        <div className="flex flex-wrap gap-2">
                            {userItem.skills_offered?.map((s, i) => (
                                <span key={i} className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-sm border border-green-500/20">{s}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-300 mb-3">Skills Wanted</h3>
                        <div className="flex flex-wrap gap-2">
                            {userItem.skills_wanted?.map((s, i) => (
                                <span key={i} className="bg-brand-500/10 text-brand-400 px-3 py-1 rounded-full text-sm border border-brand-500/20">{s}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {userItem.reviews && userItem.reviews.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-semibold text-slate-300 mb-3">Recent Reviews</h3>
                        <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                            {userItem.reviews.map((rev) => (
                                <div key={rev.id} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium text-slate-200">{rev.reviewer_name}</span>
                                        <span className="text-yellow-400 text-sm">{"⭐".repeat(rev.rating)}</span>
                                    </div>
                                    <p className="text-slate-400 text-sm">{rev.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button onClick={() => { onClose(); onSwapRequest(userItem); }}
                    className="w-full bg-brand-600 text-white py-3 rounded-xl hover:bg-brand-500 transition-all duration-300 font-medium shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 btn-ripple">
                    Request Swap
                </button>
            </div>
        </div>
    );
};

// Skeleton Loader
const UserCardSkeleton = () => (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-md p-6 h-full flex flex-col">
        <div className="flex items-center mb-5">
            <div className="w-14 h-14 rounded-full animate-shimmer"></div>
            <div className="ml-4 space-y-2 flex-1">
                <div className="h-4 animate-shimmer rounded w-24"></div>
                <div className="h-3 animate-shimmer rounded w-32"></div>
            </div>
        </div>
        <div className="space-y-2 mb-5">
            <div className="h-3 animate-shimmer rounded w-full"></div>
            <div className="h-3 animate-shimmer rounded w-4/5"></div>
        </div>
        <div className="mt-auto space-y-4">
            <div>
                <div className="h-3 animate-shimmer rounded w-16 mb-2"></div>
                <div className="flex gap-2">
                    <div className="h-5 animate-shimmer rounded w-16"></div>
                    <div className="h-5 animate-shimmer rounded w-20"></div>
                </div>
            </div>
            <div className="h-10 animate-shimmer rounded-xl w-full mt-4"></div>
        </div>
    </div>
);

// Empty State Component
const EmptyState = ({ icon, title, description }) => (
    <div className="text-center py-16 bg-slate-800/40 border border-slate-700/50 rounded-2xl my-6 flex flex-col items-center justify-center">
        <div className="text-5xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 max-w-md mx-auto">{description}</p>
    </div>
);

// Discover Page Component
const DiscoverPage = () => {
    const [users, setUsers] = useState([]);
    const [recommendedUsers, setRecommendedUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [skillFilter, setSkillFilter] = useState('');
    const [sort, setSort] = useState('');
    const [availability, setAvailability] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [requestModal, setRequestModal] = useState({ open: false, user: null });
    const [detailModal, setDetailModal] = useState({ open: false, user: null });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const { user } = useAuth();
    
    // Setup intersection observer for infinite scrolling
    const observer = useRef();
    const lastUserElementRef = (node) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    };

    useEffect(() => {
        setUsers([]);
        setPage(1);
        setHasMore(true);
        loadUsers(1, true);
    }, [search, skillFilter, sort, availability, location]);

    useEffect(() => {
        if (page > 1) {
            loadUsers(page, false);
        }
    }, [page]);

    const loadUsers = async (pageNum, reset) => {
        setLoading(true);
        try {
            const params = { page: pageNum, limit: 12 };
            if (search) params.search = search;
            if (skillFilter) params.skill = skillFilter;
            if (sort) params.sort = sort;
            if (availability) params.availability = availability;
            if (location) params.location = location;
            
            const response = await window.apiClient.getUsers(params);
            
            let fetchedUsers = response.users || [];
            if (user) {
                fetchedUsers = fetchedUsers.filter(u => u.id !== user.id);
            }
            
            setUsers(prev => reset ? fetchedUsers : [...prev, ...fetchedUsers]);
            setHasMore(fetchedUsers.length === 12);

            if (reset && user && user.skills_wanted && user.skills_wanted.length > 0) {
                // simple recommendation logic: users who offer what I want
                const recs = fetchedUsers.filter(u => 
                    u.skills_offered?.some(s => user.skills_wanted.includes(s))
                ).slice(0, 4);
                setRecommendedUsers(recs);
            }
        } catch (error) {
            console.error('Failed to load users:', error);
            showToast('Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleSendRequest = async (skillOffered, skillRequested, message) => {
        try {
            await window.apiClient.createRequest(requestModal.user.id, skillOffered, skillRequested, message);
            setRequestModal({ open: false, user: null });
            showToast('Skill swap request sent successfully!', 'success');
        } catch (error) {
            const errorMsg = error.message.includes('Conflict') ? 'A pending request already exists for these skills.' : error.message;
            showToast('Failed to send request: ' + errorMsg, 'error');
        }
    };

    const renderUserCard = (userItem, isLast) => (
        <div ref={isLast ? lastUserElementRef : null} key={userItem.id} onClick={() => setDetailModal({ open: true, user: userItem })} className="cursor-pointer group bg-slate-800/40 border border-slate-700/50 hover:border-brand-500/50 rounded-2xl shadow-md p-6 transition-all duration-300 hover-lift flex flex-col h-full">
            <div className="flex items-center mb-5">
                {userItem.profile_image ? (
                    <img src={userItem.profile_image} alt={userItem.first_name} className="w-14 h-14 rounded-full object-cover border-2 border-slate-700 group-hover:border-brand-500 transition-all duration-300" />
                ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-slate-700 group-hover:border-brand-500 transition-all duration-300 group-hover:scale-110">
                        {userItem.first_name ? userItem.first_name[0].toUpperCase() : 'U'}
                    </div>
                )}
                <div className="ml-4">
                    <h3 className="font-semibold text-lg text-white group-hover:text-brand-400 transition-colors">{userItem.first_name || 'Unknown'}</h3>
                    <p className="text-slate-400 text-sm flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                        {userItem.location || 'Unknown Location'}
                    </p>
                </div>
            </div>
            
            {userItem.bio && (
                <p className="text-slate-300 text-sm mb-5 line-clamp-2">{userItem.bio}</p>
            )}
            
            <div className="mb-4 flex-grow">
                <div className="mb-3">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Offers</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {userItem.skills_offered && userItem.skills_offered.length > 0 ? (
                            userItem.skills_offered.slice(0,3).map((skill, idx) => (
                                <span key={idx} className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-200 hover:bg-green-500/20">
                                    {skill}
                                </span>
                            ))
                        ) : <span className="text-slate-500 text-xs">No skills offered.</span>}
                    </div>
                </div>
            </div>
            
            <button
                onClick={(e) => { e.stopPropagation(); setRequestModal({ open: true, user: userItem }); }}
                className="w-full mt-auto bg-slate-700/50 text-brand-300 hover:text-white border border-brand-500/30 py-2.5 rounded-xl font-medium transition-all duration-300 group-hover:bg-brand-600 group-hover:border-brand-500 hover:shadow-lg hover:shadow-brand-500/20 btn-ripple"
            >
                Request Swap
            </button>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 text-slate-100 animate-fadeIn">
            {toast.show && (
                <div className={`fixed top-20 right-4 p-4 rounded-lg shadow-2xl z-50 animate-toastIn flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-500/90 text-white border border-red-400' : 'bg-green-500/90 text-white border border-green-400'}`}>
                    {toast.type === 'error' ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    )}
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}
            
            <h1 className="text-3xl font-bold mb-8 text-white">Discover Skills & People</h1>
            
            {/* Advanced Filtering & Sorting */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                <div className="relative">
                    <input type="text" placeholder="Search name/location..." className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-brand-600" value={search} onChange={e => setSearch(e.target.value)} />
                    <span className="absolute left-3 top-3 text-slate-400">🔍</span>
                </div>
                <div className="relative">
                    <input type="text" placeholder="Filter by skill..." className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-brand-600" value={skillFilter} onChange={e => setSkillFilter(e.target.value)} />
                    <span className="absolute left-3 top-3 text-slate-400">🏷️</span>
                </div>
                <div>
                    <select className="w-full px-4 py-2.5 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-brand-600" value={sort} onChange={e => setSort(e.target.value)}>
                        <option value="">Sort By...</option>
                        <option value="highest_rated">Highest Rated</option>
                        <option value="online_now">Online Now</option>
                    </select>
                </div>
                <div>
                    <select className="w-full px-4 py-2.5 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-brand-600" value={availability} onChange={e => setAvailability(e.target.value)}>
                        <option value="">Any Availability</option>
                        <option value="Weekends">Weekends</option>
                        <option value="Evenings">Evenings</option>
                        <option value="Weekdays">Weekdays</option>
                    </select>
                </div>
            </div>

            {/* Smart Recommendations */}
            {recommendedUsers.length > 0 && !search && !skillFilter && (
                <div className="mb-12">
                    <h2 className="text-xl font-bold mb-4 text-brand-300 flex items-center gap-2">✨ Recommended for You</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {recommendedUsers.map((u, i) => renderUserCard(u, false))}
                    </div>
                </div>
            )}

            <h2 className="text-xl font-bold mb-4 text-white">All Users</h2>

            {users.length === 0 && !loading ? (
                <EmptyState icon="🕵️‍♂️" title="No Matches Found" description="Try adjusting your filters or searching for different skills." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {users.map((userItem, index) => renderUserCard(userItem, index === users.length - 1))}
                    {loading && Array.from({ length: 4 }).map((_, i) => <UserCardSkeleton key={`skel-${i}`} />)}
                </div>
            )}
            
            <SwapRequestModal 
                isOpen={requestModal.open} 
                onClose={() => setRequestModal({ open: false, user: null })} 
                userItem={requestModal.user} 
                onSubmit={handleSendRequest} 
            />
            <UserDetailModal
                isOpen={detailModal.open}
                onClose={() => setDetailModal({ open: false, user: null })}
                userItem={detailModal.user}
                onSwapRequest={(u) => { setDetailModal({ open: false, user: null }); setRequestModal({ open: true, user: u }); }}
            />
        </div>
    );
};

// Review Modal
const ReviewModal = ({ isOpen, onClose, partnerName, onSubmit }) => {
    const [rating, setRating] = useState(5);
    const [text, setText] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl animate-scaleIn">
                <h3 className="text-xl font-semibold text-white mb-4">Rate your swap with {partnerName}</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} type="button" onClick={() => setRating(star)} className={`text-2xl ${rating >= star ? 'text-yellow-400' : 'text-slate-600'} hover:scale-110 transition-transform`}>
                                    ⭐
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Review (optional)</label>
                        <textarea className="w-full px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-100"
                                  rows="3" value={text} onChange={(e) => setText(e.target.value)} placeholder="How was your experience?"></textarea>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all duration-200 btn-ripple">Skip</button>
                        <button onClick={() => onSubmit(rating, text)}
                                className="px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-500 transition-all duration-200 hover:shadow-lg hover:shadow-brand-500/30 btn-ripple">Submit Review</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Chat Panel
const ChatPanel = ({ isOpen, onClose, request, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && request) {
            loadMessages();
            const interval = setInterval(loadMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [isOpen, request]);

    const loadMessages = async () => {
        try {
            const msgs = await window.apiClient.getSwapMessages(request.id);
            setMessages(msgs);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setLoading(true);
        try {
            await window.apiClient.sendSwapMessage(request.id, text);
            setText('');
            await loadMessages();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !request) return null;

    const partner = request.sender.id === currentUser.id ? request.receiver : request.sender;

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-slate-800 border-l border-slate-700 shadow-2xl z-50 flex flex-col animate-slideInRight">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-sm">{partner.first_name?.[0]}</span>
                    Chat with {partner.first_name}
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{scrollBehavior: 'smooth'}}>
                {messages.length === 0 ? (
                    <div className="text-center text-slate-500 mt-10">No messages yet. Say hi!</div>
                ) : (
                    messages.map(msg => {
                        const isMe = msg.sender_id === currentUser.id;
                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fadeIn`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMe ? 'bg-brand-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                    {msg.text}
                                </div>
                                <span className="text-[10px] text-slate-500 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</span>
                            </div>
                        );
                    })
                )}
                {loading && (
                    <div className="flex items-center gap-1 text-slate-400 text-sm">
                        <span>Typing</span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-slate-700 bg-slate-900/50">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all" />
                    <button type="submit" disabled={loading || !text.trim()} className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center hover:bg-brand-500 disabled:opacity-50 transition-all hover:scale-110 btn-ripple">
                        ➤
                    </button>
                </form>
            </div>
        </div>
    );
};

// Skeleton Loader for Requests
const RequestSkeleton = () => (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-md p-6">
        <div className="flex gap-4 mb-6">
            <div className="w-12 h-12 rounded-full animate-shimmer"></div>
            <div className="flex-1 space-y-2 py-1">
                <div className="h-4 animate-shimmer rounded w-32"></div>
                <div className="h-3 animate-shimmer rounded w-48"></div>
            </div>
            <div className="h-6 animate-shimmer rounded w-20"></div>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="h-12 animate-shimmer rounded-xl"></div>
            <div className="h-12 animate-shimmer rounded-xl"></div>
        </div>
        <div className="flex gap-3">
            <div className="h-10 animate-shimmer rounded-xl w-32"></div>
            <div className="h-10 animate-shimmer rounded-xl w-32"></div>
        </div>
    </div>
);

// Requests Page Component
const RequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('received');
    const [loading, setLoading] = useState(false);
    const [reviewModal, setReviewModal] = useState({ open: false, request: null });
    const [chatPanel, setChatPanel] = useState({ open: false, request: null });
    const { user } = useAuth();

    useEffect(() => {
        loadRequests();
    }, [activeTab]);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const response = await window.apiClient.getRequests({ type: activeTab });
            setRequests(response.requests || []);
        } catch (error) {
            console.error('Failed to load requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateRequestStatus = async (id, action) => {
        try {
            if (action === 'accept') {
                await window.apiClient.acceptRequest(id);
            } else if (action === 'reject') {
                await window.apiClient.rejectRequest(id);
            } else if (action === 'complete') {
                await window.apiClient.completeRequest(id);
            } else if (action === 'delete') {
                await window.apiClient.deleteRequest(id);
            }
            loadRequests();
        } catch (error) {
            alert('Failed to update request: ' + error.message);
        }
    };

    const handleUpdateMilestone = async (id, milestone) => {
        try {
            await window.apiClient.updateMilestone(id, milestone);
            loadRequests();
        } catch (e) {
            alert('Failed to update milestone: ' + e.message);
        }
    };

    const handleReviewSubmit = async (rating, text) => {
        try {
            const req = reviewModal.request;
            const partnerId = activeTab === 'received' ? req.sender.id : req.receiver.id;
            await window.apiClient.addReview(partnerId, rating, text);
            setReviewModal({ open: false, request: null });
        } catch (e) {
            alert('Failed to submit review: ' + e.message);
        }
    };

    if (loading && requests.length === 0) return (
        <div className="container mx-auto px-4 py-8 text-slate-100 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-white">My Swaps Workspace</h1>
            <div className="space-y-4">
                <RequestSkeleton />
                <RequestSkeleton />
                <RequestSkeleton />
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 text-slate-100 max-w-4xl animate-fadeIn">
            <h1 className="text-3xl font-bold mb-8 text-white">My Swaps Workspace</h1>
            
            <div className="mb-6 flex space-x-2 border-b border-slate-800">
                <button
                    onClick={() => setActiveTab('received')}
                    className={`px-6 py-3 font-medium text-sm transition-all duration-300 border-b-2 ${activeTab === 'received' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                >
                    Received Swaps
                </button>
                <button
                    onClick={() => setActiveTab('sent')}
                    className={`px-6 py-3 font-medium text-sm transition-all duration-300 border-b-2 ${activeTab === 'sent' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                >
                    Sent Swaps
                </button>
            </div>

            {requests.length === 0 && !loading && (
                <EmptyState icon="📭" title={`No ${activeTab} swaps`} description="You haven't received or sent any swap requests yet." />
            )}

            <div className="space-y-4">
                {requests.map((request) => {
                    const isAccepted = request.status === 'accepted';
                    const isCompleted = request.status === 'completed';
                    const partner = activeTab === 'received' ? request.sender : request.receiver;

                    return (
                        <div key={request.id} className="bg-slate-800/60 border border-slate-700 rounded-2xl shadow-md p-6 hover:border-brand-500/30 transition-all duration-300 hover-lift animate-fadeIn">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-xl font-bold border-2 border-slate-600">
                                        {partner.first_name ? partner.first_name[0].toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-white">
                                            {partner.first_name}
                                        </h3>
                                        <p className="text-slate-400 text-sm">{partner.email}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                        request.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                        request.status === 'accepted' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        request.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                        'bg-brand-500/10 text-brand-400 border-brand-500/20'
                                    }`}>
                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    </span>
                                    <span className="text-slate-500 text-xs mt-2">
                                        {new Date(request.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="bg-slate-900/50 rounded-xl p-4 mb-6 border border-slate-700/50 grid md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1">Offered Skill</span>
                                    <span className="text-slate-200 font-medium">{request.skill_offered}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1">Requested Skill</span>
                                    <span className="text-slate-200 font-medium">{request.skill_requested}</span>
                                </div>
                                {request.message && (
                                    <div className="md:col-span-2 mt-2 pt-4 border-t border-slate-700/50">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-2">Message</span>
                                        <p className="text-slate-300 text-sm bg-slate-800 p-3 rounded-lg border border-slate-700/50">"{request.message}"</p>
                                    </div>
                                )}
                            </div>

                            {/* Milestone Tracker for Accepted Swaps */}
                            {isAccepted && (
                                <div className="mb-6 bg-slate-900/30 p-4 rounded-xl border border-slate-700/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-sm font-semibold text-slate-300">Milestone Progress</h4>
                                        <select 
                                            value={request.milestone || ''} 
                                            onChange={(e) => handleUpdateMilestone(request.id, e.target.value)}
                                            className="bg-slate-800 border border-slate-600 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-brand-500 text-slate-200"
                                        >
                                            <option value="">Just Started</option>
                                            <option value="Intro Call Scheduled">Intro Call Scheduled</option>
                                            <option value="First Lesson Complete">First Lesson Complete</option>
                                            <option value="Midway">Midway Through</option>
                                            <option value="Final Review">Final Review</option>
                                        </select>
                                    </div>
                                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-brand-500 transition-all duration-500" 
                                             style={{ width: 
                                                request.milestone === 'Final Review' ? '100%' :
                                                request.milestone === 'Midway' ? '75%' :
                                                request.milestone === 'First Lesson Complete' ? '50%' :
                                                request.milestone === 'Intro Call Scheduled' ? '25%' : '5%'
                                             }}>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex flex-wrap gap-3">
                                {activeTab === 'received' && request.status === 'pending' && (
                                    <>
                                        <button onClick={() => updateRequestStatus(request.id, 'accept')} className="bg-green-600/20 text-green-400 border border-green-500/30 px-6 py-2 rounded-xl hover:bg-green-600 hover:text-white transition-all duration-300 font-medium text-sm hover:shadow-lg btn-ripple">
                                            Accept Request
                                        </button>
                                        <button onClick={() => updateRequestStatus(request.id, 'reject')} className="bg-red-600/20 text-red-400 border border-red-500/30 px-6 py-2 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300 font-medium text-sm hover:shadow-lg btn-ripple">
                                            Reject
                                        </button>
                                    </>
                                )}
                                {isAccepted && (
                                    <>
                                        <button onClick={() => setChatPanel({ open: true, request })} className="bg-slate-700 text-white px-6 py-2 rounded-xl hover:bg-slate-600 transition-all duration-300 font-medium text-sm shadow-md flex items-center gap-2 hover:shadow-lg btn-ripple">
                                            💬 Chat
                                        </button>
                                        {activeTab === 'received' && (
                                            <button onClick={() => { updateRequestStatus(request.id, 'complete'); setReviewModal({ open: true, request }); }} className="bg-brand-600 text-white px-6 py-2 rounded-xl hover:bg-brand-500 transition-all duration-300 font-medium text-sm shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30 btn-ripple">
                                                Mark as Completed
                                            </button>
                                        )}
                                        {activeTab === 'sent' && (
                                            <button onClick={() => { updateRequestStatus(request.id, 'complete'); setReviewModal({ open: true, request }); }} className="bg-brand-600 text-white px-6 py-2 rounded-xl hover:bg-brand-500 transition-all duration-300 font-medium text-sm shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30 btn-ripple">
                                                Mark as Completed
                                            </button>
                                        )}
                                    </>
                                )}
                                {activeTab === 'sent' && request.status === 'pending' && (
                                    <button onClick={() => updateRequestStatus(request.id, 'delete')} className="bg-slate-700 text-white border border-slate-600 px-6 py-2 rounded-xl hover:bg-red-600 hover:border-red-500 transition-all duration-300 font-medium text-sm hover:shadow-lg btn-ripple">
                                        Cancel Request
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <ReviewModal 
                isOpen={reviewModal.open} 
                onClose={() => setReviewModal({ open: false, request: null })} 
                partnerName={reviewModal.request ? (activeTab === 'received' ? reviewModal.request.sender.first_name : reviewModal.request.receiver.first_name) : ''}
                onSubmit={handleReviewSubmit}
            />
            
            <ChatPanel
                isOpen={chatPanel.open}
                onClose={() => setChatPanel({ open: false, request: null })}
                request={chatPanel.request}
                currentUser={user}
            />
        </div>
    );
};

// Profile Page Component
const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
    const { user } = useAuth();

    useEffect(() => {
        loadProfile();
        loadStats();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await window.apiClient.getMe();
            setProfile(response);
            setFormData({
                name: response.first_name || '',
                bio: response.bio || '',
                location: response.location || '',
                profile_image: response.profile_image || '',
                availability: response.availability || [],
                is_public: response.is_public
            });
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    };

    const loadStats = async () => {
        try {
            const response = await window.apiClient.getRequests();
            const reqs = response.requests || [];
            setStats({
                total: reqs.length,
                completed: reqs.filter(r => r.status === 'completed').length,
                pending: reqs.filter(r => r.status === 'pending').length
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const updateProfile = async () => {
        setLoading(true);
        try {
            await window.apiClient.updateProfile(formData);
            setEditing(false);
            loadProfile();
        } catch (error) {
            alert('Failed to update profile: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const addSkill = async (type, skill) => {
        try {
            if (type === 'offered') {
                await window.apiClient.addSkillOffered(skill);
            } else {
                await window.apiClient.addSkillWanted(skill);
            }
            loadProfile();
        } catch (error) {
            alert('Failed to add skill: ' + error.message);
        }
    };

    const removeSkill = async (type, skill) => {
        try {
            if (type === 'offered') {
                await window.apiClient.removeSkillOffered(skill);
            } else {
                await window.apiClient.removeSkillWanted(skill);
            }
            loadProfile();
        } catch (error) {
            alert('Failed to remove skill: ' + error.message);
        }
    };

    if (!profile) return <Loading />;

    // Calculate profile completeness
    let completeness = 0;
    if (profile.first_name) completeness += 20;
    if (profile.bio) completeness += 20;
    if (profile.location) completeness += 20;
    if (profile.profile_image) completeness += 20;
    if (profile.skills_offered?.length > 0 || profile.skills_wanted?.length > 0) completeness += 20;

    return (
        <div className="container mx-auto px-4 py-8 text-slate-100 max-w-5xl">
            {completeness < 100 && (
                <div className="bg-brand-600/20 border border-brand-500/30 rounded-2xl p-4 mb-6 animate-fadeIn">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-brand-300">Complete your profile to get 3x more matches!</span>
                        <span className="text-sm text-brand-400 font-bold">{completeness}% Complete</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-brand-500 to-brand-400 animate-progressFill" style={{ width: `${completeness}%` }}></div>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left Column: Profile Info & Stats */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl shadow-md p-6 text-center">
                        <div className="relative inline-block mb-4">
                            {profile.profile_image ? (
                                <img src={profile.profile_image} alt={profile.first_name} className="w-24 h-24 rounded-full object-cover border-4 border-brand-500" />
                            ) : (
                                <div className="w-24 h-24 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center text-white font-bold text-3xl border-4 border-brand-500 shadow-lg shadow-brand-500/30">
                                    {profile.first_name ? profile.first_name[0].toUpperCase() : 'U'}
                                </div>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">{profile.first_name || 'Unknown'}</h2>
                        <p className="text-slate-400 mb-4">{profile.email}</p>
                        
                        {profile.location && (
                            <p className="text-slate-300 text-sm flex items-center justify-center gap-1 mb-4">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                                {profile.location}
                            </p>
                        )}
                        
                        <div className="flex items-center justify-center space-x-1 text-yellow-400 mb-6">
                            <span>⭐</span>
                            <span className="font-semibold">{profile.rating ? profile.rating.toFixed(1) : 'New'}</span>
                            <span className="text-slate-500 text-sm">({profile.rating_count || 0} reviews)</span>
                        </div>
                        
                        <button
                            onClick={() => setEditing(!editing)}
                            className="w-full bg-brand-600 text-white px-4 py-2.5 rounded-xl hover:bg-brand-500 transition-all duration-300 shadow-md shadow-brand-500/20 font-medium hover:shadow-lg hover:shadow-brand-500/30 btn-ripple"
                        >
                            {editing ? 'Cancel Editing' : 'Edit Profile'}
                        </button>
                    </div>

                    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl shadow-md p-6">
                        <h3 className="font-bold text-white mb-4">Swap Statistics</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                <span className="text-slate-400">Total Swaps</span>
                                <span className="font-semibold text-white">{stats.total}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                <span className="text-slate-400">Completed</span>
                                <span className="font-semibold text-green-400">{stats.completed}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                <span className="text-slate-400">Pending</span>
                                <span className="font-semibold text-yellow-400">{stats.pending}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Bio, Skills, Availability */}
                <div className="md:col-span-2 space-y-6">
                    {editing ? (
                        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl shadow-md p-6 space-y-4 animate-in fade-in">
                            <h3 className="font-bold text-xl text-white mb-4">Edit Profile</h3>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-600"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Bio</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-600"
                                    rows="4"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-600"
                                    value={formData.location}
                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Profile Image URL</label>
                                <input
                                    type="url"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-600"
                                    value={formData.profile_image}
                                    onChange={(e) => setFormData({...formData, profile_image: e.target.value})}
                                />
                            </div>
                            <div className="flex items-center pt-2 pb-4">
                                <input
                                    type="checkbox"
                                    id="is_public"
                                    className="w-4 h-4 text-brand-600 bg-slate-900 border-slate-700 rounded focus:ring-brand-500 focus:ring-2"
                                    checked={formData.is_public}
                                    onChange={(e) => setFormData({...formData, is_public: e.target.checked})}
                                />
                                <label htmlFor="is_public" className="ml-2 text-sm font-medium text-slate-300">Public Profile</label>
                            </div>
                            <div className="flex justify-end pt-4 border-t border-slate-700/50">
                                <button
                                    onClick={updateProfile}
                                    disabled={loading}
                                    className="bg-brand-600 text-white px-6 py-2.5 rounded-xl hover:bg-brand-500 disabled:opacity-50 font-medium shadow-md shadow-brand-500/20"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl shadow-md p-6">
                                <h3 className="font-bold text-xl text-white mb-4">About Me</h3>
                                {profile.bio ? (
                                    <p className="text-slate-300 leading-relaxed">{profile.bio}</p>
                                ) : (
                                    <p className="text-slate-500 italic">No bio provided yet.</p>
                                )}
                            </div>

                            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl shadow-md p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-xl text-white">Skills Offered</h3>
                                    <button
                                        onClick={() => {
                                            const skill = prompt('Enter skill you can offer:');
                                            if (skill) addSkill('offered', skill);
                                        }}
                                        className="text-brand-400 hover:text-brand-300 text-sm font-medium px-3 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 transition-colors"
                                    >
                                        + Add Skill
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills_offered && profile.skills_offered.length > 0 ? (
                                        profile.skills_offered.map((skill, index) => (
                                            <span key={index} className="bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                                                {skill}
                                                <button
                                                    onClick={() => removeSkill('offered', skill)}
                                                    className="ml-2 text-green-500 hover:text-green-300 w-4 h-4 flex items-center justify-center rounded-full hover:bg-green-500/20 transition-colors"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-slate-500 text-sm italic w-full">You haven't added any skills to offer yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl shadow-md p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-xl text-white">Skills Wanted</h3>
                                    <button
                                        onClick={() => {
                                            const skill = prompt('Enter skill you want to learn:');
                                            if (skill) addSkill('wanted', skill);
                                        }}
                                        className="text-brand-400 hover:text-brand-300 text-sm font-medium px-3 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 transition-colors"
                                    >
                                        + Add Skill
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills_wanted && profile.skills_wanted.length > 0 ? (
                                        profile.skills_wanted.map((skill, index) => (
                                            <span key={index} className="bg-brand-500/10 border border-brand-500/20 text-brand-400 px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                                                {skill}
                                                <button
                                                    onClick={() => removeSkill('wanted', skill)}
                                                    className="ml-2 text-brand-500 hover:text-brand-300 w-4 h-4 flex items-center justify-center rounded-full hover:bg-brand-500/20 transition-colors"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-slate-500 text-sm italic w-full">You haven't added any skills you want to learn yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl shadow-md p-6">
                                <h3 className="font-bold text-xl text-white mb-4">My Reviews</h3>
                                {profile.reviews && profile.reviews.length > 0 ? (
                                    <div className="space-y-4">
                                        {profile.reviews.map(rev => (
                                            <div key={rev.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-semibold text-slate-200">{rev.reviewer_name}</span>
                                                    <span className="text-yellow-400">{"⭐".repeat(rev.rating)}</span>
                                                </div>
                                                <p className="text-slate-400 text-sm">{rev.text}</p>
                                                <div className="text-[10px] text-slate-500 mt-2">{new Date(rev.created_at).toLocaleDateString()}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState icon="⭐" title="No Reviews Yet" description="Complete swaps to get reviews from your partners." />
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Main App Component
const App = () => {
    const [currentView, setCurrentView] = useState('landing');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authTab, setAuthTab] = useState('login');
    const { user, loading } = useAuth();

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.slice(1) || '';
            
            // Handle auth modal opening logic
            if (!user && (hash === 'login' || hash === 'signup')) {
              setAuthTab(hash);
              setIsAuthModalOpen(true);
              return;
            }

            // If no hash or invalid hash for logged in users, default to appropriate page
            if (!hash || hash === 'login' || hash === 'signup') {
                if (user) {
                    const newHash = user.role === 'admin' ? 'admin-overview' : 'discover';
                    setCurrentView(newHash);
                    if (window.location.hash !== `#${newHash}`) {
                        window.history.replaceState(null, '', `#${newHash}`);
                    }
                } else {
                    setCurrentView('landing');
                    if (window.location.hash !== '') {
                        window.history.replaceState(null, '', ' ');
                    }
                }
                return;
            }
            
            setCurrentView(hash);
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [user]);

    const openAuthModal = (tab) => {
        setAuthTab(tab);
        setIsAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
    };

    if (loading) return <Loading />;

    const renderView = () => {
      if (!user) {
        return <LandingPage openAuthModal={openAuthModal} />;
      }
      if (user.role === 'admin') {
        switch (currentView) {
          case 'admin-stats':
            return <AdminStats />;
          case 'admin-users':
            return <AdminUsers />;
          case 'admin-overview':
          default:
            return <AdminOverview />;
        }
      }
      switch (currentView) {
        case 'requests':
          return <RequestsPage />;
        case 'profile':
          return <ProfilePage />;
        case 'discover':
        default:
          return <DiscoverPage />;
      }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <Navigation />
            {renderView()}
            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={closeAuthModal} 
                initialTab={authTab} 
            />
        </div>
    );
};

// Initialize the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>
);
