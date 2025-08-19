import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/app/lib/utils"

type TooltipPayload = {
  color?: string
  dataKey?: string
  name?: string
  value?: number
  payload: Record<string, unknown>
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
  className?: string
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "line" | "dot" | "dashed"
  nameKey?: string
  labelKey?: string
  formatter?: (
    value: number,
    name: string,
    entry: TooltipPayload,
    index: number,
    payload: Record<string, unknown>
  ) => React.ReactNode
  labelFormatter?: (
    value: string | React.ReactNode,
    payload?: TooltipPayload[]
  ) => React.ReactNode
  labelClassName?: string
  color?: string
}

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    if (!active || !payload?.length) return null

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {payload.map((item, index) => (
          <div key={item.dataKey} className="flex items-center gap-2">
            {!hideIndicator && (
              <div
                className="h-2 w-2 rounded-sm"
                style={{ backgroundColor: color || item.color }}
              />
            )}
            <span>{item.name || nameKey}</span>
            <span className="font-mono font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

export { ChartTooltipContent }
