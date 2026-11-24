"use client";

import HotelGallery from "@/components/stays/detail/HotelGallery";

interface TourBentoGalleryProps {
  title: string;
  images: string[];
  emptySubtitle?: string;
}

export default function TourBentoGallery({
  title,
  images,
  emptySubtitle = "Verified tour photography will appear here once submitted and approved by WanderKashmir.",
}: TourBentoGalleryProps) {
  return (
    <HotelGallery
      title={title}
      images={images}
      emptySubtitle={emptySubtitle}
    />
  );
}
