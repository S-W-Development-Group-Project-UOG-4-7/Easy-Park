
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/edge.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}





/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UsersScalarFieldEnum = {
  id: 'id',
  fullName: 'fullName',
  email: 'email',
  phone: 'phone',
  nic: 'nic',
  residentialAddress: 'residentialAddress',
  passwordHash: 'passwordHash',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RolesScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.User_rolesScalarFieldEnum = {
  userId: 'userId',
  roleId: 'roleId'
};

exports.Prisma.PropertiesScalarFieldEnum = {
  id: 'id',
  ownerId: 'ownerId',
  propertyName: 'propertyName',
  address: 'address',
  pricePerHour: 'pricePerHour',
  pricePerDay: 'pricePerDay',
  currency: 'currency',
  status: 'status',
  totalSlots: 'totalSlots',
  totalNormalSlots: 'totalNormalSlots',
  totalEvSlots: 'totalEvSlots',
  totalCarWashSlots: 'totalCarWashSlots',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.Parking_slotsScalarFieldEnum = {
  id: 'id',
  propertyId: 'propertyId',
  slotNumber: 'slotNumber',
  slotType: 'slotType',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.VehiclesScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  vehicleNumber: 'vehicleNumber',
  type: 'type',
  model: 'model',
  color: 'color',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BookingsScalarFieldEnum = {
  id: 'id',
  customerId: 'customerId',
  propertyId: 'propertyId',
  vehicleId: 'vehicleId',
  startTime: 'startTime',
  endTime: 'endTime',
  status: 'status',
  parkingType: 'parkingType',
  bookingType: 'bookingType',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.Booking_slotsScalarFieldEnum = {
  id: 'id',
  bookingId: 'bookingId',
  slotId: 'slotId',
  createdAt: 'createdAt'
};

exports.Prisma.Booking_status_historyScalarFieldEnum = {
  id: 'id',
  bookingId: 'bookingId',
  oldStatus: 'oldStatus',
  newStatus: 'newStatus',
  changedBy: 'changedBy',
  note: 'note',
  changedAt: 'changedAt'
};

exports.Prisma.Payment_summaryScalarFieldEnum = {
  bookingId: 'bookingId',
  totalAmount: 'totalAmount',
  onlinePaid: 'onlinePaid',
  cashPaid: 'cashPaid',
  balanceDue: 'balanceDue',
  currency: 'currency',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentsScalarFieldEnum = {
  id: 'id',
  bookingId: 'bookingId',
  payerId: 'payerId',
  amount: 'amount',
  currency: 'currency',
  method: 'method',
  paymentStatus: 'paymentStatus',
  gatewayStatus: 'gatewayStatus',
  gatewayProvider: 'gatewayProvider',
  transactionId: 'transactionId',
  cardLast4: 'cardLast4',
  cardBrand: 'cardBrand',
  cardExpMonth: 'cardExpMonth',
  cardExpYear: 'cardExpYear',
  paidAt: 'paidAt',
  createdBy: 'createdBy',
  createdAt: 'createdAt'
};

exports.Prisma.Wash_jobsScalarFieldEnum = {
  id: 'id',
  bookingSlotId: 'bookingSlotId',
  washerId: 'washerId',
  status: 'status',
  acceptedAt: 'acceptedAt',
  completedAt: 'completedAt',
  note: 'note',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.Counter_transactionsScalarFieldEnum = {
  id: 'id',
  counterUserId: 'counterUserId',
  bookingId: 'bookingId',
  action: 'action',
  note: 'note',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationsScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  message: 'message',
  isRead: 'isRead',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.RoleName = exports.$Enums.RoleName = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
  LANDOWNER: 'LANDOWNER',
  WASHER: 'WASHER',
  COUNTER: 'COUNTER'
};

exports.PropertyStatus = exports.$Enums.PropertyStatus = {
  ACTIVATED: 'ACTIVATED',
  NOT_ACTIVATED: 'NOT_ACTIVATED'
};

exports.SlotType = exports.$Enums.SlotType = {
  NORMAL: 'NORMAL',
  EV: 'EV',
  CAR_WASH: 'CAR_WASH'
};

exports.BookingStatus = exports.$Enums.BookingStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED'
};

exports.PaymentMethod = exports.$Enums.PaymentMethod = {
  CARD: 'CARD',
  CASH: 'CASH'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

exports.GatewayStatus = exports.$Enums.GatewayStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

exports.WashStatus = exports.$Enums.WashStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  COMPLETED: 'COMPLETED'
};

exports.Prisma.ModelName = {
  users: 'users',
  roles: 'roles',
  user_roles: 'user_roles',
  properties: 'properties',
  parking_slots: 'parking_slots',
  vehicles: 'vehicles',
  bookings: 'bookings',
  booking_slots: 'booking_slots',
  booking_status_history: 'booking_status_history',
  payment_summary: 'payment_summary',
  payments: 'payments',
  wash_jobs: 'wash_jobs',
  counter_transactions: 'counter_transactions',
  notifications: 'notifications'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "c:\\Users\\Dulnith\\Desktop\\new database\\Easy-Park\\generated\\prisma",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "windows",
        "native": true
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "c:\\Users\\Dulnith\\Desktop\\new database\\Easy-Park\\prisma\\schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../.env"
  },
  "relativePath": "../../prisma",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "generator client {\n  provider = \"prisma-client-js\"\n  output   = \"../generated/prisma\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\nmodel users {\n  id                  String                   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  fullName            String                   @map(\"full_name\")\n  email               String                   @unique\n  phone               String?                  @unique\n  nic                 String?                  @unique\n  residentialAddress  String?                  @map(\"residential_address\")\n  passwordHash        String                   @map(\"password_hash\")\n  isActive            Boolean                  @default(true) @map(\"is_active\")\n  createdAt           DateTime                 @default(now()) @map(\"created_at\") @db.Timestamptz(6)\n  updatedAt           DateTime                 @default(now()) @updatedAt @map(\"updated_at\") @db.Timestamptz(6)\n  customerBookings    bookings[]               @relation(\"BookingCustomer\")\n  createdBookings     bookings[]               @relation(\"BookingCreator\")\n  bookingStatusEvents booking_status_history[] @relation(\"BookingStatusChangedBy\")\n  counterTransactions counter_transactions[]\n  notifications       notifications[]\n  ownedProperties     properties[]             @relation(\"PropertyOwner\")\n  createdPayments     payments[]               @relation(\"PaymentCreatedBy\")\n  payments            payments[]               @relation(\"PaymentPayer\")\n  roles               user_roles[]\n  vehicles            vehicles[]\n  washJobs            wash_jobs[]              @relation(\"WashJobWasher\")\n\n  @@index([email])\n  @@map(\"users\")\n}\n\nmodel roles {\n  id    Int          @id @default(autoincrement()) @db.SmallInt\n  name  RoleName     @unique\n  users user_roles[]\n\n  @@map(\"roles\")\n}\n\nmodel user_roles {\n  userId String @map(\"user_id\") @db.Uuid\n  roleId Int    @map(\"role_id\") @db.SmallInt\n  role   roles  @relation(fields: [roleId], references: [id], onDelete: Cascade)\n  user   users  @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@id([userId, roleId])\n  @@index([roleId])\n  @@map(\"user_roles\")\n}\n\nmodel properties {\n  id                String          @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  ownerId           String          @map(\"owner_id\") @db.Uuid\n  propertyName      String          @map(\"property_name\")\n  address           String\n  pricePerHour      Decimal         @default(0) @map(\"price_per_hour\") @db.Decimal(10, 2)\n  pricePerDay       Decimal         @default(0) @map(\"price_per_day\") @db.Decimal(10, 2)\n  currency          String          @default(\"LKR\")\n  status            PropertyStatus  @default(NOT_ACTIVATED)\n  totalSlots        Int             @default(0) @map(\"total_slots\")\n  totalNormalSlots  Int             @default(0) @map(\"total_normal_slots\")\n  totalEvSlots      Int             @default(0) @map(\"total_ev_slots\")\n  totalCarWashSlots Int             @default(0) @map(\"total_car_wash_slots\")\n  createdAt         DateTime        @default(now()) @map(\"created_at\") @db.Timestamptz(6)\n  updatedAt         DateTime        @default(now()) @updatedAt @map(\"updated_at\") @db.Timestamptz(6)\n  bookings          bookings[]\n  owner             users           @relation(\"PropertyOwner\", fields: [ownerId], references: [id], onDelete: Restrict)\n  parkingSlots      parking_slots[]\n\n  @@index([ownerId])\n  @@index([status])\n  @@map(\"properties\")\n}\n\nmodel parking_slots {\n  id           String          @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  propertyId   String          @map(\"property_id\") @db.Uuid\n  slotNumber   String          @map(\"slot_number\")\n  slotType     SlotType        @map(\"slot_type\")\n  isActive     Boolean         @default(true) @map(\"is_active\")\n  createdAt    DateTime        @default(now()) @map(\"created_at\") @db.Timestamptz(6)\n  bookingSlots booking_slots[]\n  property     properties      @relation(fields: [propertyId], references: [id], onDelete: Cascade)\n\n  @@unique([propertyId, slotNumber])\n  @@index([propertyId])\n  @@index([slotType])\n  @@map(\"parking_slots\")\n}\n\nmodel vehicles {\n  id            String     @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  userId        String     @map(\"user_id\") @db.Uuid\n  vehicleNumber String     @unique @map(\"vehicle_number\")\n  type          String?\n  model         String?\n  color         String?\n  createdAt     DateTime   @default(now()) @map(\"created_at\") @db.Timestamptz(6)\n  updatedAt     DateTime   @default(now()) @updatedAt @map(\"updated_at\") @db.Timestamptz(6)\n  bookings      bookings[]\n  user          users      @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n  @@map(\"vehicles\")\n}\n\nmodel bookings {\n  id             String                   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  customerId     String                   @map(\"customer_id\") @db.Uuid\n  propertyId     String                   @map(\"property_id\") @db.Uuid\n  vehicleId      String?                  @map(\"vehicle_id\") @db.Uuid\n  startTime      DateTime                 @map(\"start_time\") @db.Timestamptz(6)\n  endTime        DateTime                 @map(\"end_time\") @db.Timestamptz(6)\n  status         BookingStatus            @default(PENDING)\n  parkingType    SlotType                 @default(NORMAL) @map(\"parking_type\")\n  bookingType    String                   @default(\"NORMAL\") @map(\"booking_type\")\n  createdBy      String?                  @map(\"created_by\") @db.Uuid\n  createdAt      DateTime                 @default(now()) @map(\"created_at\") @db.Timestamptz(6)\n  updatedAt      DateTime                 @default(now()) @updatedAt @map(\"updated_at\") @db.Timestamptz(6)\n  bookingSlots   booking_slots[]\n  customer       users                    @relation(\"BookingCustomer\", fields: [customerId], references: [id], onDelete: Restrict)\n  creator        users?                   @relation(\"BookingCreator\", fields: [createdBy], references: [id], onDelete: SetNull)\n  counterLogs    counter_transactions[]\n  paymentSummary payment_summary?\n  payments       payments[]\n  property       properties               @relation(fields: [propertyId], references: [id], onDelete: Restrict)\n  statusHistory  booking_status_history[]\n  vehicle        vehicles?                @relation(fields: [vehicleId], references: [id], onDelete: SetNull)\n\n  @@index([customerId])\n  @@index([propertyId])\n  @@index([vehicleId])\n  @@index([status])\n  @@index([startTime, endTime])\n  @@index([createdBy])\n  @@map(\"bookings\")\n}\n\nmodel booking_slots {\n  id        String        @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  bookingId String        @map(\"booking_id\") @db.Uuid\n  slotId    String        @map(\"slot_id\") @db.Uuid\n  createdAt DateTime      @default(now()) @map(\"created_at\") @db.Timestamptz(6)\n  booking   bookings      @relation(fields: [bookingId], references: [id], onDelete: Cascade)\n  slot      parking_slots @relation(fields: [slotId], references: [id], onDelete: Restrict)\n  washJob   wash_jobs?\n\n  @@unique([bookingId, slotId])\n  @@index([slotId])\n  @@map(\"booking_slots\")\n}\n\nmodel booking_status_history {\n  id        String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  bookingId String   @map(\"booking_id\") @db.Uuid\n  oldStatus String?  @map(\"old_status\")\n  newStatus String   @map(\"new_status\")\n  changedBy String?  @map(\"changed_by\") @db.Uuid\n  note      String?\n  changedAt DateTime @default(now()) @map(\"changed_at\") @db.Timestamptz(6)\n  booking   bookings @relation(fields: [bookingId], references: [id], onDelete: Cascade)\n  changer   users?   @relation(\"BookingStatusChangedBy\", fields: [changedBy], references: [id], onDelete: SetNull)\n\n  @@index([bookingId, changedAt])\n  @@index([changedBy])\n  @@map(\"booking_status_history\")\n}\n\nmodel payment_summary {\n  bookingId   String   @id @map(\"booking_id\") @db.Uuid\n  totalAmount Decimal  @default(0) @map(\"total_amount\") @db.Decimal(10, 2)\n  onlinePaid  Decimal  @default(0) @map(\"online_paid\") @db.Decimal(10, 2)\n  cashPaid    Decimal  @default(0) @map(\"cash_paid\") @db.Decimal(10, 2)\n  balanceDue  Decimal  @default(0) @map(\"balance_due\") @db.Decimal(10, 2)\n  currency    String   @default(\"LKR\")\n  updatedAt   DateTime @default(now()) @updatedAt @map(\"updated_at\") @db.Timestamptz(6)\n  booking     bookings @relation(fields: [bookingId], references: [id], onDelete: Cascade)\n\n  @@map(\"payment_summary\")\n}\n\nmodel payments {\n  id              String        @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  bookingId       String        @map(\"booking_id\") @db.Uuid\n  payerId         String        @map(\"payer_id\") @db.Uuid\n  amount          Decimal       @db.Decimal(10, 2)\n  currency        String        @default(\"LKR\")\n  method          PaymentMethod\n  paymentStatus   PaymentStatus @default(UNPAID) @map(\"payment_status\")\n  gatewayStatus   GatewayStatus @default(PENDING) @map(\"gateway_status\")\n  gatewayProvider String?       @map(\"gateway_provider\")\n  transactionId   String?       @map(\"transaction_id\")\n  cardLast4       String?       @map(\"card_last4\")\n  cardBrand       String?       @map(\"card_brand\")\n  cardExpMonth    Int?          @map(\"card_exp_month\")\n  cardExpYear     Int?          @map(\"card_exp_year\")\n  paidAt          DateTime?     @map(\"paid_at\") @db.Timestamptz(6)\n  createdBy       String?       @map(\"created_by\") @db.Uuid\n  createdAt       DateTime      @default(now()) @map(\"created_at\") @db.Timestamptz(6)\n  booking         bookings      @relation(fields: [bookingId], references: [id], onDelete: Cascade)\n  creator         users?        @relation(\"PaymentCreatedBy\", fields: [createdBy], references: [id], onDelete: SetNull)\n  payer           users         @relation(\"PaymentPayer\", fields: [payerId], references: [id], onDelete: Restrict)\n\n  @@index([bookingId])\n  @@index([paymentStatus])\n  @@index([payerId])\n  @@index([bookingId, paymentStatus])\n  @@map(\"payments\")\n}\n\nmodel wash_jobs {\n  id            String        @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  bookingSlotId String        @unique @map(\"booking_slot_id\") @db.Uuid\n  washerId      String?       @map(\"washer_id\") @db.Uuid\n  status        WashStatus    @default(PENDING)\n  acceptedAt    DateTime?     @map(\"accepted_at\") @db.Timestamptz(6)\n  completedAt   DateTime?     @map(\"completed_at\") @db.Timestamptz(6)\n  note          String?\n  createdAt     DateTime      @default(now()) @map(\"created_at\") @db.Timestamptz(6)\n  updatedAt     DateTime      @default(now()) @updatedAt @map(\"updated_at\") @db.Timestamptz(6)\n  bookingSlot   booking_slots @relation(fields: [bookingSlotId], references: [id], onDelete: Cascade)\n  washer        users?        @relation(\"WashJobWasher\", fields: [washerId], references: [id], onDelete: SetNull)\n\n  @@index([status])\n  @@index([washerId, status])\n  @@map(\"wash_jobs\")\n}\n\nmodel counter_transactions {\n  id            String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  counterUserId String   @map(\"counter_user_id\") @db.Uuid\n  bookingId     String   @map(\"booking_id\") @db.Uuid\n  action        String\n  note          String?\n  createdAt     DateTime @default(now()) @map(\"created_at\") @db.Timestamptz(6)\n  booking       bookings @relation(fields: [bookingId], references: [id], onDelete: Restrict)\n  counterUser   users    @relation(fields: [counterUserId], references: [id], onDelete: Restrict)\n\n  @@index([counterUserId])\n  @@index([bookingId])\n  @@map(\"counter_transactions\")\n}\n\nmodel notifications {\n  id        String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  userId    String   @map(\"user_id\") @db.Uuid\n  title     String\n  message   String\n  isRead    Boolean  @default(false) @map(\"is_read\")\n  createdAt DateTime @default(now()) @map(\"created_at\") @db.Timestamptz(6)\n  user      users    @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId, isRead])\n  @@index([createdAt])\n  @@map(\"notifications\")\n}\n\nenum BookingStatus {\n  PENDING\n  PAID\n  CANCELLED\n}\n\nenum SlotType {\n  NORMAL\n  EV\n  CAR_WASH\n}\n\nenum WashStatus {\n  PENDING\n  ACCEPTED\n  COMPLETED\n}\n\nenum PaymentStatus {\n  UNPAID\n  PAID\n  FAILED\n  REFUNDED\n}\n\nenum GatewayStatus {\n  PENDING\n  COMPLETED\n  FAILED\n}\n\nenum PaymentMethod {\n  CARD\n  CASH\n}\n\nenum PropertyStatus {\n  ACTIVATED\n  NOT_ACTIVATED\n}\n\nenum RoleName {\n  ADMIN\n  CUSTOMER\n  LANDOWNER\n  WASHER\n  COUNTER\n}\n",
  "inlineSchemaHash": "94ad0bac07132d81fccbe34d6382eaca3d944cc0c6a8b19f874a3a4c470dc4cd",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"users\":{\"dbName\":\"users\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fullName\",\"dbName\":\"full_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nic\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"residentialAddress\",\"dbName\":\"residential_address\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"passwordHash\",\"dbName\":\"password_hash\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"dbName\":\"is_active\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"customerBookings\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"bookings\",\"relationName\":\"BookingCustomer\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdBookings\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"bookings\",\"relationName\":\"BookingCreator\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bookingStatusEvents\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"booking_status_history\",\"relationName\":\"BookingStatusChangedBy\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"counterTransactions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"counter_transactions\",\"relationName\":\"counter_transactionsTousers\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notifications\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"notifications\",\"relationName\":\"notificationsTousers\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ownedProperties\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"properties\",\"relationName\":\"PropertyOwner\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdPayments\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"payments\",\"relationName\":\"PaymentCreatedBy\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"payments\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"payments\",\"relationName\":\"PaymentPayer\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"roles\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"user_roles\",\"relationName\":\"user_rolesTousers\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"vehicles\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"vehicles\",\"relationName\":\"usersTovehicles\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"washJobs\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"wash_jobs\",\"relationName\":\"WashJobWasher\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"roles\":{\"dbName\":\"roles\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"RoleName\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"users\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"user_roles\",\"relationName\":\"rolesTouser_roles\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"user_roles\":{\"dbName\":\"user_roles\",\"fields\":[{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"roleId\",\"dbName\":\"role_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"role\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"roles\",\"relationName\":\"rolesTouser_roles\",\"relationFromFields\":[\"roleId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"users\",\"relationName\":\"user_rolesTousers\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"userId\",\"roleId\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"properties\":{\"dbName\":\"properties\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ownerId\",\"dbName\":\"owner_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"propertyName\",\"dbName\":\"property_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"address\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pricePerHour\",\"dbName\":\"price_per_hour\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pricePerDay\",\"dbName\":\"price_per_day\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"LKR\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"PropertyStatus\",\"default\":\"NOT_ACTIVATED\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"totalSlots\",\"dbName\":\"total_slots\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"totalNormalSlots\",\"dbName\":\"total_normal_slots\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"totalEvSlots\",\"dbName\":\"total_ev_slots\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"totalCarWashSlots\",\"dbName\":\"total_car_wash_slots\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"bookings\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"bookings\",\"relationName\":\"bookingsToproperties\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"owner\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"users\",\"relationName\":\"PropertyOwner\",\"relationFromFields\":[\"ownerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"parkingSlots\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"parking_slots\",\"relationName\":\"parking_slotsToproperties\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"parking_slots\":{\"dbName\":\"parking_slots\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"propertyId\",\"dbName\":\"property_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"slotNumber\",\"dbName\":\"slot_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"slotType\",\"dbName\":\"slot_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"SlotType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"dbName\":\"is_active\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bookingSlots\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"booking_slots\",\"relationName\":\"booking_slotsToparking_slots\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"property\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"properties\",\"relationName\":\"parking_slotsToproperties\",\"relationFromFields\":[\"propertyId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"propertyId\",\"slotNumber\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"propertyId\",\"slotNumber\"]}],\"isGenerated\":false},\"vehicles\":{\"dbName\":\"vehicles\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"vehicleNumber\",\"dbName\":\"vehicle_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"model\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"color\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"bookings\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"bookings\",\"relationName\":\"bookingsTovehicles\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"users\",\"relationName\":\"usersTovehicles\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"bookings\":{\"dbName\":\"bookings\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customerId\",\"dbName\":\"customer_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"propertyId\",\"dbName\":\"property_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"vehicleId\",\"dbName\":\"vehicle_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"startTime\",\"dbName\":\"start_time\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"endTime\",\"dbName\":\"end_time\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BookingStatus\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"parkingType\",\"dbName\":\"parking_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"SlotType\",\"default\":\"NORMAL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bookingType\",\"dbName\":\"booking_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"NORMAL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdBy\",\"dbName\":\"created_by\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"bookingSlots\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"booking_slots\",\"relationName\":\"booking_slotsTobookings\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customer\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"users\",\"relationName\":\"BookingCustomer\",\"relationFromFields\":[\"customerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"creator\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"users\",\"relationName\":\"BookingCreator\",\"relationFromFields\":[\"createdBy\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"SetNull\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"counterLogs\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"counter_transactions\",\"relationName\":\"bookingsTocounter_transactions\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"paymentSummary\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"payment_summary\",\"relationName\":\"bookingsTopayment_summary\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"payments\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"payments\",\"relationName\":\"bookingsTopayments\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"property\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"properties\",\"relationName\":\"bookingsToproperties\",\"relationFromFields\":[\"propertyId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"statusHistory\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"booking_status_history\",\"relationName\":\"booking_status_historyTobookings\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"vehicle\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"vehicles\",\"relationName\":\"bookingsTovehicles\",\"relationFromFields\":[\"vehicleId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"SetNull\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"booking_slots\":{\"dbName\":\"booking_slots\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bookingId\",\"dbName\":\"booking_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"slotId\",\"dbName\":\"slot_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"booking\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"bookings\",\"relationName\":\"booking_slotsTobookings\",\"relationFromFields\":[\"bookingId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"slot\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"parking_slots\",\"relationName\":\"booking_slotsToparking_slots\",\"relationFromFields\":[\"slotId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"washJob\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"wash_jobs\",\"relationName\":\"booking_slotsTowash_jobs\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"bookingId\",\"slotId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"bookingId\",\"slotId\"]}],\"isGenerated\":false},\"booking_status_history\":{\"dbName\":\"booking_status_history\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bookingId\",\"dbName\":\"booking_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"oldStatus\",\"dbName\":\"old_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"newStatus\",\"dbName\":\"new_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"changedBy\",\"dbName\":\"changed_by\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"note\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"changedAt\",\"dbName\":\"changed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"booking\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"bookings\",\"relationName\":\"booking_status_historyTobookings\",\"relationFromFields\":[\"bookingId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"changer\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"users\",\"relationName\":\"BookingStatusChangedBy\",\"relationFromFields\":[\"changedBy\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"SetNull\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"payment_summary\":{\"dbName\":\"payment_summary\",\"fields\":[{\"name\":\"bookingId\",\"dbName\":\"booking_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"totalAmount\",\"dbName\":\"total_amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"onlinePaid\",\"dbName\":\"online_paid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cashPaid\",\"dbName\":\"cash_paid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"balanceDue\",\"dbName\":\"balance_due\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"LKR\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"booking\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"bookings\",\"relationName\":\"bookingsTopayment_summary\",\"relationFromFields\":[\"bookingId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"payments\":{\"dbName\":\"payments\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bookingId\",\"dbName\":\"booking_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"payerId\",\"dbName\":\"payer_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"LKR\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"method\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PaymentMethod\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"paymentStatus\",\"dbName\":\"payment_status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"PaymentStatus\",\"default\":\"UNPAID\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gatewayStatus\",\"dbName\":\"gateway_status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"GatewayStatus\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gatewayProvider\",\"dbName\":\"gateway_provider\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"transactionId\",\"dbName\":\"transaction_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cardLast4\",\"dbName\":\"card_last4\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cardBrand\",\"dbName\":\"card_brand\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cardExpMonth\",\"dbName\":\"card_exp_month\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cardExpYear\",\"dbName\":\"card_exp_year\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"paidAt\",\"dbName\":\"paid_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdBy\",\"dbName\":\"created_by\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"booking\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"bookings\",\"relationName\":\"bookingsTopayments\",\"relationFromFields\":[\"bookingId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"creator\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"users\",\"relationName\":\"PaymentCreatedBy\",\"relationFromFields\":[\"createdBy\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"SetNull\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"payer\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"users\",\"relationName\":\"PaymentPayer\",\"relationFromFields\":[\"payerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"wash_jobs\":{\"dbName\":\"wash_jobs\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bookingSlotId\",\"dbName\":\"booking_slot_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"washerId\",\"dbName\":\"washer_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"WashStatus\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"acceptedAt\",\"dbName\":\"accepted_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"completedAt\",\"dbName\":\"completed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"note\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"bookingSlot\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"booking_slots\",\"relationName\":\"booking_slotsTowash_jobs\",\"relationFromFields\":[\"bookingSlotId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"washer\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"users\",\"relationName\":\"WashJobWasher\",\"relationFromFields\":[\"washerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"SetNull\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"counter_transactions\":{\"dbName\":\"counter_transactions\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"counterUserId\",\"dbName\":\"counter_user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bookingId\",\"dbName\":\"booking_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"action\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"note\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"booking\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"bookings\",\"relationName\":\"bookingsTocounter_transactions\",\"relationFromFields\":[\"bookingId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"counterUser\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"users\",\"relationName\":\"counter_transactionsTousers\",\"relationFromFields\":[\"counterUserId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"notifications\":{\"dbName\":\"notifications\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isRead\",\"dbName\":\"is_read\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"users\",\"relationName\":\"notificationsTousers\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"BookingStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"PAID\",\"dbName\":null},{\"name\":\"CANCELLED\",\"dbName\":null}],\"dbName\":null},\"SlotType\":{\"values\":[{\"name\":\"NORMAL\",\"dbName\":null},{\"name\":\"EV\",\"dbName\":null},{\"name\":\"CAR_WASH\",\"dbName\":null}],\"dbName\":null},\"WashStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"ACCEPTED\",\"dbName\":null},{\"name\":\"COMPLETED\",\"dbName\":null}],\"dbName\":null},\"PaymentStatus\":{\"values\":[{\"name\":\"UNPAID\",\"dbName\":null},{\"name\":\"PAID\",\"dbName\":null},{\"name\":\"FAILED\",\"dbName\":null},{\"name\":\"REFUNDED\",\"dbName\":null}],\"dbName\":null},\"GatewayStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"COMPLETED\",\"dbName\":null},{\"name\":\"FAILED\",\"dbName\":null}],\"dbName\":null},\"PaymentMethod\":{\"values\":[{\"name\":\"CARD\",\"dbName\":null},{\"name\":\"CASH\",\"dbName\":null}],\"dbName\":null},\"PropertyStatus\":{\"values\":[{\"name\":\"ACTIVATED\",\"dbName\":null},{\"name\":\"NOT_ACTIVATED\",\"dbName\":null}],\"dbName\":null},\"RoleName\":{\"values\":[{\"name\":\"ADMIN\",\"dbName\":null},{\"name\":\"CUSTOMER\",\"dbName\":null},{\"name\":\"LANDOWNER\",\"dbName\":null},{\"name\":\"WASHER\",\"dbName\":null},{\"name\":\"COUNTER\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined

config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

