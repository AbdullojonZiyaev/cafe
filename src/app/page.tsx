"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent, type UIEvent } from "react";

type Dish = {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  tag: string;
  video?: string;
  fallbackVideo?: string;
  poster?: string;
  tintBackground?: string;
  description?: string;
  weight?: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  allergens?: string[];
};

type Category = {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
  dishCount: number;
};

type Restaurant = {
  slug: string;
  name: string;
  welcomeText: string;
  themeColor?: string;
  workMode: WorkMode;
  currency: string;
  logoUrl?: string;
};

type ApiMenuResponse = {
  restaurant: {
    slug: string;
    name: string;
    welcome_text?: string;
    theme_color?: string;
    work_mode?: WorkMode;
    currency?: string;
    logo_url?: string | null;
  };
  categories: Array<{
    id: string;
    name: string;
    icon?: string;
    sort_order?: number;
    dish_count?: number;
  }>;
  dishes: Array<{
    id: string;
    category_id: string;
    name: string;
    price: number;
    tag?: string;
    description?: string;
    weight?: string;
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
    allergens?: string[];
    tint?: string;
    video_url?: string;
    fallback_video_url?: string;
    poster_url?: string;
    sort_order?: number;
  }>;
};

type CartItem = {
  name: string;
  price: number;
  quantity: number;
};

type WorkMode = "menu" | "table";

type ModalState = {
  isOpen: boolean;
  dish: Dish | null;
};

const DISH_DURATION_MS = 6500;
const DEFAULT_MENU_SLUG = "demo";
const MEDIA_BASE_URL = "https://wc.nets.tj";
const PLACEHOLDER_VIDEO_URL = "/public]/media/story-1-mobile.mp4";

