"use client";

/// <reference types="react" />
import React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Maximize2,
  Music3,
  Pause,
  Play,
  RefreshCcw,
  Search,
  Shuffle,
  Sparkles,
  Wand2,
  ZoomIn,
  ZoomOut,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { artworks, type Artwork } from "@/data/artworks";

const alphabet = Array.from({ length: 26 }, (_, index) =>
  String.fromCharCode(65 + index),
);

const sortOptions = [
  { value: "default", label: "Curated order" },
  { value: "title-asc", label: "Title (A-Z)" },
  { value: "title-desc", label: "Title (Z-A)" },
  { value: "artist-asc", label: "Artist (A-Z)" },
  { value: "artist-desc", label: "Artist (Z-A)" },
  { value: "year-asc", label: "Year (oldest)" },
  { value: "year-desc", label: "Year (newest)" },
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isMusicOn, setIsMusicOn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [letterFilter, setLetterFilter] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<string | null>(null);
  const [modalArtwork, setModalArtwork] = useState<Artwork | null>(null);
  const [zoom, setZoom] = useState(1);
  const [guideCollapsed, setGuideCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);

  const stats = useMemo(() => {
    const artistSet = new Set(artworks.map((art) => art.artist));
    const years = artworks.map((art) => Number(art.year));
    return {
      total: artworks.length,
      artists: artistSet.size,
      range: `${Math.min(...years)}-${Math.max(...years)}`,
    };
  }, []);

  const years = useMemo(() => {
    return Array.from(new Set(artworks.map((art) => art.year))).sort(
      (a, b) => Number(b) - Number(a),
    );
  }, []);

  const sortedArtworks = useMemo(() => {
    const next = [...artworks];
    switch (sortBy) {
      case "title-asc":
        next.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        next.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "artist-asc":
        next.sort((a, b) => a.artist.localeCompare(b.artist));
        break;
      case "artist-desc":
        next.sort((a, b) => b.artist.localeCompare(a.artist));
        break;
      case "year-asc":
        next.sort((a, b) => Number(a.year) - Number(b.year));
        break;
      case "year-desc":
        next.sort((a, b) => Number(b.year) - Number(a.year));
        break;
      default:
        return next;
    }
    return next;
  }, [sortBy]);

  const filteredList = useMemo(() => {
    return sortedArtworks.filter((art) => {
      const matchesSearch =
        art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        art.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        art.desc.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLetter = letterFilter
        ? art.title.toUpperCase().startsWith(letterFilter)
        : true;
      const matchesYear = yearFilter ? art.year === yearFilter : true;
      return matchesSearch && matchesLetter && matchesYear;
    });
  }, [sortedArtworks, searchTerm, letterFilter, yearFilter]);

  const currentArtwork = filteredList[currentIndex] || filteredList[0] || artworks[0];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1400);
    return () => clearTimeout(timer);
  }, []);



  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isMusicOn) {
      audio.volume = 0.3;
      audio.play().catch((error) => {
        console.log('Audio play failed:', error);
        setIsMusicOn(false);
      });
    } else {
      audio.pause();
    }
  }, [isMusicOn]);

  useEffect(() => {
    if (!carouselApi) return;
    const handleSelect = () => {
      setCurrentIndex(carouselApi.selectedScrollSnap());
    };
    handleSelect();
    carouselApi.on("select", handleSelect);
    return () => {
      carouselApi.off("select", handleSelect);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi) return;
    if (carouselApi.selectedScrollSnap() === currentIndex) return;
    carouselApi.scrollTo(currentIndex);
  }, [currentIndex, carouselApi]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [searchTerm, sortBy]);

  const goTo = useCallback(
    (index: number) => {
      if (filteredList.length === 0) return;
      const target = (index + filteredList.length) % filteredList.length;
      setCurrentIndex(target);
      carouselApi?.scrollTo(target);
    },
    [carouselApi, filteredList.length],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        goTo(currentIndex + 1);
      } else if (event.key === "ArrowLeft") {
        goTo(currentIndex - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, goTo]);

  const handleShuffle = () => {
    if (filteredList.length === 0) return;
    const random = Math.floor(Math.random() * filteredList.length);
    goTo(random === currentIndex ? (random + 1) % filteredList.length : random);
  };

  const handleYearFilter = (year: string) => {
    setYearFilter((prev) => (prev === year ? null : year));
    setCurrentIndex(0);
  };

  const handleLetterFilter = (letter: string) => {
    setLetterFilter((prev) => (prev === letter ? null : letter));
    setCurrentIndex(0);
  };

  const openModal = (art: Artwork) => {
    setModalArtwork(art);
    setZoom(1);
  };

  const closeModal = () => {
    setModalArtwork(null);
  };

  const downloadArtwork = (art: Artwork) => {
    if (typeof document === "undefined") return;
    const link = document.createElement("a");
    link.href = art.src;
    link.download = `${art.title.replace(/\s+/g, "_")}_${art.artist}.jpg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareArtwork = async (art: Artwork) => {
    const shareFn = (navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
    }).share;
    if (shareFn) {
      try {
        await shareFn({
          title: art.title,
          text: `${art.title} by ${art.artist}`,
          url: art.src,
        });
      } catch {
        // ignored
      }
      return;
    }
    if ("clipboard" in navigator && navigator.clipboard) {
      await navigator.clipboard.writeText(`${art.title} — ${art.src}`);
    }
  };

  const handleFullscreen = () => {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => null);
    } else {
      document.exitFullscreen().catch(() => null);
    }
  };

  const renderControlPanel = () => (
    <>
      <div className="flex items-center gap-3">
        <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-sky-500 text-xl font-semibold tracking-wide text-white shadow-lg shadow-purple-500/50 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <span className="relative z-10">AG</span>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/70 font-medium">
            Virtual Gallery
          </p>
          <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Art Collection
          </h1>
        </div>
      </div>

      <div className="relative rounded-xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-3 shadow-lg shadow-purple-500/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-sky-500/10 opacity-50"></div>
        <div className="relative z-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-purple-300/80 font-semibold">
            Now Viewing
          </p>
          <div className="mt-2 flex items-center gap-2 text-2xl font-bold">
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">{currentIndex + 1}</span>
            <span className="text-white/40">/</span>
            <span className="text-white/60">{filteredList.length}</span>
          </div>
          <p className="mt-2 text-base font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent line-clamp-1">{currentArtwork?.title || 'No artwork found'}</p>
          <p className="text-xs text-purple-200/80 font-medium">
            {currentArtwork?.artist || 'Unknown'} • {currentArtwork?.year || 'N/A'}
          </p>
          <p className="mt-2 max-h-16 overflow-hidden text-xs text-white/70 line-clamp-2">
            {currentArtwork?.desc || 'No description available'}
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-semibold">
            Navigation
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              onClick={() => goTo(currentIndex - 1)}
              className="group flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 py-2 text-xs font-semibold text-white transition-all duration-300 hover:border-purple-400/50 hover:from-purple-500/30 hover:to-pink-500/30 hover:shadow-lg hover:shadow-purple-500/30 active:scale-95"
            >
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Prev
            </button>
            <button
              onClick={() => goTo(currentIndex + 1)}
              className="group flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-gradient-to-r from-pink-500/20 to-purple-500/20 py-2 text-xs font-semibold text-white transition-all duration-300 hover:border-pink-400/50 hover:from-pink-500/30 hover:to-purple-500/30 hover:shadow-lg hover:shadow-pink-500/30 active:scale-95"
            >
              Next
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-semibold">
            Actions
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              onClick={handleShuffle}
              className="group flex items-center justify-center gap-1.5 rounded-xl border border-pink-500/40 bg-gradient-to-r from-pink-500/40 to-purple-500/40 py-2 text-xs font-semibold text-white transition-all duration-300 hover:from-pink-500/60 hover:to-purple-500/60 hover:shadow-xl hover:shadow-pink-500/40 hover:scale-105 active:scale-95"
            >
              <Shuffle className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
              Surprise
            </button>
            <button
              onClick={() => openModal(currentArtwork)}
              className="group flex items-center justify-center gap-1.5 rounded-xl border border-sky-500/40 bg-gradient-to-r from-sky-500/30 to-blue-500/30 py-2 text-xs font-semibold text-white transition-all duration-300 hover:border-sky-400/50 hover:from-sky-500/50 hover:to-blue-500/50 hover:shadow-xl hover:shadow-sky-500/40 hover:scale-105 active:scale-95"
            >
              <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
              Details
            </button>
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-semibold">
                Music
              </p>
              <p className="text-xs text-white/70">
                Ambient score
              </p>
            </div>
            <button
              onClick={() => setIsMusicOn((prev) => !prev)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:border-white/40 hover:bg-white/20"
            >
              {isMusicOn ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
          </div>

          <button
            onClick={handleFullscreen}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-1.5 text-xs text-white/80 transition hover:border-white/30 hover:bg-white/10"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Fullscreen
          </button>
        </div>

        <p className="text-[10px] text-white/60 leading-relaxed">
          Use arrow keys or swipe to explore.
        </p>
      </section>
    </>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0a0118] via-[#04030b] to-[#0f0520]">
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <motion.span
            key={index}
            className="absolute rounded-full blur-[140px]"
            style={{
              width: index === 0 || index === 3 ? "400px" : "350px",
              height: index === 0 || index === 3 ? "400px" : "350px",
              background:
                index === 0
                  ? "radial-gradient(circle, rgba(255,107,157,0.35) 0%, rgba(255,107,157,0) 70%)"
                  : index === 1
                    ? "radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(168,85,247,0) 70%)"
                    : index === 2
                      ? "radial-gradient(circle, rgba(56,189,248,0.35) 0%, rgba(56,189,248,0) 70%)"
                      : index === 3
                        ? "radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(236,72,153,0) 70%)"
                        : "radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(99,102,241,0) 70%)",
              top: index === 0 ? "15%" : index === 1 ? "50%" : index === 2 ? "5%" : index === 3 ? "70%" : "35%",
              left: index === 0 ? "3%" : index === 1 ? "65%" : index === 2 ? "45%" : index === 3 ? "80%" : "25%",
            } as React.CSSProperties}
            animate={{
              scale: [0.85, 1.15, 0.9],
              opacity: [0.5, 0.8, 0.55],
              x: [0, index % 2 === 0 ? 30 : -30, 0],
              y: [0, index % 2 === 0 ? -20 : 20, 0],
            }}
            transition={{
              duration: 15 + index * 2,
              repeat: Infinity,
              delay: index * 1.8,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.3)_100%)]"></div>

      <main className="relative z-10 mx-auto flex w-full max-w-[1900px] flex-col gap-3 px-3 py-4 sm:gap-4 sm:px-4 sm:py-6 lg:flex-row lg:gap-4 lg:px-6 lg:py-8">
        <aside className="flex w-full flex-col gap-4 rounded-2xl border border-white/5 bg-white/5 bg-gradient-to-b from-white/10 to-white/5 p-4 text-slate-100 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:rounded-2xl sm:p-5 lg:w-64 xl:w-72">
          {renderControlPanel()}
        </aside>

        <section className="flex w-full flex-col gap-6 lg:flex-1 lg:min-w-0">
          <div className="relative min-h-[28rem] overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#090920] via-[#050312] to-[#090920] p-4 shadow-[0px_20px_60px_rgba(0,0,0,0.55)] sm:min-h-[32rem] sm:rounded-[2.5rem] sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_50%)]" />

            <Carousel
              opts={{ align: "center", loop: true }}
              setApi={setCarouselApi}
              className="relative h-full w-full"
            >
              <CarouselContent className="h-full">
                {filteredList.map((art, index) => {
                  const isActive = index === currentIndex;
                  return (
                    <CarouselItem
                      key={art.id}
                      className="basis-full md:basis-3/4 lg:basis-2/3 xl:basis-1/2"
                    >
                      <Card
                        className={`flex h-full flex-col overflow-hidden rounded-3xl transition-all duration-700 ${
                          isActive
                            ? "border-2 border-purple-400/60 bg-gradient-to-br from-purple-500/10 to-pink-500/10 shadow-[0_0_80px_rgba(168,85,247,0.5)] scale-105"
                            : "border border-white/10 bg-white/[0.04] opacity-60 scale-95"
                        }`}
                      >
                        <div className="relative h-64 overflow-hidden rounded-[1.75rem] md:h-80">
                          <motion.img
                            src={art.src}
                            alt={art.title}
                            className="h-full w-full object-cover cursor-pointer"
                            loading="lazy"
                            whileHover={{ scale: 1.08 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            onClick={() => openModal(art)}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                          <button
                            onClick={() => openModal(art)}
                            className="absolute bottom-4 right-4 rounded-full border border-white/40 bg-gradient-to-r from-purple-500/60 to-pink-500/60 px-5 py-2 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-white/80 hover:from-purple-500/80 hover:to-pink-500/80 hover:shadow-lg hover:shadow-purple-500/50 hover:scale-110 active:scale-95"
                          >
                            View
                          </button>
                        </div>
                        <CardContent className="space-y-2 p-3 sm:p-4">
                          <p className="text-xs uppercase tracking-[0.5em] text-purple-300/70 font-semibold">
                            {art.year}
                          </p>
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-lg font-bold text-white truncate sm:text-xl bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                              {art.title}
                            </h3>
                            <span className="text-xs text-purple-300/80 shrink-0 sm:text-sm font-semibold">
                              {index + 1}/{filteredList.length}
                            </span>
                          </div>
                          <p className="text-sm text-pink-200/80 font-medium sm:text-base">{art.artist}</p>
                          <p className="text-xs text-white/70 line-clamp-2 sm:text-sm">
                            {art.desc.slice(0, 120)}...
                          </p>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="hidden lg:flex" />
              <CarouselNext className="hidden lg:flex" />
            </Carousel>

            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/5 sm:rounded-[2.5rem]" />

            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-white/80 backdrop-blur">
              <Music3 className="h-4 w-4 text-sky-300" />
              Immersive mode
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                  Gesture Tips
                </p>
                <p>Drag, scroll or tap cards to open details</p>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <Wand2 className="h-4 w-4" />
                Embla-powered carousel
              </div>
            </div>
          </div>
        </section>

        <aside
          className={`flex w-full flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 text-white shadow-2xl shadow-black/40 backdrop-blur sm:gap-4 sm:rounded-2xl sm:p-4 lg:w-64 xl:w-72 lg:flex-shrink-0 ${
            guideCollapsed ? "max-h-16 overflow-hidden" : ""
          }`}
        >
          <button
            onClick={() => setGuideCollapsed((prev) => !prev)}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:bg-white/10 lg:hidden"
          >
            <span>Collection Guide</span>
            <span>{guideCollapsed ? "Expand" : "Hide"}</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-semibold">
                Guide Panel
              </p>
              <h2 className="text-base font-semibold">Explore catalog</h2>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <label className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-semibold">
              Search & Sort
            </label>
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-900/40 to-pink-900/40 px-3 py-2 shadow-lg shadow-purple-500/20 focus-within:border-purple-400/60 focus-within:shadow-purple-500/30 transition-all duration-300">
                <Search className="h-3.5 w-3.5 text-purple-300" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search artworks..."
                  className="w-full bg-transparent text-xs text-white placeholder:text-purple-200/50 focus:outline-none"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-[10px] text-purple-300/70 transition hover:text-pink-300 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-900/40 to-pink-900/40 px-3 py-2 text-xs text-white font-medium shadow-lg shadow-purple-500/10 hover:border-purple-400/50 transition-all duration-300 cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="bg-[#05050a] text-white"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-semibold">
              Alphabetical
            </p>
            <div className="mt-2 grid grid-cols-6 gap-1.5 text-xs text-white/70">
              {alphabet.map((letter) => {
                const disabled = !artworks.some((art) =>
                  art.title.toUpperCase().startsWith(letter),
                );
                return (
                  <button
                    key={letter}
                    disabled={disabled}
                    onClick={() => handleLetterFilter(letter)}
                    className={`rounded-lg border px-1.5 py-0.5 text-[10px] transition-all duration-300 font-semibold ${
                      letterFilter === letter
                        ? "border-purple-400/80 bg-gradient-to-r from-purple-500/40 to-pink-500/40 text-white shadow-lg shadow-purple-500/30 scale-110"
                        : "border-white/15 bg-gradient-to-r from-purple-900/20 to-pink-900/20 text-white/70 hover:border-purple-400/40 hover:text-white hover:scale-105"
                    } ${disabled ? "cursor-not-allowed opacity-30" : ""}`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-white/60 font-semibold">
              <Filter className="h-3 w-3" />
              Year Filter
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                onClick={() => setYearFilter(null)}
                className={`rounded-full px-2.5 py-1 text-xs transition-all duration-300 font-semibold ${
                  yearFilter === null
                    ? "border-2 border-purple-400 bg-gradient-to-r from-purple-500/40 to-pink-500/40 text-white shadow-lg shadow-purple-500/30 scale-105"
                    : "border border-white/15 bg-gradient-to-r from-purple-900/20 to-pink-900/20 text-white/70 hover:border-purple-400/40 hover:text-white hover:scale-105"
                }`}
              >
                All
              </button>
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => handleYearFilter(year)}
                  className={`rounded-full px-2.5 py-1 text-xs transition-all duration-300 font-semibold ${
                    yearFilter === year
                      ? "border-2 border-sky-400 bg-gradient-to-r from-sky-500/40 to-blue-500/40 text-white shadow-lg shadow-sky-500/30 scale-105"
                      : "border border-white/15 bg-gradient-to-r from-sky-900/20 to-blue-900/20 text-white/70 hover:border-sky-400/40 hover:text-white hover:scale-105"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-semibold">
              Stats
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-white/10 bg-black/20 p-2">
                <p className="text-xl font-semibold">{stats.total}</p>
                <p className="text-[10px] text-white/60">Artworks</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-2">
                <p className="text-xl font-semibold">{stats.artists}</p>
                <p className="text-[10px] text-white/60">Artists</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-2">
                <p className="text-base font-semibold">{stats.range}</p>
                <p className="text-[10px] text-white/60">Years</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between text-xs text-white/70">
              <p>{filteredList.length} pieces</p>
              <p>Tap to view</p>
            </div>
            <div className="mt-2 flex max-h-[20rem] flex-col gap-2 overflow-y-auto pr-1">
              {filteredList.map((art, filteredIndex) => {
                return (
                  <button
                    key={art.id}
                    onClick={() => goTo(filteredIndex)}
                    className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 text-left transition ${
                      filteredIndex === currentIndex
                        ? "border-white/40 bg-white/10"
                        : "border-white/10 bg-black/20 hover:border-white/40"
                    }`}
                  >
                    <img
                      src={art.src}
                      alt={art.title}
                      className="h-10 w-10 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <div className="flex flex-1 flex-col">
                      <p className="font-medium text-white text-xs line-clamp-1">{art.title}</p>
                      <p className="text-[10px] text-white/60">
                        {art.artist} • {art.year}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </main>

      <AnimatePresence>
        {modalArtwork && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="relative mx-2 flex w-full max-w-5xl flex-col gap-4 rounded-2xl border border-white/10 bg-[#05050c] p-4 text-white shadow-2xl sm:mx-4 sm:gap-6 sm:rounded-3xl sm:p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 140, damping: 20 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute right-4 top-4 rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:border-white/40 hover:text-white sm:right-6 sm:top-6 sm:rounded-2xl"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 sm:rounded-3xl">
                  <motion.img
                    key={modalArtwork.id}
                    src={modalArtwork.src}
                    alt={modalArtwork.title}
                    className="h-64 w-full object-cover sm:h-80 lg:h-[28rem]"
                    style={{ transform: `scale(${zoom})` } as React.CSSProperties}
                  />
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-black/50 px-4 py-2 backdrop-blur">
                    <button
                      onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.2))}
                      className="rounded-full border border-white/10 p-2 transition hover:border-white/40"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-white/70">
                      {(zoom * 100).toFixed(0)}%
                    </span>
                    <button
                      onClick={() => setZoom((prev) => Math.min(3, prev + 0.2))}
                      className="rounded-full border border-white/10 p-2 transition hover:border-white/40"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                      Immersive view
                    </p>
                    <h3 className="mt-3 text-xl font-semibold sm:text-2xl lg:text-3xl">
                      {modalArtwork.title}
                    </h3>
                    <p className="text-base text-white/70 sm:text-lg">
                      {modalArtwork.artist} • {modalArtwork.year}
                    </p>
                    <p className="mt-4 text-sm text-white/70">
                      {modalArtwork.desc}
                    </p>
                  </div>
                  <div className="grid gap-2 sm:gap-3 sm:grid-cols-3">
                    <button
                      onClick={() => downloadArtwork(modalArtwork)}
                      className="rounded-2xl border border-sky-500/40 bg-gradient-to-r from-sky-500/50 to-purple-500/50 px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:border-sky-400/60 hover:from-sky-500/70 hover:to-purple-500/70 hover:shadow-xl hover:shadow-sky-500/40 hover:scale-105 active:scale-95"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => shareArtwork(modalArtwork)}
                      className="rounded-2xl border border-purple-500/40 bg-gradient-to-r from-purple-500/30 to-pink-500/30 px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:border-purple-400/60 hover:from-purple-500/50 hover:to-pink-500/50 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 active:scale-95"
                    >
                      Share
                    </button>
                    <button className="rounded-2xl border border-pink-500/40 bg-gradient-to-r from-pink-500/30 to-red-500/30 px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:border-pink-400/60 hover:from-pink-500/50 hover:to-red-500/50 hover:shadow-xl hover:shadow-pink-500/40 hover:scale-105 active:scale-95">
                      Favorite
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0a0118] via-black to-[#0f0520]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full blur-[100px]"
                  style={{
                    width: "300px",
                    height: "300px",
                    background: i === 0 ? "rgba(168,85,247,0.4)" : i === 1 ? "rgba(236,72,153,0.4)" : "rgba(56,189,248,0.4)",
                    top: i === 0 ? "20%" : i === 1 ? "60%" : "40%",
                    left: i === 0 ? "20%" : i === 1 ? "60%" : "50%",
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 0.8,
                  }}
                />
              ))}
            </motion.div>
            <motion.div
              className="relative flex flex-col items-center gap-6 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-sky-900/40 px-12 py-10 text-white shadow-2xl shadow-purple-500/50 backdrop-blur-xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <motion.div
                className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-500 via-purple-500 to-sky-500 text-3xl font-bold shadow-2xl shadow-purple-500/50"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { repeat: Infinity, duration: 3, ease: "linear" },
                  scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                }}
              >
                AG
              </motion.div>
              <div className="text-center">
                <motion.p 
                  className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Loading Gallery
                </motion.p>
                <p className="mt-2 text-sm text-purple-200/70">Curating immersive art space…</p>
              </div>
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-2 w-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-400"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <audio
        ref={audioRef}
        loop
        preload="metadata"
        src="https://www.bensound.com/bensound-music/bensound-relaxing.mp3"
      />
    </div>
  );
}
