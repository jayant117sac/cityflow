'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  MapPin, Calendar, Edit3, Trophy, Star, Shield,
  FileText, CheckCircle, Users, Heart, TrendingUp,
  AlertTriangle, MessageSquare, Award, Zap, Target,
  Clock, ChevronRight,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Profile {
  name:        string;
  city:        string;
  memberSince: string;
  civicScore:  number;
  reports:     number;
  resolved:    number;
  votes:       number;
  events:      number;
  achievements: string[];
  level:       number;
  nextLevel:   number;
}

interface Activity {
  icon:   string;
  action: string;
  time:   string;
  type:   'report' | 'community' | 'resolved' | 'vote';
}

// ── Placeholder data ──────────────────────────────────────────────────────────
const PLACEHOLDER: Profile = {
  name:        'Jayant Sangrame',
  city:        'Pune, MH',
  memberSince: '2026-01-10',
  civicScore:  742,
  reports:     8,
  resolved:    5,
  votes:       12,
  events:      2,
  achievements: ['First Report', 'Community Helper', 'City Watcher', 'Top Contributor'],
  level:       3,
  nextLevel:   1000,
};

const PLACEHOLDER_ACTIVITY: Activity[] = [
  { icon: '🛣️', action: 'Reported pothole on FC Road',         time: '2 hours ago',  type: 'report'    },
  { icon: '💬', action: 'Commented on community proposal',      time: 'Yesterday',    type: 'community' },
  { icon: '✅', action: 'Issue resolved — Baner streetlight',   time: '2 days ago',   type: 'resolved'  },
  { icon: '🗳️', action: 'Voted on budget allocation proposal',  time: '3 days ago',   type: 'vote'      },
  { icon: '🗑️', action: 'Reported garbage not collected',       time: '4 days ago',   type: 'report'    },
  { icon: '🏆', action: 'Earned "Community Helper" badge',      time: '5 days ago',   type: 'community' },
  { icon: '💧', action: 'Reported water leakage on main road',  time: '1 week ago',   type: 'report'    },
];

