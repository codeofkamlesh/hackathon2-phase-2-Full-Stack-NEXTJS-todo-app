import { useEffect, useRef } from 'react';
import { Task } from '../../../lib/types';

interface UseNotificationsResult {
  requestPermission: () => Promise<NotificationPermission>;
  showNotification: (title: string, options?: NotificationOptions) => void;
  checkForUpcomingTasks: (tasks: Task[]) => void;
}

const useNotifications = (): UseNotificationsResult => {
  const notificationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (notificationInterval.current) {
        clearInterval(notificationInterval.current);
      }
    };
  }, []);

  const requestPermission = (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return Promise.resolve('denied' as NotificationPermission);
    }

    return Notification.requestPermission();
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, options);
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  };

  const checkForUpcomingTasks = (tasks: Task[]) => {
    if (notificationInterval.current) {
      clearInterval(notificationInterval.current);
    }

    // Check for upcoming tasks every minute
    notificationInterval.current = setInterval(() => {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
      const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day later

      tasks.forEach(task => {
        if (task.due_date && !task.completed && task.recurring !== true) { // Only notify for non-recurring tasks
          const dueDate = new Date(task.due_date);

          // Check if due in the next hour
          if (dueDate > now && dueDate <= oneHourLater) {
            showNotification(
              `Task Due Soon: ${task.title}`,
              {
                body: `Your task "${task.title}" is due within the next hour.`,
                icon: '/favicon.ico',
                tag: `due-soon-${task.id}`
              }
            );
          }
          // Check if due in the next day
          else if (dueDate > now && dueDate <= oneDayLater) {
            showNotification(
              `Upcoming Task: ${task.title}`,
              {
                body: `Your task "${task.title}" is due tomorrow.`,
                icon: '/favicon.ico',
                tag: `upcoming-${task.id}`
              }
            );
          }
        }
      });
    }, 60000); // Check every minute
  };

  return {
    requestPermission,
    showNotification,
    checkForUpcomingTasks
  };
};

export default useNotifications;