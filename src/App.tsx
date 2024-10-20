import Row from "react-bootstrap/Row";
import Container from "./components/Container";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Navbar, { defaultPlace, type SelectedPlace } from "./components/Navbar";
import Card from "react-bootstrap/Card";
import { LinkIcon } from "./components/LinkIcon";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import {
  MdChat,
  MdNewspaper,
  MdManageSearch,
  MdBolt,
  MdWorkspacePremium,
  MdFilterList,
  MdStar,
} from "react-icons/md";
import {
  INaturalistResponse,
  Observation,
  Observer,
  Place,
  fetchINaturalistApi,
  iconicTaxa,
  type IconicTaxon,
} from "./inaturalist";
import { Dropdown, Spinner } from "react-bootstrap";
import Charts, { type ChartFilterProp } from "./components/Charts";
import { Route, Routes, HashRouter } from "react-router-dom";
import { getIsoDateOneMonthAgo } from "./dates";
import { assertUnreachable } from "./utils";
import LandAcknowlegement from "./components/LandAcknowledgement";
import Watch from "./components/Watch";
import CardTitle from "./components/CardTitle";
import { GenericCardSection } from "./components/GenericCardSection";
import { PlaceName } from "./components/PlaceName";
import Pagination from "./components/Pagination";

type ChartSetFilterProp = {
  setFilter: (filter: IconicTaxon) => void;
};

type OrderByProp = {
  orderBy: "observation_count" | "species_count";
};

