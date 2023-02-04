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
  const config = {
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
  worker.postMessage({ canvas: offscreenCanvas, config, width, height }, [
    offscreenCanvas,
  ]);
})();
