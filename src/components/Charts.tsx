import Row from "react-bootstrap/Row";
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
import { GenericCardSection } from "./GenericCardSection";
import { LinkIcon } from "./LinkIcon";
import Pagination from "./Pagination";

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
    setData(null);
    setIsFetching(true);
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

export const ChartTaxaSection = ({
  taxon,
  placeId,
}: TaxonProp & { placeId: number }) => {
  return (
    <GenericCardSection
      imageUrl={taxon.taxon.default_photo.medium_url}
      bodyHeight={histogramHeight}
      title={
        <>
          <span style={{ flexGrow: 1 }}>
            {taxon.taxon.preferred_common_name}
          </span>
          &nbsp;
          <LinkIcon
            url={`https://www.inaturalist.org/taxa/${taxon.taxon.id}`}
          />
        </>
      }
      subtitle={<em>{taxon.taxon.name}</em>}
      body={
        <div className="mt-2" style={{ height: histogramHeight + "px" }}>
          <BarChart taxonId={taxon.taxon.id} placeId={placeId} />
        </div>
      }
    />
  );
};

const Charts = ({ filter, placeId }: ChartFilterProp & { placeId: number }) => {
  const [taxa, setTaxa] = useState<TaxonCount[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const taxaPerPage = 5;

  useEffect(() => {
    setTaxa([]);
    setIsLoading(true);
    fetchINaturalistApi("/observations/species_counts", {
      month: getCurrentMonthOfYear(),
      placeId,
      perPage: 30,
      iconic_taxa: filter,
    }).then((response) => {
      setTaxa(response.results);
      setIsLoading(false);
    });
  }, [placeId, filter]);

  const indexOfLastTaxon = currentPage * taxaPerPage;
  const indexOfFirstTaxon = indexOfLastTaxon - taxaPerPage;
  const currentTaxa = taxa.slice(indexOfFirstTaxon, indexOfLastTaxon);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const taxaSections = currentTaxa.map((taxon, i) => {
    return (
      <ChartTaxaSection taxon={taxon} key={taxon.taxon.id} placeId={placeId} />
    );
  });

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <>
      <Row className="row-gap-3">{taxaSections}</Row>
      <Pagination
        currentPage={currentPage}
        totalItems={taxa.length}
        itemsPerPage={taxaPerPage}
        onPageChange={paginate}
      />
    </>
  );
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
