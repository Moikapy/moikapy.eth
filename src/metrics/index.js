function clsMetrics(metric) {
  if (metric.value / 1000 < 0.1)
    console.log(metric.name, 'Result: ', metric.value / 1000, 'GOOD');

  if (metric.value / 1000 > 0.1 && metric.value / 1000 < 0.25)
    console.log(
      metric.name,
      'Result: ',
      metric.value / 1000,
      'Needs Improvement',
      'Visit https://web.dev/cls/'
    );

  if (metric.value / 1000 > 0.25)
    console.log(
      metric.name,
      'Result: ',
      metric.value / 1000,
      'POOR',
      'Visit https://web.dev/cls/'
    );
} //
function lcpMetrics(metric) {
  switch (metric) {
    case metric.value / 1000 <= 2.5:
      console.log(metric.name, 'Result: ', metric.value / 1000, 'GOOD');
      break;
    case metric.value / 1000 >= 2.5 && metric.value / 1000 <= 4.0:
      console.log(
        metric.name,
        'Result: ',
        metric.value / 1000,
        'Needs Improvement',
        'Visit https://web.dev/lcp/'
      );
      break;
    default:
      console.log(
        metric.name,
        'Result: ',
        metric.value / 1000,
        'POOR',
        'Visit https://web.dev/lcp/'
      );
      break;
  }
}
//
function fidMetrics(metric) {
  switch (metric) {
    case metric.value <= 100:
      console.log(metric.name, 'Result: ', metric.value, 'GOOD');
      break;
    case metric.value >= 100 && metric.value <= 300:
      console.log(
        metric.name,
        'Result: ',
        metric.value,
        'Needs Improvement',
        'Visit https://web.dev/fid/'
      );
      break;
    default:
      console.log(
        metric.name,
        'Result: ',
        metric.value,
        'POOR',
        'Visit https://web.dev/fid/'
      );
      break;
  }
}
//
function fcpMetrics(metric) {
  switch (metric) {
    case metric.value / 1000 <= 1:
      console.log(metric.name, 'Result: ', metric.value, 'GOOD');
      break;
    case metric.value / 1000 >= 1 && metric.value / 1000 <= 2.5:
      console.log(
        metric.name,
        'Result: ',
        metric.value,
        'Needs Improvement',
        'Visit https://web.dev/fcp/'
      );
      break;
    default:
      console.log(
        metric.name,
        'Result: ',
        metric.value,
        'POOR',
        'Visit https://web.dev/fcp/'
      );
      break;
  }
}
//
function ttfbMetrics(metric) {
  if (metric.value <= 600)
    console.log(metric.name, 'Result: ', metric.value, 'GOOD');

  if (metric.value >= 600 && metric.value <= 1000)
    console.log(
      metric.name,
      'Result: ',
      metric.value,
      'Needs Improvement',
      'Visit https://web.dev/ttfb/'
    );

  if (metric.value >= 1000)
    console.log(
      metric.name,
      'Result: ',
      metric.value,
      'POOR',
      'Visit https://web.dev/ttfb/'
    );
}
//
export default function metrics(metric) {
  switch (metric.name) {
    case 'FCP':
      // handle FCP results
      fcpMetrics(metric);
      break;
    case 'LCP':
      // handle LCP results
      lcpMetrics(metric);
      break;
    case 'CLS':
      // handle CLS results
      return clsMetrics(metric);

    case 'FID':
      // handle FID results
      fidMetrics(metric);
      break;
    case 'TTFB':
      // handle TTFB results
      ttfbMetrics(metric);
      break;
    case 'Next.js-hydration':
      // handle hydration results
      console.log(metric.name, ':', metric.value / 1000);
      break;
    case 'Next.js-route-change-to-render':
      // handle route-change to render results
      console.log(metric.name, ':', metric.value / 1000);
      break;
    case 'Next.js-render':
      // handle render results
      console.log(metric.name, ':', metric.value / 1000);
      break;
    default:
      break;
  }
}
