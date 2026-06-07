/**
 * @fileoverview Priority score calculator for TVK Constituency Complaint Portal.
 *
 * Formula: priority_score = support_count + (similar_complaints * 2) + age_days
 *
 * Priority Levels:
 *   - low:      score < 15
 *   - medium:   15 <= score < 30
 *   - high:     30 <= score < 50
 *   - critical: score >= 50
 *
 * The database trigger (trg_recalculate_priority) handles this server-side.
 * This module provides client-side utilities for display and estimation.
 */

/** Priority level type — matches the CHECK constraint in the DB */
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

/** Input parameters for priority calculation */
export interface PriorityInput {
  /** Number of "I face this too" supports */
  supportCount: number;
  /** Number of similar complaints (same ward + category, last 30 days) */
  similarComplaints: number;
  /** Age of the complaint in days */
  ageDays: number;
}

/** Priority calculation result */
export interface PriorityResult {
  /** Numeric priority score */
  score: number;
  /** Priority level string */
  level: PriorityLevel;
}

/** Priority level thresholds */
export const PRIORITY_THRESHOLDS = {
  low: { min: 0, max: 14, label: 'Low', labelTa: 'குறைவு' },
  medium: { min: 15, max: 29, label: 'Medium', labelTa: 'நடுத்தரம்' },
  high: { min: 30, max: 49, label: 'High', labelTa: 'அதிகம்' },
  critical: { min: 50, max: Infinity, label: 'Critical', labelTa: 'அவசரம்' },
} as const;

/**
 * Calculates the priority score for a complaint.
 *
 * @param input - The priority calculation inputs
 * @returns The calculated score and priority level
 *
 * @example
 * calculatePriority({ supportCount: 10, similarComplaints: 5, ageDays: 15 })
 * // => { score: 35, level: 'high' }
 *
 * @example
 * calculatePriority({ supportCount: 30, similarComplaints: 10, ageDays: 20 })
 * // => { score: 70, level: 'critical' }
 */
export function calculatePriority(input: PriorityInput): PriorityResult {
  const { supportCount, similarComplaints, ageDays } = input;

  // Ensure non-negative values
  const safeSupportCount = Math.max(0, supportCount);
  const safeSimilar = Math.max(0, similarComplaints);
  const safeAge = Math.max(0, ageDays);

  const score = safeSupportCount + (safeSimilar * 2) + safeAge;
  const level = getPriorityLevel(score);

  return { score, level };
}

/**
 * Determines the priority level based on a numeric score.
 *
 * @param score - The priority score
 * @returns The priority level string
 *
 * @example
 * getPriorityLevel(10)  // => 'low'
 * getPriorityLevel(25)  // => 'medium'
 * getPriorityLevel(40)  // => 'high'
 * getPriorityLevel(60)  // => 'critical'
 */
export function getPriorityLevel(score: number): PriorityLevel {
  if (score < 15) return 'low';
  if (score < 30) return 'medium';
  if (score < 50) return 'high';
  return 'critical';
}

/**
 * Calculates the age of a complaint in days from its creation date.
 *
 * @param createdAt - The complaint creation date (ISO string or Date)
 * @returns Number of full days since creation
 */
export function getComplaintAgeDays(createdAt: string | Date): number {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Estimates when a complaint's priority will escalate to the next level.
 *
 * @param currentScore - The current priority score
 * @returns Days until next priority level escalation, or null if already critical
 */
export function daysUntilEscalation(currentScore: number): number | null {
  if (currentScore >= 50) return null; // Already critical
  if (currentScore >= 30) return 50 - currentScore;
  if (currentScore >= 15) return 30 - currentScore;
  return 15 - currentScore;
}
