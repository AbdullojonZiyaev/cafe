"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type MenuCard = {
  id: number;
  name: string;
  detail: string;
  price: string;
  tag: string;
  description?: string;
  weight?: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  allergens?: string[];
};

type StorySlide = {
  id: number;
  heading: string;
  kicker: string;
  description: string;
  video: string;
  fallbackVideo: string;
  poster: string;
  tint: string;
  cards: MenuCard[];
};

type CartItem = {
  name: string;
  price: number;
  quantity: number;
};

type WorkMode = "menu" | "table";

type ModalState = {
  isOpen: boolean;
  card: MenuCard | null;
};

const STORY_DURATION_MS = 6500;

const stories: StorySlide[] = [
  {
    id: 1,
    heading: "Свежо с гриля.\nГотово за минуты.",
    kicker: "Хиты вечера",
    description:
      "Смотрите подборку блюд и добавляйте любимые позиции в заказ одним нажатием.",
    video: "/media/story-1-mobile.mp4",
    fallbackVideo: "/media/story-1.mp4",
    poster: "/media/story-1.jpg",
    tint:
      "bg-[radial-gradient(circle_at_18%_20%,rgba(255,141,66,0.42),transparent_35%),radial-gradient(circle_at_80%_85%,rgba(255,226,157,0.24),transparent_30%)]",
    cards: [
      {
        id: 1,
        name: "Трюфельный бургер",
        detail: "Двойная котлета, выдержанный чеддер, карамелизированный лук",
        price: "690 ₽",
        tag: "Выбор шефа",
        description: "Премиальный бургер с двойной говяжьей котлетой, трюфельным маслом, выдержанным чеддером и карамелизированным луком. Подается с картофелем фри.",
        weight: "350г",
        calories: 580,
        protein: 35,
        fat: 28,
        carbs: 42,
        allergens: ["глютен", "молочные продукты", "сезам"],
      },
      {
        id: 2,
        name: "Тако с креветками",
        detail: "Цитрусовый салат, крем из авокадо, жареная кукуруза",
        price: "590 ₽",
        tag: "Острое",
        description: "Хрустящие тако с крупными креветками, цитрусовым салатом, сливочным кремом из авокадо и жареной кукурузой.",
        weight: "280г",
        calories: 420,
        protein: 28,
        fat: 18,
        carbs: 35,
        allergens: ["морепродукты", "молочные продукты"],
      },
      {
        id: 3,
        name: "Цитрусовый спритц",
        detail: "Красный апельсин, мята, игристый тоник",
        price: "320 ₽",
        tag: "Свежесть",
        description: "Освежающий коктейль с красным апельсином, свежей мятой и игристым тоником.",
        weight: "350мл",
        calories: 120,
        protein: 0,
        fat: 0,
        carbs: 28,
        allergens: [],
      },
    ],
  },
  {
    id: 2,
    heading: "Энергия стритфуда.\nВзрыв вкуса на выходных.",
    kicker: "Быстрые фавориты",
    description:
      "Хруст, острота, цитрус и дым. Идеально для быстрого перекуса.",
    video: "/media/story-2-mobile.mp4",
    fallbackVideo: "/media/story-2.mp4",
    poster: "/media/story-2.jpg",
    tint:
      "bg-[radial-gradient(circle_at_22%_12%,rgba(244,114,33,0.35),transparent_33%),radial-gradient(circle_at_82%_78%,rgba(255,193,123,0.26),transparent_30%)]",
    cards: [
      {
        id: 1,
        name: "Хрустящие чили-байтсы",
        detail: "Хруст в пахте, лаймовая цедра, острый айоли",
        price: "470 ₽",
        tag: "Закуска",
        description: "Небольшие кусочки курицы в хрустящей пахте с острым айоли и лаймовой цедрой.",
        weight: "180г",
        calories: 380,
        protein: 24,
        fat: 18,
        carbs: 28,
        allergens: ["яйца", "молочные продукты"],
      },
      {
        id: 2,
        name: "Фри по-стрит",
        detail: "Копченая паприка, чеддер, чесночный майо",
        price: "390 ₽",
        tag: "На компанию",
        description: "Хрустящий картофель фри с копченой паприкой, расплавленным чеддером и чесночным майонезом.",
        weight: "250г",
        calories: 520,
        protein: 8,
        fat: 26,
        carbs: 62,
        allergens: ["молочные продукты"],
      },
      {
        id: 3,
        name: "Крылья лимон-перец",
        detail: "Легкий гриль, травы, глазурь с черным перцем",
        price: "560 ₽",
        tag: "Тренд",
        description: "Куриные крылья на гриле с глазурью из черного перца и лимона, свежими травами.",
        weight: "320г",
        calories: 480,
        protein: 42,
        fat: 22,
        carbs: 12,
        allergens: [],
      },
    ],
  },
  {
    id: 3,
    heading: "Сладкий финал.\nХолодные искристые напитки.",
    kicker: "Час десертов",
    description:
      "Последняя история и лучший финал. Десерты и напитки для теплого вечера.",
    video: "/media/story-3-mobile.mp4",
    fallbackVideo: "/media/story-3.mp4",
    poster: "/media/story-3.jpg",
    tint:
      "bg-[radial-gradient(circle_at_20%_16%,rgba(255,168,76,0.35),transparent_32%),radial-gradient(circle_at_76%_80%,rgba(247,215,170,0.22),transparent_28%)]",
    cards: [
      {
        id: 1,
        name: "Шоколадный мусс",
        detail: "Темный шоколад, морская соль, ягодная пудра",
        price: "410 ₽",
        tag: "Десерт",
        description: "Нежный мусс из темного шоколада с морской солью и ягодной пудрой. Подается со сливками.",
        weight: "150г",
        calories: 320,
        protein: 4,
        fat: 18,
        carbs: 38,
        allergens: ["молочные продукты", "орехи"],
      },
      {
        id: 2,
        name: "Медовый цитрус тарт",
        detail: "Слоеная основа, апельсиновый крем, карамельная корочка",
        price: "360 ₽",
        tag: "Выпечка",
        description: "Хрустящий слоеный тарт с апельсиновым кремом и медовой карамельной корочкой.",
        weight: "120г",
        calories: 380,
        protein: 3,
        fat: 16,
        carbs: 52,
        allergens: ["глютен", "яйца", "молочные продукты"],
      },
      {
        id: 3,
        name: "Ананасовый спритц",
        detail: "Охлажденный ананас, сироп базилика, тоник",
        price: "300 ₽",
        tag: "Напиток",
        description: "Освежающий коктейль с охлажденным ананасом, сиропом из базилика и игристым тоником.",
        weight: "350мл",
        calories: 140,
        protein: 0,
        fat: 0,
        carbs: 32,
        allergens: [],
      },
    ],
  },
];

