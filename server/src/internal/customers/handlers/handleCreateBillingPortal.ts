import { createStripeCli } from "@/external/stripe/utils.js";
import { CusService } from "@/internal/customers/CusService.js";
import { OrgService } from "@/internal/orgs/OrgService.js";
import RecaseError, { handleRequestError } from "@/utils/errorUtils.js";
import { routeHandler } from "@/utils/routerUtils.js";
import { ErrCode } from "@autumn/shared";
import { StatusCodes } from "http-status-codes";

export const handleCreateBillingPortal = async (req: any, res: any) =>
  routeHandler({
    req,
    res,
    action: "create_billing_portal",
    handler: async (req: any, res: any) => {
      const customerId = req.params.customer_id;
      let returnUrl = req.body.return_url;

      const [org, customer] = await Promise.all([
        OrgService.getFromReq(req),
        CusService.get({
          db: req.db,
          idOrInternalId: customerId,
          orgId: req.orgId,
          env: req.env,
        }),
      ]);

      if (!customer) {
        throw new RecaseError({
          message: `Customer ${customerId} not found`,
          code: ErrCode.CustomerNotFound,
          statusCode: StatusCodes.NOT_FOUND,
        });
      }

      if (!customer.processor?.id) {
        throw new RecaseError({
          message: `Customer ${customerId} not connected to Stripe`,
          code: ErrCode.InvalidRequest,
          statusCode: StatusCodes.BAD_REQUEST,
        });
      }

      const stripeCli = createStripeCli({ org, env: req.env });
      const portal = await stripeCli.billingPortal.sessions.create({
        customer: customer.processor.id,
        return_url: returnUrl || org.stripe_config.success_url,
      });

      res.status(200).json({
        customer_id: customer.id,
        url: portal.url,
      });
    },
  });
