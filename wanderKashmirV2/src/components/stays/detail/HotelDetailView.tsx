"use client";

import React from "react";
import { HotelDetailViewModel } from "./types";
import HotelHero from "./HotelHero";
import HotelQuickFacts from "./HotelQuickFacts";
import HotelSectionNav from "./HotelSectionNav";
import HotelOverview from "./HotelOverview";
import HotelRooms from "./HotelRooms";
import HotelAmenities from "./HotelAmenities";
import HotelDining from "./HotelDining";
import HotelExperiences from "./HotelExperiences";
import HotelMedia from "./HotelMedia";
import HotelLocation from "./HotelLocation";
import HotelReviews from "./HotelReviews";
import HotelPolicies from "./HotelPolicies";
import HotelTrust from "./HotelTrust";
import HotelBookingCTA from "./HotelBookingCTA";
import HotelInternalLinks from "./HotelInternalLinks";
import HotelFaqs from "./HotelFaqs";
import PageHotelEmptyState from "./HotelEmptyState";

interface HotelDetailViewProps {
  hotel: HotelDetailViewModel | null;
  slug?: string;
}

export default function HotelDetailView({ hotel, slug }: HotelDetailViewProps) {
  if (!hotel) {
    return <PageHotelEmptyState slug={slug} />;
  }

  const hasRooms = hotel.rooms && hotel.rooms.length > 0;
  const hasAmenities = hotel.allAmenities && hotel.allAmenities.length > 0;
  const hasDining = hotel.dining.hasDining || hotel.dining.mealPlans.length > 0;
  const hasExperiences = hotel.experiences && hotel.experiences.length > 0;
  const hasPhotos = hotel.media.images && hotel.media.images.length > 0;
  const hasLocation = Boolean(hotel.location.address);
  const hasReviews = hotel.reviews.reviews && hotel.reviews.reviews.length > 0;
  const hasPolicies = true; // Always display standard check-in/out and ID policies

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* 1. Hero & Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <HotelHero hotel={hotel} />
      </div>

      {/* 2. Quick Property Facts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HotelQuickFacts hotel={hotel} />
      </div>

      {/* 3. Sticky Section Navigation */}
      <HotelSectionNav
        hasRooms={hasRooms}
        hasAmenities={hasAmenities}
        hasDining={hasDining}
        hasExperiences={hasExperiences}
        hasPhotos={hasPhotos}
        hasLocation={hasLocation}
        hasReviews={hasReviews}
        hasPolicies={hasPolicies}
      />

      {/* 4. Main Body Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-12 sm:space-y-14">
        {/* Overview */}
        <HotelOverview
          hotelName={hotel.basic.name}
          overview={hotel.overview}
        />

        {/* Rooms & Tariffs */}
        <HotelRooms
          hotelName={hotel.basic.name}
          rooms={hotel.rooms}
        />

        {/* Amenities */}
        <HotelAmenities
          groups={hotel.amenities}
          allAmenities={hotel.allAmenities}
        />

        {/* Dining */}
        <HotelDining dining={hotel.dining} />

        {/* Experiences */}
        <HotelExperiences
          experiences={hotel.experiences}
          destinationHub={hotel.location.destinationHub}
        />

        {/* Media Gallery */}
        <HotelMedia
          media={hotel.media}
          hotelName={hotel.basic.name}
        />

        {/* Location & Map */}
        <HotelLocation
          location={hotel.location}
          hotelName={hotel.basic.name}
        />

        {/* Guest Reviews */}
        <HotelReviews
          reviews={hotel.reviews}
          hotelName={hotel.basic.name}
        />

        {/* Policies */}
        <HotelPolicies
          policies={hotel.policies}
          hotelName={hotel.basic.name}
        />

        {/* Trust & E-E-A-T */}
        <HotelTrust
          trust={hotel.trust}
          hotelName={hotel.basic.name}
        />

        {/* Conversion Block */}
        <HotelBookingCTA
          conversion={hotel.conversion}
          hotelName={hotel.basic.name}
          destinationHub={hotel.location.destinationHub}
        />

        {/* Internal Linking */}
        <HotelInternalLinks
          destinationHub={hotel.location.destinationHub}
          destinationSlug={hotel.location.destinationSlug}
          propertyType={hotel.basic.propertyType}
        />

        {/* Supporting FAQs */}
        {hotel.faqs.length > 0 && (
          <HotelFaqs faqs={hotel.faqs} hotelName={hotel.basic.name} />
        )}
      </div>
    </div>
  );
}
