import { type Taxon } from "./inaturalist";

const treeOfHeaven: Taxon = {
  id: 57278,
  rank: "species",
  rank_level: 10,
  iconic_taxon_id: 47126,
  ancestor_ids: [
    48460, 47126, 211194, 47125, 47124, 47729, 57279, 57280, 57278,
  ],
  is_active: true,
  name: "Ailanthus altissima",
  parent_id: 57280,
  ancestry: "48460/47126/211194/47125/47124/47729/57279/57280",
  extinct: false,
  default_photo: {
    id: 48595540,
    license_code: null,
    attribution:
      "(c) Abu-Isa Webb, all rights reserved, uploaded by Abu-Isa Webb",
    url: "https://static.inaturalist.org/photos/48595540/square.jpeg",
    original_dimensions: {
      height: 1153,
      width: 2048,
    },
    flags: [],
    square_url: "https://static.inaturalist.org/photos/48595540/square.jpeg",
    medium_url: "https://static.inaturalist.org/photos/48595540/medium.jpeg",
  },
  taxon_changes_count: 0,
  taxon_schemes_count: 3,
  observations_count: 72906,
  flag_counts: {
    resolved: 0,
    unresolved: 0,
  },
  current_synonymous_taxon_ids: null,
  atlas_id: null,
  complete_species_count: null,
  wikipedia_url: "http://en.wikipedia.org/wiki/Ailanthus_altissima",
  iconic_taxon_name: "Plantae",
  preferred_common_name: "tree-of-heaven",
  establishment_means: {
    id: 4838828,
    establishment_means: "introduced",
    place: {
      id: 674,
      name: "New York City",
      display_name: "New York City, US, NY",
      ancestry: "97394/1/48",
    },
  },
  preferred_establishment_means: "introduced",
};

export const taxa = {
  treeOfHeaven,
};
