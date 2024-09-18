import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import {
  HistogramResponse,
  TaxonCount,
  fetchINaturalistApi,
  type IconicTaxon,
} from "../inaturalist";
import { Placeholder, Spinner } from "react-bootstrap";
import { unwrap } from "../utils";
import { getCurrentWeekOfYear, getCurrentMonthOfYear } from "../dates";
import { MdOpenInNew } from "react-icons/md";
import CardTitle from "./CardTitle";

export type ChartFilterProp = {
  filter: IconicTaxon | undefined;
};

type TaxonProp = {
  taxon: TaxonCount;
};

// Uses d3.js to render a histogram of the number of observations of a taxon
// over the course of a year.
const BarChart = ({
  taxonId,
  placeId,
}: {
  taxonId: number;
  placeId: number;
}) => {
  const svgRef = useRef(null);
  const [isFetching, setIsFetching] = useState(true);
  const [data, setData] = useState<HistogramData | null>(null);

  useEffect(() => {
    fetchINaturalistApi("/observations/histogram", {
      taxonId,
      placeId,
    })
      .then((response) => {
        const data = histogramResponseToHistogramData(response);
        setData(data);
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [placeId, taxonId]);

  useEffect(() => {
    if (!data) {
      return;
    }
    const width = 500;
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
      .range([histogramHeight, 0])
      .domain([0, maxCount]);

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${histogramHeight}`)
      .attr("class", "rounded");

    // Filled in bar
    svg
      .selectAll()
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => unwrap(x(d.month)))
      .attr("width", x.bandwidth())
      .attr("y", (d) => y(d.count) / 2)
      .attr("height", (d) => histogramHeight - y(d.count))
      .attr("fill-opacity", "1")
      .attr("fill", "var(--bs-body-color)");

    // Link hover
    svg
      .selectAll()
      .data(data)
      .enter()
      .append("a")
      // FIXME BELOW
      .attr(
        "href",
        (d) =>
          `https://www.inaturalist.org/observations?place_id=${placeId}&taxon_id=${taxonId}&week=${d.month}`
      )
      .attr("target", "_blank")
      .append("rect")
      .attr("class", "green-hover")
      .attr("height", histogramHeight)
      .attr("width", x.bandwidth())
      .attr("x", (d) => unwrap(x(d.month)))
      .attr("y", 0)
      .attr("fill-opacity", "0");

    // Add red line for current week
    svg
      .append("line")
      .attr("x1", unwrap(x(getCurrentWeekOfYear().toString())))
      .attr("y1", 0)
      .attr("x2", unwrap(x(getCurrentWeekOfYear().toString())))
      .attr("y2", histogramHeight)
      .attr("stroke-width", 2)
      .attr("stroke", "var(--bs-danger)");
  }, [placeId, data, taxonId]);

  if (isFetching) {
    return (
      <Placeholder as="div" animation="glow">
        <Placeholder xs={12} style={{ height: histogramHeight + "px" }} />
      </Placeholder>
    );
  }

  if (!data) {
    return <div>Error: Could not fetch data</div>;
  }

  return (
    <svg
      style={{ border: "1px solid var(--bs-border-color)" }}
      ref={svgRef}
    ></svg>
  );
};

type HistogramData = { month: string; count: number }[];

const histogramHeight = 40;

const TaxonImage = ({ taxon }: { taxon: TaxonCount }) => {
  return (
    <img
      style={{ objectFit: "cover", height: "100%", width: "100%" }}
      className="img-fluid rounded-start"
      src={taxon.taxon.default_photo.medium_url}
      alt={taxon.taxon.name}
    />
  );
};

export const ChartTaxaSection = ({
  taxon,
  placeId,
}: TaxonProp & { placeId: number }) => {
  return (
    <Col xs={12}>
      <Card className="bg-body-tertiary">
        <Row className="g-0">
          {/* TODO: Remove the 160px magic number below */}
          <Col sm={3} xs={4} style={{ height: "128px" }}>
            <TaxonImage taxon={taxon} />
          </Col>
          <Col sm={9} xs={8}>
            <Card.Body>
              <CardTitle>
                <span style={{ flexGrow: 1 }}>
                  {taxon.taxon.preferred_common_name}
                </span>
                &nbsp;
                <a
                  href={`https://www.inaturalist.org/taxa/${taxon.taxon.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MdOpenInNew />
                </a>
              </CardTitle>
              <Card.Subtitle>
                <em>{taxon.taxon.name}</em>
              </Card.Subtitle>
              <Card.Text
                className="mt-2"
                style={{ height: histogramHeight + "px" }}
              >
                <BarChart taxonId={taxon.taxon.id} placeId={placeId} />
              </Card.Text>
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </Col>
  );
};

const Charts = ({ filter, placeId }: ChartFilterProp & { placeId: number }) => {
  const [taxa, setTaxa] = useState<TaxonCount[]>([]);

  useEffect(() => {
    setTaxa([]);
    // TODO: Rather than doing this one month at a time, do a couple weeks before
    //       and after the current date, which might require two requests.
    fetchINaturalistApi("/observations/species_counts", {
      month: getCurrentMonthOfYear(),
      placeId,
      perPage: 30,
      iconic_taxa: filter,
    }).then((response) => {
      setTaxa(response.results);
    });
  }, [placeId, filter]);

  if (!taxa.length) {
    return <Spinner animation="border" />;
  }

  const taxaSections = taxa.map((taxon, i) => {
    return <ChartTaxaSection taxon={taxon} key={i} placeId={placeId} />;
  });

  return <Row className="row-gap-3">{taxaSections}</Row>;
};

const histogramResponseToHistogramData = (
  histogramResponse: HistogramResponse
) => {
  return Object.entries(histogramResponse.results.week_of_year).map(
    ([month, count]) => {
      return { month, count };
    }
  );
};

export default Charts;
