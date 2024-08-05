import { useRef, useState } from "react";

import Konva from "konva";
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
const SCALE_BY = 1.01;

export default function Viewer(): React.JSX.Element {
  const timerRef = useRef<number>();
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  /**
   * zoom: hide scrollbar.
   * none: show scrollbar and set scrollbar position.
   */
  const [phase, setPhase] = useState<"zoom" | "none">("none");
  const hideScrollbar = phase === "zoom" ? true : false;

  const [image] = useImage(imageUrl);

  const [scale, setScale] = useState(1);
  const [initialScale, setInitialScale] = useState<number | null>(null);
  const _scale =
    image &&
    fitImageToStage({ height: STAGE_HEIGHT, width: STAGE_WIDTH }, image);
  if (_scale != null && initialScale === null) {
    setInitialScale(_scale);
    setScale(_scale);
  }

  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [initialStagePos, setInitialStagePos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const _pos =
    image &&
    initialScale != null &&
    centerImage({
      stage: { width: STAGE_WIDTH, height: STAGE_HEIGHT },
      image,
      scale: initialScale,
    });
  if (_pos && initialStagePos === null) {
    setInitialStagePos(_pos);
    setStagePos(_pos);
  }

  if (!image) return <div>Loading...</div>;

  return (
    <div className={classes.root}>
      <button
        className={classes["reset-button"]}
        onClick={() => {
          setScale(initialScale ?? 1);
          setStagePos(initialStagePos ?? { x: 0, y: 0 });
        }}
      >
        Reset
      </button>
      <div
        ref={stageContainerRef}
        className={classes["stage-container"]}
        style={{
          width: STAGE_WIDTH,
          height: STAGE_HEIGHT,
          overflow: hideScrollbar ? "clip" : "auto",
        }}
        onScroll={(e) => {
          const dx = e.currentTarget.scrollLeft;
          const dy = e.currentTarget.scrollTop;
          const container = stageRef.current?.container();

          if (container) {
            container.style.transform = "translate(" + dx + "px, " + dy + "px)";
            stageRef.current?.offsetX(dx);
            stageRef.current?.offsetY(dy);
          }
        }}
      >
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

            setPhase("zoom");

            const pointer = stageRef.current.getPointerPosition();
            if (!pointer) return;

            const mousePointTo = {
              x: (pointer.x - stageRef.current.x()) / scale,
              y: (pointer.y - stageRef.current.y()) / scale,
            };
            const direction = e.evt.deltaY > 0 ? -1 : 1;
            const scaleFactor = direction > 0 ? SCALE_BY : 1 / SCALE_BY;
            const newScale = scale * scaleFactor;
            setScale(newScale);

            const newPos = {
              x: pointer.x - mousePointTo.x * newScale,
              y: pointer.y - mousePointTo.y * newScale,
            };
            setStagePos(newPos);

            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
              setPhase("none");
            }, 500);
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
