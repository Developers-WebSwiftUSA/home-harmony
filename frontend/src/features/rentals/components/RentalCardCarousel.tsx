import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  alt: string;
  className?: string;
};

export const RentalCardCarousel = ({ images, alt, className }: Props) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      emblaApi?.scrollPrev();
    },
    [emblaApi]
  );

  const scrollNext = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      emblaApi?.scrollNext();
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (images.length <= 1) {
    return (
      <img
        src={images[0]}
        alt={alt}
        className={cn("w-full h-full object-cover group-hover:scale-105 transition-transform duration-500", className)}
        loading="lazy"
      />
    );
  }

  return (
    <div className={cn("relative h-full", className)}>
      <div ref={emblaRef} className="overflow-hidden h-full">
        <div className="flex h-full">
          {images.map((image, index) => (
            <div key={index} className="min-w-0 flex-[0_0_100%] h-full">
              <img
                src={image}
                alt={`${alt} ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
      <Button
        type="button"
        size="icon"
        variant="secondary"
        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={scrollPrev}
        aria-label="Previous photo"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="secondary"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={scrollNext}
        aria-label="Next photo"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {images.map((_, index) => (
          <span
            key={index}
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              index === selectedIndex ? "bg-primary" : "bg-background/70"
            )}
          />
        ))}
      </div>
    </div>
  );
};
