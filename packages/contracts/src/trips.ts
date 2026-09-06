import { z } from 'zod'
import { budgetLevelSchema, collaboratorRoleSchema, timeSlotSchema, visibilitySchema } from './enums'

export const activitySchema = z.object({
    id: z.string(),
    order: z.number().int(),
    timeSlot: timeSlotSchema.nullable(),
    title: z.string(),
    locationName: z.string().nullable(),
    lat: z.number().nullable(),
    lng: z.number().nullable(),
    notes: z.string().nullable(),
    estimatedCost: z.number().int().nullable(),
})

export type Activity = z.infer<typeof activitySchema>

export const itineraryDaySchema = z.object({
    id: z.string(),
    dayNumber: z.number().int().min(1),
    date: z.string().nullable(),
    summary: z.string().nullable(),
    activities: z.array(activitySchema),
})
export type ItineraryDay = z.infer<typeof itineraryDaySchema>

export const tripSchema = z.object({
    id: z.string(),
    ownerId: z.string(),
    title: z.string(),
    destination: z.string(),
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
    budgetLevel: budgetLevelSchema.nullable(),
    interests: z.array(z.string()),
    visibility: visibilitySchema,
    sourceTripId: z.string().nullable(),
    days: z.array(itineraryDaySchema),
    createdAt: z.string(),
    updatedAt: z.string(),
})

export type Trip = z.infer<typeof tripSchema>

export const generatedActivitySchema = z.object({
    timeSlot: timeSlotSchema.nullable().optional(),
    title: z.string().min(1),
    locationName: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    estimatedCost: z.number().int().nonnegative().nullable().optional(),
})
export type GeneratedActivity = z.infer<typeof generatedActivitySchema>

export const generatedDaySchema = z.object({
    dayNumber: z.number().int().min(1),
    summary: z.string().nullable().optional(),
    activities: z.array(generatedActivitySchema).min(1),
})
export type GeneratedDay = z.infer<typeof generatedDaySchema>

export const generatedItinerarySchema = z.object({
    title: z.string().min(1),
    destination: z.string().min(1),
    days: z.array(generatedDaySchema).min(1),
})
export type GeneratedItinerary = z.infer<typeof generatedItinerarySchema>

export const tripSummarySchema = z.object({
    id: z.string(),
    title: z.string(),
    destination: z.string(),
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
    visibility: visibilitySchema,
    dayCount: z.number().int(),
    updatedAt: z.string(),
})
export type TripSummary = z.infer<typeof tripSummarySchema>

export const activityInputSchema = z.object({
    timeSlot: timeSlotSchema.nullable().optional(),
    title: z.string().min(1).max(200),
    locationName: z.string().max(200).nullable().optional(),
    notes: z.string().max(1000).nullable().optional(),
    estimatedCost: z.number().int().nonnegative().nullable().optional(),
})
export type ActivityInput = z.infer<typeof activityInputSchema>

export const updateActivitySchema = activityInputSchema.partial();
export type UpdateActivityRequest = z.infer<typeof updateActivitySchema>

export const dayInputSchema = z.object({
    summary: z.string().max(500).nullable().optional(),
});
export type DayInput = z.infer<typeof dayInputSchema>

export const reorderSchema = z.object({
    orderedIds: z.array(z.string().min(1)).min(1),
})
export type ReorderRequest = z.infer<typeof reorderSchema>

export const refineDayRequestSchema = z.object({
    instruction: z.string().min(1).max(500),
})
export type RefineDayRequest = z.infer<typeof refineDayRequestSchema>

export const tripCollaboratorSchema = z.object({
    userId: z.string(),
    name: z.string().nullable(),
    email: z.string().email(),
    role: collaboratorRoleSchema,
})
export type TripCollaborator = z.infer<typeof tripCollaboratorSchema>

export const inviteCollaboratorRequestSchema = z.object({
    email: z.string().email(),
    role: collaboratorRoleSchema.default('EDITOR'),
})
export type InviteCollaboratorRequest = z.infer<typeof inviteCollaboratorRequestSchema>
