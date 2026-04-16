"use client";

import React, { useState } from "react";
import SharedLayout from "../../components/SharedLayout";
import DonationModal from "../../components/DonationModal";

// Design Tokens
const colors = {
  primary: "#97453e",
  primaryContainer: "#f28d83",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#6e2621",
  secondary: "#a8372c",
  secondaryContainer: "#ff7766",
  tertiary: "#775a00",
  surface: "#fcf9f8",
  surfaceContainer: "#f0edec",
  surfaceContainerLow: "#f6f3f2",
  surfaceContainerHigh: "#eae7e7",
  surfaceContainerHighest: "#e5e2e1",
  surfaceContainerLowest: "#ffffff",
  onSurface: "#1b1c1b",
  onSurfaceVariant: "#554240",
  outlineVariant: "#dac1be",
} as const;

interface Campaign {
  id: string;
  imageSrc: string;
  imageAlt: string;
  category: string;
  title: string;
  description: string;
  raised: string;
  goal: string;
  progressPct: number;
}

const ALL_CAMPAIGNS: Campaign[] = [
  {
    id: "campaign-1",
    imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuAp_pkQR3kWjqbJPLUmBvh1hkdW3PpTlT8COD7fDsebovTCslBusGN9Ok72C8ZWGLtQEHLon8nO8SCNXXT784VEb6d9gC9OT7F4n7kNpEj4jSFIvBrkdJ4OTq_kWtkVPpkmT74Xn3weEEhCwuJ-Jx8oALUQ3fSa9MA9fEpSpuf5_gvS5V90cxebunrLmYxlG20nCoIoBuDyzSTMN7kpVy6lHqrGeAIc5zaYGE4U8BIXIRfMoxcjtNHOFztz5Ky3QpIJ6GJPXgeJV7Vw",
    imageAlt: "Ancient sun-drenched forest with towering trees and a clear river",
    category: "Environment",
    title: "Reforest the Ancient Valley",
    description: "Restoring the vital lung of the Northern Province by planting 10,000 indigenous trees.",
    raised: "₱12,000",
    goal: "₱27,000",
    progressPct: 45,
  },
  {
    id: "campaign-2",
    imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzYjzjXw4izkU-j9X_8D1URwiBCtwJj30s-H1ScrkJepyx_y4BlFNMF5XcIZaHgEwboCNtQIljiIUcYgVkX9N0Tmozb_BVpkBhII58JkAwCIy29Pf0DTTaDHE73ojkBzvECDjyEm4fZ29SAfCfJR2XM4Ucgxf_xBB7LyKzOibmi30-UIASSeCXrMp0ssdcfK1cS8AGGZIvGnf8dexa27M-kQOpUCbVJUI5LZYZ5EWkMsJhjLQ8HD7ymf8G4jUpIMqVHIjRm0BkBqFM",
    imageAlt: "A modern mobile health clinic van in a remote rural village setting",
    category: "Health",
    title: "Rural Mobile Health Units",
    description: "Bringing critical diagnostic care and vaccines to underserved mountainous regions.",
    raised: "₱44,800",
    goal: "₱51,000",
    progressPct: 88,
  },
  {
    id: "campaign-3",
    imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5UsCKSiNJdAqBoxrbgQZ-Xp3Pz5lI7sdU7mDTj90tj3FsDHa_h1tFivvPQhiIHOlz_kim1OLj6YrH482gZA9fTCOqtLx3ekbv51PxgP7baDDYqmw8T405A-3sqtE9gc2QP18nd22xH3kcPIfI2re76nW6ipHzDdEWFgc2xOc7E3Jw7CBh_6E-iFYlsiNjpLg24oDf1DALFWpWAi-0L_rJBdI0L8LVh7qZkJVdJN9Cc6HxtFQbRtklqpiXeWFZuEazw0nW2dogH2zM",
    imageAlt: "Group of community volunteers working together on a construction project",
    category: "Disaster Relief",
    title: "Coastal Resilience Hubs",
    description: "Building fortified community centers that serve as shelters during hurricane season.",
    raised: "₱32,000",
    goal: "₱100,000",
    progressPct: 32,
  },
  {
    id: "campaign-4",
    imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEwlhzTYFNViTacaL4hrAem7JPkDegYOMraAshkQ97xlsUz3xSNQFPoYVuxP4N2BAYKvB8R1AHl-Loqpdx42E2JMeOUxj70voxUiAw8UtY2uwt95aQ6OUe2vHbk-Uz3owjDynd8k8B3g2tZNN-LzC6dn72d1IPHnv7fSRr4frg-nG852aGpV0HDf8U_qAuYERnOJJFn43E4O2YwCkT7eBjtA9A3XkaYyff8nf6m4Bz0eYg88PqwVa8xYfsRWliTBXvx_W_N4LRhWYX",
    imageAlt: "A bright classroom with eager young students",
    category: "Education",
    title: "Empower a New Generation of Scholars",
    description: "Providing scholarships, supplies, and mentorship to 500 students this semester.",
    raised: "₱42,300",
    goal: "₱60,000",
    progressPct: 70,
  },
];

