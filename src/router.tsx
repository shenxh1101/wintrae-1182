import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { EventDetailLayout } from './components/layout/EventDetailLayout';
import { EventList } from './pages/events/EventList';
import { EventForm } from './pages/events/EventForm';
import { EventOverview } from './pages/events/detail/EventOverview';
import { Registrations } from './pages/events/detail/Registrations';
import { CheckIn } from './pages/events/detail/CheckIn';
import { Notifications } from './pages/events/detail/Notifications';
import { Review } from './pages/events/detail/Review';
import { Blacklist } from './pages/Blacklist';
import { TagManagement } from './pages/Tags';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/events" replace /> },
      { path: 'events', element: <EventList /> },
      { path: 'events/new', element: <EventForm /> },
      { path: 'events/:id/edit', element: <EventForm /> },
      {
        path: 'events/:id',
        element: <EventDetailLayout />,
        children: [
          { index: true, element: <Navigate to="overview" replace /> },
          { path: 'overview', element: <EventOverview /> },
          { path: 'registrations', element: <Registrations /> },
          { path: 'checkin', element: <CheckIn /> },
          { path: 'notifications', element: <Notifications /> },
          { path: 'review', element: <Review /> },
        ],
      },
      { path: 'blacklist', element: <Blacklist /> },
      { path: 'tags', element: <TagManagement /> },
    ],
  },
]);
