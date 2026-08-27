// bruteForce.js: Reference implementation used only by tests.
// Enumerates every path exhaustively, which is correct but exponential. The
// optimised findBestPath is checked against it on small inputs.

export function bruteForceBestPath(nodes, available, startingHead = null) {
    let allPaths = [];
    function backtrack(path, used) {
        let extended = false;
        for (let i of [...available].filter((x) => !used.has(x))) {
            let [a, b] = nodes[i];
            let lastTail = path[path.length - 1][1];
            if (lastTail === a) {
                used.add(i);
                backtrack([...path, [a, b, i]], used);
                used.delete(i);
                extended = true;
            } else if (lastTail === b) {
                used.add(i);
                backtrack([...path, [b, a, i]], used);
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
    return longestPaths.reduce((best, path) => {
        const pathPoints = path.reduce((sum, [h, t]) => sum + h + t, 0);
        const bestPoints = best.reduce((sum, [h, t]) => sum + h + t, 0);
        return pathPoints > bestPoints ? path : best;
    }, longestPaths[0]);
}
