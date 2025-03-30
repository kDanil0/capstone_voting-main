import { z } from 'zod';

// Schema for vote summary data
export const VoteSummarySchema = z.array(z.object({
  position_id: z.number().or(z.string()),
  position_name: z.string(),
  candidate_id: z.number().or(z.string()),
  candidate_name: z.string()
}));

// Schema for election data
export const ElectionSchema = z.object({
  id: z.number().or(z.string()),
  election_name: z.string().optional(),
  name: z.string().optional(),
  status: z.string(),
  // Add more fields as needed
  positions: z.array(z.object({
    id: z.number().or(z.string()),
    name: z.string(),
    candidates: z.array(z.object({
      id: z.number().or(z.string()),
      name: z.string(),
      profile_photo: z.string().nullable().optional()
    })).optional()
  })).optional()
});

// Schema for the election details API response
export const ElectionResponseSchema = z.object({
  election: ElectionSchema,
  hasVoted: z.boolean().optional(),
  userVoteDetails: VoteSummarySchema.nullable().optional()
}); 