"use client"

import * as React from "react"

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
  asChild?: boolean
}

/**
 * A simple implementation of the Slot pattern without Radix UI dependencies
 */
export const Slot = React.forwardRef<HTMLElement, SlotProps>(({ children, asChild = false, ...props }, ref) => {
  if (!asChild || !React.isValidElement(children)) {
    return (
      <span {...props} ref={ref as React.Ref<HTMLSpanElement>}>
        {children}
      </span>
    )
  }

  return React.cloneElement(
    children,
    Object.assign(
      {},
      props,
      {
        ref: ref
          ? // @ts-ignore - TypeScript doesn't know how to handle this properly
            (node: unknown) => {
              if (typeof ref === "function") ref(node as HTMLElement)
              else if (ref) ref.current = node as HTMLElement

              const { ref: childRef } = children as unknown as { ref?: React.Ref<HTMLElement> }
              if (typeof childRef === "function") childRef(node as HTMLElement)
              else if (childRef) (childRef as React.MutableRefObject<HTMLElement>).current = node as HTMLElement
            }
          : children.props.ref,
      },
      props.style || children.props.style
        ? {
            style: {
              ...children.props.style,
              ...props.style,
            },
          }
        : {},
      props.className && children.props.className
        ? {
            className: `${children.props.className} ${props.className}`,
          }
        : props.className
          ? { className: props.className }
          : {},
    ),
  )
})

Slot.displayName = "Slot"
