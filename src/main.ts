import {
  sendRenderCanvasMessage,
  sendResizeCanvasMessage,
} from './worker-communication';

// props contained in the objects from the tracks.json file
export type TrackData = {
  name: string;
  bpm: number;
  durationMs: number;
  valence: number;
  energy: number;
  danceability: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  loudness: number;
  speechiness: number;
  key: number;
  mode: number;
  timeSignature: number;
};

// TODO: figure out how to make this generic and type safe
const throttle = (fn: Function, wait: number = 300) => {
  let inThrottle: boolean,
    lastFn: ReturnType<typeof setTimeout>,
    lastTime: number;
  return function (this: any) {
    const context = this,
      args = arguments;
    if (!inThrottle) {
      fn.apply(context, args);
      lastTime = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFn);
      lastFn = setTimeout(() => {
        if (Date.now() - lastTime >= wait) {
          fn.apply(context, args);
          lastTime = Date.now();
        }
      }, Math.max(wait - (Date.now() - lastTime), 0));
    }
  };
};

(async function () {
  const data = await fetch('/tracks.json', {
    headers: {
      Accept: 'application/json',
    },
  }).then(resp => resp.json() as Promise<TrackData[]>);
  console.log(data);

  const canvas = document.getElementsByTagName('canvas')[0];
  const offscreenCanvas = canvas.transferControlToOffscreen();
  const { width, height } = canvas.getBoundingClientRect();

  const worker = new Worker(new URL('./worker.ts', import.meta.url), {
    type: 'module',
  });
  const chartConfig = {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Tracks',
          data: data.map(t => ({ x: t.danceability, y: t.energy })),
        },
      ],
    },
  };
  sendRenderCanvasMessage(
    { canvas: offscreenCanvas, chartConfig, width, height },
    worker
  );

  window.addEventListener('resize', () => {
    const { width, height } = canvas.getBoundingClientRect();
    sendResizeCanvasMessage({ width, height }, worker);
  });

  canvas.addEventListener('click', event => {
    const { x, y } = event;
    worker.postMessage({ type: 'canvas-click', x, y });
  });

  canvas.addEventListener(
    'mousemove',
    // TODO: figure out how to type this properly
    throttle((event: { x: number; y: number }) => {
      const { x, y } = event;
      worker.postMessage({ type: 'canvas-hover', x, y });
    })
  );
})();
