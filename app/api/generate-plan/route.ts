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

    // Returns an array of hymn IDs for each role
    const suggestions: Record<string, string[]> = {};

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

      const candidateHymns = availableHymns.filter(
        (h: any) => h.role === dbRole || h.role === "General" || !h.role,
      );

      if (candidateHymns.length > 0) {
        // Pick up to 2 matching hymns for this role
        const matches = candidateHymns.slice(0, 2).map((h: any) => h.id);
        suggestions[roleKey] = matches;
      } else {
        suggestions[roleKey] = [];
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
