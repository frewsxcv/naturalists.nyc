import Row from "react-bootstrap/Row";
import Container from "./components/Container";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Navbar from "./components/Navbar";
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
const nycPlaceId = 674;

type ChartSetFilterProp = {
  setFilter: (filter: IconicTaxon) => void;
};

type OrderByProp = {
  orderBy: "observation_count" | "species_count";
};

const Explore = () => {
  return (
    <>
      <Navbar selectedTab="explore" />
      <Container>
        <Row>
          <Col>
            <LandAcknowlegement />
          </Col>
        </Row>
        <Row className="gx-3 row-gap-3">
          <Col xs={12} md={6}>
            <TopObserversCard />
          </Col>
          <Col xs={12} md={6}>
            <div className="d-flex flex-column gap-3">
              <ActiveSpeciesCard />
              <UnexpectedObservationsCard />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

const ActiveSpeciesCard = () => {
  const [filter, setFilter] = useState<IconicTaxon | undefined>(undefined);
  const clearFilterButton = filter ? (
    <Button onClick={() => setFilter(undefined)} size="sm">Clear filter</Button>
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
          <Charts filter={filter} placeId={nycPlaceId} />
        </div>
      </Card.Body>
    </Card>
  );
};

const Learn = () => {
  return (
    <>
      <Navbar selectedTab="explore" />
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
        <MdFilterList />&nbsp;
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
  nycPlaceId,
  orderBy,
}: {
  observer: Observer;
  date: string;
  nycPlaceId: number;
  orderBy: "observation_count" | "species_count";
}) => {
  const profileUrl = `https://www.inaturalist.org/people/${observer.user.id}`;
  const observationsLink = buildObservationsLink(
    date,
    nycPlaceId,
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
  date: string
) => {
  return await fetchINaturalistApi("/observations/observers", {
    placeId: nycPlaceId,
    date,
    orderBy,
    perPage: 10,
  });
};

const fetchUnexpectedObservations = async () => {
  return await fetchINaturalistApi("/observations", {
    placeId: nycPlaceId,
    expectedNearby: false,
    qualityGrade: "research",
    perPage: 5,
  });
};

const TopObservers = ({ orderBy }: OrderByProp) => {
  const [data, setData] = useState<INaturalistResponse<Observer> | null>(null);
  const date = getIsoDateOneMonthAgo();
  useEffect(() => {
    fetchTopObservers(orderBy, date).then((response) => {
      setData(response);
    });
  }, [orderBy, date]);
  if (!data) {
    return <Spinner animation="border" />;
  }
  const topObservers = data.results.map((observer, i) => (
    <ObserverItem
      key={i}
      observer={observer}
      date={date}
      nycPlaceId={nycPlaceId}
      orderBy={orderBy}
    />
  ));
  return <ol className="d-flex flex-column gap-1">{topObservers}</ol>;
};

const TopObserversCard = () => {
  return (
    <Card className="bg-body-secondary">
      <Card.Body>
        <CardTitle>
          <MdWorkspacePremium />
          &nbsp;Top iNaturalist Observers
        </CardTitle>

        <p>
          Top iNaturalist observers in NYC over the last 30 days, ranked by unique species:
        </p>
        <TopObservers orderBy="species_count" />

        <p>
          Top iNaturalist observers in NYC over the last 30 days, ranked by total observations:
        </p>
        <TopObservers orderBy="observation_count" />
      </Card.Body>
    </Card>
  );
};

const UnexpectedObservationsCard = () => {
  return <Card className="bg-body-secondary">
    <Card.Body>
      <CardTitle>
        <MdStar />
        &nbsp;Unexpected observations
      </CardTitle>
      <UnexpectedObservations />
    </Card.Body>
  </Card>;
};

const UnexpectedObservations = () => {
  const [data, setData] = useState<INaturalistResponse<Observation> | null>(null);
  useEffect(() => {
    fetchUnexpectedObservations().then((response) => {
      setData(response);
    });
  }, []);
  return (
    <div className="d-flex flex-column gap-2">
      {data?.results.map((observation, i) => (
        <ObservationItem key={i} observation={observation} />
      ))}
    </div>
  );
};

const ObservationItem = ({ observation }: { observation: Observation }) => {
  const imageUrl = observation.photos?.[0]?.url;
  const placeId = observation.place_ids[observation.place_ids.length - 1];

  return (
    <GenericCardSection
      imageUrl={imageUrl ? convertPhotoUrlToOriginal(imageUrl) : undefined}
      title={<>
        {observation.taxon.preferred_common_name}
        &nbsp;
        <LinkIcon url={`https://www.inaturalist.org/observations/${observation.id}`} />
      </>}
      subtitle={<em>{observation.taxon?.name}</em>}
      body={<>
        <PlaceName placeId={placeId} />
      </>}
    >
    </GenericCardSection>
  );
};

// Convert https://inaturalist-open-data.s3.amazonaws.com/photos/443200086/square.jpg to https://inaturalist-open-data.s3.amazonaws.com/photos/443200086/original.jpg
const convertPhotoUrlToOriginal = (photoUrl: string) => {
  return photoUrl.replace(/\/square\.(\w+)$/, "/medium.$1");
};

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Explore />} />
        <Route path="/learn" element={<Learn />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
