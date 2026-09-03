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
    <aside className="flex h-full w-60 flex-col border-r border-slate-200 bg-white shadow-2xs backdrop-blur-md transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex shrink-0 items-center gap-2.5 border-b border-slate-100 px-5 py-4 dark:border-slate-800/80">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
          <Cloud size={20} strokeWidth={2.25} />
        </div>
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Storvix
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Cloud Drive
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
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
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                    `group flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60'
                    }`
                  }
                >
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="truncate">{tag.name}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </nav>

      <div className="mt-auto space-y-2 border-t border-slate-100 p-3.5 dark:border-slate-800/80">
        {storageQuery.data && (
          <StorageIndicator used={storageQuery.data.storageUsed} quota={storageQuery.data.storageQuota} />
        )}

        <button
          type="button"
          onClick={() => {
            navigate('/profile');
            setOpen(false);
          }}
          className="flex w-full items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 p-2 text-left text-xs font-medium transition hover:border-slate-300 hover:bg-slate-100/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-2xs text-xs">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-900 dark:text-slate-100">{user?.name || 'User'}</p>
            <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-dvh max-h-dvh overflow-hidden bg-slate-50/50 transition-colors duration-300 dark:bg-slate-950">
      <div className="hidden h-full shrink-0 md:block">{Sidebar}</div>

      {open && (
        <div className="fixed inset-0 z-50 flex animate-fade-up md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 h-full">{Sidebar}</div>
        </div>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-30 flex shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/80 px-4 py-3 shadow-xs backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/80 sm:px-5">
          <button
            type="button"
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 md:hidden dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={() => setOpen(true)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>

          <form ref={searchRef} onSubmit={onSearch} className="relative min-w-0 flex-1 max-w-xl">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              size={18}
            />
            <input
              value={q}
              onChange={handleInputChange}
              onFocus={() => {
                if (q.trim()) setShowSuggestions(true);
              }}
              placeholder="Search files, folders and documents..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-2.5 pl-11 pr-12 text-xs font-medium text-slate-800 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800 sm:text-sm"
            />
            <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500 sm:flex">
              <Command size={10} /> K
            </div>

            {/* Auto-Suggestion Dropdown */}
            {showSuggestions && q.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-2xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 animate-fade-up">
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

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4 transition-colors duration-300 sm:p-6 lg:p-8">
          {children}
        </main>
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
