import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  src?: string | null;
  alt: string;
  fallback: string;
  className?: string;
};

export const PropertyImage = ({ src, alt, fallback, className }: Props) => {
  const [currentSrc, setCurrentSrc] = useState(src || fallback);

  useEffect(() => {
    setCurrentSrc(src || fallback);
  }, [src, fallback]);

  return (
    <img
      key={src || fallback}
      src={currentSrc}
      alt={alt}
      className={cn(className)}
      loading="lazy"
      onError={() => {
        if (currentSrc !== fallback) {
          setCurrentSrc(fallback);
        }
      }}
    />
  );
};