const FILTER_CATEGORIES = ["All", "Education", "Health", "Environment", "Disaster Relief"] as const;

export default function ExplorePage() {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredCampaigns = activeFilter === "All" 
    ? ALL_CAMPAIGNS 
    : ALL_CAMPAIGNS.filter(c => c.category === activeFilter);

  const handleCampaignClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  return (
    <SharedLayout currentPage="explore">
      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "2rem 3rem 4rem" }}>
        {/* Header */}
        <header style={{ marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "3.5rem", fontWeight: 800, color: colors.primary, marginBottom: "1rem", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1 }}>
            Explore Campaigns
          </h1>
          <p style={{ color: colors.onSurfaceVariant, fontSize: "1.125rem", lineHeight: 1.6, maxWidth: "800px" }}>
            Discover meaningful causes and make a lasting impact. Every contribution brings hope to communities in need.
          </p>
        </header>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "3rem", flexWrap: "wrap" }}>
          {FILTER_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "999px",
                border: "none",
                cursor: "pointer",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 600,
                fontSize: "0.875rem",
                transition: "all 0.2s",
                background: activeFilter === category ? colors.primaryContainer : colors.surfaceContainerLow,
                color: activeFilter === category ? colors.onPrimaryContainer : colors.onSurfaceVariant,
              }}
              onMouseEnter={(e) => {
                if (activeFilter !== category) {
                  e.currentTarget.style.background = colors.surfaceContainer;
                }
              }}
              onMouseLeave={(e) => {
                if (activeFilter !== category) {
                  e.currentTarget.style.background = colors.surfaceContainerLow;
                }
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Campaigns Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "2rem" }}>
          {filteredCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              onClick={() => handleCampaignClick(campaign)}
              style={{
                background: colors.surfaceContainerLowest,
                borderRadius: "1.5rem",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.3s",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(151,69,62,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
              }}
            >
              {/* Image */}
              <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden" }}>
                <img
                  src={campaign.imageSrc}
                  alt={campaign.imageAlt}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{ position: "absolute", top: "1rem", left: "1rem" }}>
                  <span style={{
                    background: colors.surfaceContainerLowest,
                    padding: "0.375rem 0.875rem",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontFamily: "Manrope, sans-serif",
                    color: colors.onSurface,
                  }}>
                    {campaign.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: colors.onSurface, marginBottom: "0.75rem", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.2 }}>
                  {campaign.title}
                </h3>
                <p style={{ color: colors.onSurfaceVariant, fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1.5rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {campaign.description}
                </p>

                {/* Progress */}
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ height: "0.5rem", width: "100%", background: colors.surfaceContainerHigh, borderRadius: "999px", overflow: "hidden", marginBottom: "0.75rem" }}>
                    <div style={{ height: "100%", width: `${campaign.progressPct}%`, background: `linear-gradient(to right, ${colors.primary}, ${colors.secondaryContainer})`, borderRadius: "999px" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.onSurface, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                      {campaign.raised} <span style={{ fontSize: "0.875rem", fontWeight: 400, color: colors.onSurfaceVariant }}>raised</span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCampaignClick(campaign);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: colors.primary,
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        cursor: "pointer",
                        textDecoration: "underline",
                        textDecorationColor: colors.primaryContainer,
                        textUnderlineOffset: "4px",
                      }}
                    >
                      Support
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCampaigns.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <p style={{ fontSize: "1.25rem", color: colors.onSurfaceVariant, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              No campaigns found in this category.
            </p>
          </div>
        )}
      </div>

      {/* Donation Modal */}
      {selectedCampaign && (
        <DonationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          campaign={{
            id: selectedCampaign.id,
            title: selectedCampaign.title,
            description: selectedCampaign.description,
            category: selectedCampaign.category,
            imageSrc: selectedCampaign.imageSrc,
          }}
        />
      )}
    </SharedLayout>
  );
}
