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

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [modalArtwork, setModalArtwork] = useState<Artwork | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);

  const filteredList = artworks;
  const currentArtwork = filteredList[currentIndex] || filteredList[0];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (filteredList.length === 0) return;
      const target = (index + filteredList.length) % filteredList.length;
      setCurrentIndex(target);
      carouselApi?.scrollTo(target);
    },
    [carouselApi, filteredList.length],
  );

  const openModal = (art: Artwork) => {
    setModalArtwork(art);
    setZoom(1);
  };

  const closeModal = () => {
    setModalArtwork(null);
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