import { useState } from "react";
import YouTube from "react-youtube";
import { Card, Button } from "react-bootstrap";
import { MdTv } from "react-icons/md";
import { chooseRandom } from "../utils";
import { youTubeVideoUrls } from "../urls";
import CardTitle from "./CardTitle";

const youTubeVideoUrlPrefix = "https://www.youtube.com/watch?v=";

const randomYouTubeVideoUrl = () => chooseRandom(youTubeVideoUrls);

const randomYouTubeVideoId = () =>
  randomYouTubeVideoUrl().replace(youTubeVideoUrlPrefix, "");

const Watch = () => {
  const [videoId, setVideoId] = useState(randomYouTubeVideoId());
  return (
    <Card className="bg-body-secondary">
      <Card.Body>
        <CardTitle>
          <MdTv />
          &nbsp;Watch
        </CardTitle>
        <YouTube videoId={videoId} iframeClassName="w-100"></YouTube>
        <Button onClick={() => setVideoId(randomYouTubeVideoId())}>
          Next video
        </Button>
      </Card.Body>
    </Card>
  );
};

export default Watch;
