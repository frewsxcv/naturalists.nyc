// import logo from './logo.svg';
import YouTube from "react-youtube";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import * as d3 from "d3";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useRef, useState } from "react";
import {
  HistogramResponse,
  Taxon,
  fetchINaturalistHistogram,
  fetchINaturalistSpeciesCounts,
} from "./inaturalist";
import { Spinner } from "react-bootstrap";

const nycPlaceId = 674;

const youTubeVideoUrls = [
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
];

const histogramResponseToHistogramData = (
  histogramResponse: HistogramResponse
) => {
  return Object.entries(histogramResponse.results.week_of_year).map(
    ([month, count]) => {
      return { month, count };
    }
  );
};

type HistogramData = { month: string; count: number }[];

// Uses d3.js to render a histogram of the number of observations of a taxon
// over the course of a year.
const BarChart = ({ taxonId }: { taxonId: number }) => {
  const svgRef = useRef(null);
  const [isFetching, setIsFetching] = useState(true);
  const [data, setData] = useState<HistogramData | null>(null);

  useEffect(() => {
    fetchINaturalistHistogram(taxonId, nycPlaceId)
      .then((response) => {
        const data = histogramResponseToHistogramData(response);
        setData(data);
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [taxonId]);

  useEffect(() => {
    if (!data) {
      return;
    }
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    // const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 500 - margin.left - margin.right;
    const height = 50 - margin.top - margin.bottom;
    const maxCount = Math.max(...data.map((d) => d.count));

    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(data.map((d) => d.month))
      .padding(0.1);
    const y = d3
      .scalePow()
      // Exponent < 1 reduces the high counts and increases the low counts slightly
      .exponent(0.4)
      .range([height, 0])
      .domain([0, maxCount]);

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => unwrap(x(d.month)))
      .attr("width", x.bandwidth())
      .attr("y", (d) => y(d.count) / 2)
      .attr("height", (d) => height - y(d.count));

    // Add red line for current week
    svg
      .append("line")
      .attr("x1", unwrap(x(getCurrentWeekOfYear().toString())))
      .attr("y1", 0)
      .attr("x2", unwrap(x(getCurrentWeekOfYear().toString())))
      .attr("y2", height)
      .attr("stroke-width", 2)
      .attr("stroke", "red");
  }, [data]);

  if (isFetching) {
    return <Spinner animation="border" />;
  }

  if (!data) {
    return <div>Error: Could not fetch data</div>;
  }

  return <svg style={{ border: "1px solid black" }} ref={svgRef}></svg>;
};

/** Is 1-indexed */
const getCurrentWeekOfYear = (): number => {
  return d3.timeWeek.count(d3.timeYear(new Date()), new Date()) + 1;
};

/** Is 1-indexed */
const getCurrentMonthOfYear = (): number => {
  return d3.timeMonth.count(d3.timeYear(new Date()), new Date()) + 1;
};

const youTubeVideoUrlPrefix = "https://www.youtube.com/watch?v=";

const unwrap = <T extends unknown>(t: T | null | undefined): T => {
  if (t === undefined) {
    throw new Error("Encountered unexpected undefined value");
  }
  if (t === null) {
    throw new Error("Encountered unexpected null value");
  }
  return t;
};

const Charts = () => {
  const [taxa, setTaxa] = useState<Taxon[]>([]);

  useEffect(() => {
    fetchINaturalistSpeciesCounts(nycPlaceId, getCurrentMonthOfYear()).then(
      (response) => {
        setTaxa(response.results);
      }
    );
  }, []);

  if (!taxa.length) {
    return <Spinner animation="border" />;
  }

  const taxaSections = taxa.map((taxon) => {
    return (
      <Card className="bg-body-tertiary">
        <Card.Header>
          {taxon.taxon.preferred_common_name} (<em>{taxon.taxon.name}</em>)
        </Card.Header>
        <Card.Body>
          <img
            src={taxon.taxon.default_photo.square_url}
            alt={taxon.taxon.name}
          />
          <BarChart taxonId={taxon.taxon.id} />
        </Card.Body>
      </Card>
    );
  });

  return <div className="d-flex flex-column row-gap-2">{taxaSections}</div>;
};

function App() {
  return (
    <Container>
      <Row>
        <Col xs={12} md={{ span: 8, offset: 2 }} className="bg-body-secondary">
          <LandAcknowlegement />

          <h1>Naturalists.NYC</h1>

          <h2>Connect</h2>
          <a href="https://discord.gg/FEwKgrDV92">Join the Discord</a>

          <h2>Papers</h2>
          <ul>
            <li>
              <a href="https://www.ser.org/news/305433/Seeing-the-Forest-and-the-Trees-Outcomes-of-Forest-Restoration-in-The-Bronx-.htm">
                Seeing the Forest and the Trees: Outcomes of Forest Restoration
                in The Bronx
              </a>
            </li>
          </ul>

          <h2>Guides</h2>
          <ul>
            <li>
              <a href="https://www.amnh.org/content/download/35179/518842/file/ASeasonalGuidetoNewYorkCitysInvertebrates.pdf">
                A Seasonal Guide to New York City's Invertebrates
              </a>
            </li>
          </ul>

          <h2>Charts</h2>
          <Charts />

          <h2>TV</h2>
          <YouTube videoId={randomYouTubeVideoId()}></YouTube>
        </Col>
      </Row>
    </Container>
  );
}

const LandAcknowlegement = () => (
  <Card>
    <Card.Body>
      It is essential to acknowledge the ancestral and traditional lands of the
      Lenape people, upon which New York City now resides. We must all recognize
      the Lenape as the original stewards of these lands and waters, and honor
      their enduring connection to this place, dating back thousands of years.
      It’s crucial to remember and pay respect to the Lenape community, both
      their past and present elders, as well as future generations.
      Additionally, we need to acknowledge the ongoing struggles of Indigenous
      peoples in the face of colonization, endeavor to learn from their wisdom
      and cultural practices, as well as supporting their rights and
      sovereignty. As naturalists, we hope to contribute to a greater
      understanding and appreciation of the interconnectedness between humans
      and the natural world, as exemplified by the Lenape people’s relationship
      with the land.
    </Card.Body>
  </Card>
);

const randomYouTubeVideoUrl = () => chooseRandom(youTubeVideoUrls);

const randomYouTubeVideoId = () =>
  randomYouTubeVideoUrl()?.replace(youTubeVideoUrlPrefix, "");

const chooseRandom = <T extends unknown>(arr: T[]) =>
  arr[chooseRandomIndex(arr)];

const chooseRandomIndex = <T extends unknown>(arr: T[]): number =>
  Math.floor(Math.random() * arr.length);

export default App;
