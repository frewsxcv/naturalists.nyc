import { Mutex } from "async-mutex";

const buildUrl = (url: string, params: Record<string, string | number>) => {
  const urlObj = new URL(url);
  Object.entries(params).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value.toString());
  });
  return urlObj;
};

const buildINaturalistApiUrl = (
  path: string,
  params: Record<string, string | number>
) => buildUrl(`https://naturalists-nyc.uc.r.appspot.com${path}`, params);
// ) => buildUrl(`http://localhost:8080${path}`, params);

// https://github.com/inaturalist/iNaturalistAPI/issues/391
//
// const fetchHeaders = { "User-Agent": "naturalists.nyc" };

const fetchINaturalistApi = (() => {
  const mutex = new Mutex();

  return async <T extends unknown>(
    path: string,
    params: Record<string, string | number>
  ): Promise<T> => {
    return mutex.runExclusive(async () => {
      const url = buildINaturalistApiUrl(path, params);
      const response = await fetch(url, {
        // headers: fetchHeaders,
      });
      return await response.json();
    });
  };
})();

// Get date one month ago
export const getIsoDateOneMonthAgo = (): string => {
  // Get a date object for the current time
  const date = new Date();

  // Set it to one month ago
  date.setMonth(date.getMonth() - 1);

  // Format the date as YYYY-MM-DD
  const dateString = date.toISOString().split("T");

  if (!dateString[0]) {
    throw new Error("Could not generate date string");
  }

  return dateString[0];
};

interface INaturalistObserver {
  user_id: number;
  observation_count: number;
  species_count: number;
  user: {
    id: number;
    login: string;
    spam: boolean;
    suspended: boolean;
    created_at: string;
    login_autocomplete: string;
    login_exact: string;
    name: string;
    name_autocomplete: string;
    orcid: null;
    icon: null;
    observations_count: number;
    identifications_count: number;
    journal_posts_count: number;
    activity_count: number;
    species_count: number;
    universal_search_rank: number;
    roles: any[];
    site_id: number;
    icon_url: null;
  };
}

export interface INaturalistObserverResponse {
  total_results: number;
  page: number;
  per_page: number;
  results: INaturalistObserver[];
}

export const fetchTopINaturalistObservers = (
  placeId: number,
  orderBy: "observation_count" | "species_count",
  date: string,
  perPage = 10
): Promise<INaturalistObserverResponse> => {
  return fetchINaturalistApi("/observations/observers", {
    verifiable: "true",
    place_id: placeId,
    d1: date,
    per_page: perPage,
    order_by: orderBy,
  });
};

export const fetchINaturalistHistogram = (
  taxonId: number,
  placeId: number
): Promise<HistogramResponse> =>
  fetchINaturalistApi("/observations/histogram", {
    verifiable: "true",
    taxon_id: taxonId,
    place_id: placeId,
    preferred_place_id: placeId,
    locale: "en",
    date_field: "observed",
    interval: "week_of_year",
  });

// TODO: Rather than doing this one month at a time, do a couple weeks before
//       and after the current date, which might require two requests.
export const fetchINaturalistSpeciesCounts = (
  placeId: number,
  month: number,
  perPage = 200
): Promise<SpeciesCountsResponse> =>
  fetchINaturalistApi("/observations/species_counts", {
    place_id: placeId,
    preferred_place_id: placeId,
    month,
    captive: "false",
    per_page: perPage,
  });

export interface HistogramResponse {
  total_results: number;
  page: number;
  per_page: number;
  results: {
    week_of_year: Record<string, number>;
  };
}

export interface Taxon {
  count: number;
  taxon: {
    observations_count: number;
    taxon_schemes_count: number;
    is_active: boolean;
    ancestry: string;
    flag_counts: {
      resolved: number;
      unresolved: number;
    };
    wikipedia_url: string;
    current_synonymous_taxon_ids: null | any[];
    iconic_taxon_id: number;
    rank_level: number;
    taxon_changes_count: number;
    atlas_id: null | any;
    complete_species_count: null | any;
    parent_id: number;
    name: string;
    rank: string;
    extinct: boolean;
    id: number;
    default_photo: {
      id: number;
      license_code: string;
      attribution: string;
      url: string;
      original_dimensions: {
        height: number;
        width: number;
      };
      flags: any[];
      square_url: string;
      medium_url: string;
    };
    ancestor_ids: number[];
    iconic_taxon_name: string;
    preferred_common_name: string;
    establishment_means: {
      establishment_means: string;
      id: number;
      place: {
        id: number;
        name: string;
        display_name: string;
        ancestry: string;
      };
    };
    preferred_establishment_means: string;
  };
}

interface SpeciesCountsResponse {
  total_results: number;
  page: number;
  per_page: number;
  results: Taxon[];
}
