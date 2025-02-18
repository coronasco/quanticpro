'use client'
import { AuthProvider } from '@/context/AuthContext';
import useUserDataListener from '@/hooks/useUserDataListener';
import ProtectedRoute from '@/components/ProtectedRoute';
import LeftNavigation from '@/components/navigation/LeftNavigation';
import Header from '@/components/Header';

const DashboardLayout = ({ 
  children
 }: Readonly<{
  children: React.ReactNode;
}>) => {
  useUserDataListener();
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className='flex'>
          <div className='hidden lg:flex w-80 fixed top-0 left-0 bottom-0'>
            <LeftNavigation />
          </div>
          <div className='m-2 lg:ml-80 w-full lg:pl-1'>
            <Header />
            <div className='p-4 lg:p-6 rounded-md bg-slate-50 border mt-4'>
            {children}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}

export default DashboardLayout