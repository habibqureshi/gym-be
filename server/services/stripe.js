const stripe = require("stripe")(
  "sk_test_51NQTjnEuYMAdrWvEvKhhJfo5yQALNVYeUO1tJy53hsiu2JgMR9Iy9hz4WvKMlMTPURPkupMR04vnrDpk64vSNJiK00cnrLkoWo"
);

const createCustomer = async () => {
  return await stripe.customers.create();
};

const createPaymentMethod = async (data) => {
  console.log("payment method", data);
  return await stripe.paymentMethods.create({
    type: data.type,
    card: {
      number: data.card.number,
      exp_month: data.card.exp_month,
      exp_year: data.card.exp_year,
      cvc: data.card.cvc,
    },
  });
};

const attachCustomerWithPaymentMethod = async (
  paymentMethodId,
  stripeCustomerId
) => {
  return await stripe.paymentMethods.attach(paymentMethodId, {
    customer: stripeCustomerId,
  });
};

const getPaymentMethodsByCustomerId = async (stripeCustomerId) => {
  return await stripe.customers.listPaymentMethods(stripeCustomerId);
};

const getPaymentMethodsByCustomerIdAndPaymentMethodId = async (
  stripeCustomerId,
  paymentMethodId
) => {
  return await stripe.customers.retrievePaymentMethod(
    stripeCustomerId,
    paymentMethodId
  );
};

const createEphemralKey = async (stripeCustomerId) => {
  return await stripe.ephemeralKeys.create(
    { customer: stripeCustomerId },
    { apiVersion: "2022-11-15" }
  );
};

const createPaymentIntent = async (data) => {
  return await stripe.paymentIntents.create({
    customer: data.customerStripeID,
    payment_method: data.paymentMethodID,
    setup_future_usage: "off_session",
    amount: data.price,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });
};

const submitPamentIntent = async (data) => {
  return;
};

module.exports = {
  createCustomer,
  createPaymentIntent,
  createPaymentMethod,
  getPaymentMethodsByCustomerId,
  getPaymentMethodsByCustomerIdAndPaymentMethodId,
  attachCustomerWithPaymentMethod,
  createEphemralKey,
};
