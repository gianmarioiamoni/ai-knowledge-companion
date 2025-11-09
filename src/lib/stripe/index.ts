/**
 * Stripe Services - Central Export
 */

// Client
export {
  getStripeServerClient,
  getStripeClientPromise,
  getStripePriceIds,
  getPriceIdForPlan,
  validateWebhookSignature,
} from './client'

// Customer
export {
  getOrCreateStripeCustomer,
  getStripeCustomer,
  updateStripeCustomer,
  getUserIdFromStripeCustomer,
} from './customer'

// Checkout
export {
  createCheckoutSession,
  getCheckoutSession,
  listCheckoutSessions,
} from './checkout'
export type { CreateCheckoutSessionParams } from './checkout'

// Subscription
export {
  getStripeSubscription,
  listCustomerSubscriptions,
  cancelSubscription,
  reactivateSubscription,
  updateSubscription,
  syncSubscriptionToDatabase,
  createCustomerPortalSession,
} from './subscription'

// Webhook
export {
  handleStripeWebhook,
  handleCheckoutSessionCompleted,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
} from './webhook'

