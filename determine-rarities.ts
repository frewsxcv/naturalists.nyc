import * as inaturalist from "./src/inaturalist.ts";

const nycPlaceId = 674;

async function fetchSpeciesCountsUpThroughDate(date: Date, taxonIds: number[]) {
  // TODO: paginate
  const oneYearAgoFromDate = new Date(date);
  dateSubtractYear(oneYearAgoFromDate);
  const response = await inaturalist.fetchINaturalistApi(
    "/observations/species_counts",
    {
      order: "asc",
      placeId: nycPlaceId,
      captive: false,
      d1: formattedDate(oneYearAgoFromDate),
      d2: formattedDate(date),
      perPage: 500,
      hrank: "genus",
      taxonId: taxonIds.join(","),
    }
  );
  return response.results;
}

async function fetchSpeciesCountsOnDate(date: Date) {
  // TODO: paginate
  const response = await inaturalist.fetchINaturalistApi(
    "/observations/species_counts",
    {
      order: "asc",
      placeId: nycPlaceId,
      verifiable: true,
      d1: formattedDate(date),
      d2: formattedDate(date),
      perPage: 500,
      hrank: "genus",
    }
  );
  return response.results;
}

async function fetchTaxonIdsOnDate(date: Date) {
  const speciesCounts = await fetchSpeciesCountsOnDate(date);
  return speciesCounts.map((speciesCount) => speciesCount.taxon.id);
}

const dateSubtractDay = (d: Date) => d.setDate(d.getDate() - 1);

const dateSubtractYear = (d: Date) => d.setFullYear(d.getFullYear() - 1);

const formattedDate = (d: Date) =>
  `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

let date = new Date();
while (true) {
  console.log(date);
  const taxonIds = await fetchTaxonIdsOnDate(date);
  dateSubtractDay(date);
  const prevResults = await fetchSpeciesCountsUpThroughDate(date, taxonIds);
  for (const taxonId of taxonIds) {
    if (!prevResultsContainsTaxonId(taxonId, prevResults)) {
      console.log(taxonId);
    }
  }
  console.log("next...");
}

function prevResultsContainsTaxonId(
  taxonId: number,
  prevResults: inaturalist.Taxon[]
) {
  for (const result of prevResults) {
    if (result.taxon.id === taxonId || result.taxon.ancestor_ids.includes(taxonId)) {
      return true;
    }
  }
  return false;
}
