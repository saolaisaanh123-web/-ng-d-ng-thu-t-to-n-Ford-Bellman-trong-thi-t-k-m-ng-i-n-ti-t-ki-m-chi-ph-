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

function stationPositions(nodes) {
  const fixed = nodes.filter(n => Number.isFinite(n.x) && Number.isFinite(n.y));
  const xs = fixed.map(n => n.x);
  const ys = fixed.map(n => n.y);
  const range = values => values.reduce(
    ([min, max], v) => [Math.min(min, v), Math.max(max, v)], [Infinity, -Infinity]
  );
  const [left, right] = range(xs);
  const [top, bottom] = range(ys);
  const scale = Math.min(508 / (right - left || 1), 205 / (bottom - top || 1));
  const positions = new Map();
  const used = new Set();

  for (const [i, node] of nodes.entries()) {
    let x = canvas.width / 2 + (node.x - left - (right - left) / 2) * scale;
    let y = canvas.height / 2 + (node.y - top - (bottom - top) / 2) * scale;
    // Trạm thiếu tọa độ hoặc trùng vị trí được đặt trên một vòng tròn.
    if (!Number.isFinite(x) || !Number.isFinite(y) || used.has(x + ',' + y)) {
      const angle = 2 * Math.PI * i / nodes.length - Math.PI / 2;
      x = nodes.length === 1 ? canvas.width / 2 : canvas.width / 2 + 252 * Math.cos(angle);
      y = nodes.length === 1 ? canvas.height / 2 : canvas.height / 2 + 103 * Math.sin(angle);
      while (used.has(x + ',' + y)) x += 5;
    }
    positions.set(node.id, { x, y });
    used.add(x + ',' + y);
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
    const height = 48 + 27 * index;
    const end = { x: a.x + 14, y: a.y - 15 };
    const bend = { x: a.x + spread, y: a.y - height };
    return {
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
    bend, end,
    label: { x: (start.x + 2 * bend.x + end.x) / 4, y: (start.y + 2 * bend.y + end.y) / 4 }
  };
}

function paintEdge(svg, edge, shape, current, chosen) {
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
  const positions = stationPositions(graph.nodes);
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
      const width = paintEdge(svg, edge, shape, state.currentEdgeId === edge.id, selected.has(edge.id));
      left = Math.min(left, shape.bend.x - 14, shape.label.x - width / 2 - 4);
      right = Math.max(right, shape.bend.x + 14, shape.label.x + width / 2 + 4);
      top = Math.min(top, shape.bend.y - 14, shape.label.y - 14);
      bottom = Math.max(bottom, shape.bend.y + 14, shape.label.y + 14);
    }
  }
  for (const node of graph.nodes) paintStation(svg, node, positions.get(node.id), state);
  svg.setAttribute('viewBox', [left, top, right - left, bottom - top].join(' '));
}
