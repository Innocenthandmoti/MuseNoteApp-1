"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

function PlannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryDate = searchParams?.get("date");

  const getTodayFormatted = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  };

  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    () => queryDate || getTodayFormatted(),
  );
  const [feastName, setFeastName] = useState("");
  const [season, setSeason] = useState("");
  const [liturgicalColor, setLiturgicalColor] = useState("");

  const [approvedHymns, setApprovedHymns] = useState<Hymn[]>([]);
  const [selections, setSelections] = useState<Record<string, any>>({
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

  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {},
  );

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [existingPlanId, setExistingPlanId] = useState<string | null>(null);
  const [planOwnerId, setPlanOwnerId] = useState<string | null>(null);
  const [shareableLink, setShareableLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    setMounted(true);
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

        const rawSelections = data.selections || {};
        const normalized: Record<string, string[]> = {};
        Object.keys(rawSelections).forEach((key) => {
          const val = rawSelections[key];
          if (Array.isArray(val)) {
            normalized[key] = val;
          } else if (typeof val === "string" && val.trim() !== "") {
            normalized[key] = [val];
          } else {
            normalized[key] = [];
          }
        });

        setSelections(normalized);
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

  const toggleDropdown = (partKey: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [partKey]: !prev[partKey] }));
  };

  const handleToggleHymn = (massPartKey: string, hymnId: string) => {
    setSelections((prev) => {
      const currentList = Array.isArray(prev[massPartKey])
        ? prev[massPartKey]
        : [];
      if (currentList.includes(hymnId)) {
        return {
          ...prev,
          [massPartKey]: currentList.filter((id: string) => id !== hymnId),
        };
      } else {
        return { ...prev, [massPartKey]: [...currentList, hymnId] };
      }
    });
  };

  const handleAddCustomSong = (massPartKey: string) => {
    const text = customInputs[massPartKey]?.trim();
    if (!text) return;

    setSelections((prev) => {
      const currentList = Array.isArray(prev[massPartKey])
        ? prev[massPartKey]
        : [];
      return {
        ...prev,
        [massPartKey]: [...currentList, text],
      };
    });

    setCustomInputs((prev) => ({ ...prev, [massPartKey]: "" }));
  };

  const handleRemoveSelection = (massPartKey: string, itemValue: string) => {
    setSelections((prev) => {
      const currentList = Array.isArray(prev[massPartKey])
        ? prev[massPartKey]
        : [];
      return {
        ...prev,
        [massPartKey]: currentList.filter((item: string) => item !== itemValue),
      };
    });
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
        const normalizedSuggestions: Record<string, string[]> = {};
        Object.keys(data.suggestions).forEach((k) => {
          const val = data.suggestions[k];
          normalizedSuggestions[k] = Array.isArray(val) ? val : [val];
        });
        setSelections((prev) => ({ ...prev, ...normalizedSuggestions }));
        alert(
          "✨ AI successfully populated suggested scores tailored to each role!",
        );
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

  const resolveItemDisplay = (itemValue: string) => {
    const foundHymn = approvedHymns.find((h) => h.id === itemValue);
    if (foundHymn) {
      return `${foundHymn.title} ${foundHymn.composer ? `(${foundHymn.composer})` : ""}`;
    }
    return itemValue;
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] p-12">Loading planner...</div>
    );
  }

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
              Mass Repertoire Builder
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/planner/my-plans")}
              className="text-xs font-[family-name:var(--font-cinzel)] text-amber-900 bg-amber-100/70 px-3.5 py-2 rounded hover:bg-amber-200 font-bold cursor-pointer"
            >
              My Saved Plans
            </button>
            <button
              onClick={() => router.push("/hymns")}
              className="text-xs font-[family-name:var(--font-cinzel)] text-amber-900 hover:underline font-semibold cursor-pointer"
            >
              ← Catalog
            </button>
          </div>
        </div>

        {/* Ownership Notice */}
        {!currentUser && (
          <div className="bg-amber-100 border border-amber-300 p-4 rounded text-xs text-amber-900 flex justify-between items-center">
            <span>
              You are viewing as a guest. Log in to create and edit plans.
            </span>
            <button
              onClick={() => router.push("/login")}
              className="bg-amber-900 text-amber-50 px-3 py-1.5 rounded font-bold cursor-pointer"
            >
              Log In
            </button>
          </div>
        )}

        {currentUser && planOwnerId && planOwnerId !== currentUser.id && (
          <div className="bg-red-50 border border-red-200 p-4 rounded text-xs text-red-800">
            🔒 This plan belongs to another account. You can view and comment,
            but editing is restricted.
          </div>
        )}

        {/* Date & Feast Card */}
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
                className="w-full bg-[#FDFBF7] border border-amber-900/30 rounded-sm px-3.5 py-2.5 text-sm text-stone-900 font-sans"
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
                Auto-suggest matching scores from your repertoire for{" "}
                {feastName}.
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

        {/* Mass Parts with Clickable Repertoire Dropdown */}
        <div className="bg-white rounded-xl border border-amber-900/20 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 border-b border-amber-900/10 pb-3">
            Order of Mass Selections
          </h2>

          <div className="space-y-4">
            {massParts.map((part) => {
              const matchingHymns = approvedHymns.filter(
                (h) =>
                  h.role === part.targetRole || h.role === "General" || !h.role,
              );

              const rawVal = selections[part.key];
              const selectedValues = Array.isArray(rawVal)
                ? rawVal
                : rawVal
                  ? [rawVal]
                  : [];
              const isOpen = openDropdowns[part.key] || false;

              return (
                <div
                  key={part.key}
                  className="bg-[#FDFBF7] p-4 rounded-lg border border-stone-200 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-[family-name:var(--font-cinzel)] font-bold text-amber-900 uppercase tracking-wide block">
                        {part.label}
                      </span>
                      <span className="text-[10px] text-stone-500 italic">
                        Category:{" "}
                        <strong className="text-stone-800">
                          {part.targetRole}
                        </strong>
                      </span>
                    </div>
                    {selectedValues.length > 0 && (
                      <span className="text-[10px] bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-bold">
                        {selectedValues.length} selected
                      </span>
                    )}
                  </div>

                  {/* Selected Badges */}
                  {selectedValues.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedValues.map((val: string) => (
                        <div
                          key={val}
                          className="bg-amber-900 text-amber-50 text-xs px-3 py-1 rounded-full flex items-center gap-2 shadow-xs"
                        >
                          <span>{resolveItemDisplay(val)}</span>
                          {isOwner && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveSelection(part.key, val)
                              }
                              className="text-amber-200 hover:text-white font-bold cursor-pointer"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Clickable Dropdown Trigger */}
                  {isOwner && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => toggleDropdown(part.key)}
                        className="w-full bg-white border border-amber-900/30 hover:border-amber-900/60 rounded px-4 py-2.5 text-xs text-stone-800 font-semibold flex justify-between items-center cursor-pointer shadow-2xs transition"
                      >
                        <span className="font-[family-name:var(--font-cinzel)] text-amber-950 font-bold">
                          {isOpen
                            ? `▲ Hide Repertoire (${part.targetRole})`
                            : `▼ Select / Add Songs for ${part.targetRole}...`}
                        </span>
                        <span className="text-[10px] text-stone-500">
                          {matchingHymns.length} available in catalog
                        </span>
                      </button>

                      {/* Expandable Repertoire List and Custom Input */}
                      {isOpen && (
                        <div className="mt-2 p-3 bg-white rounded-lg border border-amber-900/20 shadow-sm space-y-3">
                          <p className="text-[11px] font-bold text-stone-700 uppercase tracking-wider font-[family-name:var(--font-cinzel)]">
                            Check songs from your catalog:
                          </p>

                          {matchingHymns.length === 0 ? (
                            <p className="text-xs text-stone-400 italic">
                              No approved songs found in database for this
                              specific role.
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-[#FDFBF7] rounded border border-stone-200">
                              {matchingHymns.map((hymn) => {
                                const isSelected = selectedValues.includes(
                                  hymn.id,
                                );
                                return (
                                  <label
                                    key={hymn.id}
                                    className={`flex items-center gap-2 p-2 rounded text-xs cursor-pointer transition ${
                                      isSelected
                                        ? "bg-amber-100/70 border border-amber-300 font-bold text-amber-950"
                                        : "hover:bg-white text-stone-800"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() =>
                                        handleToggleHymn(part.key, hymn.id)
                                      }
                                      className="rounded border-amber-900/30 text-amber-900 focus:ring-amber-900"
                                    />
                                    <span className="truncate">
                                      {hymn.title}{" "}
                                      {hymn.composer
                                        ? `(${hymn.composer})`
                                        : ""}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}

                          {/* Custom input box */}
                          <div className="pt-2 border-t border-stone-100 flex gap-2">
                            <input
                              type="text"
                              placeholder={`Or type custom ${part.targetRole} piece...`}
                              value={customInputs[part.key] || ""}
                              onChange={(e) =>
                                setCustomInputs((prev) => ({
                                  ...prev,
                                  [part.key]: e.target.value,
                                }))
                              }
                              className="w-full bg-[#FDFBF7] border border-stone-300 rounded px-3 py-1.5 text-xs text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-900"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddCustomSong(part.key)}
                              className="bg-stone-800 hover:bg-stone-900 text-stone-100 px-4 py-1.5 rounded text-xs font-bold shrink-0 cursor-pointer"
                            >
                              Add Custom
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Controls */}
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

export default function LiturgicalPlannerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex justify-center items-center bg-[#FDFBF7]">
          Loading planner...
        </div>
      }
    >
      <PlannerContent />
    </Suspense>
  );
}
