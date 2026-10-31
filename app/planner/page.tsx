"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Hymn {
  id: string;
  title: string;
  composer: string;
  role?: string;
  season?: string;
}

function getLiturgicalInfo(dateStr: string): {
  feast: string;
  season: string;
  color: string;
} {
  if (!dateStr) return { feast: "", season: "Ordinary Time", color: "Green" };

  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  const fixedFeasts: Record<
    string,
    { feast: string; season: string; color: string }
  > = {
    "01-01": {
      feast: "Solemnity of Mary, Mother of God",
      season: "Christmas",
      color: "White",
    },
    "01-06": {
      feast: "The Epiphany of the Lord",
      season: "Christmas",
      color: "White",
    },
    "02-02": {
      feast: "The Presentation of the Lord",
      season: "Ordinary Time",
      color: "White",
    },
    "03-19": {
      feast: "Solemnity of Saint Joseph",
      season: "Lent",
      color: "White",
    },
    "03-25": {
      feast: "The Annunciation of the Lord",
      season: "Lent",
      color: "White",
    },
    "06-24": {
      feast: "The Nativity of Saint John the Baptist",
      season: "Ordinary Time",
      color: "White",
    },
    "06-29": {
      feast: "Solemnity of Saints Peter and Paul",
      season: "Ordinary Time",
      color: "Red",
    },
    "08-06": {
      feast: "The Transfiguration of the Lord",
      season: "Ordinary Time",
      color: "White",
    },
    "08-15": {
      feast: "The Assumption of the Blessed Virgin Mary",
      season: "Ordinary Time",
      color: "White",
    },
    "09-14": {
      feast: "The Exaltation of the Holy Cross",
      season: "Ordinary Time",
      color: "Red",
    },
    "10-31": {
      feast: "Eve of All Saints",
      season: "Ordinary Time",
      color: "White",
    },
    "11-01": {
      feast: "Solemnity of All Saints",
      season: "Ordinary Time",
      color: "White",
    },
    "11-02": {
      feast: "The Commemoration of All the Faithful Departed (All Souls' Day)",
      season: "Ordinary Time",
      color: "Violet/Black",
    },
    "12-25": {
      feast: "The Nativity of the Lord (Christmas)",
      season: "Christmas",
      color: "White",
    },
  };

  const key = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  if (fixedFeasts[key]) return fixedFeasts[key];

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayName = daysOfWeek[date.getDay()];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return {
    feast: `${dayName} of ${monthNames[month - 1]} ${day}`,
    season: "Ordinary Time",
    color: "Green",
  };
}

