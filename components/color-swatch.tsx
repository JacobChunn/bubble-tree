"use client"

import { Flex } from "@aws-amplify/ui-react"

export type ColorSwatchType = {
  r: number,
  g: number,
  b: number,
  size?: "small" | "large",
}

export default function ColorSwatch(colorSwatch: ColorSwatchType) {

  let size: string;
  switch (colorSwatch.size) {
    case "large":
      size = "100px"
      break;
  
    // covers for small being default
    default:
      size = "10px"
      break;
  }

  return (
    <Flex
      backgroundColor={`rgb(${colorSwatch.r},${colorSwatch.g},${colorSwatch.b})`}
      width={size}
      height={size}
      alignSelf="center"
    />
  )
}