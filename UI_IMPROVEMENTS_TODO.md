# UI Improvements TODO

## ✅ COMPLETED
- Admin Users: Status badges, pagination, avatars, hover effects
- Admin Stats: Fixed metrics, 3-col layout, chart with labels & tooltips

## 🔄 IN PROGRESS - User Pages

### 1. MY REQUESTS PAGE (Priority: HIGH)
- [ ] Active tab styling (purple background)
- [ ] Skill direction UI: "You Offer → X" / "You Want → Y" with arrow
- [ ] Status badge + date grouped top-right
- [ ] Cancel button as red outline with ❌ icon
- [ ] Card hover effect (scale/glow)

### 2. DISCOVER PAGE (Priority: HIGH)
- [ ] Add "Clear Filters" button
- [ ] Status indicators: 🟢 Online / 🟡 Busy / ⚫ Offline
- [ ] Rating display: ⭐ 4.2 (23 reviews) or "No ratings yet"
- [ ] "Request Swap" → primary purple, "Quick View" → secondary
- [ ] Empty skills: "No skills added yet"
- [ ] Filter count indicator: "Filters (3)"

### 3. MESSAGES PAGE (Priority: HIGH)
- [ ] Proper empty state with illustration
- [ ] CTA button: "Discover People"
- [ ] 2-column layout even when empty

### 4. HOME DASHBOARD (Priority: MEDIUM)
- [ ] Hero CTA buttons: "Find People", "Edit Profile"
- [ ] Fix "New User Rating" → show numeric or "No ratings yet"
- [ ] Recommended section CTA: "Add skills to get recommendations"
- [ ] Recent Activity hint: "Your swaps will appear here"

### 5. PROFILE DROPDOWN (Priority: LOW)
- [ ] Add icons: 👤 Profile, ⚙️ Settings, 🚪 Logout
- [ ] Divider before logout
- [ ] Red color for logout

## 🎨 GLOBAL IMPROVEMENTS

### Button Hierarchy
- Primary: Purple (#8b5cf6)
- Secondary: Dark outline
- Danger: Red (Delete only)
- Ghost: Minimal

### Status System (Use Everywhere)
- 🟢 Active / Online
- 🟡 Pending
- 🔴 Blocked
- ⚫ Offline

### Card Design System
- Border radius: consistent (rounded-2xl)
- Padding: 16-20px
- Hover effect everywhere

### Typography
- Titles → bold (font-semibold/font-bold)
- Labels → muted (text-slate-400)
- Values → bright (text-white)

### Micro Interactions
- Hover states on all interactive elements
- Click animations
- Loading skeletons

## 📝 IMPLEMENTATION NOTES

Current checkpoint: `c6301e9`
Admin improvements complete.
User pages need implementation in next session.

Focus order:
1. My Requests skill direction UI
2. Messages empty state
3. Discover page polish
4. Home dashboard fixes
