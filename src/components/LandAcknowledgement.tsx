import { useState } from "react";
import { Alert } from "react-bootstrap";

const landAcknowlegementLocalStorageKey = "land-acknowledgement-dismissed";
const landAcknowlegementLocalStorageValue = "true";

const fetchLandAcknowledgementDismissed = (): boolean => {
  return (
    localStorage.getItem(landAcknowlegementLocalStorageKey) ===
    landAcknowlegementLocalStorageValue
  );
};

const storeLandAcknowledgementDismissed = (): void => {
  localStorage.setItem(
    landAcknowlegementLocalStorageKey,
    landAcknowlegementLocalStorageValue
  );
};

const LandAcknowlegement = () => {
  const [isDismissed, setIsDismissed] = useState(
    fetchLandAcknowledgementDismissed()
  );

  if (isDismissed) {
    return null;
  }

  const onClose = () => {
    setIsDismissed(true);
    storeLandAcknowledgementDismissed();
  };

  return (
    <Alert variant="primary" dismissible onClose={onClose}>
      It is essential to acknowledge the Lenape, who were the original
      inhabitants of New York City and the surrounding territory for thousands
      of years before the arrival of Europeans. As naturalists, we hope to
      contribute to a greater understanding and appreciation of the
      interconnectedness between humans and the natural world, as exemplified by
      the Lenape people's relationship with the land.
    </Alert>
  );
};

export default LandAcknowlegement;
