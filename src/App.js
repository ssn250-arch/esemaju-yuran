import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc,
  deleteDoc,
  addDoc,
  getDoc
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
  ArrowRight,
  Trash2,
  Plus,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Save,
  AlertTriangle,
  Pencil
} from 'lucide-react';

// --- KONFIGURASI FIREBASE (DIAMBIL DARI ESEMAJU.TXT) ---
const firebaseConfig = {
  apiKey: "AIzaSyCzQyP7oZxKFjToYDktKtc2-8dbDGv9lkc",
  authDomain: "esemaju-yuran-bcfa0.firebaseapp.com",
  projectId: "esemaju-yuran-bcfa0",
  storageBucket: "esemaju-yuran-bcfa0.firebasestorage.app",
  messagingSenderId: "919159059946",
  appId: "1:919159059946:web:25f3ae6c79814e62eeae93"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ID Aplikasi untuk laluan Firestore
const APP_ID_PATH = 'smka-tun-juhar-yuran-2026'; 

const INITIAL_TEACHER_NAMES = [
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
  const [teacherList, setTeacherList] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [showDeleteTransModal, setShowDeleteTransModal] = useState(false);

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const [transToDelete, setTransToDelete] = useState(null);
  const [nameToEdit, setNameToEdit] = useState(null);
  const [newNameInput, setNewNameInput] = useState("");

  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [editMonth, setEditMonth] = useState(0);
  const [editDate, setEditDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDefaultersExpanded, setIsDefaultersExpanded] = useState(false);

  const [newTeacherName, setNewTeacherName] = useState("");
  const [newTransAmount, setNewTransAmount] = useState("");
  const [newTransNote, setNewTransNote] = useState("");
  const [newTransType, setNewTransType] = useState("IN"); 
  const [newTransDate, setNewTransDate] = useState(new Date().toISOString().split('T')[0]);

  // --- AUTH ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (e) { console.error("Auth Error:", e); }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // --- REAL-TIME DATA ---
  useEffect(() => {
    if (!user) return;

    // Rekod Pembayaran
    const qPayments = collection(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'payments');
    const unsubPayments = onSnapshot(qPayments, (snapshot) => {
      const data = {};
      snapshot.forEach(doc => data[doc.id] = doc.data());
      setPayments(data);
    });

    // Senarai Guru (dari Metadata)
    const docRef = doc(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'config', 'metadata');
    const unsubTeachers = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().teachers) {
        setTeacherList(docSnap.data().teachers);
      } else {
        setTeacherList(INITIAL_TEACHER_NAMES);
      }
      setLoading(false);
    });

    // Transaksi Kewangan
    const qTrans = collection(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'transactions');
    const unsubTrans = onSnapshot(qTrans, (snapshot) => {
      const trans = [];
      snapshot.forEach(doc => trans.push({ id: doc.id, ...doc.data() }));
      trans.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(trans);
    });

    return () => {
      unsubPayments();
      unsubTeachers();
      unsubTrans();
    };
  }, [user]);

  // --- LOGIK PENGIRAAN ---
  const { filteredTeachers, defaulters } = useMemo(() => {
    const allDefaulters = teacherList.filter(name => {
      const docId = name.replace(/[^a-zA-Z0-9]/g, '_');
      return (payments[docId]?.paidUntil || 0) === 0;
    });

    const filtered = teacherList.filter(name => {
      const docId = name.replace(/[^a-zA-Z0-9]/g, '_');
      const data = payments[docId] || { paidUntil: 0 };
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
      let matchesFilter = true;
      if (filterStatus === 'Telah Bayar') matchesFilter = data.paidUntil > 0;
      if (filterStatus === 'Belum Bayar') matchesFilter = data.paidUntil === 0;
      return matchesSearch && matchesFilter;
    });

    return { filteredTeachers: filtered, defaulters: allDefaulters };
  }, [searchQuery, filterStatus, payments, teacherList]);

  const totalFeesCollected = useMemo(() => {
    return Object.values(payments).reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  }, [payments]);

  const financialStats = useMemo(() => {
    const totalIn = transactions.filter(t => t.type === 'IN').reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
    const totalOut = transactions.filter(t => t.type === 'OUT').reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
    const currentBalance = totalFeesCollected + totalIn - totalOut;
    return { totalIn, totalOut, currentBalance };
  }, [transactions, totalFeesCollected]);


  // --- HANDLERS ---
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

  const handleSavePayment = async () => {
    if (!selectedTeacher || !user) return;
    setIsSaving(true);
    const docId = selectedTeacher.replace(/[^a-zA-Z0-9]/g, '_');
    try {
      await setDoc(doc(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'payments', docId), {
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

  const handleAddTeacher = async () => {
    if (!newTeacherName.trim()) return;
    setIsSaving(true);
    try {
      const newList = [...teacherList, newTeacherName.toUpperCase()];
      await setDoc(doc(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'config', 'metadata'), {
        teachers: newList
      }, { merge: true });
      setNewTeacherName("");
      setShowAddTeacherModal(false);
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  const openEditName = (name) => {
    setNameToEdit(name);
    setNewNameInput(name);
    setShowEditNameModal(true);
  };

  const handleUpdateName = async () => {
    if (!newNameInput.trim() || !nameToEdit) return;
    setIsSaving(true);
    try {
      const newName = newNameInput.trim().toUpperCase();
      const newList = teacherList.map(t => t === nameToEdit ? newName : t);
      await setDoc(doc(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'config', 'metadata'), {
        teachers: newList
      }, { merge: true });

      const oldDocId = nameToEdit.replace(/[^a-zA-Z0-9]/g, '_');
      const newDocId = newName.replace(/[^a-zA-Z0-9]/g, '_');

      if (oldDocId !== newDocId) {
        const oldDocRef = doc(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'payments', oldDocId);
        const oldSnap = await getDoc(oldDocRef);
        if (oldSnap.exists()) {
          await setDoc(doc(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'payments', newDocId), {
            ...oldSnap.data(),
            name: newName,
            updatedAt: new Date().toISOString()
          });
          await deleteDoc(oldDocRef);
        }
      }
      setShowEditNameModal(false);
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  const requestDeleteTeacher = (name) => {
    setTeacherToDelete(name);
    setShowDeleteModal(true);
  };

  const confirmDeleteTeacher = async () => {
    if (!teacherToDelete) return;
    setIsDeleting(true);
    try {
      const newList = teacherList.filter(name => name !== teacherToDelete);
      await setDoc(doc(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'config', 'metadata'), {
        teachers: newList
      }, { merge: true });
      const docId = teacherToDelete.replace(/[^a-zA-Z0-9]/g, '_');
      await deleteDoc(doc(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'payments', docId));
      setShowDeleteModal(false);
    } catch (err) { console.error(err); }
    finally { setIsDeleting(false); }
  };

  const handleSaveTransaction = async () => {
    if (!newTransAmount || !newTransNote) return;
    setIsSaving(true);
    try {
      if (transactionToEdit) {
        await setDoc(doc(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'transactions', transactionToEdit.id), {
          amount: parseFloat(newTransAmount),
          type: newTransType,
          note: newTransNote,
          date: newTransDate,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } else {
        await addDoc(collection(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'transactions'), {
          amount: parseFloat(newTransAmount),
          type: newTransType,
          note: newTransNote,
          date: newTransDate,
          createdAt: new Date().toISOString()
        });
      }
      setNewTransAmount("");
      setNewTransNote("");
      setShowTransactionModal(false);
      setTransactionToEdit(null);
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  const confirmDeleteTransaction = async () => {
    if (!transToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'transactions', transToDelete.id));
      setShowDeleteTransModal(false);
    } catch (err) { console.error(err); }
    finally { setIsDeleting(false); }
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
              <button onClick={() => setIsAdmin(false)} className="flex items-center gap-2 bg-rose-50 text-rose-700 px-4 py-2 rounded-2xl border border-rose-100 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-rose-100">
                <Unlock className="w-4 h-4" /> Log Keluar Admin
              </button>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-200">
                <Lock className="w-4 h-4" /> Akses Pentadbir
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isAdmin && (
          <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-[2rem] shadow-sm border border-slate-200">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'teachers', label: 'Guru', icon: Users },
              { id: 'finance', label: 'Kewangan', icon: Wallet }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* --- VIEW: FINANCE --- */}
        {isAdmin && activeTab === 'finance' && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
               <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                <p className="text-[10px] font-black opacity-70 uppercase tracking-widest mb-2">Baki Tunai Semasa</p>
                <div className="text-3xl font-black tracking-tighter">RM {financialStats.currentBalance.toFixed(2)}</div>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold bg-white/20 w-fit px-3 py-1 rounded-full">
                  <Wallet className="w-3 h-3" /> Termasuk Yuran
                </div>
              </div>
              <div className="bg-emerald-50 p-6 rounded-[2.5rem] border border-emerald-100">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Aliran Masuk</p>
                <div className="text-2xl font-black text-emerald-700 tracking-tighter">+ RM {financialStats.totalIn.toFixed(2)}</div>
              </div>
              <div className="bg-rose-50 p-6 rounded-[2.5rem] border border-rose-100">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">Aliran Keluar</p>
                <div className="text-2xl font-black text-rose-700 tracking-tighter">- RM {financialStats.totalOut.toFixed(2)}</div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-8 flex justify-between items-center border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Sejarah Transaksi</h3>
                <button onClick={() => setShowTransactionModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Rekod Baru
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {transactions.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">Tiada rekod transaksi</div>
                ) : (
                  transactions.map((trans) => (
                    <div key={trans.id} className="p-6 flex items-center justify-between group">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-2xl ${trans.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                          {trans.type === 'IN' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm mb-1">{trans.note}</p>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{trans.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`text-lg font-black ${trans.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {trans.type === 'IN' ? '+' : '-'} RM {parseFloat(trans.amount).toFixed(2)}
                        </div>
                        <button onClick={() => { setTransToDelete(trans); setShowDeleteTransModal(true); }} className="p-2 text-slate-300 hover:text-rose-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: TEACHERS --- */}
        {isAdmin && activeTab === 'teachers' && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Urus Ahli</h2>
                <button onClick={() => setShowAddTeacherModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                  <Plus className="w-4 h-4" /> Tambah Guru
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {teacherList.map((name, idx) => (
                  <div key={idx} className="group flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-200 transition-all">
                    <span className="text-xs font-bold text-slate-700 truncate">{idx + 1}. {name}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditName(name)} className="p-2 text-slate-300 hover:text-indigo-600"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => requestDeleteTeacher(name)} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: DASHBOARD --- */}
        {(!isAdmin || activeTab === 'dashboard') && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-sm">
                <Users className="w-5 h-5 text-indigo-600 mb-3" />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Jumlah Ahli</p>
                <div className="text-2xl font-black tracking-tighter">{teacherList.length}</div>
              </div>
              <div className="p-6 rounded-[2rem] bg-indigo-600 text-white shadow-xl shadow-indigo-100">
                <Wallet className="w-5 h-5 mb-3" />
                <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">Baki Tabung</p>
                <div className="text-2xl font-black tracking-tighter">RM {financialStats.currentBalance.toFixed(2)}</div>
              </div>
              <div className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-sm">
                <ArrowDownLeft className="w-5 h-5 text-emerald-600 mb-3" />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Masuk</p>
                <div className="text-2xl font-black tracking-tighter">RM {(totalFeesCollected + financialStats.totalIn).toFixed(2)}</div>
              </div>
              <div className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-sm">
                <ArrowUpRight className="w-5 h-5 text-rose-600 mb-3" />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Keluar</p>
                <div className="text-2xl font-black tracking-tighter">RM {financialStats.totalOut.toFixed(2)}</div>
              </div>
            </div>

            {defaulters.length > 0 && (
              <div className="bg-white border border-rose-100 rounded-[2.5rem] overflow-hidden mb-8 shadow-sm">
                <button onClick={() => setIsDefaultersExpanded(!isDefaultersExpanded)} className="w-full flex items-center justify-between p-6 hover:bg-rose-50/30 transition-colors">
                  <div className="flex items-center gap-4 text-left">
                    <div className="bg-rose-500 p-3 rounded-2xl shadow-lg"><AlertCircle className="text-white w-5 h-5" /></div>
                    <div>
                      <h2 className="text-slate-800 font-black text-sm uppercase tracking-wider">Senarai Ahli Belum Bayar</h2>
                      <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest mt-1">{defaulters.length} orang</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-500 ${isDefaultersExpanded ? 'rotate-180' : ''}`} />
                </button>
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isDefaultersExpanded ? 'max-h-[4000px] border-t border-rose-50' : 'max-h-0'}`}>
                  <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-rose-50/20">
                    {defaulters.map(name => (
                      <div key={name} className="flex items-center gap-3 bg-white border border-rose-100 p-3 rounded-2xl">
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                        <span className="text-[11px] font-bold text-rose-900 uppercase truncate">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text"
                  placeholder="Cari nama guru..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-sm text-sm font-semibold"
                />
              </div>
              <div className="flex bg-white p-2 border border-slate-200 rounded-[2rem] gap-1">
                {['Semua', 'Telah Bayar', 'Belum Bayar'].map(f => (
                  <button key={f} onClick={() => setFilterStatus(f)} className={`px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all ${filterStatus === f ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}>
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="hidden lg:block">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Maklumat Guru</th>
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Amaun (RM)</th>
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Kemaskini</th>
                      {isAdmin && <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tindakan</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTeachers.map((name, idx) => {
                      const docId = name.replace(/[^a-zA-Z0-9]/g, '_');
                      const data = payments[docId] || { paidUntil: 0, lastDate: "", totalAmount: 0 };
                      return (
                        <tr key={name} className="hover:bg-indigo-50/20 transition-all">
                          <td className="px-10 py-6">
                            <span className="text-sm font-bold text-slate-700">{idx + 1}. {name}</span>
                          </td>
                          <td className="px-6 py-6 text-center">
                            {data.paidUntil > 0 ? (
                              <span className={`px-5 py-2 rounded-full text-[9px] font-black tracking-widest ${data.paidUntil === 12 ? 'bg-indigo-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                                HINGGA {MONTHS[data.paidUntil].toUpperCase()}
                              </span>
                            ) : (
                              <span className="px-5 py-2 rounded-full text-[9px] font-black tracking-widest bg-rose-50 text-rose-500">BELUM BAYAR</span>
                            )}
                          </td>
                          <td className="px-6 py-6 text-center font-black text-slate-800">RM {data.totalAmount || 0}</td>
                          <td className="px-6 py-6 text-center font-mono text-[10px] text-slate-500">{data.lastDate || '-'}</td>
                          {isAdmin && (
                            <td className="px-10 py-6 text-center">
                              <button onClick={() => openEdit(name)} className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all"><Edit3 className="w-4 h-4" /></button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="lg:hidden divide-y divide-slate-100">
                {filteredTeachers.map((name, idx) => {
                  const docId = name.replace(/[^a-zA-Z0-9]/g, '_');
                  const data = payments[docId] || { paidUntil: 0, lastDate: "", totalAmount: 0 };
                  return (
                    <div key={name} className="p-6 active:bg-slate-50" onClick={() => isAdmin && openEdit(name)}>
                      <h3 className="text-sm font-black text-slate-800 mb-4">{idx + 1}. {name}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                          <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Status</p>
                          <span className={`text-[10px] font-black uppercase ${data.paidUntil > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {data.paidUntil > 0 ? MONTHS[data.paidUntil] : 'Belum Bayar'}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                          <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Amaun</p>
                          <span className="text-xs font-black">RM {data.totalAmount || 0}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- MODALS --- */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-sm p-12 text-center">
            <Lock className="text-indigo-600 w-12 h-12 mx-auto mb-6" />
            <h2 className="text-2xl font-black mb-8">Akses Pentadbir</h2>
            <form onSubmit={handleAdminLogin}>
              <input 
                type="password" autoFocus placeholder="••••" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl mb-8 text-center tracking-[0.5em] font-black text-2xl"
              />
              {loginError && <p className="text-rose-500 text-[10px] font-black mb-6 uppercase tracking-widest">{loginError}</p>}
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowLoginModal(false)} className="flex-1 py-4 font-black uppercase text-[10px]">Tutup</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg">Masuk</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[3.5rem] w-full max-w-md p-10 lg:p-12">
            <div className="flex justify-between items-center mb-10">
              <h2 className="font-black uppercase tracking-widest text-[10px]">Kemaskini Yuran</h2>
              <button onClick={() => setShowEditModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="mb-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 font-black text-sm">{selectedTeacher}</div>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest mb-3 block text-slate-400">Bayar Hingga</label>
                <select value={editMonth} onChange={(e) => setEditMonth(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs appearance-none">
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m.toUpperCase()}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest mb-3 block text-slate-400">Amaun RM</label>
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-center text-sm">RM {editMonth * FEE_RATE}</div>
              </div>
            </div>
            <div className="mb-10">
              <label className="text-[10px] font-black uppercase tracking-widest mb-3 block text-slate-400">Tarikh Terima</label>
              <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs" />
            </div>
            <button onClick={handleSavePayment} disabled={isSaving} className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3">
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />} Simpan Rekod
            </button>
          </div>
        </div>
      )}

      {showTransactionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-black uppercase tracking-widest text-[10px]">Rekod Transaksi Tunai</h2>
              <button onClick={() => {setShowTransactionModal(false); setTransactionToEdit(null);}}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="flex gap-2 mb-6">
              <button onClick={() => setNewTransType('IN')} className={`flex-1 py-3 rounded-xl text-[10px] font-black border ${newTransType === 'IN' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'text-slate-400'}`}>MASUK</button>
              <button onClick={() => setNewTransType('OUT')} className={`flex-1 py-3 rounded-xl text-[10px] font-black border ${newTransType === 'OUT' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'text-slate-400'}`}>KELUAR</button>
            </div>
            <div className="mb-4">
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Amaun (RM)</label>
              <input type="number" placeholder="0.00" value={newTransAmount} onChange={(e) => setNewTransAmount(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black" />
            </div>
            <div className="mb-8">
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Butiran / Catatan</label>
              <input type="text" placeholder="Catatan transaksi..." value={newTransNote} onChange={(e) => setNewTransNote(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" />
            </div>
            <button onClick={handleSaveTransaction} disabled={isSaving} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] shadow-lg">SIMPAN TRANSAKSI</button>
          </div>
        </div>
      )}

      {showDeleteTransModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 text-center max-w-sm">
            <AlertTriangle className="text-rose-500 w-12 h-12 mx-auto mb-4" />
            <h2 className="font-black mb-2">Padam Rekod?</h2>
            <p className="text-sm text-slate-500 mb-8">Adakah anda pasti mahu memadam transaksi ini secara kekal?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteTransModal(false)} className="flex-1 py-3 font-black text-[10px]">BATAL</button>
              <button onClick={confirmDeleteTransaction} className="flex-1 bg-rose-500 text-white rounded-xl py-3 font-black text-[10px]">PADAM</button>
            </div>
          </div>
        </div>
      )}

      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm">
            <h2 className="font-black uppercase text-[10px] mb-8">Tambah Ahli Baru</h2>
            <input 
              type="text" placeholder="NAMA PENUH" value={newTeacherName} onChange={(e) => setNewTeacherName(e.target.value.toUpperCase())}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-8 font-black text-sm"
            />
            <button onClick={handleAddTeacher} disabled={isSaving} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] shadow-lg">TAMBAH GURU</button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 text-center max-w-sm">
            <AlertTriangle className="text-rose-500 w-12 h-12 mx-auto mb-4" />
            <h2 className="font-black mb-2">Padam Guru?</h2>
            <p className="text-sm text-slate-500 mb-8 font-bold">Padam: <br/>{teacherToDelete}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 font-black text-[10px]">BATAL</button>
              <button onClick={confirmDeleteTeacher} className="flex-1 bg-rose-500 text-white rounded-xl py-3 font-black text-[10px]">PADAM</button>
            </div>
          </div>
        </div>
      )}

      {showEditNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm">
            <h2 className="font-black uppercase text-[10px] mb-8">Edit Nama Guru</h2>
            <input 
              type="text" value={newNameInput} onChange={(e) => setNewNameInput(e.target.value.toUpperCase())}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-8 font-black text-sm"
            />
            <button onClick={handleUpdateName} disabled={isSaving} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] shadow-lg">KEMASKINI NAMA</button>
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