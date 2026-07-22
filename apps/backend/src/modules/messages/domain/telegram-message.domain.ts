export interface ParsedTelegramMessage {
  telegramId: string;
  date: Date;
  sender: string;
  text: string;
  replyToMessageId?: string;
}

export interface ParseExportResultDto {
  fileId: string;
  channelName?: string;
  totalParsedMessages: number;
  messages: ParsedTelegramMessage[];
}
