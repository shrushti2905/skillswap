// Main App Component
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
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
                    className="w-full bg-brand-600 text-white py-3 rounded-xl hover:bg-brand-500 transition-colors font-medium shadow-lg shadow-brand-500/20">
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
        <div ref={isLast ? lastUserElementRef : null} key={userItem.id} onClick={() => setDetailModal({ open: true, user: userItem })} className="cursor-pointer group bg-slate-800/40 border border-slate-700/50 hover:border-brand-500/50 rounded-2xl shadow-md p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-brand-500/10 hover:shadow-lg flex flex-col h-full">
            <div className="flex items-center mb-5">
                {userItem.profile_image ? (
                    <img src={userItem.profile_image} alt={userItem.first_name} className="w-14 h-14 rounded-full object-cover border-2 border-slate-700 group-hover:border-brand-500 transition-colors" />
                ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-slate-700 group-hover:border-brand-500 transition-colors">
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
                                <span key={idx} className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full text-xs font-medium">
                                    {skill}
                                </span>
                            ))
                        ) : <span className="text-slate-500 text-xs">No skills offered.</span>}
                    </div>
                </div>
            </div>
            
            <button
                onClick={(e) => { e.stopPropagation(); setRequestModal({ open: true, user: userItem }); }}
                className="w-full mt-auto bg-slate-700/50 text-brand-300 hover:text-white border border-brand-500/30 py-2.5 rounded-xl font-medium transition-all group-hover:bg-brand-600 group-hover:border-brand-500"
            >
                Request Swap
            </button>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 text-slate-100">
            {toast.show && (
                <div className={`fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 transition-all ${toast.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-green-500/90 text-white'}`}>
                    {toast.message}
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
        <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-slate-800 border-l border-slate-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-sm">{partner.first_name?.[0]}</span>
                    Chat with {partner.first_name}
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-slate-500 mt-10">No messages yet. Say hi!</div>
                ) : (
                    messages.map(msg => {
                        const isMe = msg.sender_id === currentUser.id;
                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMe ? 'bg-brand-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                    {msg.text}
                                </div>
                                <span className="text-[10px] text-slate-500 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</span>
                            </div>
                        );
                    })
                )}
            </div>
            <div className="p-4 border-t border-slate-700 bg-slate-900/50">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    <button type="submit" disabled={loading || !text.trim()} className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center hover:bg-brand-500 disabled:opacity-50">
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
        <div className="container mx-auto px-4 py-8 text-slate-100 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-white">My Swaps Workspace</h1>
            
            <div className="mb-6 flex space-x-2 border-b border-slate-800">
                <button
                    onClick={() => setActiveTab('received')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'received' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                >
                    Received Swaps
                </button>
                <button
                    onClick={() => setActiveTab('sent')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'sent' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
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
                        <div key={request.id} className="bg-slate-800/60 border border-slate-700 rounded-2xl shadow-md p-6 hover:border-brand-500/30 transition-colors">
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
                                        <button onClick={() => updateRequestStatus(request.id, 'accept')} className="bg-green-600/20 text-green-400 border border-green-500/30 px-6 py-2 rounded-xl hover:bg-green-600 hover:text-white transition-colors font-medium text-sm">
                                            Accept Request
                                        </button>
                                        <button onClick={() => updateRequestStatus(request.id, 'reject')} className="bg-red-600/20 text-red-400 border border-red-500/30 px-6 py-2 rounded-xl hover:bg-red-600 hover:text-white transition-colors font-medium text-sm">
                                            Reject
                                        </button>
                                    </>
                                )}
                                {isAccepted && (
                                    <>
                                        <button onClick={() => setChatPanel({ open: true, request })} className="bg-slate-700 text-white px-6 py-2 rounded-xl hover:bg-slate-600 transition-colors font-medium text-sm shadow-md flex items-center gap-2">
                                            💬 Chat
                                        </button>
                                        {activeTab === 'received' && (
                                            <button onClick={() => { updateRequestStatus(request.id, 'complete'); setReviewModal({ open: true, request }); }} className="bg-brand-600 text-white px-6 py-2 rounded-xl hover:bg-brand-500 transition-colors font-medium text-sm shadow-md shadow-brand-500/20">
                                                Mark as Completed
                                            </button>
                                        )}
                                        {activeTab === 'sent' && (
                                            <button onClick={() => { updateRequestStatus(request.id, 'complete'); setReviewModal({ open: true, request }); }} className="bg-brand-600 text-white px-6 py-2 rounded-xl hover:bg-brand-500 transition-colors font-medium text-sm shadow-md shadow-brand-500/20">
                                                Mark as Completed
                                            </button>
                                        )}
                                    </>
                                )}
                                {activeTab === 'sent' && request.status === 'pending' && (
                                    <button onClick={() => updateRequestStatus(request.id, 'delete')} className="bg-slate-700 text-white border border-slate-600 px-6 py-2 rounded-xl hover:bg-red-600 hover:border-red-500 transition-colors font-medium text-sm">
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
