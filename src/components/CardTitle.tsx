import React from 'react';
import { Card } from 'react-bootstrap';

type ChildrenProp = {
  children: React.ReactNode;
};

const CardTitle = ({ children }: ChildrenProp) => {
  return (
    <Card.Title className="d-flex flex-row align-items-center">
      {children}
    </Card.Title>
  );
};

export default CardTitle;
