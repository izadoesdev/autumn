import {
  BillingInterval,
  Price,
  Feature,
  Customer,
  FullCusProduct,
  UsagePriceConfig,
  FullProduct,
  Organization,
} from "@autumn/shared";

import Stripe from "stripe";
import { getPriceForOverage } from "@/internal/products/prices/priceUtils.js";

import { getFeatureName } from "@/internal/features/utils/displayUtils.js";
import { getCusPriceUsage } from "@/internal/customers/cusProducts/cusPrices/cusPriceUtils.js";

export const createSubMeta = ({ features }: { features: Feature[] }) => {
  const usageFeatures = features.map((f) => ({
    internal_id: f.internal_id,
    id: f.id,
  }));
  return { usage_features: JSON.stringify(usageFeatures) };
};

export const billingIntervalToStripe = (interval: BillingInterval) => {
  switch (interval) {
    case BillingInterval.Month:
      return {
        interval: "month",
        interval_count: 1,
      };
    case BillingInterval.Quarter:
      return {
        interval: "month",
        interval_count: 3,
      };
    case BillingInterval.SemiAnnual:
      return {
        interval: "month",
        interval_count: 6,
      };
    case BillingInterval.Year:
      return {
        interval: "year",
        interval_count: 1,
      };
    default:
      break;
  }
};

export const getInvoiceItemForUsage = ({
  stripeInvoiceId,
  price,
  currency,
  customer,
  cusProduct,
  logger,
  periodStart,
  periodEnd,
}: {
  stripeInvoiceId: string;
  price: Price;
  currency: string;
  customer: Customer;
  cusProduct: FullCusProduct;
  logger: any;
  periodStart: number;
  periodEnd: number;
}) => {
  const { amount, description } = getCusPriceUsage({
    price,
    cusProduct,
    logger,
    withProdPrefix: true,
  });

  let config = price.config! as UsagePriceConfig;

  let invoiceItem: Stripe.InvoiceItemCreateParams = {
    invoice: stripeInvoiceId,
    customer: customer.processor.id,
    currency,
    description,

    price_data: {
      product: config.stripe_product_id!,
      unit_amount: Math.max(Math.round(amount * 100), 0),
      currency,
    },
    period: {
      start: periodStart,
      end: periodEnd,
    },
  };

  logger.info(`🌟🌟 Created invoice item: ${description}`);

  return invoiceItem;
};

export const getPlaceholderItem = ({
  product,
  org,
  interval,
}: {
  product: FullProduct;
  org: Organization;
  interval: BillingInterval;
}) => {
  return {
    price_data: {
      product: product.processor!.id,
      unit_amount: 0,
      currency: org.default_currency || "usd",
      recurring: {
        ...billingIntervalToStripe(interval as BillingInterval),
      },
    },
    quantity: 0,
  };
};
