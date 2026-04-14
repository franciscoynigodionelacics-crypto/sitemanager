"use client";

import React, { useState } from "react";
import SharedLayout from "../../components/SharedLayout";
import DonationModal from "../../components/DonationModal";

// Design Tokens
const C = {
  primary: "#97453e",
  primaryContainer: "#f28d83",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#6e2621",
  secondary: "#a8372c",
  secondaryContainer: "#ff7766",
  onSecondaryContainer: "#710d09",
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

interface CampaignCardProps {
  imageSrc: string;
  imageAlt: string;
  category: string;
  title: string;
  description: string;
  raised: string;
  progressPct: number;
}

const CampaignCard = React.memo<CampaignCardProps>(
  ({ imageSrc, imageAlt, category, title, description, raised, progressPct }) => {
    const [hovered, setHovered] = useState(false);
    return (
      <div
        style={{ display: "flex", flexDirection: "column", gap: "1.5rem", cursor: "pointer" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image */}
        <div
          style={{
            aspectRatio: "4/3",
            borderRadius: "1rem",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <img
            src={imageSrc}
            alt={imageAlt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.7s",
              transform: hovered ? "scale(1.1)" : "scale(1)",
            }}
          />
          <div style={{ position: "absolute", top: "1rem", left: "1rem" }}>
            <span
              style={{
                background: "rgba(252,249,248,0.9)",
                backdropFilter: "blur(8px)",
                padding: "0.25rem 0.75rem",
                borderRadius: "999px",
                fontSize: "0.625rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: "Manrope, sans-serif",
              }}
            >
              {category}
            </span>
          </div>
        </div>

        {/* Text */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <h3
            style={{
              fontSize: "1.5rem",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 700,
              color: hovered ? C.primary : C.onSurface,
              transition: "color 0.15s",
              margin: 0,
            }}
          >
            {title}
          </h3>
          <p
            style={{
              color: C.onSurfaceVariant,
              fontSize: "0.875rem",
              lineHeight: 1.5,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </p>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div
            style={{
              width: "100%",
              height: "6px",
              background: C.surfaceContainerHigh,
              borderRadius: "999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                background: C.primary,
                borderRadius: "999px",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                fontFamily: "Plus Jakarta Sans, sans-serif",
              }}
            >
              {raised}{" "}
              <span style={{ color: "#a8a29e", fontWeight: 400 }}>raised</span>
            </span>
            <a
              href="#"
              style={{
                color: C.primary,
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: "0.875rem",
                textDecoration: "none",
                borderBottom: "2px solid transparent",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderBottomColor = C.primary)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderBottomColor = "transparent")
              }
            >
              Support
            </a>
          </div>
        </div>
      </div>
    );
  }
);
CampaignCard.displayName = "CampaignCard";

const CAMPAIGN_CARDS: (CampaignCardProps & { id: string })[] = [
  {
    id: "campaign-1",
    imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuAp_pkQR3kWjqbJPLUmBvh1hkdW3PpTlT8COD7fDsebovTCslBusGN9Ok72C8ZWGLtQEHLon8nO8SCNXXT784VEb6d9gC9OT7F4n7kNpEj4jSFIvBrkdJ4OTq_kWtkVPpkmT74Xn3weEEhCwuJ-Jx8oALUQ3fSa9MA9fEpSpuf5_gvS5V90cxebunrLmYxlG20nCoIoBuDyzSTMN7kpVy6lHqrGeAIc5zaYGE4U8BIXIRfMoxcjtNHOFztz5Ky3QpIJ6GJPXgeJV7Vw",
    imageAlt: "Ancient sun-drenched forest with towering trees and a clear river",
    category: "Environment",
    title: "Reforest the Ancient Valley",
    description: "Restoring the vital lung of the Northern Province by planting 10,000 indigenous trees.",
    raised: "$12,000",
    progressPct: 45,
  },
  {
    id: "campaign-2",
    imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzYjzjXw4izkU-j9X_8D1URwiBCtwJj30s-H1ScrkJepyx_y4BlFNMF5XcIZaHgEwboCNtQIljiIUcYgVkX9N0Tmozb_BVpkBhII58JkAwCIy29Pf0DTTaDHE73ojkBzvECDjyEm4fZ29SAfCfJR2XM4Ucgxf_xBB7LyKzOibmi30-UIASSeCXrMp0ssdcfK1cS8AGGZIvGnf8dexa27M-kQOpUCbVJUI5LZYZ5EWkMsJhjLQ8HD7ymf8G4jUpIMqVHIjRm0BkBqFM",
    imageAlt: "A modern mobile health clinic van in a remote rural village setting",
    category: "Health",
    title: "Rural Mobile Health Units",
    description: "Bringing critical diagnostic care and vaccines to underserved mountainous regions.",
    raised: "$44,800",
    progressPct: 88,
  },
  {
    id: "campaign-3",
    imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5UsCKSiNJdAqBoxrbgQZ-Xp3Pz5lI7sdU7mDTj90tj3FsDHa_h1tFivvPQhiIHOlz_kim1OLj6YrH482gZA9fTCOqtLx3ekbv51PxgP7baDDYqmw8T405A-3sqtE9gc2QP18nd22xH3kcPIfI2re76nW6ipHzDdEWFgc2xOc7E3Jw7CBh_6E-iFYlsiNjpLg24oDf1DALFWpWAi-0L_rJBdI0L8LVh7qZkJVdJN9Cc6HxtFQbRtklqpiXeWFZuEazw0nW2dogH2zM",
    imageAlt: "Group of community volunteers working together on a construction project",
    category: "Disaster Relief",
    title: "Coastal Resilience Hubs",
    description: "Building fortified community centers that serve as shelters during hurricane season.",
    raised: "$32,000",
    progressPct: 32,
  },
];

const FILTER_PILLS = ["All", "Education", "Health", "Environment", "Disaster Relief"] as const;

// Featured Campaign Data
const FEATURED_CAMPAIGN: CampaignCardProps & { id: string } = {
  id: "campaign-featured",
  imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEwlhzTYFNViTacaL4hrAem7JPkDegYOMraAshkQ97xlsUz3xSNQFPoYVuxP4N2BAYKvB8R1AHl-Loqpdx42E2JMeOUxj70voxUiAw8UtY2uwt95aQ6OUe2vHbk-Uz3owjDynd8k8B3g2tZNN-LzC6dn72d1IPHnv7fSRr4frg-nG852aGpV0HDf8U_qAuYERnOJJFn43E4O2YwCkT7eBjtA9A3XkaYyff8nf6m4Bz0eYg88PqwVa8xYfsRWliTBXvx_W_N4LRhWYX",
  imageAlt: "A bright classroom with eager young students in rural Africa",
  category: "Education",
  title: "Empower a New Generation of Scholars",
  description: "We believe education is the key to breaking the cycle of poverty. Join us in providing scholarships, supplies, and mentorship to 500 students this semester.",
  raised: "$42,300",
  progressPct: 70,
};

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [selectedCampaign, setSelectedCampaign] = useState<(CampaignCardProps & { id: string }) | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCampaignClick = (campaign: CampaignCardProps & { id: string }) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  return (
    <SharedLayout currentPage="home">
      <main style={{ paddingBottom: "4rem" }}>
        {/* Hero Section */}
        <section
          style={{
            padding: "4rem 3rem 6rem",
            maxWidth: "80rem",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "4rem",
          }}
        >
          {/* Left copy */}
          <div style={{ flex: 1, minWidth: "280px", display: "flex", flexDirection: "column", gap: "2rem" }}>
            <h1
              style={{
                fontSize: "clamp(3.5rem, 8vw, 5rem)",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 800,
                letterSpacing: "-0.05em",
                lineHeight: 0.9,
                color: C.onSurface,
                margin: 0,
              }}
            >
              fund{" "}
              <em
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontStyle: "italic",
                  fontWeight: 700,
                  color: C.primary,
                }}
              >
                stories
              </em>
              <br />
              that{" "}
              <em
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontStyle: "italic",
                  fontWeight: 700,
                  color: C.primary,
                }}
              >
                matter
              </em>
            </h1>

            <p
              style={{
                fontSize: "1.25rem",
                color: C.onSurfaceVariant,
                maxWidth: "32rem",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Fuel verified local initiatives and start your journey of compassion today. Every contribution is a heartbeat for change.
            </p>

            <div style={{ display: "flex", gap: "1rem", paddingTop: "1rem" }}>
              <button
                style={{
                  padding: "1rem 2rem",
                  background: C.primaryContainer,
                  color: C.onPrimaryContainer,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 600,
                  borderRadius: "1rem",
                  border: "none",
                  cursor: "pointer",
                  transition: "transform 0.15s",
                  fontSize: "1rem",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                Start Impact
              </button>
              <button
                style={{
                  padding: "1rem 2rem",
                  background: `${C.secondary}1a`,
                  color: C.secondary,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 600,
                  borderRadius: "1rem",
                  border: "none",
                  cursor: "pointer",
                  transition: "background 0.15s",
                  fontSize: "1rem",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = `${C.secondary}33`)}
                onMouseLeave={(e) => (e.currentTarget.style.background = `${C.secondary}1a`)}
              >
                Our Vision
              </button>
            </div>
          </div>

          {/* Right image */}
          <div style={{ flex: 1, minWidth: "280px", position: "relative" }}>
            <div
              style={{
                width: "100%",
                aspectRatio: "4/5",
                borderRadius: "1rem",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBI1BfmwHQwGAVxcZjih0sg322rLeYPde2axayCKDOuwipve2lvQQrTD_abyc3Y8bJPT7zqcHSPQCE9fHChfA7a4WCwPY58BLMy325QtSWCxtvT3UGuChj9SfT_px6u2gc5GhNRwToq-EZWJS5Y0e41ZEvWCIxzfwFuEZPMWPLT1B89SRltTyjH4CVa-sfDNtE8BBPFq3v_giNna9An1awL46hfnArFl0sTekViKoV-JyBbCP0Z-T3morcZSi65OtjhvzkP-Vf1DKFF"
                alt="Heartwarming close-up of hands joining together in a community setting"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(to top, ${C.surface} 0%, transparent 40%)`,
                  opacity: 0.4,
                }}
              />
            </div>

            {/* Floating stat card */}
            <div
              style={{
                position: "absolute",
                bottom: "-2rem",
                left: "-3rem",
                background: C.surfaceContainerLowest,
                padding: "2rem",
                borderRadius: "1rem",
                boxShadow: "0 25px 50px rgba(27,28,27,0.05)",
              }}
            >
              <p
                style={{
                  color: C.tertiary,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "1.875rem",
                  margin: "0 0 0.25rem",
                }}
              >
                12k+
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#78716c",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  margin: 0,
                }}
              >
                Lives Touched Globally
              </p>
            </div>
          </div>
        </section>

        {/* Discovery Filter Chips */}
        <section style={{ padding: "0 3rem 3rem", overflowX: "auto" }}>
          <div
            style={{
              maxWidth: "80rem",
              margin: "0 auto",
              display: "flex",
              gap: "0.75rem",
              paddingBottom: "1rem",
            }}
          >
            {FILTER_PILLS.map((pill) => (
              <button
                key={pill}
                onClick={() => setActiveFilter(pill)}
                style={{
                  padding: "0.625rem 1.5rem",
                  borderRadius: "999px",
                  background: activeFilter === pill ? "#7f1d1d" : C.surfaceContainerHigh,
                  color: activeFilter === pill ? "#ffffff" : C.onSurfaceVariant,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {pill}
              </button>
            ))}
          </div>
        </section>

        {/* Featured Campaign */}
        <section style={{ padding: "0 3rem 5rem" }}>
          <div
            style={{
              maxWidth: "80rem",
              margin: "0 auto",
              background: C.surfaceContainerLow,
              borderRadius: "1rem",
              overflow: "hidden",
              display: "flex",
              flexWrap: "wrap",
              border: `1px solid ${C.outlineVariant}1a`,
            }}
          >
            {/* Image */}
            <div style={{ flex: 1, minWidth: "300px", minHeight: "400px" }}>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEwlhzTYFNViTacaL4hrAem7JPkDegYOMraAshkQ97xlsUz3xSNQFPoYVuxP4N2BAYKvB8R1AHl-Loqpdx42E2JMeOUxj70voxUiAw8UtY2uwt95aQ6OUe2vHbk-Uz3owjDynd8k8B3g2tZNN-LzC6dn72d1IPHnv7fSRr4frg-nG852aGpV0HDf8U_qAuYERnOJJFn43E4O2YwCkT7eBjtA9A3XkaYyff8nf6m4Bz0eYg88PqwVa8xYfsRWliTBXvx_W_N4LRhWYX"
                alt="A bright classroom with eager young students in rural Africa"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                minWidth: "300px",
                padding: "4rem",
                display: "flex",
                flexDirection: "column",
                gap: "2rem",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "0.375rem 1rem",
                  background: "#fff1f2",
                  color: "#7f1d1d",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "Manrope, sans-serif",
                  width: "fit-content",
                }}
              >
                Featured Initiative
              </span>

              <h2
                style={{
                  fontSize: "clamp(1.75rem, 3vw, 3rem)",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  color: C.onSurface,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  margin: 0,
                }}
              >
                Empower a New Generation of Scholars
              </h2>

              <p style={{ color: C.onSurfaceVariant, lineHeight: 1.6, margin: 0 }}>
                We believe education is the key to breaking the cycle of poverty. Join us in providing scholarships, supplies, and mentorship to 500 students this semester.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
                  <span style={{ fontSize: "1.5rem", fontWeight: 700, color: C.primary }}>
                    $42,300{" "}
                    <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#78716c" }}>
                      of $60k
                    </span>
                  </span>
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, color: C.tertiary }}>
                    70% Reached
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "0.75rem",
                    background: C.surfaceContainerHighest,
                    borderRadius: "999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: "70%",
                      background: `linear-gradient(to right, ${C.primary}, ${C.secondaryContainer})`,
                    }}
                  />
                </div>
              </div>

              <button
                onClick={() => handleCampaignClick(FEATURED_CAMPAIGN)}
                style={{
                  width: "100%",
                  padding: "1rem",
                  background: C.primary,
                  color: "#ffffff",
                  borderRadius: "1rem",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "1.125rem",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: `0 20px 40px ${C.primary}1a`,
                  transition: "transform 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                Donate Now
              </button>
            </div>
          </div>
        </section>

        {/* Campaign Card Grid */}
        <section style={{ padding: "0 3rem" }}>
          <div
            style={{
              maxWidth: "80rem",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "3rem",
            }}
          >
            {CAMPAIGN_CARDS.map((card) => (
              <div key={card.title} onClick={() => handleCampaignClick(card)}>
                <CampaignCard {...card} />
              </div>
            ))}
          </div>
        </section>
      </main>

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
