import YouTube from "react-youtube";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { default as BootstrapNavbar } from "react-bootstrap/Navbar";
import Card from "react-bootstrap/Card";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import {
  MdChat,
  MdNewspaper,
  MdManageSearch,
  MdTv,
  MdBolt,
  MdWorkspacePremium,
  MdEco,
} from "react-icons/md";
import {
  INaturalistResponse,
  Observer,
  fetchINaturalistApi,
  iconicTaxa,
  type IconicTaxon,
} from "./inaturalist";
import { Alert, Dropdown, Nav, NavDropdown, Spinner } from "react-bootstrap";
import { Charts, type ChartFilterProp } from "./components/charts";
import { unwrap } from "./utils";

const getDateOneMonthAgo = (): Date => {
  // Get a date object for the current time
  const date = new Date();

  // Set it to one month ago
  date.setMonth(date.getMonth() - 1);

  return date;
};

// Get date one month ago
const getIsoDateOneMonthAgo = (): string => {
  // Format the date as YYYY-MM-DD
  const dateString = getDateOneMonthAgo().toISOString().split("T");

  if (!dateString[0]) {
    throw new Error("Could not generate date string");
  }

  return dateString[0];
};

const nycPlaceId = 674;

const youTubeVideoUrls: [string, ...string[]] = [
  "https://www.youtube.com/watch?v=1KY6TleGIdk",
  "https://www.youtube.com/watch?v=340DGp4M03U",
  "https://www.youtube.com/watch?v=5FO-Er9fOEQ",
  "https://www.youtube.com/watch?v=8fMvaoiiGGU",
  "https://www.youtube.com/watch?v=95DEoEynYmk",
  "https://www.youtube.com/watch?v=AsBhkN94OQ0",
  "https://www.youtube.com/watch?v=BpLIIqCPPUo",
  "https://www.youtube.com/watch?v=ED3vjYsNZzM",
  "https://www.youtube.com/watch?v=NtcR3gPWb4I",
  "https://www.youtube.com/watch?v=OSjBCNDGqeY",
  "https://www.youtube.com/watch?v=OVkZ1Mx5n9Q",
  "https://www.youtube.com/watch?v=P0k2SEygCCM",
  "https://www.youtube.com/watch?v=PFL2WAtu5Wk",
  "https://www.youtube.com/watch?v=QwmDZrACyv8",
  "https://www.youtube.com/watch?v=SZW60p4oRoQ",
  "https://www.youtube.com/watch?v=UVvDByTRurA",
  "https://www.youtube.com/watch?v=WrR9dhQhoqU",
  "https://www.youtube.com/watch?v=ZFHSVJxKwzU",
  "https://www.youtube.com/watch?v=a4k9ho-keac",
  "https://www.youtube.com/watch?v=a5vbc6eMOQs",
  "https://www.youtube.com/watch?v=a9oHHFMDceE",
  "https://www.youtube.com/watch?v=aSjNEkcAaMo",
  "https://www.youtube.com/watch?v=bjgUX0dx8ok",
  "https://www.youtube.com/watch?v=ch-7Nz6-lCw",
  "https://www.youtube.com/watch?v=ciLi7oXuH3U",
  "https://www.youtube.com/watch?v=hCE8IWjVoKE",
  "https://www.youtube.com/watch?v=kZ_OKTYK-AY",
  "https://www.youtube.com/watch?v=mjgPMBk3Z8Q",
  "https://www.youtube.com/watch?v=omunvp1W0Ro",
  "https://www.youtube.com/watch?v=rd77pXGJE3s",
  "https://www.youtube.com/watch?v=wZg3rTNpHPw",
  "https://www.youtube.com/watch?v=Kb7OVCBXVBo", // NYBG: Urban Effects on Tree Growth in the Vicinity of New York City - Dr. Jillian Gregg - NYC EcoFlora
  "https://www.youtube.com/watch?v=AVPkBv-QQ6U", // Crime Pays But Botany Doesn't: A Cactus Grows in Brooklyn
  "https://www.youtube.com/watch?v=6wIdCTn2lZY", // Crime Pays But Botany Doesn't: Botany by Boat in New York City
  "https://www.youtube.com/watch?v=GszzRHZck3o", // NYC H2O: Urban Lichens a talk by James Lendemer Ph.D.
];

const youTubeVideoUrlPrefix = "https://www.youtube.com/watch?v=";

