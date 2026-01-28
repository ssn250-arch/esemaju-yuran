import React, { useState, useEffect, useMemo } from 'react';
import './index.css';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  Search, 
  Lock, 
  Unlock, 
  Users, 
  DollarSign, 
  Calendar,
  CheckCircle2,
  Loader2,
  Edit3,
  X,
  AlertCircle,
  ChevronDown,
  UserX,
  LayoutDashboard,
  ArrowRight
} from 'lucide-react';

// 1. Konfigurasi Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyCzQyP7oZxKFjToYDktKtc2-8dbDGv9lkc",
  authDomain: "esemaju-yuran-bcfa0.firebaseapp.com",
  projectId: "esemaju-yuran-bcfa0",
  storageBucket: "esemaju-yuran-bcfa0.firebasestorage.app",
  messagingSenderId: "919159059946",
  appId: "1:919159059946:web:25f3ae6c79814e62eeae93"
};

// 2. Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'smka-tun-juhar-yuran-2026';

// 3. Senarai Nama Guru
const TEACHER_NAMES = [
  "EN. MUHAMAD RAMLI BIN YAHYA", "PN. RAFINA BINTI OMAR", "PN. SAPURA BINTI ANJAW", "EN. MOHD SHARIFF BIN JUSOH",
  "PN. KAMISAH BINTI SALEHAN", "PN. FADZILAH BINTI JILANG", "EN. MOHAZLI BIN OKAR", "CIK NORLINDA BINTI AMIL",
  "EN. SAIFULRIZAL BIN TAASIM", "CIK ASMAWATI BINTI MISTAMIRUDDIN", "PN. SITI WAZNAH BINTI NAAN", "PN. WAHIDA BINTI TAWASIL",
  "CIK NURHANIDA HANIM BINTI MOHAMED DAUD", "EN. HAMBRAN BIN PAMMA", "EN. ZULHELMIE BIN SAPIUDDIN", "EN. MOHD NIZAMUL BIN TUGIMAN",
  "PN. NURBAYA BINTI SILANG", "PN. HAFIZAH BINTI HARON", "PN. MARIAH BINTI SANAJI", "PN. SITI SUHANA BT. SYBIL MOHD. SHAH",
  "PN. RAMMINAH BINTI RAMMELAN", "PN. JUMALIAH BINTI LIPOH", "PN. SANIYA BINTI JUMA", "PN. NORSHAFIKA BINTI DAOD",
  "PN. ATIQAH BINTI MUSDI", "PN. ELQABUKHAEMI NORAFIEQAH BINTI DARWIS", "PN. DR NURHANANI BINTI ABD RAHMAN",
  "PN. NURUL LIDYA BINTI AWANG", "PN. FARRAH SYAMIMI BINTI CHE ROS", "PN. ALYAA ATIQAH BINTI REDZWAN",
  "PN. SARIATI BINTI ALI", "PN. MASRIJAH BINTI MASIR", "PN. SAFARINA BINTI MOHD FATHONI", "CIK NUR ATIQAH BINTI ZAINUDDIN",
  "CIK NUR SYAHIDAH BINTI BENYAMIN", "CIK SUZIANA BINTI PIKSUI", "CIK NOR AJEERAH BINTI MD NOORLI",
  "CIK WAHYUN YUUHA BINTI AB. WAHAB", "CIK MARIANI BINTI MOHAMMAD", "CIK NUR NABILA BINTI BAHARUN",
  "CIK NUR SHAFIQAH BINTI SHAMSOL", "CIK MIMIE ARTINIE JAHAS", "CIK ALPINAH BINTI MUHAMMAD",
  "CIK EMY ELISWEZZA BINTI MOHAMMAD", "CIK SITI MASLIAH BINTI PALDIE", "EN. ASMIN BIN AMIN", "EN. MOHD SOBRYE BIN PAIMIN",
  "EN. SYAHHADIR BIN BONGKASA", "EN. SHAIKH FAIZAL BIN HUSSEIN MATTAR", "EN. MUHAMMAD SAIFUDDIN BIN LATIF",
  "EN. MOHAD AZLIZAN BIN LAWI", "EN. MOHD FERDAUS BIN MOHD ALWI", "EN. MUHAMMAD SHAZRIN BIN ABDUL RAHIM",
  "EN. MOHD FITRI BIN NUSRI", "EN. SUHAIMI BIN HUSSIN", "EN. MHD HANAFIAH BIN HABILLIAS",
  "EN. AHMAD AFIQ ZUHAILY BIN AZHARI", "EN. MOHD TAUFIK BIN ARIFFIN", "EN. ABDUL FATAH BIN MAZLAN",
  "EN. MARIDUAN MARJAN", "EN. ADRIA SIPRUS ST BANGKOR", "CIK NA’ILAH FARAFISHAH BINTI IDERIS",
  "EN. MUHAMAD HAZIQ BIN MUHAMAD AZHAN", "PN. NORKISAH BINTI MUNIH"
];

