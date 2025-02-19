'use client'
import { AuthProvider } from '@/context/AuthContext';
import useUserDataListener from '@/hooks/useUserDataListener';
import ProtectedRoute from '@/components/ProtectedRoute';
import LeftNavigation from '@/components/navigation/LeftNavigation';
import Header from '@/components/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useUserDataListener();
  
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="flex gap-3">
            {/* Left Navigation */}
            <div className="hidden lg:block w-[310px] fixed top-0 left-0 bottom-0">
              <LeftNavigation />
            </div>

            {/* Main Content */}
            <div className="flex-1 lg:pl-[310px]">
              <div className="sticky top-0 z-50">
                <Header />
              </div>
              <main className="p-4 lg:p-6">
                <div className="">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}