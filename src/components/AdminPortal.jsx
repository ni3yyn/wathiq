import React, { useState, useEffect } from 'react';
import { ShieldCheck, Link, Save, LogOut, Activity } from 'lucide-react';
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from "firebase/firestore";
import { auth, db } from '../firebase'; // Your config
import './AdminPortal.css';

const AdminPortal = ({ user, setView }) => {
  if (!user) {
    return <AdminLogin setView={setView} />;
  }
  return <AdminDashboard user={user} />;
};

// --- Login Screen ---
const AdminLogin = ({ setView }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      setError("بيانات الدخول غير صحيحة");
    }
  };

  return (
    <div className="admin-wrapper">
      <div className="admin-card">
        <div className="admin-header">
          <ShieldCheck size={48} className="text-mint-400" style={{ color: '#34d399', margin: '0 auto 1rem' }} />
          <h1>مشرف وثيق</h1>
          <p>أدخل بيانات الاعتماد للمتابعة</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input className="admin-input" placeholder="البريد الإلكتروني" onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <input className="admin-input" type="password" placeholder="كلمة المرور" onChange={e => setPass(e.target.value)} />
          </div>
          {error && <p style={{color:'#f87171', fontSize:14, textAlign:'center'}}>{error}</p>}
          <button className="admin-btn">تسجيل الدخول</button>
        </form>
        <button className="admin-btn logout-btn" onClick={() => setView('landing')}>عودة للصفحة الرئيسية</button>
      </div>
    </div>
  );
};

// --- Main Dashboard ---
const AdminDashboard = ({ user }) => {
  const [version, setVersion] = useState('');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastVersion, setLastVersion] = useState(null);

  // Fetch the current live version to show underneath
  useEffect(() => {
    const fetchLatest = async () => {
      const q = query(collection(db, "releases"), orderBy("createdAt", "desc"), limit(3));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => d.data());
      setLastVersion(data);
    };
    fetchLatest();
  }, [loading]);

  const handlePublish = async (e) => {
    e.preventDefault();
    if(!version || !link) return alert("املأ جميع الحقول");
    
    // Optional: Basic validation to check if it's a URL
    if(!link.startsWith('http')) return alert("الرابط يجب أن يبدأ بـ http:// أو https://");

    setLoading(true);
    try {
      // We only save text to Firestore (Free & Fast)
      await addDoc(collection(db, "releases"), {
        version: version,
        fileUrl: link, // Use the link pasted by admin
        createdAt: serverTimestamp(),
        adminEmail: user.email
      });
      alert(`✅ تم إطلاق التحديث ${version} بنجاح!`);
      setVersion('');
      setLink('');
    } catch (err) {
      alert("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="admin-wrapper">
      <div className="admin-card">
        <div className="admin-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
           <h2>مركز التحكم</h2>
           <button onClick={() => signOut(auth)} style={{background:'none', border:'none', cursor:'pointer'}}><LogOut size={20} color="#64748b" /></button>
        </div>

        <form onSubmit={handlePublish}>
          {/* Version Name */}
          <div className="form-group">
            <label className="form-label">رقم الإصدار (Version Name)</label>
            <input 
              className="admin-input" 
              placeholder="v1.2.0" 
              value={version}
              onChange={e => setVersion(e.target.value)} 
            />
          </div>

          {/* External Link */}
          <div className="form-group">
            <label className="form-label">رابط التحميل الخارجي (APK URL)</label>
            <div style={{position:'relative'}}>
                <Link size={16} style={{position:'absolute', right:12, top:14, color:'#64748b'}} />
                <input 
                  className="admin-input" 
                  style={{paddingRight:'2.5rem'}}
                  placeholder="https://mediafire.com/file/wathiq_app.apk" 
                  value={link}
                  onChange={e => setLink(e.target.value)} 
                />
            </div>
            <p style={{fontSize:11, color:'#64748b', marginTop:5}}>
               💡 نصيحة: ارفع الملف على Google Drive أو MediaFire وألصق الرابط هنا.
            </p>
          </div>

          <button className="admin-btn" disabled={loading}>
            {loading ? "جاري النشر..." : (
               <>
                 <Save size={18} /> حفظ ونشر التحديث
               </>
            )}
          </button>
        </form>

        {/* Quick History */}
        <div className="version-history">
          <h3 style={{fontSize:'0.9rem', color:'#94a3b8', display:'flex', gap:5, marginBottom:10}}>
             <Activity size={14} /> آخر التحديثات
          </h3>
          {lastVersion?.map((v, i) => (
             <div key={i} className="history-item">
                <span style={{fontWeight:'bold', color:'white'}}>{v.version}</span>
                <span style={{maxWidth: 150, overflow:'hidden', textOverflow:'ellipsis', color:'#64748b', direction:'ltr'}}>
                   {v.fileUrl}
                </span>
                {i === 0 && <span className="active-tag">Active</span>}
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;