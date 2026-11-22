import { reconstructPath, runBellmanFord, validateGraph } from "./bellmanFord.mjs";
import { drawGraph } from "./graph.mjs";

const numberFormat = new Intl.NumberFormat("vi-VN", { maximumSignificantDigits: 17 });

function formatCost(cost) {
  if (cost === Infinity) return "∞";
  if (cost === -Infinity) return "−∞";
  return numberFormat.format(cost);
}

function fillOptions(select, nodes, preferred) {
  const options = nodes.map(({ id, label }) => {
    const caption = typeof label === "string" && label !== id ? id + " · " + label : id;
    return new Option(caption, id);
  });
  select.replaceChildren(...options);
  select.value = preferred;
}

function renderRows(body, nodes, distances, predecessors, activeNode) {
  const rows = document.createDocumentFragment();
  for (const { id } of nodes) {
    const row = document.createElement("tr");
    if (id === activeNode) row.dataset.current = "true";
    const node = document.createElement("th");
    node.scope = "row";
    node.textContent = id;
    row.append(node);

    const before = predecessors.get(id);
    for (const value of [formatCost(distances.get(id)), before?.nodeId ?? "—", before?.edgeId ?? "—"]) {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    }
    rows.append(row);
  }
  body.replaceChildren(rows);
}

