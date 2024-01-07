import * as inaturalist from "./src/inaturalist.ts";

const responseNotIncludingToday = await inaturalist.fetchINaturalistApi(
  "/observations/species_counts",
  {
    order: "asc",
    placeId: 674,
    verifiable: true,
    year: "2023,2024",
    d2: "2024-01-03",
    perPage: 500,
    hrank: "genus",
  }
);

const responseIncludingToday = await inaturalist.fetchINaturalistApi(
  "/observations/species_counts",
  {
    order: "asc",
    placeId: 674,
    verifiable: true,
    year: "2023,2024",
    d2: "2024-01-07",
    perPage: 500,
    hrank: "genus",
  }
);

const speciesIdsNotIncludingToday =
  responseNotIncludingToday.results.reduce((prev, curr) => {
    prev.add(curr.taxon.id);
    return prev;
  }, new Set<number>());

for (const response of responseIncludingToday.results) {
    if (!speciesIdsNotIncludingToday.has(response.taxon.id)) {
        console.log(response.taxon.name);
    }
}
