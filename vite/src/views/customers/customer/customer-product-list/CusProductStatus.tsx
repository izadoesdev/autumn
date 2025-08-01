import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CusProductStatus, FullCusProduct } from "@autumn/shared";
import { CusProductStripeLink } from "./CusProductStripeLink";
import { keyToTitle } from "@/utils/formatUtils/formatTextUtils";
import { formatUnixToDateTime } from "@/utils/formatUtils/formatDateUtils";
import { notNullish } from "@/utils/genUtils";

export const CusProductStatusItem = ({
  cusProduct,
}: {
  cusProduct: FullCusProduct;
}) => {
  const getStatus = () => {
    const trialing =
      cusProduct.trial_ends_at && cusProduct.trial_ends_at > Date.now();

    const canceled =
      notNullish(cusProduct.canceled_at) &&
      cusProduct.status !== CusProductStatus.Expired;
    if (canceled) return "canceled";

    if (trialing) {
      return CusProductStatus.Trialing;
    }

    return cusProduct.status;
  };

  const isCanceled = notNullish(cusProduct.canceled_at);

  const statusToColor: Record<CusProductStatus | "canceled", string> = {
    [CusProductStatus.Active]: "bg-lime-500",
    [CusProductStatus.Expired]: "bg-stone-800",
    [CusProductStatus.PastDue]: "bg-red-500",
    [CusProductStatus.Scheduled]: "bg-blue-500",
    [CusProductStatus.Trialing]: "bg-yellow-400",
    canceled: "bg-gray-500",
    [CusProductStatus.Unknown]: "bg-gray-500",
  };

  return (
    <div className="flex gap-0.5 items-center">
      <Badge
        variant="status"
        className={cn("h-fit", statusToColor[getStatus()])}
      >
        {keyToTitle(getStatus()).toLowerCase()}
      </Badge>
      {/* {isCanceled && (
        <Badge variant="status" className="ml-2 bg-gray-500">
          canceled
        </Badge>
      )} */}

      {/* <span className="text-t3">
        ends {formatUnixToDateTime(cusProduct.trial_ends_at).date}
      </span> */}

      <CusProductStripeLink cusProduct={cusProduct} />
    </div>
  );
};
