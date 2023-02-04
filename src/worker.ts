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
  }
});
