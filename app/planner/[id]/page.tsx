import { PrismaClient } from "@prisma/client";
import Link from "next/link";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicPlanPage({ params }: PageProps) {
  const { id } = await params;

  let plan = null;
  try {
    plan = await prisma.liturgicalPlan.findUnique({
      where: { id },
      include: {
        songs: {
          include: { mediaItem: true },
          orderBy: { id: "asc" },
        },
      },
    });
  } catch (error) {
    console.error("Failed to load public liturgy plan:", error);
  }

  if (!plan) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <span className="text-4xl text-amber-800 font-[family-name:var(--font-cinzel)]">
          ☩
        </span>
        <h1 className="text-2xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900">
          Celebration Not Found
        </h1>
        <p className="text-stone-600 text-sm italic">
          This order of service may have been removed or the link is invalid.
        </p>
        <div className="pt-4">
          <Link
            href="/planner"
            className="bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs font-[family-name:var(--font-cinzel)] tracking-wider font-semibold px-6 py-2.5 rounded-sm transition"
          >
            Return to Planner
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 bg-white my-8 rounded-md border border-amber-900/30 shadow-md relative overflow-hidden">
      {/* Decorative Liturgical Accent Header */}
      <div className="absolute top-0 left-0 w-full h-2 bg-amber-900"></div>

      <div className="text-center pb-8 border-b border-amber-900/20 space-y-3">
        <span className="text-4xl text-amber-800 font-[family-name:var(--font-cinzel)] block">
          ☩
        </span>
        <span className="text-[10px] font-[family-name:var(--font-cinzel)] uppercase tracking-widest text-amber-900 font-bold bg-amber-50 px-3 py-1 rounded-sm border border-amber-200/60 inline-block">
          Official Order of Service
        </span>
        <h1 className="text-3xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 tracking-tight">
          {plan.title}
        </h1>
        <p className="text-xs italic text-stone-600">
          Celebration Date:{" "}
          {new Date(plan.date).toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        {plan.notes && (
          <div className="mt-4 bg-[#FDFBF7] border border-amber-900/20 p-4 rounded-sm text-xs text-stone-700 italic max-w-lg mx-auto">
            <span className="font-bold uppercase tracking-wider block text-amber-900 not-italic mb-1 font-[family-name:var(--font-cinzel)]">
              Director&apos;s Notes
            </span>
            {plan.notes}
          </div>
        )}
      </div>

      {/* Repertoire Order */}
      <div className="py-8 space-y-6">
        <h2 className="text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-widest text-amber-900 font-bold text-center">
          Liturgical Music Program
        </h2>

        {plan.songs && plan.songs.length > 0 ? (
          <div className="space-y-4">
            {plan.songs.map((song, index) => (
              <div
                key={song.id}
                className="bg-[#FDFBF7] p-4 rounded-sm border border-amber-900/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-amber-800">
                      #{index + 1}
                    </span>
                    <span className="font-semibold text-stone-900 text-sm">
                      {song.mediaItem?.title || "Untitled Repertoire"}
                    </span>
                  </div>
                  {song.mediaItem?.composer && (
                    <p className="text-xs italic text-stone-600 ml-5">
                      Composer: {song.mediaItem.composer}
                    </p>
                  )}
                </div>
                <span className="text-[10px] bg-amber-900 text-amber-50 px-2.5 py-1 rounded-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider font-semibold">
                  {song.massPart}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-[#FDFBF7] rounded-sm border border-amber-900/10">
            <p className="text-xs text-stone-500 italic">
              No musical selections have been published for this liturgy yet.
            </p>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="mt-8 pt-6 border-t border-amber-900/20 text-center space-y-3">
        <p className="text-[11px] font-[family-name:var(--font-cinzel)] text-stone-500 tracking-wider">
          Generated securely via MuseNote Liturgical Registry
        </p>
        <div>
          <Link
            href="/planner"
            className="text-xs font-[family-name:var(--font-cinzel)] text-amber-900 hover:text-amber-950 font-bold underline uppercase tracking-wider"
          >
            ← Back to Planner Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
