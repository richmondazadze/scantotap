import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardNavbar from '@/components/DashboardNavbar';
import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen h-screen bg-gradient-to-b from-white via-blue-50/50 to-purple-50/50 dark:from-scan-dark dark:via-scan-dark/95 dark:to-scan-dark/90 transition-colors flex overflow-x-hidden" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <DashboardSidebar />
      <div className="lg:pl-64 flex-1 flex flex-col h-full">
        <DashboardNavbar />
        <main className="flex-1 flex flex-col h-full px-4 sm:px-6 md:px-8 pt-20 pb-32 lg:pb-10 overflow-auto overflow-x-hidden">
          <div className="w-full flex-1 flex flex-col h-full overflow-x-hidden">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
} 