'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  LayoutGrid, ListChecks, Building2, Construction,
  BellRing, BarChart3, Settings, LogOut, ChevronLeft,
  ChevronRight, AlertTriangle, CheckCircle2, Clock,
  TrendingUp, TrendingDown, Minus, MapPin, Plus,
  Pencil, Trash2, X, Shield, Zap, Droplets, Truck,
  Building, RefreshCw, Filter,
} from 'lucide-react';

const AdminHeatMap = dynamic(() => import('@/components/admin/AdminHeatMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center" style={{ background: '#0d1117' }}>
      <div className="w-7 h-7 rounded-full border-2 border-[#2274A5] border-t-transparent animate-spin" />
    </div>
  ),
});

// ── Types ─────────────────────────────────────────────────────────────────────
interface Issue {
  id: string; title: string; location: string; category: string;
  department: string; priority: 'High' | 'Medium' | 'Low';
  status: 'Reported' | 'Assigned' | 'In Progress' | 'Resolved';
  time: string; reporter: string;
}
interface Dept {
  name: string; icon: any; color: string;
  active: number; resolved: number; avgResponse: string;
  trend: 'up' | 'down' | 'stable';
}
interface CityAlert {
  id: string; title: string; severity: 'HIGH' | 'MED' | 'LOW';
  location: string; description: string; time: string;
}

// ── Placeholder data ──────────────────────────────────────────────────────────
const P_ISSUES: Issue[] = [
  { id:'1', title:'Pothole on FC Road',         location:'Shivajinagar', category:'Road Damage',        department:'Road Maintenance', priority:'High',   status:'In Progress', time:'2h ago',  reporter:'Jayant S.'  },
  { id:'2', title:'Streetlight not working',    location:'Baner',        category:'Streetlight Issue',  department:'Electric Dept',    priority:'Medium', status:'Assigned',    time:'4h ago',  reporter:'Priya M.'   },
  { id:'3', title:'Garbage not collected',      location:'Kothrud',      category:'Garbage Collection', department:'Sanitation',       priority:'Low',    status:'Reported',    time:'5h ago',  reporter:'Rahul K.'   },
  { id:'4', title:'Water leakage on main road', location:'Wakad',        category:'Water Leakage',      department:'Water Supply',     priority:'High',   status:'In Progress', time:'6h ago',  reporter:'Sneha P.'   },
  { id:'5', title:'Broken traffic signal',      location:'Hadapsar',     category:'Traffic Signal',     department:'Traffic Mgmt',     priority:'High',   status:'Assigned',    time:'8h ago',  reporter:'Amit D.'    },
  { id:'6', title:'Damaged footpath',           location:'Aundh',        category:'Road Damage',        department:'Road Maintenance', priority:'Medium', status:'Reported',    time:'10h ago', reporter:'Neha R.'    },
  { id:'7', title:'Overflowing drain',          location:'Katraj',       category:'Drainage',           department:'Sanitation',       priority:'High',   status:'In Progress', time:'12h ago', reporter:'Vikram S.'  },
  { id:'8', title:'Road cave-in near bridge',   location:'Pune Station', category:'Road Damage',        department:'Road Maintenance', priority:'High',   status:'In Progress', time:'1d ago',  reporter:'Meera T.'   },
];

const P_DEPTS: Dept[] = [
  { name:'Road Maintenance', icon:Construction, color:'#2274A5', active:34, resolved:18, avgResponse:'3.2h', trend:'down'   },
  { name:'Water Supply',     icon:Droplets,     color:'#22c55e', active:21, resolved:12, avgResponse:'4.1h', trend:'stable' },
  { name:'Electric Dept',    icon:Zap,          color:'#f59e0b', active:17, resolved: 9, avgResponse:'2.8h', trend:'up'     },
  { name:'Sanitation',       icon:Truck,        color:'#a855f7', active:28, resolved:11, avgResponse:'5.6h', trend:'down'   },
  { name:'Traffic Mgmt',     icon:Shield,       color:'#ef4444', active:14, resolved: 4, avgResponse:'1.9h', trend:'up'     },
  { name:'Public Works',     icon:Building,     color:'#06b6d4', active:14, resolved: 0, avgResponse:'6.3h', trend:'stable' },
];

