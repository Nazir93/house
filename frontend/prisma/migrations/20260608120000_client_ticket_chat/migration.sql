-- AlterEnum
ALTER TYPE "ClientNotificationType" ADD VALUE 'TICKET_REPLY';

-- AlterTable
ALTER TABLE "ClientSupportTicket" ADD COLUMN "staffLastReadAt" TIMESTAMP(3);
