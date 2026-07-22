import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/goetsu.png";
const LOGO_ALT = "Goetsusioji 吳語小字";

type SiteLogoProps = {
  size?: number;
  linked?: boolean;
  className?: string;
  priority?: boolean;
};

export function SiteLogo({
  size = 64,
  linked = false,
  className = "rounded-sm",
  priority = false,
}: SiteLogoProps) {
  const image = (
    <Image
      src={LOGO_SRC}
      alt={LOGO_ALT}
      width={size}
      height={Math.round((size * 1100) / 1470)}
      className={className}
      priority={priority}
    />
  );

  if (linked) {
    return (
      <Link href="/" className="inline-block shrink-0">
        {image}
      </Link>
    );
  }

  return image;
}

export const siteLogoOpenGraphImage = {
  url: LOGO_SRC,
  width: 1470,
  height: 1100,
  alt: LOGO_ALT,
} as const;
