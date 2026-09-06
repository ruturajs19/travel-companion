import { z } from 'zod';

// Trip budget level
export const budgetLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export type BudgetLevel = z.infer<typeof budgetLevelSchema>;

//Content Visibility
export const visibilitySchema = z.enum(['PUBLIC', 'PRIVATE', 'UNLISTED']);
export type Visibility = z.infer<typeof visibilitySchema>

//Time-of-day slot for activity
export const timeSlotSchema = z.enum(['MORNING', 'AFTERNOON', 'EVENING']);
export type TimeSlot = z.infer<typeof timeSlotSchema>

//Collaborator role on a trip
export const collaboratorRoleSchema = z.enum(['EDITOR', 'VIEWER']);
export type CollaboratorRole = z.infer<typeof collaboratorRoleSchema>

//Blog post publication status.
export const postStatusSchema = z.enum(['DRAFT', 'PUBLISHED']);
export type PostStatus = z.infer<typeof postStatusSchema>