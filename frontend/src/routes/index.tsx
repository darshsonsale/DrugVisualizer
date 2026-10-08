import { createBrowserRouter } from 'react-router-dom';
import AppShell from '../layouts/AppShell';
import HomePage from '../pages/HomePage';
import ExplorerPage from '../pages/ExplorerPage';
import LearnPage from '../pages/LearnPage';
import QuizPage from '../pages/QuizPage';
import ProgressPage from '../pages/ProgressPage';
import NotFoundPage from '../pages/NotFoundPage';

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
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;
