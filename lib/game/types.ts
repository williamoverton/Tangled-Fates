import { z } from "zod/v4";

export const WorldEventSchema = z.object({
  when: z.iso.datetime(),
  where: z.string(),
  what: z.string(),
});

export type WorldEvent = z.infer<typeof WorldEventSchema>;