const MONTHS = ["Tiada", "Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];
const FEE_RATE = 25;

export default function App() {
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); 
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isDefaultersExpanded, setIsDefaultersExpanded] = useState(false);
  const [editMonth, setEditMonth] = useState(0);
  const [editDate, setEditDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (e) { console.error(e); }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'payments');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = {};
      snapshot.forEach(doc => data[doc.id] = doc.data());
      setPayments(data);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsubscribe();
  }, [user]);

  const { filteredTeachers, defaulters } = useMemo(() => {
    const allDefaulters = TEACHER_NAMES.filter(name => {
      const docId = name.replace(/[^a-zA-Z0-9]/g, '_');
      return (payments[docId]?.paidUntil || 0) === 0;
    });

    const filtered = TEACHER_NAMES.filter(name => {
      const docId = name.replace(/[^a-zA-Z0-9]/g, '_');
      const data = payments[docId] || { paidUntil: 0 };
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
      let matchesFilter = true;
      if (filterStatus === 'paid') matchesFilter = data.paidUntil > 0;
      if (filterStatus === 'unpaid') matchesFilter = data.paidUntil === 0;
      return matchesSearch && matchesFilter;
    });

    return { filteredTeachers: filtered, defaulters: allDefaulters };
  }, [searchQuery, filterStatus, payments]);

  const totalCollected = useMemo(() => {
    return Object.values(payments).reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  }, [payments]);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (password === "abc@12345") {
      setIsAdmin(true);
      setShowLoginModal(false);
      setPassword("");
      setLoginError("");
    } else {
      setLoginError("Kod akses salah.");
    }
  };

  const openEdit = (name) => {
    if (!isAdmin) return;
    const docId = name.replace(/[^a-zA-Z0-9]/g, '_');
    const data = payments[docId] || { paidUntil: 0, lastDate: "" };
    setSelectedTeacher(name);
    setEditMonth(data.paidUntil || 0);
    setEditDate(data.lastDate || new Date().toISOString().split('T')[0]);
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!selectedTeacher || !user) return;
    setIsSaving(true);
    const docId = selectedTeacher.replace(/[^a-zA-Z0-9]/g, '_');
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'payments', docId), {
        name: selectedTeacher,
        paidUntil: parseInt(editMonth),
        lastDate: editDate,
        totalAmount: parseInt(editMonth) * FEE_RATE,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setShowEditModal(false);
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
        <p className="mt-6 text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Memuatkan Sistem Yuran...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <LayoutDashboard className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-slate-800 text-sm md:text-base">Kelab Warga SMKA Tun Juhar</h1>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Sistem Pengurusan Yuran</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <button onClick={() => setIsAdmin(false)} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100 text-[10px] font-black uppercase tracking-widest transition-all">
                <Unlock className="w-4 h-4" /> Admin Mod
              </button>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                <Lock className="w-4 h-4" /> Akses Pentadbir
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Jumlah Ahli', value: TEACHER_NAMES.length, icon: Users, bg: 'bg-indigo-50 text-indigo-600' },
            { label: 'Total Dana', value: `RM ${totalCollected}`, icon: DollarSign, bg: 'bg-emerald-50 text-emerald-600' },
            { label: 'Yuran Bulanan', value: `RM ${FEE_RATE}`, icon: Calendar, bg: 'bg-amber-50 text-amber-600' },
            { label: 'Belum Bayar', value: defaulters.length, icon: UserX, bg: 'bg-rose-50 text-rose-600' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
              <div className={`${stat.bg} w-10 h-10 rounded-2xl flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="text-xl md:text-2xl font-black tracking-tighter">{stat.value}</div>
            </div>
          ))}
        </div>

        {defaulters.length > 0 && (
          <div className="bg-white border border-rose-100 rounded-[2.5rem] overflow-hidden mb-8 shadow-sm">
            <button onClick={() => setIsDefaultersExpanded(!isDefaultersExpanded)} className="w-full flex items-center justify-between p-6 hover:bg-rose-50/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-rose-500 p-3 rounded-2xl shadow-lg shadow-rose-100">
                  <AlertCircle className="text-white w-5 h-5" />
                </div>
                <div className="text-left">
                  <h2 className="text-slate-800 font-black text-sm uppercase tracking-wider">Senarai Ahli Warga Yang Belum Bayar</h2>
                  <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest mt-1">{defaulters.length} orang ahli</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-500 ${isDefaultersExpanded ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isDefaultersExpanded ? 'max-h-[4000px] border-t border-rose-50' : 'max-h-0'}`}>
              <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-rose-50/20">
                {defaulters.map(name => (
                  <div key={name} className="flex items-center gap-3 bg-white border border-rose-100 p-3 rounded-2xl shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                    <span className="text-[11px] font-bold text-rose-900 uppercase truncate">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text"
              placeholder="Cari nama guru..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm text-sm font-semibold transition-all"
            />
          </div>
          <div className="flex bg-white p-2 border border-slate-200 rounded-[2rem] shadow-sm gap-1 overflow-x-auto">
            {[{ id: 'all', label: 'SEMUA' }, { id: 'paid', label: 'SUDAH BAYAR' }, { id: 'unpaid', label: 'BELUM BAYAR' }].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all whitespace-nowrap ${filterStatus === f.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Maklumat Guru</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status Terkini</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Amaun (RM)</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Kemaskini Terakhir</th>
                  {isAdmin && <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Edit</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((name, idx) => {
                  const docId = name.replace(/[^a-zA-Z0-9]/g, '_');
                  const data = payments[docId] || { paidUntil: 0, lastDate: "", totalAmount: 0 };
                  const isFullyPaid = data.paidUntil === 12;
                  return (
                    <tr key={name} className="hover:bg-indigo-50/20 transition-all group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-5">
                          <span className="text-slate-300 font-mono text-[10px] font-black">{String(idx + 1).padStart(2, '0')}</span>
                          <span className="text-sm font-bold text-slate-700 tracking-tight">{name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        {data.paidUntil > 0 ? (
                          <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-black tracking-widest ${isFullyPaid ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                            {isFullyPaid && <CheckCircle2 className="w-3.5 h-3.5" />}
                            HINGGA {MONTHS[data.paidUntil].toUpperCase()}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-black tracking-widest bg-rose-50 text-rose-500 border border-rose-100">
                            BELUM BAYAR
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="text-sm font-black text-slate-800">RM {data.totalAmount || 0}</span>
                      </td>
                      <td className="px-6 py-6 text-center font-mono text-[10px] text-slate-500 font-bold">
                        {data.lastDate || 'TIADA REKOD'}
                      </td>
                      {isAdmin && (
                        <td className="px-10 py-6 text-center">
                          <button onClick={() => openEdit(name)} className="p-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden divide-y divide-slate-100">
            {filteredTeachers.map((name, idx) => {
              const docId = name.replace(/[^a-zA-Z0-9]/g, '_');
              const data = payments[docId] || { paidUntil: 0, lastDate: "", totalAmount: 0 };
              return (
                <div key={name} className="p-6 md:p-8 active:bg-slate-50 transition-colors" onClick={() => isAdmin && openEdit(name)}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black text-slate-300 font-mono tracking-widest">#{idx+1}</span>
                    {isAdmin && (
                      <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-200">
                        <Edit3 className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-black text-slate-800 mb-6 leading-tight">{name}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Status Yuran</p>
                      {data.paidUntil > 0 ? (
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">
                          {MONTHS[data.paidUntil]}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-tighter">Belum Bayar</span>
                      )}
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Amaun Bayar</p>
                      <span className="text-xs font-black text-slate-800 tracking-tighter">RM {data.totalAmount || 0}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-12 text-center bg-slate-50/50 border-b border-slate-100">
              <div className="w-20 h-20 bg-indigo-600 rounded-[2.5rem] shadow-2xl shadow-indigo-200 flex items-center justify-center mx-auto mb-6">
                <Lock className="text-white w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Pentadbir</h2>
              <p className="text-slate-400 text-[10px] mt-2 font-black uppercase tracking-widest">Kod Pengesahan Diperlukan</p>
            </div>
            <form onSubmit={handleAdminLogin} className="p-10 lg:p-12">
              <input 
                autoFocus
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[2rem] mb-6 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 text-center tracking-[0.6em] font-black text-3xl"
              />
              {loginError && <p className="text-rose-500 text-[10px] font-black text-center mb-8 uppercase tracking-widest">{loginError}</p>}
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowLoginModal(false)} className="flex-1 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tutup</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-5 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100">Sahkan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h2 className="font-black text-slate-800 text-[10px] uppercase tracking-widest">Kemaskini Yuran</h2>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-10 lg:p-12">
              <div className="mb-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ahli Kelab</p>
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem]">
                  <p className="text-sm font-black text-slate-800 leading-tight">{selectedTeacher}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Bayar Hingga</label>
                  <select value={editMonth} onChange={(e) => setEditMonth(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-[11px] appearance-none cursor-pointer">
                    {MONTHS.map((m, i) => <option key={i} value={i}>{m.toUpperCase()}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Jumlah RM</label>
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl font-black text-emerald-600 text-sm text-center">RM {editMonth * FEE_RATE}</div>
                </div>
              </div>
              <div className="mb-12">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Tarikh Terima</label>
                <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs cursor-pointer" />
              </div>
              <button onClick={handleSave} disabled={isSaving} className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3">
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />} Simpan
              </button>
            </div>
          </div>
        </div>
      )}
      
      <footer className="max-w-7xl mx-auto px-4 mt-8 text-center">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
          © 2026 Kelab Warga SMKA Tun Juhar • Sandakan, Sabah
        </p>
      </footer>
    </div>
  );
}