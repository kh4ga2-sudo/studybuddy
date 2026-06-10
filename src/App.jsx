import { useState } from 'react';
import { useApp } from './context/AppContext';
import SVGDefs from './components/SVGDefs';
import Toast from './components/Toast';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import CoursesPage from './pages/CoursesPage';
import MajorsPage from './pages/MajorsPage';
import MajorDetailPage from './pages/MajorDetailPage';
import CourseDetailPage from './pages/CourseDetailPage';
import ProfilePage from './pages/ProfilePage';
import MeetingsPage from './pages/MeetingsPage';
import AIPage from './pages/AIPage';
import CalendarPage from './pages/CalendarPage';
import AdminPage from './pages/AdminPage';
import CatalogModal from './components/CatalogModal';

import LandingPage from './pages/LandingPage';

export default function App() {
  const { state, setView } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);

  if (state.view === 'landing') {
    return <LandingPage onEnter={() => setView('auth')} />;
  }

  if (state.view === 'auth') {
    return (
      <>
        <SVGDefs />
        <AuthPage />
        <Toast />
      </>
    );
  }

  const renderPage = () => {
    switch (state.view) {
      case 'dashboard': return <DashboardPage onAddCourse={() => setCatalogOpen(true)} />;
      case 'courses': return <CoursesPage onAddCourse={() => setCatalogOpen(true)} />;
      case 'majors': return <MajorsPage />;
      case 'major-detail': return <MajorDetailPage />;
      case 'course-detail': return <CourseDetailPage />;
      case 'profile': return <ProfilePage />;
      case 'meetings': return <MeetingsPage />;
      case 'ai': return <AIPage />;
      case 'calendar': return <CalendarPage />;
      case 'admin': return <AdminPage />;
      default: return <DashboardPage onAddCourse={() => setCatalogOpen(true)} />;
    }
  };

  return (
    <>
      <SVGDefs />
      <div className="app">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="app__main">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="page" id={`page-${state.view}`}>
            {renderPage()}
          </main>
        </div>
      </div>
      <CatalogModal open={catalogOpen} onClose={() => setCatalogOpen(false)} />
      <Toast />
    </>
  );
}
