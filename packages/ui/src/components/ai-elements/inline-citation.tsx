"use client";

import ArrowLeft from "@carbon/icons-react/es/ArrowLeft";
import ArrowRight from "@carbon/icons-react/es/ArrowRight";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import type { CarouselApi } from "@crm/ui/components/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@crm/ui/components/carousel";
import { Icon } from "@crm/ui/components/icon";
import { useMessages } from "@crm/ui/components/locale-provider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@crm/ui/components/popover";
import { cn } from "@crm/ui/lib/utils";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import type {
  ComponentProps,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
} from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const DI_CHUOT = { dongSauMs: 150 } as const;

const CACH_MO = { chuot: 1, bam: 2 } as const;

type CachMo = (typeof CACH_MO)[keyof typeof CACH_MO];

type InlineCitationCardContextValue = {
  moBangChuot: () => void;
  henDongChuot: () => void;
  giuMo: () => void;
  ghimNeuDangMoBangChuot: () => boolean;
  moBangChuotLucNay: () => boolean;
  dongTuChuot: () => boolean;
};

const InlineCitationCardContext =
  createContext<InlineCitationCardContextValue | null>(null);

const useInlineCitationCard = () => {
  const context = useContext(InlineCitationCardContext);

  if (!context) {
    throw new Error(
      "InlineCitationCard components must be used within InlineCitationCard"
    );
  }

  return context;
};

const laChuot = (event: PointerEvent) => event.pointerType === "mouse";

export type InlineCitationProps = ComponentProps<"span">;

export const InlineCitation = ({
  className,
  ...props
}: InlineCitationProps) => (
  <span
    className={cn("group inline items-center gap-1", className)}
    {...props}
  />
);

export type InlineCitationTextProps = ComponentProps<"span">;

export const InlineCitationText = ({
  className,
  ...props
}: InlineCitationTextProps) => (
  <span
    className={cn("transition-colors group-hover:bg-accent", className)}
    {...props}
  />
);

export type InlineCitationCardProps = ComponentProps<typeof Popover>;

