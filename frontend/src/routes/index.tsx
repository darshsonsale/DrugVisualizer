import { createBrowserRouter } from 'react-router-dom';
import AppShell from '../layouts/AppShell';
import HomePage from '../pages/HomePage';
import ExplorerPage from '../pages/ExplorerPage';
import LearnPage from '../pages/LearnPage';
import QuizPage from '../pages/QuizPage';
import ProgressPage from '../pages/ProgressPage';
import NotFoundPage from '../pages/NotFoundPage';
import AdminContentPage from '../pages/admin/AdminContentPage';
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import LoginPage from '../pages/auth/LoginPage';
import { AdminRouteGuard } from '../components/admin/AdminRouteGuard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'explore',
        element: <ExplorerPage />,
      },
      {
        path: 'learn',
        element: <LearnPage />,
      },
      {
        path: 'quiz',
        element: <QuizPage />,
      },
      {
        path: 'progress',
        element: <ProgressPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'admin/login',
        element: <AdminLoginPage />,
      },
      {
        path: 'admin/content',
        element: (
          <AdminRouteGuard>
            <AdminContentPage />
          </AdminRouteGuard>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;
