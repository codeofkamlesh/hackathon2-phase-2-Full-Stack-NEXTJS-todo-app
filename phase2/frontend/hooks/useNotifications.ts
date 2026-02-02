import { useEffect, useRef } from 'react';

interface UseNotificationsResult {
  requestPermission: () => Promise<void>;
  checkForUpcomingTasks: (tasks: any[]) => void;
}

export const useNotifications = (): UseNotificationsResult => {
  const notificationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (notificationInterval.current) {
        clearInterval(notificationInterval.current);
      }
    };
  }, []);

  const requestPermission = async (): Promise<void> => {
    if ('Notification' in window) {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  };

  const checkForUpcomingTasks = (tasks: any[]): void => {
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
            if (Notification.permission === 'granted') {
              new Notification(`Task Due Soon: ${task.title}`, {
                body: `Your task "${task.title}" is due within the next hour.`,
                icon: '/favicon.ico',
                tag: `due-soon-${task.id}`
              });
            }
          }
          // Check if due in the next day
          else if (dueDate > now && dueDate <= oneDayLater) {
            if (Notification.permission === 'granted') {
              new Notification(`Upcoming Task: ${task.title}`, {
                body: `Your task "${task.title}" is due tomorrow.`,
                icon: '/favicon.ico',
                tag: `upcoming-${task.id}`
              });
            }
          }
        }
      });
    }, 60000); // Check every minute
  };

  return {
    requestPermission,
    checkForUpcomingTasks
  };
};