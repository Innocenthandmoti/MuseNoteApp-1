"use client";

import { useEffect, useState } from "react";

interface MediaItem {
  id: string;
  title: string;
  composer: string | null;
  category: string;
}

interface PlanSong {
  id: string;
  massPart: string;
  mediaItem: MediaItem;
}

interface LiturgicalPlan {
  id: string;
  title: string;
  date: string;
  notes: string | null;
  songs: PlanSong[];
}

export default function PlannerPage() {
  const [plans, setPlans] = useState<LiturgicalPlan[]>([]);
  const [catalog, setCatalog] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Parish / Individual Workspace Account
  const [workspace, setWorkspace] = useState("st-cecilia@parish.org");
  const [customWorkspaceInput, setCustomWorkspaceInput] = useState("");
  const [isEditingWorkspace, setIsEditingWorkspace] = useState(false);

  // Modals
  const [isNewPlanOpen, setIsNewPlanOpen] = useState(false);
  const [assigningPlanId, setAssigningPlanId] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState<LiturgicalPlan | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Song assignment state
  const [selectedMediaId, setSelectedMediaId] = useState("");
  const [selectedMassPart, setSelectedMassPart] = useState("ENTRANCE");

  useEffect(() => {
    fetchData();
  }, [workspace]);

  async function fetchData() {
    setLoading(true);
    try {
      const [resPlans, resCatalog] = await Promise.all([
        fetch(`/api/media/planner?owner=${encodeURIComponent(workspace)}`),
        fetch(`/api/media/catalog`),
      ]);

      if (resPlans.ok) {
        const data = await resPlans.json();
        setPlans(Array.isArray(data) ? data : []);
      }
      if (resCatalog.ok) {
        const data = await resCatalog.json();
        setCatalog(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch("/api/media/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          date: newDate || new Date().toISOString(),
          notes: newNotes,
          owner: workspace,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create plan");

      setNewTitle("");
      setNewDate("");
      setNewNotes("");
      setIsNewPlanOpen(false);
      fetchData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm("Are you sure you want to delete this celebration plan?"))
      return;
    try {
      const res = await fetch(`/api/media/planner?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAssignSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningPlanId || !selectedMediaId) return;

    try {
      const res = await fetch("/api/media/planner/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: assigningPlanId,
          mediaItemId: selectedMediaId,
          massPart: selectedMassPart,
        }),
      });

      if (!res.ok) throw new Error("Failed to assign song");

      setAssigningPlanId(null);
      setSelectedMediaId("");
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Workspace / Parish Login Bar */}
      <div className="bg-[#F5EFEB] border border-amber-900/20 p-4 rounded-md flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-amber-800 text-xl font-bold">☩</span>
          <div>
            <span className="text-[10px] font-[family-name:var(--font-cinzel)] uppercase tracking-widest text-amber-900 font-bold block">
              Logged-in Parish / Individual Workspace
            </span>
            <span className="text-sm font-semibold text-stone-900 font-[family-name:var(--font-cinzel)]">
              {workspace}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditingWorkspace ? (
            <button
              onClick={() => setIsEditingWorkspace(true)}
              className="text-xs font-[family-name:var(--font-cinzel)] bg-amber-900 text-amber-50 px-3 py-1.5 rounded-sm shadow-xs hover:bg-amber-950 transition cursor-pointer"
            >
              Switch / Register Workspace
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter parish or email..."
                value={customWorkspaceInput}
                onChange={(e) => setCustomWorkspaceInput(e.target.value)}
                className="bg-white border border-amber-900/30 text-xs px-2 py-1 rounded-sm text-stone-900"
              />
              <button
                onClick={() => {
                  if (customWorkspaceInput.trim()) {
                    setWorkspace(customWorkspaceInput.trim());
                    setCustomWorkspaceInput("");
                  }
                  setIsEditingWorkspace(false);
                }}
                className="text-xs bg-amber-900 text-amber-50 px-3 py-1 rounded-sm cursor-pointer"
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-amber-900/20 gap-4">
        <div>
          <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-semibold tracking-widest text-amber-900 uppercase bg-amber-50 px-3 py-1 rounded-sm border border-amber-200/60">
            Liturgical Music Registry & Archive
          </span>
          <h1 className="text-3xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 mt-2 tracking-tight">
            Celebration Planner
          </h1>
          <p className="text-stone-600 text-sm mt-1 italic">
            Organize past celebrations, assign catalog hymns, and share orders
            of service.
          </p>
        </div>
        <button
          onClick={() => setIsNewPlanOpen(true)}
          className="bg-amber-900 hover:bg-amber-950 text-amber-50 font-[family-name:var(--font-cinzel)] text-xs tracking-wider font-semibold px-5 py-3 rounded-sm shadow-xs transition active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <span className="text-amber-200 text-sm font-bold">+</span>
          <span>New Celebration Plan</span>
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-900 border-t-transparent"></div>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md text-sm">
          Error: {error}
        </div>
      )}

      {!loading && !error && plans.length === 0 && (
        <div className="text-center py-20 bg-white rounded-md border border-amber-900/20 shadow-xs p-8">
          <div className="w-12 h-12 bg-amber-50 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200/50 font-[family-name:var(--font-cinzel)] text-lg font-bold">
            ☩
          </div>
          <h3 className="text-lg font-[family-name:var(--font-cinzel)] font-bold text-stone-900">
            No celebration plans found for this workspace
          </h3>
          <p className="text-stone-600 text-sm mt-1 max-w-sm mx-auto italic">
            Click &quot;New Celebration Plan&quot; to create your first order of
            service.
          </p>
        </div>
      )}

      {/* Plans List */}
      {!loading && !error && plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-md border border-amber-900/20 shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-800"></div>
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-semibold tracking-widest text-amber-900 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-xs uppercase">
                    Celebration Archive
                  </span>
                  <span className="text-xs font-medium text-stone-500 italic">
                    {new Date(plan.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h2 className="text-xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 tracking-tight">
                  {plan.title}
                </h2>
                {plan.notes && (
                  <p className="text-xs text-stone-600 italic mt-1 line-clamp-1">
                    {plan.notes}
                  </p>
                )}

                {/* Assigned Songs Breakdown */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-[family-name:var(--font-cinzel)] uppercase tracking-widest text-amber-900 font-bold">
                      Assigned Repertoire ({plan.songs?.length || 0})
                    </h4>
                    <button
                      onClick={() => setAssigningPlanId(plan.id)}
                      className="text-[10px] font-[family-name:var(--font-cinzel)] text-amber-900 hover:text-amber-950 font-bold underline uppercase tracking-wider cursor-pointer"
                    >
                      + Assign Song
                    </button>
                  </div>
                  {plan.songs && plan.songs.length > 0 ? (
                    <ul className="divide-y divide-amber-900/10 max-h-36 overflow-y-auto pr-1">
                      {plan.songs.map((item) => (
                        <li
                          key={item.id}
                          className="py-2 flex justify-between items-center text-xs"
                        >
                          <span className="font-medium text-stone-800">
                            {item.mediaItem?.title || "Untitled Hymn"}
                          </span>
                          <span className="text-[10px] bg-amber-50 text-amber-900 px-2 py-0.5 rounded italic border border-amber-200/40">
                            {item.massPart}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-stone-400 italic">
                      No hymns assigned yet. Click &quot;+ Assign Song&quot; to
                      pick from your catalog.
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-stone-100 flex flex-wrap justify-between items-center gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="text-xs text-rose-700 hover:text-rose-900 px-2 py-1 rounded hover:bg-rose-50 transition cursor-pointer font-medium"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/planner/${plan.id}`,
                      );
                      alert("Shareable celebration link copied to clipboard!");
                    }}
                    className="text-xs text-amber-900 hover:text-amber-950 px-2.5 py-1 rounded bg-amber-50 border border-amber-200/50 transition cursor-pointer font-semibold"
                  >
                    Share Link 🔗
                  </button>
                </div>
                <button
                  onClick={() => setActivePlan(plan)}
                  className="text-xs font-[family-name:var(--font-cinzel)] tracking-wider bg-stone-900 text-amber-50 hover:bg-amber-950 px-3.5 py-2 rounded-sm transition font-semibold cursor-pointer"
                >
                  View Liturgy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: New Plan */}
      {isNewPlanOpen && (
        <div className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FDFBF7] rounded-lg border border-amber-900/40 max-w-md w-full p-8 shadow-2xl relative">
            <button
              onClick={() => setIsNewPlanOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 text-xl font-serif cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 mb-4">
              New Celebration Plan
            </h3>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-1">
                  Celebration / Mass Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Solemn High Mass - Corpus Christi"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white border border-amber-900/30 rounded-sm px-3 py-2 text-sm text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-white border border-amber-900/30 rounded-sm px-3 py-2 text-sm text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-1">
                  Director Notes
                </label>
                <textarea
                  placeholder="Rehearsal notes, soloists..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-amber-900/30 rounded-sm px-3 py-2 text-sm text-stone-900"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewPlanOpen(false)}
                  className="px-4 py-2 text-xs font-[family-name:var(--font-cinzel)] text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs font-[family-name:var(--font-cinzel)] tracking-wider font-semibold px-5 py-2 rounded-sm shadow transition cursor-pointer"
                >
                  Save Celebration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Song from Catalog */}
      {assigningPlanId && (
        <div className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FDFBF7] rounded-lg border border-amber-900/40 max-w-md w-full p-8 shadow-2xl relative">
            <button
              onClick={() => setAssigningPlanId(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 text-xl font-serif cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 mb-4">
              Assign Song from Catalog
            </h3>
            <form onSubmit={handleAssignSong} className="space-y-4">
              <div>
                <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-1">
                  Select Hymn / Score
                </label>
                <select
                  required
                  value={selectedMediaId}
                  onChange={(e) => setSelectedMediaId(e.target.value)}
                  className="w-full bg-white border border-amber-900/30 rounded-sm px-3 py-2 text-sm text-stone-900"
                >
                  <option value="">-- Choose from Catalog --</option>
                  {catalog.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} {item.composer ? `(${item.composer})` : ""}
                    </option>
                  ))}
                </select>
                {catalog.length === 0 && (
                  <p className="text-xs text-amber-800 mt-1 italic">
                    No scores found in catalog. Upload scores in the Composer
                    Upload page first!
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-1">
                  Mass Part / Liturgical Role
                </label>
                <select
                  value={selectedMassPart}
                  onChange={(e) => setSelectedMassPart(e.target.value)}
                  className="w-full bg-white border border-amber-900/30 rounded-sm px-3 py-2 text-sm text-stone-900"
                >
                  <option value="ENTRANCE">Entrance Hymn</option>
                  <option value="KYRIE">Kyrie</option>
                  <option value="GLORIA">Gloria</option>
                  <option value="RESPONSORIAL_PSALM">Responsorial Psalm</option>
                  <option value="GOSPEL_ACCLAMATION">Gospel Acclamation</option>
                  <option value="OFFERTORY">Offertory Hymn</option>
                  <option value="SANCTUS">Sanctus</option>
                  <option value="AGNUS_DEI">Agnus Dei</option>
                  <option value="COMMUNION">Communion Hymn / Motet</option>
                  <option value="RECESSIONAL">Recessional Hymn</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAssigningPlanId(null)}
                  className="px-4 py-2 text-xs font-[family-name:var(--font-cinzel)] text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs font-[family-name:var(--font-cinzel)] tracking-wider font-semibold px-5 py-2 rounded-sm shadow transition cursor-pointer"
                >
                  Add to Celebration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Liturgy Detail */}
      {activePlan && (
        <div className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FDFBF7] rounded-lg border border-amber-900/40 max-w-lg w-full p-8 shadow-2xl relative">
            <button
              onClick={() => setActivePlan(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 text-xl font-serif cursor-pointer"
            >
              ✕
            </button>
            <div className="text-center pb-4 border-b border-amber-900/20 mb-4">
              <span className="text-3xl text-amber-800 font-[family-name:var(--font-cinzel)] block mb-1">
                ☩
              </span>
              <h3 className="text-2xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900">
                {activePlan.title}
              </h3>
              <p className="text-xs italic text-stone-600 mt-1">
                Date: {new Date(activePlan.date).toLocaleDateString()}
              </p>
              {activePlan.notes && (
                <p className="text-xs bg-amber-50 border border-amber-200/50 p-2 rounded mt-2 text-stone-700 italic">
                  {activePlan.notes}
                </p>
              )}
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              <h4 className="text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-widest text-amber-900 font-bold">
                Order of Service Repertoire
              </h4>
              {activePlan.songs && activePlan.songs.length > 0 ? (
                activePlan.songs.map((song) => (
                  <div
                    key={song.id}
                    className="bg-white p-3 rounded-sm border border-amber-900/15 flex justify-between items-center text-sm"
                  >
                    <div>
                      <span className="font-medium text-stone-800 block">
                        {song.mediaItem?.title || "Untitled"}
                      </span>
                      {song.mediaItem?.composer && (
                        <span className="text-xs italic text-stone-500">
                          {song.mediaItem.composer}
                        </span>
                      )}
                    </div>
                    <span className="text-xs bg-amber-50 text-amber-900 px-2 py-1 rounded italic border border-amber-200/50 font-semibold">
                      {song.massPart}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-500 italic text-center py-4">
                  No music assigned to this liturgy yet.
                </p>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-amber-900/25 flex justify-between items-center">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/planner/${activePlan.id}`,
                  );
                  alert("Shareable celebration link copied!");
                }}
                className="text-xs font-[family-name:var(--font-cinzel)] tracking-wider text-amber-900 font-bold underline cursor-pointer"
              >
                Copy Share Link 🔗
              </button>
              <button
                onClick={() => setActivePlan(null)}
                className="bg-stone-900 text-amber-50 hover:bg-amber-950 text-xs font-[family-name:var(--font-cinzel)] tracking-wider font-semibold px-6 py-2.5 rounded-sm transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
