"use client";

import { useEffect, useMemo, useState } from "react";

type MenuCard = {
  id: number;
  name: string;
  detail: string;
  price: string;
  tag: string;
};

type StorySlide = {
  id: number;
  heading: string;
  kicker: string;
  description: string;
  video: string;
  poster: string;
  tint: string;
  cards: MenuCard[];
};

const STORY_DURATION_MS = 6500;

const stories: StorySlide[] = [
  {
    id: 1,
    heading: "Fresh from the grill.\nReady in minutes.",
    kicker: "Tonight's Drops",
    description:
      "Swipe through featured plates and tap your favorite to add it to your table order.",
    video: "/media/story-1.mp4",
    poster: "/media/story-1.jpg",
    tint:
      "bg-[radial-gradient(circle_at_18%_20%,rgba(255,141,66,0.42),transparent_35%),radial-gradient(circle_at_80%_85%,rgba(255,226,157,0.24),transparent_30%)]",
    cards: [
      {
        id: 1,
        name: "Smoky Truffle Burger",
        detail: "Double patty, aged cheddar, caramelized onion",
        price: "$14.90",
        tag: "Chef Pick",
      },
      {
        id: 2,
        name: "Firecracker Shrimp Tacos",
        detail: "Citrus slaw, avocado crema, toasted corn",
        price: "$12.50",
        tag: "Hot",
      },
      {
        id: 3,
        name: "Sunset Citrus Cooler",
        detail: "Blood orange, mint, sparkling tonic",
        price: "$6.20",
        tag: "Fresh",
      },
    ],
  },
  {
    id: 2,
    heading: "Street food energy.\nWeekend flavor burst.",
    kicker: "Fast Favorites",
    description:
      "Crunch, heat, citrus, and smoke. Built for quick bites between stories.",
    video: "/media/story-2.mp4",
    poster: "/media/story-2.jpg",
    tint:
      "bg-[radial-gradient(circle_at_22%_12%,rgba(244,114,33,0.35),transparent_33%),radial-gradient(circle_at_82%_78%,rgba(255,193,123,0.26),transparent_30%)]",
    cards: [
      {
        id: 1,
        name: "Crispy Chili Bites",
        detail: "Buttermilk crunch, lime zest, spicy aioli",
        price: "$9.80",
        tag: "Snack",
      },
      {
        id: 2,
        name: "Loaded Street Fries",
        detail: "Smoked paprika, cheddar rain, garlic mayo",
        price: "$7.40",
        tag: "Share",
      },
      {
        id: 3,
        name: "Lemon Pepper Wings",
        detail: "Charred edges, herbs, black pepper glaze",
        price: "$11.20",
        tag: "Trending",
      },
    ],
  },
  {
    id: 3,
    heading: "Sweet finishes.\nCold sparkling sips.",
    kicker: "Dessert Hour",
    description:
      "Last story, best finish. Treats and coolers designed for golden-hour tables.",
    video: "/media/story-3.mp4",
    poster: "/media/story-3.jpg",
    tint:
      "bg-[radial-gradient(circle_at_20%_16%,rgba(255,168,76,0.35),transparent_32%),radial-gradient(circle_at_76%_80%,rgba(247,215,170,0.22),transparent_28%)]",
    cards: [
      {
        id: 1,
        name: "Velvet Cocoa Mousse",
        detail: "Dark chocolate, sea salt flakes, berry dust",
        price: "$8.40",
        tag: "Dessert",
      },
      {
        id: 2,
        name: "Honey Citrus Tart",
        detail: "Flaky crust, orange curd, brûléed top",
        price: "$7.10",
        tag: "Baked",
      },
      {
        id: 3,
        name: "Pineapple Mint Spritz",
        detail: "Chilled pineapple, basil syrup, tonic pop",
        price: "$6.00",
        tag: "Cooler",
      },
    ],
  },
];

export default function Home() {
  const [activeStory, setActiveStory] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentStory = stories[activeStory];

  const currentTime = useMemo(
    () =>
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    []
  );

  useEffect(() => {
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
  }, [activeStory]);

  const goNext = () => {
    setProgress(0);
    setActiveStory((current) => (current + 1) % stories.length);
  };

  const goPrev = () => {
    setProgress(0);
    setActiveStory((current) => (current - 1 + stories.length) % stories.length);
  };

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#130c08] text-[#fff7ed]">
      <video
        key={currentStory.video}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        playsInline
        poster={currentStory.poster}
        onEnded={goNext}
      >
        <source src={currentStory.video} type="video/mp4" />
      </video>

      <div className={`absolute inset-0 ${currentStory.tint}`} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/45 to-black/75" />

      <button
        type="button"
        className="absolute left-0 top-0 z-20 h-[68%] w-1/2 cursor-pointer"
        onClick={goPrev}
        aria-label="Previous story"
      />
      <button
        type="button"
        className="absolute right-0 top-0 z-20 h-[68%] w-1/2 cursor-pointer"
        onClick={goNext}
        aria-label="Next story"
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
          <div className="flex items-center justify-between text-sm">
            <p className="rounded-full border border-white/30 bg-black/20 px-3 py-1 backdrop-blur-sm">
              Cafe Stories
            </p>
            <p className="rounded-full border border-white/30 bg-black/20 px-3 py-1 backdrop-blur-sm">
              {currentTime}
            </p>
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
          <div className="-mx-3 overflow-hidden px-3 pb-1 sm:-mx-6 sm:px-6">
            <div key={currentStory.id} className="card-marquee-track flex gap-3 sm:gap-4">
              {[...currentStory.cards, ...currentStory.cards].map((item, index) => (
                <article
                  key={`${currentStory.id}-${item.id}-${index}`}
                  aria-hidden={index >= currentStory.cards.length}
                  className="card-reveal w-[78vw] max-w-[420px] rounded-3xl border border-[#ffd9ad]/35 bg-[#2d170f]/65 p-4 shadow-[0_12px_42px_rgba(0,0,0,0.45)] backdrop-blur-md sm:w-[44vw] lg:w-[29vw]"
                  style={{ animationDelay: `${(index % currentStory.cards.length) * 120}ms` }}
                >
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-[#ffdcb3] uppercase">
                    {item.tag}
                  </p>
                  <h2 className="mt-2 text-xl leading-tight font-semibold text-[#fff7eb]">
                    {item.name}
                  </h2>
                  <p className="mt-2 text-sm text-[#ffe9cf]/85">{item.detail}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-2xl font-bold tracking-tight text-[#ffd8a8]">
                      {item.price}
                    </p>
                    <button
                      type="button"
                      className="rounded-full border border-[#ffd8ab]/55 bg-[#ffad66]/20 px-4 py-2 text-xs font-semibold tracking-[0.12em] text-[#fff0db] uppercase transition hover:bg-[#ffad66]/35"
                    >
                      Add
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
