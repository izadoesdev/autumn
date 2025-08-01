import { PriceItem } from "@/components/pricing/attach-pricing-dialog";
import { isFeaturePriceItem } from "@/utils/product/getItemType";
import {
  getFeatureString,
  getPaidFeatureString,
} from "@/utils/product/product-item/formatProductItem";
import { useProductContext } from "@/views/products/product/ProductContext";

export const AttachNewItems = () => {
  const { attachState, features, org } = useProductContext();
  const { preview } = attachState;

  if (preview?.new_items) {
    return (
      <div>
        <p className="text-t2 font-semibold mb-2">New items</p>
        {preview.new_items.map((item: any, index: number) => {
          const str = isFeaturePriceItem(item)
            ? getPaidFeatureString({ item, features, org })
            : getFeatureString({ item, features });

          return (
            <PriceItem key={index}>
              <span>{str}</span>
            </PriceItem>
          );
        })}
      </div>
    );
  }
};
