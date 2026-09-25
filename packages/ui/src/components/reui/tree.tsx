"use client"

import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes } from "react"
import { createContext, Fragment, useContext } from "react"
import Add from "@carbon/icons-react/es/Add"
import ChevronDown from "@carbon/icons-react/es/ChevronDown"
import Subtract from "@carbon/icons-react/es/Subtract"
import type { ItemInstance } from "@headless-tree/core"
import { Slot } from "radix-ui"

import { Icon } from "@crm/ui/components/icon"
import { cn } from "@crm/ui/lib/utils"

type ToggleIconType = "chevron" | "plus-minus"

interface TreeContextValue<T = any> {
  indent: number
  currentItem?: ItemInstance<T>
  tree?: any
  toggleIconType?: ToggleIconType
}

const TreeContext = createContext<TreeContextValue>({
  indent: 20,
  currentItem: undefined,
  tree: undefined,
  toggleIconType: "chevron",
})

function useTreeContext<T = any>() {
  return useContext(TreeContext) as TreeContextValue<T>
}

interface TreeProps extends HTMLAttributes<HTMLDivElement> {
  indent?: number
  tree?: any
  toggleIconType?: ToggleIconType
  asChild?: boolean
}

function Tree({
  indent = 20,
  tree,
  className,
  toggleIconType,
  asChild = false,
  ...props
}: TreeProps) {
  const containerProps =
    tree && typeof tree.getContainerProps === "function"
      ? tree.getContainerProps(props["aria-label"])
      : {}
  const mergedProps = { ...props, ...containerProps }
  const { style: propStyle, ...otherProps } = mergedProps
  const mergedStyle = {
    ...propStyle,
    "--tree-indent": `${indent}px`,
  } as CSSProperties

  const Comp = asChild ? Slot.Root : "div"

  return (
    <TreeContext.Provider
      value={{ indent, tree, toggleIconType: toggleIconType ?? "chevron" }}
    >
      <Comp
        data-slot="tree"
        style={mergedStyle}
        className={cn("flex flex-col", className)}
        {...otherProps}
      />
    </TreeContext.Provider>
  )
}

interface TreeItemProps<T = any> extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "indent"
> {
  item: ItemInstance<T>
  indent?: number
  asChild?: boolean
}

function TreeItem<T = any>({
  item,
  className,
  asChild = false,
  children,
  ...props
}: TreeItemProps<T>) {
  const parentContext = useTreeContext<T>()
  const { indent } = parentContext

  const itemProps = typeof item.getProps === "function" ? item.getProps() : {}
  const mergedProps = { ...props, children, ...itemProps }
  const { style: propStyle, ...otherProps } = mergedProps
  const mergedStyle = {
    ...propStyle,
    "--tree-padding": `${item.getItemMeta().level * indent}px`,
  } as CSSProperties

  const defaultProps = {
    "data-slot": "tree-item",
    style: mergedStyle,
    className: cn(
      "z-10 ps-(--tree-padding) text-left outline-hidden select-none not-last:pb-0.5 focus:z-20 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    "data-focus":
      typeof item.isFocused === "function"
        ? item.isFocused() || false
        : undefined,
    "data-folder":
      typeof item.isFolder === "function"
        ? item.isFolder() || false
        : undefined,
    "data-selected":
      typeof item.isSelected === "function"
        ? item.isSelected() || false
        : undefined,
    "data-drag-target":
      typeof item.isDragTarget === "function"
        ? item.isDragTarget() || false
        : undefined,
    "data-search-match":
      typeof item.isMatchingSearch === "function"
        ? item.isMatchingSearch() || false
        : undefined,
    "aria-expanded": item.isFolder() ? item.isExpanded() : undefined,
  }

  const Comp = asChild ? Slot.Root : "button"

  return (
    <TreeContext.Provider value={{ ...parentContext, currentItem: item }}>
      <Comp {...defaultProps} {...otherProps}>
        {children}
      </Comp>
    </TreeContext.Provider>
  )
}

interface TreeItemLabelProps<T = any> extends HTMLAttributes<HTMLSpanElement> {
  item?: ItemInstance<T>
  asChild?: boolean
}

function TreeItemLabel<T = any>({
  item: propItem,
  children,
  className,
  asChild = false,
  ...props
}: TreeItemLabelProps<T>) {
  const { currentItem, toggleIconType } = useTreeContext<T>()
  const item = propItem || currentItem

  if (!item) return null

  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="tree-item-label"
      className={cn(
        "in-focus-visible:ring-ring/50 bg-background hover:bg-accent in-data-[selected=true]:bg-accent in-data-[selected=true]:text-accent-foreground in-data-[drag-target=true]:bg-accent in-data-[search-match=true]:bg-accent flex items-center gap-1 transition-colors not-in-data-[folder=true]:ps-7 in-focus-visible:ring-[3px] [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "rounded-md",
        "py-1.5",
        "px-2",
        "text-sm",
        className
      )}
      {...props}
    >
      <Fragment>
        {item.isFolder() &&
          (toggleIconType === "plus-minus" ? (
            <Icon
              icon={item.isExpanded() ? Subtract : Add}
              className="text-muted-foreground size-3.5"
            />
          ) : (
            <Icon
              icon={ChevronDown}
              className="text-muted-foreground size-4 in-aria-[expanded=false]:-rotate-90"
            />
          ))}
        {children ||
          (typeof item.getItemName === "function" ? item.getItemName() : null)}
      </Fragment>
    </Comp>
  )
}

export { Tree, TreeItem, TreeItemLabel }
