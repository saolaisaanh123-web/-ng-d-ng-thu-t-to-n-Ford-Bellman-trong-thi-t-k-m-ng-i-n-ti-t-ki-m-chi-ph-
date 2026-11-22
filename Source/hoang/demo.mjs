import { mountPanel } from "./panel.mjs";

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

async function start() {
  const [html, sample] = await Promise.all([
    getResource("./panel.html").then(response => response.text()),
    getResource("../data/sampleGraph.json").then(response => response.json())
  ]);
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
  host.textContent = `Lỗi mở bản thử. ${error.message} Hãy mở trang qua máy chủ HTTP.`;
});
