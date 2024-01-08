import { Mutex } from "async-mutex";

const buildUrl = (
  url: string,
  params: Record<string, string | number | boolean | undefined>
) => {
  const urlObj = new URL(url);
  Object.entries(params).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value === undefined ? "" : value.toString());
  });
  return urlObj;
};

const buildINaturalistApiUrl = <P extends Endpoint>(
  path: P,
  params: Record<string, string | number | boolean | undefined>
) =>
  buildUrl(
    // `https://api.inaturalist.org/v1${path}`,
    `https://default-20231018t204727-v3pycdbs6a-uc.a.run.app${path}`,
    params
  );
// ) => buildUrl(`http://localhost:8080${path}`, params);

// https://github.com/inaturalist/iNaturalistAPI/issues/391
//
// const fetchHeaders = { "User-Agent": "naturalists.nyc" };

type Endpoint = keyof EndpointsAndParams;

type EndpointsAndParams = {
  /** Top species in an area */
  "/observations/species_counts": {
    captive?: boolean;
    d1?: string; // FIXME: should there be a date time?
    d2?: string; // FIXME: should there be a date time?
    hrank?: string;
    month?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    order?: "asc" | "desc";
    perPage?: number; // FIXME: integer should be less than 500
    placeId?: number;
    verifiable?: boolean;
    taxonId?: string;
    year?: string; // FIXME: Should be string | string[]
  };
  /** Histogram per species */
  "/observations/histogram": {
    taxonId?: number;
    placeId?: number;
    verifiable?: string;
  };
  /** Top observers */
  "/observations/observers": {
    placeId?: number;
    date?: string;
    perPage?: number;
    orderBy?: OrderBy;
  };
};

type OrderBy = "observation_count" | "species_count";

type Responses = {
  "/observations/observers": INaturalistObserverResponse;
  "/observations/histogram": HistogramResponse;
  "/observations/species_counts": SpeciesCountsResponse;
};

/** Calculate days in seconds */
const daysToSeconds = (days: number): string => "" + days * 24 * 60 * 60;

const cacheTtl: Record<Endpoint, string> = {
  "/observations/species_counts": daysToSeconds(1),
  "/observations/histogram": daysToSeconds(30),
  "/observations/observers": daysToSeconds(1),
};

type RequestParamsBuilder = {
  [E in Endpoint]: (
    params: EndpointsAndParams[E]
  ) => Record<string, string | number | boolean | undefined>;
};

const requestParams: RequestParamsBuilder = {
  "/observations/species_counts": (params) => {
    return {
      captive: params.captive,
      d1: params.d1,
      d2: params.d2,
      hrank: params.hrank,
      month: params.month,
      order: params.order,
      per_page: params.perPage,
      place_id: params.placeId,
      preferred_place_id: params.placeId, // TODO: what is this
      taxon_id: params.taxonId,
      verifiable: params.verifiable,
      year: params.year,
    };
  },
  "/observations/histogram": (params) => {
    return {
      verifiable: "true",
      taxon_id: params.taxonId,
      place_id: params.placeId,
      preferred_place_id: params.placeId,
      locale: "en",
      date_field: "observed",
      interval: "week_of_year",
    };
  },
  "/observations/observers": (params) => {
    return {
      verifiable: "true",
      place_id: params.placeId,
      d1: params.date,
      per_page: params.perPage,
      order_by: params.orderBy,
    };
  },
};

export const fetchINaturalistApi = (() => {
  const mutex = new Mutex();

  return async <P extends Endpoint>(
    path: P,
    params: EndpointsAndParams[P]
  ): Promise<Responses[P]> => {
    return mutex.runExclusive(async () => {
      const url = buildINaturalistApiUrl(path, requestParams[path](params));
      const response = await fetch(url, {
        headers: {
          "X-CACHE-TTL": cacheTtl[path],
        },
      });
      return await response.json();
    });
  };
})();

const getDateOneMonthAgo = (): Date => {
  // Get a date object for the current time
  const date = new Date();

  // Set it to one month ago
  date.setMonth(date.getMonth() - 1);

  return date;
};

// Get date one month ago
export const getIsoDateOneMonthAgo = (): string => {
  // Format the date as YYYY-MM-DD
  const dateString = getDateOneMonthAgo().toISOString().split("T");

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
