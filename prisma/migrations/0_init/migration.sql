-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('tentative', 'lost', 'confirmed');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin', 'salesManager');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "roles" "Role"[] DEFAULT ARRAY['user']::"Role"[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "LeadForm" (
    "id" TEXT NOT NULL,
    "createDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateDate" TIMESTAMP(3) NOT NULL,
    "dateReceived" TIMESTAMP(3) NOT NULL,
    "lastDateSent" TIMESTAMP(3),
    "status" "EventStatus" NOT NULL DEFAULT 'tentative',
    "isCorporate" BOOLEAN NOT NULL DEFAULT false,
    "isLiveIn" BOOLEAN NOT NULL DEFAULT false,
    "onSiteDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "eventLengthInDays" INTEGER NOT NULL,
    "eventTypeOther" TEXT,
    "roomTotal" INTEGER,
    "roomType" TEXT,
    "roomArrivalDate" TIMESTAMP(3),
    "roomDepartureDate" TIMESTAMP(3),
    "banquetsBudget" INTEGER,
    "roomsBudget" INTEGER,
    "otherHotelConsiderations" TEXT,
    "venueDecisionDate" TIMESTAMP(3),
    "salesAccountManagerId" TEXT NOT NULL,
    "eventTypeId" TEXT,
    "contactId" TEXT NOT NULL,
    "leadTypeId" TEXT NOT NULL,
    "rateTypeId" TEXT,
    "companyId" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "LeadForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "LeadType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "activity" TEXT NOT NULL,

    CONSTRAINT "EventType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventDetails" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "pax" INTEGER,
    "remarks" TEXT,
    "rate" INTEGER,
    "leadFormId" TEXT,
    "roomSetupId" TEXT,
    "functionRoomId" TEXT,

    CONSTRAINT "EventDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FunctionRoom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "FunctionRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomSetup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "RoomSetup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealReq" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MealReq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "RateType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inclusion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "preselect" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Inclusion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadFormActivity" (
    "id" TEXT NOT NULL,
    "updateDate" TIMESTAMP(3) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "clientFeedback" TEXT,
    "nextTraceDate" TIMESTAMP(3),
    "updatedById" TEXT NOT NULL,
    "leadFormId" TEXT,

    CONSTRAINT "LeadFormActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "province" TEXT,
    "postalCode" TEXT,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "title" TEXT,
    "lastName" TEXT,
    "phoneNumber" TEXT,
    "mobileNumber" TEXT,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EventDetailsToMealReq" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_InclusionToLeadForm" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "LeadType_name_key" ON "LeadType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EventType_activity_key" ON "EventType"("activity");

-- CreateIndex
CREATE UNIQUE INDEX "FunctionRoom_name_key" ON "FunctionRoom"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RoomSetup_name_key" ON "RoomSetup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MealReq_name_key" ON "MealReq"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RateType_name_key" ON "RateType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Inclusion_name_key" ON "Inclusion"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_email_key" ON "Contact"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_EventDetailsToMealReq_AB_unique" ON "_EventDetailsToMealReq"("A", "B");

-- CreateIndex
CREATE INDEX "_EventDetailsToMealReq_B_index" ON "_EventDetailsToMealReq"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_InclusionToLeadForm_AB_unique" ON "_InclusionToLeadForm"("A", "B");

-- CreateIndex
CREATE INDEX "_InclusionToLeadForm_B_index" ON "_InclusionToLeadForm"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadForm" ADD CONSTRAINT "LeadForm_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadForm" ADD CONSTRAINT "LeadForm_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadForm" ADD CONSTRAINT "LeadForm_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadForm" ADD CONSTRAINT "LeadForm_leadTypeId_fkey" FOREIGN KEY ("leadTypeId") REFERENCES "LeadType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadForm" ADD CONSTRAINT "LeadForm_rateTypeId_fkey" FOREIGN KEY ("rateTypeId") REFERENCES "RateType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadForm" ADD CONSTRAINT "LeadForm_salesAccountManagerId_fkey" FOREIGN KEY ("salesAccountManagerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadForm" ADD CONSTRAINT "LeadForm_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDetails" ADD CONSTRAINT "EventDetails_functionRoomId_fkey" FOREIGN KEY ("functionRoomId") REFERENCES "FunctionRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDetails" ADD CONSTRAINT "EventDetails_leadFormId_fkey" FOREIGN KEY ("leadFormId") REFERENCES "LeadForm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDetails" ADD CONSTRAINT "EventDetails_roomSetupId_fkey" FOREIGN KEY ("roomSetupId") REFERENCES "RoomSetup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadFormActivity" ADD CONSTRAINT "LeadFormActivity_leadFormId_fkey" FOREIGN KEY ("leadFormId") REFERENCES "LeadForm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadFormActivity" ADD CONSTRAINT "LeadFormActivity_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventDetailsToMealReq" ADD CONSTRAINT "_EventDetailsToMealReq_A_fkey" FOREIGN KEY ("A") REFERENCES "EventDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventDetailsToMealReq" ADD CONSTRAINT "_EventDetailsToMealReq_B_fkey" FOREIGN KEY ("B") REFERENCES "MealReq"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InclusionToLeadForm" ADD CONSTRAINT "_InclusionToLeadForm_A_fkey" FOREIGN KEY ("A") REFERENCES "Inclusion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InclusionToLeadForm" ADD CONSTRAINT "_InclusionToLeadForm_B_fkey" FOREIGN KEY ("B") REFERENCES "LeadForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "User" DROP COLUMN "role";