// ── Achievement config ────────────────────────────────────────────────────────
const ACHIEVEMENT_CONFIG: Record<string, { icon: any; color: string; bg: string; desc: string }> = {
  'First Report':      { icon: FileText,    color: '#2274A5', bg: 'rgba(34,116,165,0.12)',  desc: 'Submitted your first issue report' },
  'Community Helper':  { icon: Users,       color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   desc: 'Participated in 5+ community votes' },
  'City Watcher':      { icon: Shield,      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  desc: 'Active reporter for 30+ days' },
  'Top Contributor':   { icon: Trophy,      color: '#a855f7', bg: 'rgba(168,85,247,0.12)',  desc: 'Top 10% of civic contributors' },
  'Quick Responder':   { icon: Zap,         color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   desc: 'Reported 3 issues in a single day' },
  'Problem Solver':    { icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.12)',  desc: 'Had 5+ issues marked as resolved' },
  'Volunteer Star':    { icon: Heart,       color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',   desc: 'Attended 2+ volunteer events' },
  'Civic Champion':    { icon: Award,       color: '#eab308', bg: 'rgba(234,179,8,0.12)',   desc: 'Reached Civic Score of 1000+' },
};

const SCORE_RULES = [
  { pts: '+10', label: 'Reporting an issue',       icon: AlertTriangle, color: '#2274A5' },
  { pts: '+5',  label: 'Community vote',            icon: MessageSquare, color: '#22c55e' },
  { pts: '+20', label: 'Verified report resolved',  icon: CheckCircle,   color: '#f59e0b' },
  { pts: '+15', label: 'Volunteer event attended',  icon: Heart,         color: '#a855f7' },
];

const ACTIVITY_COLOR: Record<string, string> = {
  report:    '#2274A5',
  community: '#22c55e',
  resolved:  '#f59e0b',
  vote:      '#a855f7',
};

// ── Level label ───────────────────────────────────────────────────────────────
function levelLabel(level: number) {
  return ['', 'Civic Newcomer', 'Active Citizen', 'City Guardian', 'Civic Champion', 'Urban Legend'][level] ?? 'Civic Legend';
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 40;
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(start));
    }, 30);
    return () => clearInterval(t);
  }, [target]);
  return <>{val.toLocaleString()}{suffix}</>;
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5"
      style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <p className="text-white font-bold text-2xl leading-none mb-1">
        <Counter target={value} />
      </p>
      <p className="text-[12px]" style={{ color: '#4a6070' }}>{label}</p>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const [profile,  setProfile]  = useState<Profile | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cf_token');
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`,  { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activity`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([p, a]) => {
      setProfile(p ?? PLACEHOLDER);
      setActivity(a ?? PLACEHOLDER_ACTIVITY);
    }).finally(() => setLoading(false));
  }, []);

  if (loading || !profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-2 border-[#2274A5] border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const scorePercent = Math.min((profile.civicScore / profile.nextLevel) * 100, 100);
  const joinDate = new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const initials = profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <DashboardLayout>
      <div className="pb-10">

        {/* ── Page header ─────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-white font-bold text-[22px]" style={{ fontFamily: 'Georgia, serif' }}>
            My Civic Profile
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: '#3a5060' }}>Track your impact on the city.</p>
        </motion.div>

        {/* ── Top row: Profile card + Civic score ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl p-6 flex flex-col items-center text-center"
            style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            {/* Avatar */}
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #2274A5, #1a5a82)', boxShadow: '0 8px 24px rgba(34,116,165,0.35)' }}>
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[11px]"
                style={{ background: '#f59e0b', boxShadow: '0 2px 8px rgba(245,158,11,0.4)' }}>
                {profile.level}
              </div>
            </div>

            <h2 className="text-white font-bold text-[17px] mb-1" style={{ fontFamily: 'Georgia, serif' }}>
              {profile.name}
            </h2>
            <div className="flex items-center gap-1 mb-1">
              <MapPin size={11} style={{ color: '#3a5060' }} />
              <span className="text-[12px]" style={{ color: '#4a6070' }}>{profile.city}</span>
            </div>
            <div className="flex items-center gap-1 mb-5">
              <Calendar size={11} style={{ color: '#3a5060' }} />
              <span className="text-[12px]" style={{ color: '#4a6070' }}>Member since {joinDate}</span>
            </div>

            {/* Level badge */}
            <div className="px-3 py-1.5 rounded-full mb-5"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
              <span className="text-[12px] font-bold" style={{ color: '#f59e0b' }}>
                ⚡ {levelLabel(profile.level)}
              </span>
            </div>

            <motion.button
              onClick={() => router.push('/dashboard/settings')}
              whileHover={{ background: 'rgba(34,116,165,0.15)' }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold w-full justify-center"
              style={{ background: 'rgba(34,116,165,0.08)', border: '1px solid rgba(34,116,165,0.2)', color: '#2274A5' }}
            >
              <Edit3 size={12} /> Edit Profile
            </motion.button>
          </motion.div>

          {/* Civic Score */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 rounded-2xl p-6"
            style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: '#3a5060' }}>Civic Score</p>
                <div className="flex items-end gap-2">
                  <span className="text-white font-bold text-5xl" style={{ fontFamily: 'Georgia, serif' }}>
                    <Counter target={profile.civicScore} />
                  </span>
                  <span className="text-[14px] mb-2" style={{ color: '#4a6070' }}>points</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
                <Trophy size={22} style={{ color: '#f59e0b' }} />
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-2">
              <div className="flex justify-between mb-1.5">
                <span className="text-[11px]" style={{ color: '#4a6070' }}>
                  Level {profile.level} — {levelLabel(profile.level)}
                </span>
                <span className="text-[11px]" style={{ color: '#4a6070' }}>
                  {profile.civicScore} / {profile.nextLevel}
                </span>
              </div>
              <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${scorePercent}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #2274A5, #f59e0b)' }}
                />
              </div>
              <p className="text-[11px] mt-1.5" style={{ color: '#3a5060' }}>
                {profile.nextLevel - profile.civicScore} points to Level {profile.level + 1}
              </p>
            </div>

            {/* Score rules */}
            <div className="grid grid-cols-2 gap-2 mt-5">
              {SCORE_RULES.map(r => (
                <div key={r.label} className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                  style={{ background: `${r.color}08`, border: `1px solid ${r.color}15` }}>
                  <r.icon size={13} style={{ color: r.color, flexShrink: 0 }} />
                  <div>
                    <span className="text-[12px] font-bold" style={{ color: r.color }}>{r.pts}</span>
                    <span className="text-[11px] ml-1.5" style={{ color: '#4a6070' }}>{r.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Contribution stats ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard icon={FileText}    label="Reports Submitted"  value={profile.reports}  color="#2274A5" />
          <StatCard icon={CheckCircle} label="Issues Resolved"    value={profile.resolved} color="#22c55e" />
          <StatCard icon={Users}       label="Community Votes"    value={profile.votes}    color="#a855f7" />
          <StatCard icon={Heart}       label="Volunteer Events"   value={profile.events}   color="#f43f5e" />
        </div>

        {/* ── Achievements + Activity ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl p-5"
            style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award size={15} style={{ color: '#f59e0b' }} />
                <h3 className="text-white font-semibold text-[15px]">Achievements</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                  {profile.achievements.length}
                </span>
              </div>
              <span className="text-[11px]" style={{ color: '#3a5060' }}>
                {Object.keys(ACHIEVEMENT_CONFIG).length - profile.achievements.length} locked
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ACHIEVEMENT_CONFIG).map(([name, cfg], i) => {
                const earned = profile.achievements.includes(name);
                return (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.28 + i * 0.04 }}
                    className="rounded-xl p-3"
                    style={{
                      background: earned ? cfg.bg : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${earned ? cfg.color + '30' : 'rgba(255,255,255,0.05)'}`,
                      opacity: earned ? 1 : 0.45,
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                      style={{ background: earned ? `${cfg.color}20` : 'rgba(255,255,255,0.05)' }}>
                      <cfg.icon size={15} style={{ color: earned ? cfg.color : '#3a5060' }} />
                    </div>
                    <p className="text-[12px] font-semibold leading-tight mb-0.5"
                      style={{ color: earned ? 'white' : '#3a5060' }}>{name}</p>
                    <p className="text-[10px] leading-tight" style={{ color: earned ? '#4a6070' : '#2a3a48' }}>
                      {cfg.desc}
                    </p>
                    {earned && (
                      <div className="mt-1.5 flex items-center gap-1">
                        <CheckCircle size={9} style={{ color: cfg.color }} />
                        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: cfg.color }}>Earned</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Activity feed */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl p-5"
            style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={15} style={{ color: '#2274A5' }} />
                <h3 className="text-white font-semibold text-[15px]">Recent Activity</h3>
              </div>
              <motion.button
                whileHover={{ x: 2 }}
                onClick={() => router.push('/reports')}
                className="flex items-center gap-1 text-[11px] font-medium"
                style={{ color: '#2274A5' }}
              >
                View All <ChevronRight size={11} />
              </motion.button>
            </div>

            <div className="flex flex-col">
              {activity.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.32 + i * 0.05 }}
                  className="flex items-start gap-3 py-3"
                  style={{ borderBottom: i < activity.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                >
                  {/* Timeline dot + line */}
                  <div className="flex flex-col items-center shrink-0 mt-0.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[14px]"
                      style={{ background: `${ACTIVITY_COLOR[a.type]}12`, border: `1px solid ${ACTIVITY_COLOR[a.type]}25` }}>
                      {a.icon}
                    </div>
                    {i < activity.length - 1 && (
                      <div className="w-px flex-1 mt-1" style={{ background: 'rgba(255,255,255,0.04)', minHeight: 12 }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-white leading-snug">{a.action}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock size={10} style={{ color: '#3a5060' }} />
                      <span className="text-[10px]" style={{ color: '#3a5060' }}>{a.time}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </DashboardLayout>
  );
}