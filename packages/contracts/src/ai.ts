import { z } from 'zod'
import { budgetLevelSchema, timeSlotSchema } from './enums'

export const itineraryRequestSchema = z.object({
    destination: z.string().min(2).max(120),
    durationDays: z.number().int().min(1).max(30),
    interests: z.array(z.string().min(1)).max(20).default([]),
    budgetLevel: budgetLevelSchema.optional(),
    notes: z.string().max(500).optional(),
})
export type ItineraryRequest = z.infer<typeof itineraryRequestSchema>

export const refineRequestSchema = z.object({
    destination: z.string().min(1),
    dayNumber: z.number().int().min(1),
    instruction: z.string().min(1).max(500),
    currentActivities: z.array(z.object({
        title: z.string(),
        timeSlot: timeSlotSchema.nullable().optional(),
    })).default([]),
})
export type RefineRequest = z.infer<typeof refineRequestSchema>

export const groundedQArequestSchema = z.object({
    question: z.string().min(1).max(1000),
    scope: z.string().optional()
})
export type GroundedQARequest = z.infer<typeof groundedQArequestSchema>

export const groundedSourceSchema = z.object({
    sourceType: z.string(),
    sourceId: z.string(),
    snippet: z.string()
})
export type GroundedSource = z.infer<typeof groundedSourceSchema>

export const groundedAnswerSchema = z.object({
    answer: z.string(),
    grounded: z.boolean(),
    sources: z.array(groundedSourceSchema),
})
export type GroundedAnswer = z.infer<typeof groundedAnswerSchema>