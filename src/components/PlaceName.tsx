import { INaturalistResponse } from "../inaturalist";
import { Place } from "../inaturalist";
import { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import { fetchINaturalistApi } from "../inaturalist";

const fetchPlaceName = async (placeId: number) => {
    return await fetchINaturalistApi("/places", {
        id: placeId,
    });
};

export const PlaceName = ({ placeId }: { placeId?: number }) => {
    const [data, setData] = useState<INaturalistResponse<Place> | null>(null);
    useEffect(() => {
        if (!placeId) {
            return;
        }
        fetchPlaceName(placeId).then((response) => {
            setData(response);
        });
    }, [placeId]);

    if (!placeId) {
        return <UnknownPlace />;
    }

    if (!data) {
        return <Spinner animation="border" />;
    }

    const place = data.results[0];

    if (!place) {
        return <UnknownPlace />;
    }
    return <>{place.display_name}</>;
}

const UnknownPlace = () => {
    return <>(Unknown location)</>;
};