const Navbar = () => {
  return (
    <BootstrapNavbar expand="lg" className="bg-body-secondary">
      <Container>
        <BootstrapNavbar.Brand href=".">
          <MdEco />
          &nbsp;naturalists.nyc
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <NavDropdown title="About" id="basic-nav-dropdown">
              <NavDropdown.Item href="https://github.com/frewsxcv/naturalists.nyc">
                Source
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

type ChartSetFilterProp = {
  setFilter: (filter: IconicTaxon) => void;
};

type ChildrenProp = {
  children: React.ReactNode;
};

type OrderByProp = {
  orderBy: "observation_count" | "species_count";
};

function App() {
  const [filter, setFilter] = useState<IconicTaxon | undefined>(undefined);
  const clearFilterButton = filter ? (
    <Button onClick={() => setFilter(undefined)}>Clear filter</Button>
  ) : null;
  return (
    <>
      <Navbar />
      <Container>
        <Row className="mb-3">
          <Col></Col>
        </Row>
        <Row>
          <Col>
            <LandAcknowlegement />
          </Col>
        </Row>
        <Row className="gx-3 row-gap-3">
          <Col xs={12} md={6} xl={4}>
            <div className="d-flex flex-column gap-3">
              <ConnectCard />
              <PapersCard />
              <GuidesCard />
              <Watch />
            </div>
          </Col>
          <Col xs={12} md={6} xl={4}>
            <div className="d-flex flex-column gap-3">
              <Card className="bg-body-secondary">
                <Card.Body>
                  <CardTitle>
                    <MdWorkspacePremium />
                    &nbsp;Top Observers
                  </CardTitle>

                  <p>
                    Observers with most unique species observed in NYC in the
                    past month:
                  </p>
                  <TopObservers orderBy="species_count" />

                  <p>
                    Observers with most observations in NYC in the past month:
                  </p>
                  <TopObservers orderBy="observation_count" />
                </Card.Body>
              </Card>
            </div>
          </Col>
          <Col xs={12} xl={4}>
            <Card className="bg-body-secondary">
              <Card.Body>
                <CardTitle>
                  <MdBolt />
                  &nbsp;Active species
                </CardTitle>
                <p>Filter species to category</p>
                <div className="d-flex flex-column gap-1">
                  <div className="d-flex flex-row gap-1">
                    <FilterDropdown filter={filter} setFilter={setFilter} />
                    {clearFilterButton}
                  </div>
                  <Charts filter={filter} placeId={nycPlaceId} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

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
    <Dropdown onSelect={(value) => setFilter(value as IconicTaxon)}>
      {/* TODO: Remove the `as` above */}
      <Dropdown.Toggle>{toggleText}</Dropdown.Toggle>
      <Dropdown.Menu>{iconicTaxaOptions}</Dropdown.Menu>
    </Dropdown>
  );
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

const CardTitle = ({ children }: ChildrenProp) => {
  return (
    <Card.Title className="d-flex flex-row align-items-center">
      {children}
    </Card.Title>
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

const TopObservers = ({ orderBy }: OrderByProp) => {
  const [data, setData] = useState<INaturalistResponse<Observer> | null>(null);
  const date = getIsoDateOneMonthAgo();
  useEffect(() => {
    fetchINaturalistApi("/observations/observers", {
      placeId: nycPlaceId,
      date,
      orderBy,
      perPage: 10,
    }).then((response) => {
      setData(response);
    });
  }, [orderBy, date]);
  if (!data) {
    return <Spinner animation="border" />;
  }
  const topObservers = data.results.map((observer, i) => {
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
    const imageSize = "30px";
    const profileImage = observer.user.icon_url ? (
      <img
        src={observer.user.icon_url}
        alt={`${observer.user.name} avatar`}
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
    return (
      <li key={i}>
        <div className="border">
          <a target="_blank" rel="noreferrer" href={profileUrl}>
            {profileImage}
            <span className="ms-2">
              {observer.user.name || observer.user.login}
            </span>
          </a>
          &nbsp;(
          <a href={observationsLink}>
            {observer[orderBy]} {plural}
          </a>
          )
        </div>
      </li>
    );
  });
  return <ol className="d-flex flex-column gap-1">{topObservers}</ol>;
};

function assertUnreachable(_: never): never {
  throw new Error("Encountered unreachable code");
}

const landAcknowlegementLocalStorageKey = "land-acknowledgement-dismissed";
const landAcknowlegementLocalStorageValue = "true";

const fetchLandAcknowledgementDismissed = (): boolean => {
  return (
    localStorage.getItem(landAcknowlegementLocalStorageKey) ===
    landAcknowlegementLocalStorageValue
  );
};

const storeLandAcknowledgementDismissed = (): void => {
  localStorage.setItem(
    landAcknowlegementLocalStorageKey,
    landAcknowlegementLocalStorageValue
  );
};

const LandAcknowlegement = () => {
  const [isDismissed, setIsDismissed] = useState(
    fetchLandAcknowledgementDismissed()
  );

  if (isDismissed) {
    return null;
  }

  const onClose = () => {
    setIsDismissed(true);
    storeLandAcknowledgementDismissed();
  };

  return (
    <Alert variant="primary" dismissible onClose={onClose}>
      It is essential to acknowledge the Lenape, who were the original
      inhabitants of New York City and the surrounding territory for thousands
      of years before the arrival of Europeans. As naturalists, we hope to
      contribute to a greater understanding and appreciation of the
      interconnectedness between humans and the natural world, as exemplified by
      the Lenape people’s relationship with the land.
    </Alert>
  );
};

const randomYouTubeVideoUrl = () => chooseRandom(youTubeVideoUrls);

const randomYouTubeVideoId = () =>
  randomYouTubeVideoUrl().replace(youTubeVideoUrlPrefix, "");

const chooseRandom = <T extends unknown>(arr: [T, ...T[]]) =>
  unwrap(arr[chooseRandomIndex(arr)]);

const chooseRandomIndex = <T extends unknown>(arr: [T, ...T[]]): number =>
  Math.floor(Math.random() * arr.length);

const Watch = () => {
  const [videoId, setVideoId] = useState(randomYouTubeVideoId());
  return (
    <Card className="bg-body-secondary">
      <Card.Body>
        <CardTitle>
          <MdTv />
          &nbsp;Watch
        </CardTitle>
        <YouTube videoId={videoId} iframeClassName="w-100"></YouTube>
        <Button onClick={() => setVideoId(randomYouTubeVideoId())}>
          Next video
        </Button>
      </Card.Body>
    </Card>
  );
};

export default App;
