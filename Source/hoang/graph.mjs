import { validateGraph } from './bellmanFord.mjs';

// Bộ vẽ chỉ nhận kết quả qua ID. Tọa độ SVG không tham gia tính chi phí.
const svgNS = 'http://www.w3.org/2000/svg';
const canvas = { width: 680, height: 340 };
const ink = { line: '#637783', path: '#006b60', current: '#995004', node: '#203f49' };

function element(parent, name, attributes, text) {
  const child = document.createElementNS(svgNS, name);
  for (const [attribute, value] of Object.entries(attributes)) {
    child.setAttribute(attribute, String(value));
  }
  if (text !== undefined) child.textContent = text;
  parent.append(child);
  return child;
}

// Đánh dấu các ô 12×12 trên bản vẽ để tránh đặt nhãn lên nhau.
// Số ô cần dò chỉ phụ thuộc kích thước ký hiệu hoặc nhãn đang bố trí.
function occupiedCells() {
  const taken = new Set();
  return function fits(x, y, width, height, reserve = false) {
    const left = Math.floor((x - width / 2) / 12);
    const right = Math.floor((x + width / 2) / 12);
    const top = Math.floor((y - height / 2) / 12);
    const bottom = Math.floor((y + height / 2) / 12);
    for (let col = left; col <= right; col++) {
      for (let row = top; row <= bottom; row++) {
        const key = col + ',' + row;
        if (reserve) taken.add(key);
        else if (taken.has(key)) return false;
      }
    }
    return true;
  };
}

function stationPositions(nodes) {
  const fixed = nodes.filter(n => Number.isFinite(n.x) && Number.isFinite(n.y));
  const range = key => fixed.reduce(
    ([min, max], node) => [Math.min(min, node[key]), Math.max(max, node[key])],
    [Infinity, -Infinity]
  );
  const [left, right] = range('x');
  const [top, bottom] = range('y');
  const dx = right - left;
  const dy = bottom - top;
  const span = Math.max(dx / 508, dy / 205) || 1;
  const positions = new Map();
  const fits = occupiedCells();

  function place(id, x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y) || !fits(x, y, 58, 64)) return false;
    fits(x, y, 58, 64, true);
    positions.set(id, { x, y });
    return true;
  }
  for (const node of fixed) {
    place(node.id, canvas.width / 2 + (node.x - left - dx / 2) / span,
      canvas.height / 2 + (node.y - top - dy / 2) / span);
  }
  // Giữ các tọa độ đọc được; đặt các trạm thiếu hoặc quá sát nhau vào ô trống.
  let slot = 0;
  for (const { id } of nodes) {
    if (positions.has(id)) continue;
    while (!place(id, 80 + slot % 7 * 84, 64 + Math.floor(slot / 7) * 84)) slot++;
    slot++;
  }
  return positions;
}

function moveTowards(from, to, length) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const factor = length / (Math.hypot(dx, dy) || 1);
  return { x: from.x + dx * factor, y: from.y + dy * factor };
}

function xy(point) {
  return point.x + ',' + point.y;
}

function geometry(edge, positions, lane, index) {
  const a = positions.get(edge.from);
  const b = positions.get(edge.to);
  if (edge.from === edge.to) {
    const spread = 38 + 14 * index;
    const height = 52 + 44 * index;
    const end = { x: a.x + 14, y: a.y - 15 };
    const bend = { x: a.x + spread, y: a.y - height };
    return {
      leftBend: a.x - spread,
      d: 'M' + (a.x - 14) + ',' + (a.y - 15) + ' C' + (a.x - spread) + ',' + (a.y - height) + ' ' + xy(bend) + ' ' + xy(end),
      bend, end, label: { x: a.x, y: a.y - (height * 0.75 + 4) }
    };
  }

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  // Tính cùng một phía chuẩn cho cả hai hướng của một cặp trạm.
  const offset = (edge.from < edge.to ? lane : -lane) * 55;
  const bend = {
    x: (a.x + b.x) / 2 - dy / length * offset,
    y: (a.y + b.y) / 2 + dx / length * offset
  };
  const start = moveTowards(a, bend, 22);
  const end = moveTowards(b, bend, 24);
  return {
    d: 'M' + xy(start) + ' Q' + xy(bend) + ' ' + xy(end),
    start, bend, end,
    label: { x: (start.x + 2 * bend.x + end.x) / 4, y: (start.y + 2 * bend.y + end.y) / 4 }
  };
}

function chooseLabel(shape, width, fits) {
  let label = shape.label;
  if (shape.start && !fits(label.x, label.y, width, 22)) {
    // Dịch dọc chính cung Bézier để người xem vẫn nhận ra phí thuộc cung nào.
    for (const t of [0.35, 0.65, 0.23, 0.77]) {
      const a = (1 - t) ** 2, b = 2 * t * (1 - t), c = t ** 2;
      label = { x: a * shape.start.x + b * shape.bend.x + c * shape.end.x,
        y: a * shape.start.y + b * shape.bend.y + c * shape.end.y };
      if (fits(label.x, label.y, width, 22)) break;
    }
  }
  if (!fits(label.x, label.y, width, 22)) {
    label = { ...shape.label };
    while (!fits(label.x, label.y, width, 22)) label.y -= 30;
    shape.leader = true;
  }
  fits(label.x, label.y, width, 22, true);
  return label;
}

