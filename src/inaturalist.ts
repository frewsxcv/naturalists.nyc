const lastRequestTime = new Date();

const buildUrl = (url: string, params: Record<string, string>) => {
  const urlObj = new URL(url);
  Object.entries(params).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });
  return urlObj;
};

const buildINaturalistApiUrl = (path: string, params: Record<string, string>) =>
  buildUrl(`https://api.inaturalist.org/v1${path}`, params);

const fetchINaturalistApi = async <T extends unknown>(
  path: string,
  params: Record<string, string>
): Promise<T> => {
  // Throttle requests to no more than 1 request every 2 seconds
  if (new Date().getTime() - lastRequestTime.getTime() < 2000) {
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve(fetchINaturalistApi(path, params));
      }, 2000)
    );
  }
  lastRequestTime.setTime(new Date().getTime());
  const url = buildINaturalistApiUrl(path, params);
  const response = await fetch(url);
  return await response.json();
};

export const fetchINaturalistHistogram = (
  taxonId: number,
  placeId: number
): Promise<HistogramResponse> =>
  fetchINaturalistApi("/observations/histogram", {
    verifiable: "true",
    taxon_id: taxonId.toString(),
    place_id: placeId.toString(),
    preferred_place_id: placeId.toString(),
    locale: "en",
    date_field: "observed",
    interval: "week_of_year",
  });

export const fetchINaturalistSpeciesCounts = (
  placeId: number,
  month: number
): Promise<SpeciesCountsResponse> =>
  fetchINaturalistApi("/observations/species_counts", {
    place_id: placeId.toString(),
    preferred_place_id: placeId.toString(),
    month: month.toString(),
    captive: "false",
    per_page: "30",
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
