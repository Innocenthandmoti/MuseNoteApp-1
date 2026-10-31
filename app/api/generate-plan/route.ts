import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { feastName, season, availableHymns } = await req.json();

    if (!feastName || !availableHymns || availableHymns.length === 0) {
      return NextResponse.json(
        { error: "Feast name and available hymns are required." },
        { status: 400 },
      );
    }

    // AI Selection Matching Engine
    // Filters approved scores by matching roles and feast keywords
    const suggestions: Record<string, string> = {};

    const roles = [
      "entrance",
      "kyrie",
      "gloria",
      "responsorial_psalm",
      "gospel_acclamation",
      "credo",
      "prayer_of_the_faithful",
      "offertory",
      "sanctus",
      "pater_noster",
      "agnus_dei",
      "communion",
      "thanksgiving",
      "recessional",
    ];

    const roleToDatabaseRole: Record<string, string> = {
      entrance: "Entrance",
      kyrie: "Kyrie",
      gloria: "Gloria",
      responsorial_psalm: "Responsorial Psalm",
      gospel_acclamation: "Gospel Acclamation",
      credo: "Credo",
      prayer_of_the_faithful: "Prayer of the Faithful",
      offertory: "Offertory",
      sanctus: "Sanctus",
      pater_noster: "Pater Noster",
      agnus_dei: "Agnus Dei",
      communion: "Communion",
      thanksgiving: "Thanksgiving",
      recessional: "Recessional",
    };

    roles.forEach((roleKey) => {
      const dbRole = roleToDatabaseRole[roleKey];

      // Find candidate hymns matching the role or tagged General
      const candidateHymns = availableHymns.filter(
        (h: any) => h.role === dbRole || h.role === "General" || !h.role,
      );

      if (candidateHymns.length > 0) {
        // Pick the best match for the feast theme or fallback to first candidate
        const match =
          candidateHymns.find(
            (h: any) =>
              feastName.toLowerCase().includes(h.title.toLowerCase()) ||
              (h.season && h.season.toLowerCase() === season.toLowerCase()),
          ) || candidateHymns[0];

        suggestions[roleKey] = match.id;
      }
    });

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate AI plan" },
      { status: 500 },
    );
  }
}
