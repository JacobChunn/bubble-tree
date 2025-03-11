"use client"

import { Flex } from "@aws-amplify/ui-react"

export type ColorSwatchType = {
  swatch: string,
  variant?: "small" | "large",
  isSelected?: boolean | null,
} & React.HTMLAttributes<HTMLDivElement>;

export default function ColorSwatch({
  swatch,
  variant = "small",
  isSelected,
  ...props
}: ColorSwatchType) {

  let size: string;
  switch (variant) {
    case "large":
      size = "50px"
      break;
  
    // covers for small being default
    default:
      size = "10px"
      break;
  }

  return (
    <Flex
      backgroundColor={swatch}
      border={isSelected ? "7px solid" : "1px solid"}
      width={size}
      height={size}
      alignSelf="center"
      justifyContent="center"
      {...props}
    />
  )
}