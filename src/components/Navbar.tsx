import { useState } from "react";
import { default as BootstrapNavbar } from "react-bootstrap/Navbar";
import { Nav, NavDropdown } from "react-bootstrap";
import { Container as BootstrapContainer } from "react-bootstrap";
import { MdEco, MdLocationOn } from "react-icons/md";

export type SelectedPlace = {
  id: number;
  name: string;
};

export const defaultPlace: SelectedPlace = { id: 674, name: "New York City" };

const places: SelectedPlace[] = [
  defaultPlace,
  { id: 1189, name: "Bronx County" },
  { id: 2275, name: "Kings County" },
  { id: 1264, name: "New York County" },
  { id: 675, name: "Queens County" },
  { id: 1190, name: "Richmond County" },
];

type NavbarProps = {
  selectedTab: "explore" | "learn";
  selectedPlace: SelectedPlace;
  setSelectedPlace: (place: SelectedPlace) => void;
};

const Navbar = ({
  selectedTab,
  selectedPlace,
  setSelectedPlace,
}: NavbarProps) => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSelectPlace = (placeId: number) => {
    const place = places.find((p) => p.id === placeId);
    if (place) {
      setSelectedPlace(place);
    }
  };

  const filteredPlaces = places.filter((place) =>
    place.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Nav.Link href="/#/" active={selectedTab === "explore"}>
              Explore
            </Nav.Link>
            <Nav.Link href="/#/learn" active={selectedTab === "learn"}>
              Learn
            </Nav.Link>
            <NavDropdown title="About" id="basic-nav-dropdown">
              <NavDropdown.Item href="https://github.com/frewsxcv/naturalists.nyc">
                Source
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Nav>
            <NavDropdown
              title={
                <>
                  <MdLocationOn /> {selectedPlace.name}
                </>
              }
              id="place-dropdown"
              onSelect={(eventKey) => handleSelectPlace(Number(eventKey))}
            >
              {/* <div className="px-3 py-2">
                <input
                  type="text"
                  placeholder="Search places..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control"
                />
              </div> */}
              {filteredPlaces.map((place) => (
                <NavDropdown.Item key={place.id} eventKey={place.id}>
                  {place.name}
                </NavDropdown.Item>
              ))}
            </NavDropdown>
          </Nav>
        </BootstrapNavbar.Collapse>
      </BootstrapContainer>
    </BootstrapNavbar>
  );
};

export default Navbar;