export const InlineCitationCard = ({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: InlineCitationCardProps) => {
  const [mo, datMo] = useControllableState({
    prop: open,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const cachMo = useRef<CachMo | null>(null);
  const vuaDongTuChuot = useRef(false);
  const henDong = useRef<ReturnType<typeof setTimeout> | null>(null);

  const huyHen = useCallback(() => {
    if (henDong.current) {
      clearTimeout(henDong.current);
      henDong.current = null;
    }
  }, []);

  useEffect(() => huyHen, [huyHen]);

  const doiMo = useCallback(
    (tiep: boolean) => {
      huyHen();
      vuaDongTuChuot.current = false;
      cachMo.current = tiep ? CACH_MO.bam : null;
      datMo(tiep);
    },
    [datMo, huyHen]
  );

  const context = useMemo<InlineCitationCardContextValue>(
    () => ({
      moBangChuot: () => {
        huyHen();
        if (cachMo.current) {
          return;
        }
        vuaDongTuChuot.current = false;
        cachMo.current = CACH_MO.chuot;
        datMo(true);
      },
      henDongChuot: () => {
        if (cachMo.current !== CACH_MO.chuot) {
          return;
        }
        huyHen();
        henDong.current = setTimeout(() => {
          henDong.current = null;
          cachMo.current = null;
          vuaDongTuChuot.current = true;
          datMo(false);
        }, DI_CHUOT.dongSauMs);
      },
      giuMo: huyHen,
      ghimNeuDangMoBangChuot: () => {
        if (cachMo.current !== CACH_MO.chuot) {
          return false;
        }
        huyHen();
        cachMo.current = CACH_MO.bam;
        return true;
      },
      moBangChuotLucNay: () => cachMo.current === CACH_MO.chuot,
      dongTuChuot: () => {
        const vua = vuaDongTuChuot.current;
        vuaDongTuChuot.current = false;
        return vua;
      },
    }),
    [datMo, huyHen]
  );

  return (
    <InlineCitationCardContext.Provider value={context}>
      <Popover onOpenChange={doiMo} open={mo} {...props} />
    </InlineCitationCardContext.Provider>
  );
};

export type InlineCitationCardTriggerProps = ComponentProps<typeof Badge> & {
  nhan: string;
};

export const InlineCitationCardTrigger = ({
  nhan,
  className,
  onClick,
  onKeyDown,
  onKeyUp,
  onPointerEnter,
  onPointerLeave,
  ...props
}: InlineCitationCardTriggerProps) => {
  const the = useInlineCitationCard();

  const handleClick = (event: MouseEvent<HTMLSpanElement>) => {
    onClick?.(event);
    if (the.ghimNeuDangMoBangChuot()) {
      event.preventDefault();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    onKeyDown?.(event);
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (event.key === "Enter" && !event.repeat) {
        event.currentTarget.click();
      }
    }
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLSpanElement>) => {
    onKeyUp?.(event);
    if (event.key === " ") {
      event.preventDefault();
      event.currentTarget.click();
    }
  };

  const handlePointerEnter = (event: PointerEvent<HTMLSpanElement>) => {
    onPointerEnter?.(event);
    if (laChuot(event)) {
      the.moBangChuot();
    }
  };

  const handlePointerLeave = (event: PointerEvent<HTMLSpanElement>) => {
    onPointerLeave?.(event);
    if (laChuot(event)) {
      the.henDongChuot();
    }
  };

  return (
    <PopoverTrigger asChild>
      <Badge
        asChild
        className={cn("ml-1", className)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        variant="secondary"
        {...props}
      >
        <button type="button">{nhan}</button>
      </Badge>
    </PopoverTrigger>
  );
};

export type InlineCitationCardBodyProps = ComponentProps<typeof PopoverContent>;

export const InlineCitationCardBody = ({
  onOpenAutoFocus,
  onCloseAutoFocus,
  onPointerEnter,
  onPointerLeave,
  ...props
}: InlineCitationCardBodyProps) => {
  const the = useInlineCitationCard();

  return (
    <PopoverContent
      onCloseAutoFocus={(event) => {
        onCloseAutoFocus?.(event);
        if (the.dongTuChuot()) {
          event.preventDefault();
        }
      }}
      onOpenAutoFocus={(event) => {
        onOpenAutoFocus?.(event);
        if (the.moBangChuotLucNay()) {
          event.preventDefault();
        }
      }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (laChuot(event)) {
          the.giuMo();
        }
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        if (laChuot(event)) {
          the.henDongChuot();
        }
      }}
      size="panel"
      {...props}
    />
  );
};

const CarouselApiContext = createContext<CarouselApi | undefined>(undefined);

const useCarouselApi = () => {
  const context = useContext(CarouselApiContext);
  return context;
};

export type InlineCitationCarouselProps = ComponentProps<typeof Carousel>;

export const InlineCitationCarousel = ({
  className,
  children,
  ...props
}: InlineCitationCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();

  return (
    <CarouselApiContext.Provider value={api}>
      <Carousel className={cn("w-full", className)} setApi={setApi} {...props}>
        {children}
      </Carousel>
    </CarouselApiContext.Provider>
  );
};

export type InlineCitationCarouselContentProps = ComponentProps<"div">;

export const InlineCitationCarouselContent = (
  props: InlineCitationCarouselContentProps
) => <CarouselContent {...props} />;

export type InlineCitationCarouselItemProps = ComponentProps<"div">;

export const InlineCitationCarouselItem = ({
  className,
  ...props
}: InlineCitationCarouselItemProps) => (
  <CarouselItem
    className={cn("w-full space-y-2 p-4 pl-8", className)}
    {...props}
  />
);

export type InlineCitationCarouselHeaderProps = ComponentProps<"div">;

export const InlineCitationCarouselHeader = ({
  className,
  ...props
}: InlineCitationCarouselHeaderProps) => (
  <div
    className={cn(
      "flex items-center justify-between gap-2 rounded-t-md bg-secondary p-2",
      className
    )}
    {...props}
  />
);

export type InlineCitationCarouselIndexProps = ComponentProps<"div">;

export const InlineCitationCarouselIndex = ({
  children,
  className,
  ...props
}: InlineCitationCarouselIndexProps) => {
  const api = useCarouselApi();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const syncState = useCallback(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
  }, [api]);

  useEffect(() => {
    if (!api) {
      return;
    }

    syncState();

    api.on("select", syncState);

    return () => {
      api.off("select", syncState);
    };
  }, [api, syncState]);

  return (
    <div
      className={cn(
        "flex flex-1 items-center justify-end px-3 py-1 text-muted-foreground text-xs",
        className
      )}
      {...props}
    >
      {children ?? `${current}/${count}`}
    </div>
  );
};

export type InlineCitationCarouselPrevProps = ComponentProps<typeof Button>;

export const InlineCitationCarouselPrev = (
  props: InlineCitationCarouselPrevProps
) => {
  const msg = useMessages();
  const api = useCarouselApi();

  const handleClick = useCallback(() => {
    if (api) {
      api.scrollPrev();
    }
  }, [api]);

  return (
    <Button
      aria-label={msg.inlineCitation.previousSource}
      onClick={handleClick}
      size="icon-sm"
      type="button"
      variant="ghost"
      {...props}
    >
      <Icon icon={ArrowLeft} />
    </Button>
  );
};

export type InlineCitationCarouselNextProps = ComponentProps<typeof Button>;

export const InlineCitationCarouselNext = (
  props: InlineCitationCarouselNextProps
) => {
  const msg = useMessages();
  const api = useCarouselApi();

  const handleClick = useCallback(() => {
    if (api) {
      api.scrollNext();
    }
  }, [api]);

  return (
    <Button
      aria-label={msg.inlineCitation.nextSource}
      onClick={handleClick}
      size="icon-sm"
      type="button"
      variant="ghost"
      {...props}
    >
      <Icon icon={ArrowRight} />
    </Button>
  );
};

export type InlineCitationSourceProps = ComponentProps<"div"> & {
  title?: string;
  url?: string;
  description?: string;
};

export const InlineCitationSource = ({
  title,
  url,
  description,
  className,
  children,
  ...props
}: InlineCitationSourceProps) => (
  <div className={cn("space-y-1", className)} {...props}>
    {title && (
      <h4 className="truncate font-medium text-sm leading-tight">{title}</h4>
    )}
    {url && (
      <p className="truncate break-all text-muted-foreground text-xs">{url}</p>
    )}
    {description && (
      <p className="line-clamp-3 text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    )}
    {children}
  </div>
);

export type InlineCitationQuoteProps = ComponentProps<"blockquote">;

export const InlineCitationQuote = ({
  children,
  className,
  ...props
}: InlineCitationQuoteProps) => (
  <blockquote
    className={cn(
      "border-muted border-l-2 pl-3 text-muted-foreground text-sm italic",
      className
    )}
    {...props}
  >
    {children}
  </blockquote>
);
