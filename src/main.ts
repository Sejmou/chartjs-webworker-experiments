import Chart from 'chart.js/auto';
import { getAquisitionsByYear } from './api';

(async function () {
  const data = await getAquisitionsByYear();
  console.log(data);

  const canvas = document.getElementsByTagName('canvas')[0];
  console.log(canvas);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: data.map(row => row.year),
      datasets: [
        {
          label: 'Acquisitions by year',
          data: data.map(row => row.count),
        },
      ],
    },
  });
})();
