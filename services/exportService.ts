import { DietRecord, HealthMeasurement, User } from '../types';

export interface ExportData {
  exportDate: string;
  exportTimestamp: number;
  user: {
    username: string;
    email: string;
    createdAt: number;
    profile?: User['profile'];
  };
  dietRecords: DietRecord[];
  healthMeasurements: HealthMeasurement[];
  stats: {
    totalDietRecords: number;
    totalHealthMeasurements: number;
  };
}

/**
 * Creates a comprehensive JSON export of all user data
 */
export function createFullExport(
  user: User,
  dietRecords: DietRecord[],
  healthMeasurements: HealthMeasurement[]
): ExportData {
  const now = new Date();

  return {
    exportDate: now.toISOString(),
    exportTimestamp: now.getTime(),
    user: {
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      profile: user.profile,
    },
    dietRecords: dietRecords.sort((a, b) => b.timestamp - a.timestamp), // Most recent first
    healthMeasurements: healthMeasurements.sort((a, b) => b.timestamp - a.timestamp),
    stats: {
      totalDietRecords: dietRecords.length,
      totalHealthMeasurements: healthMeasurements.length,
    },
  };
}

/**
 * Triggers a download of JSON data
 */
export function downloadJSON(data: ExportData, filename?: string): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || generateFilename(data.user.username);

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates a filename for the export
 */
function generateFilename(username: string): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const sanitizedUsername = username.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  return `keto-companion-${sanitizedUsername}-${date}.json`;
}

/**
 * Main export function - creates and downloads the full data export
 */
export function exportUserData(
  user: User,
  dietRecords: DietRecord[],
  healthMeasurements: HealthMeasurement[]
): void {
  const exportData = createFullExport(user, dietRecords, healthMeasurements);
  downloadJSON(exportData);
}
