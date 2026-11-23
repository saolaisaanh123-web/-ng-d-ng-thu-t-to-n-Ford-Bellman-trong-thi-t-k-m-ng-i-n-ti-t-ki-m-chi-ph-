function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function checkId(id, seen, field, issues) {
  if (typeof id !== "string" || !id || id !== id.trim()) {
    issues.push({ code: "INVALID_ID", field, message: "ID phải là chuỗi khác rỗng, không thừa khoảng trắng ở hai đầu." });
  } else if (seen.has(id)) {
    issues.push({ code: "DUPLICATE_ID", field, message: `ID “${id}” đã được sử dụng.` });
  } else {
    seen.add(id);
  }
}

export function validateGraph(graph) {
  const issues = [];
  if (!isRecord(graph)) {
    return { ok: false, issues: [{ code: "EXPECTED_GRAPH", field: "graph", message: "Cần một đối tượng dữ liệu đồ thị." }] };
  }
  if (graph.directed !== true) {
    issues.push({ code: "DIRECTED_REQUIRED", field: "directed", message: "Hãy mô tả mỗi chiều truyền tải bằng một cung riêng và đặt directed bằng true." });
  }
  const costModel = graph.costModel === undefined ? "operating" : graph.costModel;
  if (costModel !== "operating" && costModel !== "net") {
    issues.push({ code: "INVALID_MODEL", field: "costModel", message: "Chọn mô hình phí operating hoặc net." });
  }

  const nodeIds = new Set();
  if (!Array.isArray(graph.nodes) || graph.nodes.length === 0) {
    issues.push({ code: "NODES_REQUIRED", field: "nodes", message: "Danh sách trạm cần có ít nhất một trạm." });
  } else {
    for (const [index, node] of graph.nodes.entries()) {
      const field = `nodes[${index}]`;
      if (!isRecord(node)) {
        issues.push({ code: "INVALID_NODE", field, message: "Mỗi trạm phải là một đối tượng có ID." });
        continue;
      }
      checkId(node.id, nodeIds, `${field}.id`, issues);
    }
  }

  const edgeIds = new Set();
  if (!Array.isArray(graph.edges)) {
    issues.push({ code: "EDGES_REQUIRED", field: "edges", message: "Cần danh sách cung, có thể dùng mảng rỗng." });
  } else {
    for (const [index, edge] of graph.edges.entries()) {
      const field = `edges[${index}]`;
      if (!isRecord(edge)) {
        issues.push({ code: "INVALID_EDGE", field, message: "Mỗi cung phải có ID, hai đầu mút và chi phí." });
        continue;
      }
      checkId(edge.id, edgeIds, `${field}.id`, issues);
      for (const end of ["from", "to"]) {
        if (!nodeIds.has(edge[end])) {
          issues.push({ code: "UNKNOWN_ENDPOINT", field: `${field}.${end}`, message: "Đầu mút phải là ID của một trạm trong mạng." });
        }
      }
      if (!Number.isFinite(edge.cost)) {
        issues.push({ code: "INVALID_COST", field: `${field}.cost`, message: "Chi phí phải là một số hữu hạn." });
      } else if (edge.cost < 0 && costModel === "operating") {
        issues.push({ code: "NEGATIVE_OPERATING_COST", field: `${field}.cost`, message: "Phí truyền tải phải không âm. Chỉ dùng phí âm trong mô hình ưu đãi giả định net." });
      }
    }
  }
  return { ok: issues.length === 0, issues };
}

function failure(code, message) {
  return Object.assign(new Error(message), { code });
}

// Giá trị thập phân của một phí = units × 10^exponent.
// Ví dụ 0.12 thành 12 × 10^-2; cách tách này cũng đọc được ký pháp 1e-7.
function decimalParts(value) {
  const [mantissa, power = '0'] = String(value).split('e');
  const [whole, fraction = ''] = mantissa.split('.');
  return { units: BigInt(whole + fraction), exponent: Number(power) - fraction.length };
}

function unitsAt(parts, exponent) {
  return parts.units * 10n ** BigInt(parts.exponent - exponent);
}

function addCost(distance, edge, decimalSums) {
  const cost = edge.cost;
  if (cost === 0) return distance;
  if (distance === 0) return cost;
  const sum = distance + cost;
  if (Number.isSafeInteger(distance) && Number.isSafeInteger(cost) && Number.isSafeInteger(sum)) return sum;

  // Chi phí cung cố định trong một lần chạy. Dùng lại tổng nếu nhãn đầu cung chưa đổi.
  const previous = decimalSums.get(edge);
  if (previous?.distance === distance) return previous.sum;

  // Cộng theo cùng đơn vị thập phân để một vòng có tổng phí 0 không bị làm tròn thành vòng âm.
  const left = decimalParts(distance);
  const right = decimalParts(cost);
  const exponent = Math.min(left.exponent, right.exponent);
  const units = unitsAt(left, exponent) + unitsAt(right, exponent);
  const rounded = Number(units + 'e' + exponent);
  if (Number.isFinite(rounded)) {
    const stored = decimalParts(rounded);
    const common = Math.min(exponent, stored.exponent);
    if (unitsAt({ units, exponent }, common) === unitsAt(stored, common)) {
      decimalSums.set(edge, { distance, sum: rounded });
      return rounded;
    }
  }
  throw failure("COST_OUT_OF_RANGE", "Tổng phí nằm ngoài phạm vi hoặc độ chính xác của kiểu Number.");
}

