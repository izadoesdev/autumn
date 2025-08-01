import { Organization, FullProduct } from "@autumn/shared";
import Stripe from "stripe";
import { getExistingCusProducts } from "../cusProducts/cusProductUtils/getExistingCusProducts.js";
import { AttachParams } from "../cusProducts/AttachParams.js";
import { CusProductService } from "../cusProducts/CusProductService.js";
import { cancelFutureProductSchedule } from "./scheduleUtils.js";

// DUplicate?
export const cancelScheduledProductIfExists = async ({
  req,
  org,
  stripeCli,
  attachParams,
  curFullProduct,
  logger,
}: {
  req: any;
  org: Organization;
  stripeCli: Stripe;
  attachParams: AttachParams;
  curFullProduct: FullProduct;
  logger: any;
}) => {
  let { curScheduledProduct } = getExistingCusProducts({
    product: curFullProduct,
    cusProducts: attachParams.cusProducts!,
    internalEntityId: attachParams.internalEntityId,
  });

  if (curScheduledProduct) {
    logger.info(
      `Change product: cancelling future scheduled product: ${curScheduledProduct.product.name}`,
    );
    // 1. Cancel future product schedule
    await cancelFutureProductSchedule({
      req,
      db: req.db,
      org,
      cusProducts: attachParams.cusProducts!,
      product: curScheduledProduct.product as any,
      stripeCli,
      logger,
      env: attachParams.customer.env,
      internalEntityId: attachParams.internalEntityId || undefined,
    });

    // 2. Delete scheduled product
    await CusProductService.delete({
      db: req.db,
      cusProductId: curScheduledProduct.id,
    });
  }

  // attachParams.curScheduledProduct = null;
};
