import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  Users, Download, TrendingUp, Activity, Lock, Smartphone, 
  Layout, RefreshCw, MapPin, Clock, MousePointer, 
  ShieldCheck, AlertCircle
} from 'lucide-react';

// --- 1. REGISTER CHARTJS COMPONENTS ---
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, ArcElement, Filler
);

// --- 2. CONFIGURATION & CONSTANTS ---
const GA4_PROPERTY_ID = '514500614';
const CLIENT_ID = '964917104358-kf2fl5i5k4esnslnssetlrn84g84l9v5.apps.googleusercontent.com'; 
const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';

const THEME = {
  bg: '#0f172a', 
  card: '#1e293b', 
  cardHover: '#334155',
  border: '#334155', 
  textPrimary: '#f8fafc', 
  textSecondary: '#94a3b8', 
  accent: '#38bdf8', 
  success: '#4ade80', 
  warning: '#facc15', 
  purple: '#a78bfa',
  error: '#f87171',
  chartColors: ['#38bdf8', '#4ade80', '#facc15', '#f87171', '#a78bfa', '#fb923c']
};

const EVENT_TRANSLATIONS = {
  'session_start': 'بدء زيارة', 
  'first_open': 'تثبيت جديد', 
  'app_remove': 'حذف التطبيق',
  'file_download': 'تحميل ملف', 
  'click': 'نقر على زر', 
  'view_search_results': 'بحث',
  'scroll': 'تصفح', 
  'user_engagement': 'تفاعل نشط', 
  'page_view': 'مشاهدة صفحة',
  'Apk_download': 'تحميل APK', 
  'screen_view': 'مشاهدة شاشة',
  'form_submit': 'إرسال نموذج'
};

const PAGE_TRANSLATIONS = {
  '/': 'الرئيسية',
  '(not set)': 'صفحة غير معروفة',
  '/community': 'المجتمع',
};

// --- FILTER CONFIGURATION (Historical Data Only) ---
const EXCLUDE_FILTER = {
  notExpression: {
    orGroup: {
      expressions: [
        { filter: { fieldName: 'pagePath', stringFilter: { matchType: 'BEGINS_WITH', value: '/analytics' } } },
        { filter: { fieldName: 'pagePath', stringFilter: { matchType: 'BEGINS_WITH', value: '/wathiq-admin' } } },
        { filter: { fieldName: 'pagePath', stringFilter: { matchType: 'BEGINS_WITH', value: '/admin' } } }
      ]
    }
  }
};

