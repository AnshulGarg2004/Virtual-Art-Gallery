"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType, EmblaCarouselType } from "embla-carousel";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type CarouselContextProps = {
  carouselRef: (node: HTMLElement | null) => void;
  api: EmblaCarouselType | undefined;
  orientation: "horizontal" | "vertical";
};

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

export function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within <Carousel />");
  }
  return context;
}

export type CarouselApi = EmblaCarouselType;

type CarouselProps = {
  opts?: EmblaOptionsType;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: EmblaCarouselType) => void;
} & React.HTMLAttributes<HTMLDivElement>;

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        axis: orientation === "horizontal" ? "x" : "y",
        ...opts,
      },
      [],
    );

    React.useEffect(() => {
      if (api && setApi) {
        setApi(api);
      }
    }, [api, setApi]);

    return (
      <CarouselContext.Provider value={{ carouselRef, api, orientation }}>
        <div
          ref={ref}
          className={cn(
            "relative",
            orientation === "horizontal" ? "w-full" : "h-full",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  },
);
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();
  return (
    <div ref={carouselRef}>
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className,
        )}
        {...props}
      />
    </div>
  );
});
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();
  return (
    <div
      ref={ref}
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className,
      )}
      {...props}
    />
  );
});
CarouselItem.displayName = "CarouselItem";

type CarouselButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const CarouselPrevious = React.forwardRef<HTMLButtonElement, CarouselButtonProps>(
  ({ className, ...props }, ref) => {
    const { api } = useCarousel();
    return (
      <button
        ref={ref}
        onClick={() => api?.scrollPrev()}
        className={cn(
          "absolute left-5 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white shadow-lg transition hover:border-white/60 hover:bg-black/80",
          className,
        )}
        {...props}
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
    );
  },
);
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef<HTMLButtonElement, CarouselButtonProps>(
  ({ className, ...props }, ref) => {
    const { api } = useCarousel();
    return (
      <button
        ref={ref}
        onClick={() => api?.scrollNext()}
        className={cn(
          "absolute right-5 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white shadow-lg transition hover:border-white/60 hover:bg-black/80",
          className,
        )}
        {...props}
      >
        <ArrowRight className="h-5 w-5" />
      </button>
    );
  },
);
CarouselNext.displayName = "CarouselNext";

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
};
