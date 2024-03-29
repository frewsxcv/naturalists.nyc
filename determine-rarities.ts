import * as inaturalist from "./src/inaturalist.ts";

const nycPlaceId = 674;

async function* fetchSpeciesCountsUpThroughDate(
  date: Date,
  taxonIds: number[]
) {
  const oneYearAgoFromDate = new Date(date);
  dateSubtractYear(oneYearAgoFromDate);
  yield* inaturalist.fetchPaginate("/observations/species_counts", {
    order: "asc",
    placeId: nycPlaceId,
    captive: false,
    d1: formattedDate(oneYearAgoFromDate),
    d2: formattedDate(date),
    perPage: 500,
    hrank: "genus",
    taxonId: taxonIds.join(","),
  });
}

async function* fetchSpeciesCountsOnDate(date: Date) {
  yield* inaturalist.fetchPaginate("/observations/species_counts", {
    order: "asc",
    placeId: nycPlaceId,
    verifiable: true,
    d1: formattedDate(date),
    d2: formattedDate(date),
    perPage: 500,
    hrank: "genus",
  });
}

async function* fetchTaxonIdsOnDate(date: Date) {
  const speciesCounts = fetchSpeciesCountsOnDate(date);
  for await (const speciesCount of speciesCounts) {
    yield speciesCount.taxon.id;
  }
}

const dateSubtractDay = (d: Date) => d.setDate(d.getDate() - 1);

const dateSubtractYear = (d: Date) => d.setFullYear(d.getFullYear() - 1);

const formattedDate = (d: Date) =>
  `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

let date = new Date();
while (true) {
  const taxonIds = await arrayAsyncFrom(fetchTaxonIdsOnDate(date));
  const prevDay = new Date(date);
  dateSubtractDay(prevDay);
  const prevResults = await arrayAsyncFrom(
    fetchSpeciesCountsUpThroughDate(prevDay, taxonIds)
  );
  for (const taxonId of taxonIds) {
    if (!prevResultsContainsTaxonId(taxonId, prevResults)) {
      // TODO: paginate below
      const observations = await inaturalist.fetchINaturalistApi("/observations", {
        placeId: nycPlaceId,
        captive: false,
        d1: formattedDate(date),
        d2: formattedDate(date),
        taxonId: taxonId.toString(),
      });
      for (const observation of observations.results) {
        printRow({
          date: date.toISOString(),
          url: "https://www.inaturalist.org/observations/" + observations.results[0].id,
          commonName: observation.taxon.preferred_common_name,
          scientificName: observation.taxon.name,
          observer: observation.user.login,
        });
      }
    }
  }
  dateSubtractDay(date);
}

// function printRow(row: any[]) {
//   console.log(row.map(n => n ? `"${n}"` : n).join(","));
// }

interface Row {
  date: string;
  url: string;
  commonName: string;
  scientificName: string;
  observer: string;
}

function printRow(row: Row) {
  // Format heading, handling if common name is missing
  const heading = row.commonName ? `${row.commonName} (*${row.scientificName}*)` : `*${row.scientificName}*`;
  console.log(`# ${heading}`);
  console.log("");
  console.log(`* [Observation](${row.url})`);
  console.log(`* Date: ${row.date}`);
  console.log(`* Observer: ${row.observer}`);
  console.log("");
}

function prevResultsContainsTaxonId(
  taxonId: number,
  prevResults: inaturalist.TaxonCount[]
) {
  for (const result of prevResults) {
    if (
      result.taxon.id === taxonId ||
      result.taxon.ancestor_ids.includes(taxonId)
    ) {
      return true;
    }
  }
  return false;
}

// https://stackoverflow.com/questions/58668361/how-can-i-convert-an-async-iterator-to-an-array
async function arrayAsyncFrom<T>(gen: AsyncIterable<T>): Promise<T[]> {
  const out: T[] = [];
  for await (const x of gen) {
    out.push(x);
  }
  return out;
}
