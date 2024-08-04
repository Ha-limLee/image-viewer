import { useRef, useState } from "react";

import Konva from "konva";
import { Image, Layer, Stage } from "react-konva";
import useImage from "use-image";
import { isDeepEqual } from "remeda";

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
const SCALE_BY = 1.01;

export default function Viewer(): React.JSX.Element {
  const stageRef = useRef<Konva.Stage>(null);

  const [image] = useImage(imageUrl);

  const [scale, setScale] = useState(1);
  const [initialScale, setInitialScale] = useState(1);
  const _scale =
    image &&
    fitImageToStage({ height: STAGE_HEIGHT, width: STAGE_WIDTH }, image);
  if (_scale != null && _scale !== initialScale) {
    setInitialScale(_scale);
    setScale(_scale);
  }

  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [initialStagePos, setInitialStagePos] = useState({ x: 0, y: 0 });
  const _pos =
    image &&
    centerImage({
      stage: { width: STAGE_WIDTH, height: STAGE_HEIGHT },
      image,
      scale: initialScale,
    });
  if (_pos && !isDeepEqual(_pos, initialStagePos)) {
    setInitialStagePos(_pos);
    setStagePos(_pos);
  }

  if (!image) return <div>Loading...</div>;

  return (
    <div className={classes.root}>
      <button
        className={classes["reset-button"]}
        onClick={() => {
          setScale(initialScale);
          setStagePos(initialStagePos);
        }}
      >
        Reset
      </button>
      <div className={classes["stage-container"]}>
        <Stage
          ref={stageRef}
          width={STAGE_WIDTH}
          height={STAGE_HEIGHT}
          scale={{ x: scale, y: scale }}
          x={stagePos.x}
          y={stagePos.y}
          onWheel={(e) => {
            e.evt.preventDefault();
            if (!e.evt.ctrlKey || !stageRef.current) return;

            const pointer = stageRef.current.getPointerPosition();
            if (!pointer) return;

            const mousePointTo = {
              x: (pointer.x - stageRef.current.x()) / scale,
              y: (pointer.y - stageRef.current.y()) / scale,
            };
            const direction = e.evt.deltaY > 0 ? -1 : 1;
            const newScale =
              direction > 0 ? scale * SCALE_BY : scale / SCALE_BY;
            setScale(newScale);

            const newPos = {
              x: pointer.x - mousePointTo.x * newScale,
              y: pointer.y - mousePointTo.y * newScale,
            };
            setStagePos(newPos);
          }}
        >
          <Layer>
            <Image image={image} />
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
