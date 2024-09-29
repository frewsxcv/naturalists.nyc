import { default as BootstrapNavbar } from "react-bootstrap/Navbar";
import { Nav, NavDropdown } from "react-bootstrap";
import { Container as BootstrapContainer } from "react-bootstrap";
import { MdEco } from "react-icons/md";

const Navbar = ({ selectedTab }: { selectedTab: "explore" | "learn" }) => {
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
            <Nav.Link href="/" active={selectedTab === "explore"}>
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
        </BootstrapNavbar.Collapse>
      </BootstrapContainer>
    </BootstrapNavbar>
  );
};

export default Navbar;