function describeStep(edge, start, oldDistance, candidate, outcome) {
  if (outcome === "skipped") {
    return `Bỏ qua ${edge.from} → ${edge.to} vì chưa đến được ${edge.from}.`;
  }
  const oldLabel = oldDistance === Infinity ? "∞" : oldDistance;
  const calculation = `${start} + (${edge.cost}) = ${candidate}`;
  if (outcome === "updated") {
    return `${calculation} < ${oldLabel}. Đổi nhãn ${edge.to} thành ${candidate}, tiền nhiệm là ${edge.from} qua ${edge.id}.`;
  }
  return `${calculation} ≥ ${oldLabel}. Giữ nhãn và tiền nhiệm của ${edge.to}.`;
}

// Sau V−1 lượt, các đầu nhận còn giảm được là hạt giống.
// Mọi đỉnh đi tiếp được từ một hạt giống cũng có chi phí không có cận dưới.
function findAffectedNodes(graph, distances, decimalSums) {
  const outgoing = new Map(graph.nodes.map(node => [node.id, []]));
  const affected = new Set();
  for (const edge of graph.edges) {
    outgoing.get(edge.from).push(edge.to);
    const start = distances.get(edge.from);
    if (start !== Infinity && addCost(start, edge, decimalSums) < distances.get(edge.to)) {
      affected.add(edge.to);
    }
  }
  const queue = [...affected];
  for (let head = 0; head < queue.length; head++) {
    for (const next of outgoing.get(queue[head])) {
      if (!affected.has(next)) {
        affected.add(next);
        queue.push(next);
      }
    }
  }
  return affected;
}

export function runBellmanFord(graph, sourceId, { trace = true } = {}) {
  const validation = validateGraph(graph);
  if (!validation.ok) {
    const error = failure("INVALID_GRAPH", validation.issues[0].message);
    error.issues = validation.issues;
    throw error;
  }
  const distances = new Map(graph.nodes.map(node => [node.id, Infinity]));
  const predecessors = new Map(graph.nodes.map(node => [node.id, null]));
  if (!distances.has(sourceId)) {
    throw failure("UNKNOWN_SOURCE", "Trạm nguồn chưa có trong mạng.");
  }
  distances.set(sourceId, 0);
  const steps = [];
  const decimalSums = new Map();
  let passes = 0;
  let changed = true;

  for (let pass = 1; pass < graph.nodes.length; pass++) {
    changed = false;
    for (const edge of graph.edges) {
      const start = distances.get(edge.from);
      const oldDistance = distances.get(edge.to);
      const oldPredecessor = predecessors.get(edge.to);
      let outcome = "skipped";
      let candidate = Infinity;
      if (start !== Infinity) {
        candidate = addCost(start, edge, decimalSums);
        outcome = "unchanged";
        if (candidate < oldDistance) {
          distances.set(edge.to, candidate);
          predecessors.set(edge.to, { nodeId: edge.from, edgeId: edge.id });
          outcome = "updated";
          changed = true;
        }
      }
      if (trace) {
        steps.push({
          pass, edgeId: edge.id, from: edge.from, to: edge.to, outcome,
          oldDistance, newDistance: distances.get(edge.to),
          oldPredecessor, newPredecessor: predecessors.get(edge.to),
          message: describeStep(edge, start, oldDistance, candidate, outcome)
        });
      }
    }
    passes = pass;
    if (!changed) break;
  }

  // Một lượt trọn vẹn không giảm nhãn nào đã chứng minh không còn cung cải thiện.
  const affectedNodes = changed ? findAffectedNodes(graph, distances, decimalSums) : new Set();
  const status = new Map();
  for (const { id } of graph.nodes) {
    if (affectedNodes.has(id)) {
      distances.set(id, -Infinity);
      predecessors.set(id, null);
      status.set(id, "unbounded");
    } else {
      status.set(id, distances.get(id) === Infinity ? "unreachable" : "finite");
    }
  }
  return { sourceId, distances, predecessors, status, steps, negativeCycle: affectedNodes.size > 0, affectedNodes, passes };
}

export function reconstructPath(result, targetId) {
  if (typeof result?.status?.has !== "function" || typeof result.status.get !== "function" ||
      typeof result.distances?.get !== "function" || typeof result.predecessors?.get !== "function" ||
      !Number.isInteger(result.distances.size) || !result.status.has(result.sourceId)) {
    throw failure("INVALID_RESULT", "Cần kết quả đã tính bằng Bellman–Ford.");
  }
  if (!result.status.has(targetId)) {
    throw failure("UNKNOWN_TARGET", "Trạm đích chưa có trong mạng.");
  }
  const status = result.status.get(targetId);
  if (status === "unreachable" || status === "unbounded") {
    return { status, nodeIds: [], edgeIds: [], totalCost: null };
  }
  if (status !== "finite" || !Number.isFinite(result.distances.get(targetId))) {
    throw failure("INVALID_RESULT", "Trạng thái hoặc nhãn chi phí của trạm đích không hợp lệ.");
  }

  const nodeIds = [targetId];
  const edgeIds = [];
  let current = targetId;
  while (current !== result.sourceId) {
    const previous = result.predecessors.get(current);
    if (!previous || typeof previous.edgeId !== "string" || !result.status.has(previous.nodeId) ||
        nodeIds.length >= result.distances.size) {
      throw failure("INVALID_RESULT", "Chuỗi tiền nhiệm không dẫn về trạm nguồn.");
    }
    edgeIds.push(previous.edgeId);
    nodeIds.push(previous.nodeId);
    current = previous.nodeId;
  }
  return { status, nodeIds: nodeIds.reverse(), edgeIds: edgeIds.reverse(), totalCost: result.distances.get(targetId) };
}