// --- 3. MAIN COMPONENT ---
const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('visits'); 
  
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [tokenClient, setTokenClient] = useState(null);
  const isMounted = useRef(true);

  // Data State
  const [kpi, setKpi] = useState({
    activeUsers: 0, newUsers: 0, engagementRate: 0, avgSessionDuration: 0,
    totalDownloads: 0, conversionRate: 0, realtimeUsers: 0
  });

  const [charts, setCharts] = useState({
    history: { labels: [], datasets: [] },
    downloads: { labels: [], datasets: [] },
    sources: { labels: [], datasets: [] }, 
    devices: { labels: [], datasets: [] }
  });

  const [lists, setLists] = useState({
    detailedEvents: [], 
    topPages: [], 
    topCities: [], 
    recentActivity: [] 
  });

  useEffect(() => { return () => { isMounted.current = false; }; }, []);

  // --- AUTH SETUP ---
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID, scope: SCOPE,
          callback: (resp) => { if (resp.access_token) setAccessToken(resp.access_token); },
        });
        setTokenClient(client);
      }
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  useEffect(() => {
    if (accessToken) refreshData();
  }, [accessToken, timeRange, customDate]);

  // --- DATA FETCHING ---
  const refreshData = async () => {
    if (!accessToken) return;
    setLoading(true);

    try {
      const apiURL = `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`;
      const realtimeURL = `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runRealtimeReport`;
      const headers = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

      let dateRanges = [{ startDate: '7daysAgo', endDate: 'today' }];
      let dimDate = 'date';
      
      if (timeRange === '24h') {
        dateRanges = [{ startDate: '1daysAgo', endDate: 'today' }];
        dimDate = 'hour';
      } else if (timeRange === 'specific') {
        dateRanges = [{ startDate: customDate, endDate: customDate }];
        dimDate = 'hour';
      } else if (timeRange === '30d') {
        dateRanges = [{ startDate: '30daysAgo', endDate: 'today' }];
      }

      // 2. FETCH REQUESTS
      const [kpiRes, chartsRes, downRes, detailedEventsRes, pagesRes, cityRes, techRes, realEventsRes, realUserRes] = await Promise.all([
        // KPI & Charts
        fetch(apiURL, { method: 'POST', headers, body: JSON.stringify({ dateRanges, metrics: [{name:'activeUsers'},{name:'newUsers'},{name:'engagementRate'},{name:'averageSessionDuration'}] }) }),
        fetch(apiURL, { method: 'POST', headers, body: JSON.stringify({ dateRanges, dimensions: [{ name: dimDate }], metrics: [{ name: 'activeUsers' }], orderBys: [{ dimension: { orderType: 'ALPHANUMERIC', dimensionName: dimDate } }] }) }),
        fetch(apiURL, { method: 'POST', headers, body: JSON.stringify({ dateRanges, dimensions: [{ name: dimDate }], metrics: [{ name: 'eventCount' }], dimensionFilter: { filter: { fieldName: 'eventName', inListFilter: { values: ['file_download', 'Apk_download', 'first_open', 'click'], caseSensitive: false } } }, orderBys: [{ dimension: { orderType: 'ALPHANUMERIC', dimensionName: dimDate } }] }) }),
        
        // --- REALTIME LOG (FIXED) ---
        // CHANGED: 'pagePath' -> 'unifiedPageScreen'. This dimension works for both Web and App in Realtime.
        fetch(realtimeURL, {
          method: 'POST', headers,
          body: JSON.stringify({
            dimensions: [{name: 'minutesAgo'}, {name: 'eventName'}, {name: 'unifiedPageScreen'}, {name: 'city'}],
            metrics: [{name: 'eventCount'}],
            orderBys: [{ dimension: { dimensionName: 'minutesAgo' }, desc: false }],
            limit: 60 
          })
        }),

        // Top Pages (Historical)
        fetch(apiURL, {
          method: 'POST', headers,
          body: JSON.stringify({ 
            dateRanges, 
            dimensions: [{name:'pagePath'}], 
            metrics: [{name:'screenPageViews'}], 
            dimensionFilter: EXCLUDE_FILTER, 
            orderBys: [{metric:{metricName:'screenPageViews'},desc:true}], 
            limit: 50 
          })
        }),
        
        // Other Data
        fetch(apiURL, { method: 'POST', headers, body: JSON.stringify({ dateRanges, dimensions: [{name:'city'},{name:'country'}], metrics: [{name:'activeUsers'}], orderBys: [{metric:{metricName:'activeUsers'},desc:true}], limit: 5 }) }),
        fetch(apiURL, { method: 'POST', headers, body: JSON.stringify({ dateRanges, dimensions: [{name:'sessionSource'},{name:'operatingSystem'}], metrics: [{name:'activeUsers'}] }) }),
        
        // Realtime Summaries
        fetch(realtimeURL, { method: 'POST', headers, body: JSON.stringify({ dimensions: [{name:'eventName'},{name:'city'}], metrics: [{name:'eventCount'}] }) }),
        fetch(realtimeURL, { method: 'POST', headers, body: JSON.stringify({ metrics: [{name:'activeUsers'}] }) })
      ]);

      const kpiData = await kpiRes.json();
      const timeData = await chartsRes.json();
      const downData = await downRes.json();
      const eventsLogData = await detailedEventsRes.json();
      const pagesData = await pagesRes.json();
      const cityData = await cityRes.json();
      const techData = await techRes.json();
      const realEventsData = await realEventsRes.json();
      const realUsersData = await realUserRes.json();

      if (!isMounted.current) return;

      // --- PROCESSING ---

      // 1. KPI
      const kpiVals = kpiData.rows?.[0]?.metricValues || [];
      const activeUsers = parseInt(kpiVals[0]?.value || 0);
      const realtimeUserCount = parseInt(realUsersData.rows?.[0]?.metricValues?.[0]?.value || 0);

      let totalDownloads = 0;
      const downloadLabels = [];
      const downloadValues = [];
      (downData.rows || []).forEach(r => {
        totalDownloads += parseInt(r.metricValues[0].value);
        let lbl = r.dimensionValues[0].value;
        lbl = dimDate === 'date' ? `${lbl.substring(6,8)}/${lbl.substring(4,6)}` : `${lbl}:00`;
        downloadLabels.push(lbl);
        downloadValues.push(r.metricValues[0].value);
      });

      const conversionRate = activeUsers > 0 ? ((totalDownloads / activeUsers) * 100).toFixed(2) : "0.00";

      setKpi({
        activeUsers, newUsers: parseInt(kpiVals[1]?.value || 0), engagementRate: parseFloat(kpiVals[2]?.value || 0) * 100, avgSessionDuration: parseFloat(kpiVals[3]?.value || 0), totalDownloads, conversionRate, realtimeUsers: realtimeUserCount 
      });

      // 2. Charts
      const timeLabels = []; const timeValues = [];
      (timeData.rows || []).forEach(r => {
        let lbl = r.dimensionValues[0].value;
        lbl = dimDate === 'date' ? `${lbl.substring(6,8)}/${lbl.substring(4,6)}` : `${lbl}:00`;
        timeLabels.push(lbl); timeValues.push(r.metricValues[0].value);
      });

      const osMap = {}; const sourceMap = {};
      (techData.rows || []).forEach(r => {
        const src = r.dimensionValues[0].value.replace('(direct)', 'مباشر').replace('(not set)', 'غير معروف');
        const os = r.dimensionValues[1].value;
        const val = parseInt(r.metricValues[0].value);
        osMap[os] = (osMap[os] || 0) + val; sourceMap[src] = (sourceMap[src] || 0) + val;
      });

      setCharts({
        history: { labels: timeLabels, datasets: [{ label: 'الزوار', data: timeValues, borderColor: THEME.accent, backgroundColor: 'rgba(56, 189, 248, 0.1)', fill: true, tension: 0.4 }] },
        downloads: { labels: downloadLabels, datasets: [{ label: 'التحميلات', data: downloadValues, backgroundColor: THEME.purple, borderRadius: 4 }] },
        devices: { labels: Object.keys(osMap), datasets: [{ data: Object.values(osMap), backgroundColor: THEME.chartColors, borderWidth: 0 }] },
        sources: { labels: Object.keys(sourceMap), datasets: [{ data: Object.values(sourceMap), backgroundColor: THEME.chartColors, borderWidth: 0 }] }
      });

      // 3. Formatting Realtime Log (WITH JS FILTERING & NEW DIMENSION)
      const now = new Date();
      
      const validEvents = (eventsLogData.rows || []).filter(r => {
        const path = r.dimensionValues[2].value; // This is now 'unifiedPageScreen'
        // Filter out admin paths manually
        if (path.startsWith('/admin') || path.startsWith('/wathiq-admin') || path.startsWith('/analytics')) return false;
        return true;
      });

      const formattedLog = validEvents.map(r => {
        const minsAgo = parseInt(r.dimensionValues[0].value || 0);
        const logTime = new Date(now.getTime() - minsAgo * 60000);
        const h = logTime.getHours().toString().padStart(2, '0');
        const m = logTime.getMinutes().toString().padStart(2, '0');
        
        let rawPath = r.dimensionValues[2].value; // unifiedPageScreen
        
        // Normalize Paths
        if (rawPath === '(not set)') rawPath = 'تطبيق (App)';
        if (rawPath === '/landing_page' || rawPath === '/landing' || rawPath === '/') rawPath = 'الرئيسية';
        
        return {
          time: `${h}:${m}`,
          rawName: r.dimensionValues[1].value,
          name: EVENT_TRANSLATIONS[r.dimensionValues[1].value] || r.dimensionValues[1].value,
          path: rawPath,
          city: r.dimensionValues[3].value === '(not set)' ? 'عام' : r.dimensionValues[3].value,
          count: r.metricValues[0].value
        };
      });

      // 4. TOP PAGES (SAFE MERGE)
      const pageMap = {};
      (pagesData.rows || []).forEach(r => {
        let path = r.dimensionValues[0].value;
        const views = parseInt(r.metricValues[0].value);

        path = path.split('?')[0];
        if (path.startsWith('/admin') || path.startsWith('/wathiq-admin') || path.startsWith('/analytics')) return;
        
        if (path === '/landing_page' || path === '/landing' || path === '/index.html') {
          path = '/';
        }

        if (!pageMap[path]) pageMap[path] = 0;
        pageMap[path] += views;
      });

      const mergedPages = Object.keys(pageMap).map(path => ({
        name: PAGE_TRANSLATIONS[path] || path, 
        views: pageMap[path]
      })).sort((a, b) => b.views - a.views);

      setLists({
        detailedEvents: formattedLog,
        topPages: mergedPages,
        topCities: (cityData.rows || []).map(r => ({ city: r.dimensionValues[0].value, country: r.dimensionValues[1].value, users: r.metricValues[0].value })),
        recentActivity: (realEventsData.rows || []).slice(0, 10).map(r => ({ action: EVENT_TRANSLATIONS[r.dimensionValues[0].value] || r.dimensionValues[0].value, location: r.dimensionValues[1].value === '(not set)' ? 'غير محدد' : r.dimensionValues[1].value, count: r.metricValues[0].value }))
      });

      setLastUpdated(new Date());

    } catch (err) {
      console.error("Dashboard Error:", err);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const ChartTabs = () => (
    <div style={{display: 'flex', gap: '8px', marginBottom: '16px', background: THEME.bg, padding: '4px', borderRadius: '8px', border: `1px solid ${THEME.border}`}}>
      {[ { id: 'visits', label: 'الزيارات', icon: Users }, { id: 'downloads', label: 'التحميلات', icon: Download }, { id: 'geo', label: 'المدن', icon: MapPin }, { id: 'tech', label: 'المصادر', icon: Smartphone } ].map(tab => (
        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
          style={{
            flex: 1, border: 'none', background: activeTab === tab.id ? THEME.accent : 'transparent',
            color: activeTab === tab.id ? '#0f172a' : THEME.textSecondary,
            padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s', fontSize: '0.9rem'
          }}>
          <tab.icon size={16} /> {tab.label}
        </button>
      ))}
    </div>
  );

  if (!accessToken) {
    return (
      <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background: THEME.bg, color:'#fff', fontFamily:"'Tajawal', sans-serif"}}>
        <div style={{textAlign:'center', padding:'40px', background:THEME.card, borderRadius:'24px', border:`1px solid ${THEME.border}`, maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'}}>
          <div style={{width:'64px', height:'64px', background:'rgba(56, 189, 248, 0.1)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px'}}>
             <Lock size={32} color={THEME.accent} />
          </div>
          <h2 style={{margin:'0 0 16px 0'}}>لوحة تحليلات وثيق</h2>
          <p style={{color: THEME.textSecondary, marginBottom: '24px'}}>الرجاء تسجيل الدخول لعرض البيانات</p>
          <button onClick={() => tokenClient.requestAccessToken()} 
            style={{background:THEME.accent, color: '#0f172a', padding:'12px 24px', border:'none', borderRadius:'12px', cursor:'pointer', fontWeight:'bold', fontSize:'1rem', display:'flex', alignItems:'center', gap:'8px', margin:'0 auto'}}>
            <Users size={18} /> تسجيل الدخول عبر Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{background: THEME.bg, minHeight: '100vh', padding: '24px', color: THEME.textPrimary, fontFamily: "'Tajawal', sans-serif"}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px'}}>
        <div>
          <h1 style={{margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '12px', color: '#fff'}}>
            <ShieldCheck size={32} color={THEME.accent} /> مركز القيادة (وثيق)
          </h1>
          <p style={{margin: '6px 0 0 0', color: THEME.textSecondary, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px'}}>
            {loading ? <RefreshCw size={12} className="spin" /> : <Clock size={12} />}
            {lastUpdated ? `تم التحديث: ${lastUpdated.toLocaleTimeString('ar-SA')}` : 'جاري التحميل...'}
          </p>
        </div>
        <div style={{display: 'flex', gap: '8px', alignItems: 'center', background: THEME.card, padding: '6px', borderRadius: '12px', border: `1px solid ${THEME.border}`}}>
          {timeRange === 'specific' && (
            <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} style={inputStyle} />
          )}
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} style={inputStyle}>
            <option value="24h">آخر 24 ساعة (ساعي)</option>
            <option value="specific">يوم محدد (ساعي)</option>
            <option value="7d">آخر 7 أيام (يومي)</option>
            <option value="30d">آخر 30 يوم (يومي)</option>
          </select>
          <button onClick={refreshData} style={{background:'transparent', border:'none', color:THEME.textSecondary, cursor:'pointer', padding: '0 8px'}}><RefreshCw size={18} /></button>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px'}}>
        <KpiCard title="نشط الآن (Live)" val={kpi.realtimeUsers} sub="مستخدمون حقيقيون" color={THEME.success} icon={<Activity />} pulse />
        <KpiCard title="الزوار (Active)" val={kpi.activeUsers} sub={`${kpi.newUsers} زائر جديد`} color={THEME.accent} icon={<Users />} />
        <KpiCard title="إجمالي التحميلات" val={kpi.totalDownloads} sub="Events + Installs" color={THEME.purple} icon={<Download />} />
        <KpiCard title="معدل التحويل" val={`${kpi.conversionRate}%`} sub="Download / Visit" color={THEME.warning} icon={<TrendingUp />} />
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px'}}>
        <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
          <div style={cardStyle}>
            <ChartTabs />
            <div style={{height: '320px'}}>
              {activeTab === 'visits' && <Line data={charts.history} options={commonChartOptions} />}
              {activeTab === 'downloads' && <Bar data={charts.downloads} options={commonChartOptions} />}
              {activeTab === 'geo' && (
                 <div style={{display:'flex', height:'100%', gap:'20px'}}>
                    <div style={{flex:1}}><h4 style={{textAlign:'center',margin:0, color: THEME.textSecondary}}>أعلى المدن</h4>
                      <div style={{marginTop:'20px', display:'flex', flexDirection:'column', gap:'10px'}}>
                        {lists.topCities.map((c,i) => (
                          <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'10px', background: 'rgba(255,255,255,0.03)', borderRadius:'8px'}}>
                            <span style={{display:'flex', gap:'8px', alignItems:'center'}}><div style={{width:'8px', height:'8px', borderRadius:'50%', background: THEME.accent}}></div> {c.city}</span> 
                            <b style={{color:THEME.accent}}>{c.users}</b>
                          </div>
                        ))}
                      </div>
                    </div>
                 </div>
              )}
              {activeTab === 'tech' && (
                 <div style={{display:'flex', height:'100%', gap:'20px'}}>
                    <div style={{flex:1}}><Doughnut data={charts.sources} options={doughnutOptions} /> <p style={{textAlign:'center', marginTop:'10px', color: THEME.textSecondary}}>المصادر</p></div>
                    <div style={{flex:1}}><Doughnut data={charts.devices} options={doughnutOptions} /> <p style={{textAlign:'center', marginTop:'10px', color: THEME.textSecondary}}>النظام</p></div>
                 </div>
              )}
            </div>
          </div>

          <div style={{...cardStyle, padding: '0', overflow: 'hidden'}}>
            <div style={{padding: '20px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
               <h3 style={headerStyle}><Activity size={18} className="pulse" color={THEME.success} /> سجل الأحداث المباشر</h3>
               <span style={{fontSize: '0.8rem', color: THEME.textSecondary}}>آخر 30 دقيقة</span>
            </div>
            <div style={{maxHeight: '400px', overflowY: 'auto', padding: '0'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead style={{background: 'rgba(0,0,0,0.2)', position: 'sticky', top: 0}}>
                  <tr style={{textAlign: 'right', color: THEME.textSecondary, fontSize: '0.85rem'}}>
                    <th style={{padding: '12px 20px'}}>الوقت</th>
                    <th style={{padding: '12px'}}>الحدث</th>
                    <th style={{padding: '12px'}}>المسار / الصفحة</th>
                    <th style={{padding: '12px'}}>المدينة</th>
                    <th style={{padding: '12px 20px'}}>العدد</th>
                  </tr>
                </thead>
                <tbody>
                  {lists.detailedEvents.length === 0 ? (
                    <tr><td colSpan="5" style={{padding: '20px', textAlign: 'center', color: THEME.textSecondary}}>جاري انتظار نشاط...</td></tr>
                  ) : (
                    lists.detailedEvents.map((ev, i) => (
                      <tr key={i} style={{borderBottom: `1px solid ${THEME.border}`, fontSize: '0.9rem'}}>
                        <td style={{padding: '12px 20px', color: THEME.accent, fontFamily: 'monospace'}}>{ev.time}</td>
                        <td style={{padding: '12px'}}><div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>{getEventIcon(ev.rawName)}<span>{ev.name}</span></div></td>
                        <td style={{padding: '12px', color: THEME.textSecondary, fontSize: '0.8rem', direction: 'ltr', textAlign: 'right', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{ev.path}</td>
                        <td style={{padding: '12px', color: THEME.textSecondary}}>{ev.city}</td>
                        <td style={{padding: '12px 20px'}}><span style={{background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem'}}>x{ev.count}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
          <div style={cardStyle}>
             <h3 style={{...headerStyle, color: THEME.success}}><Activity size={18} className="pulse" /> ملخص النشاط</h3>
             <p style={{fontSize: '0.8rem', color: THEME.textSecondary, marginBottom: '16px'}}>تجميعي حسب المدينة والحدث</p>
             <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
               {lists.recentActivity.length === 0 ? <div style={{textAlign:'center', color:THEME.textSecondary, padding: '20px'}}>لا يوجد نشاط حالياً</div> :
                 lists.recentActivity.map((act, i) => (
                   <div key={i} style={{background:'rgba(255,255,255,0.03)', padding:'12px', borderRadius:'8px', borderRight:`3px solid ${THEME.accent}`}}>
                      <div style={{fontWeight:'bold', fontSize:'0.85rem', marginBottom: '4px'}}>{act.action}</div>
                      <div style={{fontSize:'0.75rem', color:THEME.textSecondary, display:'flex', justifyContent:'space-between'}}>
                        <span style={{display:'flex', alignItems:'center', gap:'4px'}}><MapPin size={10}/> {act.location}</span> 
                        <span style={{background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px'}}>x{act.count}</span>
                      </div>
                   </div>
                 ))
               }
             </div>
          </div>

          <div style={cardStyle}>
            <h3 style={headerStyle}><Layout size={18} /> أهم الصفحات</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingLeft: '8px'}}>
              {lists.topPages.map((p, i) => (
                <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: `1px solid ${THEME.border}`}}>
                  <span style={{fontSize:'0.85rem', maxWidth: '70%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{p.name}</span>
                  <span style={{background: THEME.cardHover, color: THEME.textPrimary, padding:'2px 8px', borderRadius:'6px', fontSize:'0.8rem'}}>{p.views}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ title, val, sub, color, icon, pulse }) => (
  <div style={{background: THEME.card, padding: '24px', borderRadius: '16px', border: `1px solid ${THEME.border}`, position:'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
      <span style={{color: THEME.textSecondary, fontSize: '0.95rem'}}>{title}</span>
      <div style={{color: color, opacity: 0.9}} className={pulse ? 'pulse' : ''}>{React.cloneElement(icon, { size: 22 })}</div>
    </div>
    <div><div style={{fontSize: '2rem', fontWeight: 'bold', color: THEME.textPrimary, lineHeight: 1}}>{val}</div><div style={{fontSize: '0.85rem', color: THEME.textSecondary, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px'}}>{sub}</div></div>
  </div>
);

const getEventIcon = (eventName) => {
  const color = THEME.textSecondary;
  const size = 16;
  if (eventName.includes('download')) return <Download size={size} color={THEME.purple} />;
  if (eventName.includes('click')) return <MousePointer size={size} color={THEME.accent} />;
  if (eventName.includes('page_view')) return <Layout size={size} color={color} />;
  if (eventName.includes('first_open')) return <Smartphone size={size} color={THEME.success} />;
  return <AlertCircle size={size} color={color} />;
};

const cardStyle = { background: THEME.card, borderRadius: '16px', padding: '24px', border: `1px solid ${THEME.border}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' };
const headerStyle = { margin: '0 0 16px 0', fontSize: '1.1rem', display: 'flex', gap: '8px', alignItems: 'center', color: THEME.textPrimary, fontWeight: 'bold' };
const inputStyle = { background: THEME.bg, color: '#fff', border: `1px solid ${THEME.border}`, padding: '10px', borderRadius: '8px', outline: 'none', fontFamily:'inherit', cursor: 'pointer', fontSize: '0.9rem' };

const commonChartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: THEME.card, titleAlign: 'right', bodyAlign: 'right', borderColor: THEME.border, borderWidth: 1 } },
  scales: { x: { ticks: { color: THEME.textSecondary }, grid: { display: false } }, y: { ticks: { color: THEME.textSecondary }, grid: { color: 'rgba(255,255,255,0.05)' } } }
};
const doughnutOptions = { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false } } };

const styleTag = document.createElement('style');
styleTag.innerHTML = `
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: ${THEME.bg}; }
::-webkit-scrollbar-thumb { background: ${THEME.border}; borderRadius: 4px; }
::-webkit-scrollbar-thumb:hover { background: ${THEME.textSecondary}; }
.spin { animation: spin 1s linear infinite; }
.pulse { animation: pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1); }
@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
`;
document.head.appendChild(styleTag);

export default AnalyticsDashboard;