export function mountPanel(root, initialGraph) {
  const q = name => root.querySelector("#bf-" + name);
  const source = q("source");
  const target = q("target");
  const tableBody = q("table").tBodies[0];
  const listeners = new AbortController();
  let graph = null;
  let result = null;
  let timer = null;
  let errorText = "";

  // 0 = khởi tạo, 1..N = sau lần xét cung, N+1 = sau kiểm tra chu trình âm.
  // Hai Map này chỉ dùng cho giao diện, độc lập với kết quả thuật toán.
  let cursor = 0;
  let distances = new Map();
  let predecessors = new Map();

  function pause() {
    clearInterval(timer);
    timer = null;
  }

  function rewind() {
    cursor = 0;
    distances = new Map(graph?.nodes.map(({ id }) => [id, id === source.value ? 0 : Infinity]));
    predecessors = new Map();
  }

  function clearRun() {
    pause();
    result = null;
    errorText = "";
    rewind();
  }

  function solve() {
    if (result) return true;
    try {
      result = runBellmanFord(graph, source.value);
      errorText = "";
      return true;
    } catch (error) {
      errorText = error.message;
      return false;
    }
  }

  function moveOne(direction) {
    // Chỉ áp dụng phần thay đổi của một bước. Bảng cuối lấy từ result.
    const stepIndex = direction > 0 ? cursor : cursor - 1;
    const step = result.steps[stepIndex];
    if (step) {
      distances.set(step.to, direction > 0 ? step.newDistance : step.oldDistance);
      predecessors.set(step.to, direction > 0 ? step.newPredecessor : step.oldPredecessor);
    }
    cursor += direction;
  }

  function renderResult(finalPath) {
    const status = q("status");
    const cost = q("cost");
    const route = q("route");
    const detail = q("detail");
    q("result").dataset.phase = finalPath?.status ?? (result ? "running" : "idle");
    q("unit").hidden = true;
    cost.textContent = "—";
    route.textContent = "";
    detail.textContent = "";
    if (!graph || errorText) {
      status.textContent = "Dữ liệu cần kiểm tra";
    } else if (!finalPath) {
      status.textContent = result ? "Đang theo dõi các lượt quét" : "Sẵn sàng tính";
      route.textContent = source.value + " → " + target.value;
      detail.textContent = result ? "Xem bảng nhãn tại bước hiện tại." : "Chọn hai trạm rồi tính tuyến hoặc xem từng bước.";
    } else if (finalPath.status === "finite") {
      status.textContent = "Chi phí nhỏ nhất";
      cost.textContent = formatCost(finalPath.totalCost);
      q("unit").hidden = false;
      route.textContent = finalPath.nodeIds.join(" → ");
      detail.textContent = finalPath.edgeIds.length
        ? "Các cung: " + finalPath.edgeIds.join(" → ")
        : "Trạm đích trùng trạm nguồn.";
    } else if (finalPath.status === "unbounded") {
      status.textContent = "Chi phí không có cận dưới";
      route.textContent = "Chu trình âm ảnh hưởng tới " + target.value;
      detail.textContent = "Có thể lặp một vòng chi phí âm trước khi đi tới đích.";
    } else {
      status.textContent = "Không có đường đi";
      route.textContent = "Từ " + source.value + " không đến được " + target.value + ".";
    }
  }

  function render() {
    const finished = result && cursor === result.steps.length + 1;
    const step = result?.steps[cursor - 1];
    const path = finished ? reconstructPath(result, target.value) : null;
    const runControls = ["run", "first", "play", "reset", "source", "target", "speed"];
    for (const name of runControls) q(name).disabled = !graph;
    q("prev").disabled = !result || cursor === 0;
    q("next").disabled = !graph || Boolean(finished);
    q("play").textContent = timer === null ? "Phát" : "Tạm dừng";
    q("play").setAttribute("aria-pressed", String(timer !== null));
    renderResult(path);

    const progress = q("progress");
    const message = q("message");
    if (!graph) {
      tableBody.replaceChildren();
      q("graph").replaceChildren();
      q("counts").textContent = "";
      progress.textContent = "Kiểm tra đầu vào";
      message.textContent = errorText;
      return;
    }
    q("counts").textContent = graph.nodes.length + " trạm · " + graph.edges.length + " cung";
    drawGraph(q("graph"), graph, {
      sourceId: source.value, targetId: target.value,
      currentEdgeId: step?.edgeId, pathEdgeIds: path?.edgeIds ?? []
    });
    renderRows(tableBody, graph.nodes, finished ? result.distances : distances,
      finished ? result.predecessors : predecessors, step?.to);
    if (errorText) {
      progress.textContent = "Lỗi tính toán";
      message.textContent = errorText;
    } else if (finished) {
      progress.textContent = "Hoàn tất · " + result.passes + " lượt quét";
      message.textContent = result.negativeCycle
        ? "Có chu trình âm tới được từ nguồn. Trạm chịu ảnh hưởng: " + [...result.affectedNodes].join(", ") + "."
        : "Đã kiểm tra chu trình âm. Có thể đổi trạm đích để xem kết quả từ cùng nguồn.";
    } else if (step) {
      progress.textContent = "Lượt " + step.pass + " · Bước " + cursor + "/" + result.steps.length
        + " · " + step.edgeId + " (" + step.from + " → " + step.to + ")";
      message.textContent = step.message;
    } else {
      progress.textContent = result ? "Bước 0 · Khởi tạo" : "Chưa chạy";
      message.textContent = "Nhãn ban đầu của " + source.value + " bằng 0. Các trạm còn lại nhận nhãn ∞.";
    }
  }

  function advance() {
    if (cursor <= result.steps.length) moveOne(1);
    if (cursor > result.steps.length) pause();
    render();
  }

  function startTimer() {
    timer = setInterval(advance, Number(q("speed").value));
  }

  function on(name, event, action) {
    q(name).addEventListener(event, action, { signal: listeners.signal });
  }

  on("run", "click", () => {
    pause();
    if (solve()) {
      // Giữ bảng bước cuối để có thể lùi từ kết quả, kể cả khi có chu trình âm.
      while (cursor <= result.steps.length) moveOne(1);
    }
    render();
  });
  on("first", "click", () => {
    pause();
    rewind();
    solve();
    render();
  });
  on("next", "click", () => {
    pause();
    if (solve()) advance();
    else render();
  });
  on("prev", "click", () => {
    pause();
    if (cursor > 0) moveOne(-1);
    render();
  });
  on("play", "click", () => {
    if (timer !== null) pause();
    else if (solve()) {
      if (cursor > result.steps.length) rewind();
      startTimer();
    }
    render();
  });
  on("speed", "change", () => {
    if (timer !== null) {
      pause();
      startTimer();
    }
  });
  on("reset", "click", () => { clearRun(); render(); });
  on("source", "change", () => { clearRun(); render(); });
  on("target", "change", render);

  function setGraph(nextGraph) {
    if (listeners.signal.aborted) return;
    const check = validateGraph(nextGraph);
    graph = check.ok ? structuredClone(nextGraph) : null;
    const nodes = graph?.nodes ?? [];
    const hasId = value => nodes.some(node => node.id === value);
    const preferredSource = hasId(source.value) ? source.value : (hasId("S") ? "S" : nodes[0]?.id);
    const preferredTarget = hasId(target.value) ? target.value : (hasId("T") ? "T" : nodes.at(-1)?.id);
    fillOptions(source, nodes, preferredSource);
    fillOptions(target, nodes, preferredTarget);
    clearRun();
    if (!check.ok) errorText = check.issues.map(issue => issue.field + " · " + issue.message).join(" ");
    render();
  }

  setGraph(initialGraph);
  return { setGraph, destroy() { pause(); listeners.abort(); } };
}