const Explore = ({
  selectedPlace,
  setSelectedPlace,
}: {
  selectedPlace: SelectedPlace;
  setSelectedPlace: (place: SelectedPlace) => void;
}) => {
  return (
    <>
      <Navbar
        selectedTab="explore"
        selectedPlace={selectedPlace}
        setSelectedPlace={setSelectedPlace}
      />
      <Container>
        <Row>
          <Col>
            <LandAcknowlegement />
          </Col>
        </Row>
        <Row className="gx-3 row-gap-3">
          <Col xs={12} md={6}>
            <TopObserversCard selectedPlace={selectedPlace} />
          </Col>
          <Col xs={12} md={6}>
            <div className="d-flex flex-column gap-3">
              <ActiveSpeciesCard selectedPlace={selectedPlace} />
              <UnexpectedObservationsCard selectedPlace={selectedPlace} />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

const ActiveSpeciesCard = ({
  selectedPlace,
}: {
  selectedPlace: SelectedPlace;
}) => {
  const [filter, setFilter] = useState<IconicTaxon | undefined>(undefined);
  const clearFilterButton = filter ? (
    <Button onClick={() => setFilter(undefined)} size="sm">
      Clear filter
    </Button>
  ) : null;

  return (
    <Card className="bg-body-secondary">
      <Card.Body>
        <CardTitle>
          <div className="flex-grow-1">
            <MdBolt />
            &nbsp;Active species
          </div>
          <div className="d-flex flex-row gap-1">
            <FilterDropdown filter={filter} setFilter={setFilter} />
            {clearFilterButton}
          </div>
        </CardTitle>
        <div className="d-flex flex-column gap-1">
          <Charts filter={filter} placeId={selectedPlace.id} />
        </div>
      </Card.Body>
    </Card>
  );
};

const Learn = ({
  selectedPlace,
  setSelectedPlace,
}: {
  selectedPlace: SelectedPlace;
  setSelectedPlace: (place: SelectedPlace) => void;
}) => {
  return (
    <>
      <Navbar
        selectedTab="learn"
        selectedPlace={selectedPlace}
        setSelectedPlace={setSelectedPlace}
      />
      <Container>
        <Row className="gx-3 row-gap-3">
          <Col xs={12} md={6}>
            <div className="d-flex flex-column gap-3">
              <ConnectCard />
              <PapersCard />
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="d-flex flex-column gap-3">
              <GuidesCard />
              <Watch />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

const GuidesCard = () => {
  return (
    <Card className="bg-body-secondary">
      <Card.Body>
        <Guides />
      </Card.Body>
    </Card>
  );
};

const ConnectCard = () => {
  return (
    <Card className="bg-body-secondary">
      <Card.Body>
        <CardTitle>
          <MdChat />
          &nbsp;Connect
        </CardTitle>
        <a href="https://discord.gg/FEwKgrDV92">Join the Discord</a>
      </Card.Body>
    </Card>
  );
};

const FilterDropdown = ({
  filter,
  setFilter,
}: ChartFilterProp & ChartSetFilterProp) => {
  const iconicTaxaOptions = iconicTaxa.map((iconicTaxon, i) => {
    return (
      <Dropdown.Item key={i} eventKey={iconicTaxon}>
        {iconicTaxon}
      </Dropdown.Item>
    );
  });
  const toggleText = filter ? `Filter: ${filter}` : "Filter";
  return (
    <Dropdown
      onSelect={(value) => value && isIconicTaxon(value) && setFilter(value)}
    >
      <Dropdown.Toggle size="sm" variant="secondary">
        <MdFilterList />
        &nbsp;
        {toggleText}
      </Dropdown.Toggle>
      <Dropdown.Menu>{iconicTaxaOptions}</Dropdown.Menu>
    </Dropdown>
  );
};

const isIconicTaxon = (taxon: string): taxon is IconicTaxon => {
  return iconicTaxa.some((iconicTaxon) => iconicTaxon === taxon);
};

export const PapersCard = () => {
  return (
    <Card className="bg-body-secondary">
      <Card.Body>
        <CardTitle>
          <MdNewspaper />
          &nbsp;Papers
        </CardTitle>
        <ul>
          <li>
            <a href="https://www.ser.org/news/305433/Seeing-the-Forest-and-the-Trees-Outcomes-of-Forest-Restoration-in-The-Bronx-.htm">
              Seeing the Forest and the Trees: Outcomes of Forest Restoration in
              The Bronx
            </a>
          </li>
          <li>
            <a href="https://www.coreytcallaghan.com/papers/Bowler_et_al-2024-Treating%20gaps%20and%20biases%20in%20biodiversity%20data%20as%20a%20missing%20data%20problem.pdf">
              Treating gaps and biases in biodiversity data as a missing data
              problem
            </a>
          </li>
        </ul>
      </Card.Body>
    </Card>
  );
};

const Guides = () => {
  return (
    <>
      <CardTitle>
        <MdManageSearch />
        &nbsp;Guides
      </CardTitle>
      <ul>
        <li>
          <a href="https://www.amnh.org/content/download/35179/518842/file/ASeasonalGuidetoNewYorkCitysInvertebrates.pdf">
            A Seasonal Guide to New York City's Invertebrates
          </a>
        </li>
      </ul>
    </>
  );
};

const ProfileImage = ({
  iconUrl,
  name,
}: {
  iconUrl: string | null;
  name: string;
}) => {
  const imageSize = "30px";
  return iconUrl ? (
    <img
      src={iconUrl}
      alt={`${name} avatar`}
      style={{
        objectFit: "cover",
        width: imageSize,
        height: imageSize,
      }}
    />
  ) : (
    <div
      style={{
        verticalAlign: "middle",
        display: "inline-block",
        backgroundColor: "var(--bs-body-color)",
        objectFit: "cover",
        width: imageSize,
        height: imageSize,
      }}
    ></div>
  );
};

const ObserverItem = ({
  observer,
  date,
  placeId,
  orderBy,
}: {
  observer: Observer;
  date: string;
  placeId: number;
  orderBy: "observation_count" | "species_count";
}) => {
  const profileUrl = `https://www.inaturalist.org/people/${observer.user.id}`;
  const observationsLink = buildObservationsLink(
    date,
    placeId,
    observer.user.login,
    orderBy
  );
  let plural: string;
  switch (orderBy) {
    case "species_count":
      plural = "species";
      break;
    case "observation_count":
      plural = "observations";
      break;
    default:
      assertUnreachable(orderBy);
  }

  return (
    <li>
      <div className="border">
        <a target="_blank" rel="noreferrer" href={profileUrl}>
          <ProfileImage
            iconUrl={observer.user.icon_url}
            name={observer.user.name}
          />
          <span className="ms-2">
            {observer.user.name || observer.user.login}
          </span>
        </a>
        &nbsp;(
        <a target="_blank" rel="noreferrer" href={observationsLink}>
          {observer[orderBy]} {plural}
        </a>
        )
      </div>
    </li>
  );
};

function buildObservationsLink(
  date: string,
  nycPlaceId: number,
  userLogin: string,
  orderBy: "observation_count" | "species_count"
): string {
  switch (orderBy) {
    case "species_count":
      return `https://www.inaturalist.org/observations?d1=${date}&place_id=${nycPlaceId}&user_id=${userLogin}&hrank=species&view=species`;
    case "observation_count":
      return `https://www.inaturalist.org/observations?d1=${date}&place_id=${nycPlaceId}&user_id=${userLogin}`;
    default:
      assertUnreachable(orderBy);
  }
}

const fetchTopObservers = async (
  orderBy: "observation_count" | "species_count",
  date: string,
  placeId: number
) => {
  return await fetchINaturalistApi("/observations/observers", {
    placeId,
    date,
    orderBy,
    perPage: 10,
  });
};

const fetchUnexpectedObservations = async (placeId: number, page: number) => {
  return await fetchINaturalistApi("/observations", {
    placeId,
    expectedNearby: false,
    qualityGrade: "research",
    perPage: 5,
    orderBy: "observed_on",
    page,
  });
};

const TopObservers = ({
  orderBy,
  selectedPlace,
}: OrderByProp & { selectedPlace: SelectedPlace }) => {
  const [data, setData] = useState<INaturalistResponse<Observer> | null>(null);
  const date = getIsoDateOneMonthAgo();
  useEffect(() => {
    setData(null);
    fetchTopObservers(orderBy, date, selectedPlace.id).then((response) => {
      setData(response);
    });
  }, [orderBy, date, selectedPlace]);
  if (!data) {
    return <Spinner animation="border" />;
  }
  const topObservers = data.results.map((observer, i) => (
    <ObserverItem
      key={i}
      observer={observer}
      date={date}
      placeId={selectedPlace.id}
      orderBy={orderBy}
    />
  ));
  return <ol className="d-flex flex-column gap-1">{topObservers}</ol>;
};

const TopObserversCard = ({
  selectedPlace,
}: {
  selectedPlace: SelectedPlace;
}) => {
  return (
    <Card className="bg-body-secondary">
      <Card.Body>
        <CardTitle>
          <MdWorkspacePremium />
          &nbsp;Top iNaturalist Observers
        </CardTitle>

        <p>
          Top iNaturalist observers in {selectedPlace.name} over the last 30
          days, ranked by unique species:
        </p>
        <TopObservers orderBy="species_count" selectedPlace={selectedPlace} />

        <p>
          Top iNaturalist observers in {selectedPlace.name} over the last 30
          days, ranked by total observations:
        </p>
        <TopObservers
          orderBy="observation_count"
          selectedPlace={selectedPlace}
        />
      </Card.Body>
    </Card>
  );
};

const UnexpectedObservationsCard = ({
  selectedPlace,
}: {
  selectedPlace: SelectedPlace;
}) => {
  return (
    <Card className="bg-body-secondary">
      <Card.Body>
        <CardTitle>
          <MdStar />
          &nbsp;Unexpected observations
        </CardTitle>
        <UnexpectedObservations placeId={selectedPlace.id} />
      </Card.Body>
    </Card>
  );
};

const UnexpectedObservations = ({ placeId }: { placeId: number }) => {
  const [data, setData] = useState<INaturalistResponse<Observation> | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setData(null);
    fetchUnexpectedObservations(placeId, currentPage).then((response) => {
      setData(response);
    });
  }, [currentPage, placeId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="d-flex flex-column gap-2">
      {data?.results.map((observation, i) => (
        <ObservationItem key={i} observation={observation} />
      ))}
      <Pagination
        currentPage={currentPage}
        totalItems={data?.total_results || 0}
        itemsPerPage={5}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

const ObservationItem = ({ observation }: { observation: Observation }) => {
  const imageUrl = observation.photos?.[0]?.url;
  const placeId = observation.place_ids[observation.place_ids.length - 1];

  return (
    <GenericCardSection
      imageUrl={imageUrl ? convertPhotoUrlToOriginal(imageUrl) : undefined}
      title={
        <>
          {observation.taxon.preferred_common_name}
          &nbsp;
          <LinkIcon
            url={`https://www.inaturalist.org/observations/${observation.id}`}
          />
        </>
      }
      subtitle={<em>{observation.taxon?.name}</em>}
      body={
        <>
          <PlaceName placeId={placeId} />
          <br />
          <small>{observation.observed_on}</small>
        </>
      }
    ></GenericCardSection>
  );
};

// Convert https://inaturalist-open-data.s3.amazonaws.com/photos/443200086/square.jpg to https://inaturalist-open-data.s3.amazonaws.com/photos/443200086/original.jpg
const convertPhotoUrlToOriginal = (photoUrl: string) => {
  return photoUrl.replace(/\/square\.(\w+)$/, "/medium.$1");
};

function App() {
  const [selectedPlace, setSelectedPlace] =
    useState<SelectedPlace>(defaultPlace);
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Explore
              selectedPlace={selectedPlace}
              setSelectedPlace={setSelectedPlace}
            />
          }
        />
        <Route
          path="/learn"
          element={
            <Learn
              selectedPlace={selectedPlace}
              setSelectedPlace={setSelectedPlace}
            />
          }
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
