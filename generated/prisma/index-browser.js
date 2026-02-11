
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


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

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

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
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
