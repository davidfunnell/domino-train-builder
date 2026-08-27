import { describe, it, expect } from 'vitest';
import { findBestPath, findAllLinkedLists, orientPath } from '../dominoUtils';
import { bruteForceBestPath } from './bruteForce';

const allIndices = (nodes) => new Set(nodes.map((_, i) => i));
const pipSum = (path) => path.reduce((sum, [h, t]) => sum + h + t, 0);

/** A path is valid if every tile links tail-to-head and no tile repeats. */
function assertValidPath(path, nodes) {
    const seen = new Set();
    path.forEach(([h, t, i], position) => {
        expect(seen.has(i)).toBe(false);
        seen.add(i);
        const [a, b] = nodes[i];
        expect([a, b].sort()).toEqual([h, t].sort());
        if (position > 0) expect(h).toBe(path[position - 1][1]);
    });
}

// Deterministic PRNG so a failing case is always reproducible.
function makeRandom(seed) {
    let state = seed;
    return () => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
    };
}

function randomHand(random, count, maxValue) {
    const hand = [];
    while (hand.length < count) {
        const h = Math.floor(random() * (maxValue + 1));
        const t = Math.floor(random() * (maxValue + 1));
        const duplicate = hand.some(([a, b]) => (a === h && b === t) || (a === t && b === h));
        if (!duplicate) hand.push([h, t]);
    }
    return hand;
}

describe('findBestPath', () => {
    it('returns an empty path when there are no dominoes', () => {
        expect(findBestPath([], new Set())).toEqual([]);
    });

    it('returns the single domino oriented on the starting value', () => {
        const nodes = [[3, 7]];
        expect(findBestPath(nodes, allIndices(nodes), 7)).toEqual([[7, 3, 0]]);
    });

    it('chains every domino when a full train exists', () => {
        const nodes = [[1, 2], [2, 3], [3, 4]];
        const path = findBestPath(nodes, allIndices(nodes), 1);
        expect(path.map(([h, t]) => [h, t])).toEqual([[1, 2], [2, 3], [3, 4]]);
    });

    it('starts on the requested value', () => {
        const nodes = [[5, 6], [6, 2], [2, 9]];
        const path = findBestPath(nodes, allIndices(nodes), 9);
        expect(path[0][0]).toBe(9);
        expect(path).toHaveLength(3);
    });

    it('prefers the higher pip total among equally long trains', () => {
        // From 0 the train can go through the 1s or the 9s; both are 2 long.
        const nodes = [[0, 1], [1, 1], [0, 9], [9, 9]];
        const path = findBestPath(nodes, allIndices(nodes), 0);
        expect(path).toHaveLength(2);
        expect(pipSum(path)).toBe(27);
    });

    it('handles doubles without consuming them twice', () => {
        const nodes = [[4, 4], [4, 5]];
        const path = findBestPath(nodes, allIndices(nodes), 4);
        expect(path).toHaveLength(2);
        assertValidPath(path, nodes);
    });

    it('respects the available set and ignores excluded dominoes', () => {
        const nodes = [[1, 2], [2, 3], [3, 4]];
        const path = findBestPath(nodes, new Set([0, 1]), 1);
        expect(path.map(([, , i]) => i).sort()).toEqual([0, 1]);
    });

    it('matches the brute-force result on random hands', () => {
        const random = makeRandom(20240517);
        for (let trial = 0; trial < 60; trial++) {
            const maxValue = 6 + (trial % 4);
            const nodes = randomHand(random, 5 + (trial % 4), maxValue);
            const startingHead = trial % 3 === 0 ? null : nodes[0][0];
            const optimised = findBestPath(nodes, allIndices(nodes), startingHead);
            const reference = bruteForceBestPath(nodes, allIndices(nodes), startingHead);
            const context = JSON.stringify({ nodes, startingHead });
            expect(optimised.length, context).toBe(reference.length);
            expect(pipSum(optimised), context).toBe(pipSum(reference));
            assertValidPath(optimised, nodes);
        }
    });

    it('stays responsive on a densely connected hand', () => {
        // Every tile shares a value with every other, the shape that made the
        // old exhaustive search hang.
        const nodes = [];
        for (let a = 0; a <= 5; a++) {
            for (let b = a; b <= 5; b++) nodes.push([a, b]);
        }
        const started = Date.now();
        const path = findBestPath(nodes, allIndices(nodes), 0);
        expect(Date.now() - started).toBeLessThan(2000);
        assertValidPath(path, nodes);
    });
});

describe('orientPath', () => {
    it('leaves an empty path alone', () => {
        expect(orientPath([])).toEqual([]);
    });

    it('flips a single domino onto the fixed start', () => {
        expect(orientPath([[2, 8]], 8)).toEqual([[8, 2]]);
    });

    it('shows the higher value first when no start is fixed', () => {
        expect(orientPath([[2, 8]])).toEqual([[8, 2]]);
    });

    it('reverses the path when only the reversal starts on the fixed value', () => {
        expect(orientPath([[1, 2], [2, 3]], 3)).toEqual([[3, 2], [2, 1]]);
    });
});

describe('findAllLinkedLists', () => {
    it('returns nothing for an empty hand', () => {
        expect(findAllLinkedLists([], 12)).toEqual([]);
    });

    it('uses every domino exactly once across all trains', () => {
        const nodes = [[12, 4], [4, 7], [3, 5], [5, 9], [1, 1]];
        const trains = findAllLinkedLists(nodes, 12);
        const tileCount = trains.reduce((count, train) => count + train.length, 0);
        expect(tileCount).toBe(nodes.length);
    });

    it('starts the first train on the requested value when possible', () => {
        const nodes = [[12, 4], [4, 7], [7, 2]];
        const trains = findAllLinkedLists(nodes, 12);
        expect(trains[0][0][0]).toBe(12);
    });

    it('falls back to the best available train when nothing matches the start', () => {
        const nodes = [[3, 4], [4, 5]];
        const trains = findAllLinkedLists(nodes, 12);
        expect(trains).toHaveLength(1);
        expect(trains[0]).toHaveLength(2);
    });

    it('every train it returns is a valid chain', () => {
        const random = makeRandom(987654321);
        for (let trial = 0; trial < 20; trial++) {
            const nodes = randomHand(random, 10, 9);
            const trains = findAllLinkedLists(nodes, 9);
            for (const train of trains) {
                train.forEach(([h], position) => {
                    if (position > 0) expect(h).toBe(train[position - 1][1]);
                });
            }
        }
    });
});
