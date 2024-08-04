import { Image, Layer, Stage } from "react-konva";
import useImage from "use-image";

import classes from "./viewer.module.css";

import imageUrl from "../assets/data/1.png";

function fitImageToStage(
  stage: { width: number; height: number },
  image: { width: number; height: number }
): number {
  const scaleX = stage.width / image.width;
  const scaleY = stage.height / image.height;
  return Math.min(scaleX, scaleY);
}

function centerImage({
  stage,
  image,
  scale,
}: {
  stage: { width: number; height: number };
  image: { width: number; height: number };
  scale: number;
}): { x: number; y: number } {
  const x = Math.max((stage.width - image.width * scale) / 2, 0);
  const y = Math.max((stage.height - image.height * scale) / 2, 0);
  return { x, y };
}

const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 600;

export default function Viewer() {
  const [image] = useImage(imageUrl);
  if (!image) return <div>Loading...</div>;

  const scale = fitImageToStage(
    { height: STAGE_HEIGHT, width: STAGE_WIDTH },
    image
  );

  const { x: stageMarginX, y: stageMarginY } = centerImage({
    stage: { width: STAGE_WIDTH, height: STAGE_HEIGHT },
    image,
    scale,
  });

  return (
    <div className={classes.root}>
      <Stage
        width={STAGE_WIDTH}
        height={STAGE_HEIGHT}
        scale={{ x: scale, y: scale }}
        x={stageMarginX}
        y={stageMarginY}
      >
        <Layer>
          <Image image={image} />
        </Layer>
      </Stage>
    </div>
  );
}