const P_ALERTS: CityAlert[] = [
  { id:'a1', title:'Road Closure',     severity:'HIGH', location:'FC Road',        description:'Road closed for emergency repairs. Diversions via DP Road.',            time:'1h ago'  },
  { id:'a2', title:'Power Outage',     severity:'HIGH', location:'Baner',          description:'Scheduled maintenance outage 10AM–2PM.',                               time:'2h ago'  },
  { id:'a3', title:'Heavy Traffic',    severity:'MED',  location:'Hinjewadi',      description:'Heavy congestion on Hinjewadi–Pimpri highway.',                        time:'30m ago' },
  { id:'a4', title:'Water Disruption', severity:'MED',  location:'Kothrud',        description:'Water supply disruption. Restoration expected 6PM.',                   time:'3h ago'  },
  { id:'a5', title:'Community Event',  severity:'LOW',  location:'Riverside Park', description:'Community cleanup drive this Sunday at 8AM.',                          time:'Today'   },
];

// ── Design tokens ─────────────────────────────────────────────────────────────
const CARD = { background: '#131B23', border: '1px solid rgba(255,255,255,0.05)' } as const;
const PRI  = { High:'#ef4444', Medium:'#f59e0b', Low:'#22c55e' } as Record<string,string>;
const STA  = { Reported:'#2274A5', Assigned:'#a855f7', 'In Progress':'#f59e0b', Resolved:'#22c55e' } as Record<string,string>;
const SEV  = { HIGH:'#ef4444', MED:'#f59e0b', LOW:'#22c55e' } as Record<string,string>;

// ── Sidebar nav ───────────────────────────────────────────────────────────────
const ADMIN_NAV = [
  { label:'City Overview',    icon:LayoutGrid   },
  { label:'Issue Management', icon:ListChecks   },
  { label:'Departments',      icon:Building2    },
  { label:'Infrastructure',   icon:Construction },
  { label:'Alerts',           icon:BellRing     },
  { label:'Analytics',        icon:BarChart3    },
  { label:'Settings',         icon:Settings     },
];

