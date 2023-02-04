import Chart from 'chart.js/auto';
import { getAquisitionsByYear } from './api';

type TrackData = {
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
  const data = await getAquisitionsByYear();
  console.log(data);

  const tracks = await fetch('/tracks.json', {
    headers: {
      Accept: 'application/json',
    },
  }).then(resp => resp.json() as Promise<TrackData[]>);
  console.log(tracks);

  const canvas = document.getElementsByTagName('canvas')[0];
  console.log(canvas);

  new Chart(canvas, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Tracks',
          data: tracks.map(t => ({ x: t.danceability, y: t.energy })),
        },
      ],
    },
  });
})();
