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
    perPage: 500, // FIXME
    hrank: "genus",
    taxonId: taxonIds.join(","),
  });
}

async function* fetchSpeciesCountsOnDate(
  date: Date,
  taxonId: number[] | undefined
) {
  yield* fetchSpeciesCounts(date, date, taxonId);
}

async function* fetchTaxonIdsOnDate(date: Date, taxonId: undefined | number[]) {
  const speciesCounts = fetchSpeciesCountsOnDate(date, taxonId);
  for await (const speciesCount of speciesCounts) {
    yield speciesCount.taxon.id;
  }
}

async function* fetchSpeciesCounts(
  dateFrom: Date,
  dateTo: Date,
  taxonId: number[] | undefined
) {
  yield* inaturalist.fetchPaginate("/observations/species_counts", {
    order: "asc",
    placeId: nycPlaceId,
    captive: false,
    d1: formattedDate(dateFrom),
    d2: formattedDate(dateTo),
    perPage: 500, // FIXME
    hrank: "genus",
    taxonId: taxonId?.join(","),
  });
}

const dateSubtractDay = (d: Date) => d.setDate(d.getDate() - 1);

const dateSubtractYear = (d: Date) => d.setFullYear(d.getFullYear() - 1);

const formattedDate = (d: Date) =>
  `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

const observationUrl = (id: number) =>
  `https://www.inaturalist.org/observations/${id}`;

const printObservationRow = (observation: inaturalist.Observation) => {
  printRow({
    date: observation.observed_on,
    url: observationUrl(observation.id),
    commonName: observation.taxon.preferred_common_name,
    scientificName: observation.taxon.name,
    observer: observation.user.login,
  });
};

const prevDateFromDate = (date: Date) => {
  const previousDay = new Date(date);
  dateSubtractDay(previousDay);
  return previousDay;
};

// TODO: paginate below
function fetchObservationsOnDate(date: Date, taxonId: number) {
  return inaturalist.fetchINaturalistApi("/observations", {
    placeId: nycPlaceId,
    captive: false,
    d1: formattedDate(date),
    d2: formattedDate(date),
    taxonId: taxonId.toString(),
  });
}

function* dateGeneratorDescending(startDate: Date) {
  for (let date = new Date(startDate); ; dateSubtractDay(date)) {
    yield date;
  }
}

interface Row {
  date: string;
  url: string;
  commonName: string;
  scientificName: string;
  observer: string;
}

function printRow(row: Row) {
  // Format heading, handling if common name is missing
  const heading = row.commonName
    ? `${row.commonName} (*${row.scientificName}*)`
    : `*${row.scientificName}*`;
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

for (const date of dateGeneratorDescending(new Date())) {
  const taxonIds = await arrayAsyncFrom(fetchTaxonIdsOnDate(date, undefined));
  const prevDay = prevDateFromDate(date);
  const prevResults = await arrayAsyncFrom(
    fetchSpeciesCountsUpThroughDate(prevDay, taxonIds)
  );
  for (const taxonId of taxonIds) {
    if (!prevResultsContainsTaxonId(taxonId, prevResults)) {
      const observations = await fetchObservationsOnDate(date, taxonId);
      for (const observation of observations.results) {
        printObservationRow(observation);
      }
    }
  }
}
