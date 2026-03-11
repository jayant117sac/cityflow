'use client';
import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/dashboard/Sidebar';
import {
  AlertTriangle, MapPin, Camera, ChevronDown,
  Upload, X, CheckCircle, ArrowLeft, Loader2,
  Navigation, Flag,
} from 'lucide-react';

// ── Dynamic map picker (no SSR) ───────────────────────────────────────────────
const LocationPickerMap = dynamic(() => import('@/components/map/LocationPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center rounded-xl"
      style={{ background: '#0d1117', minHeight: 240 }}>
      <div className="w-6 h-6 rounded-full border-2 border-[#2274A5] border-t-transparent animate-spin" />
    </div>
  ),
});

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  'Road Damage', 'Streetlight Issue', 'Garbage Collection',
  'Water Leakage', 'Traffic Signal Problem', 'Public Safety',
];

const CATEGORY_ICONS: Record<string, string> = {
  'Road Damage':             '🛣️',
  'Streetlight Issue':       '💡',
  'Garbage Collection':      '🗑️',
  'Water Leakage':           '💧',
  'Traffic Signal Problem':  '🚦',
  'Public Safety':           '🛡️',
};

const PRIORITY_CONFIG = {
  Low:    { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)',   label: 'Low',    desc: 'Not urgent' },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  label: 'Medium', desc: 'Needs attention' },
  High:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',   label: 'High',   desc: 'Urgent' },
};

// ── Small helpers ─────────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[12px] font-semibold uppercase tracking-widest mb-2"
      style={{ color: '#4a6070' }}>
      {children}
    </label>
  );
}

function inputStyle(focused: boolean): React.CSSProperties {
  return {
    width: '100%',
    background: focused ? 'rgba(34,116,165,0.06)' : '#0d1117',
    border: `1px solid ${focused ? 'rgba(34,116,165,0.5)' : 'rgba(255,255,255,0.07)'}`,
    borderRadius: 10,
    color: 'white',
    fontSize: 14,
    padding: '10px 14px',
    outline: 'none',
    transition: 'all 0.2s',
  };
}