export default function Home() {
  const [activeStory, setActiveStory] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [modal, setModal] = useState<ModalState>({ isOpen: false, card: null });
  const [notification, setNotification] = useState<{ isVisible: boolean; message: string }>({ isVisible: false, message: "" });
  const [workMode, setWorkMode] = useState<WorkMode>("menu");
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const marqueeViewportRef = useRef<HTMLDivElement | null>(null);
  const marqueeTrackRef = useRef<HTMLDivElement | null>(null);
  const isHoldingRef = useRef(false);
  const isRailInteractingRef = useRef(false);
  const holdTimerRef = useRef<number | null>(null);
  const holdTriggeredRef = useRef(false);
  const marqueeManualOffsetRef = useRef(0);
  const marqueeSpanRef = useRef(0);

  const isEffectivelyPaused = isHolding;

  const currentStory = stories[activeStory];

  useEffect(() => {
    isHoldingRef.current = isHolding;
  }, [isHolding]);

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
    if (isEffectivelyPaused) {
      return;
    }

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const percent = Math.min((elapsed / STORY_DURATION_MS) * 100, 100);
      setProgress(percent);

      if (percent >= 100) {
        setProgress(0);
        setActiveStory((current) => (current + 1) % stories.length);
      }
    }, 70);

    return () => {
      window.clearInterval(timer);
    };
  }, [activeStory, isEffectivelyPaused]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (isEffectivelyPaused) {
      video.pause();
      return;
    }

    const playPromise = video.play();
    if (playPromise instanceof Promise) {
      playPromise.catch(() => {
        // Ignore autoplay interruptions caused by browser policies.
      });
    }
  }, [activeStory, isEffectivelyPaused]);

  useEffect(() => {
    const nextStory = stories[(activeStory + 1) % stories.length];
    const links = [nextStory.video, nextStory.fallbackVideo].map((href) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "video";
      link.href = href;
      document.head.appendChild(link);
      return link;
    });

    return () => {
      links.forEach((link) => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, [activeStory]);

  useEffect(() => {
    const viewport = marqueeViewportRef.current;
    const track = marqueeTrackRef.current;

    if (!viewport || !track) {
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const baseSpeed = 34;
    let speed = baseSpeed;
    let position = 0;
    let span = 0;
    let rafId = 0;
    let lastFrame = performance.now();

    const updateSpan = () => {
      const rawGap = getComputedStyle(viewport).getPropertyValue("--card-gap").trim();
      const gap = Number.parseFloat(rawGap);
      const safeGap = Number.isNaN(gap) ? 12 : gap;
      span = viewport.clientWidth + safeGap;
      marqueeSpanRef.current = span;
    };

    const applyTransform = () => {
      track.style.transform = `translate3d(${position - span + marqueeManualOffsetRef.current}px, 0, 0)`;
    };

    const resizeObserver = new ResizeObserver(() => {
      updateSpan();
      if (span > 0) {
        position = ((position % span) + span) % span;
      } else {
        position = 0;
      }
      applyTransform();
    });

    updateSpan();
    applyTransform();
    resizeObserver.observe(viewport);

    const tick = (now: number) => {
      const dt = (now - lastFrame) / 1000;
      lastFrame = now;

      const shouldPause =
        media.matches ||
        isHoldingRef.current ||
        isRailInteractingRef.current;
      const targetSpeed = shouldPause ? 0 : baseSpeed;
      const ease = 1 - Math.exp(-dt * 8);

      speed += (targetSpeed - speed) * ease;
      position += speed * dt;

      if (span > 0) {
        position %= span;
      }

      applyTransform();
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [activeStory]);

  const nudgeMarquee = (direction: "prev" | "next") => {
    const span = marqueeSpanRef.current;
    if (span <= 0) {
      return;
    }

    const step = span / 3;
    const delta = direction === "next" ? -step : step;
    marqueeManualOffsetRef.current += delta;
    marqueeManualOffsetRef.current = Math.max(
      -span,
      Math.min(span, marqueeManualOffsetRef.current)
    );
  };

  const parsePrice = (priceLabel: string) => {
    const parsed = Number.parseInt(priceLabel.replace(/[^\d]/g, ""), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const addToCart = (item: MenuCard) => {
    setCart((prev) => {
      const key = item.name;
      const existing = prev[key];
      const price = parsePrice(item.price);

      if (existing) {
        return {
          ...prev,
          [key]: {
            ...existing,
            quantity: existing.quantity + 1,
          },
        };
      }

      return {
        ...prev,
        [key]: {
          name: item.name,
          price,
          quantity: 1,
        },
      };
    });
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current !== null) {
        window.clearTimeout(holdTimerRef.current);
      }
    };
  }, []);

  const enterKioskMode = async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      }
    } catch (err) {
      console.warn("Kiosk mode not supported:", err);
    }
  };

  const exitKioskMode = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn("Could not exit fullscreen:", err);
    }
  };

  const openModal = (card: MenuCard) => {
    setModal({ isOpen: true, card });
  };

  const closeModal = () => {
    setModal({ isOpen: false, card: null });
  };

  const submitOrder = () => {
    const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems === 0) {
      setNotification({ isVisible: true, message: "Корзина пуста. Добавьте блюда для заказа." });
      setTimeout(() => setNotification({ isVisible: false, message: "" }), 3000);
      return;
    }

    setNotification({
      isVisible: true,
      message: "Ваш заказ принят! Официант скоро подойдет.",
    });

    setTimeout(() => {
      setCart({});
      setIsCartOpen(false);
      setNotification({ isVisible: false, message: "" });
    }, 2500);
  };

  const swipeStartX = useRef(0);
  const swipeStartY = useRef(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key === "t") {
        event.preventDefault();
        setShowAdminPanel((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSwipeStart = (e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0]?.clientX || 0;
    swipeStartY.current = e.touches[0]?.clientY || 0;
  };

  const handleSwipeEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0]?.clientX || 0;
    const endY = e.changedTouches[0]?.clientY || 0;

    const deltaX = endX - swipeStartX.current;
    const deltaY = endY - swipeStartY.current;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Only consider horizontal swipes (X movement > Y movement and > 50px)
    if (absDeltaX > absDeltaY && absDeltaX > 50) {
      if (deltaX > 0) {
        // Swipe right = previous
        nudgeMarquee("prev");
      } else {
        // Swipe left = next
        nudgeMarquee("next");
      }
    }
  };

  const toggleWorkMode = () => {
    setWorkMode((prev) => (prev === "menu" ? "table" : "menu"));
  };

  const startHoldPause = (pointerType: string) => {
    if (pointerType !== "touch" && pointerType !== "pen") {
      return;
    }

    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
    }

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
    if (!holdTriggeredRef.current) {
      return false;
    }

    holdTriggeredRef.current = false;
    return true;
  };

  const goNext = () => {
    setProgress(0);
    setActiveStory((current) => (current + 1) % stories.length);
  };

  const goPrev = () => {
    setProgress(0);
    setActiveStory((current) => (current - 1 + stories.length) % stories.length);
  };

  const handleNextTap = () => {
    if (shouldIgnoreHoldClick()) {
      return;
    }

    goNext();
  };

  const handlePrevTap = () => {
    if (shouldIgnoreHoldClick()) {
      return;
    }

    goPrev();
  };

  return (
    <main
      className="relative h-dvh w-full overflow-hidden bg-[#130c08] text-[#fff7ed]"
      onPointerDown={(event) => {
        startHoldPause(event.pointerType);
      }}
      onPointerUp={stopHoldPause}
      onPointerCancel={stopHoldPause}
      onPointerLeave={stopHoldPause}
    >
      <video
        ref={videoRef}
        key={`${currentStory.video}-${currentStory.fallbackVideo}`}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        playsInline
        preload="auto"
        poster={currentStory.poster}
        onEnded={goNext}
      >
        <source src={currentStory.video} type="video/mp4" />
        <source src={currentStory.fallbackVideo} type="video/mp4" />
      </video>

      <div className={`absolute inset-0 ${currentStory.tint}`} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/45 to-black/75" />

      <button
        type="button"
        className="absolute left-0 top-0 z-20 h-[68%] w-1/2 cursor-pointer"
        onClick={handlePrevTap}
        aria-label="Предыдущая история"
      />
      <button
        type="button"
        className="absolute right-0 top-0 z-20 h-[68%] w-1/2 cursor-pointer"
        onClick={handleNextTap}
        aria-label="Следующая история"
      />

      <section className="relative z-10 flex h-full flex-col px-3 pb-5 pt-4 sm:px-6 sm:pb-8">
        <header className="space-y-3 fade-in-up">
          <div className="flex gap-1">
            {stories.map((story, idx) => (
              <span
                key={story.id}
                className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/30"
              >
                <span
                  className={`absolute inset-y-0 left-0 rounded-full bg-white/95 ${
                    idx === activeStory ? "story-progress-active" : ""
                  }`}
                  style={{
                    width:
                      idx < activeStory
                        ? "100%"
                        : idx === activeStory
                          ? `${progress}%`
                          : "0%",
                  }}
                />
              </span>
            ))}
          </div>
        </header>

        <div key={currentStory.id} className="mt-8 max-w-lg space-y-3 fade-in-up sm:mt-14">
          <p className="inline-block rounded-full border border-[#ffd6a5]/70 bg-[#2e1a0f]/65 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-[#ffe7c7] uppercase">
            {currentStory.kicker}
          </p>
          <h1 className="text-balance text-3xl leading-tight font-bold tracking-tight text-[#fff6ea] sm:text-5xl">
            {currentStory.heading.split("\n").map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-[#fff1df]/90 sm:text-base">
            {currentStory.description}
          </p>
        </div>

        <div className="mt-auto">
          <div className="mx-auto mb-3 flex w-[80%] justify-end">
            <div className="w-full max-w-sm rounded-2xl border border-[#ffd9ad]/40 bg-[#2d170f]/70 p-3 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setIsCartOpen((value) => !value)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="text-xs font-semibold tracking-[0.13em] text-[#ffe0bb] uppercase">
                  Корзина
                </span>
                <span className="text-sm font-semibold text-[#fff2df]">
                  {cartSummary.totalItems} шт • {cartSummary.totalPrice} ₽
                </span>
              </button>

              {isCartOpen ? (
                <div className="mt-3 space-y-2 border-t border-[#ffd9ad]/25 pt-3">
                  {cartSummary.items.length === 0 ? (
                    <p className="text-xs text-[#ffe9cf]/80">Пока пусто</p>
                  ) : (
                    <>
                      {cartSummary.items.map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between text-xs text-[#fff0db]"
                        >
                          <p className="max-w-[62%] truncate">
                            {item.name} x {item.quantity}
                          </p>
                          <p>{item.total} ₽</p>
                        </div>
                      ))}
                      {workMode === "table" && (
                        <button
                          type="button"
                          onClick={submitOrder}
                          className="mt-3 w-full rounded-lg border border-[#ffad66]/60 bg-[#ffad66]/25 px-3 py-2 text-xs font-semibold tracking-[0.1em] text-[#fff0db] uppercase transition hover:bg-[#ffad66]/40"
                        >
                          Заказать
                        </button>
                      )}
                    </>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mx-auto mb-3 flex w-[80%] justify-end gap-2">
            <button
              type="button"
              onClick={() => nudgeMarquee("prev")}
              className="rounded-full border border-[#ffd8ab]/55 bg-[#2f1d13]/70 px-3 py-2 text-xs font-semibold tracking-[0.08em] text-[#ffe8cb] uppercase backdrop-blur-sm"
            >
              Влево
            </button>
            <button
              type="button"
              onClick={() => nudgeMarquee("next")}
              className="rounded-full border border-[#ffd8ab]/55 bg-[#2f1d13]/70 px-3 py-2 text-xs font-semibold tracking-[0.08em] text-[#ffe8cb] uppercase backdrop-blur-sm"
            >
              Вправо
            </button>
          </div>

          <div className="mx-auto w-[80%] overflow-hidden pb-1 rounded-3xl">
            <div
              key={currentStory.id}
              ref={marqueeViewportRef}
              className="card-marquee relative"
              onPointerEnter={() => {
                isRailInteractingRef.current = true;
              }}
              onPointerLeave={() => {
                isRailInteractingRef.current = false;
              }}
              onFocusCapture={() => {
                isRailInteractingRef.current = true;
              }}
              onBlurCapture={() => {
                isRailInteractingRef.current = false;
              }}
              onTouchStart={handleSwipeStart}
              onTouchEnd={handleSwipeEnd}
            >
              <div ref={marqueeTrackRef} className="card-marquee-track">
                {[0, 1].map((groupIndex) => (
                  <div
                    key={`${currentStory.id}-group-${groupIndex}`}
                    className="card-marquee-group"
                    aria-hidden={groupIndex === 1}
                  >
                    {currentStory.cards.map((item, index) => (
                      <article
                        key={`${currentStory.id}-${groupIndex}-${item.id}`}
                        className="marquee-card card-reveal flex h-full flex-col rounded-3xl border border-[#ffd9ad]/35 bg-[#2d170f]/65 p-3 shadow-[0_12px_42px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-4"
                        style={{ animationDelay: `${index * 120}ms` }}
                      >
                        <div className="flex items-start justify-between">
                          <p className="text-[10px] font-semibold tracking-[0.13em] text-[#ffdcb3] uppercase sm:text-[11px] sm:tracking-[0.18em]">
                            {item.tag}
                          </p>
                          <button
                            type="button"
                            onClick={() => openModal(item)}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ffad66]/20 text-[10px] font-bold text-[#ffe0bb] hover:bg-[#ffad66]/35 transition"
                            aria-label="Информация о блюде"
                          >
                            ℹ
                          </button>
                        </div>
                        <h2 className="mt-2 line-clamp-2 min-h-[2.4rem] text-sm leading-tight font-semibold text-[#fff7eb] sm:min-h-[3.2rem] sm:text-lg">
                          {item.name}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-xs text-[#ffe9cf]/85 sm:text-sm">
                          {item.detail}
                        </p>

                        <div className="mt-auto flex items-center justify-between pt-3">
                          <p className="text-base font-bold tracking-tight text-[#ffd8a8] sm:text-2xl">
                            {item.price}
                          </p>
                          <button
                            type="button"
                            onClick={() => addToCart(item)}
                            className="rounded-full border border-[#ffd8ab]/55 bg-[#ffad66]/20 px-3 py-2 text-[10px] font-semibold tracking-[0.1em] text-[#fff0db] uppercase transition hover:bg-[#ffad66]/35 sm:px-4 sm:text-xs"
                          >
                            В корзину
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Panel (Hidden) */}
      {showAdminPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
          <div className="rounded-2xl bg-[#2d170f] p-6 text-[#fff7ed] max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Админ-панель</h2>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  enterKioskMode();
                  setShowAdminPanel(false);
                }}
                className="w-full rounded-lg border border-[#ffd8ab]/55 bg-[#ffad66]/20 px-4 py-2 text-sm font-semibold text-[#fff0db] hover:bg-[#ffad66]/35"
              >
                Киоск-режим (Fullscreen)
              </button>
              <button
                type="button"
                onClick={() => {
                  exitKioskMode();
                  setShowAdminPanel(false);
                }}
                className="w-full rounded-lg border border-[#ffd8ab]/55 bg-[#ffad66]/20 px-4 py-2 text-sm font-semibold text-[#fff0db] hover:bg-[#ffad66]/35"
              >
                Выход из Fullscreen
              </button>
              <button
                type="button"
                onClick={toggleWorkMode}
                className="w-full rounded-lg border border-[#ffd8ab]/55 bg-[#ffad66]/20 px-4 py-2 text-sm font-semibold text-[#fff0db] hover:bg-[#ffad66]/35"
              >
                Режим: {workMode === "menu" ? "Меню" : "Интерактивный стол"}
              </button>
              <button
                type="button"
                onClick={() => setShowAdminPanel(false)}
                className="w-full rounded-lg border border-[#ffd8ab]/55 bg-[#2f1d13]/70 px-4 py-2 text-sm font-semibold text-[#fff0db] hover:bg-[#2f1d13]/90"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {modal.isOpen && modal.card && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur" onClick={closeModal}>
          <div
            className="w-full rounded-t-3xl sm:rounded-3xl bg-[#2d170f] p-6 max-w-md sm:max-h-[80vh] overflow-y-auto text-[#fff7ed] animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{modal.card.name}</h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-2xl font-bold text-[#ffe0bb] hover:text-[#fff7ed]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {modal.card.description && (
                <p className="text-sm text-[#ffe9cf]">{modal.card.description}</p>
              )}

              {modal.card.weight && (
                <div className="text-sm">
                  <span className="font-semibold text-[#ffdcb3]">Выход:</span>
                  <span className="ml-2 text-[#ffe9cf]">{modal.card.weight}</span>
                </div>
              )}

              {/* Nutritional Info */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#ffd9ad]/25">
                {modal.card.calories && (
                  <div className="text-xs">
                    <span className="font-semibold text-[#ffdcb3]">Калории</span>
                    <p className="text-[#ffe9cf]">{modal.card.calories} ккал</p>
                  </div>
                )}
                {modal.card.protein && (
                  <div className="text-xs">
                    <span className="font-semibold text-[#ffdcb3]">Белки</span>
                    <p className="text-[#ffe9cf]">{modal.card.protein}г</p>
                  </div>
                )}
                {modal.card.fat && (
                  <div className="text-xs">
                    <span className="font-semibold text-[#ffdcb3]">Жиры</span>
                    <p className="text-[#ffe9cf]">{modal.card.fat}г</p>
                  </div>
                )}
                {modal.card.carbs && (
                  <div className="text-xs">
                    <span className="font-semibold text-[#ffdcb3]">Углеводы</span>
                    <p className="text-[#ffe9cf]">{modal.card.carbs}г</p>
                  </div>
                )}
              </div>

              {/* Allergens */}
              {modal.card.allergens && modal.card.allergens.length > 0 && (
                <div className="pt-3 border-t border-[#ffd9ad]/25">
                  <p className="text-xs font-semibold text-[#ff6b6b] mb-2">⚠️ Аллергены:</p>
                  <p className="text-xs text-[#ffe9cf]">{modal.card.allergens.join(", ")}</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  addToCart(modal.card!);
                  closeModal();
                }}
                className="w-full mt-4 rounded-lg border border-[#ffad66]/60 bg-[#ffad66]/25 px-4 py-3 text-sm font-semibold text-[#fff0db] uppercase transition hover:bg-[#ffad66]/40"
              >
                В корзину
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Notification */}
      {notification.isVisible && (
        <div className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:w-80 z-50 rounded-2xl border border-[#ffd9ad]/40 bg-[#2d170f]/90 p-4 backdrop-blur-md animate-in fade-in slide-in-from-bottom">
          <p className="text-sm font-semibold text-[#ffe0bb]">{notification.message}</p>
        </div>
      )}
    </main>
  );
}
