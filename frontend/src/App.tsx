import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './component/layout/MainLayout';
import {
  LandingPage,
  LoginPage,
  SignUpPage,
  ForgotPasswordPage,
  ContactPage,
  DashboardPage,
  SettingsPage,
  OpinionForgePage,
  SkillBridgePage,
  CredentialsPage,
  PublicVerifyPage,
  CalendarPage,
  AlertsPage,
  StrategyNavigatorPage,
  CollaborationPage,
  CompetitorAnalysisPage,
  AnalyticsPage,
  NicheFinderPage
} from './Pages';

import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/opinion" element={<OpinionForgePage />} />
            <Route path="/skills" element={<SkillBridgePage />} />
            <Route path="/credentials" element={<CredentialsPage />} />
            <Route path="/verify/:id" element={<PublicVerifyPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/strategy" element={<StrategyNavigatorPage />} />
            <Route path="/collab" element={<CollaborationPage />} />
            <Route path="/competitors" element={<CompetitorAnalysisPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/niche-finder" element={<NicheFinderPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;