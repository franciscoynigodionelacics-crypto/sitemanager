"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import SharedLayout from "../../components/SharedLayout";
import { Star, MapPin, TrendingUp, Gift, CheckCircle, Clock } from "lucide-react";

// Design Tokens
const colors = {
  primary: "#97453e",
  primaryContainer: "#f28d83",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#6e2621",
  secondary: "#a8372c",
  secondaryContainer: "#ff7766",
  onSecondary: "#ffffff",
  onSecondaryContainer: "#710d09",
  tertiary: "#775a00",
  tertiaryContainer: "#cda336",
  onTertiary: "#ffffff",
  surface: "#fcf9f8",
  surfaceContainer: "#f0edec",
  surfaceContainerLow: "#f6f3f2",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerHigh: "#eae7e7",
  surfaceContainerHighest: "#e4e1e0",
  onSurface: "#1b1c1b",
  onSurfaceVariant: "#554240",
} as const;

type DonationStatus = "Processed" | "Pending";

interface DonationHistoryItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  date: string;
  amount: string;
  status: DonationStatus;
}

interface PointsActivityItem {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  date: string;
  points: number;
}

const KINDRED = {
  tier: "Gold Member",
  subtitle: "You're in the top 5% of our community.",
  nextTier: "Platinum Path",
  progressPercent: 78,
  pointsAway: 2160,
};

const IMPACT = {
  livesTouched: 142,
  description: "Through your recurring contributions to HOPECARD, you've provided clean water, education, and medical aid to 142 individuals this year.",
};

const REWARDS = { points: 12840, dollarValue: 128.4 };

const DONATION_HISTORY: DonationHistoryItem[] = [
  { id: "d1", icon: <span style={{ fontSize: "1.5rem" }}>🚨</span>, title: "Emergency Relief Fund", date: "Oct 12, 2024", amount: "$250.00", status: "Processed" },
  { id: "d2", icon: <span style={{ fontSize: "1.5rem" }}>🎓</span>, title: "Back to School Campaign", date: "Sep 28, 2024", amount: "$100.00", status: "Processed" },
  { id: "d3", icon: <span style={{ fontSize: "1.5rem" }}>🌳</span>, title: "Reforestation Project", date: "Sep 15, 2024", amount: "$50.00", status: "Pending" },
];

const POINTS_ACTIVITY: PointsActivityItem[] = [
  { id: "p1", icon: <CheckCircle size={20} />, iconBg: colors.tertiaryContainer + "33", iconColor: colors.tertiary, title: "Monthly Donation Bonus", date: "Today", points: 500 },
  { id: "p2", icon: <Gift size={20} />, iconBg: colors.primaryContainer + "33", iconColor: colors.primary, title: "Redeemed Coffee Pass", date: "Yesterday", points: -1200 },
  { id: "p3", icon: <TrendingUp size={20} />, iconBg: colors.tertiaryContainer + "33", iconColor: colors.tertiary, title: "Social Impact Share", date: "Oct 10, 2024", points: 50 },
];