function AdminSidebar({ active, onSelect, collapsed, onToggle }: {
  active:string; onSelect:(s:string)=>void; collapsed:boolean; onToggle:()=>void;
}) {
  const router = useRouter();
  return (
    <motion.aside animate={{ width: collapsed ? 64 : 200 }} transition={{ duration:0.25, ease:'easeInOut' }}
      className="h-screen shrink-0 flex flex-col relative z-10"
      style={{ background:'#131B23', borderRight:'1px solid rgba(255,255,255,0.05)' }}>

      <div className="flex items-center gap-3 px-3 py-4" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[18px] shrink-0"
          style={{ background:'linear-gradient(135deg,#ef4444,#b91c1c)', boxShadow:'0 4px 12px rgba(239,68,68,0.3)' }}>
          🏛️
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <p className="text-white font-bold text-[13px] leading-none" style={{ fontFamily:'Georgia,serif' }}>CityFlow</p>
              <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color:'#ef4444' }}>Admin Panel</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button onClick={onToggle}
        className="absolute -right-3 top-13 w-6 h-6 rounded-full flex items-center justify-center z-20"
        style={{ background:'#1e2d38', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444' }}>
        {collapsed ? <ChevronRight size={11}/> : <ChevronLeft size={11}/>}
      </button>

      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
        {ADMIN_NAV.map(({ label, icon:Icon }) => {
          const on = active === label;
          return (
            <motion.button key={label} onClick={() => onSelect(label)}
              whileHover={{ background:'rgba(239,68,68,0.08)' }}
              className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl w-full"
              style={{ background:on?'rgba(239,68,68,0.12)':'transparent', border:`1px solid ${on?'rgba(239,68,68,0.2)':'transparent'}` }}>
              <Icon size={16} style={{ color:on?'#ef4444':'#4a6070' }} className="shrink-0"/>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    className="text-[13px] font-medium whitespace-nowrap" style={{ color:on?'#ef4444':'#7a9ab0' }}>
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      <div className="px-2 pb-4">
        <motion.button onClick={() => router.push('/dashboard')}
          whileHover={{ background:'rgba(34,116,165,0.1)' }}
          className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl w-full"
          style={{ border:'1px solid rgba(255,255,255,0.06)', color:'#4a6070' }}>
          <LogOut size={15} className="shrink-0"/>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                className="text-[12px] whitespace-nowrap">Citizen View</motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
}

// ── Metric card ───────────────────────────────────────────────────────────────
function MetricCard({ icon:Icon, label, value, sub, color, trend }: {
  icon:any; label:string; value:string|number; sub:string; color:string; trend?:'up'|'down'|'stable';
}) {
  return (
    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
      className="rounded-2xl p-5" style={CARD}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background:`${color}15`, border:`1px solid ${color}25` }}>
          <Icon size={18} style={{ color }}/>
        </div>
        {trend && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold"
            style={{
              background: trend==='up'?'rgba(239,68,68,0.1)':trend==='down'?'rgba(34,197,94,0.1)':'rgba(255,255,255,0.05)',
              color: trend==='up'?'#ef4444':trend==='down'?'#22c55e':'#4a6070',
            }}>
            {trend==='up'?<TrendingUp size={10}/>:trend==='down'?<TrendingDown size={10}/>:<Minus size={10}/>}
            <span className="ml-0.5">{trend==='up'?'+12%':trend==='down'?'-8%':'0%'}</span>
          </div>
        )}
      </div>
      <p className="text-white font-bold text-3xl mb-1" style={{ fontFamily:'Georgia,serif' }}>{value}</p>
      <p className="text-[13px] font-medium mb-0.5" style={{ color:'#7a9ab0' }}>{label}</p>
      <p className="text-[11px]" style={{ color:'#3a5060' }}>{sub}</p>
    </motion.div>
  );
}

// ── Alert modal ───────────────────────────────────────────────────────────────
function AlertModal({ alert, onClose, onSave }: {
  alert:Partial<CityAlert>|null; onClose:()=>void; onSave:(a:CityAlert)=>void;
}) {
  const [form, setForm] = useState<Partial<CityAlert>>(alert ?? { severity:'MED' });
  const set = (k: keyof CityAlert, v:string) => setForm(p => ({ ...p, [k]:v }));

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background:'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <motion.div initial={{ scale:0.94, y:16 }} animate={{ scale:1, y:0 }} exit={{ scale:0.94 }}
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background:'#131B23', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 32px 64px rgba(0,0,0,0.5)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold text-[16px]">{form.id ? 'Edit Alert' : 'Create Alert'}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background:'rgba(255,255,255,0.06)', color:'#4a6070' }}><X size={14}/></button>
        </div>
        {([['title','Title','Alert title…'],['location','Location','Affected area…'],['description','Description','What citizens need to know…']] as const).map(([k,l,ph]) => (
          <div key={k} className="mb-3">
            <label className="text-[11px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color:'#4a6070' }}>{l}</label>
            {k === 'description' ? (
              <textarea value={(form as any)[k]??''} onChange={e => set(k, e.target.value)} placeholder={ph} rows={3}
                className="w-full px-3 py-2 rounded-xl text-[13px] resize-none outline-none"
                style={{ background:'#0d1117', border:'1px solid rgba(255,255,255,0.08)', color:'#7a9ab0' }}/>
            ) : (
              <input value={(form as any)[k]??''} onChange={e => set(k, e.target.value)} placeholder={ph}
                className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
                style={{ background:'#0d1117', border:'1px solid rgba(255,255,255,0.08)', color:'#7a9ab0' }}/>
            )}
          </div>
        ))}
        <div className="mb-5">
          <label className="text-[11px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color:'#4a6070' }}>Severity</label>
          <div className="flex gap-2">
            {(['HIGH','MED','LOW'] as const).map(s => (
              <button key={s} onClick={() => set('severity', s)}
                className="flex-1 py-2 rounded-xl text-[12px] font-bold transition"
                style={{
                  background: form.severity===s ? `${SEV[s]}20` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${form.severity===s ? SEV[s]+'50' : 'rgba(255,255,255,0.06)'}`,
                  color: form.severity===s ? SEV[s] : '#4a6070',
                }}>{s}</button>
            ))}
          </div>
        </div>
        <button onClick={() => {
          if (!form.title || !form.location) return;
          onSave({ id:form.id??Date.now().toString(), title:form.title!, location:form.location!,
            severity:form.severity as 'HIGH'|'MED'|'LOW', description:form.description??'', time:'Just now' });
        }}
          className="w-full py-2.5 rounded-xl font-bold text-[13px]"
          style={{ background:'linear-gradient(135deg,#ef4444,#b91c1c)', color:'white' }}>
          {form.id ? 'Save Changes' : 'Create Alert'}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('City Overview');
  const [issues,    setIssues]    = useState<Issue[]>(P_ISSUES);
  const [depts,     setDepts]     = useState<Dept[]>(P_DEPTS);
  const [alerts,    setAlerts]    = useState<CityAlert[]>(P_ALERTS);
  const [modalAlert, setModalAlert] = useState<Partial<CityAlert>|null|false>(false);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('cf_user') || '{}');
    const role = (user?.role ?? '').toUpperCase();
    if (!['ADMIN', 'OFFICIAL', 'GOVERNMENT'].includes(role)) router.push('/dashboard');
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('cf_token');
    const h = { Authorization:`Bearer ${token}` };
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/issues`,      { headers:h }).then(r=>r.ok?r.json():null).catch(()=>null),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/departments`,  { headers:h }).then(r=>r.ok?r.json():null).catch(()=>null),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/alerts`,       { headers:h }).then(r=>r.ok?r.json():null).catch(()=>null),
    ]).then(([i,d,a]) => {
      if (i) setIssues(i); if (d) setDepts(d); if (a) setAlerts(a);
    });
  }, []);

  const deleteAlert = (id:string) => setAlerts(p => p.filter(a => a.id !== id));
  const saveAlert   = (a:CityAlert) => {
    setAlerts(p => p.some(x=>x.id===a.id) ? p.map(x=>x.id===a.id?a:x) : [a,...p]);
    setModalAlert(false);
  };

  const filteredIssues = statusFilter==='All' ? issues : issues.filter(i=>i.status===statusFilter);
  const totalActive    = issues.filter(i=>i.status!=='Resolved').length;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:'#0d1117' }}>
      <style>{`
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.07);border-radius:999px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(239,68,68,0.3)}
      `}</style>

      <AdminSidebar active={activeNav} onSelect={setActiveNav} collapsed={collapsed} onToggle={()=>setCollapsed(p=>!p)}/>

      <div className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3"
          style={{ background:'rgba(13,17,23,0.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <h1 className="text-white font-bold text-[18px]" style={{ fontFamily:'Georgia,serif' }}>{activeNav}</h1>
            <p className="text-[11px]" style={{ color:'#3a5060' }}>Pune Municipal Corporation · Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"/>
              <span className="text-[11px] font-bold text-red-400">LIVE</span>
            </div>
            <button onClick={()=>window.location.reload()}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background:'#131B23', border:'1px solid rgba(255,255,255,0.06)', color:'#4a6070' }}>
              <RefreshCw size={13}/>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{ background:'#131B23', border:'1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold text-white"
                style={{ background:'linear-gradient(135deg,#ef4444,#b91c1c)' }}>A</div>
              <span className="text-[12px] font-medium" style={{ color:'#7a9ab0' }}>Admin</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <MetricCard icon={AlertTriangle} label="Active Issues"      value={totalActive} sub="Across all departments"  color="#ef4444" trend="up"     />
            <MetricCard icon={CheckCircle2}  label="Resolved Today"     value={54}          sub="Last 24 hours"           color="#22c55e" trend="down"   />
            <MetricCard icon={Building2}     label="Departments Active"  value={depts.length} sub="All departments online" color="#2274A5" trend="stable" />
            <MetricCard icon={Clock}         label="Avg Response"        value="3.4 hrs"    sub="City-wide average"       color="#f59e0b" trend="down"   />
          </div>

          {/* Heatmap + Dept performance */}
          <div className="grid grid-cols-5 gap-4">
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
              className="col-span-3 rounded-2xl overflow-hidden" style={{ ...CARD, height:340 }}>
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-2">
                  <MapPin size={14} style={{ color:'#ef4444' }}/>
                  <span className="text-white font-semibold text-[14px]">Issue Density Heatmap</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                    style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444' }}>LIVE</span>
                </div>
                <div className="flex items-center gap-3 text-[10px]" style={{ color:'#4a6070' }}>
                  {[['#22c55e','Low'],['#f59e0b','Med'],['#ef4444','High']].map(([c,l])=>(
                    <span key={l} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ background:c }}/>{l}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ height:'calc(100% - 48px)' }}><AdminHeatMap issues={issues}/></div>
            </motion.div>

            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
              className="col-span-2 rounded-2xl" style={CARD}>
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-2">
                  <Building2 size={14} style={{ color:'#2274A5' }}/>
                  <span className="text-white font-semibold text-[14px]">Department Performance</span>
                </div>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight:292 }}>
                {depts.map((d,i)=>(
                  <motion.div key={d.name} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.22+i*0.04 }}
                    className="px-4 py-3 flex items-center gap-3"
                    style={{ borderBottom:i<depts.length-1?'1px solid rgba(255,255,255,0.04)':'none' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background:`${d.color}12`, border:`1px solid ${d.color}20` }}>
                      <d.icon size={14} style={{ color:d.color }}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] font-semibold text-white truncate">{d.name}</p>
                        <span style={{ color:d.trend==='up'?'#ef4444':d.trend==='down'?'#22c55e':'#4a6070' }}>
                          {d.trend==='up'?<TrendingUp size={10}/>:d.trend==='down'?<TrendingDown size={10}/>:<Minus size={10}/>}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px]" style={{ color:'#ef4444' }}>{d.active} active</span>
                        <span className="text-[10px]" style={{ color:'#22c55e' }}>{d.resolved} resolved</span>
                        <span className="text-[10px]" style={{ color:'#4a6070' }}>⏱ {d.avgResponse}</span>
                      </div>
                      <div className="mt-1.5 w-full rounded-full" style={{ height:3, background:'rgba(255,255,255,0.05)' }}>
                        <div className="h-full rounded-full" style={{
                          width:`${Math.round((d.resolved/(d.active+d.resolved||1))*100)}%`,
                          background:d.color,
                        }}/>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Issues table + Alerts panel */}
          <div className="grid grid-cols-5 gap-4">
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
              className="col-span-3 rounded-2xl" style={CARD}>
              <div className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-2">
                  <ListChecks size={14} style={{ color:'#2274A5' }}/>
                  <span className="text-white font-semibold text-[14px]">Recent Issues</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background:'rgba(34,116,165,0.1)', color:'#2274A5' }}>{filteredIssues.length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Filter size={11} style={{ color:'#3a5060' }}/>
                  {['All','Reported','Assigned','In Progress','Resolved'].map(s=>(
                    <button key={s} onClick={()=>setStatusFilter(s)}
                      className="px-2 py-1 rounded-lg text-[10px] font-semibold transition"
                      style={{
                        background:statusFilter===s?'rgba(34,116,165,0.15)':'transparent',
                        color:statusFilter===s?'#2274A5':'#4a6070',
                        border:`1px solid ${statusFilter===s?'rgba(34,116,165,0.3)':'transparent'}`,
                      }}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="grid px-5 py-2 text-[10px] font-bold uppercase tracking-wider"
                style={{ gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', color:'#3a5060', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                <span>Issue</span><span>Location</span><span>Dept</span><span>Priority</span><span>Status</span>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight:320 }}>
                {filteredIssues.map((issue,i)=>(
                  <div key={issue.id}
                    className="grid px-5 py-3 items-center transition cursor-default"
                    style={{ gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', borderBottom:'1px solid rgba(255,255,255,0.03)' }}
                    onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.02)')}
                    onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                    <div>
                      <p className="text-[12px] font-medium text-white">{issue.title}</p>
                      <p className="text-[10px] mt-0.5" style={{ color:'#3a5060' }}>{issue.reporter} · {issue.time}</p>
                    </div>
                    <span className="text-[11px]" style={{ color:'#7a9ab0' }}>{issue.location}</span>
                    <span className="text-[10px] truncate" style={{ color:'#4a6070' }}>{issue.department}</span>
                    <span className="text-[10px] font-bold" style={{ color:PRI[issue.priority] }}>● {issue.priority}</span>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full inline-block"
                      style={{ background:`${STA[issue.status]}18`, color:STA[issue.status] }}>
                      {issue.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Alerts management */}
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
              className="col-span-2 rounded-2xl flex flex-col" style={CARD}>
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-2">
                  <BellRing size={14} style={{ color:'#ef4444' }}/>
                  <span className="text-white font-semibold text-[14px]">City Alerts</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444' }}>{alerts.length}</span>
                </div>
                <button onClick={()=>setModalAlert({})}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold"
                  style={{ background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444' }}
                  onMouseEnter={e=>(e.currentTarget.style.background='rgba(239,68,68,0.2)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='rgba(239,68,68,0.12)')}>
                  <Plus size={11}/> New Alert
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                <AnimatePresence>
                  {alerts.map((alert,i)=>(
                    <motion.div key={alert.id}
                      initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                      exit={{ opacity:0, x:20, height:0 }} transition={{ delay:i*0.04 }}
                      className="rounded-xl p-3"
                      style={{ background:`${SEV[alert.severity]}08`, border:`1px solid ${SEV[alert.severity]}20` }}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
                            style={{ background:`${SEV[alert.severity]}20`, color:SEV[alert.severity] }}>
                            {alert.severity}
                          </span>
                          <p className="text-[12px] font-semibold text-white truncate">{alert.title}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={()=>setModalAlert(alert)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center"
                            style={{ background:'rgba(34,116,165,0.1)', color:'#2274A5' }}>
                            <Pencil size={10}/>
                          </button>
                          <button onClick={()=>deleteAlert(alert.id)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center"
                            style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444' }}>
                            <Trash2 size={10}/>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        <MapPin size={9} style={{ color:'#3a5060' }}/>
                        <span className="text-[10px]" style={{ color:'#4a6070' }}>{alert.location}</span>
                        <span className="text-[10px] ml-auto" style={{ color:'#3a5060' }}>{alert.time}</span>
                      </div>
                      <p className="text-[10px] leading-relaxed" style={{ color:'#4a6070' }}>{alert.description}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {modalAlert !== false && (
          <AlertModal alert={modalAlert} onClose={()=>setModalAlert(false)} onSave={saveAlert}/>
        )}
      </AnimatePresence>
    </div>
  );
}