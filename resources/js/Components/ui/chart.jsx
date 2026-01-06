import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Chart container component
const ChartContainer = React.forwardRef(
  ({ id, config, children, className, ...props }, ref) => {
    const uniqueId = React.useId()
    const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`
    const containerRef = React.useRef(null)
    const [dimensions, setDimensions] = React.useState({ width: 300, height: 300 })

    React.useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const { width, height } = containerRef.current.getBoundingClientRect()
          if (width > 0 && height > 0) {
            setDimensions({ width, height })
          }
        }
      }

      updateDimensions()
      const resizeObserver = new ResizeObserver(updateDimensions)
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current)
      }

      return () => {
        resizeObserver.disconnect()
      }
    }, [])

    return (
      <div
        data-chart={chartId}
        ref={(node) => {
          containerRef.current = node
          if (typeof ref === 'function') {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
        }}
        className={cn(
          "flex justify-center text-xs w-full h-full min-w-0 min-h-[250px] [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line-line]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        {dimensions.width > 0 && dimensions.height > 0 && (
          <RechartsPrimitive.ResponsiveContainer width={dimensions.width} height={dimensions.height}>
            {children}
          </RechartsPrimitive.ResponsiveContainer>
        )}
      </div>
    )
  }
)
ChartContainer.displayName = "Chart"

// Chart style component
const ChartStyle = ({ id, config }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(config)
          .filter(([_, config]) => config.theme || config.color)
          .map(([key, itemConfig]) => {
            const color = itemConfig.theme?.light || itemConfig.color || "hsl(var(--chart-1))"
            return `[data-chart=${id}] .color-${key} { color: ${color}; }`
          })
          .join("\n"),
      }}
    />
  )
}

// Chart tooltip component
const ChartTooltip = RechartsPrimitive.Tooltip

// Chart tooltip content component
const ChartTooltipContent = React.forwardRef(
  ({ active, payload, label, nameKey, labelKey, indicator = "line", nameKeyFormatter, labelFormatter, hideLabel, ...props }, ref) => {
    // Filter out Recharts-specific props that shouldn't be passed to DOM elements
    const {
      allowEscapeViewBox,
      animationDuration,
      animationEasing,
      axisId,
      contentStyle,
      cursor,
      filterNull,
      includeHidden,
      isAnimationActive,
      itemSorter,
      itemStyle,
      labelStyle,
      reverseDirection,
      useTranslate3d,
      wrapperStyle,
      activeIndex,
      accessibilityLayer,
      ...domProps
    } = props

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel) {
        return null
      }
      if (labelFormatter) {
        return labelFormatter(label)
      }
      if (labelKey && payload?.[0]?.payload?.[labelKey]) {
        return payload[0].payload[labelKey]
      }
      if (typeof label === "string" || typeof label === "number") {
        return label
      }
      return null
    }, [label, labelKey, labelFormatter, payload, hideLabel])

    if (!active || !payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          "animate-in fade-in-0 zoom-in-95"
        )}
        {...domProps}
      >
        {tooltipLabel && (
          <div className="font-medium leading-none tracking-tight text-muted-foreground">
            {tooltipLabel}
          </div>
        )}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${item.dataKey}-${index}`
            const itemConfig = item.payload?.fill ? { color: item.payload.fill } : undefined
            const name = nameKeyFormatter
              ? nameKeyFormatter(item.payload?.[nameKey] ?? item.name)
              : item.payload?.[nameKey] ?? item.name ?? item.dataKey
            const indicatorColor = item.payload?.fill || item.color

            return (
              <div
                key={key}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  "flex items-center gap-2"
                )}
              >
                <div
                  className={cn(
                    "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                    indicator === "line" && "h-0.5 w-4",
                    indicator === "dot" && "h-1.5 w-1.5 rounded-full",
                    indicator === "dashed" && "h-px w-3 border-t-2 border-dashed bg-transparent"
                  )}
                  style={{
                    "--color": indicatorColor,
                    "--color-bg": indicatorColor,
                    "--color-border": indicatorColor,
                  }}
                />
                <div
                  className={cn(
                    "flex flex-1 items-center justify-between gap-4 leading-none",
                    "text-muted-foreground"
                  )}
                >
                  <div className="grid gap-1.5">
                    <span className="text-muted-foreground">{name}</span>
                  </div>
                  {item.value && (
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      {item.value}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

export { ChartContainer, ChartTooltip, ChartTooltipContent }

