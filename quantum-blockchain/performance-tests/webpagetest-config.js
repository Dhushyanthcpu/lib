const WebPageTest = require('webpagetest');

const wpt = new WebPageTest('www.webpagetest.org', process.env.WPT_API_KEY);

const testUrls = [
  'https://staging.kontourcoin.io/',
  'https://staging.kontourcoin.io/workflow',
  'https://staging.kontourcoin.io/explorer',
  'https://staging.kontourcoin.io/quantum'
];

const testOptions = {
  connectivity: 'Cable',
  location: 'ec2-us-east-1:Chrome',
  runs: 3,
  firstViewOnly: false,
  video: true,
  timeline: true,
  chromeTrace: true,
  netLog: true,
  disableOptimization: false,
  disableScreenshot: false,
  lighthouse: true,
  throttleSpeedIndex: true
};

const performanceThresholds = {
  SpeedIndex: 3000,
  TTFB: 600,
  render: 1000,
  visualComplete: 3000,
  loadTime: 3500,
  fullyLoaded: 5000,
  bytesIn: 2000000, // 2MB
  requests: 100
};

async function runTests() {
  console.log('Starting WebPageTest performance tests...');
  
  for (const url of testUrls) {
    console.log(`Testing URL: ${url}`);
    
    try {
      const result = await new Promise((resolve, reject) => {
        wpt.runTest(url, testOptions, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
      
      console.log(`Test ID: ${result.data.id}`);
      console.log(`Test URL: ${result.data.userUrl}`);
      
      // Wait for test to complete
      const testResults = await new Promise((resolve, reject) => {
        wpt.getTestResults(result.data.id, {}, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
      
      // Analyze results
      const firstView = testResults.data.average.firstView;
      
      console.log('\nPerformance Metrics:');
      console.log(`SpeedIndex: ${firstView.SpeedIndex}ms (threshold: ${performanceThresholds.SpeedIndex}ms)`);
      console.log(`TTFB: ${firstView.TTFB}ms (threshold: ${performanceThresholds.TTFB}ms)`);
      console.log(`Start Render: ${firstView.render}ms (threshold: ${performanceThresholds.render}ms)`);
      console.log(`Visually Complete: ${firstView.visualComplete}ms (threshold: ${performanceThresholds.visualComplete}ms)`);
      console.log(`Load Time: ${firstView.loadTime}ms (threshold: ${performanceThresholds.loadTime}ms)`);
      console.log(`Fully Loaded: ${firstView.fullyLoaded}ms (threshold: ${performanceThresholds.fullyLoaded}ms)`);
      console.log(`Bytes In: ${firstView.bytesIn} (threshold: ${performanceThresholds.bytesIn})`);
      console.log(`Requests: ${firstView.requests} (threshold: ${performanceThresholds.requests})`);
      
      // Check if any metrics exceed thresholds
      const failures = [];
      
      for (const [metric, threshold] of Object.entries(performanceThresholds)) {
        if (firstView[metric] > threshold) {
          failures.push(`${metric}: ${firstView[metric]} exceeds threshold of ${threshold}`);
        }
      }
      
      if (failures.length > 0) {
        console.log('\nPerformance test failures:');
        failures.forEach(failure => console.log(`- ${failure}`));
        console.log('\nTest failed!');
      } else {
        console.log('\nAll performance metrics are within acceptable thresholds.');
        console.log('Test passed!');
      }
      
    } catch (error) {
      console.error(`Error testing ${url}:`, error);
    }
    
    console.log('\n-----------------------------------\n');
  }
}

runTests().catch(console.error);