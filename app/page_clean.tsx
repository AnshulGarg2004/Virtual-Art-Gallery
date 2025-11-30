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
  const [isAutoRotate, setIsAutoRotate] = useState(false);
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
    if (!isAutoRotate || filteredList.length === 0) return;
    const ticker = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredList.length);
    }, 3000);
    return () => clearInterval(ticker);
  }, [isAutoRotate, filteredList.length]);

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-purple-900/50 to-slate-900/90 p-6 backdrop-blur-xl">
            <div className="mb-4">
              <span className="inline-block rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 px-3 py-1 text-xs font-semibold text-violet-300 border border-violet-500/30">
                Now Viewing
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black bg-gradient-to-br from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                  {currentIndex + 1}
                </span>
                <span className="text-2xl text-slate-600">/</span>
                <span className="text-2xl font-bold text-slate-400">{filteredList.length}</span>
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{currentArtwork?.title || 'No artwork'}</h2>
                <p className="text-sm text-slate-400">{currentArtwork?.artist || 'Unknown'}</p>
                <p className="mt-1 inline-block rounded-lg bg-gradient-to-r from-violet-500/10 to-cyan-500/10 px-2 py-1 text-xs font-medium text-violet-300 border border-violet-500/20">
                  {currentArtwork?.year || 'N/A'}
                </p>
              </div>
              
              <p className="text-sm text-slate-400 line-clamp-4 leading-relaxed">
                {currentArtwork?.desc || 'No description available'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-purple-900/50 to-slate-900/90 p-4 backdrop-blur-xl">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Navigate</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => goTo(currentIndex - 1)}
                className="group flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 py-3 text-sm font-semibold text-white transition-all hover:from-violet-500/20 hover:to-fuchsia-500/20 hover:border-violet-500/30 hover:scale-105"
              >
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Prev
              </button>
              <button
                onClick={() => goTo(currentIndex + 1)}
                className="group flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-gradient-to-r from-fuchsia-500/10 to-cyan-500/10 py-3 text-sm font-semibold text-white transition-all hover:from-fuchsia-500/20 hover:to-cyan-500/20 hover:border-fuchsia-500/30 hover:scale-105"
              >
                Next
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                onClick={handleShuffle}
                className="group flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-gradient-to-r from-pink-500/20 via-rose-500/20 to-orange-500/20 py-3 text-sm font-semibold text-white transition-all hover:from-pink-500/30 hover:via-rose-500/30 hover:to-orange-500/30 hover:scale-105"
              >
                <Shuffle className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                Random
              </button>
              <button
                onClick={() => openModal(currentArtwork)}
                className="group flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 py-3 text-sm font-semibold text-white transition-all hover:from-violet-500/30 hover:to-cyan-500/30 hover:scale-105"
              >
                <Sparkles className="h-4 w-4" />
                View
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-purple-900/50 to-slate-900/90 p-4 backdrop-blur-xl">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Collection Stats</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 p-3 border border-violet-500/20">
                <p className="text-2xl font-black bg-gradient-to-br from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{stats.total}</p>
                <p className="text-[10px] text-slate-400 mt-1">Works</p>
              </div>
              <div className="text-center rounded-xl bg-gradient-to-br from-fuchsia-500/10 to-pink-500/10 p-3 border border-fuchsia-500/20">
                <p className="text-2xl font-black bg-gradient-to-br from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">{stats.artists}</p>
                <p className="text-[10px] text-slate-400 mt-1">Artists</p>
              </div>
              <div className="text-center rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-3 border border-cyan-500/20">
                <p className="text-sm font-black bg-gradient-to-br from-cyan-400 to-blue-400 bg-clip-text text-transparent">{stats.range}</p>
                <p className="text-[10px] text-slate-400 mt-1">Years</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <main className="relative z-10 mx-auto w-full max-w-7xl px-6 py-8">
        {renderControlPanel()}
      </main>
    </div>
  );
}