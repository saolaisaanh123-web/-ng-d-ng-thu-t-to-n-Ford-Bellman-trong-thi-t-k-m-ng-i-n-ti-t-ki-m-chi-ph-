import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { validateGraph, runBellmanFord, reconstructPath } from '../hoang/bellmanFord.mjs';

function network(ids, arcs, costModel = 'operating') {
  return {
    directed: true,
    costModel,
    nodes: ids.map(id => ({ id })),
    edges: arcs.map(([from, to, cost], index) => ({ id: 'e' + (index + 1), from, to, cost }))
  };
}

function demo() {
  return JSON.parse(readFileSync(new URL('../data/sampleGraph.json', import.meta.url), 'utf8'));
}

function finite(result, target, nodeIds, edgeIds, totalCost) {
  assert.equal(result.status.get(target), 'finite');
  assert.equal(result.distances.get(target), totalCost);
  assert.deepEqual(reconstructPath(result, target), { status: 'finite', nodeIds, edgeIds, totalCost });
}

function noRoute(result, target, status) {
  assert.equal(result.status.get(target), status);
  assert.equal(result.distances.get(target), status === 'unbounded' ? -Infinity : Infinity);
  assert.deepEqual(reconstructPath(result, target), { status, nodeIds: [], edgeIds: [], totalCost: null });
}

test('01 · Một trạm cũng là nguồn và đích', () => {
  const result = runBellmanFord(network(['S'], []), 'S');
  finite(result, 'S', ['S'], [], 0);
  assert.equal(result.passes, 0);
  assert.equal(result.negativeCycle, false);
});

test('02 · JSON trình diễn, lộ trình chi phí 6 và dừng sớm', () => {
  const graph = demo();
  const result = runBellmanFord(graph, 'S');
  assert.deepEqual(['S','A','B','C','T'].map(id => result.distances.get(id)), [0, 3, 2, 3, 6]);
  finite(result, 'T', ['S','B','A','T'], ['e1','e2','e3'], 6);
  assert.equal(result.passes, 2);
  assert.equal(result.negativeCycle, false);
  assert.equal(result.affectedNodes.size, 0);
});

test('03 · Chạy lại sau khi tăng e2, đường đổi và chi phí thành 7', () => {
  const graph = demo();
  const oldResult = runBellmanFord(graph, 'S');
  graph.edges.find(edge => edge.id === 'e2').cost = 5;
  const result = runBellmanFord(graph, 'S');
  assert.deepEqual(['S','A','B','C','T'].map(id => result.distances.get(id)), [0, 4, 2, 3, 7]);
  finite(result, 'T', ['S','A','T'], ['e4','e3'], 7);
  finite(oldResult, 'T', ['S','B','A','T'], ['e1','e2','e3'], 6);
});

test('04 · Đích tồn tại nhưng cô lập; cung có hướng', () => {
  const graph = network(['S','A','T'], [['S','A',2]]);
  const result = runBellmanFord(graph, 'S');
  noRoute(result, 'T', 'unreachable');
  finite(result, 'A', ['S','A'], ['e1'], 2);
  noRoute(runBellmanFord(graph, 'A'), 'S', 'unreachable');
});

test('05 · Giữ tuyến tìm thấy trước khi hai tổng bằng nhau', () => {
  const graph = network(['S','A','B','T'], [['S','A',1], ['S','B',1], ['A','T',2], ['B','T',2]]);
  finite(runBellmanFord(graph, 'S'), 'T', ['S','A','T'], ['e1','e3'], 3);
});

test('06 · Cung chi phí 0 vẫn nối được hai trạm', () => {
  const graph = network(['S','A','T'], [['S','A',0], ['A','T',2], ['S','T',4]]);
  const result = runBellmanFord(graph, 'S');
  finite(result, 'A', ['S','A'], ['e1'], 0);
  finite(result, 'T', ['S','A','T'], ['e1','e2'], 2);
});

test('07 · Ưu đãi ròng và số thập phân hữu hạn', () => {
  const graph = network(['S','A','T'], [['S','T',1], ['S','A',4.25], ['A','T',-5.5]], 'net');
  const result = runBellmanFord(graph, 'S');
  assert.equal(result.negativeCycle, false);
  finite(result, 'T', ['S','A','T'], ['e2','e3'], -1.25);
});

test('08 · Chu trình âm tới được và các đích ở hạ lưu', () => {
  const graph = network(['S','A','B','T','C'], [
    ['S','A',1], ['A','B',-3], ['B','A',1], ['B','T',4], ['S','C',7]
  ], 'net');
  const result = runBellmanFord(graph, 'S');
  assert.equal(result.negativeCycle, true);
  assert.deepEqual(result.affectedNodes, new Set(['A','B','T']));
  for (const id of ['A','B','T']) noRoute(result, id, 'unbounded');
  finite(result, 'C', ['S','C'], ['e5'], 7);
  finite(result, 'S', ['S'], [], 0);
});

test('09 · Chu trình âm ngoài thành phần của nguồn', () => {
  const graph = network(['S','T','X','Y'], [['S','T',3], ['X','Y',-4], ['Y','X',1]], 'net');
  const result = runBellmanFord(graph, 'S');
  assert.equal(result.negativeCycle, false);
  assert.equal(result.affectedNodes.size, 0);
  finite(result, 'T', ['S','T'], ['e1'], 3);
  for (const id of ['X','Y']) noRoute(result, id, 'unreachable');
});

test('10 · Phân biệt đúng ID của hai cung song song', () => {
  const graph = network(['S','T'], [['S','T',7], ['S','T',2]]);
  finite(runBellmanFord(graph, 'S'), 'T', ['S','T'], ['e2'], 2);
});

