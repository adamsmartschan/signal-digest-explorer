"use client";

import { IconMotorcycle, IconHeartPulse, IconMedicalCross } from "./Icons";

const BRANCHES = [
  {
    id: "automotive",
    title: "European Automotive",
    blurb: "Motorcycle OEMs — KTM, BMW Motorrad, Piaggio, Ducati. Plants, people, news, and outreach drafts.",
    meta: "EU / UK footprint",
    Icon: IconMotorcycle,
    accent: { fg: "#9a3412", bg: "#ffedd5" },
  },
  {
    id: "na-medtech",
    title: "North American MedTech",
    blurb: "HID medical-device accounts — hires, promotions, open roles, FDA recalls, and 510(k) clearances.",
    meta: "United States",
    Icon: IconHeartPulse,
    accent: { fg: "#1e3a8a", bg: "#dbeafe" },
  },
  {
    id: "eu-medtech",
    title: "EU MedTech",
    blurb: "European MedTech accounts — hires, promotions, open roles, and FDA 510(k) from EU/UK applicants.",
    meta: "EU / UK",
    Icon: IconMedicalCross,
    accent: { fg: "#14532d", bg: "#dcfce7" },
  },
];

export default function BranchPicker({ onSelect }) {
  return (
    <div className="wrap branch-wrap">
      <h1>Signal Digest Explorer</h1>
      <p className="subtitle">Choose a vertical to open its digest.</p>

      <div className="branch-grid">
        {BRANCHES.map((b) => (
          <button
            key={b.id}
            type="button"
            className="branch-card"
            onClick={() => onSelect(b.id)}
          >
            <span
              className="branch-icon"
              style={{ background: b.accent.bg, color: b.accent.fg }}
            >
              <b.Icon size={22} />
            </span>
            <span className="branch-title">{b.title}</span>
            <span className="branch-blurb">{b.blurb}</span>
            <span className="branch-meta">{b.meta}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export const VERTICAL_LABELS = {
  automotive: "European Automotive",
  "na-medtech": "NA MedTech (HID)",
  "eu-medtech": "EU MedTech",
};
