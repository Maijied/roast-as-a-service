const RaaS = require('./api/client.js');

async function runLoadTest(totalRequests = 1000, concurrency = 50) {
    console.log(`🚀 Starting Load Test: ${totalRequests} total requests, Concurrency: ${concurrency}\n`);

    const results = {
        latencies: [],
        errors: 0,
        networkRequests: 0,
        startTime: Date.now()
    };

    // Instrument RaaS fetch to count network hits
    const originalFetch = global.fetch;
    global.fetch = async (...args) => {
        results.networkRequests++;
        return originalFetch(...args);
    };

    const languages = ['en', 'bn'];
    let count = totalRequests;

    async function worker() {
        while (count > 0) {
            count--;
            const start = Date.now();
            try {
                const lang = languages[Math.floor(Math.random() * languages.length)];
                await RaaS.getRandomRoast({ lang });
                results.latencies.push(Date.now() - start);
            } catch (err) {
                results.errors++;
                console.error(`❌ Request failed: ${err.message}`);
            }
        }
    }

    // Spawn workers
    const workers = Array(concurrency).fill(0).map(() => worker());
    await Promise.all(workers);

    // Restore fetch
    global.fetch = originalFetch;

    // Results Calculation
    const totalTime = (Date.now() - results.startTime) / 1000;
    const avgLatency = results.latencies.reduce((a, b) => a + b, 0) / results.latencies.length;
    results.latencies.sort((a, b) => a - b);
    const p95 = results.latencies[Math.floor(results.latencies.length * 0.95)] || 0;
    const p99 = results.latencies[Math.floor(results.latencies.length * 0.99)] || 0;

    console.log('-------------------------------------------');
    console.log('📊 LOAD TEST RESULTS (INSTRUMENTED)');
    console.log('-------------------------------------------');
    console.log(`Total Time:       ${totalTime.toFixed(2)}s`);
    console.log(`Requests/sec:     ${(totalRequests / totalTime).toFixed(2)}`);
    console.log(`Success Rate:     ${((totalRequests - results.errors) / totalRequests * 100).toFixed(2)}%`);
    console.log(`Avg Latency:      ${avgLatency.toFixed(2)}ms`);
    console.log(`P95 Latency:      ${p95}ms`);
    console.log(`P99 Latency:      ${p99}ms`);
    console.log(`Network Requests: ${results.networkRequests}`);
    console.log(`Cache Hits:       ${totalRequests - results.networkRequests}`);
    console.log(`Cache Efficiency: ${((1 - results.networkRequests / totalRequests) * 100).toFixed(2)}%`);
    console.log(`Total Errors:     ${results.errors}`);
    console.log('-------------------------------------------');
}

// Get args or defaults
const requests = parseInt(process.argv[2]) || 1000;
const concurrency = parseInt(process.argv[3]) || 50;

runLoadTest(requests, concurrency);
