import {
  isClickedPointIdxMessage,
  isHoveringPointIdxsMessage,
  sendRenderCanvasMessage,
  sendResizeCanvasMessage,
  WorkerResponse,
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
  const groups = data.reduce((acc, track) => {
    const key = track.key;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(track);
    return acc;
  }, {} as Record<number, TrackData[]>);

  const canvas = document.getElementsByTagName('canvas')[0];
  const offscreenCanvas = canvas.transferControlToOffscreen();
  const { width, height } = canvas.getBoundingClientRect();

  const worker = new Worker(new URL('./worker.ts', import.meta.url), {
    type: 'module',
  });
  const datasets = Object.entries(groups).map(([key, tracks]) => ({
    label: getKey(Number(key) as keyof typeof keyMap),
    data: tracks.map(track => ({
      x: track.energy,
      y: track.valence,
    })),
  }));
  const chartConfig = {
    type: 'scatter',
    data: {
      datasets,
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

  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    if (isClickedPointIdxMessage(event.data)) {
      const { pointIdx } = event.data;
      const dataset = datasets[pointIdx.datasetIdx];
      const matchingTrack = dataset.data[pointIdx.dataIdx];
      console.log('clicked track', matchingTrack);
    } else if (isHoveringPointIdxsMessage(event.data)) {
      const { pointIdxs } = event.data;
      console.log(
        pointIdxs.forEach(d => {
          const dataset = datasets[d.datasetIdx];
          const matchingTracks = dataset.data.filter((_, i) =>
            d.dataIdxs.includes(i)
          );
          if (matchingTracks.length === 0) return;
          console.log('tracks in the key of', dataset.label);
          console.log(matchingTracks);
        })
      );
    }
  };
})();

const keyMap = {
  0: 'C',
  1: 'C♯/D♭',
  2: 'D',
  3: 'D♯/E♭',
  4: 'E',
  5: 'F',
  6: 'F♯/G♭',
  7: 'G',
  8: 'G♯/A♭',
  9: 'A',
  10: 'A♯/B♭',
  11: 'B',
};

function getKey(key: keyof typeof keyMap) {
  return keyMap[key];
  // const keySignature = keyMap[key];
  // return mode === 1 ? keySignature : `${keySignature}m`;
}