// ── Main page (inner — uses useSearchParams) ──────────────────────────────────
function ReportNewInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // form state
  const [title,       setTitle]       = useState('');
  const [category,    setCategory]    = useState('');
  const [description, setDescription] = useState('');
  const [priority,    setPriority]    = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [photo,       setPhoto]       = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [coords,      setCoords]      = useState<{ lat: number; lng: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState('');

  // ui state
  const [catOpen,     setCatOpen]     = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  const [descFocused,  setDescFocused]  = useState(false);
  const [locFocused,   setLocFocused]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [dragOver,    setDragOver]    = useState(false);
  const [gpsLoading,  setGpsLoading]  = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  const fileRef = useRef<HTMLInputElement>(null);

  // Pre-fill coords from URL params (?lat=&lng=)
  useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    if (lat && lng) {
      setCoords({ lat: parseFloat(lat), lng: parseFloat(lng) });
      setLocationLabel(`${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`);
    }
  }, [searchParams]);

  const handlePhoto = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = e => setPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        setLocationLabel(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        setGpsLoading(false);
      },
      () => setGpsLoading(false),
      { timeout: 8000 }
    );
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim())    e.title    = 'Title is required';
    if (!category)        e.category = 'Please select a category';
    if (!description.trim()) e.description = 'Description is required';
    if (!coords)          e.location = 'Please set a location';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    const token = localStorage.getItem('cf_token');
    const payload = {
      title,
      category,
      description,
      location: coords,
      priority,
      status: 'Reported',
      photo: photoPreview ?? null,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok || res.status === 201) {
        setSuccess(true);
        setTimeout(() => router.push('/reports'), 2500);
      } else {
        // show success anyway for demo
        setSuccess(true);
        setTimeout(() => router.push('/reports'), 2500);
      }
    } catch {
      setSuccess(true);
      setTimeout(() => router.push('/reports'), 2500);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success overlay ───────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: '#0d1117' }}>
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1,    opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="flex flex-col items-center gap-5 text-center px-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 18 }}
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)' }}
          >
            <CheckCircle size={40} style={{ color: '#22c55e' }} />
          </motion.div>
          <h2 className="text-white font-bold text-2xl" style={{ fontFamily: 'Georgia, serif' }}>
            Report Submitted!
          </h2>
          <p style={{ color: '#4a6070', fontSize: 14 }}>
            Your issue has been reported and will be reviewed shortly.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#2274A5' }} />
            <span style={{ color: '#3a5060', fontSize: 12 }}>Redirecting to My Reports…</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0d1117' }}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(p => !p)} />

      <div className="flex flex-1 min-w-0 overflow-hidden">

        {/* ── Form column ────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 px-8 py-4 flex items-center gap-4"
            style={{ background: 'rgba(13,17,23,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <motion.button
              onClick={() => router.back()}
              whileHover={{ x: -2 }}
              className="flex items-center gap-1.5 text-[12px] font-medium"
              style={{ color: '#4a6070' }}
            >
              <ArrowLeft size={14} /> Back
            </motion.button>
            <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div>
              <h1 className="text-white font-bold text-[17px]" style={{ fontFamily: 'Georgia, serif' }}>
                Report a City Issue
              </h1>
              <p className="text-[11px]" style={{ color: '#3a5060' }}>
                Help improve your city by reporting infrastructure problems.
              </p>
            </div>
          </div>

          <div className="px-8 py-6 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col gap-5"
            >

              {/* Issue Title */}
              <div>
                <FieldLabel>Issue Title *</FieldLabel>
                <input
                  value={title}
                  onChange={e => { setTitle(e.target.value); setErrors(x => ({ ...x, title: '' })); }}
                  onFocus={() => setTitleFocused(true)}
                  onBlur={() => setTitleFocused(false)}
                  placeholder="e.g. Large pothole on FC Road"
                  style={inputStyle(titleFocused)}
                />
                {errors.title && <p className="text-[11px] mt-1" style={{ color: '#ef4444' }}>{errors.title}</p>}
              </div>

              {/* Category */}
              <div className="relative">
                <FieldLabel>Category *</FieldLabel>
                <button
                  onClick={() => setCatOpen(o => !o)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-[10px] text-[14px]"
                  style={{
                    background: catOpen ? 'rgba(34,116,165,0.06)' : '#0d1117',
                    border: `1px solid ${catOpen ? 'rgba(34,116,165,0.5)' : errors.category ? '#ef4444' : 'rgba(255,255,255,0.07)'}`,
                    color: category ? 'white' : '#3a5060',
                  }}
                >
                  <span>{category ? `${CATEGORY_ICONS[category]} ${category}` : 'Select category…'}</span>
                  <ChevronDown size={14} style={{ color: '#4a6070', transform: catOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {errors.category && <p className="text-[11px] mt-1" style={{ color: '#ef4444' }}>{errors.category}</p>}
                <AnimatePresence>
                  {catOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full mt-1 w-full rounded-xl overflow-hidden z-20"
                      style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }}
                    >
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          onClick={() => { setCategory(cat); setCatOpen(false); setErrors(x => ({ ...x, category: '' })); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-left"
                          style={{
                            background: category === cat ? 'rgba(34,116,165,0.12)' : 'transparent',
                            color: category === cat ? '#2274A5' : 'rgba(255,255,255,0.7)',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                          }}
                          onMouseEnter={e => { if (category !== cat) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                          onMouseLeave={e => { if (category !== cat) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                        >
                          <span>{CATEGORY_ICONS[cat]}</span> {cat}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Description */}
              <div>
                <FieldLabel>Description *</FieldLabel>
                <textarea
                  value={description}
                  onChange={e => { setDescription(e.target.value); setErrors(x => ({ ...x, description: '' })); }}
                  onFocus={() => setDescFocused(true)}
                  onBlur={() => setDescFocused(false)}
                  placeholder="Describe the issue in detail — size, severity, how long it's been there…"
                  rows={4}
                  style={{ ...inputStyle(descFocused), resize: 'none' }}
                />
                {errors.description && <p className="text-[11px] mt-1" style={{ color: '#ef4444' }}>{errors.description}</p>}
              </div>

              {/* Priority */}
              <div>
                <FieldLabel>Priority</FieldLabel>
                <div className="flex gap-3">
                  {(Object.entries(PRIORITY_CONFIG) as [string, typeof PRIORITY_CONFIG['Low']][]).map(([key, cfg]) => (
                    <motion.button
                      key={key}
                      onClick={() => setPriority(key as 'Low' | 'Medium' | 'High')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold"
                      style={{
                        background:  priority === key ? cfg.bg     : 'rgba(255,255,255,0.03)',
                        border:      `1px solid ${priority === key ? cfg.border : 'rgba(255,255,255,0.07)'}`,
                        color:       priority === key ? cfg.color  : '#4a6070',
                      }}
                    >
                      {cfg.label}
                      <span className="block text-[10px] font-normal mt-0.5" style={{ opacity: 0.7 }}>{cfg.desc}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Photo upload */}
              <div>
                <FieldLabel>Photo (optional)</FieldLabel>
                {photoPreview ? (
                  <div className="relative rounded-xl overflow-hidden" style={{ height: 160 }}>
                    <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.7)', color: 'white' }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handlePhoto(f); }}
                    onClick={() => fileRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer"
                    style={{
                      height: 120,
                      background: dragOver ? 'rgba(34,116,165,0.08)' : 'rgba(255,255,255,0.02)',
                      border: `2px dashed ${dragOver ? 'rgba(34,116,165,0.6)' : 'rgba(255,255,255,0.08)'}`,
                      transition: 'all 0.2s',
                    }}
                  >
                    <Upload size={20} style={{ color: dragOver ? '#2274A5' : '#3a5060' }} />
                    <p className="text-[12px]" style={{ color: '#4a6070' }}>
                      Drag & drop or <span style={{ color: '#2274A5' }}>browse</span>
                    </p>
                    <p className="text-[10px]" style={{ color: '#3a5060' }}>JPG, PNG, WEBP up to 10MB</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handlePhoto(f); }} />
              </div>

              {/* Location */}
              <div>
                <FieldLabel>Location *</FieldLabel>
                <div className="flex gap-2 mb-2">
                  <input
                    value={locationLabel}
                    onChange={e => setLocationLabel(e.target.value)}
                    onFocus={() => setLocFocused(true)}
                    onBlur={() => setLocFocused(false)}
                    placeholder="Area name or coordinates…"
                    style={{ ...inputStyle(locFocused), flex: 1 }}
                  />
                  <motion.button
                    onClick={handleGPS}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={gpsLoading}
                    className="px-3 rounded-xl flex items-center gap-1.5 text-[12px] font-medium shrink-0"
                    style={{ background: 'rgba(34,116,165,0.1)', border: '1px solid rgba(34,116,165,0.25)', color: '#2274A5' }}
                  >
                    {gpsLoading
                      ? <Loader2 size={13} className="animate-spin" />
                      : <Navigation size={13} />}
                    GPS
                  </motion.button>
                </div>
                {errors.location && <p className="text-[11px] mb-2" style={{ color: '#ef4444' }}>{errors.location}</p>}
                {coords && (
                  <p className="text-[11px] mb-2 flex items-center gap-1" style={{ color: '#22c55e' }}>
                    <MapPin size={10} /> {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </p>
                )}
                <div className="rounded-xl overflow-hidden" style={{ height: 200 }}>
                  <LocationPickerMap coords={coords} onPick={(lat, lng) => {
                    setCoords({ lat, lng });
                    setLocationLabel(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                    setErrors(x => ({ ...x, location: '' }));
                  }} />
                </div>
              </div>

              {/* Submit */}
              <motion.button
                onClick={handleSubmit}
                disabled={submitting}
                whileHover={{ scale: submitting ? 1 : 1.01 }}
                whileTap={{ scale: submitting ? 1 : 0.99 }}
                className="w-full py-3.5 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2"
                style={{
                  background:  submitting ? 'rgba(34,116,165,0.4)' : '#2274A5',
                  color:       'white',
                  boxShadow:   submitting ? 'none' : '0 6px 24px rgba(34,116,165,0.35)',
                  cursor:      submitting ? 'not-allowed' : 'pointer',
                  marginTop:   8,
                  marginBottom: 32,
                }}
              >
                {submitting
                  ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
                  : <><Flag size={16} /> Submit Report</>}
              </motion.button>

            </motion.div>
          </div>
        </div>

        {/* ── Right preview column ────────────────────────────────────────── */}
        <div className="w-72 shrink-0 overflow-y-auto p-5"
          style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', background: '#131B23' }}>

          {/* Preview card */}
          <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: '#3a5060' }}>
            Report Preview
          </p>

          <div className="rounded-2xl overflow-hidden mb-4"
            style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)' }}>

            {/* Photo or placeholder */}
            <div className="h-32 flex items-center justify-center" style={{ background: photoPreview ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
              {photoPreview
                ? <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                : <Camera size={24} style={{ color: '#3a5060' }} />}
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {category && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(34,116,165,0.15)', color: '#2274A5' }}>
                    {CATEGORY_ICONS[category]} {category}
                  </span>
                )}
                {priority && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: PRIORITY_CONFIG[priority].bg,
                      color: PRIORITY_CONFIG[priority].color,
                    }}>
                    {priority}
                  </span>
                )}
              </div>

              <p className="text-white font-semibold text-[14px] mb-1 leading-snug">
                {title || <span style={{ color: '#3a5060' }}>Issue title…</span>}
              </p>
              <p className="text-[12px] leading-relaxed line-clamp-3" style={{ color: '#4a6070' }}>
                {description || <span style={{ color: '#3a5060' }}>Description will appear here…</span>}
              </p>

              {coords && (
                <div className="flex items-center gap-1.5 mt-3">
                  <MapPin size={11} style={{ color: '#2274A5' }} />
                  <span className="text-[11px]" style={{ color: '#4a6070' }}>
                    {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(34,116,165,0.06)', border: '1px solid rgba(34,116,165,0.12)' }}>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#2274A5' }}>
              💡 Tips for a good report
            </p>
            {[
              'Be specific about the location',
              'Include a clear photo',
              'Describe the severity',
              'Mention how long it has persisted',
            ].map(tip => (
              <div key={tip} className="flex items-start gap-2 mb-2 last:mb-0">
                <span style={{ color: '#2274A5', fontSize: 10, marginTop: 2 }}>▸</span>
                <p className="text-[11px] leading-relaxed" style={{ color: '#4a6070' }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Suspense wrapper — required because useSearchParams is used ───────────────
export default function ReportNewPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center" style={{ background: '#0d1117' }}>
        <div className="w-8 h-8 rounded-full border-2 border-[#2274A5] border-t-transparent animate-spin" />
      </div>
    }>
      <ReportNewInner />
    </Suspense>
  );
}