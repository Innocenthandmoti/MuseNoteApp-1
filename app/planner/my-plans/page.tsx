"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface PlanSummary {
  id: string;
  date: string;
  feast_name: string;
  season: string;
  share_token: string;
  created_at: string;
  comment_count?: number;
}

export default function MyPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchUserAndPlans = async () => {
      setLoading(true);

      // 1. Get current logged-in user session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("Please log in to view your saved liturgy plans.");
        router.push("/login");
        return;
      }

      setCurrentUser(session.user);

      // 2. Fetch all plans created by this user
      const { data: userPlans, error } = await supabase
        .from("LiturgicalPlan")
        .select("id, date, feast_name, season, share_token, created_at")
        .eq("user_id", session.user.id)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching plans:", error);
      } else if (userPlans) {
        // 3. Get comment counts for each plan
        const plansWithComments = await Promise.all(
          userPlans.map(async (plan) => {
            const { count } = await supabase
              .from("PlanComment")
              .select("*", { count: "exact", head: true })
              .eq("plan_id", plan.id);

            return {
              ...plan,
              comment_count: count || 0,
            };
          }),
        );

        setPlans(plansWithComments);
      }

      setLoading(false);
    };

    fetchUserAndPlans();
  }, [router]);

  const handleDelete = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this liturgy plan?")) return;

    const { error } = await supabase
      .from("LiturgicalPlan")
      .delete()
      .eq("id", planId);

    if (error) {
      alert(`Error deleting plan: ${error.message}`);
    } else {
      setPlans((prev) => prev.filter((p) => p.id !== planId));
      alert("Plan deleted successfully.");
    }
  };

  const copyShareLink = (shareToken: string) => {
    const link = `${window.location.origin}/planner/share/${shareToken}`;
    navigator.clipboard.writeText(link);
    alert("Shareable link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#FDFBF7]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-900 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans p-6 sm:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-amber-900/20 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-semibold tracking-widest text-amber-900 uppercase bg-amber-50 px-3 py-1 rounded-sm border border-amber-200/60">
              Account Dashboard
            </span>
            <h1 className="text-3xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 mt-2">
              My Saved Mass Plans
            </h1>
            <p className="text-xs text-stone-600 mt-1">
              Logged in as:{" "}
              <strong className="text-amber-950">{currentUser?.email}</strong>
            </p>
          </div>

          <button
            onClick={() => router.push("/planner")}
            className="bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs font-[family-name:var(--font-cinzel)] font-bold px-5 py-3 rounded shadow-xs transition cursor-pointer"
          >
            + Create New Liturgy Plan
          </button>
        </div>

        {/* List of Plans */}
        {plans.length === 0 ? (
          <div className="bg-white rounded-xl border border-amber-900/20 p-12 text-center space-y-4">
            <h3 className="text-lg font-[family-name:var(--font-cinzel)] font-bold text-stone-800">
              No Liturgy Plans Saved Yet
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Start building your first Mass repertoire schedule and generate
              shareable links for your choir and parish.
            </p>
            <button
              onClick={() => router.push("/planner")}
              className="bg-amber-900 text-amber-50 px-5 py-2.5 rounded text-xs font-bold cursor-pointer"
            >
              Start Planning Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-xl border border-amber-900/20 p-6 shadow-xs hover:border-amber-900/40 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded border border-amber-200/60">
                      {plan.date}
                    </span>
                    <span className="text-[10px] text-stone-500 italic">
                      Season: {plan.season || "Ordinary Time"}
                    </span>
                  </div>

                  <h2 className="text-xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 pt-1">
                    {plan.feast_name}
                  </h2>
                </div>

                {/* Comment Counter Indicator */}
                <div className="flex items-center gap-2 pt-2 border-t border-stone-100 text-xs">
                  <span className="text-amber-900 font-bold">
                    💬 {plan.comment_count}
                  </span>
                  <span className="text-stone-600">
                    {plan.comment_count === 1
                      ? "comment / feedback"
                      : "comments / feedback"}
                  </span>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap gap-2 text-xs font-[family-name:var(--font-cinzel)] font-semibold">
                  {/* Edit Plan */}
                  <button
                    onClick={() => router.push(`/planner?date=${plan.date}`)}
                    className="bg-amber-900 hover:bg-amber-950 text-amber-50 px-3.5 py-2 rounded transition cursor-pointer"
                  >
                    ✏️ Edit Plan
                  </button>

                  {/* View Public / Share Page */}
                  <button
                    onClick={() =>
                      router.push(`/planner/share/${plan.share_token}`)
                    }
                    className="bg-stone-100 hover:bg-stone-200 text-stone-800 px-3.5 py-2 rounded transition cursor-pointer"
                  >
                    👀 View Comments
                  </button>

                  {/* Copy Link */}
                  <button
                    onClick={() => copyShareLink(plan.share_token)}
                    className="border border-amber-900/30 text-amber-900 hover:bg-amber-50 px-3.5 py-2 rounded transition cursor-pointer"
                  >
                    🔗 Copy Link
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="text-red-700 hover:bg-red-50 px-2.5 py-2 rounded transition cursor-pointer ml-auto"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
