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

type Path =
  | "/observations/species_counts"
  | "/observations/histogram"
  | "/observations/observers";

type Params = {
  "/observations/species_counts": {
    placeId: number;
    month: number;
    perPage: number;
  };
  "/observations/histogram": {
    taxonId: number;
    placeId: number;
  };
  "/observations/observers": {
    placeId: number;
    date: string;
    perPage: number;
    orderBy: string;
  };
};

type RequestParams = {
  [P in Path]: (params: Params[P]) => Record<string, string | number>;
};

const requestParams: RequestParams = {
  "/observations/species_counts": (params) => {
    return {
      place_id: params.placeId,
      preferred_place_id: params.placeId,
      month: params.month,
      captive: "false",
      per_page: params.perPage,
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

const fetchINaturalistApi = (() => {
  const mutex = new Mutex();

  return async <T extends unknown, P extends Path>(
    path: P,
    params: Params[P]
  ): Promise<T> => {
    return mutex.runExclusive(async () => {
      const url = buildINaturalistApiUrl(path, requestParams[path](params));
      const response = await fetch(url, {
        // headers: fetchHeaders,
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

type OrderBy = "observation_count" | "species_count";

export const fetchTopINaturalistObservers = (
  placeId: number,
  orderBy: OrderBy,
  date: string,
  perPage = 10
): Promise<INaturalistObserverResponse> => {
  return fetchINaturalistApi("/observations/observers", {
    placeId,
    date,
    perPage,
    orderBy,
  });
};

export const fetchINaturalistHistogram = (
  taxonId: number,
  placeId: number
): Promise<HistogramResponse> =>
  fetchINaturalistApi("/observations/histogram", {
    taxonId,
    placeId,
  });

// TODO: Rather than doing this one month at a time, do a couple weeks before
//       and after the current date, which might require two requests.
export const fetchINaturalistSpeciesCounts = (
  placeId: number,
  month: number,
  perPage = 200
): Promise<SpeciesCountsResponse> =>
  fetchINaturalistApi("/observations/species_counts", {
    placeId,
    month,
    perPage,
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
