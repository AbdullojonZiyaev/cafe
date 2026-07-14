"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Dish = {
  id: number;
  categoryId: number;
  name: string;
  price: string;
  tag: string;
  video: string;
  fallbackVideo: string;
  poster: string;
  tint: string;
  description?: string;
  weight?: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  allergens?: string[];
};

type Category = {
  id: number;
  name: string;
  icon: string;
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

const categories: Category[] = [
  { id: 1, name: "Супы", icon: "🍲" },
  { id: 2, name: "Салаты", icon: "🥗" },
  { id: 3, name: "Десерты", icon: "🍰" },
  { id: 4, name: "Паста", icon: "🍝" },
  { id: 5, name: "Гриль", icon: "🔥" },
  { id: 6, name: "Напитки", icon: "🍹" },
];

const dishes: Dish[] = [
  {
    id: 1,
    categoryId: 1,
    name: "Трюфельный бургер",
    price: "690 ₽",
    tag: "Выбор шефа",
    video: "/media/story-1-mobile.mp4",
    fallbackVideo: "/media/story-1.mp4",
    poster: "/media/story-1.jpg",
    tint: "bg-[radial-gradient(circle_at_18%_20%,rgba(255,141,66,0.42),transparent_35%),radial-gradient(circle_at_80%_85%,rgba(255,226,157,0.24),transparent_30%)]",
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
    categoryId: 1,
    name: "Тако с креветками",
    price: "590 ₽",
    tag: "Острое",
    video: "/media/story-1-mobile.mp4",
    fallbackVideo: "/media/story-1.mp4",
    poster: "/media/story-1.jpg",
    tint: "bg-[radial-gradient(circle_at_18%_20%,rgba(255,141,66,0.42),transparent_35%),radial-gradient(circle_at_80%_85%,rgba(255,226,157,0.24),transparent_30%)]",
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
    categoryId: 1,
    name: "Цитрусовый спритц",
    price: "320 ₽",
    tag: "Свежесть",
    video: "/media/story-1-mobile.mp4",
    fallbackVideo: "/media/story-1.mp4",
    poster: "/media/story-1.jpg",
    tint: "bg-[radial-gradient(circle_at_18%_20%,rgba(255,141,66,0.42),transparent_35%),radial-gradient(circle_at_80%_85%,rgba(255,226,157,0.24),transparent_30%)]",
    description: "Освежающий коктейль с красным апельсином, свежей мятой и игристым тоником.",
    weight: "350мл",
    calories: 120,
    protein: 0,
    fat: 0,
    carbs: 28,
    allergens: [],
  },
  {
    id: 4,
    categoryId: 2,
    name: "Хрустящие чили-байтсы",
    price: "470 ₽",
    tag: "Закуска",
    video: "/media/story-2-mobile.mp4",
    fallbackVideo: "/media/story-2.mp4",
    poster: "/media/story-2.jpg",
    tint: "bg-[radial-gradient(circle_at_22%_12%,rgba(244,114,33,0.35),transparent_33%),radial-gradient(circle_at_82%_78%,rgba(255,193,123,0.26),transparent_30%)]",
    description: "Небольшие кусочки курицы в хрустящей пахте с острым айоли и лаймовой цедрой.",
    weight: "180г",
    calories: 380,
    protein: 24,
    fat: 18,
    carbs: 28,
    allergens: ["яйца", "молочные продукты"],
  },
  {
    id: 5,
    categoryId: 2,
    name: "Фри по-стрит",
    price: "390 ₽",
    tag: "На компанию",
    video: "/media/story-2-mobile.mp4",
    fallbackVideo: "/media/story-2.mp4",
    poster: "/media/story-2.jpg",
    tint: "bg-[radial-gradient(circle_at_22%_12%,rgba(244,114,33,0.35),transparent_33%),radial-gradient(circle_at_82%_78%,rgba(255,193,123,0.26),transparent_30%)]",
    description: "Хрустящий картофель фри с копченой паприкой, расплавленным чеддером и чесночным майонезом.",
    weight: "250г",
    calories: 520,
    protein: 8,
    fat: 26,
    carbs: 62,
    allergens: ["молочные продукты"],
  },
  {
    id: 6,
    categoryId: 2,
    name: "Крылья лимон-перец",
    price: "560 ₽",
    tag: "Тренд",
    video: "/media/story-2-mobile.mp4",
    fallbackVideo: "/media/story-2.mp4",
    poster: "/media/story-2.jpg",
    tint: "bg-[radial-gradient(circle_at_22%_12%,rgba(244,114,33,0.35),transparent_33%),radial-gradient(circle_at_82%_78%,rgba(255,193,123,0.26),transparent_30%)]",
    description: "Куриные крылья на гриле с глазурью из черного перца и лимона, свежими травами.",
    weight: "320г",
    calories: 480,
    protein: 42,
    fat: 22,
    carbs: 12,
    allergens: [],
  },
  {
    id: 7,
    categoryId: 3,
    name: "Шоколадный мусс",
    price: "410 ₽",
    tag: "Десерт",
    video: "/media/story-3-mobile.mp4",
    fallbackVideo: "/media/story-3.mp4",
    poster: "/media/story-3.jpg",
    tint: "bg-[radial-gradient(circle_at_20%_16%,rgba(255,168,76,0.35),transparent_32%),radial-gradient(circle_at_76%_80%,rgba(247,215,170,0.22),transparent_28%)]",
    description: "Нежный мусс из темного шоколада с морской солью и ягодной пудрой. Подается со сливками.",
    weight: "150г",
    calories: 320,
    protein: 4,
    fat: 18,
    carbs: 38,
    allergens: ["молочные продукты", "орехи"],
  },
  {
    id: 8,
    categoryId: 3,
    name: "Медовый цитрус тарт",
    price: "360 ₽",
    tag: "Выпечка",
    video: "/media/story-3-mobile.mp4",
    fallbackVideo: "/media/story-3.mp4",
    poster: "/media/story-3.jpg",
    tint: "bg-[radial-gradient(circle_at_20%_16%,rgba(255,168,76,0.35),transparent_32%),radial-gradient(circle_at_76%_80%,rgba(247,215,170,0.22),transparent_28%)]",
    description: "Хрустящий слоеный тарт с апельсиновым кремом и медовой карамельной корочкой.",
    weight: "120г",
    calories: 380,
    protein: 3,
    fat: 16,
    carbs: 52,
    allergens: ["глютен", "яйца", "молочные продукты"],
  },
  {
    id: 9,
    categoryId: 3,
    name: "Ананасовый спритц",
    price: "300 ₽",
    tag: "Напиток",
    video: "/media/story-3-mobile.mp4",
    fallbackVideo: "/media/story-3.mp4",
    poster: "/media/story-3.jpg",
    tint: "bg-[radial-gradient(circle_at_20%_16%,rgba(255,168,76,0.35),transparent_32%),radial-gradient(circle_at_76%_80%,rgba(247,215,170,0.22),transparent_28%)]",
    description: "Освежающий коктейль с охлажденным ананасом, сиропом из базилика и игристым тоником.",
    weight: "350мл",
    calories: 140,
    protein: 0,
    fat: 0,
    carbs: 32,
    allergens: [],
  },
  {
    id: 10,
    categoryId: 1,
    name: "Рамен с томленой говядиной",
    price: "640 ₽",
    tag: "Хит",
    video: "/media/story-1-mobile.mp4",
    fallbackVideo: "/media/story-1.mp4",
    poster: "/media/story-1.jpg",
    tint: "bg-[radial-gradient(circle_at_18%_20%,rgba(255,141,66,0.42),transparent_35%),radial-gradient(circle_at_80%_85%,rgba(255,226,157,0.24),transparent_30%)]",
    description: "Насыщенный бульон, томленая говядина, лапша, маринованное яйцо и зеленый лук.",
    weight: "420г",
    calories: 540,
    protein: 30,
    fat: 19,
    carbs: 58,
    allergens: ["глютен", "яйца"],
  },
  {
    id: 11,
    categoryId: 2,
    name: "Салат с киноа и авокадо",
    price: "450 ₽",
    tag: "Легкое",
    video: "/media/story-2-mobile.mp4",
    fallbackVideo: "/media/story-2.mp4",
    poster: "/media/story-2.jpg",
    tint: "bg-[radial-gradient(circle_at_22%_12%,rgba(244,114,33,0.35),transparent_33%),radial-gradient(circle_at_82%_78%,rgba(255,193,123,0.26),transparent_30%)]",
    description: "Киноа, авокадо, огурец, томаты черри и соус из лимона и оливкового масла.",
    weight: "260г",
    calories: 340,
    protein: 10,
    fat: 16,
    carbs: 38,
    allergens: [],
  },
  {
    id: 12,
    categoryId: 3,
    name: "Павлова с ягодами",
    price: "430 ₽",
    tag: "Новинка",
    video: "/media/story-3-mobile.mp4",
    fallbackVideo: "/media/story-3.mp4",
    poster: "/media/story-3.jpg",
    tint: "bg-[radial-gradient(circle_at_20%_16%,rgba(255,168,76,0.35),transparent_32%),radial-gradient(circle_at_76%_80%,rgba(247,215,170,0.22),transparent_28%)]",
    description: "Хрустящая меренга с ванильным кремом, свежими ягодами и ягодным кули.",
    weight: "170г",
    calories: 360,
    protein: 5,
    fat: 14,
    carbs: 54,
    allergens: ["яйца", "молочные продукты"],
  },
  {
    id: 13,
    categoryId: 4,
    name: "Фетучини с грибами",
    price: "520 ₽",
    tag: "Домашняя паста",
    video: "/media/story-2-mobile.mp4",
    fallbackVideo: "/media/story-2.mp4",
    poster: "/media/story-2.jpg",
    tint: "bg-[radial-gradient(circle_at_22%_12%,rgba(244,114,33,0.35),transparent_33%),radial-gradient(circle_at_82%_78%,rgba(255,193,123,0.26),transparent_30%)]",
    description: "Паста в сливочно-грибном соусе с пармезаном и свежим тимьяном.",
    weight: "330г",
    calories: 510,
    protein: 16,
    fat: 22,
    carbs: 61,
    allergens: ["глютен", "молочные продукты"],
  },
  {
    id: 14,
    categoryId: 5,
    name: "Стейк с перечным соусом",
    price: "890 ₽",
    tag: "Премиум",
    video: "/media/story-1-mobile.mp4",
    fallbackVideo: "/media/story-1.mp4",
    poster: "/media/story-1.jpg",
    tint: "bg-[radial-gradient(circle_at_18%_20%,rgba(255,141,66,0.42),transparent_35%),radial-gradient(circle_at_80%_85%,rgba(255,226,157,0.24),transparent_30%)]",
    description: "Сочный стейк средней прожарки с зеленой фасолью и соусом из черного перца.",
    weight: "300г",
    calories: 620,
    protein: 44,
    fat: 37,
    carbs: 11,
    allergens: ["молочные продукты"],
  },
  {
    id: 15,
    categoryId: 6,
    name: "Ягодный лимонад",
    price: "290 ₽",
    tag: "Освежает",
    video: "/media/story-3-mobile.mp4",
    fallbackVideo: "/media/story-3.mp4",
    poster: "/media/story-3.jpg",
    tint: "bg-[radial-gradient(circle_at_20%_16%,rgba(255,168,76,0.35),transparent_32%),radial-gradient(circle_at_76%_80%,rgba(247,215,170,0.22),transparent_28%)]",
    description: "Лимонад с малиной, клубникой и мятой на минеральной воде.",
    weight: "400мл",
    calories: 150,
    protein: 0,
    fat: 0,
    carbs: 36,
    allergens: [],
  },
];

export default function Home() {
  const [activeDishIndex, setActiveDishIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [modal, setModal] = useState<ModalState>({ isOpen: false, dish: null });
  const [notification, setNotification] = useState<{ isVisible: boolean; message: string }>({ isVisible: false, message: "" });
  const [workMode, setWorkMode] = useState<WorkMode>("menu");
  const [showAdminPanel, setShowAdminPanel] = useState(false);

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

  const playbackDishIndexes = categories.flatMap((cat) =>
    dishes
      .map((dish, index) => ({ dish, index }))
      .filter(({ dish }) => dish.categoryId === cat.id)
      .map(({ index }) => index)
  );

  const getNextDishIndex = (fromIndex: number) => {
    const currentPlaybackIndex = playbackDishIndexes.indexOf(fromIndex);
    if (currentPlaybackIndex === -1) return playbackDishIndexes[0] ?? 0;
    return playbackDishIndexes[(currentPlaybackIndex + 1) % playbackDishIndexes.length] ?? fromIndex;
  };

  const getPrevDishIndex = (fromIndex: number) => {
    const currentPlaybackIndex = playbackDishIndexes.indexOf(fromIndex);
    if (currentPlaybackIndex === -1) return playbackDishIndexes[0] ?? 0;
    return (
      playbackDishIndexes[(currentPlaybackIndex - 1 + playbackDishIndexes.length) % playbackDishIndexes.length] ??
      fromIndex
    );
  };

  const currentDish = dishes[activeDishIndex];
  const categoryDishes = dishes.filter((d) => d.categoryId === currentDish.categoryId);
  const dishIndexInCategory = categoryDishes.findIndex((d) => d.id === currentDish.id);
  const isEffectivelyPaused = isHolding;

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
    if (isEffectivelyPaused) return;
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const percent = Math.min((elapsed / DISH_DURATION_MS) * 100, 100);
      setProgress(percent);
      if (percent >= 100) {
        setProgress(0);
        setActiveDishIndex((current) => getNextDishIndex(current));
      }
    }, 70);
    return () => window.clearInterval(timer);
  }, [activeDishIndex, isEffectivelyPaused]);

  // Video playback control
  useEffect(() => {
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
  }, [activeDishIndex, isEffectivelyPaused]);

  // Preload next dish video
  useEffect(() => {
    const nextDish = dishes[getNextDishIndex(activeDishIndex)];
    const links = [nextDish.video, nextDish.fallbackVideo].map((href) => {
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
  }, [activeDishIndex]);

  // Hold timer cleanup
  useEffect(() => {
    return () => {
      if (holdTimerRef.current !== null) window.clearTimeout(holdTimerRef.current);
    };
  }, []);

  // Scroll active category card into view when category changes
  useEffect(() => {
    const container = catContainerRef.current;
    if (!container) return;
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
  }, [currentDish.categoryId]);

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
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const parsePrice = (priceLabel: string) => {
    const parsed = Number.parseInt(priceLabel.replace(/[^\d]/g, ""), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const addToCart = (dish: Dish) => {
    setCart((prev) => {
      const key = dish.name;
      const existing = prev[key];
      const price = parsePrice(dish.price);
      if (existing) {
        return { ...prev, [key]: { ...existing, quantity: existing.quantity + 1 } };
      }
      return { ...prev, [key]: { name: dish.name, price, quantity: 1 } };
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

  const goNext = () => {
    setProgress(0);
    setActiveDishIndex((current) => getNextDishIndex(current));
  };

  const goPrev = () => {
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

    if (absDeltaX > absDeltaY && absDeltaX > 50) {
      if (deltaX > 0) goPrev();
      else goNext();
    } else if (absDeltaY > absDeltaX && absDeltaY > 60 && deltaY < 0) {
      openModal(currentDish);
    }
  };

  const handleCatSwipeStart = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  const handleCatSwipeEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  const handleCategoryScroll = (e: React.UIEvent<HTMLDivElement>) => {
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

  const jumpToCategory = (categoryId: number) => {
    const idx = dishes.findIndex((d) => d.categoryId === categoryId);
    if (idx !== -1) {
      setActiveDishIndex(idx);
      setProgress(0);
    }
  };

  return (
    <main
      className="relative h-dvh w-full overflow-hidden bg-[#130c08] text-[#fff7ed]"
      onPointerDown={(event) => startHoldPause(event.pointerType)}
      onPointerUp={stopHoldPause}
      onPointerCancel={stopHoldPause}
      onPointerLeave={stopHoldPause}
      onTouchStart={handleSwipeStart}
      onTouchEnd={handleSwipeEnd}
    >
      {/* Full-screen background video */}
      <video
        ref={videoRef}
        key={`${currentDish.video}-${currentDish.id}`}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        playsInline
        preload="auto"
        poster={currentDish.poster}
        onEnded={goNext}
      >
        <source src={currentDish.video} type="video/mp4" />
        <source src={currentDish.fallbackVideo} type="video/mp4" />
      </video>

      {/* Color tint overlay */}
      <div className={`absolute inset-0 ${currentDish.tint}`} />
      {/* Gradient: dark top for readability → clear middle → dark bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent via-45% to-black/85" />

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
              className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/25"
            >
              <span
                className={`absolute inset-y-0 left-0 rounded-full bg-white/90 ${
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
          <span className="inline-block rounded-full border border-white/20 bg-black/30 px-3 py-0.5 text-[10px] font-bold tracking-[0.22em] text-white/75 uppercase backdrop-blur-sm">
            {currentDish.tag}
          </span>
          <div className="mt-2 flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-white drop-shadow-lg sm:text-4xl">
              {currentDish.name}
            </h1>
            <span className="mt-1 flex-shrink-0 text-2xl font-bold text-[#ffd8a8] drop-shadow sm:text-3xl">
              {currentDish.price}
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
            className="rounded-2xl border border-white/30 bg-black/30 px-4 py-3 text-xs font-bold uppercase tracking-wide text-white/85 backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
          >
            Подробнее
          </button>
          <button
            type="button"
            onClick={() => addToCart(currentDish)}
            className="flex-1 rounded-2xl bg-[#ffad66] py-3 text-sm font-bold uppercase tracking-wide text-[#1a0d07] shadow-lg transition hover:bg-[#ffbd80] active:scale-[0.97]"
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
            const count = dishes.filter((d) => d.categoryId === cat.id).length;
            return (
              <button
                key={`${cat.id}-${index}`}
                data-cat-id={cat.id}
                type="button"
                onClick={() => jumpToCategory(cat.id)}
                className={`flex flex-shrink-0 snap-center w-[45%] sm:w-[38%] flex-col items-center justify-center gap-1.5 rounded-2xl border backdrop-blur-md transition-all duration-300 ${
                  isActive
                    ? "border-[#ffad66]/70 bg-[#ffad66]/25 text-[#ffd8a8] shadow-[0_0_30px_rgba(255,173,102,0.3)] py-4"
                    : "border-white/10 bg-black/40 text-white/45 py-4 opacity-60"
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
                <span className={`text-[10px] transition-all duration-300 ${isActive ? "mt-1 text-[#ffd8a8]/50" : "mt-1 text-white/25"}`}>
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
        className="fixed bottom-6 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#ffad66] shadow-2xl transition hover:bg-[#ffbd80] active:scale-95"
        aria-label="Открыть корзину"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1a0d07"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        {cartSummary.totalItems > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full animate-in slide-in-from-bottom rounded-t-3xl bg-[#180e08] px-5 pb-8 pt-5 max-h-[72vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#fff7ed]">Ваш заказ</h2>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm text-[#fff7ed] hover:bg-white/20"
              >
                ✕
              </button>
            </div>

            {cartSummary.items.length === 0 ? (
              <p className="py-10 text-center text-sm text-[#ffe9cf]/60">
                Корзина пуста — добавьте блюда нажатием «В корзину»
              </p>
            ) : (
              <>
                <div className="space-y-4">
                  {cartSummary.items.map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#fff7ed]">{item.name}</p>
                        <p className="text-xs text-[#ffd8a8]">{item.price} ₽ × {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#ffd8a8]">{item.total} ₽</span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.key)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs text-white/70 hover:bg-white/20"
                          aria-label={`Удалить ${item.name}`}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <p className="text-base font-bold text-[#fff7ed]">Итого</p>
                  <p className="text-2xl font-bold text-[#ffd8a8]">{cartSummary.totalPrice} ₽</p>
                </div>
                <button
                  type="button"
                  onClick={submitOrder}
                  className="mt-5 w-full rounded-2xl bg-[#ffad66] py-4 text-base font-bold uppercase tracking-wide text-[#1a0d07] transition hover:bg-[#ffbd80] active:scale-[0.98]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-[#180e08] p-6 text-[#fff7ed]">
            <h2 className="mb-5 text-xl font-bold">Админ-панель</h2>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => { enterKioskMode(); setShowAdminPanel(false); }}
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-[#fff0db] hover:bg-white/20"
              >
                Включить Киоск-режим
              </button>
              <button
                type="button"
                onClick={() => { exitKioskMode(); setShowAdminPanel(false); }}
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-[#fff0db] hover:bg-white/20"
              >
                Выйти из Fullscreen
              </button>
              <button
                type="button"
                onClick={toggleWorkMode}
                className="w-full rounded-xl border border-[#ffad66]/30 bg-[#ffad66]/15 px-4 py-3 text-sm font-semibold text-[#ffd8a8] hover:bg-[#ffad66]/25"
              >
                Режим: {workMode === "menu" ? "Меню (официант)" : "Интерактивный стол"}
              </button>
              <button
                type="button"
                onClick={() => setShowAdminPanel(false)}
                className="w-full rounded-xl bg-white/5 px-4 py-3 text-sm font-semibold text-[#ffe0bb]/70 hover:bg-white/10"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg max-h-[86vh] animate-in fade-in rounded-3xl bg-[#180e08] p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-[#fff7ed]">{modal.dish.name}</h2>
                {modal.dish.weight && (
                  <p className="mt-1 text-sm text-[#ffd8a8]">{modal.dish.weight}</p>
                )}
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-sm text-[#fff7ed] hover:bg-white/20"
              >
                ✕
              </button>
            </div>
            <div className="space-y-5">
              {modal.dish.description && (
                <p className="text-sm leading-relaxed text-[#ffe9cf]/90">
                  {modal.dish.description}
                </p>
              )}
              {(modal.dish.calories || modal.dish.protein || modal.dish.fat || modal.dish.carbs) && (
                <div className="grid grid-cols-4 gap-2 rounded-2xl bg-white/5 p-4">
                  {[
                    { label: "Ккал", value: modal.dish.calories },
                    { label: "Белки", value: modal.dish.protein ? `${modal.dish.protein}г` : null },
                    { label: "Жиры", value: modal.dish.fat ? `${modal.dish.fat}г` : null },
                    { label: "Углев.", value: modal.dish.carbs ? `${modal.dish.carbs}г` : null },
                  ].map(({ label, value }) =>
                    value ? (
                      <div key={label} className="text-center">
                        <p className="text-base font-bold text-[#fff7ed]">{value}</p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[#ffd8a8]/70">{label}</p>
                      </div>
                    ) : null
                  )}
                </div>
              )}
              {modal.dish.allergens && modal.dish.allergens.length > 0 && (
                <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2">
                  <span className="mt-0.5 text-sm">⚠️</span>
                  <p className="text-xs text-[#ffcdd2]">
                    <span className="font-semibold">Аллергены: </span>
                    {modal.dish.allergens.join(", ")}
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={() => { addToCart(modal.dish!); closeModal(); }}
                className="w-full rounded-2xl bg-[#ffad66] py-4 text-base font-bold uppercase tracking-wide text-[#1a0d07] transition hover:bg-[#ffbd80] active:scale-[0.98]"
              >
                Выбрать — {modal.dish.price}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── NOTIFICATION TOAST ─────────────────────────────── */}
      {notification.isVisible && (
        <div className="fixed bottom-24 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom rounded-2xl bg-[#1a0d07]/95 px-5 py-4 shadow-2xl backdrop-blur-md sm:left-auto sm:right-6 sm:w-80">
          <p className="text-sm font-semibold text-[#ffe0bb]">{notification.message}</p>
        </div>
      )}
    </main>
  );
}
