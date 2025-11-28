import React from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#064e3b',
            color: 'white',
            textAlign: 'center',
            fontFamily: 'Tajawal, sans-serif'
        }}>
          <FaExclamationTriangle style={{ fontSize: '3rem', color: '#fbbf24', marginBottom: '1rem' }} />
          <h2>عذراً، حدث خطأ غير متوقع</h2>
          <p>حاول إعادة تشغيل التطبيق</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#fbbf24',
                color: '#064e3b',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}
          >
            <FaRedo /> إعادة تحميل
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;