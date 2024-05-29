import * as inaturalist from "./src/inaturalist.ts";
import {
  datesDescFrom,
  formattedDate,
  prevDayFromDate,
  prevYearFromDate,
} from "./src/dates.ts";

const nycPlaceId = 674;

async function* fetchSpeciesCountsUpThroughDate(
  date: Date,
  taxonIds: number[]
) {
  yield* fetchSpeciesCounts(prevYearFromDate(date), date, taxonIds);
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

function* chunks<T>(arr: T[], n: number): Generator<T[], void> {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

async function* fetchSpeciesCounts(
  dateFrom: Date,
  dateTo: Date,
  taxonId: number[] | undefined
) {
  const perPage = 100;
  // If we pass too many taxonIds to the API, it will return an error, so we split it up in 100 chunks
  for (const chunk of chunks(taxonId ?? [undefined], perPage)) {
    yield* inaturalist.fetchPaginate("/observations/species_counts", {
      order: "asc",
      placeId: nycPlaceId,
      captive: false,
      d1: formattedDate(dateFrom),
      d2: formattedDate(dateTo),
      perPage: perPage,
      hrank: "genus",
      taxonId: chunk.join(","),
    });
  }
}

const observationUrl = (id: number) =>
  `https://www.inaturalist.org/observations/${id}`;

const printObservationRow = (observation: inaturalist.Observation) => {
  const commonName = observation.taxon.preferred_common_name;
  const scientificName = observation.taxon.name;
  const photoUrl = observation.photos[0]?.url;
  const heading = commonName
    ? `${commonName} (*${scientificName}*)`
    : `*${scientificName}*`;
  const url = observationUrl(observation.id);

  console.log(`# ${heading}`);
  if (photoUrl) {
    console.log("");
    console.log(`![Observation photo](${photoUrl.replace("square", "small")})`);
  }
  console.log("");
  console.log(`* [Observation](${url})`);
  console.log(`* Date: ${observation.observed_on}`);
  console.log(
    `* Observer: ${observation.user.login} (Created: ${observation.user.created_at})`
  );
  console.log(
    `* Quality grade: ${formatQualityGrade(observation.quality_grade)}`
  );
  console.log("");
};

function formatQualityGrade(quality_grade: inaturalist.QualityGrade) {
  switch (quality_grade) {
    case "casual":
      return "⚪️ Casual";
    case "needs_id":
      return "🟡 Needs ID";
    case "research":
      return "🟢 Research";
  }
}

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

interface Row {
  date: string;
  url: string;
  commonName: string;
  scientificName: string;
  observer: string;
  photoUrl: string|undefined;
}

function prevResultsContainsTaxonId(
  taxonId: number,
  prevResults: inaturalist.TaxonCount[]
) {
  return prevResults.some(
    (result) =>
      result.taxon.id === taxonId || result.taxon.ancestor_ids.includes(taxonId)
  );
}

// https://stackoverflow.com/questions/58668361/how-can-i-convert-an-async-iterator-to-an-array
async function arrayAsyncFrom<T>(gen: AsyncIterable<T>): Promise<T[]> {
  const out: T[] = [];
  for await (const x of gen) {
    out.push(x);
  }
  return out;
}

for (const date of datesDescFrom(new Date())) {
  const taxonIds = await arrayAsyncFrom(fetchTaxonIdsOnDate(date, undefined));
  const prevYearResults = await arrayAsyncFrom(
    fetchSpeciesCountsUpThroughDate(prevDayFromDate(date), taxonIds)
  );
  for (const taxonId of taxonIds) {
    if (!prevResultsContainsTaxonId(taxonId, prevYearResults)) {
      const observations = await fetchObservationsOnDate(date, taxonId);
      for (const observation of observations.results) {
        printObservationRow(observation);
      }
    }
  }
}
