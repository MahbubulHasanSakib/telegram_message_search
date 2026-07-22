import { z } from 'zod';

export const RawTextEntitySchema = z.union([
  z.string(),
  z.object({
    type: z.string().optional(),
    text: z.string(),
  }),
]);

export type RawTextEntity = z.infer<typeof RawTextEntitySchema>;

export const RawTgMessageSchema = z.object({
  id: z.union([z.number(), z.string()]),
  type: z.string().optional(),
  date: z.string().optional(),
  date_unixtime: z.union([z.number(), z.string()]).optional(),
  from: z.string().nullish(),
  from_id: z.union([z.string(), z.number()]).nullish(),
  actor: z.string().nullish(),
  actor_id: z.union([z.string(), z.number()]).nullish(),
  text: z.union([z.string(), z.array(RawTextEntitySchema)]).optional(),
  reply_to_message_id: z.union([z.number(), z.string()]).optional(),
});

export type RawTgMessage = z.infer<typeof RawTgMessageSchema>;

export const TgExportJsonSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  id: z.union([z.number(), z.string()]).optional(),
  messages: z.array(RawTgMessageSchema).default([]),
});

export type TgExportJson = z.infer<typeof TgExportJsonSchema>;
