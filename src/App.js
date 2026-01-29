/* global __firebase_config, __app_id, __initial_auth_token */
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
  query,
  orderBy,
  getDoc
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken,
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
  FileText,
  Save,
  AlertTriangle,
  Pencil
} from 'lucide-react';

// --- CONFIGURATION ---
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// FIX: Gunakan ID dinamik dari persekitaran
const APP_ID_PATH = typeof __app_id !== 'undefined' ? __app_id : 'smka-tun-juhar-yuran-2026'; 

// Senarai asal untuk "backup" atau inisialisasi pertama kali
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
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState({});
  const [teacherList, setTeacherList] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modals
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [showDeleteTransModal, setShowDeleteTransModal] = useState(false); // New: Delete Transaction Modal

  // Form States
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  
  // Transaction Edit/Delete States
  const [transactionToEdit, setTransactionToEdit] = useState(null); // New: Store transaction being edited
  const [transToDelete, setTransToDelete] = useState(null); // New: Store transaction being deleted

  // Edit Name States
  const [nameToEdit, setNameToEdit] = useState(null);
  const [newNameInput, setNewNameInput] = useState("");

  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [editMonth, setEditMonth] = useState(0);
  const [editDate, setEditDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDefaultersExpanded, setIsDefaultersExpanded] = useState(false);

  // New Form States
  const [newTeacherName, setNewTeacherName] = useState("");
  const [newTransAmount, setNewTransAmount] = useState("");
  const [newTransNote, setNewTransNote] = useState("");
  const [newTransType, setNewTransType] = useState("IN"); 
  const [newTransDate, setNewTransDate] = useState(new Date().toISOString().split('T')[0]);

  // --- EFFECTS ---

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) { console.error("Auth Error:", e); }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;

    // Payments
    const qPayments = collection(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'payments');
    const unsubPayments = onSnapshot(qPayments, (snapshot) => {
      const data = {};
      snapshot.forEach(doc => data[doc.id] = doc.data());
      setPayments(data);
    }, (error) => console.error("Payments Error:", error));

    // Teacher List
    const docRef = doc(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'config', 'metadata');
    const unsubTeachers = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().teachers) {
        setTeacherList(docSnap.data().teachers);
      } else {
        setTeacherList(INITIAL_TEACHER_NAMES);
      }
      setLoading(false);
    }, (error) => {
      console.error("Teacher List Error:", error);
      setTeacherList(INITIAL_TEACHER_NAMES);
      setLoading(false);
    });

    // Transactions
    const qTrans = collection(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'transactions');
    const unsubTrans = onSnapshot(qTrans, (snapshot) => {
      const trans = [];
      snapshot.forEach(doc => trans.push({ id: doc.id, ...doc.data() }));
      trans.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA || new Date(b.createdAt) - new Date(a.createdAt);
      });
      setTransactions(trans);
    }, (error) => console.error("Transactions Error:", error));

    return () => {
      unsubPayments();
      unsubTeachers();
      unsubTrans();
    };
  }, [user]);

  // --- COMPUTED VALUES ---

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
      if (filterStatus === 'paid') matchesFilter = data.paidUntil > 0;
      if (filterStatus === 'unpaid') matchesFilter = data.paidUntil === 0;
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

  // Open Edit Name Modal
  const openEditName = (name) => {
    setNameToEdit(name);
    setNewNameInput(name);
    setShowEditNameModal(true);
  };

  // Save Name Change
  const handleUpdateName = async () => {
    if (!newNameInput.trim() || !nameToEdit) return;
    if (newNameInput.trim().toUpperCase() === nameToEdit) {
      setShowEditNameModal(false);
      return;
    }

    setIsSaving(true);
    try {
      const newName = newNameInput.trim().toUpperCase();
      
      // 1. Update List
      const newList = teacherList.map(t => t === nameToEdit ? newName : t);
      await setDoc(doc(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'config', 'metadata'), {
        teachers: newList
      }, { merge: true });

      // 2. Migrate Payment Data (Create new doc, copy data, delete old doc)
      const oldDocId = nameToEdit.replace(/[^a-zA-Z0-9]/g, '_');
      const newDocId = newName.replace(/[^a-zA-Z0-9]/g, '_');

      if (oldDocId !== newDocId) {
        // Fetch old data
        const oldDocRef = doc(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'payments', oldDocId);
        const oldSnap = await getDoc(oldDocRef);
        
        if (oldSnap.exists()) {
          // Create new doc with new name
          await setDoc(doc(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'payments', newDocId), {
            ...oldSnap.data(),
            name: newName,
            updatedAt: new Date().toISOString()
          });
          // Delete old doc
          await deleteDoc(oldDocRef);
        }
      }

      setShowEditNameModal(false);
      setNameToEdit(null);
    } catch (err) { console.error("Update Name Error:", err); }
    finally { setIsSaving(false); }
  };

  // Open Delete Confirmation Modal
  const requestDeleteTeacher = (name) => {
    setTeacherToDelete(name);
    setShowDeleteModal(true);
  };

  // Confirm Delete
  const confirmDeleteTeacher = async () => {
    if (!teacherToDelete) return;
    setIsDeleting(true);
    try {
      // 1. Update the list
      const newList = teacherList.filter(name => name !== teacherToDelete);
      await setDoc(doc(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'config', 'metadata'), {
        teachers: newList
      }, { merge: true });

      // 2. Optional: Delete their payment record too for cleanup
      const docId = teacherToDelete.replace(/[^a-zA-Z0-9]/g, '_');
      await deleteDoc(doc(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'payments', docId));
      
      setShowDeleteModal(false);
      setTeacherToDelete(null);
    } catch (err) { console.error("Delete Error:", err); }
    finally { setIsDeleting(false); }
  };

  // --- TRANSACTION HANDLERS ---

  const openEditTransaction = (trans) => {
    setTransactionToEdit(trans);
    setNewTransAmount(trans.amount);
    setNewTransType(trans.type);
    setNewTransNote(trans.note);
    setNewTransDate(trans.date);
    setShowTransactionModal(true);
  };

  const requestDeleteTransaction = (trans) => {
    setTransToDelete(trans);
    setShowDeleteTransModal(true);
  };

  const confirmDeleteTransaction = async () => {
    if (!transToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'transactions', transToDelete.id));
      setShowDeleteTransModal(false);
      setTransToDelete(null);
    } catch (err) { console.error(err); }
    finally { setIsDeleting(false); }
  };

  const handleSaveTransaction = async () => {
    if (!newTransAmount || !newTransNote) return;
    setIsSaving(true);
    try {
      if (transactionToEdit) {
        // UPDATE Existing
        await setDoc(doc(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'transactions', transactionToEdit.id), {
          amount: parseFloat(newTransAmount),
          type: newTransType,
          note: newTransNote,
          date: newTransDate,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } else {
        // CREATE New
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
      setTransactionToEdit(null); // Reset edit state
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  // Close transaction modal handler (to reset edit state)
  const closeTransactionModal = () => {
    setShowTransactionModal(false);
    setTransactionToEdit(null);
    setNewTransAmount("");
    setNewTransNote("");
  };

  // --- RENDER HELPERS ---

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
      {/* NAVBAR */}
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
        
        {/* ADMIN TABS */}
        {isAdmin && (
          <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-[2rem] shadow-sm border border-slate-200">
            {[
              { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
              { id: 'teachers', label: 'Senarai Guru', icon: Users },
              { id: 'finance', label: 'Kewangan & Aliran', icon: Wallet }
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

        {/* VIEW: FINANCE */}
        {isAdmin && activeTab === 'finance' && (
          <div className="animate-in fade-in zoom-in duration-300">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
               <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <p className="text-[10px] font-black opacity-70 uppercase tracking-widest mb-2">Baki Semasa (Tunai)</p>
                <div className="text-3xl font-black tracking-tighter">RM {financialStats.currentBalance.toFixed(2)}</div>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold bg-white/20 w-fit px-3 py-1 rounded-full">
                  <Wallet className="w-3 h-3" /> Termasuk Yuran & Lain-lain
                </div>
              </div>
              <div className="bg-emerald-50 p-6 rounded-[2.5rem] border border-emerald-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><ArrowDownLeft className="w-5 h-5" /></div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Aliran Masuk</p>
                </div>
                <div className="text-2xl font-black text-emerald-700 tracking-tighter">+ RM {financialStats.totalIn.toFixed(2)}</div>
                <p className="text-[9px] text-emerald-500 mt-2 font-bold opacity-70">Sumbangan luar / Lain-lain</p>
              </div>
              <div className="bg-rose-50 p-6 rounded-[2.5rem] border border-rose-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-rose-100 p-2 rounded-xl text-rose-600"><ArrowUpRight className="w-5 h-5" /></div>
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Aliran Keluar</p>
                </div>
                <div className="text-2xl font-black text-rose-700 tracking-tighter">- RM {financialStats.totalOut.toFixed(2)}</div>
                <p className="text-[9px] text-rose-500 mt-2 font-bold opacity-70">Belanja / Program</p>
              </div>
            </div>

            {/* Transaction List */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 md:p-8 flex justify-between items-center border-b border-slate-100 bg-slate-50/50">
                <div>
                  <h3 className="text-lg font-black text-slate-800">Rekod Transaksi</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sejarah aliran wang masuk & keluar</p>
                </div>
                <button 
                  onClick={() => setShowTransactionModal(true)}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Rekod Baru
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {transactions.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">Tiada rekod transaksi belum ada</div>
                ) : (
                  transactions.map((trans) => (
                    <div key={trans.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-2xl ${trans.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                          {trans.type === 'IN' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm mb-1">{trans.note}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {trans.date}
                            </span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider ${trans.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                              {trans.type === 'IN' ? 'Masuk' : 'Keluar'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className={`text-lg font-black tracking-tight ${trans.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {trans.type === 'IN' ? '+' : '-'} RM {parseFloat(trans.amount).toFixed(2)}
                        </div>
                        {/* EDIT & DELETE BUTTONS FOR TRANSACTION */}
                        <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEditTransaction(trans)}
                            className="p-2 bg-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Edit Transaksi"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => requestDeleteTransaction(trans)}
                            className="p-2 bg-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Padam Transaksi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: TEACHER MANAGEMENT */}
        {isAdmin && activeTab === 'teachers' && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm p-8">
              <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-800">Senarai Nama Guru</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Urus senarai ahli kelab</p>
                </div>
                <button onClick={() => setShowAddTeacherModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                  <Plus className="w-4 h-4" /> Tambah Guru
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {teacherList.map((name, idx) => (
                  <div key={idx} className="group flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-200 transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-white text-slate-400 flex items-center justify-center text-[10px] font-black border border-slate-200 shrink-0">
                        {idx + 1}
                      </div>
                      <span className="text-xs font-bold text-slate-700 truncate">{name}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {/* EDIT NAME BUTTON */}
                      <button 
                        onClick={() => openEditName(name)}
                        className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Edit Nama"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      
                      {/* DELETE BUTTON */}
                      <button 
                        onClick={() => requestDeleteTeacher(name)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        title="Padam Nama"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: DASHBOARD (DEFAULT) */}
        {(!isAdmin || activeTab === 'dashboard') && (
          <div className="animate-in fade-in zoom-in duration-300">
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
               {/* ADDED BACK: Total Members */}
               <div className="p-6 rounded-[2rem] bg-indigo-50 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3 bg-white text-indigo-600">
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-slate-400">Jumlah Ahli</p>
                <div className="text-2xl font-black tracking-tighter text-slate-800">{teacherList.length}</div>
              </div>

              {[
                { 
                  label: 'Baki Tabung', 
                  value: `RM ${financialStats.currentBalance.toFixed(2)}`, 
                  icon: Wallet, 
                  bg: 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' 
                },
                { 
                  label: 'Jumlah Masuk', 
                  value: `RM ${(totalFeesCollected + financialStats.totalIn).toFixed(2)}`, 
                  icon: ArrowDownLeft, 
                  bg: 'bg-emerald-50 text-emerald-600' 
                },
                { 
                  label: 'Jumlah Keluar', 
                  value: `RM ${financialStats.totalOut.toFixed(2)}`, 
                  icon: ArrowUpRight, 
                  bg: 'bg-rose-50 text-rose-600' 
                }
              ].map((stat, i) => (
                <div key={i} className={`p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow ${stat.bg.includes('text-white') ? stat.bg : 'bg-white border border-slate-200'}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${stat.bg.includes('text-white') ? 'bg-white/20 text-white' : stat.bg}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${stat.bg.includes('text-white') ? 'text-indigo-100' : 'text-slate-400'}`}>{stat.label}</p>
                  <div className={`text-2xl font-black tracking-tighter ${stat.bg.includes('text-white') ? 'text-white' : 'text-slate-800'}`}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Defaulters Section */}
            {defaulters.length > 0 && (
              <div className="bg-white border border-rose-100 rounded-[2.5rem] overflow-hidden mb-8 shadow-sm">
                <button onClick={() => setIsDefaultersExpanded(!isDefaultersExpanded)} className="w-full flex items-center justify-between p-6 hover:bg-rose-50/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-rose-500 p-3 rounded-2xl shadow-lg shadow-rose-100">
                      <AlertCircle className="text-white w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-slate-800 font-black text-sm uppercase tracking-wider">Senarai Ahli Belum Bayar</h2>
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

            {/* Search & Filter */}
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

            {/* Main Table */}
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
              {/* Desktop View */}
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

              {/* Mobile View */}
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
          </div>
        )}
      </main>

      {/* --- MODALS --- */}

      {/* EDIT NAME MODAL (NEW) */}
      {showEditNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-black text-slate-800 text-[10px] uppercase tracking-widest flex items-center gap-2">
                <Pencil className="w-4 h-4" /> Edit Nama Guru
              </h2>
              <button onClick={() => setShowEditNameModal(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
            </div>
            <div className="p-8">
              <div className="mb-6">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Nama Baru</label>
                <input 
                  type="text" 
                  autoFocus
                  value={newNameInput} 
                  onChange={(e) => setNewNameInput(e.target.value.toUpperCase())} 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" 
                />
              </div>
              <button 
                onClick={handleUpdateName}
                disabled={!newNameInput.trim() || isSaving}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 flex justify-center items-center gap-2"
              >
                {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />} Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE TEACHER CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-rose-500 w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-2">Pasti Padam?</h2>
              <p className="text-sm text-slate-500 font-bold mb-6">
                Anda akan memadam <span className="text-slate-800">{teacherToDelete}</span>. Tindakan ini tidak boleh dikembalikan.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDeleteTeacher}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-600 flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Padam'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE TRANSACTION CONFIRMATION MODAL */}
      {showDeleteTransModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-rose-500 w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-2">Padam Transaksi?</h2>
              <p className="text-sm text-slate-500 font-bold mb-6">
                Adakah anda pasti mahu memadam rekod transaksi ini?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteTransModal(false)}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDeleteTransaction}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-600 flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Padam'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-sm overflow-hidden scale-100">
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

      {/* ADD TEACHER MODAL */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-black text-slate-800 text-[10px] uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4" /> Tambah Guru Baru
              </h2>
              <button onClick={() => setShowAddTeacherModal(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
            </div>
            <div className="p-10">
              <div className="mb-6">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Nama Penuh Guru</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="CONTOH: EN. ALI BIN ABU"
                  value={newTeacherName} 
                  onChange={(e) => setNewTeacherName(e.target.value.toUpperCase())} 
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" 
                />
              </div>
              <button 
                onClick={handleAddTeacher}
                disabled={!newTeacherName.trim() || isSaving}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 flex justify-center items-center gap-2"
              >
                {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />} Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRANSACTION MODAL (ADD / EDIT) */}
      {showTransactionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-black text-slate-800 text-[10px] uppercase tracking-widest flex items-center gap-2">
                <Wallet className="w-4 h-4" /> {transactionToEdit ? 'Kemaskini Transaksi' : 'Rekod Transaksi'}
              </h2>
              <button onClick={closeTransactionModal}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
            </div>
            <div className="p-10">
              <div className="flex gap-2 mb-6">
                <button 
                  onClick={() => setNewTransType('IN')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border ${newTransType === 'IN' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'border-slate-100 text-slate-400'}`}
                >
                  Masuk (Debit)
                </button>
                <button 
                  onClick={() => setNewTransType('OUT')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border ${newTransType === 'OUT' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'border-slate-100 text-slate-400'}`}
                >
                  Keluar (Kredit)
                </button>
              </div>

              <div className="mb-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Amaun (RM)</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={newTransAmount} 
                  onChange={(e) => setNewTransAmount(e.target.value)} 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg" 
                />
              </div>

              <div className="mb-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Catatan / Butiran</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Belian alat tulis..."
                  value={newTransNote} 
                  onChange={(e) => setNewTransNote(e.target.value)} 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" 
                />
              </div>

              <div className="mb-8">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tarikh</label>
                <input 
                  type="date" 
                  value={newTransDate} 
                  onChange={(e) => setNewTransDate(e.target.value)} 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" 
                />
              </div>

              <button 
                onClick={handleSaveTransaction}
                disabled={!newTransAmount || !newTransNote || isSaving}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 flex justify-center items-center gap-2"
              >
                {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />} 
                {transactionToEdit ? 'Simpan Perubahan' : 'Simpan Transaksi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PAYMENT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
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
              <button onClick={handleSavePayment} disabled={isSaving} className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3">
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