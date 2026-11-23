// Đối chứng ngoại tuyến: Floyd–Warshall dùng đơn vị phí nguyên bằng 1/10 đơn vị trong ứng dụng.
import assert from "node:assert/strict";
import { runBellmanFord, reconstructPath } from "../hoang/bellmanFord.mjs";

let seed = 37;
function randomBelow(limit) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return Math.floor(seed / 2 ** 32 * limit);
}

const totals = { finite: 0, unreachable: 0, unbounded: 0 };
for (let sample = 0; sample < 500; sample++) {
  const size = 1 + randomBelow(7);
  const nodes = Array.from({ length: size }, (_, i) => ({ id: "n" + i }));
  const graph = { directed: true, costModel: "net", nodes, edges: [] };
  const costs = nodes.map((_, i) => nodes.map((_, j) => i === j ? 0 : Infinity));
  const edgeCount = randomBelow(size * size + 1);
  for (let i = 0; i < edgeCount; i++) {
    const from = randomBelow(size);
    const to = randomBelow(size);
    const tenths = randomBelow(19) - 8;
    graph.edges.push({ id: "e" + i, from: nodes[from].id, to: nodes[to].id, cost: tenths / 10 });
    costs[from][to] = Math.min(costs[from][to], tenths);
  }
  for (let k = 0; k < size; k++) {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        costs[i][j] = Math.min(costs[i][j], costs[i][k] + costs[k][j]);
      }
    }
  }
  const edges = new Map(graph.edges.map(edge => [edge.id, edge]));
  for (const [from, source] of nodes.entries()) {
    const result = runBellmanFord(graph, source.id, { trace: false });
    const affected = new Set();
    for (const [to, target] of nodes.entries()) {
      // Phải đi được từ nguồn tới vòng âm và từ vòng âm tới đích.
      const unbounded = costs.some((row, k) =>
        row[k] < 0 && costs[from][k] !== Infinity && row[to] !== Infinity);
      const expected = unbounded ? -Infinity : costs[from][to] / 10;
      const path = reconstructPath(result, target.id);
      assert.equal(result.distances.get(target.id), expected);
      if (Number.isFinite(expected)) {
        assert.equal(path.status, "finite");
        assert.equal(path.totalCost, expected);
        assert.equal(path.nodeIds.length, path.edgeIds.length + 1);
        assert.equal(path.nodeIds[0], source.id);
        assert.equal(path.nodeIds.at(-1), target.id);
        let total = 0;
        for (const [i, id] of path.edgeIds.entries()) {
          const edge = edges.get(id);
          assert.equal(edge.from, path.nodeIds[i]);
          assert.equal(edge.to, path.nodeIds[i + 1]);
          total += Math.round(edge.cost * 10);
        }
        assert.equal(total / 10, expected);
      } else {
        assert.equal(path.status, unbounded ? "unbounded" : "unreachable");
        assert.equal(path.totalCost, null);
        assert.deepEqual(path.edgeIds, []);
        assert.deepEqual(path.nodeIds, []);
        if (unbounded) affected.add(target.id);
      }
      totals[path.status]++;
    }
    assert.deepEqual(result.affectedNodes, affected);
    assert.equal(result.negativeCycle, affected.size > 0);
  }
}
console.log("500 đồ thị đã khớp đáp án độc lập.", totals);
