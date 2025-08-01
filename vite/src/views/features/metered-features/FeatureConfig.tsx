import { useEffect, useState } from "react";
import FieldLabel from "@/components/general/modal-components/FieldLabel";
import { Input } from "@/components/ui/input";
import { slugify } from "@/utils/formatUtils/formatTextUtils";
import { cn } from "@/lib/utils";
import { Clock, InfoIcon, PlusIcon, XIcon, Zap } from "lucide-react";
import { Expression, FeatureUsageType, MeteredConfig } from "@autumn/shared";
import { FeatureType } from "@autumn/shared";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function FeatureConfig({
  feature,
  setFeature,
  eventNameInput,
  setEventNameInput,
  isUpdate = false,
  eventNameChanged,
  setEventNameChanged,
}: {
  feature: any;
  setFeature: any;
  eventNameInput: string;
  setEventNameInput: any;
  isUpdate?: boolean;
  eventNameChanged: boolean;
  setEventNameChanged: any;
}) {
  const [fields, setFields] = useState(
    feature.name
      ? {
          name: feature.name,
          id: feature.id,
        }
      : {
          name: "",
          id: "",
        }
  );

  const [meteredConfig, setMeteredConfig] = useState<MeteredConfig>(
    feature.type === FeatureType.Metered
      ? feature.config
      : {
          filters: [
            {
              property: "",
              operator: "",
              value: [],
            },
          ],
          usage_type: FeatureUsageType.Single,
          // aggregate: {
          //   type: "count",
          //   property: null,
          // },
        }
  );

  const [showEventName, setShowEventName] = useState(
    feature.config && feature.config.filters?.[0]?.value?.length > 0
  );

  const [idChanged, setIdChanged] = useState(!!feature.id);
  const [featureType, setFeatureType] = useState<string>(
    feature.type ? feature.type : FeatureType.Metered
  );

  useEffect(() => {
    setFeature({
      ...feature,
      name: fields.name,
      id: fields.id,
      type: featureType,
      config: meteredConfig,
    });
  }, [featureType, meteredConfig, fields]);

  return (
    <div className="flex flex-col gap-4 min-w-md max-w-md">
      <Tabs
        defaultValue={feature.type}
        className="w-[400px]"
        value={featureType}
        onValueChange={setFeatureType}
      >
        <TabsList className="-ml-2">
          <TabsTrigger value={FeatureType.Metered}>Metered</TabsTrigger>
          <TabsTrigger value={FeatureType.Boolean}>Boolean</TabsTrigger>
        </TabsList>
        <p className="text-t3 text-sm">
          {featureType == FeatureType.Metered &&
            "A usage-based feature that you want to track"}
          {featureType == FeatureType.Boolean &&
            "A feature flag that can be either enabled or disabled"}
        </p>
      </Tabs>
      {featureType === FeatureType.Metered && (
        <div className="w-full">
          <div className="flex flex-col gap-2">
            <Tabs
              defaultValue={FeatureUsageType.Single}
              value={meteredConfig.usage_type}
              onValueChange={(value) => {
                setMeteredConfig({
                  ...meteredConfig,
                  usage_type: value as FeatureUsageType,
                });
              }}
            >
              <TabsList className="-mx-2">
                <TabsTrigger
                  value={FeatureUsageType.Single}
                  className="flex items-center gap-1"
                >
                  <Zap className="h-3 w-3 text-t3" />
                  <span>Single Use</span>
                </TabsTrigger>
                <TabsTrigger
                  value={FeatureUsageType.Continuous}
                  className="flex items-center gap-1"
                >
                  <Clock className="h-3 w-3 text-t3" />
                  <span>Continuous Use</span>
                </TabsTrigger>
              </TabsList>
              <p className="text-sm text-t3 flex items-center gap-1">
                {meteredConfig.usage_type === FeatureUsageType.Continuous
                  ? "For features used on an ongoing basis, like 'seats' or 'storage'"
                  : "For features that are consumed and refilled like 'credits' or 'API calls'"}
                <Tooltip delayDuration={400}>
                  <TooltipTrigger asChild>
                    <InfoIcon className="w-3 h-3 text-t3/50" />
                  </TooltipTrigger>
                  <TooltipContent
                    sideOffset={5}
                    side="top"
                    align="start"
                    className="flex flex-col"
                  >
                    <p>
                      Single use features can have a reset period, to refill a
                      balance every month, day etc. Existing usage is also
                      typically reset on upgrades.
                      <br />
                      <br />
                      Continuous use features don't have a reset period. They
                      can be prorated (eg, if a seat is purchased halfway during
                      the month, it'll cost half the price).
                    </p>
                  </TooltipContent>
                </Tooltip>
              </p>
            </Tabs>
          </div>
        </div>
      )}

      <div className="flex gap-2 w-full">
        <div className="w-full">
          <FieldLabel>Name</FieldLabel>
          <Input
            placeholder="Eg, messages, seats"
            value={fields.name}
            onChange={(e) => {
              const newFields: any = { ...fields, name: e.target.value };
              if (!idChanged) {
                newFields.id = slugify(e.target.value);
              }
              setFields(newFields);

              if (!eventNameChanged) {
                setEventNameInput(slugify(e.target.value));
              }
            }}
          />
        </div>
        <div className="w-full">
          <FieldLabel>ID</FieldLabel>
          <Input
            // disabled={isUpdate}
            placeholder="ID"
            value={fields.id}
            onChange={(e) => {
              setFields({ ...fields, id: e.target.value });
              setIdChanged(true);
            }}
          />
        </div>
      </div>

      {/* Filter */}
      {featureType === FeatureType.Metered && (
        <>
          <div className={showEventName ? "" : "hidden"}>
            <FieldLabel>Event Name</FieldLabel>

            {/* <div className="flex gap-1 mb-2 text-sm bor">
              <p className="text-t2 font-mono">event_name</p>
              <p className="text-sm text-t3">is one of</p>
            </div> */}
            <FilterInput
              config={meteredConfig}
              setConfig={setMeteredConfig}
              eventNameInput={eventNameInput}
              setEventNameInput={setEventNameInput}
              setEventNameChanged={setEventNameChanged}
            />
            <p className="text-sm text-t3 mt-2 px-2">
              Event names are only required if you want to link one event from
              your application to multiple feature balances. Read more{" "}
              <a
                href="https://docs.useautumn.com/features/tracking-usage#using-event-names"
                target="_blank"
                className="text-primary underline"
              >
                here.
              </a>
            </p>
          </div>
          <div>
            <Tooltip delayDuration={400}>
              <TooltipTrigger asChild>
                <Button
                  className={cn(
                    "h-7 border rounded-none text-t3 text-xs",
                    showEventName && "text-red-300"
                  )}
                  variant="outline"
                  startIcon={
                    showEventName ? <XIcon size={12} /> : <PlusIcon size={12} />
                  }
                  onClick={() => {
                    setShowEventName(!showEventName);
                  }}
                >
                  <span className="font-mono ">event_name</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={5} side="bottom" align="start">
                <p>Link feature to multiple separate events</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </>
      )}
    </div>
  );
}

export const FilterInput = ({
  config,
  setConfig,
  eventNameInput,
  setEventNameInput,
  setEventNameChanged,
}: {
  config: MeteredConfig;
  setConfig: any;
  eventNameInput: string;
  setEventNameInput: any;
  setEventNameChanged: any;
}) => {
  const [inputFocused, setInputFocused] = useState(false);

  const filter: Expression =
    config.filters.length > 0
      ? config.filters[0]
      : {
          property: "",
          operator: "",
          value: [],
        };

  const enterClicked = () => {
    let newFilter: Expression;

    if (filter.value.length == 0) {
      newFilter = {
        property: "",
        operator: "",
        value: [],
      };
    } else {
      newFilter = { ...config.filters[0] };
    }
    newFilter.value.push(eventNameInput);
    setConfig({ ...config, filters: [newFilter] });
    setEventNameInput("");
    setEventNameChanged(true);
  };

  const onRemoveClicked = (index: number) => {
    const newFilter: Expression = { ...config.filters[0] };
    newFilter.value.splice(index, 1);
    setConfig({ ...config, filters: [newFilter] });
  };

  useHotkeys("enter", enterClicked, {
    enableOnFormTags: ["input"],
    enabled: inputFocused,
  });

  // useHotkeys(["meta+enter"], enterClicked, {
  //   enableOnContentEditable: true,
  //   enabled: inputFocused,
  // });

  return (
    <div
      className={cn(
        `p-2 py-2 h-fit rounded-md border text-sm w-full transition-colors duration-100 
        flex items-center flex-wrap gap-2 gap-y-2 bg-white`,
        inputFocused &&
          "border-primary shadow-[0_0_2px_1px_rgba(139,92,246,0.25)]"
      )}
    >
      {filter.value.map((value: string, index: number) => (
        <div
          key={index}
          className="flex items-center gap-2 border border-zinc-300 bg-zinc-50 rounded-full pl-3 pr-2 py-1 text-xs"
        >
          {value}
          <button
            className="text-zinc-500"
            onClick={() => onRemoveClicked(index)}
          >
            <XIcon size={15} />
          </button>
        </div>
      ))}
      <input
        className="outline-none w-[10px] flex-grow"
        placeholder="eg. chat-messages"
        onFocus={() => setInputFocused(true)}
        onBlur={() => setInputFocused(false)}
        value={eventNameInput}
        onChange={(e) => {
          setEventNameInput(e.target.value);
          setEventNameChanged(true);
        }}
      ></input>
    </div>
  );
};

{
  /* <div>
            {groupByExists ? (
              <div>
                <FieldLabel>Group By</FieldLabel>
                <Input
                  placeholder="eg. app_id"
                  value={meteredConfig.group_by?.property || ""}
                  onChange={(e) =>
                    setMeteredConfig({
                      ...meteredConfig,
                      group_by: {
                        ...meteredConfig.group_by,
                        property: e.target.value,
                      },
                    })
                  }
                />
              </div>
            ) : (
              <Button
                className="h-7 border rounded-none text-t3 text-xs"
                variant="outline"
                startIcon={<PlusIcon size={12} />}
                onClick={() => {
                  setMeteredConfig({
                    ...meteredConfig,
                    group_by: {
                      property: "",
                    },
                  });
                  setGroupByExists(true);
                }}
              >
                Group By
              </Button>
            )}
          </div> */
}

{
  /* <div>
            <FieldLabel>Aggregate</FieldLabel>
            <Select
              value={meteredConfig.aggregate.type}
              onValueChange={(value) => setAggregate("type", value)}
              defaultValue="count"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(AggregateType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {meteredConfig.aggregate.type == AggregateType.Sum && (
            <div>
              <FieldLabel>Sum Property</FieldLabel>
              <Input
                placeholder="eg. value"
                value={meteredConfig.aggregate.property || ""}
                onChange={(e) => setAggregate("property", e.target.value)}
              />
            </div>
          )}

          

          {/* <div>
            <FieldLabel>Group By Property</FieldLabel>
            <Input
              placeholder="eg. app_id"
              value={meteredConfig.group_by || ""}
              onChange={(e) =>
                setMeteredConfig({
                  ...meteredConfig,
                  group_by: e.target.value,
                })
              }
            />
          </div> */
}
