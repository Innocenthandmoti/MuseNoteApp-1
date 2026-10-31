"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Plan {
  id: string;
  date: string;
  feast_name: string;
  season: string;
  selections: Record<string, string>;
  user_id?: string;
}

interface HymnDetail {
  id: string;
  title: string;
  composer: string;
  fileUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
}

interface Comment {
  id: string;
  author_name: string;
  comment_text: string;
  created_at: string;
}

export default function SharedLiturgyPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [hymnMap, setHymnMap] = useState<Record<string, HymnDetail>>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchSharedPlan = async () => {
      setLoading(true);
      const { data: planData, error } = await supabase
        .from("LiturgicalPlan")
        .select("*")
        .eq("share_token", token)
        .single();

      if (error || !planData) {
        console.error("Plan not found");
        setLoading(false);
        return;
      }

      setPlan(planData);

      // Fetch details for selected hymns
      const hymnIds = Object.values(planData.selections || {}).filter(Boolean);
      if (hymnIds.length > 0) {
        const { data: hymnData } = await supabase
          .from("MediaItem")
          .select("id, title, composer, fileUrl, audioUrl, videoUrl")
          .in("id", hymnIds);

        if (hymnData) {
          const map: Record<string, HymnDetail> = {};
          hymnData.forEach((h: HymnDetail) => {
            map[h.id] = h;
          });
          setHymnMap(map);
        }
      }

      // Fetch comments for this plan
      fetchComments(planData.id);
      setLoading(false);
    };

    fetchSharedPlan();
  }, [token]);

  const fetchComments = async (planId: string) => {
    const { data } = await supabase
      .from("PlanComment")
      .select("*")
      .eq("plan_id", planId)
      .order("created_at", { ascending: true });

    if (data) setComments(data);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan || !authorName.trim() || !commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const { error } = await supabase.from("PlanComment").insert({
        plan_id: plan.id,
        author_name: authorName,
        comment_text: commentText,
      });

      if (error) throw error;

      setCommentText("");
      fetchComments(plan.id);
    } catch (err: any) {
      alert(`Error posting comment: ${err.message}`);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#FDFBF7]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-900 border-t-transparent"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen max-w-xl mx-auto py-20 px-6 text-center font-sans">
        <h1 className="text-2xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900">
          Liturgy Plan Not Found
        </h1>
        <p className="text-xs text-stone-600 mt-2 mb-6">
          This share link may be invalid or the plan has been removed.
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-amber-900 text-amber-50 px-4 py-2 rounded text-xs font-[family-name:var(--font-cinzel)] font-semibold cursor-pointer"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const massParts = [
    { key: "entrance", label: "Entrance Hymn / Introit" },
    { key: "kyrie", label: "Kyrie (Lord, Have Mercy)" },
    { key: "gloria", label: "Gloria (Glory to God)" },
    { key: "responsorial_psalm", label: "Responsorial Psalm" },
    { key: "gospel_acclamation", label: "Gospel Acclamation / Alleluia" },
    { key: "credo", label: "Credo (I Believe / Creed)" },
    { key: "prayer_of_the_faithful", label: "Prayer of the Faithful" },
    { key: "offertory", label: "Offertory / Presentation of Gifts" },
    { key: "sanctus", label: "Sanctus (Holy, Holy, Holy)" },
    { key: "pater_noster", label: "Pater Noster (Our Father)" },
    { key: "agnus_dei", label: "Agnus Dei (Lamb of God)" },
    { key: "communion", label: "Communion Processional" },
    { key: "thanksgiving", label: "Post-Communion / Thanksgiving" },
    { key: "recessional", label: "Recessional / Dismissal Hymn" },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans p-6 sm:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Read-Only Banner */}
        <div className="bg-amber-100/80 border border-amber-300 rounded-lg p-3.5 text-center text-xs text-amber-950 font-[family-name:var(--font-cinzel)] font-semibold">
          👀 Read-Only Shared View — You are viewing the official Mass plan. You
          can listen, view sheet music, or leave comments below.
        </div>

        {/* Header */}
        <div className="text-center space-y-3 border-b border-amber-900/20 pb-6">
          <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-semibold tracking-widest text-amber-900 uppercase bg-amber-50 px-3 py-1 rounded-sm border border-amber-200/60">
            MuseNote Liturgical Program
          </span>
          <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900">
            {plan.feast_name}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 italic font-[family-name:var(--font-cinzel)]">
            Date: {plan.date} • Season: {plan.season}
          </p>
        </div>

        {/* Mass Selections Program */}
        <div className="bg-white rounded-xl border border-amber-900/20 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-[family-name:var(--font-cinzel)] font-bold text-stone-900 border-b border-amber-900/10 pb-3">
            Selected Order of Mass
          </h2>

          <div className="space-y-4">
            {massParts.map((part) => {
              const hymnId = plan.selections[part.key];
              const hymn = hymnId ? hymnMap[hymnId] : null;

              return (
                <div
                  key={part.key}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#FDFBF7] p-4 rounded-lg border border-stone-200 gap-2"
                >
                  <div>
                    <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-bold uppercase tracking-wider text-amber-900 block">
                      {part.label}
                    </span>
                    <p className="text-sm font-[family-name:var(--font-cinzel)] font-bold text-stone-900 mt-0.5">
                      {hymn ? (
                        hymn.title
                      ) : (
                        <span className="text-stone-400 italic font-normal">
                          No selection
                        </span>
                      )}
                    </p>
                    {hymn && hymn.composer && (
                      <p className="text-xs text-stone-500 italic">
                        By {hymn.composer}
                      </p>
                    )}
                  </div>

                  {hymn && (
                    <div className="flex gap-2 text-xs">
                      {hymn.fileUrl && (
                        <a
                          href={hymn.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-amber-900 hover:bg-amber-950 text-amber-50 px-3 py-1.5 rounded font-semibold font-[family-name:var(--font-cinzel)] transition cursor-pointer"
                        >
                          View PDF ↗
                        </a>
                      )}
                      <button
                        onClick={() => router.push(`/hymns/${hymn.id}`)}
                        className="bg-stone-100 hover:bg-stone-200 text-stone-800 px-3 py-1.5 rounded font-semibold font-[family-name:var(--font-cinzel)] cursor-pointer"
                      >
                        Details
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl border border-amber-900/20 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-[family-name:var(--font-cinzel)] font-bold text-stone-900 border-b border-amber-900/10 pb-3">
            💬 Choir & Community Feedback / Comments
          </h2>

          {/* Comment List */}
          {comments.length === 0 ? (
            <p className="text-xs text-stone-500 italic">
              No comments yet. Be the first to leave feedback for this liturgy
              plan!
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="bg-[#FDFBF7] p-3.5 rounded border border-stone-200 space-y-1"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-amber-950 font-[family-name:var(--font-cinzel)]">
                      {c.author_name}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-stone-800 font-sans leading-relaxed">
                    {c.comment_text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment Form */}
          <form
            onSubmit={handleAddComment}
            className="pt-4 border-t border-stone-100 space-y-3"
          >
            <h3 className="text-xs font-[family-name:var(--font-cinzel)] font-bold text-stone-800 uppercase tracking-wider">
              Leave a Comment or Suggestion
            </h3>
            <input
              type="text"
              required
              placeholder="Your Name / Role (e.g., Soprano Section Leader)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full bg-[#FDFBF7] border border-stone-300 rounded px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-900"
            />
            <textarea
              rows={3}
              required
              placeholder="Write your note or feedback here..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full bg-[#FDFBF7] border border-stone-300 rounded px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-900"
            />
            <button
              type="submit"
              disabled={submittingComment}
              className="bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs font-[family-name:var(--font-cinzel)] font-bold px-5 py-2.5 rounded shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {submittingComment ? "Posting Comment..." : "Post Comment"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
