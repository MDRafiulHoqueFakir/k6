import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    scenarios: {
        // 1. Short, quick duration test (smoke/baseline)
        quick_duration_test: {
            executor: 'constant-vus',
            vus: 5,
            duration: '1m',
            exec: 'quickTest',
        },
        // 2. Medium duration steady load test
        medium_duration_test: {
            executor: 'constant-vus',
            vus: 10,
            duration: '5m',
            exec: 'mediumTest',
            startTime: '1m', // Starts after the quick test
        },
        // 3. Longer duration, ramping load test
        long_ramping_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '2m', target: 10 },    // ramp up
                { duration: '3m', target: 20 },    // ramp higher
                { duration: '3m', target: 20 },    // hold
                { duration: '2m', target: 0 },     // ramp down
            ],
            exec: 'longTest',
            startTime: '6m', // Starts after medium test
        }
    }
};

// 1. Quick Test function
export function quickTest() {
    let res = http.get('https://r2d-au-dev.vercel.app/');
    check(res, {
        'status was 200': (r) => r.status === 200,
        'body size > 1000': (r) => r.body.length > 1000,
    });
    sleep(1);
}

// 2. Medium Test function with extra steps
export function mediumTest() {
    let res1 = http.get('https://test.k6.io');
    check(res1, { 'main page loaded': (r) => r.status === 200 });
    sleep(1);

    let res2 = http.get('https://test.k6.io/news.php');
    check(res2, { 'news loaded': (r) => r.status === 200 });
    sleep(1);
}

// 3. Long Test function simulating user flow
export function longTest() {
    // Visit homepage
    let res1 = http.get('https://test.k6.io');
    check(res1, { 'home status 200': (r) => r.status === 200 });
    sleep(1);

    // Visit contacts
    let res2 = http.get('https://test.k6.io/contacts.php');
    check(res2, { 'contacts status 200': (r) => r.status === 200 });
    sleep(1);

    // Submit a login form (simulate failed and passed)
    let res3 = http.post('https://test.k6.io/login', { login: 'test', password: 'xyz' });
    check(res3, { 'login attempted': (r) => r.status === 200 });
    sleep(1);
}