const normalizeAssetUrl = (url?: string | null) => {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${MEDIA_BASE_URL}${url}`;
  return `${MEDIA_BASE_URL}/${url}`;
};

const parseTintBackground = (tint?: string) => {
  if (!tint) return undefined;
  const bracketMatch = tint.match(/^bg-\[(.*)\]$/);
  return (bracketMatch?.[1] || tint).replaceAll("_", " ");
};

const normalizeMenuPrice = (rawPrice: number) => {
  if (rawPrice >= 1000) return rawPrice / 100;
  return rawPrice;
};

export default function Home() {
  const [activeDishIndex, setActiveDishIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [modal, setModal] = useState<ModalState>({ isOpen: false, dish: null });
  const [notification, setNotification] = useState<{ isVisible: boolean; message: string }>({ isVisible: false, message: "" });
  const [workMode, setWorkMode] = useState<WorkMode>("menu");
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [videoSource, setVideoSource] = useState<"primary" | "fallback">("primary");
  const [isVideoUnavailable, setIsVideoUnavailable] = useState(false);
const [isPosterUnavailable, setIsPosterUnavailable] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isHoldingRef = useRef(false);
  const holdTimerRef = useRef<number | null>(null);
  const holdTriggeredRef = useRef(false);
  const swipeStartX = useRef(0);
  const swipeStartY = useRef(0);
  const catContainerRef = useRef<HTMLDivElement | null>(null);
  const isWrappingCategoriesRef = useRef(false);
  const categorySnapRestoreRef = useRef<number | null>(null);
  const loopedCategories = [...categories, ...categories, ...categories];
  const currentDish = dishes[activeDishIndex];

  const selectedVideoUrl =
  videoSource === "primary"
    ? currentDish?.video || currentDish?.fallbackVideo
    : currentDish?.fallbackVideo;
const hasPlayableVideo = Boolean(selectedVideoUrl) && !isVideoUnavailable;
const hasPosterFallback = !hasPlayableVideo && Boolean(currentDish?.poster) && !isPosterUnavailable;
const showVideoUnavailable = !hasPlayableVideo && !hasPosterFallback;  
const currency = restaurant?.currency || "сомони";
  const restaurantName = restaurant?.name || "Restaurant";
  const welcomeText = restaurant?.welcomeText || "Welcome";
  const logoSrc = restaurant?.logoUrl || "/logo.svg";

  const formatPrice = (price: number) => `${new Intl.NumberFormat("ru-RU").format(price)} ${currency}`;

  useEffect(() => {
    let cancelled = false;

    const loadMenu = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const slug = process.env.NEXT_PUBLIC_MENU_SLUG || DEFAULT_MENU_SLUG;
        const response = await fetch(`/api/menu?slug=${encodeURIComponent(slug)}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Failed to load menu: ${response.status}`);
        }

        const payload = (await response.json()) as ApiMenuResponse;
        if (cancelled) return;

        const mappedRestaurant: Restaurant = {
          slug: payload.restaurant.slug,
          name: payload.restaurant.name,
          welcomeText: payload.restaurant.welcome_text || "Welcome",
          themeColor: payload.restaurant.theme_color,
          workMode: payload.restaurant.work_mode || "menu",
          currency: payload.restaurant.currency || "сомони",
          logoUrl: normalizeAssetUrl(payload.restaurant.logo_url || undefined),
        };

        const mappedCategories = [...payload.categories]
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          .map((category) => ({
            id: category.id,
            name: category.name,
            icon: category.icon || "🍽️",
            sortOrder: category.sort_order || 0,
            dishCount: category.dish_count || 0,
          }));

        const mappedDishes = [...payload.dishes]
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          .map((dish) => ({
            id: dish.id,
            categoryId: dish.category_id,
            name: dish.name,
            price: normalizeMenuPrice(dish.price),
            tag: dish.tag || "Рекомендуем",
            video: normalizeAssetUrl(dish.video_url),
            fallbackVideo: normalizeAssetUrl(dish.fallback_video_url),
            poster: normalizeAssetUrl(dish.poster_url),
            tintBackground: parseTintBackground(dish.tint),
            description: dish.description,
            weight: dish.weight,
            calories: dish.calories,
            protein: dish.protein,
            fat: dish.fat,
            carbs: dish.carbs,
            allergens: dish.allergens || [],
          }));

        setRestaurant(mappedRestaurant);
        setWorkMode(mappedRestaurant.workMode);
        setCategories(mappedCategories);
        setDishes(mappedDishes);
        setActiveDishIndex(0);
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "Failed to load menu";
        setLoadError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadMenu();

    return () => {
      cancelled = true;
    };
  }, []);

  const playbackDishIndexes = useMemo(
    () =>
      categories.flatMap((cat) =>
        dishes
          .map((dish, index) => ({ dish, index }))
          .filter(({ dish }) => dish.categoryId === cat.id)
          .map(({ index }) => index)
      ),
    [categories, dishes]
  );

  const getNextDishIndex = useCallback(
    (fromIndex: number) => {
      const currentPlaybackIndex = playbackDishIndexes.indexOf(fromIndex);
      if (currentPlaybackIndex === -1) return playbackDishIndexes[0] ?? 0;
      return playbackDishIndexes[(currentPlaybackIndex + 1) % playbackDishIndexes.length] ?? fromIndex;
    },
    [playbackDishIndexes]
  );

  const getPrevDishIndex = useCallback(
    (fromIndex: number) => {
      const currentPlaybackIndex = playbackDishIndexes.indexOf(fromIndex);
      if (currentPlaybackIndex === -1) return playbackDishIndexes[0] ?? 0;
      return (
        playbackDishIndexes[(currentPlaybackIndex - 1 + playbackDishIndexes.length) % playbackDishIndexes.length] ??
        fromIndex
      );
    },
    [playbackDishIndexes]
  );

  const categoryDishes = dishes.filter((d) => d.categoryId === currentDish?.categoryId);
  const dishIndexInCategory = categoryDishes.findIndex((d) => d.id === currentDish?.id);
  const isEffectivelyPaused = isHolding || isWelcomeOpen;

  const cartSummary = useMemo(() => {
    const items = Object.entries(cart).map(([key, item]) => ({
      key,
      ...item,
      total: item.price * item.quantity,
    }));
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.total, 0);
    return { items, totalItems, totalPrice };
  }, [cart]);

  useEffect(() => {
    isHoldingRef.current = isHolding;
  }, [isHolding]);

  // Auto-advance through dishes
  useEffect(() => {
    if (!currentDish) return;

    if (isEffectivelyPaused) return;
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const percent = Math.min((elapsed / DISH_DURATION_MS) * 100, 100);
      setProgress(percent);
      if (percent >= 100) {
        setProgress(0);
        setVideoSource("primary");
        setIsVideoUnavailable(false);
        setActiveDishIndex((current) => getNextDishIndex(current));
      }
    }, 70);
    return () => window.clearInterval(timer);
  }, [activeDishIndex, isEffectivelyPaused, currentDish, getNextDishIndex]);

  // Video playback control
  useEffect(() => {
    if (!currentDish) return;

    const video = videoRef.current;
    if (!video) return;
    if (isEffectivelyPaused) {
      video.pause();
      return;
    }
    const playPromise = video.play();
    if (playPromise instanceof Promise) {
      playPromise.catch(() => {});
    }
  }, [activeDishIndex, isEffectivelyPaused, currentDish]);

  // Clear stale unavailable state whenever the source changes.
useEffect(() => {
  setIsVideoUnavailable(false);
  setIsPosterUnavailable(false);
}, [currentDish?.id]);
  // Preload next dish video
  useEffect(() => {
    if (!currentDish) return;

    const nextDish = dishes[getNextDishIndex(activeDishIndex)];
    if (!nextDish) return;

    const candidateUrls = [nextDish.video, nextDish.fallbackVideo].filter((href): href is string => Boolean(href));
    const links = candidateUrls.map((href) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "video";
      link.href = href;
      document.head.appendChild(link);
      return link;
    });
    return () => {
      links.forEach((link) => {
        if (document.head.contains(link)) document.head.removeChild(link);
      });
    };
  }, [activeDishIndex, currentDish, dishes, getNextDishIndex]);

  // Hold timer cleanup
  useEffect(() => {
    return () => {
      if (holdTimerRef.current !== null) window.clearTimeout(holdTimerRef.current);
    };
  }, []);

  // Scroll active category card into view when category changes
  useEffect(() => {
    const container = catContainerRef.current;
    if (!container || !currentDish) return;
    const activeCatId = currentDish.categoryId;
    const activeCards = Array.from(
      container.querySelectorAll<HTMLButtonElement>(`[data-cat-id="${activeCatId}"]`)
    );
    if (activeCards.length === 0) return;

    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    const targetCard = activeCards.reduce((closest, card) => {
      const closestCenter = closest.offsetLeft + closest.offsetWidth / 2;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const closestDistance = Math.abs(closestCenter - containerCenter);
      const cardDistance = Math.abs(cardCenter - containerCenter);
      return cardDistance < closestDistance ? card : closest;
    });

    targetCard.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [currentDish]);

  // Start in the middle copy so users can swipe both directions endlessly.
  useEffect(() => {
    const container = catContainerRef.current;
    if (!container) return;
    requestAnimationFrame(() => {
      container.scrollLeft = container.scrollWidth / 3;
    });

    return () => {
      if (categorySnapRestoreRef.current !== null) {
        window.cancelAnimationFrame(categorySnapRestoreRef.current);
      }
    };
  }, []);

  // Secret admin shortcut Ctrl+Alt+T
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key === "t") {
        event.preventDefault();
        setShowAdminPanel((prev) => !prev);
      }
      if (event.key === "Escape" && isWelcomeOpen) {
        setIsWelcomeOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isWelcomeOpen]);

  const addToCart = (dish: Dish) => {
    setCart((prev) => {
      const key = dish.id;
      const existing = prev[key];
      if (existing) {
        return { ...prev, [key]: { ...existing, quantity: existing.quantity + 1 } };
      }
      return { ...prev, [key]: { name: dish.name, price: dish.price, quantity: 1 } };
    });
  };

  const removeFromCart = (key: string) => {
    setCart((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const enterKioskMode = async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) await elem.requestFullscreen();
    } catch (err) {
      console.warn("Kiosk mode not supported:", err);
    }
  };

  const exitKioskMode = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch (err) {
      console.warn("Could not exit fullscreen:", err);
    }
  };

  const openModal = (dish: Dish) => setModal({ isOpen: true, dish });
  const closeModal = () => setModal({ isOpen: false, dish: null });

  const submitOrder = () => {
    const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems === 0) {
      setNotification({ isVisible: true, message: "Корзина пуста. Добавьте блюда для заказа." });
      setTimeout(() => setNotification({ isVisible: false, message: "" }), 3000);
      return;
    }
    setNotification({ isVisible: true, message: "Ваш заказ принят! Официант скоро подойдет." });
    setTimeout(() => {
      setCart({});
      setIsCartOpen(false);
      setNotification({ isVisible: false, message: "" });
    }, 2500);
  };

  const toggleWorkMode = () => setWorkMode((prev) => (prev === "menu" ? "table" : "menu"));

  const resetVideoState = () => {
    setVideoSource("primary");
    setIsVideoUnavailable(false);
  };

  const goNext = () => {
    if (playbackDishIndexes.length === 0) return;
    resetVideoState();
    setProgress(0);
    setActiveDishIndex((current) => getNextDishIndex(current));
  };

  const goPrev = () => {
    if (playbackDishIndexes.length === 0) return;
    resetVideoState();
    setProgress(0);
    setActiveDishIndex((current) => getPrevDishIndex(current));
  };

  const startHoldPause = (pointerType: string) => {
    if (pointerType !== "touch" && pointerType !== "pen") return;
    if (holdTimerRef.current !== null) window.clearTimeout(holdTimerRef.current);
    holdTriggeredRef.current = false;
    holdTimerRef.current = window.setTimeout(() => {
      holdTriggeredRef.current = true;
      setIsHolding(true);
    }, 180);
  };

  const stopHoldPause = () => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHolding(false);
  };

  const shouldIgnoreHoldClick = () => {
    if (!holdTriggeredRef.current) return false;
    holdTriggeredRef.current = false;
    return true;
  };

  const handlePrevTap = () => {
    if (shouldIgnoreHoldClick()) return;
    goPrev();
  };

  const handleNextTap = () => {
    if (shouldIgnoreHoldClick()) return;
    goNext();
  };

  const handleSwipeStart = (e: TouchEvent) => {
    swipeStartX.current = e.touches[0]?.clientX || 0;
    swipeStartY.current = e.touches[0]?.clientY || 0;
  };

  const handleSwipeEnd = (e: TouchEvent) => {
    if (!currentDish) return;

    const endX = e.changedTouches[0]?.clientX || 0;
    const endY = e.changedTouches[0]?.clientY || 0;
    const deltaX = endX - swipeStartX.current;
    const deltaY = endY - swipeStartY.current;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > absDeltaY && absDeltaX > 50) {
      if (deltaX > 0) goPrev();
      else goNext();
    } else if (absDeltaY > absDeltaX && absDeltaY > 60 && deltaY < 0) {
      openModal(currentDish);
    }
  };

  const handleCatSwipeStart = (e: TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleCatSwipeEnd = (e: TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleCategoryScroll = (e: UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const segmentWidth = container.scrollWidth / 3;
    if (segmentWidth === 0 || isWrappingCategoriesRef.current) return;

    const minMiddle = segmentWidth;
    const maxMiddle = segmentWidth * 2;
    const currentLeft = container.scrollLeft;

    if (currentLeft >= minMiddle && currentLeft <= maxMiddle) return;

    isWrappingCategoriesRef.current = true;
    const relativeOffset = ((currentLeft % segmentWidth) + segmentWidth) % segmentWidth;

    container.style.scrollSnapType = "none";
    container.scrollLeft = minMiddle + relativeOffset;

    categorySnapRestoreRef.current = window.requestAnimationFrame(() => {
      container.style.scrollSnapType = "x mandatory";
      isWrappingCategoriesRef.current = false;
      categorySnapRestoreRef.current = null;
    });
  };

  const jumpToCategory = (categoryId: string) => {
    const idx = dishes.findIndex((d) => d.categoryId === categoryId);
    if (idx !== -1) {
      resetVideoState();
      setActiveDishIndex(idx);
      setProgress(0);
    }
  };

  const handleVideoError = () => {
    if (!currentDish) {
      setIsVideoUnavailable(true);
      return;
    }

    if (videoSource === "primary" && currentDish.fallbackVideo && currentDish.fallbackVideo !== currentDish.video) {
      setVideoSource("fallback");
      return;
    }

    setIsVideoUnavailable(true);
  };

  if (isLoading) {
    return (
      <main className="relative h-dvh w-full overflow-hidden bg-[var(--palette-black)] text-[var(--palette-white)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(192,243,54,0.16)] via-[rgba(63,68,68,0.92)] to-[rgba(0,0,0,1)]" />
        <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[rgba(255,255,255,0.7)]">Loading menu...</p>
        </div>
      </main>
    );
  }

  if (!currentDish) {
    return (
      <main className="relative h-dvh w-full overflow-hidden bg-[var(--palette-black)] text-[var(--palette-white)]">
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-xl font-bold text-[var(--palette-white)]">Menu is unavailable</h1>
          <p className="max-w-sm text-sm text-[rgba(255,255,255,0.7)]">
            {loadError || "No dishes were returned by the API."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative h-dvh w-full overflow-hidden bg-[var(--palette-black)] text-[var(--palette-white)]"
      onPointerDown={(event) => startHoldPause(event.pointerType)}
      onPointerUp={stopHoldPause}
      onPointerCancel={stopHoldPause}
      onPointerLeave={stopHoldPause}
      onTouchStart={handleSwipeStart}
      onTouchEnd={handleSwipeEnd}
    >
      {isWelcomeOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(0,0,0,0.74)] p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-in fade-in rounded-3xl border border-[rgba(255,255,0,0.45)] bg-[rgba(63,68,68,0.92)] px-6 py-7 text-center text-[var(--palette-white)] shadow-2xl">
            <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,0,0.5)] bg-[rgba(0,0,0,0.45)] px-3 py-1.5">
              <img src={logoSrc} alt="Restaurant logo" className="h-6 w-6 rounded-full bg-[var(--palette-white)] object-cover" />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--palette-yellow)]">
                {restaurantName}
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(255,255,0,0.85)]">Welcome</p>
            <h2 className="mt-3 text-2xl font-bold leading-tight">{welcomeText}</h2>
            <p className="mt-3 text-sm text-[rgba(255,245,0,0.8)]">Tap continue to start browsing the menu.</p>
            <button
              type="button"
              onClick={() => setIsWelcomeOpen(false)}
              className="mt-6 w-full rounded-2xl bg-[var(--palette-yellow)] py-3 text-sm font-bold uppercase tracking-wide text-[var(--palette-black)] transition hover:bg-[var(--palette-yellow-soft)] active:scale-[0.98]"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Full-screen background video */}
{hasPlayableVideo && (
  <video
    ref={videoRef}
    key={`${selectedVideoUrl}-${videoSource}-${currentDish.id}`}
    className="absolute inset-0 h-full w-full object-cover"
    autoPlay
    muted
    playsInline
    preload="auto"
    poster={currentDish.poster}
    src={selectedVideoUrl}
    onLoadedData={() => setIsVideoUnavailable(false)}
    onError={handleVideoError}
    onEnded={goNext}
  />
)}

{hasPosterFallback && (
  <img
    src={currentDish.poster}
    alt={currentDish.name}
    className="absolute inset-0 h-full w-full object-cover"
    onError={() => setIsPosterUnavailable(true)}
  />
)}

{showVideoUnavailable && (
  <div className="absolute inset-0 z-10 flex items-center justify-center bg-[rgba(0,0,0,0.45)] px-6 text-center">
    <div className="max-w-md rounded-2xl border border-[rgba(255,255,0,0.45)] bg-[rgba(63,68,68,0.82)] px-5 py-4 backdrop-blur-sm">
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--palette-yellow)]">Video unavailable</p>
      <p className="mt-2 text-sm text-[rgba(255,255,255,0.92)]">Video is not provided by the owner</p>
    </div>
  </div>
)}
      {/* Color tint overlay */}
      <div className="absolute inset-0" style={currentDish.tintBackground ? { backgroundImage: currentDish.tintBackground } : undefined} />
      {/* Gradient: dark top for readability → clear middle → dark bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.78)] via-[rgba(63,68,68,0.22)] via-45% to-[rgba(0,0,0,0.9)]" />

      {/* Persistent logo watermark */}
      <div className="pointer-events-none absolute right-4 top-16 z-25 sm:right-7 sm:top-20">
        <div className="rounded-full border border-[rgba(255,255,0,0.35)] bg-[rgba(0,0,0,0.28)] p-1.5 backdrop-blur-[1.5px]">
          <img
            src={logoSrc}
            alt={`${restaurantName} watermark`}
            className="h-9 w-9 rounded-full object-cover opacity-[0.85] saturate-0 sm:h-18 sm:w-18"
          />
        </div>
      </div>

      {/* Invisible tap zones — middle only so they don't block top/bottom UI */}
      <button
        type="button"
        className="absolute left-0 z-20 h-[40%] w-1/2 cursor-pointer"
        style={{ top: "22%" }}
        onClick={handlePrevTap}
        aria-label="Предыдущее блюдо"
      />
      <button
        type="button"
        className="absolute right-0 z-20 h-[40%] w-1/2 cursor-pointer"
        style={{ top: "22%" }}
        onClick={handleNextTap}
        aria-label="Следующее блюдо"
      />

      {/* ─── TOP: Progress + Dish name + Info ─────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-30 px-5 pt-4 sm:px-7">
        {/* Progress bars */}
        <div className="flex gap-1.5 fade-in-up">
          {categoryDishes.map((d, idx) => (
            <span
              key={d.id}
              className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-[rgba(134,134,134,0.4)]"
            >
              <span
                className={`absolute inset-y-0 left-0 rounded-full bg-[var(--palette-yellow)] ${
                  idx === dishIndexInCategory ? "story-progress-active" : ""
                }`}
                style={{
                  width:
                    idx < dishIndexInCategory
                      ? "100%"
                      : idx === dishIndexInCategory
                        ? `${progress}%`
                        : "0%",
                }}
              />
            </span>
          ))}
        </div>

        {/* Tag + Dish name + price */}
        <div key={currentDish.id} className="mt-5 fade-in-up">
          <span className="inline-block rounded-full border border-[rgba(255,255,0,0.35)] bg-[rgba(0,0,0,0.45)] px-3 py-0.5 text-[10px] font-bold tracking-[0.22em] text-[rgba(255,255,255,0.82)] uppercase backdrop-blur-sm">
            {currentDish.tag}
          </span>
          <div className="mt-2 flex flex-col gap-3">
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-white drop-shadow-lg sm:text-4xl">
              {currentDish.name}
            </h1>
            <span className="mt-1 flex-shrink-0 text-2xl font-bold text-[var(--palette-yellow-soft)] drop-shadow sm:text-3xl">
              {formatPrice(currentDish.price)}
            </span>
          </div>
        </div>
      </div>

      {/* ─── BOTTOM: Price + CTA + Category nav ───────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 px-5 pb-6 sm:px-7">
        {/* CTA row */}
        <div key={`cta-${currentDish.id}`} className="mb-4 flex items-center gap-3 fade-in-up">
          <button
            type="button"
            onClick={() => openModal(currentDish)}
            className="rounded-2xl border border-[rgba(60,207,187,0.55)] bg-[rgba(63,68,68,0.5)] px-4 py-3 text-xs font-bold uppercase tracking-wide text-[var(--palette-white)] backdrop-blur-sm transition hover:bg-[rgba(60,207,187,0.25)] active:scale-95"
          >
            Подробнее
          </button>
          <button
            type="button"
            onClick={() => addToCart(currentDish)}
            className="flex-1 rounded-2xl bg-[var(--palette-yellow)] py-3 text-sm font-bold uppercase tracking-wide text-[var(--palette-black)] shadow-lg transition hover:bg-[var(--palette-yellow-soft)] active:scale-[0.97]"
          >
            Выбрать
          </button>
        </div>

        {/* Category card gallery — carousel with center focus */}
        <div
          ref={catContainerRef}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 no-scrollbar"
          style={{ perspective: "1200px" }}
          onTouchStart={handleCatSwipeStart}
          onTouchEnd={handleCatSwipeEnd}
          onScroll={handleCategoryScroll}
        >
          {loopedCategories.map((cat, index) => {
            const isActive = cat.id === currentDish.categoryId;
            const count = cat.dishCount || dishes.filter((d) => d.categoryId === cat.id).length;
            return (
              <button
                key={`${cat.id}-${index}`}
                data-cat-id={cat.id}
                type="button"
                onClick={() => jumpToCategory(cat.id)}
                className={`flex flex-shrink-0 snap-center w-[45%] sm:w-[38%] flex-col items-center justify-center gap-1.5 rounded-2xl border backdrop-blur-md transition-all duration-300 ${
                  isActive
                    ? "border-[rgba(255,255,0,0.75)] bg-[rgba(255,255,0,0.18)] text-[var(--palette-yellow)] shadow-[0_0_30px_rgba(255,255,0,0.3)] py-4"
                    : "border-[rgba(134,134,134,0.45)] bg-[rgba(63,68,68,0.55)] text-[rgba(255,255,255,0.62)] py-4 opacity-60"
                }`}
                style={{
                  transform: isActive ? "scale(1) translateZ(0)" : "scale(1) translateZ(0)",
                  transformStyle: "preserve-3d",
                }}
              >
                <span className="text-3xl leading-none transition-all duration-300">
                  {cat.icon}
                </span>
                <span className={`mt-1 text-sm tracking-wide transition-all duration-300 ${isActive ? "font-bold" : "font-semibold"}`}>
                  {cat.name}
                </span>
                <span className={`text-[10px] transition-all duration-300 ${isActive ? "mt-1 text-[rgba(255,245,0,0.72)]" : "mt-1 text-[rgba(134,134,134,0.95)]"}`}>
                  {count} блюда
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── CART FAB ───────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--palette-yellow)] shadow-2xl transition hover:bg-[var(--palette-yellow-soft)] active:scale-95"
        aria-label="Открыть корзину"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgb(0, 0, 0)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        {cartSummary.totalItems > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--palette-teal)] px-1 text-[11px] font-bold text-[var(--palette-black)]">
            {cartSummary.totalItems}
          </span>
        )}
      </button>

      {/* ─── CART BOTTOM SHEET ──────────────────────────────── */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end"
          onClick={() => setIsCartOpen(false)}
        >
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm" />
          <div
            className="relative w-full animate-in slide-in-from-bottom rounded-t-3xl bg-[rgba(63,68,68,0.98)] px-5 pb-8 pt-5 max-h-[72vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[rgba(134,134,134,0.75)]" />
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--palette-white)]">Ваш заказ</h2>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(134,134,134,0.24)] text-sm text-[var(--palette-white)] hover:bg-[rgba(134,134,134,0.42)]"
              >
                ✕
              </button>
            </div>

            {cartSummary.items.length === 0 ? (
              <p className="py-10 text-center text-sm text-[rgba(255,245,0,0.72)]">
                Корзина пуста — добавьте блюда нажатием «В корзину»
              </p>
            ) : (
              <>
                <div className="space-y-4">
                  {cartSummary.items.map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[var(--palette-white)]">{item.name}</p>
                        <p className="text-xs text-[var(--palette-yellow)]">{formatPrice(item.price)} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[var(--palette-yellow)]">{formatPrice(item.total)}</span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.key)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(134,134,134,0.24)] text-xs text-[rgba(255,255,255,0.8)] hover:bg-[rgba(134,134,134,0.42)]"
                          aria-label={`Удалить ${item.name}`}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-[rgba(134,134,134,0.34)] pt-4">
                  <p className="text-base font-bold text-[var(--palette-white)]">Итого</p>
                  <p className="text-2xl font-bold text-[var(--palette-yellow)]">{formatPrice(cartSummary.totalPrice)}</p>
                </div>
                <button
                  type="button"
                  onClick={submitOrder}
                  className="mt-5 w-full rounded-2xl bg-[var(--palette-yellow)] py-4 text-base font-bold uppercase tracking-wide text-[var(--palette-black)] transition hover:bg-[var(--palette-yellow-soft)] active:scale-[0.98]"
                >
                  Заказать
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── ADMIN PANEL ────────────────────────────────────── */}
      {showAdminPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.65)] backdrop-blur">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-[rgba(63,68,68,0.98)] p-6 text-[var(--palette-white)]">
            <h2 className="mb-5 text-xl font-bold">Админ-панель</h2>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => { enterKioskMode(); setShowAdminPanel(false); }}
                className="w-full rounded-xl border border-[rgba(60,207,187,0.52)] bg-[rgba(60,207,187,0.12)] px-4 py-3 text-sm font-semibold text-[var(--palette-teal)] hover:bg-[rgba(60,207,187,0.25)]"
              >
                Включить Киоск-режим
              </button>
              <button
                type="button"
                onClick={() => { exitKioskMode(); setShowAdminPanel(false); }}
                className="w-full rounded-xl border border-[rgba(60,207,187,0.52)] bg-[rgba(60,207,187,0.12)] px-4 py-3 text-sm font-semibold text-[var(--palette-teal)] hover:bg-[rgba(60,207,187,0.25)]"
              >
                Выйти из Fullscreen
              </button>
              <button
                type="button"
                onClick={toggleWorkMode}
                className="w-full rounded-xl border border-[rgba(255,255,0,0.45)] bg-[rgba(255,255,0,0.18)] px-4 py-3 text-sm font-semibold text-[var(--palette-yellow)] hover:bg-[rgba(255,255,0,0.27)]"
              >
                Режим: {workMode === "menu" ? "Меню (официант)" : "Интерактивный стол"}
              </button>
              <button
                type="button"
                onClick={() => setShowAdminPanel(false)}
                className="w-full rounded-xl bg-[rgba(134,134,134,0.2)] px-4 py-3 text-sm font-semibold text-[rgba(255,245,0,0.75)] hover:bg-[rgba(134,134,134,0.35)]"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── PRODUCT DETAIL MODAL ───────────────────────────── */}
      {modal.isOpen && modal.dish && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.62)] p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg max-h-[86vh] animate-in fade-in rounded-3xl bg-[rgba(63,68,68,0.98)] p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-[var(--palette-white)]">{modal.dish.name}</h2>
                {modal.dish.weight && (
                  <p className="mt-1 text-sm text-[var(--palette-yellow)]">{modal.dish.weight}</p>
                )}
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(134,134,134,0.24)] text-sm text-[var(--palette-white)] hover:bg-[rgba(134,134,134,0.42)]"
              >
                ✕
              </button>
            </div>
            <div className="space-y-5">
              {modal.dish.description && (
                <p className="text-sm leading-relaxed text-[rgba(255,245,0,0.92)]">
                  {modal.dish.description}
                </p>
              )}
              {(modal.dish.calories || modal.dish.protein || modal.dish.fat || modal.dish.carbs) && (
                <div className="grid grid-cols-4 gap-2 rounded-2xl bg-[rgba(134,134,134,0.18)] p-4">
                  {[
                    { label: "Ккал", value: modal.dish.calories },
                    { label: "Белки", value: modal.dish.protein ? `${modal.dish.protein}г` : null },
                    { label: "Жиры", value: modal.dish.fat ? `${modal.dish.fat}г` : null },
                    { label: "Углев.", value: modal.dish.carbs ? `${modal.dish.carbs}г` : null },
                  ].map(({ label, value }) =>
                    value ? (
                      <div key={label} className="text-center">
                        <p className="text-base font-bold text-[var(--palette-white)]">{value}</p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[rgba(60,207,187,0.95)]">{label}</p>
                      </div>
                    ) : null
                  )}
                </div>
              )}
              {modal.dish.allergens && modal.dish.allergens.length > 0 && (
                <div className="flex items-start gap-2 rounded-xl border border-[rgba(255,255,0,0.45)] bg-[rgba(255,255,0,0.12)] px-3 py-2">
                  <span className="mt-0.5 text-sm">⚠️</span>
                  <p className="text-xs text-[var(--palette-white)]">
                    <span className="font-semibold">Аллергены: </span>
                    {modal.dish.allergens.join(", ")}
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={() => { addToCart(modal.dish!); closeModal(); }}
                className="w-full rounded-2xl bg-[var(--palette-yellow)] py-4 text-base font-bold uppercase tracking-wide text-[var(--palette-black)] transition hover:bg-[var(--palette-yellow-soft)] active:scale-[0.98]"
              >
                Выбрать - {formatPrice(modal.dish.price)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── NOTIFICATION TOAST ─────────────────────────────── */}
      {notification.isVisible && (
        <div className="fixed bottom-24 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom rounded-2xl bg-[rgba(63,68,68,0.97)] px-5 py-4 shadow-2xl backdrop-blur-md sm:left-auto sm:right-6 sm:w-80">
          <p className="text-sm font-semibold text-[var(--palette-yellow)]">{notification.message}</p>
        </div>
      )}
    </main>
  );
}
