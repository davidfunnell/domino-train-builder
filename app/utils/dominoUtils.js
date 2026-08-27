// dominoUtils.js: Utility functions for domino path calculations

// Cap on how many search states we'll expand before returning the best train
// found so far. Without it, a well-connected hand can blow up combinatorially
// and lock the browser tab.
const SEARCH_BUDGET = 500000;

// Bitmasks are only safe up to 30 dominoes; past that we fall back to the
// plain search without transposition pruning.
const MAX_BITMASK_SIZE = 30;

/**
 * Orients a domino path for consistent display based on a fixed starting value or sum distribution.
 * @param {array} path - Array of [h, t] pairs representing a domino path.
 * @param {number|null} fixedStart - The desired starting value, if any.
 * @param {boolean} isLongestTrain - Indicates if this is the longest train (affects orientation logic).
 * @returns {array} - The oriented path.
 */
export function orientPath(path, fixedStart = null, isLongestTrain = false) {
    if (!path.length) return path;
    if (path.length === 1) {
        let [head, tail] = path[0];
        if (fixedStart !== null) {
            if (head === fixedStart) return [[head, tail]];
            if (tail === fixedStart) return [[tail, head]];
            return [[Math.max(head, tail), Math.min(head, tail)]];
        }
        return [[Math.max(head, tail), Math.min(head, tail)]];
    }

    let reversedPath = [...path].reverse().map(([h, t]) => [t, h]);
    if (fixedStart !== null) {
        const originalStartsWithFixed = path[0][0] === fixedStart;
        const reversedStartsWithFixed = reversedPath[0][0] === fixedStart;

        if (originalStartsWithFixed && !reversedStartsWithFixed) return path;
        if (!originalStartsWithFixed && reversedStartsWithFixed) return reversedPath;
        if (originalStartsWithFixed && reversedStartsWithFixed && isLongestTrain) {
            const mid = Math.floor(path.length / 2);
            const originalFirstHalfSum = path
                .slice(0, mid + 1)
                .reduce((sum, [h, t]) => sum + h + t, 0);
            const originalSecondHalfSum = path
                .slice(mid + 1)
                .reduce((sum, [h, t]) => sum + h + t, 0);
            const reversedFirstHalfSum = reversedPath
                .slice(0, mid + 1)
                .reduce((sum, [h, t]) => sum + h + t, 0);
            const reversedSecondHalfSum = reversedPath
                .slice(mid + 1)
                .reduce((sum, [h, t]) => sum + h + t, 0);

            if (
                originalFirstHalfSum > originalSecondHalfSum &&
                reversedFirstHalfSum <= reversedSecondHalfSum
            ) {
                return path;
            } else if (
                reversedFirstHalfSum > reversedSecondHalfSum &&
                originalFirstHalfSum <= originalSecondHalfSum
            ) {
                return reversedPath;
            } else {
                return originalFirstHalfSum >= reversedFirstHalfSum ? path : reversedPath;
            }
        }
    }

    let mid = Math.floor(path.length / 2);
    let sumOriginal = path.slice(0, mid).reduce((sum, [h, t]) => sum + h + t, 0);
    let sumReversed = reversedPath
        .slice(0, mid)
        .reduce((sum, [h, t]) => sum + h + t, 0);
    return sumOriginal >= sumReversed ? path : reversedPath;
}

/**
 * Finds the longest possible path from available dominoes, breaking ties by
 * highest pip total.
 *
 * Depth-first search that keeps only the best path found rather than
 * enumerating every path. Two things keep it fast: a transposition table
 * (reaching the same tail value with the same set of used dominoes always
 * yields the same continuations and the same pip sum, so the repeat is
 * skipped) and an early exit once a path uses every available domino.
 *
 * @param {array} nodes - Array of [h, t] pairs representing all dominoes.
 * @param {Set} available - Set of indices of available dominoes.
 * @param {number|null} startingHead - Desired starting value, if any.
 * @returns {array} - The best path with [h, t, index] triplets.
 */