test('11 · Nguồn/đích không tồn tại', () => {
  const graph = demo();
  assert.throws(() => runBellmanFord(graph, 'Z'), { code: 'UNKNOWN_SOURCE' });
  const result = runBellmanFord(graph, 'S');
  assert.throws(() => reconstructPath(result, 'Z'), { code: 'UNKNOWN_TARGET' });
});

test('12 · Từ chối dữ liệu sai, trả lỗi có thể hiển thị', () => {
  const invalid = [
    null,
    { directed: false, nodes: [{id: 'S'}], edges: [] },
    network([], []),
    network(['S','S'], []),
    network([' S'], []),
    network(['S'], [['S','Z',1]]),
    network(['S'], [['S','S','abc']]),
    network(['S'], [['S','S',NaN]]),
    network(['S'], [['S','S',Infinity]]),
    network(['S'], [['S','S',-1]])
  ];
  const duplicate = demo();
  duplicate.edges[1].id = duplicate.edges[0].id;
  invalid.push(duplicate);
  assert.deepEqual(validateGraph(demo()), { ok: true, issues: [] });
  for (const graph of invalid) {
    const validation = validateGraph(graph);
    assert.equal(validation.ok, false);
    assert.ok(validation.issues.length);
    for (const issue of validation.issues) {
      for (const field of ['code','field','message']) assert.ok(issue[field], field);
    }
    assert.throws(() => runBellmanFord(graph, 'S'), { code: 'INVALID_GRAPH' });
  }
});

test('13 · Chuỗi 500 trạm, duyệt cạnh ngược, tắt lịch sử', context => {
  const n = 500;
  const ids = Array.from({length: n}, (_, index) => 'n' + index);
  const arcs = ids.slice(1).map((id, index) => [ids[index], id, 1]).reverse();
  const graph = network(ids, arcs);
  const run = () => runBellmanFord(graph, ids[0], { trace: false });
  const result = run();
  ids.forEach((id, index) => assert.equal(result.distances.get(id), index));
  finite(result, ids.at(-1), ids, graph.edges.map(edge => edge.id).reverse(), n - 1);
  assert.equal(result.passes, n - 1);
  assert.equal(result.steps.length, 0);
  const milliseconds = [];
  for (let i = 0; i < 5; i++) {
    const start = performance.now();
    run();
    milliseconds.push(performance.now() - start);
  }
  milliseconds.sort((a, b) => a - b);
  context.diagnostic('Node ' + process.version + ', 5 lượt sau làm nóng, trung vị ' +
    milliseconds[2].toFixed(2) + ' ms');
});

test('14 · Khuyên âm tại nguồn ảnh hưởng cả nguồn và đích', () => {
  const graph = network(['S','T'], [['S','S',-1], ['S','T',3]], 'net');
  const result = runBellmanFord(graph, 'S');
  noRoute(result, 'S', 'unbounded');
  noRoute(result, 'T', 'unbounded');
});

test('15 · Phát và tua ngược lịch sử khôi phục đủ nhãn và tiền nhiệm', () => {
  const graph = demo();
  graph.nodes.push({id: 'X'});
  graph.edges.push({id: 'e7', from: 'X', to: 'S', cost: 1});
  const original = structuredClone(graph);
  const result = runBellmanFord(graph, 'S');
  const distances = new Map(graph.nodes.map(({id}) => [id, id === 'S' ? 0 : Infinity]));
  const predecessors = new Map(graph.nodes.map(({id}) => [id, null]));
  const initialDistances = new Map(distances);
  const initialPredecessors = new Map(predecessors);
  const outcomes = new Set();
  result.steps.forEach((step, index) => {
    const edge = graph.edges[index % graph.edges.length];
    assert.equal(step.pass, Math.floor(index / graph.edges.length) + 1);
    assert.equal(step.edgeId, edge.id);
    assert.equal(step.from, edge.from);
    assert.equal(step.to, edge.to);
    assert.ok(step.message.trim());
    assert.equal(step.oldDistance, distances.get(step.to));
    assert.deepEqual(step.oldPredecessor, predecessors.get(step.to));
    const candidate = distances.get(step.from) + edge.cost;
    if (distances.get(step.from) === Infinity) assert.equal(step.outcome, 'skipped');
    else if (candidate < step.oldDistance) assert.equal(step.outcome, 'updated');
    else assert.equal(step.outcome, 'unchanged');
    if (step.outcome === 'updated') {
      assert.equal(step.newDistance, candidate);
      assert.deepEqual(step.newPredecessor, {nodeId: edge.from, edgeId: edge.id});
    } else {
      assert.equal(step.newDistance, step.oldDistance);
      assert.deepEqual(step.newPredecessor, step.oldPredecessor);
    }
    distances.set(step.to, step.newDistance);
    predecessors.set(step.to, step.newPredecessor);
    outcomes.add(step.outcome);
  });
  assert.equal(result.steps.length, result.passes * graph.edges.length);
  assert.deepEqual(outcomes, new Set(['skipped','updated','unchanged']));
  assert.deepEqual(distances, result.distances);
  assert.deepEqual(predecessors, result.predecessors);
  for (const step of [...result.steps].reverse()) {
    distances.set(step.to, step.oldDistance);
    predecessors.set(step.to, step.oldPredecessor);
  }
  assert.deepEqual(distances, initialDistances);
  assert.deepEqual(predecessors, initialPredecessors);
  assert.deepEqual(graph, original);
});

test('16 · Hai chi phí hữu hạn cộng thành giá trị vượt miền Number', () => {
  const graph = network(['S','A','T'], [['S','A',Number.MAX_VALUE], ['A','T',Number.MAX_VALUE]]);
  assert.throws(() => runBellmanFord(graph, 'S'), {code: 'COST_OUT_OF_RANGE'});
});
