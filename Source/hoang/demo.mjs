const host = document.querySelector("#bf-host");
const scenario = document.querySelector("#bf-scenario");
const price = document.querySelector("#bf-edge-cost");
const priceForm = document.querySelector("#bf-price-form");
const description = document.querySelector("#bf-scenario-description");
const help = document.querySelector("#bf-help");
document.querySelector("#bf-help-open").addEventListener("click", () => help.showModal());

const explanations = {
  base: "Phí cơ sở trên sáu cung có hướng. Mỗi trọng số là chi phí cho cùng 1 MWh.",
  raised: "Chỉ tăng phí B → A từ 1 lên 5. Hãy tính lại và so với tuyến ban đầu.",
  isolated: "Hai tuyến vào T tạm ngừng. Các trạm khác vẫn có thể đến được từ S.",
  rebate: "B → A có phí ròng −1 sau ưu đãi giả định. Mạng này không có chu trình.",
  cycle: "Ưu đãi giả định tạo vòng B → A → B có tổng phí âm. Hãy so sánh hai đích T và C."
};

function makeScenario(sample, name) {
  const graph = structuredClone(sample);
  const link = graph.edges.find(edge => edge.id === "e2");
  if (name === "raised") link.cost = 5;
  if (name === "isolated") graph.edges = graph.edges.filter(edge => edge.to !== "T");
  if (name === "rebate" || name === "cycle") {
    graph.costModel = "net";
    link.cost = name === "rebate" ? -1 : -3;
    if (name === "cycle") graph.edges.push({ id: "e7", from: "A", to: "B", cost: 1 });
  }
  return graph;
}

async function getResource(path) {
  const response = await fetch(new URL(path, import.meta.url));
  if (!response.ok) throw new Error(`Không tải được ${path} (HTTP ${response.status}).`);
  return response;
}

async function loadSample() {
  const response = await getResource("../data/sampleGraph.json");
  try {
    return await response.json();
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error("Tệp sampleGraph.json có cú pháp JSON không hợp lệ.");
    throw error;
  }
}

async function start() {
  const modules = Promise.all([import("./panel.mjs"), import("./bellmanFord.mjs")]).catch(() => {
    throw new Error("Không tải được mô-đun mô phỏng. Hãy kiểm tra các tệp .mjs và mở demo.html bằng Live Server.");
  });
  const [html, sample, [{ mountPanel }, { validateGraph }]] = await Promise.all([
    getResource("./panel.html").then(response => response.text()),
    loadSample(),
    modules
  ]);
  const validation = validateGraph(sample);
  if (!validation.ok) {
    const { field, message } = validation.issues[0];
    throw new Error(`sampleGraph.json, ${field}: ${message}`);
  }
  // Các nút đổi phí của bản thử luôn thao tác trên cung B → A của mạng mẫu.
  if (!sample.edges.some(edge => edge.id === "e2" && edge.from === "B" && edge.to === "A")) {
    throw new Error("Mạng mẫu cần có cung e2 từ B đến A để thử các biểu phí.");
  }
  host.innerHTML = html;
  let graph = makeScenario(sample, "base");
  const panel = mountPanel(host, graph);

  function showScenario() {
    const e2 = graph.edges.find(edge => edge.id === "e2");
    price.value = e2.cost;
    if (graph.costModel === "net") price.removeAttribute("min");
    else price.min = "0";
    description.textContent = explanations[scenario.value];
  }
  showScenario();
  price.disabled = scenario.disabled = document.querySelector("#bf-apply").disabled = false;
  scenario.addEventListener("change", () => {
    graph = makeScenario(sample, scenario.value);
    panel.setGraph(graph);
    showScenario();
  });
  priceForm.addEventListener("submit", event => {
    event.preventDefault();
    if (!priceForm.reportValidity()) return;
    const cost = price.valueAsNumber;
    const updated = { ...graph, edges: graph.edges.map(edge => edge.id === "e2" ? { ...edge, cost } : edge) };
    panel.setGraph(updated);
    graph = updated;
    scenario.value = "custom";
    description.textContent = `Đã đặt phí B → A bằng ${cost} nghìn đồng/MWh. Chọn Tính tuyến để cập nhật kết quả.`;
  });
}

start().catch(error => {
  host.setAttribute("role", "alert");
  host.textContent = `Lỗi mở bản thử. ${error.message}`;
});
