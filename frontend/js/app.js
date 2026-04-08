// Main App Component
// Version: 1.0.1 - Premium UI Update
const { useState, useEffect, useRef } = React;
const { AuthProvider, Navigation, AuthModal, LandingPage, Loading, useAuth, AdminOverview, AdminUsers, AdminStats } = window.SkillSwapComponents;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-semibold text-white mb-4">Swap with {userItem.first_name}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">I will offer:</label>
            <input type="text" className="w-full px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-100"
                   value={skillOffered} onChange={(e) => setSkillOffered(e.target.value)} placeholder="e.g. JavaScript" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">I want to learn:</label>
            <input type="text" className="w-full px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-100"
                   value={skillRequested} onChange={(e) => setSkillRequested(e.target.value)} placeholder="e.g. Python" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Message (optional):</label>
            <textarea className="w-full px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-100"
                      rows="3" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Hi, let's swap skills!"></textarea>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors">Cancel</button>
            <button onClick={() => onSubmit(skillOffered, skillRequested, message)}
                    className="px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-500 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#111827] border border-gray-700 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors duration-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="flex items-center gap-6 mb-8">
                    {userItem.profile_image ? (
                        <img src={userItem.profile_image} alt={userItem.first_name} className="w-24 h-24 rounded-2xl object-cover border-2 border-purple-500 shadow-lg shadow-purple-500/30" />
                    ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl border-2 border-purple-500 shadow-lg shadow-purple-500/30">
                            {userItem.first_name ? userItem.first_name[0].toUpperCase() : 'U'}
                        </div>
                    )}
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight mb-1">{userItem.first_name || 'Unknown'}</h2>
                        <p className="text-slate-400 mb-2">{userItem.location || 'Unknown Location'}</p>
                        <div className="flex items-center gap-1 text-yellow-400">
                            <span>⭐</span>
                            <span className="font-semibold">{userItem.rating ? userItem.rating.toFixed(1) : 'New'}</span>
                            <span className="text-slate-500 text-sm">({userItem.rating_count || 0} reviews)</span>
                        </div>
                    </div>
                </div>
                
                {userItem.bio && (
                    <div className="mb-8">
                        <h3 className="font-semibold text-slate-300 mb-3 text-lg">About Me</h3>
                        <p className="text-slate-400 bg-[#0b1220] p-5 rounded-xl border border-gray-700/50">{userItem.bio}</p>
                    </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <h3 className="font-semibold text-slate-300 mb-4 text-lg">Skills Offered</h3>
                        <div className="flex flex-wrap gap-2">
                            {userItem.skills_offered?.map((s, i) => (
                                <span key={i} className="bg-green-500/10 text-green-400 px-4 py-2 rounded-full text-sm border border-green-500/20 font-medium">{s}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-300 mb-4 text-lg">Skills Wanted</h3>
                        <div className="flex flex-wrap gap-2">
                            {userItem.skills_wanted?.map((s, i) => (
                                <span key={i} className="bg-purple-500/10 text-purple-400 px-4 py-2 rounded-full text-sm border border-purple-500/20 font-medium">{s}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {userItem.reviews && userItem.reviews.length > 0 && (
                    <div className="mb-8">
                        <h3 className="font-semibold text-slate-300 mb-4 text-lg">Recent Reviews</h3>
                        <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                            {userItem.reviews.map((rev) => (
                                <div key={rev.id} className="bg-[#0b1220] p-4 rounded-xl border border-gray-700/50">
                                    <div className="flex justify-between items-center mb-2">
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
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-4 rounded-xl hover:brightness-110 hover:scale-[1.02] transition-all duration-200 font-medium shadow-lg shadow-purple-500/30">
                    Request Swap
                </button>
            </div>
        </div>
    );
};

// Skeleton Loader
const UserCardSkeleton = () => (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-md p-6 h-full flex flex-col animate-pulse">
        <div className="flex items-center mb-5">
            <div className="w-14 h-14 rounded-full bg-slate-700"></div>
            <div className="ml-4 space-y-2">
                <div className="h-4 bg-slate-700 rounded w-24"></div>
                <div className="h-3 bg-slate-700 rounded w-32"></div>
            </div>
        </div>
        <div className="space-y-2 mb-5">
            <div className="h-3 bg-slate-700 rounded w-full"></div>
            <div className="h-3 bg-slate-700 rounded w-4/5"></div>
        </div>
        <div className="mt-auto space-y-4">
            <div>
                <div className="h-3 bg-slate-700 rounded w-16 mb-2"></div>
                <div className="flex gap-2">
                    <div className="h-5 bg-slate-700 rounded w-16"></div>
                    <div className="h-5 bg-slate-700 rounded w-20"></div>
                </div>
            </div>
            <div className="h-10 bg-slate-700 rounded-xl w-full mt-4"></div>
        </div>
    </div>
);

// Empty State Component
const EmptyState = ({ icon, title, description, action }) => (
    <div className="text-center py-20 bg-[#111827] border border-gray-700 rounded-2xl my-8 flex flex-col items-center justify-center shadow-md">
        <div className="text-7xl mb-6 opacity-50">{icon}</div>
        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">{description}</p>
        {action && action}
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
        <div ref={isLast ? lastUserElementRef : null} key={userItem.id} onClick={() => setDetailModal({ open: true, user: userItem })} className="cursor-pointer group bg-[#111827] border border-gray-700 hover:border-purple-500/50 rounded-2xl shadow-md p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 flex flex-col h-full">
            <div className="flex items-center mb-6">
                {userItem.profile_image ? (
                    <img src={userItem.profile_image} alt={userItem.first_name} className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-700 group-hover:border-purple-500 transition-colors duration-200 shadow-md" />
                ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl border-2 border-gray-700 group-hover:border-purple-500 transition-colors duration-200 shadow-lg shadow-purple-500/20">
                        {userItem.first_name ? userItem.first_name[0].toUpperCase() : 'U'}
                    </div>
                )}
                <div className="ml-4 flex-1">
                    <h3 className="font-semibold text-lg text-white group-hover:text-purple-400 transition-colors duration-200 tracking-tight">{userItem.first_name || 'Unknown'}</h3>
                    <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                        {userItem.location || 'Unknown Location'}
                    </p>
                </div>
            </div>
            
            {userItem.bio && (
                <p className="text-slate-300 text-sm mb-6 line-clamp-2 leading-relaxed">{userItem.bio}</p>
            )}
            
            <div className="mb-6 flex-grow">
                <div className="mb-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Offers</h4>
                    <div className="flex flex-wrap gap-2">
                        {userItem.skills_offered && userItem.skills_offered.length > 0 ? (
                            userItem.skills_offered.slice(0,3).map((skill, idx) => (
                                <span key={idx} className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-full text-xs font-medium">
                                    {skill}
                                </span>
                            ))
                        ) : <span className="text-slate-500 text-xs">No skills offered.</span>}
                    </div>
                </div>
            </div>
            
            <button
                onClick={(e) => { e.stopPropagation(); setRequestModal({ open: true, user: userItem }); }}
                className="w-full mt-auto bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 rounded-xl font-medium transition-all duration-200 hover:brightness-110 hover:scale-[1.02] shadow-lg shadow-purple-500/20"
            >
                Request Swap
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0b1220] py-8">
            <div className="container mx-auto px-6 text-slate-100">
            {toast.show && (
                <div className={`fixed top-24 right-6 p-4 rounded-xl shadow-2xl z-50 transition-all animate-in slide-in-from-right duration-300 ${toast.type === 'error' ? 'bg-red-500/90 text-white border border-red-400' : 'bg-green-500/90 text-white border border-green-400'}`}>
                    {toast.message}
                </div>
            )}
            
            <h1 className="text-4xl font-bold mb-8 text-white tracking-tight">Discover Skills & People</h1>
            
            {/* Advanced Filtering & Sorting */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#111827] p-6 rounded-2xl border border-gray-700 shadow-md">
                <div className="relative">
                    <input type="text" placeholder="Search name/location..." className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0b1220] border border-gray-700 text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" value={search} onChange={e => setSearch(e.target.value)} />
                    <span className="absolute left-3 top-3.5 text-slate-400">🔍</span>
                </div>
                <div className="relative">
                    <input type="text" placeholder="Filter by skill..." className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0b1220] border border-gray-700 text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" value={skillFilter} onChange={e => setSkillFilter(e.target.value)} />
                    <span className="absolute left-3 top-3.5 text-slate-400">🏷️</span>
                </div>
                <div>
                    <select className="w-full px-4 py-3 rounded-xl bg-[#0b1220] border border-gray-700 text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" value={sort} onChange={e => setSort(e.target.value)}>
                        <option value="">Sort By...</option>
                        <option value="highest_rated">Highest Rated</option>
                        <option value="online_now">Online Now</option>
                    </select>
                </div>
                <div>
                    <select className="w-full px-4 py-3 rounded-xl bg-[#0b1220] border border-gray-700 text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" value={availability} onChange={e => setAvailability(e.target.value)}>
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
                    <h2 className="text-2xl font-bold mb-6 text-purple-400 flex items-center gap-2 tracking-tight">✨ Recommended for You</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {recommendedUsers.map((u, i) => renderUserCard(u, false))}
                    </div>
                </div>
            )}

            <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">All Users</h2>

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
        </div>
    );
};

// Review Modal
const ReviewModal = ({ isOpen, onClose, partnerName, onSubmit }) => {
    const [rating, setRating] = useState(5);
    const [text, setText] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
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
                        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors">Skip</button>
                        <button onClick={() => onSubmit(rating, text)}
                                className="px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-500 transition-colors">Submit Review</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Chat Panel
const ChatPanel = ({ isOpen, onClose, request, currentUser, embedded = false }) => {
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

    const containerClass = embedded 
        ? "bg-[#111827] border border-gray-700 rounded-2xl flex flex-col h-[600px] shadow-md"
        : "fixed inset-y-0 right-0 w-full md:w-96 bg-[#111827] border-l border-gray-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300";

    return (
        <div className={containerClass}>
            <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-[#0b1220]">
                <h3 className="font-bold text-white flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-sm shadow-md">{partner.first_name?.[0]}</span>
                    <span className="tracking-tight">Chat with {partner.first_name}</span>
                </h3>
                {!embedded && (
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors duration-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#0b1220]">
                {messages.length === 0 ? (
                    <div className="text-center text-slate-500 mt-16">
                        <div className="text-5xl mb-4 opacity-50">👋</div>
                        <p>No messages yet. Say hi!</p>
                    </div>
                ) : (
                    messages.map(msg => {
                        const isMe = msg.sender_id === currentUser.id;
                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-md ${isMe ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-br-none' : 'bg-[#111827] text-slate-200 rounded-bl-none border border-gray-700'}`}>
                                    {msg.text}
                                </div>
                                <span className="text-[10px] text-slate-500 mt-1.5">{new Date(msg.created_at).toLocaleTimeString()}</span>
                            </div>
                        );
                    })
                )}
            </div>
            <div className="p-5 border-t border-gray-700 bg-[#0b1220]">
                <form onSubmit={handleSend} className="flex gap-3">
                    <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..." className="flex-1 px-5 py-3 rounded-xl bg-[#111827] border border-gray-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" />
                    <button type="submit" disabled={loading || !text.trim()} className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center justify-center hover:brightness-110 hover:scale-105 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-purple-500/20">
                        ➤
                    </button>
                </form>
            </div>
        </div>
    );
};

// Skeleton Loader for Requests
const RequestSkeleton = () => (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-md p-6 animate-pulse">
        <div className="flex gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-slate-700"></div>
            <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-slate-700 rounded w-32"></div>
                <div className="h-3 bg-slate-700 rounded w-48"></div>
            </div>
            <div className="h-6 bg-slate-700 rounded w-20"></div>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="h-12 bg-slate-700 rounded-xl"></div>
            <div className="h-12 bg-slate-700 rounded-xl"></div>
        </div>
        <div className="flex gap-3">
            <div className="h-10 bg-slate-700 rounded-xl w-32"></div>
            <div className="h-10 bg-slate-700 rounded-xl w-32"></div>
        </div>
    </div>
);

// Home Dashboard Page Component
const HomePage = () => {
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, active: 0 });
    const [recommendedUsers, setRecommendedUsers] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // Load user stats
            const requestsResponse = await window.apiClient.getRequests();
            const requests = requestsResponse.requests || [];
            
            setStats({
                skillsOffered: user.skills_offered?.length || 0,
                skillsWanted: user.skills_wanted?.length || 0,
                activeRequests: requests.filter(r => r.status === 'accepted').length,
                completedSwaps: requests.filter(r => r.status === 'completed').length,
                rating: user.rating || 0
            });

            // Load recommended users (users who offer what I want)
            if (user.skills_wanted && user.skills_wanted.length > 0) {
                const usersResponse = await window.apiClient.getUsers({ limit: 4 });
                const allUsers = usersResponse.users || [];
                const recommended = allUsers.filter(u => 
                    u.id !== user.id && u.skills_offered?.some(s => user.skills_wanted.includes(s))
                ).slice(0, 4);
                setRecommendedUsers(recommended);
            }

            // Recent activity (last 5 requests)
            setRecentActivity(requests.slice(0, 5));
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-[#0b1220] py-8">
            <div className="max-w-7xl mx-auto px-6">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-8 mb-8 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user.first_name || 'User'}! 👋</h1>
                            <p className="text-purple-100 text-lg mb-3">Find people to exchange skills and grow together.</p>
                            <span className="inline-block bg-white/20 text-white text-sm px-4 py-1.5 rounded-full backdrop-blur-sm">
                                💡 Keep your profile updated for better matches
                            </span>
                        </div>
                        <div className="hidden md:block text-6xl opacity-20">🎯</div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="bg-[#111827] border border-gray-700 rounded-xl p-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                        <div className="text-3xl mb-3">📚</div>
                        <div className="text-3xl font-bold text-white mb-1">{stats.skillsOffered}</div>
                        <div className="text-sm text-slate-400">Skills Offered</div>
                    </div>
                    
                    <div className="bg-[#111827] border border-gray-700 rounded-xl p-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                        <div className="text-3xl mb-3">🎓</div>
                        <div className="text-3xl font-bold text-white mb-1">{stats.skillsWanted}</div>
                        <div className="text-sm text-slate-400">Skills Wanted</div>
                    </div>
                    
                    <div className="bg-[#111827] border border-gray-700 rounded-xl p-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                        <div className="text-3xl mb-3">🔄</div>
                        <div className="text-3xl font-bold text-green-400 mb-1">{stats.activeRequests}</div>
                        <div className="text-sm text-slate-400">Active Swaps</div>
                    </div>
                    
                    <div className="bg-[#111827] border border-gray-700 rounded-xl p-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                        <div className="text-3xl mb-3">✅</div>
                        <div className="text-3xl font-bold text-purple-400 mb-1">{stats.completedSwaps}</div>
                        <div className="text-sm text-slate-400">Completed</div>
                    </div>
                    
                    <div className="bg-[#111827] border border-gray-700 rounded-xl p-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                        <div className="text-3xl mb-3">⭐</div>
                        <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.rating > 0 ? stats.rating.toFixed(1) : 'New'}</div>
                        <div className="text-sm text-slate-400">Your Rating</div>
                    </div>
                </div>

                {/* Recommended Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white tracking-tight">✨ Recommended for You</h2>
                        {recommendedUsers.length > 0 && (
                            <a href="#discover" className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors duration-200">
                                See all →
                            </a>
                        )}
                    </div>
                    
                    {recommendedUsers.length === 0 ? (
                        <div className="bg-[#111827] border border-gray-700 rounded-2xl p-12 text-center">
                            <div className="text-5xl mb-4 opacity-50">🎯</div>
                            <h3 className="text-lg font-semibold text-white mb-2">No recommendations yet</h3>
                            <p className="text-slate-400 mb-4">Add more skills to your profile to get personalized matches.</p>
                            <a href="#profile" className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:brightness-110 hover:scale-105 transition-all duration-200 font-medium shadow-lg shadow-purple-500/30">
                                Update Profile
                            </a>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {recommendedUsers.map(userItem => (
                                <div key={userItem.id} onClick={() => window.location.hash = '#discover'} className="cursor-pointer group bg-[#111827] border border-gray-700 hover:border-purple-500/50 rounded-2xl shadow-md p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10">
                                    <div className="flex items-center mb-4">
                                        {userItem.profile_image ? (
                                            <img src={userItem.profile_image} alt={userItem.first_name} className="w-12 h-12 rounded-xl object-cover border-2 border-gray-700 group-hover:border-purple-500 transition-colors duration-200" />
                                        ) : (
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                                                {userItem.first_name?.[0] || 'U'}
                                            </div>
                                        )}
                                        <div className="ml-3">
                                            <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors duration-200">{userItem.first_name}</h3>
                                            <p className="text-xs text-slate-400">{userItem.location || 'Unknown'}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {userItem.skills_offered?.slice(0, 2).map((skill, idx) => (
                                            <span key={idx} className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-full text-xs">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white tracking-tight mb-6">📊 Recent Activity</h2>
                    
                    {recentActivity.length === 0 ? (
                        <div className="bg-[#111827] border border-gray-700 rounded-2xl p-12 text-center">
                            <div className="text-5xl mb-4 opacity-50">📭</div>
                            <h3 className="text-lg font-semibold text-white mb-2">No recent activity yet</h3>
                            <p className="text-slate-400 mb-4">Start swapping skills to see your activity here.</p>
                            <a href="#discover" className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:brightness-110 hover:scale-105 transition-all duration-200 font-medium shadow-lg shadow-purple-500/30">
                                Discover People
                            </a>
                        </div>
                    ) : (
                        <div className="bg-[#111827] border border-gray-700 rounded-2xl divide-y divide-gray-700">
                            {recentActivity.map(activity => {
                                const partner = activity.sender.id === user.id ? activity.receiver : activity.sender;
                                return (
                                    <div key={activity.id} className="p-5 hover:bg-[#1f2937] transition-colors duration-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                                    {partner.first_name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">
                                                        {activity.status === 'pending' && 'Swap request with '}
                                                        {activity.status === 'accepted' && 'Active swap with '}
                                                        {activity.status === 'completed' && 'Completed swap with '}
                                                        <span className="text-purple-400">{partner.first_name}</span>
                                                    </p>
                                                    <p className="text-sm text-slate-400">
                                                        {activity.skill_offered} ↔ {activity.skill_requested}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    activity.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                    activity.status === 'accepted' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                    'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                }`}>
                                                    {activity.status}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {new Date(activity.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <a href="#discover" className="bg-[#111827] border border-gray-700 rounded-2xl p-6 hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-200 group">
                        <div className="text-4xl mb-3">🔍</div>
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">Discover People</h3>
                        <p className="text-sm text-slate-400">Find skilled individuals to swap knowledge with</p>
                    </a>
                    
                    <a href="#requests" className="bg-[#111827] border border-gray-700 rounded-2xl p-6 hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-200 group">
                        <div className="text-4xl mb-3">💼</div>
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">My Swaps</h3>
                        <p className="text-sm text-slate-400">Manage your active and pending swaps</p>
                    </a>
                    
                    <a href="#profile" className="bg-[#111827] border border-gray-700 rounded-2xl p-6 hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-200 group">
                        <div className="text-4xl mb-3">👤</div>
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">Edit Profile</h3>
                        <p className="text-sm text-slate-400">Update your skills and information</p>
                    </a>
                </div>
            </div>
        </div>
    );
};

// Messages Page Component
const MessagesPage = () => {
    const [activeChats, setActiveChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        loadActiveChats();
    }, []);

    const loadActiveChats = async () => {
        try {
            const data = await window.apiClient.getRequests();
            // Filter only accepted requests (active chats)
            const accepted = data.filter(r => r.status === 'accepted');
            setActiveChats(accepted);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-[#0b1220] py-8">
            <div className="container mx-auto px-6">
                <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">Messages</h1>
                
                {activeChats.length === 0 ? (
                    <EmptyState 
                        icon="💬" 
                        title="No Active Chats" 
                        description="Accept a swap request to start chatting with your swap partner."
                        action={
                            <a href="#discover" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:brightness-110 hover:scale-105 transition-all duration-200 font-medium shadow-lg shadow-purple-500/30">
                                Discover People
                            </a>
                        }
                    />
                ) : (
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Chat List */}
                        <div className="lg:col-span-1 bg-[#111827] border border-gray-700 rounded-2xl p-6 space-y-3 shadow-md">
                            <h2 className="font-semibold text-white mb-4 text-lg tracking-tight">Active Chats</h2>
                            {activeChats.map(chat => {
                                const partner = chat.sender_id === user.id ? chat.receiver : chat.sender;
                                const isSelected = selectedChat?.id === chat.id;
                                
                                return (
                                    <button
                                        key={chat.id}
                                        onClick={() => setSelectedChat(chat)}
                                        className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                                            isSelected 
                                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/20' 
                                                : 'bg-[#0b1220] hover:bg-[#1f2937] text-slate-300 border border-gray-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                                                {partner.first_name?.[0] || 'U'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">{partner.first_name}</div>
                                                <div className={`text-sm truncate ${isSelected ? 'text-purple-100' : 'text-slate-500'}`}>
                                                    {chat.skill_offered} ↔ {chat.skill_requested}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Chat Panel */}
                        <div className="lg:col-span-2">
                            {selectedChat ? (
                                <ChatPanel
                                    isOpen={true}
                                    onClose={() => setSelectedChat(null)}
                                    request={selectedChat}
                                    currentUser={user}
                                    embedded={true}
                                />
                            ) : (
                                <div className="bg-[#111827] border border-gray-700 rounded-2xl p-16 text-center shadow-md">
                                    <div className="text-7xl mb-6 opacity-50">💬</div>
                                    <h3 className="text-2xl font-semibold text-white mb-3 tracking-tight">Select a Chat</h3>
                                    <p className="text-slate-400">Choose a conversation from the list to start messaging</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

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
        <div className="min-h-screen bg-[#0b1220] py-8">
            <div className="container mx-auto px-6 text-slate-100 max-w-5xl">
            <h1 className="text-4xl font-bold mb-8 text-white tracking-tight">My Swaps Workspace</h1>
            
            <div className="mb-8 flex space-x-2 border-b border-gray-800">
                <button
                    onClick={() => setActiveTab('received')}
                    className={`px-6 py-3 font-semibold text-sm transition-all duration-200 border-b-2 ${activeTab === 'received' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                >
                    Received Swaps
                </button>
                <button
                    onClick={() => setActiveTab('sent')}
                    className={`px-6 py-3 font-semibold text-sm transition-all duration-200 border-b-2 ${activeTab === 'sent' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
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
                        <div key={request.id} className="bg-[#111827] border border-gray-700 rounded-2xl shadow-md p-6 hover:border-purple-500/30 hover:-translate-y-1 transition-all duration-200">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-purple-500/20">
                                        {partner.first_name ? partner.first_name[0].toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-white tracking-tight">
                                            {partner.first_name}
                                        </h3>
                                        <p className="text-slate-400 text-sm">{partner.email}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-medium border ${
                                        request.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                        request.status === 'accepted' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        request.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                        'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                    }`}>
                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    </span>
                                    <span className="text-slate-500 text-xs">
                                        {new Date(request.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="bg-[#0b1220] rounded-xl p-5 mb-6 border border-gray-700/50">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-2">You Offer</span>
                                        <span className="text-slate-200 font-medium text-lg">{request.skill_offered}</span>
                                    </div>
                                    <div className="text-purple-400 text-2xl">→</div>
                                    <div className="flex-1 text-right">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-2">You Want</span>
                                        <span className="text-slate-200 font-medium text-lg">{request.skill_requested}</span>
                                    </div>
                                </div>
                                {request.message && (
                                    <div className="mt-5 pt-5 border-t border-gray-700/50">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-2">Message</span>
                                        <p className="text-slate-300 text-sm bg-[#111827] p-4 rounded-lg border border-gray-700/50">"{request.message}"</p>
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
                                        <button onClick={() => updateRequestStatus(request.id, 'accept')} className="bg-green-500/20 text-green-400 border border-green-500/30 px-6 py-3 rounded-xl hover:bg-green-500 hover:text-white hover:scale-105 transition-all duration-200 font-medium text-sm shadow-md">
                                            ✓ Accept Request
                                        </button>
                                        <button onClick={() => updateRequestStatus(request.id, 'reject')} className="bg-red-500/20 text-red-400 border border-red-500/30 px-6 py-3 rounded-xl hover:bg-red-500 hover:text-white hover:scale-105 transition-all duration-200 font-medium text-sm shadow-md">
                                            ✕ Reject
                                        </button>
                                    </>
                                )}
                                {isAccepted && (
                                    <>
                                        <button onClick={() => setChatPanel({ open: true, request })} className="bg-[#0b1220] border border-gray-700 text-white px-6 py-3 rounded-xl hover:bg-[#1f2937] hover:scale-105 transition-all duration-200 font-medium text-sm shadow-md flex items-center gap-2">
                                            💬 Chat
                                        </button>
                                        {activeTab === 'received' && (
                                            <button onClick={() => { updateRequestStatus(request.id, 'complete'); setReviewModal({ open: true, request }); }} className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-xl hover:brightness-110 hover:scale-105 transition-all duration-200 font-medium text-sm shadow-lg shadow-purple-500/20">
                                                ✓ Mark as Completed
                                            </button>
                                        )}
                                        {activeTab === 'sent' && (
                                            <button onClick={() => { updateRequestStatus(request.id, 'complete'); setReviewModal({ open: true, request }); }} className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-xl hover:brightness-110 hover:scale-105 transition-all duration-200 font-medium text-sm shadow-lg shadow-purple-500/20">
                                                ✓ Mark as Completed
                                            </button>
                                        )}
                                    </>
                                )}
                                {activeTab === 'sent' && request.status === 'pending' && (
                                    <button onClick={() => updateRequestStatus(request.id, 'delete')} className="bg-red-500/20 text-red-400 border border-red-500/30 px-6 py-3 rounded-xl hover:bg-red-500 hover:text-white hover:scale-105 transition-all duration-200 font-medium text-sm shadow-md">
                                        ❌ Cancel Request
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
                <div className="bg-brand-600/20 border border-brand-500/30 rounded-2xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-brand-300">Complete your profile to get 3x more matches!</span>
                        <span className="text-sm text-brand-400 font-bold">{completeness}% Complete</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-1000" style={{ width: `${completeness}%` }}></div>
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
                            className="w-full bg-brand-600 text-white px-4 py-2.5 rounded-xl hover:bg-brand-500 transition-colors shadow-md shadow-brand-500/20 font-medium"
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
                    const newHash = user.role === 'admin' ? 'admin-overview' : 'home';
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
        case 'home':
          return <HomePage />;
        case 'discover':
          return <DiscoverPage />;
        case 'messages':
          return <MessagesPage />;
        case 'requests':
          return <RequestsPage />;
        case 'profile':
          return <ProfilePage />;
        default:
          return <HomePage />;
      }
    };

    return (
        <div className="min-h-screen bg-[#0b1220] text-slate-100">
            <Navigation openAuthModal={openAuthModal} />
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
