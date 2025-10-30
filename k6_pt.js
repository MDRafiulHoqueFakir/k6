// Comprehensive k6 performance test suite
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    scenarios: {
        // 1. Smoke Test - basic sanity check, minimal users, short duration
        smoke_test: {
            executor: 'constant-vus',
            vus: 1,
            duration: '30s',
            exec: 'smokeTest',
            startTime: '0s',
        },
        // 2. Load Test - steady load for defined period
        load_test: {
            executor: 'constant-vus',
            vus: 20,
            duration: '5m',
            exec: 'loadTest',
            startTime: '30s'
        },
        // 3. Stress Test - ramp-up to high load looking for breaking point
        stress_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '2m', target: 10 },
                { duration: '2m', target: 30 },
                { duration: '2m', target: 50 }, // step up load
                { duration: '2m', target: 100 }, // push load
                { duration: '2m', target: 150 }, // break point (if any)
                { duration: '2m', target: 0 }, // ramp down
            ],
            exec: 'stressTest',
            startTime: '5m30s'
        },
        // 4. Soak (Endurance) Test - moderate, sustained load over long time
        soak_test: {
            executor: 'constant-vus',
            vus: 10,
            duration: '20m',
            exec: 'soakTest',
            startTime: '17m30s'
        },
        // 5. Spike Test - sudden jump to high load
        spike_test: {
            executor: 'ramping-arrival-rate',
            startRate: 0,
            timeUnit: '1s',
            preAllocatedVUs: 150,
            stages: [
                { target: 1, duration: '10s' },
                { target: 50, duration: '10s' }, // sudden spike
                { target: 50, duration: '20s' },
                { target: 1, duration: '10s' },
            ],
            exec: 'spikeTest',
            startTime: '37m30s'
        },
        // 6. Breakpoint Test - incremental ramp up to find crash/impact point
        breakpoint_test: {
            executor: 'ramping-vus',
            startVUs: 5,
            stages: [
                { duration: '30s', target: 20 },
                { duration: '30s', target: 40 },
                { duration: '30s', target: 60 },
                { duration: '30s', target: 80 },
                { duration: '30s', target: 100 },
                { duration: '30s', target: 120 },
                { duration: '30s', target: 140 },
                { duration: '30s', target: 160 },
                { duration: '1m', target: 0 }, // cool down
            ],
            exec: 'breakpointTest',
            startTime: '38m20s'
        }
    }
};

// Test target URL (easy to adjust in one place)
const TARGET_URL = 'https://r2d-au-dev.vercel.app/';

// 1. Smoke Test: Quick check, basic endpoint & homepage
export function smokeTest() {
    let res = http.get(TARGET_URL);
    check(res, {
        'status is 200': (r) => r.status === 200,
        'body nonempty': (r) => r.body && r.body.length > 100,
    });
    sleep(1);
}

// 2. Load Test: Basic homepage access, moderate requests
export function loadTest() {
    let res = http.get(TARGET_URL);
    check(res, { 'status is 200': (r) => r.status === 200 });
    sleep(Math.random() * 2 + 1); // 1-3s think time
}

// 3. Stress Test: More checks, pushed load
export function stressTest() {
    let res = http.get(TARGET_URL);
    check(res, { 'status is 200': (r) => r.status === 200 });
    // Optionally simulate basic POST or auth
    sleep(Math.random() * 1 + 0.5);
}

// 4. Soak (Endurance) Test: Run for long period, checks memory leaks/issues
export function soakTest() {
    let res = http.get(TARGET_URL);
    check(res, { 'status is 200': (r) => r.status === 200 });
    sleep(Math.random() * 4 + 1); // 1-5s
}

// 5. Spike Test: Can the site absorb sudden traffic spike?
export function spikeTest() {
    let res = http.get(TARGET_URL);
    check(res, { 'status is 200': (r) => r.status === 200 });
    sleep(Math.random() * 1);
}

// 6. Breakpoint Test: Find limits
export function breakpointTest() {
    let res = http.get(TARGET_URL);
    check(res, { 'status is 200': (r) => r.status === 200 });
    sleep(0.5);
}