function paintEdge(svg, edge, shape, current, chosen, fits) {
  const color = current ? ink.current : chosen ? ink.path : ink.line;
  const g = element(svg, 'g', { 'data-edge-id': edge.id, class: current ? 'bf-current' : chosen ? 'bf-path' : 'bf-edge' });
  element(g, 'title', {}, edge.id + ' · ' + edge.from + ' → ' + edge.to + ' · ' + edge.cost + ' nghìn đồng/MWh');
  element(g, 'path', {
    d: shape.d, fill: 'none', stroke: color, 'stroke-width': current || chosen ? 4 : 2,
    'stroke-dasharray': current ? '7 5' : 'none'
  });
  const wing = moveTowards(shape.end, shape.bend, 12);
  const dx = (shape.end.x - wing.x) * 0.42;
  const dy = (shape.end.y - wing.y) * 0.42;
  element(g, 'polygon', { points: [xy(shape.end), (wing.x - dy) + ',' + (wing.y + dx), (wing.x + dy) + ',' + (wing.y - dx)].join(' '), fill: color });

  const fee = String(edge.cost);
  const width = Math.max(30, fee.length * 9 + 15);
  const anchor = shape.label;
  shape.label = chooseLabel(shape, width, fits);
  if (shape.leader) element(g, 'line', {
    x1: anchor.x, y1: anchor.y, x2: shape.label.x, y2: shape.label.y, stroke: color
  });
  element(g, 'rect', {
    x: shape.label.x - width / 2, y: shape.label.y - 11, width, height: 22, rx: 7,
    fill: current ? '#fff1da' : chosen ? '#d5f2e8' : '#fff', stroke: current || chosen ? color : '#a7b8bb'
  });
  element(g, 'text', { x: shape.label.x, y: shape.label.y + 5, 'font-size': 14, 'font-weight': 650, fill: color }, fee);
  return width;
}

function paintStation(svg, node, p, state) {
  const source = node.id === state.sourceId;
  const target = node.id === state.targetId;
  const g = element(svg, 'g', { 'data-node-id': node.id });
  const label = typeof node.label === 'string' && node.label ? node.label : node.id;
  element(g, 'title', {}, label);
  if (source) {
    element(g, 'rect', { x: p.x - 18, y: p.y - 18, width: 36, height: 36, rx: 8, fill: ink.node, stroke: ink.node, 'stroke-width': 2 });
  } else {
    element(g, 'circle', { cx: p.x, cy: p.y, r: 18, fill: target ? '#d5f2e8' : '#fff', stroke: target ? ink.path : ink.node, 'stroke-width': 2.5 });
  }
  if (target) element(g, 'circle', { cx: p.x, cy: p.y, r: 22, fill: 'none', stroke: ink.path, 'stroke-width': 1.5 });
  const shortId = Array.from(node.id);
  const glyph = shortId.length > 4 ? shortId.slice(0, 3).join('') + '…' : node.id;
  element(g, 'text', { x: p.x, y: p.y + 5.5, fill: source ? '#fff' : ink.node, 'font-weight': 750, 'font-size': shortId.length < 3 ? 17 : 12 }, glyph);
  if (source || target) {
    const description = source && target ? 'Nguồn / đích' : source ? 'Nguồn' : 'Đích';
    element(g, 'text', { x: p.x, y: p.y + 39, fill: ink.node, 'font-weight': 650, 'font-size': 13 }, description);
  }
}

export function drawGraph(svg, graph, state = {}) {
  svg.replaceChildren();
  svg.setAttribute('text-anchor', 'middle');
  svg.setAttribute('font-family', 'system-ui, sans-serif');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Sơ đồ mạng có hướng, số trên mỗi cung là phí truyền tải theo nghìn đồng/MWh');
  const validation = validateGraph(graph);
  if (!validation.ok) {
    svg.setAttribute('viewBox', '0 0 680 340');
    svg.setAttribute('aria-label', validation.issues[0].message);
    element(svg, 'text', { x: 340, y: 170, fill: ink.node }, 'Dữ liệu mạng chưa hợp lệ.');
    return;
  }
  const positions = stationPositions(graph.nodes);
  const fits = occupiedCells();
  for (const [id, p] of positions) {
    fits(p.x, p.y, 46, 46, true);
    if (id === state.sourceId || id === state.targetId) fits(p.x, p.y + 35, 76, 18, true);
  }
  const pairs = new Map();
  for (const edge of graph.edges) {
    const key = JSON.stringify([edge.from, edge.to].sort());
    if (!pairs.has(key)) pairs.set(key, []);
    pairs.get(key).push(edge);
  }

  const selected = new Set(state.pathEdgeIds || []);
  let left = 0, top = 0, right = canvas.width, bottom = canvas.height;
  for (const group of pairs.values()) {
    for (const [index, edge] of group.entries()) {
      const lane = index - (group.length - 1) / 2;
      const shape = geometry(edge, positions, lane, index);
      const width = paintEdge(svg, edge, shape, state.currentEdgeId === edge.id, selected.has(edge.id), fits);
      left = Math.min(left, (shape.leftBend ?? shape.bend.x) - 14, shape.label.x - width / 2 - 4);
      right = Math.max(right, shape.bend.x + 14, shape.label.x + width / 2 + 4);
      top = Math.min(top, shape.bend.y - 14, shape.label.y - 14);
      bottom = Math.max(bottom, shape.bend.y + 14, shape.label.y + 14);
    }
  }
  for (const node of graph.nodes) {
    const p = positions.get(node.id);
    paintStation(svg, node, p, state);
    bottom = Math.max(bottom, p.y + 48);
  }
  svg.setAttribute('viewBox', [left, top, right - left, bottom - top].join(' '));
}
