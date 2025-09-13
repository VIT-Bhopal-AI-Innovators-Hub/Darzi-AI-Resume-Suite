import { cn } from "../lib/utils";
import Image from "next/image";
import Link from "next/link";

export const Logo = ({
  className,
}: {
  className?: string;
  uniColor?: boolean;
}) => {
  return (
    <Link href="/" className="select-none">
      <Image
        src="/logo.png"
        alt="Logo"
        className={cn("h-8   w-auto", className)}
        width={48}
        height={48}
      />
    </Link>
  );
};

export const LogoFull = ({
  className,
}: {
  className?: string;
  uniColor?: boolean;
}) => {
  return (
    <Link href="/" className="flex items-center space-x-2 select-none">
      <Image
        src="/logo-full.png"
        alt="Logo"
        className={cn("h-8 w-auto", className)}
        width={72}
        height={72}
      />
    </Link>
  );
};
