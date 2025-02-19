import { Button, Flex } from "@aws-amplify/ui-react";
import Link from "next/link";
import { ComponentProps } from "react";
import { UrlObject } from "url";

type ButtonProps = ComponentProps<typeof Button>

interface MenuItemProps extends ButtonProps {
  children: React.ReactNode;
  href: string | UrlObject;

}

export default function MenuItem({
  children,
  href,
  ...props
}: MenuItemProps) {
  return (
    <Link href={href}>
      <Button className="menu-item" tabIndex={0} {...props}>
        {children}
      </Button>
    </Link>
  )
}