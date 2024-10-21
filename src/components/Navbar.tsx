import { useState, useEffect, useCallback } from "react";
import { default as BootstrapNavbar } from "react-bootstrap/Navbar";
import { Nav, NavDropdown } from "react-bootstrap";
import { Container as BootstrapContainer } from "react-bootstrap";
import { MdEco, MdLocationOn } from "react-icons/md";
import { fetchINaturalistApi } from "../inaturalist"; // Ensure this import is correct
import { ListGroup } from "react-bootstrap";
import { InputGroup, Form } from "react-bootstrap";
import { BsSearch } from "react-icons/bs";
import { Spinner } from "react-bootstrap"; // Add this import
import { Modal } from "react-bootstrap"; // Add this import
import { Link, useLocation } from "react-router-dom";

export type SelectedPlace = {
  id: number;
  name: string;
  display_name: string;
};

export const defaultPlace: SelectedPlace = {
  id: 674,
  name: "New York City",
  display_name: "New York City",
};

const places: SelectedPlace[] = [
  defaultPlace,
  { id: 1189, name: "Bronx County", display_name: "Bronx County" },
  { id: 2275, name: "Kings County", display_name: "Kings County" },
  { id: 1264, name: "New York County", display_name: "New York County" },
  { id: 675, name: "Queens County", display_name: "Queens County" },
  { id: 1190, name: "Richmond County", display_name: "Richmond County" },
];

const PlaceSearchInput = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) => (
  <InputGroup className="mb-3">
    <InputGroup.Text>
      <BsSearch />
    </InputGroup.Text>
    <Form.Control
      type="text"
      placeholder="Search places..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="form-control"
    />
  </InputGroup>
);

const PlaceSearch = ({
  setSelectedPlace,
  closeDropdown,
}: {
  setSelectedPlace: (place: SelectedPlace) => void;
  closeDropdown: () => void;
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Map<string, SelectedPlace[]>>(
    new Map()
  );
  const [isFetching, setIsFetching] = useState(false);

  // Debounce function
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const fetchSuggestions = useCallback(
    debounce((query: string) => {
      if (suggestions.has(query)) {
        return;
      }
      setIsFetching(true);
      fetchINaturalistApi("/places/autocomplete", { q: query })
        .then((response) => {
          setSuggestions((prev) => new Map(prev.set(query, response.results)));
        })
        .finally(() => {
          setIsFetching(false);
        })
        .catch((error) => {
          console.error("Error fetching autocomplete suggestions:", error);
        });
    }, 1000), // 1000ms debounce delay
    [suggestions]
  );

  useEffect(() => {
    if (searchQuery.length > 0) {
      fetchSuggestions(searchQuery);
    } else {
      setIsFetching(suggestions.has(searchQuery));
    }
  }, [searchQuery, fetchSuggestions, suggestions]);

  const handleSelectSuggestion = (place: SelectedPlace) => {
    setSelectedPlace(place);
    setSearchQuery(place.name);
    closeDropdown();
  };

  return (
    <>
      <PlaceSearchInput
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      {isFetching && (
        <div className="d-flex justify-content-center my-2">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
      <ListGroup>
        {(searchQuery.length === 0
          ? places
          : suggestions.get(searchQuery) || []
        ).map((place) => (
          <ListGroup.Item
            key={place.id}
            onClick={() => handleSelectSuggestion(place)}
            action
          >
            {place.display_name}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </>
  );
};

type NavbarProps = {
  selectedTab: "explore" | "learn";
  selectedPlace: SelectedPlace | null;
  setSelectedPlace: (place: SelectedPlace) => void;
};

const Navbar = ({
  selectedTab,
  selectedPlace,
  setSelectedPlace,
}: NavbarProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false); // Change state name
  const location = useLocation();

  if (!selectedPlace) {
    return null;
  }

  return (
    <BootstrapNavbar expand="lg" className="bg-body-secondary">
      <BootstrapContainer>
        <BootstrapNavbar.Brand href=".">
          <MdEco />
          &nbsp;naturalists.nyc
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to={{ pathname: "/", search: location.search }}
              active={selectedTab === "explore"}
            >
              Explore
            </Nav.Link>
            <Nav.Link
              as={Link}
              to={{ pathname: "/learn", search: location.search }}
              active={selectedTab === "learn"}
            >
              Learn
            </Nav.Link>
            <NavDropdown title="About" id="basic-nav-dropdown">
              <NavDropdown.Item href="https://github.com/frewsxcv/naturalists.nyc">
                Source
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Nav>
            <Nav.Link onClick={() => setIsModalOpen(true)}>
              <MdLocationOn /> {selectedPlace.name}
            </Nav.Link>
          </Nav>
        </BootstrapNavbar.Collapse>

        <Modal
          show={isModalOpen}
          onHide={() => setIsModalOpen(false)}
          fullscreen
        >
          <Modal.Header closeButton>
            <Modal.Title>Select a Place</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <PlaceSearch
              setSelectedPlace={setSelectedPlace}
              closeDropdown={() => setIsModalOpen(false)}
            />
          </Modal.Body>
        </Modal>
      </BootstrapContainer>
    </BootstrapNavbar>
  );
};

export default Navbar;