export function findBestPath(nodes, available, startingHead = null) {
    const indices = [...available];
    const total = indices.length;
    if (!total) return [];

    // Map each value to the dominoes that carry it, so each step only looks at
    // tiles that can actually connect.
    const byValue = new Map();
    const addToValue = (value, index) => {
        const bucket = byValue.get(value);
        if (bucket) bucket.push(index);
        else byValue.set(value, [index]);
    };
    for (const i of indices) {
        const [a, b] = nodes[i];
        addToValue(a, i);
        if (b !== a) addToValue(b, i);
    }

    const useBitmask = total <= MAX_BITMASK_SIZE;
    const bitOf = new Map();
    if (useBitmask) indices.forEach((i, position) => bitOf.set(i, position));

    const path = [];
    const used = new Set();
    const visited = new Set();
    let mask = 0;
    let best = [];
    let bestLength = 0;
    let bestSum = -1;
    let budget = SEARCH_BUDGET;
    let done = false;

    function record(sum) {
        if (path.length > bestLength || (path.length === bestLength && sum > bestSum)) {
            bestLength = path.length;
            bestSum = sum;
            best = path.map((triple) => [...triple]);
            // Every domino is in the train: no longer path exists, and the pip
            // sum is fixed, so this is optimal.
            if (bestLength === total) done = true;
        }
    }

    function search(tail, sum) {
        if (done) return;
        if (budget-- <= 0) {
            done = true;
            return;
        }
        record(sum);

        const neighbours = byValue.get(tail);
        if (!neighbours) return;

        for (const i of neighbours) {
            if (used.has(i)) continue;
            const [a, b] = nodes[i];
            const nextTail = a === tail ? b : a;

            const previousMask = mask;
            if (useBitmask) {
                const nextMask = mask | (1 << bitOf.get(i));
                // Multiplying by 2^31 keeps tail and mask in separate ranges of
                // a single safe integer, which is cheaper than a string key.
                const key = nextTail * 2147483648 + nextMask;
                if (visited.has(key)) continue;
                visited.add(key);
                mask = nextMask;
            }

            used.add(i);
            path.push([tail, nextTail, i]);
            search(nextTail, sum + tail + nextTail);
            path.pop();
            used.delete(i);
            mask = previousMask;

            if (done) return;
        }
    }

    // Order the starting tiles by pip value so a strong train is found early,
    // which matters if the search budget runs out.
    const starts = [];
    for (const i of indices) {
        const [a, b] = nodes[i];
        if (startingHead === null) {
            starts.push([a, b, i]);
            if (a !== b) starts.push([b, a, i]);
        } else if (a === startingHead) {
            starts.push([a, b, i]);
        } else if (b === startingHead) {
            starts.push([b, a, i]);
        }
    }
    starts.sort((x, y) => y[0] + y[1] - (x[0] + x[1]));

    for (const [head, tailValue, i] of starts) {
        if (done) break;
        used.add(i);
        path.push([head, tailValue, i]);
        if (useBitmask) mask = 1 << bitOf.get(i);
        search(tailValue, head + tailValue);
        path.pop();
        used.delete(i);
        mask = 0;
    }

    return best;
}

/**
 * Finds all possible linked lists (trains) from the dominoes.
 * @param {array} nodes - Array of [h, t] pairs representing all dominoes.
 * @param {number|null} startingHead - Desired starting value for the first train.
 * @returns {array} - Array of oriented paths.
 */
export function findAllLinkedLists(nodes, startingHead = null) {
    let available = new Set(nodes.map((_, i) => i));
    let result = [];
    let isFirst = true;

    while (available.size) {
        let bestPathWithIndices;
        if (isFirst && startingHead !== null) {
            let exists = [...available].some(
                (i) => nodes[i][0] === startingHead || nodes[i][1] === startingHead
            );
            if (exists) {
                bestPathWithIndices = findBestPath(nodes, available, startingHead);
            } else {
                bestPathWithIndices = findBestPath(nodes, available);
            }
        } else {
            bestPathWithIndices = findBestPath(nodes, available);
        }

        if (!bestPathWithIndices.length) break;
        let bestPath = bestPathWithIndices.map(([h, t]) => [h, t]);
        let oriented =
            isFirst && startingHead !== null
                ? orientPath(bestPath, startingHead, isFirst)
                : orientPath(bestPath);
        result.push(oriented);
        let usedIndices = new Set(bestPathWithIndices.map(([, , i]) => i));
        available = new Set([...available].filter((i) => !usedIndices.has(i)));
        isFirst = false;
    }

    return result;
}
