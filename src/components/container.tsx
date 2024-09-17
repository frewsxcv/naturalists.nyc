import React from "react";
import { Container as BootstrapContainer } from "react-bootstrap";

type ContainerProps = {
  children: React.ReactNode;
};

const Container = ({ children }: ContainerProps) => {
  return <BootstrapContainer className="pt-3">{children}</BootstrapContainer>;
};

export default Container;
