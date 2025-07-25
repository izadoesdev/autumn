import RecaseError from "@/utils/errorUtils.js";
import { nullish } from "@/utils/genUtils.js";
import { ErrCode, FullCustomerEntitlement } from "@autumn/shared";
import { StatusCodes } from "http-status-codes";

export const getEntityBalance = ({
  cusEnt,
  entityId,
}: {
  cusEnt: FullCustomerEntitlement;
  entityId: string;
}) => {
  let entityBalance = cusEnt.entities?.[entityId!]?.balance;
  let adjustment = cusEnt.entities?.[entityId!]?.adjustment || 0;

  if (nullish(entityBalance)) {
    return { balance: 0, adjustment: 0 };
    // throw new RecaseError({
    //   message: `Entity balance not found for entityId: ${entityId}`,
    //   code: ErrCode.EntityBalanceNotFound,
    //   statusCode: StatusCodes.BAD_REQUEST,
    // });
  }

  return {
    balance: entityBalance,
    adjustment,
  };
};

export const getSummedEntityBalances = ({
  cusEnt,
}: {
  cusEnt: FullCustomerEntitlement;
}) => {
  if (nullish(cusEnt.entities)) {
    return {
      balance: 0,
      adjustment: 0,
      unused: 0,
      count: 0,
    };
  }

  return {
    balance: Object.values(cusEnt.entities!).reduce(
      (acc, curr) => acc + curr.balance,
      0,
    ),
    adjustment: Object.values(cusEnt.entities!).reduce(
      (acc, curr) => acc + curr.adjustment,
      0,
    ),
    unused: 0,
    count: Object.values(cusEnt.entities!).length,
  };
};
