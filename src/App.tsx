// import logo from './logo.svg';
import "./App.css";
import React from "react";
import YouTube from "react-youtube";

const youTubeVideoUrls = [
  "https://www.youtube.com/watch?v=1KY6TleGIdk",
  "https://www.youtube.com/watch?v=340DGp4M03U",
  "https://www.youtube.com/watch?v=5FO-Er9fOEQ",
  "https://www.youtube.com/watch?v=8fMvaoiiGGU",
  "https://www.youtube.com/watch?v=95DEoEynYmk",
  "https://www.youtube.com/watch?v=AsBhkN94OQ0",
  "https://www.youtube.com/watch?v=BpLIIqCPPUo",
  "https://www.youtube.com/watch?v=ED3vjYsNZzM",
  "https://www.youtube.com/watch?v=NtcR3gPWb4I",
  "https://www.youtube.com/watch?v=OSjBCNDGqeY",
  "https://www.youtube.com/watch?v=OVkZ1Mx5n9Q",
  "https://www.youtube.com/watch?v=P0k2SEygCCM",
  "https://www.youtube.com/watch?v=PFL2WAtu5Wk",
  "https://www.youtube.com/watch?v=QwmDZrACyv8",
  "https://www.youtube.com/watch?v=SZW60p4oRoQ",
  "https://www.youtube.com/watch?v=UVvDByTRurA",
  "https://www.youtube.com/watch?v=WrR9dhQhoqU",
  "https://www.youtube.com/watch?v=ZFHSVJxKwzU",
  "https://www.youtube.com/watch?v=a4k9ho-keac",
  "https://www.youtube.com/watch?v=a5vbc6eMOQs",
  "https://www.youtube.com/watch?v=a9oHHFMDceE",
  "https://www.youtube.com/watch?v=aSjNEkcAaMo",
  "https://www.youtube.com/watch?v=bjgUX0dx8ok",
  "https://www.youtube.com/watch?v=ch-7Nz6-lCw",
  "https://www.youtube.com/watch?v=ciLi7oXuH3U",
  "https://www.youtube.com/watch?v=hCE8IWjVoKE",
  "https://www.youtube.com/watch?v=kZ_OKTYK-AY",
  "https://www.youtube.com/watch?v=mjgPMBk3Z8Q",
  "https://www.youtube.com/watch?v=omunvp1W0Ro",
  "https://www.youtube.com/watch?v=rd77pXGJE3s",
  "https://www.youtube.com/watch?v=wZg3rTNpHPw",
];

const youTubeVideoUrlPrefix = "https://www.youtube.com/watch?v=";

function App() {
  return (
    <div className="App">
      <LandAcknowlegement />

      <h1>Connect</h1>
      <a href="https://discord.gg/FEwKgrDV92">Join the Discord</a>

      <h1>Papers</h1>
      <ul>
        <li>
          <a href="https://www.ser.org/news/305433/Seeing-the-Forest-and-the-Trees-Outcomes-of-Forest-Restoration-in-The-Bronx-.htm">
            Seeing the Forest and the Trees: Outcomes of Forest Restoration in
            The Bronx
          </a>
        </li>
      </ul>

      <h1>Guides</h1>
      <ul>
        <li>
          <a href="https://www.amnh.org/content/download/35179/518842/file/ASeasonalGuidetoNewYorkCitysInvertebrates.pdf">
            A Seasonal Guide to New York City's Invertebrates
          </a>
        </li>
      </ul>

      <h1>TV</h1>
      <YouTube videoId={randomYouTubeVideoId()}></YouTube>
    </div>
  );
}

const LandAcknowlegement = () => (
  <section>
    {/* Land acknoledgement */}
    <h1>Land Acknowledgement</h1>
    <p>
      {/* Before exploring my study findings of this New York City park, it is essential to acknowledge the ancestral and traditional lands of the Lenape people, upon which the city and its parks now reside. We must all recognize the Lenape as the original stewards of these lands and waters, and honor their enduring connection to this place, dating back thousands of years. */}
      {/* As I detail the park’s ecology, history, and development in this study, it’s crucial to remember and pay respect to the Lenape community, both their past and present elders, as well as future generations. Additionally, we need to acknowledge the ongoing struggles of Indigenous peoples in the face of colonization, endeavor to learn from their wisdom and cultural practices, as well as supporting their rights and sovereignty. */}
      {/* I hope to contribute to a greater understanding and appreciation of the interconnectedness between humans and the natural world, as exemplified by the Lenape people’s relationship with the land. */}
    </p>
  </section>
);

const randomYouTubeVideoUrl = () => chooseRandom(youTubeVideoUrls);

const randomYouTubeVideoId = () =>
  randomYouTubeVideoUrl()?.replace(youTubeVideoUrlPrefix, "");

const chooseRandom = <T extends unknown>(arr: T[]) =>
  arr[chooseRandomIndex(arr)];

const chooseRandomIndex = <T extends unknown>(arr: T[]): number =>
  Math.floor(Math.random() * arr.length);

export default App;
