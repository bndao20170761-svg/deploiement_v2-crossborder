import { apiGet, apiPut } from './apiService';

export function getNotificationsForDoctor(doctorId) {
  return apiGet(`/notifications/${doctorId}`);
}

export function getUnreadNotificationsForDoctor(doctorId) {
  return apiGet(`/notifications/unread/${doctorId}`);
}

export function markNotificationAsRead(notificationId) {
  return apiPut(`/notifications/read/${notificationId}`, {});
}

export function markAllNotificationsAsRead(doctorId) {
  return apiPut(`/notifications/readAll/${doctorId}`, {});
}