export default function LiturgicalPlannerPage() {
  const router = useRouter();

  const getTodayFormatted = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayFormatted);
  const [feastName, setFeastName] = useState("");
  const [season, setSeason] = useState("");
  const [liturgicalColor, setLiturgicalColor] = useState("");

  const [approvedHymns, setApprovedHymns] = useState<Hymn[]>([]);
  // Selections now map each part to an array of hymn IDs (`string[]`)
  const [selections, setSelections] = useState<Record<string, string[]>>({
    entrance: [],
    kyrie: [],
    gloria: [],
    responsorial_psalm: [],
    gospel_acclamation: [],
    credo: [],
    prayer_of_the_faithful: [],
    offertory: [],
    sanctus: [],
    pater_noster: [],
    agnus_dei: [],
    communion: [],
    thanksgiving: [],
    recessional: [],
  });

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [existingPlanId, setExistingPlanId] = useState<string | null>(null);
  const [planOwnerId, setPlanOwnerId] = useState<string | null>(null);
  const [shareableLink, setShareableLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setCurrentUser(session.user);
    });
  }, []);

  useEffect(() => {
    const info = getLiturgicalInfo(selectedDate);
    setFeastName(info.feast);
    setSeason(info.season);
    setLiturgicalColor(info.color);

    const checkExistingPlan = async () => {
      const { data } = await supabase
        .from("LiturgicalPlan")
        .select("*")
        .eq("date", selectedDate)
        .single();

      if (data) {
        setExistingPlanId(data.id);
        setPlanOwnerId(data.user_id);
        setFeastName(data.feast_name || info.feast);
        setSeason(data.season || info.season);
        setSelections(data.selections || {});
        setShareableLink(
          `${window.location.origin}/planner/share/${data.share_token}`,
        );
      } else {
        setExistingPlanId(null);
        setPlanOwnerId(null);
        setShareableLink("");
        setSelections({
          entrance: [],
          kyrie: [],
          gloria: [],
          responsorial_psalm: [],
          gospel_acclamation: [],
          credo: [],
          prayer_of_the_faithful: [],
          offertory: [],
          sanctus: [],
          pater_noster: [],
          agnus_dei: [],
          communion: [],
          thanksgiving: [],
          recessional: [],
        });
      }
    };

    checkExistingPlan();
  }, [selectedDate]);

  useEffect(() => {
    supabase
      .from("MediaItem")
      .select("id, title, composer, role, season")
      .eq("isApproved", true)
      .order("title")
      .then(({ data }) => {
        if (data) setApprovedHymns(data);
      });
  }, []);

  const handleMultiSelectChange = (
    massPartKey: string,
    options: HTMLCollectionOf<HTMLOptionElement>,
  ) => {
    const selectedIds = Array.from(options)
      .filter((opt) => opt.selected)
      .map((opt) => opt.value);

    setSelections((prev) => ({ ...prev, [massPartKey]: selectedIds }));
  };

  const handleGenerateAiPlan = async () => {
    if (!currentUser) {
      alert("Please log in to use the AI planner assistant.");
      router.push("/login");
      return;
    }
    setAiGenerating(true);
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feastName,
          season,
          availableHymns: approvedHymns,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.suggestions) {
        setSelections((prev) => ({ ...prev, ...data.suggestions }));
        alert("✨ AI successfully populated multiple suggested scores!");
      }
    } catch (err: any) {
      alert(`AI Error: ${err.message}`);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSaveOrUpdatePlan = async () => {
    if (!currentUser) {
      alert(
        "You must be logged in as an Individual or Parish account to save or edit liturgy plans.",
      );
      router.push("/login");
      return;
    }

    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const res = await fetch("/api/save-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          existingPlanId,
          selectedDate,
          feastName,
          season,
          selections,
          userId: currentUser.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save plan.");

      if (existingPlanId) {
        alert("Liturgy plan updated successfully!");
      } else {
        setExistingPlanId(data.id);
        setPlanOwnerId(currentUser.id);
        setShareableLink(
          `${window.location.origin}/planner/share/${data.share_token}`,
        );
        alert("Liturgy plan created and saved successfully!");
      }
    } catch (err: any) {
      alert(`Error saving plan: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!existingPlanId) return;
    if (planOwnerId !== currentUser?.id) {
      alert("Only the account that created this plan can delete it.");
      return;
    }

    if (!confirm("Are you sure you want to delete this liturgy plan?")) return;

    const { error } = await supabase
      .from("LiturgicalPlan")
      .delete()
      .eq("id", existingPlanId);
    if (error) {
      alert(`Error deleting: ${error.message}`);
    } else {
      alert("Plan deleted successfully.");
      setExistingPlanId(null);
      setPlanOwnerId(null);
      setShareableLink("");
    }
  };

  const isOwner =
    currentUser && (!planOwnerId || planOwnerId === currentUser.id);

  const massParts = [
    {
      key: "entrance",
      label: "Entrance Hymn / Introit",
      targetRole: "Entrance",
    },
    { key: "kyrie", label: "Kyrie (Lord, Have Mercy)", targetRole: "Kyrie" },
    { key: "gloria", label: "Gloria (Glory to God)", targetRole: "Gloria" },
    {
      key: "responsorial_psalm",
      label: "Responsorial Psalm",
      targetRole: "Responsorial Psalm",
    },
    {
      key: "gospel_acclamation",
      label: "Gospel Acclamation / Alleluia",
      targetRole: "Gospel Acclamation",
    },
    { key: "credo", label: "Credo (I Believe / Creed)", targetRole: "Credo" },
    {
      key: "prayer_of_the_faithful",
      label: "Prayer of the Faithful",
      targetRole: "Prayer of the Faithful",
    },
    {
      key: "offertory",
      label: "Offertory / Presentation of Gifts",
      targetRole: "Offertory",
    },
    {
      key: "sanctus",
      label: "Sanctus (Holy, Holy, Holy)",
      targetRole: "Sanctus",
    },
    {
      key: "pater_noster",
      label: "Pater Noster (Our Father)",
      targetRole: "Pater Noster",
    },
    {
      key: "agnus_dei",
      label: "Agnus Dei (Lamb of God)",
      targetRole: "Agnus Dei",
    },
    {
      key: "communion",
      label: "Communion Processional",
      targetRole: "Communion",
    },
    {
      key: "thanksgiving",
      label: "Post-Communion / Thanksgiving",
      targetRole: "Thanksgiving",
    },
    {
      key: "recessional",
      label: "Recessional / Dismissal Hymn",
      targetRole: "Recessional",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans p-6 sm:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-amber-900/20 pb-6 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-semibold tracking-widest text-amber-900 uppercase bg-amber-50 px-3 py-1 rounded-sm border border-amber-200/60">
              Liturgical Calendar Planner
            </span>
            <h1 className="text-3xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 mt-2">
              Mass Repertoire Builder (Multi-Song Support)
            </h1>
          </div>
          <button
            onClick={() => router.push("/hymns")}
            className="text-xs font-[family-name:var(--font-cinzel)] text-amber-900 hover:underline font-semibold cursor-pointer"
          >
            ← Back to Catalog
          </button>
        </div>

        {/* Date & Feast Selector Card */}
        <div className="bg-white rounded-xl border border-amber-900/20 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-2">
                Select Mass Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-[#FDFBF7] border border-amber-900/30 rounded-sm px-3.5 py-2.5 text-sm text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-2">
                Liturgical Feast / Day
              </label>
              <input
                type="text"
                value={feastName}
                disabled={!isOwner}
                onChange={(e) => setFeastName(e.target.value)}
                className="w-full bg-[#FDFBF7] border border-amber-900/30 rounded-sm px-3.5 py-2.5 text-sm font-bold text-amber-950 disabled:opacity-70"
              />
            </div>
          </div>
        </div>

        {/* AI Assistant */}
        {isOwner && (
          <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-amber-50 rounded-xl p-6 shadow-md flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-sm font-[family-name:var(--font-cinzel)] font-bold tracking-wide uppercase text-amber-200">
                ✨ AI Liturgical Assistant
              </h3>
              <p className="text-xs text-amber-100/90 italic">
                Auto-suggest multiple songs from your repertoire for {feastName}
                .
              </p>
            </div>
            <button
              onClick={handleGenerateAiPlan}
              disabled={aiGenerating}
              className="bg-amber-100 hover:bg-white text-amber-950 text-xs px-5 py-2.5 rounded font-bold cursor-pointer disabled:opacity-50"
            >
              {aiGenerating ? "Analyzing..." : "✨ Generate AI Mass Plan"}
            </button>
          </div>
        )}

        {/* Order of Mass Selections */}
        <div className="bg-white rounded-xl border border-amber-900/20 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 border-b border-amber-900/10 pb-3">
            Order of Mass Selections{" "}
            <span className="text-xs font-normal text-stone-500">
              (Hold Ctrl / Cmd to select multiple songs per part)
            </span>
          </h2>

          <div className="space-y-4">
            {massParts.map((part) => {
              const matchingHymns = approvedHymns.filter(
                (h) =>
                  h.role === part.targetRole || h.role === "General" || !h.role,
              );
              const selectedValues = selections[part.key] || [];

              return (
                <div
                  key={part.key}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-[#FDFBF7] p-4 rounded-lg border border-stone-200"
                >
                  <div>
                    <span className="text-xs font-[family-name:var(--font-cinzel)] font-bold text-amber-900 uppercase block">
                      {part.label}
                    </span>
                    <span className="text-[10px] text-stone-500 italic">
                      Role: {part.targetRole}
                    </span>
                    {selectedValues.length > 0 && (
                      <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold mt-1 inline-block">
                        {selectedValues.length} selected
                      </span>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <select
                      multiple
                      value={selectedValues}
                      disabled={!isOwner}
                      onChange={(e) =>
                        handleMultiSelectChange(
                          part.key,
                          e.target.selectedOptions,
                        )
                      }
                      className="w-full bg-white border border-amber-900/30 rounded-sm px-3 py-2 text-sm text-stone-900 h-24 disabled:bg-stone-100 disabled:opacity-70"
                    >
                      {matchingHymns.map((hymn) => (
                        <option key={hymn.id} value={hymn.id}>
                          {hymn.title}{" "}
                          {hymn.composer ? `(${hymn.composer})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action & Owner Controls */}
          {isOwner && (
            <div className="pt-6 border-t border-stone-100 flex flex-wrap justify-between items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={handleSaveOrUpdatePlan}
                  disabled={saving}
                  className="bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs font-bold px-6 py-3 rounded shadow-xs cursor-pointer disabled:opacity-50 font-[family-name:var(--font-cinzel)]"
                >
                  {saving
                    ? "Saving Liturgy..."
                    : existingPlanId
                      ? "Update Saved Plan"
                      : "Save Liturgy Plan"}
                </button>

                {existingPlanId && (
                  <button
                    onClick={handleDeletePlan}
                    className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-4 py-3 rounded cursor-pointer font-[family-name:var(--font-cinzel)]"
                  >
                    Delete Plan
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Share Box */}
          {shareableLink && (
            <div className="mt-6 bg-amber-50 border border-amber-300 rounded-lg p-4 space-y-2">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block font-[family-name:var(--font-cinzel)]">
                Public Share Link (Read-Only View for others):
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareableLink}
                  className="w-full bg-white border border-amber-200 rounded px-3 py-2 text-xs text-stone-800 font-mono select-all"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareableLink);
                    alert("Public share link copied to clipboard!");
                  }}
                  className="bg-amber-900 text-amber-50 px-4 py-2 rounded text-xs font-bold shrink-0 hover:bg-amber-950 cursor-pointer"
                >
                  Copy Link
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
