// dominoUtils.js: Utility functions for domino path calculations

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
 * Finds the longest possible path from available dominoes.
 * @param {array} nodes - Array of [h, t] pairs representing all dominoes.
 * @param {Set} available - Set of indices of available dominoes.
 * @param {number|null} startingHead - Desired starting value, if any.
 * @returns {array} - The longest path with [h, t, index] triplets.
 */
export function findBestPath(nodes, available, startingHead = null) {
    let allPaths = [];
    function backtrack(path, used) {
        let extended = false;
        for (let i of [...available].filter((x) => !used.has(x))) {
            let [a, b] = nodes[i];
            let lastTail = path[path.length - 1][1];
            if (lastTail === a) {
                let newPath = [...path, [a, b, i]];
                used.add(i);
                backtrack(newPath, used);
                used.delete(i);
                extended = true;
            } else if (lastTail === b) {
                let newPath = [...path, [b, a, i]];
                used.add(i);
                backtrack(newPath, used);
                used.delete(i);
                extended = true;
            }
        }
        if (!extended) allPaths.push([...path]);
    }

    if (startingHead !== null) {
        for (let i of available) {
            let [a, b] = nodes[i];
            if (a === startingHead) backtrack([[a, b, i]], new Set([i]));
            else if (b === startingHead) backtrack([[b, a, i]], new Set([i]));
        }
    } else {
        for (let i of available) {
            let [a, b] = nodes[i];
            backtrack([[a, b, i]], new Set([i]));
            backtrack([[b, a, i]], new Set([i]));
        }
    }

    if (!allPaths.length) return [];
    let maxLen = Math.max(...allPaths.map((p) => p.length));
    let longestPaths = allPaths.filter((p) => p.length === maxLen);
    return longestPaths[0].map(([h, t, i]) => [h, t, i]);
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