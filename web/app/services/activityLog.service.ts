export interface Activity {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}

export function logActivity(userId: string, action: string, details: string): void {
  try {
    const existingActivities = getActivities(userId);
    const newActivity: Activity = {
      id: generateId(),
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
    };

    const updatedActivities = [newActivity, ...existingActivities].slice(0, 20); // Keep only the 20 most recent activities
    localStorage.setItem(`user_activities_${userId}`, JSON.stringify(updatedActivities));
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

export function getActivities(userId: string): Activity[] {
  try {
    const activitiesJson = localStorage.getItem(`user_activities_${userId}`);
    if (!activitiesJson) return [];
    return JSON.parse(activitiesJson) as Activity[];
  } catch (error) {
    console.error("Failed to get activities:", error);
    return [];
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
