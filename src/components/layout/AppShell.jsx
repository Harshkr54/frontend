import { NavLink, useNavigate } from 'react-router-dom';
import {
  Cloud,
  HardDrive,
  LayoutDashboard,
  Share2,
  Star,
  Trash2,
  Menu,
  X,
  User,
  LogOut,
  Search,
  Command,
  Tag as TagIcon,
  Zap,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { StorageIndicator } from '../common/ui.jsx';
import { ThemeToggle } from '../common/ThemeToggle.jsx';
import { LogoutConfirmationModal } from '../auth/LogoutConfirmationModal.jsx';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../../services/publicLink.api.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useSearch } from '../../hooks/useSearch.js';
import { getFileIcon } from '../../utils/fileIcons.js';
import { useTags } from '../../hooks/useTags.js';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/drive', label: 'My Drive', icon: HardDrive },
  { to: '/shared', label: 'Shared with me', icon: Share2 },
  { to: '/starred', label: 'Starred', icon: Star },
  { to: '/trash', label: 'Trash', icon: Trash2 },
  { to: '/pricing', label: 'Upgrade Plans', icon: Zap },
];

export function AppShell({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [q, setQ] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const debouncedQ = useDebounce(q.trim(), 300);
  const { data: searchData, isLoading: isSearching } = useSearch(
    { q: debouncedQ, limit: 6 },
    Boolean(debouncedQ)
  );

  const navigate = useNavigate();
  const storageQuery = useQuery({
    queryKey: ['storage'],
    queryFn: () => userApi.storage().then((r) => r.data),
  });

  const { data: userTags = [] } = useTags();

  // Handle outside click to close popover
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQ(val);
    if (!val.trim()) {
      setShowSuggestions(false);
    } else {
      setShowSuggestions(true);
    }
  };

  const handleLogoutConfirm = async () => {
    await logout();
    setLogoutOpen(false);
    setOpen(false);
    navigate('/login', { replace: true });
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const Sidebar = (
    <aside className="flex h-full w-64 flex-col bg-[#2563eb] text-white shadow-lg transition-colors duration-200 dark:bg-[#1e3a8a]">
      {/* Brand Header */}
      <div className="flex shrink-0 items-center gap-3 px-6 pt-6 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-white shadow-xs backdrop-blur-md">
          <Cloud size={22} strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight text-white">
            Storvix
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
            Cloud Drive
          </p>
        </div>
      </div>

      {/* Prominent Upload Button */}
      <div className="px-4 py-3">
        <button
          type="button"
          onClick={() => {
            navigate('/drive?upload=1');
            setOpen(false);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 px-4 text-xs font-bold text-blue-600 shadow-md transition-all hover:bg-blue-50 hover:shadow-lg active:scale-98 cursor-pointer"
        >
          <span className="text-base leading-none font-extrabold">+</span>
          <span>Upload New Files</span>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-3 overflow-y-auto custom-scrollbar">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-white/20 text-white font-bold shadow-xs backdrop-blur-xs'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={
                    isActive ? 'text-white' : 'text-blue-200 group-hover:text-white'
                  }
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* User Tags Section */}
        {userTags.length > 0 && (
          <div className="pt-4 space-y-1">
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-200/80">
              Tags
            </p>
            {userTags.map((tag) => {
              const tagId = tag._id || tag.id;
              const color = tag.colorHex || '#3B82F6';
              return (
                <NavLink
                  key={tagId}
                  to={`/drive?tag=${tagId}`}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white/20 text-white font-bold'
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <span className="h-2 w-2 rounded-full shrink-0 ring-2 ring-white/30" style={{ backgroundColor: color }} />
                  <span className="truncate">{tag.name}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </nav>

      {/* Storage & Profile Footer */}
      <div className="mt-auto space-y-3 border-t border-white/15 p-4">
        {storageQuery.data && (
          <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-white font-semibold">
              <span className="flex items-center gap-1.5">
                <HardDrive size={14} className="text-blue-200" /> Storage
              </span>
              <button
                type="button"
                onClick={() => {
                  navigate('/pricing');
                  setOpen(false);
                }}
                className="text-[10px] font-bold text-blue-200 hover:text-white underline cursor-pointer"
              >
                Upgrade
              </button>
            </div>
            <StorageIndicator used={storageQuery.data.storageUsed} quota={storageQuery.data.storageQuota} />
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              navigate('/profile');
              setOpen(false);
            }}
            className="flex items-center gap-2.5 min-w-0 flex-1 rounded-xl p-1.5 text-left transition hover:bg-white/10"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 font-bold text-xs shadow-xs">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white">{user?.name || 'User'}</p>
              <p className="truncate text-[10px] text-blue-200">{user?.email}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="rounded-xl p-2 text-blue-200 hover:bg-white/10 hover:text-white transition cursor-pointer"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-dvh w-screen overflow-hidden bg-[#2567d6] dark:bg-slate-950 p-0 md:p-4 lg:p-6 transition-colors duration-300">
      {/* Floating Desktop Shell Container */}
      <div className="flex h-full w-full max-w-[1550px] mx-auto overflow-hidden rounded-none md:rounded-[32px] bg-white dark:bg-slate-900 shadow-2xl border border-blue-400/20">
        <div className="hidden h-full shrink-0 md:block">{Sidebar}</div>

        {open && (
          <div className="fixed inset-0 z-50 flex animate-fade-up md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setOpen(false)}
            />
            <div className="relative z-10 h-full">{Sidebar}</div>
          </div>
        )}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white dark:bg-slate-900">
          {/* Header */}
          <header className="z-30 flex shrink-0 items-center gap-3 border-b border-slate-100 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
            <button
              type="button"
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 md:hidden dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={() => setOpen(true)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Search Input */}
            <form ref={searchRef} onSubmit={onSearch} className="relative min-w-0 flex-1 max-w-xl">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                size={16}
              />
              <input
                value={q}
                onChange={handleInputChange}
                onFocus={() => {
                  if (q.trim()) setShowSuggestions(true);
                }}
                placeholder="Search files, folders and documents..."
                className="w-full rounded-full border border-slate-200 bg-[#f5f7fb] py-2 pl-11 pr-12 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 sm:text-sm"
              />
              <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 sm:flex">
                <Command size={10} /> K
              </div>

              {/* Auto-Suggestion Dropdown */}
              {showSuggestions && q.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-900 animate-fade-up">
                  {isSearching ? (
                    <div className="p-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
                      Searching...
                    </div>
                  ) : (searchData?.items || searchData?.files || []).length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-500 dark:text-slate-400">
                      No files or folders found for "{q}"
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Suggestions
                      </p>
                      {(searchData?.items || searchData?.files || []).slice(0, 6).map((item) => {
                        const isFolder = item.resourceType === 'folder';
                        const Icon = getFileIcon(item.mimeType, isFolder);
                        return (
                          <button
                            key={`${item.resourceType}-${item._id || item.id}`}
                            type="button"
                            onClick={() => {
                              setShowSuggestions(false);
                              if (isFolder) {
                                navigate(`/drive?folder=${item._id || item.id}`);
                              } else {
                                navigate(`/search?q=${encodeURIComponent(item.name)}`);
                              }
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <Icon size={18} className={isFolder ? 'text-amber-500 shrink-0' : 'text-blue-600 shrink-0'} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                                {item.name}
                              </p>
                              <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">
                                {isFolder ? 'Folder' : item.mimeType || 'File'}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </form>

            <ThemeToggle className="ml-auto shrink-0" />
          </header>

          <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-white p-4 transition-colors duration-300 dark:bg-slate-900 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>

      <LogoutConfirmationModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
}

export default AppShell;
