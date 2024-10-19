import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import CardTitle from "./CardTitle";

const ImageComponent = ({ imageUrl, altText }: { imageUrl: string; altText: string }) => {
    return (
        <img
            style={{ objectFit: "cover", height: "100%", width: "100%" }}
            className="img-fluid rounded-start"
            src={imageUrl}
            alt={altText}
        />
    );
};

export type GenericCardProps = {
    imageUrl?: string;
    title: JSX.Element;
    subtitle: JSX.Element;
    body: JSX.Element;
    bodyHeight?: number;
};

export const GenericCardSection = ({
    imageUrl,
    title,
    subtitle,
    body,
    bodyHeight,
}: GenericCardProps) => {
    return (
        <Col xs={12}>
            <Card className="bg-body-tertiary">
                <Row className="g-0">
                    {/* TODO: Remove the 128px magic number below */}
                    <Col sm={3} xs={4} style={{ height: "128px" }}>
                        {imageUrl && <ImageComponent imageUrl={imageUrl} altText="Taxon" />}
                    </Col>
                    <Col sm={9} xs={8}>
                        <Card.Body>
                            <CardTitle>
                                <span style={{ flexGrow: 1 }}>{title}</span>
                            </CardTitle>
                            <Card.Subtitle>
                                <em>{subtitle}</em>
                            </Card.Subtitle>
                            <div className="mt-2" style={{ height: bodyHeight ? bodyHeight + "px" : "auto" }}>
                                {body}
                            </div>
                        </Card.Body>
                    </Col>
                </Row>
            </Card>
        </Col>
    );
};