export default function TransactionsPage() {
  const router = useRouter();

  const handleViewImpactMap = useCallback(() => console.log("View Impact Map"), []);
  const handleEarnMore = useCallback(() => console.log("Earn More"), []);
  const handleRedeem = useCallback(() => console.log("Redeem Points"), []);

  return (
    <SharedLayout currentPage="transactions">
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 3rem" }}>
        {/* Dashboard Header */}
        <header style={{ marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: colors.primary, marginBottom: "0.5rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            Welcome home, Sarah.
          </h1>
          <p style={{ color: colors.onSurfaceVariant, fontSize: "1.125rem" }}>
            Your heart is changing the world, one pulse at a time.
          </p>
        </header>

        {/* Hero: Kindred Status + Impact Record */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem", marginBottom: "3rem" }}>
          {/* Kindred Status Card */}
          <div style={{ background: colors.surfaceContainerLow, padding: "2rem", borderRadius: "1rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 700, color: colors.tertiary, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Manrope, sans-serif" }}>
                  Kindred Status
                </span>
                <Star size={24} fill={colors.tertiary} color={colors.tertiary} />
              </div>
              <h2 style={{ fontSize: "2rem", fontWeight: 700, color: colors.onSurface, marginBottom: "0.25rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>{KINDRED.tier}</h2>
              <p style={{ fontSize: "0.875rem", color: colors.onSurfaceVariant, marginBottom: "2rem" }}>{KINDRED.subtitle}</p>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: colors.onSurface }}>{KINDRED.nextTier}</span>
                <span style={{ fontSize: "1.25rem", fontWeight: 700, color: colors.primary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>{KINDRED.progressPercent}%</span>
              </div>
              <div style={{ height: "0.75rem", width: "100%", background: colors.surfaceContainerHighest, borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${KINDRED.progressPercent}%`, background: `linear-gradient(to right, ${colors.primary}, ${colors.primaryContainer})`, borderRadius: "999px" }} />
              </div>
              <p style={{ fontSize: "0.75rem", color: colors.onSurfaceVariant, fontStyle: "italic", textAlign: "right", marginTop: "0.75rem" }}>
                Just {KINDRED.pointsAway.toLocaleString()} pts away from Platinum
              </p>
            </div>
          </div>

          {/* Impact Record */}
          <div style={{ background: colors.primary, padding: "2.5rem", borderRadius: "1rem", color: colors.onPrimary, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem 0.75rem", background: "rgba(255,255,255,0.1)", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, marginBottom: "1.5rem" }}>
                  <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "999px", background: colors.primaryContainer, animation: "pulse 2s infinite" }} />
                  ACTIVE IMPACT
                </div>
                <h2 style={{ fontSize: "3rem", fontWeight: 800, marginBottom: "1rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  {IMPACT.livesTouched} Lives Touched
                </h2>
                <p style={{ fontSize: "1.25rem", opacity: 0.9, maxWidth: "600px", lineHeight: 1.6 }}>
                  {IMPACT.description}
                </p>
              </div>
              <div style={{ marginTop: "2rem" }}>
                <button onClick={handleViewImpactMap} style={{ background: colors.onPrimary, color: colors.primary, padding: "0.875rem 1.5rem", borderRadius: "1rem", fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "Plus Jakarta Sans, sans-serif", transition: "transform 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
                  View Impact Map <MapPin size={18} />
                </button>
              </div>
            </div>
            <div style={{ position: "absolute", top: 0, right: 0, width: "24rem", height: "24rem", background: "rgba(255,255,255,0.05)", borderRadius: "999px", transform: "translate(25%, -25%)" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, width: "20rem", height: "20rem", background: "rgba(242,141,131,0.1)", borderRadius: "999px", transform: "translate(-25%, 33%)" }} />
          </div>
        </div>

        {/* Rewards Section */}
        <section style={{ background: colors.surfaceContainerLowest, borderRadius: "1rem", padding: "2rem", marginBottom: "3rem", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: `1px solid ${colors.surfaceContainer}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "2rem" }}>
            <div>
              <span style={{ fontSize: "0.875rem", fontWeight: 700, color: colors.onSurfaceVariant, marginBottom: "0.5rem", display: "block", textTransform: "uppercase", fontFamily: "Manrope, sans-serif" }}>
                Available Balance
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "3rem", fontWeight: 800, color: colors.tertiary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  {REWARDS.points.toLocaleString()}
                </span>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ color: colors.tertiary, fontWeight: 700, fontSize: "1.125rem", lineHeight: 1 }}>PTS</span>
                  <span style={{ fontSize: "0.75rem", color: colors.onSurfaceVariant, fontWeight: 500 }}>
                    ≈ ${REWARDS.dollarValue.toFixed(2)} value
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={handleEarnMore} style={{ background: colors.primaryContainer, color: colors.onPrimaryContainer, padding: "1rem 2rem", borderRadius: "1rem", fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.75rem", fontFamily: "Plus Jakarta Sans, sans-serif", transition: "opacity 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
                <TrendingUp size={20} /> Earn More
              </button>
              <button onClick={handleRedeem} style={{ background: `${colors.secondary}33`, color: colors.secondary, padding: "1rem 2rem", borderRadius: "1rem", fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.75rem", fontFamily: "Plus Jakarta Sans, sans-serif", transition: "background 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = `${colors.secondary}4D`)}
                onMouseLeave={(e) => (e.currentTarget.style.background = `${colors.secondary}33`)}>
                <Gift size={20} /> Redeem Points
              </button>
            </div>
          </div>
        </section>

        {/* History Grids */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}>
          {/* Donation History */}
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: colors.onSurface, fontFamily: "Plus Jakarta Sans, sans-serif" }}>Donation History</h3>
              <a href="#" style={{ color: colors.primary, fontWeight: 700, fontSize: "0.875rem", textDecoration: "underline", textDecorationColor: colors.primaryContainer }}>
                View All
              </a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {DONATION_HISTORY.map((item) => (
                <div key={item.id} style={{ background: colors.surfaceContainerLow, padding: "1.25rem", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = colors.surfaceContainerLowest; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = colors.surfaceContainerLow; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: "3rem", height: "3rem", background: colors.surfaceContainerLowest, borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, color: colors.onSurface, marginBottom: "0.125rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>{item.title}</h4>
                      <p style={{ fontSize: "0.75rem", color: colors.onSurfaceVariant }}>{item.date}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 800, color: colors.onSurface, marginBottom: "0.25rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>{item.amount}</p>
                    <span style={{ fontSize: "0.625rem", padding: "0.25rem 0.5rem", borderRadius: "999px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: item.status === "Processed" ? `${colors.secondaryContainer}33` : colors.surfaceContainerHigh, color: item.status === "Processed" ? colors.onSecondaryContainer : colors.onSurfaceVariant }}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Points Activity */}
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: colors.onSurface, fontFamily: "Plus Jakarta Sans, sans-serif" }}>Points Activity</h3>
              <a href="#" style={{ color: colors.primary, fontWeight: 700, fontSize: "0.875rem", textDecoration: "underline", textDecorationColor: colors.primaryContainer }}>
                Points Summary
              </a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {POINTS_ACTIVITY.map((item) => (
                <div key={item.id} style={{ background: colors.surfaceContainerLow, padding: "1.25rem", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = colors.surfaceContainerLowest; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = colors.surfaceContainerLow; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: "3rem", height: "3rem", background: item.iconBg, borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", color: item.iconColor, flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, color: colors.onSurface, marginBottom: "0.125rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>{item.title}</h4>
                      <p style={{ fontSize: "0.75rem", color: colors.onSurfaceVariant }}>{item.date}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 800, color: item.points > 0 ? colors.tertiary : colors.secondary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                      {item.points > 0 ? "+" : ""}{item.points.toLocaleString()} pts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </SharedLayout>
  );
}
