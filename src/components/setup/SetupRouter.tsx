import { Navigate, Route, Routes } from 'react-router-dom';
import { useSetupCheck } from '../../hooks/useSetupCheck';
import SetupWizard from './SetupWizard';

export default function SetupRouter() {
  const { loading, needsSetup } = useSetupCheck();

  if (loading) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 theme-border"></div>
      </div>
    );
  }

  if (!needsSetup) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <Routes>
      <Route path="/*" element={<SetupWizard />} />
    </Routes>
  );
}
