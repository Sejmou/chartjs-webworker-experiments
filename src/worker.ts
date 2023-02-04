import { Chart } from 'chart.js/auto';
import {
  isCanvasClickMessage,
  isCanvasHoverMessage,
  isRenderCanvasMessage,
  isResizeCanvasMessage,
  WorkerMessage,
} from './worker-communication';

let chart: Chart;

addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  console.log(event.data);
  console.log(event);
  if (isRenderCanvasMessage(event.data)) {
    const { canvas, chartConfig, width, height } = event.data;
    canvas.width = width;
    canvas.height = height;
    chart = new Chart(canvas as unknown as HTMLCanvasElement, chartConfig); // ChartJS has no typedef for OffscreenCanvas although it works?

    // Resizing the chart must be done manually, since OffscreenCanvas does not include event listeners.
    console.log(width, height);
    chart.resize();
    console.log(chart);
  } else if (isResizeCanvasMessage(event.data)) {
    const { width, height } = event.data;
    console.log(width, height);
    chart.canvas.width = width;
    chart.canvas.height = height;
    // chart.resize(width, height); // TODO: figure out why this doesn't work
    const canvas = chart.canvas as unknown as HTMLCanvasElement; // again, type annotation is not correct here
    const config = chart.config;
    chart.destroy();
    chart = new Chart(canvas, config);
  } else if (isCanvasClickMessage(event.data)) {
    const { x, y } = event.data;
    console.log(x, y);
  } else if (isCanvasHoverMessage(event.data)) {
    const { x, y } = event.data;
    console.log(x, y);
    // chart.getElementsAtEventForMode( // doesn't work because of missing DOM access
    //   { x, y } as MouseEvent,
    //   'nearest',
    //   { intersect: true },
    //   true
    // );
    // console.log(chart.getSortedVisibleDatasetMetas()); // also doesn't work
    const datasets = chart.data.datasets;
    console.log(datasets);

    // casting to any here because no typefs exist for those private properties
    const pixelPositions = (chart as any)._metasets
      .map((meta: any) => meta.data)
      .map((d: any) => d.map((data: any) => ({ x: data.x, y: data.y }))) as {
      x: number;
      y: number;
    }[][];
    console.log('pixel positions', pixelPositions);
    const datasetInfo = (chart as any)._metasets.map(
      (meta: any, i: number) => ({
        data: meta.data.map((d: any, j: number) => ({
          x: d.x,
          y: d.y,
          dataX: pixelPositions[i][j].x,
          dataY: pixelPositions[i][j].y,
        })),
        datasetIdx: i,
      })
    ) as {
      data: { x: number; y: number; dataX: number; dataY: number }[];
      datasetIdx: number;
    }[];
    console.log('dataset info', datasetInfo);
    const allDataPointsFlat = datasetInfo.flatMap(d =>
      d.data.map(p => ({ ...p, datasetIdx: d.datasetIdx }))
    );
    const nearbyPoints = getIdxOfPointsWithinMaxDistance({
      points: allDataPointsFlat,
      referencePoint: { x, y },
      metric: 'euclidean',
      maxDist: 10,
    });
    console.log(nearbyPoints);
  }
});

function getIdxOfPointsWithinMaxDistance<
  T extends { x: number; y: number }
>(params: {
  points: T[];
  maxDist?: number;
  referencePoint: { x: number; y: number };
  metric?: 'euclidean' | 'manhattan';
}) {
  const {
    points,
    maxDist = 100,
    referencePoint,
    metric = 'euclidean',
  } = params;
  const distFunc =
    metric === 'euclidean' ? euclideanDistance : manhattanDistance;
  return points
    .map((point, i) => ({
      dist: distFunc(point, referencePoint),
      idx: i,
    }))
    .filter(({ dist }) => dist <= maxDist)
    .map(({ idx }) => idx);
}

function euclideanDistance(
  point1: { x: number; y: number },
  point2: { x: number; y: number }
) {
  return Math.sqrt(
    Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)
  );
}

function manhattanDistance(
  point1: { x: number; y: number },
  point2: { x: number; y: number }
) {
  return Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y);
}
