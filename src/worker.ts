import { Chart } from 'chart.js/auto';

onmessage = function (event) {
  const { canvas, config, width, height } = event.data;
  const now = performance.now();
  canvas.width = width;
  canvas.height = height;
  const chart = new Chart(canvas, config);
  console.log(performance.now() - now);

  // Resizing the chart must be done manually, since OffscreenCanvas does not include event listeners.
  console.log(width, height);
  chart.resize();
  console.log(chart);
};
