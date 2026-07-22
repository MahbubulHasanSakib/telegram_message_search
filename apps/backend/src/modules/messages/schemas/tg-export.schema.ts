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
  // Telegram Desktop format fields
  from: z.string().nullish(),
  from_id: z.union([z.string(), z.number()]).nullish(),
  actor: z.string().nullish(),
  actor_id: z.union([z.string(), z.number()]).nullish(),
  // Telethon CLI export format field
  sender_id: z.union([z.string(), z.number()]).nullish(),
  text: z.union([z.string(), z.array(RawTextEntitySchema), z.null()]).optional(),
  reply_to_message_id: z.union([z.number(), z.string()]).optional(),
});

export type RawTgMessage = z.infer<typeof RawTgMessageSchema>;

// Format 1: Standard Telegram Desktop export (object with `messages` key)
export const TgExportJsonSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  id: z.union([z.number(), z.string()]).optional(),
  messages: z.array(RawTgMessageSchema).default([]),
});

// Format 2: Telethon CLI export (plain root array)
export const TelethonArraySchema = z.array(RawTgMessageSchema);

export type TgExportJson = z.infer<typeof TgExportJsonSchema>;
