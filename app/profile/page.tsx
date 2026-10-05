import React, { useState, useEffect } from 'react';
import { HavenLogo } from '../../components/HavenLogo';
import {
  UserProfile,
  getCachedFirebaseUser,
  updateCachedFirebaseUser,
  saveUserProfileToFirestore,
  fetchUserProfileFromFirestore,
  signInWithEmail,
  registerWithEmail,
  signInGuest,
  logoutUser,
} from '../../lib/firebase';
import {
  User,
  ShieldCheck,
  KeyRound,
  Check,
  Save,
  Globe,
  Mail,
  Camera,
  LogOut,
  LogIn,
  UserPlus,
  Zap,
  Info,
  Sliders,
  Copy,
} from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile>(getCachedFirebaseUser());
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [photoInput, setPhotoInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'auto' | 'en' | 'ar' | 'sd'>('auto');
  const [tonePreference, setTonePreference] = useState<'friendly' | 'professional' | 'concise' | 'creative'>('friendly');
  const [memoryConsent, setMemoryConsent] = useState(true);

  // Auth Modal & Credentials
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Secret VIP Code
  const [secretInput, setSecretInput] = useState('');
  const [secretFeedback, setSecretFeedback] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  useEffect(() => {
    const current = getCachedFirebaseUser();
    setUser(current);
    setNameInput(current.name || '');
    setEmailInput(current.email || '');
    setPhotoInput(current.photo || '');
    setSelectedLanguage(current.preferredLanguage || 'auto');
    setTonePreference(current.preferences?.tone || 'friendly');
    setMemoryConsent(current.preferences?.memoryConsent ?? true);

    // Fetch from Firestore if user has UID
    if (current.uid) {
      fetchUserProfileFromFirestore(current.uid).then((remote) => {
        if (remote) {
          setUser(remote);
          setNameInput(remote.name || '');
          setEmailInput(remote.email || '');
          setPhotoInput(remote.photo || '');
          setSelectedLanguage(remote.preferredLanguage || 'auto');
          setTonePreference(remote.preferences?.tone || 'friendly');
          setMemoryConsent(remote.preferences?.memoryConsent ?? true);
        }
      });
    }
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      name: nameInput.trim() || 'Personal User',
      email: emailInput.trim() || user.email,
      photo: photoInput.trim() || null,
      preferredLanguage: selectedLanguage,
      preferences: {
        ...user.preferences,
        tone: tonePreference,
        memoryConsent: memoryConsent,
      },
    };

    updateCachedFirebaseUser(updated);
    setUser(updated);
    await saveUserProfileToFirestore(updated);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      let loggedInUser: UserProfile;
      if (authMode === 'login') {
        loggedInUser = await signInWithEmail(authEmail.trim(), authPassword);
      } else {
        loggedInUser = await registerWithEmail(authEmail.trim(), authPassword, authName.trim() || 'New Member');
      }

      setUser(loggedInUser);
      setNameInput(loggedInUser.name);
      setEmailInput(loggedInUser.email);
      setSelectedLanguage(loggedInUser.preferredLanguage);
      setShowAuthModal(false);
      setAuthPassword('');
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setAuthLoading(true);
    try {
      const guestUser = await signInGuest();
      setUser(guestUser);
      setNameInput(guestUser.name);
      setEmailInput(guestUser.email);
      setShowAuthModal(false);
    } catch (err: any) {
      setAuthError(err?.message || 'Guest sign-in error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    const freshGuest = await signInGuest();
    setUser(freshGuest);
    setNameInput(freshGuest.name);
    setEmailInput(freshGuest.email);
  };

  const handleUnlockSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretInput.trim()) return;

    try {
      const res = await fetch('/api/check-secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: secretInput.trim(), uid: user.uid }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = updateCachedFirebaseUser({ isVIP: true });
        setUser(updated);
        setSecretFeedback('Alpha VIP Unlocked! Sovereign privileges active.');
      } else {
        setSecretFeedback(data.error || 'Invalid code');
      }
    } catch {
      setSecretFeedback('Validation network error');
    }
  };

  const copyUidToClipboard = () => {
    navigator.clipboard.writeText(user.uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-7 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222836] pb-5">
        <div className="flex items-center gap-4">
          {user.photo ? (
            <img
              src={user.photo}
              alt={user.name}
              className="h-14 w-14 rounded-2xl object-cover border-2 border-amber-500/40 shadow-lg"
            />
          ) : (
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-300 font-serif font-bold text-2xl shadow-lg">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl font-bold text-white tracking-tight">
                {user.name}
              </h2>
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-mono text-amber-300 border border-amber-500/30">
                {user.isVIP ? 'ALPHA VIP' : 'PERSONAL MEMBER'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono mt-1">
              <span>{user.email}</span>
              <span>•</span>
              <button
                onClick={copyUidToClipboard}
                className="flex items-center gap-1 text-neutral-500 hover:text-amber-300 transition-colors"
                title="Click to copy Firebase UID"
              >
                <span>UID: {user.uid.slice(0, 10)}...</span>
                {copiedUid ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-[#2c3445] bg-[#141824] px-3.5 py-2 text-xs font-medium text-neutral-200 hover:border-amber-500/40 hover:text-white transition-all shadow-sm"
          >
            <LogIn className="h-3.5 w-3.5 text-amber-400" />
            <span>Switch / Sign In</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition-all"
            title="Log out and reset session"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Profile & Firestore Sync */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Form */}
          <div className="rounded-2xl border border-[#222836] bg-[#121620] p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1c2230] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <User className="h-4 w-4 text-amber-400" />
                <span>Personal Profile & Preferences</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Firestore: users/{user.uid.slice(0, 8)}...
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Your Name (Haven AI will greet you by this name)
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Hamudi Alrofaai"
                    required
                    className="w-full rounded-xl border border-[#272e3b] bg-[#0c0e14] px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="user@example.com"
                    required
                    className="w-full rounded-xl border border-[#272e3b] bg-[#0c0e14] px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-amber-400" />
                  <span>Profile Photo URL (Optional)</span>
                </label>
                <input
                  type="url"
                  value={photoInput}
                  onChange={(e) => setPhotoInput(e.target.value)}
                  placeholder="https://images.unsplash.com/... or custom avatar URL"
                  className="w-full rounded-xl border border-[#272e3b] bg-[#0c0e14] px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>

              {/* Language Selector in Settings/Profile */}
              <div className="pt-2 border-t border-[#1c2230]">
                <label className="block text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-sky-400" />
                  <span>Preferred AI Conversation Language</span>
                </label>
                <p className="text-[11px] text-neutral-400 mb-3">
                  Haven AI automatically detects the language you speak in each message. You can also lock your primary preference:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'auto', label: 'Auto-Detect', sub: 'كشف تلقائي', icon: '🌐' },
                    { id: 'sd', label: 'Sudanese Arabic', sub: 'اللهجة السودانية', icon: '🇸🇩' },
                    { id: 'ar', label: 'Standard Arabic', sub: 'العربية الفصحى', icon: '🇸🇦' },
                    { id: 'en', label: 'English', sub: 'English Fluency', icon: '🇬🇧' },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setSelectedLanguage(lang.id as any)}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        selectedLanguage === lang.id
                          ? 'border-amber-500 bg-amber-500/10 text-white shadow-md'
                          : 'border-[#272e3b] bg-[#0c0e14] text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                      }`}
                    >
                      <div className="text-base mb-1">{lang.icon}</div>
                      <div className="text-xs font-semibold">{lang.label}</div>
                      <div className="text-[10px] text-neutral-500">{lang.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Personality Tone */}
              <div className="pt-2 border-t border-[#1c2230]">
                <label className="block text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-emerald-400" />
                  <span>AI Companion Tone</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'friendly', label: 'Warm & Friendly', desc: 'Warm and empathetic' },
                    { id: 'professional', label: 'Executive', desc: 'Direct & structured' },
                    { id: 'concise', label: 'Concise', desc: 'Brief & essential' },
                    { id: 'creative', label: 'Creative', desc: 'Poetic & expansive' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTonePreference(t.id as any)}
                      className={`rounded-xl border p-2.5 text-left transition-all ${
                        tonePreference === t.id
                          ? 'border-emerald-500 bg-emerald-500/10 text-white'
                          : 'border-[#272e3b] bg-[#0c0e14] text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="text-xs font-semibold">{t.label}</div>
                      <div className="text-[10px] text-neutral-500">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Memory Consent Toggle */}
              <div className="pt-2 border-t border-[#1c2230] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Private AI Memory</span>
                  <span className="text-[11px] text-neutral-400">
                    Allow Haven AI to remember your personal preferences (scoped strictly to your UID: {user.uid.slice(0, 8)}).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMemoryConsent(!memoryConsent)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    memoryConsent ? 'bg-amber-500' : 'bg-neutral-800'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      memoryConsent ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 px-5 py-2.5 text-xs font-bold transition-all shadow-md w-full sm:w-auto"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Profile to Firestore</span>
                </button>

                {saveSuccess && (
                  <p className="mt-2 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5" />
                    <span>Your personal profile and preferences have been updated in Firestore!</span>
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Account & VIP Status */}
        <div className="space-y-6">
          {/* Firebase Authentication Status Card */}
          <div className="rounded-2xl border border-[#222836] bg-[#121620] p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#1c2230] pb-2.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Firebase Auth & Security
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#181d27]">
                <span className="text-neutral-400">Account Type</span>
                <span className="text-white font-medium">Individual Unique Account</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#181d27]">
                <span className="text-neutral-400">Database</span>
                <span className="text-amber-300 font-mono text-[11px]">Firestore (haven-ai-49237)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#181d27]">
                <span className="text-neutral-400">Memory Isolation</span>
                <span className="text-emerald-400 font-mono text-[11px]">Strictly Isolated per UID</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-400">Language Auto-Detect</span>
                <span className="text-sky-300 font-mono text-[11px]">Active (EN, AR, SD)</span>
              </div>
            </div>

            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full rounded-xl border border-[#272e3b] bg-[#0c0e14] py-2 text-xs font-semibold text-neutral-300 hover:text-white hover:border-amber-500/40 transition-colors"
            >
              Manage Firebase Credentials
            </button>
          </div>

          {/* Master Secret Code Card */}
          <div className="rounded-2xl border border-amber-500/30 bg-[#121620] p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <KeyRound className="h-4 w-4 text-amber-400" />
              <span>Master VIP Secret Code</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Enter your master secret code (<code className="text-amber-300 font-mono">Alpha@091904</code>) to enable unlimited unmetered compute for your account.
            </p>

            <form onSubmit={handleUnlockSecret} className="space-y-2.5">
              <input
                type="text"
                value={secretInput}
                onChange={(e) => setSecretInput(e.target.value)}
                placeholder="Alpha@091904"
                className="w-full rounded-xl border border-[#272e3b] bg-[#0c0e14] px-3 py-2 font-mono text-xs text-amber-300 placeholder-neutral-600 focus:border-amber-400 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-amber-500 py-2 text-xs font-bold text-neutral-950 hover:bg-amber-400 transition-colors"
              >
                Verify Code
              </button>
            </form>

            {secretFeedback && (
              <p className="text-xs font-mono text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                {secretFeedback}
              </p>
            )}
          </div>

          {/* Creator & Architecture Notice: Scoped strictly to About/Creator section */}
          <div className="rounded-2xl border border-[#222836] bg-[#10141d] p-5 shadow-lg space-y-2.5 text-xs">
            <div className="flex items-center gap-2 font-serif font-bold text-white">
              <Info className="h-4 w-4 text-amber-400" />
              <span>About Haven AI Architecture</span>
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Haven AI platform is created and architected by <strong className="text-neutral-200">Dr. Ajak Alrofaai Aling</strong>, South Sudanese ICT Engineer.
            </p>
            <p className="text-neutral-500 text-[10px]">
              Creator details are maintained exclusively here in the About & Architecture section and are never mixed into your personal user profile or chat persona.
            </p>
          </div>
        </div>
      </div>

      {/* Firebase Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#272e3b] bg-[#121620] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1c2230] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-400" />
                <h3 className="font-serif text-lg font-bold text-white">
                  {authMode === 'login' ? 'Sign In to Your Account' : 'Create Personal Account'}
                </h3>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-neutral-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex rounded-xl bg-[#0c0e14] p-1 border border-[#222836]">
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  authMode === 'login' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  authMode === 'register' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Hamudi Alrofaai"
                    required
                    className="w-full rounded-xl border border-[#272e3b] bg-[#0c0e14] px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Email</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="w-full rounded-xl border border-[#272e3b] bg-[#0c0e14] px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Password</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-[#272e3b] bg-[#0c0e14] px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {authError && (
                <p className="text-xs text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-neutral-950 hover:bg-amber-400 transition-colors disabled:opacity-50"
              >
                {authLoading ? 'Verifying...' : authMode === 'login' ? 'Sign In to Haven' : 'Create Account'}
              </button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#1c2230]"></div>
              <span className="flex-shrink mx-2 text-[10px] text-neutral-500 uppercase font-mono">or</span>
              <div className="flex-grow border-t border-[#1c2230]"></div>
            </div>

            <button
              onClick={handleGuestLogin}
              disabled={authLoading}
              className="w-full rounded-xl border border-[#272e3b] bg-[#0c0e14] py-2 text-xs font-medium text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors"
            >
              Continue with Private Guest Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
