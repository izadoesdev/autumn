import { CusService } from "@/internal/customers/CusService.js";
import { OrgService } from "@/internal/orgs/OrgService.js";
import RecaseError from "@/utils/errorUtils.js";
import { routeHandler } from "@/utils/routerUtils.js";
import { CusProductStatus, ErrCode, FullCusProduct } from "@autumn/shared";
import { Router } from "express";
import { expireCusProduct } from "../handlers/handleCusProductExpired.js";
import { RELEVANT_STATUSES } from "../cusProducts/CusProductService.js";

const expireRouter: Router = Router();

expireRouter.post("", async (req, res) =>
  routeHandler({
    req,
    res,
    action: "expire",
    handler: async (req, res) => {
      let { db, orgId, env, logtail: logger } = req;
      let { customer_id, product_id, entity_id, cancel_immediately } = req.body;

      let expireImmediately = cancel_immediately || false;
      let prorate = true;

      let fullCus = await CusService.getFull({
        db,
        orgId,
        idOrInternalId: customer_id,
        env,
        withEntities: true,
        entityId: entity_id,
        inStatuses: RELEVANT_STATUSES,
        allowNotFound: false,
      });

      if (entity_id && !fullCus.entity) {
        throw new RecaseError({
          code: ErrCode.EntityNotFound,
          message: `Entity ${entity_id} not found for customer ${customer_id}`,
        });
      }

      let cusProducts = fullCus.customer_products;
      let entity = fullCus.entity;

      let cusProductsToExpire = cusProducts.filter(
        (cusProduct: FullCusProduct) =>
          cusProduct.product.id == product_id &&
          (entity ? cusProduct.internal_entity_id == entity.internal_id : true)
      );

      if (cusProductsToExpire.length == 0) {
        throw new RecaseError({
          code: ErrCode.ProductNotFound,
          message: `Product ${product_id} not found for customer ${customer_id}`,
        });
      }

      for (const cusProduct of cusProductsToExpire) {
        await expireCusProduct({
          req,
          cusProduct,
          fullCus,
          expireImmediately,
          prorate,
        });
      }

      res.status(200).json({
        success: true,
        customer_id: customer_id,
        product_id: product_id,
      });
    },
  })
);

export default expireRouter;
