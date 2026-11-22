# Hợp đồng tích hợp đề xuất cho module Bellman–Ford

**Quyết định cần nhóm duyệt.** Hoàng giữ lõi thuật toán và panel mô phỏng. Trang chính cung cấp một đồ thị cùng trạm nguồn. Panel trả lời câu hỏi “đến trạm đích nào, qua những tuyến nào, hết bao nhiêu phí?”. Đây là bản thiết kế trước lập trình, dùng cho phần việc của Phan Đức Hoàng.

## 1. Điểm ghép trong repo

Kiểm tra tại commit `0aaa4d2`. Bản checkout ban đầu đang trên nhánh `work`, cùng commit với nhánh `main` trên origin tại thời điểm kiểm tra. Git chỉ theo dõi README và .gitignore. Chưa có giao diện, CSS, manifest hoặc API của nhóm để kế thừa. Bản đề xuất dùng HTML ngữ nghĩa và JavaScript ES modules với đường dẫn tương đối. Trình duyệt mở bằng HTTP cục bộ, Node có thể nhập module .mjs để chạy kiểm thử độc lập. Phiên bản Node và trình duyệt sẽ ghi theo lần chạy thật.

| File dự kiến | Đầu mối đề xuất | Bên sử dụng và giới hạn |
|---|---|---|
| `Source/index.html` | Phương, nếu nhóm đồng ý | Trang chính và trình nhập đồ thị. Người ghép thêm đúng một vùng chứa cho panel. |
| `Source/hoang/panel.html` | Hoàng | Bản HTML của phần chọn nguồn/đích, điều khiển và kết quả. Trang chính nạp fragment qua HTTP, chèn đúng một lần rồi gọi hàm gắn panel. |
| `Source/hoang/bellmanFord.mjs` | Hoàng | Ba hàm thuần bên dưới. Không truy cập DOM, đồng hồ hoặc file hệ thống. |
| `Source/hoang/panel.mjs` | Hoàng | Gắn sự kiện, gọi lõi, điều khiển bước, hiển thị bảng và đồ thị SVG trong panel. |
| `Source/data/mang-bon-tram.json`, `Source/tests/bellmanFord.test.mjs` | Hoàng | Một bộ số liệu dùng chung cho web, test và PPT. |
| `Source/css/` | Phú và Tân tự chia | Dùng móc HTML công bố ở mục 4. Quyền sửa HTML của người khác và đổi tên ID cần trao đổi trước. |
| `Document/ThietKe/` và cụm slide thuật toán trong `Document/Slides/` | Hoàng, phối hợp Tân khi ghép PPT | Bàn giao tư liệu cho người viết Word. Nhóm chỉ định một người ghép bản trình chiếu chung. |
| `Document/`, `Source/`, `Release/` | Nhóm chỉ định người đóng gói | .gitignore hiện có quy tắc `[Rr]elease/`. Nếu nộp qua GitHub, người đóng gói cần thống nhất ngoại lệ chỉ cho sản phẩm nộp và kiểm tra tệp trên link nộp. |

Đổi tên trường, đổi đơn vị hoặc đổi trạng thái đều ảnh hưởng test, HTML và slide. Người đề nghị gửi kèm ví dụ đầu vào/đầu ra và liệt kê nơi dùng. Duyệt thay đổi hợp đồng trước khi sửa đồng loạt. Trước ghép, so diff theo file với nhánh đích mới nhất; sau ghép, chạy lại bộ ca ở cuối tài liệu. Không cần dùng backend cho mô hình này.

## 2. Dữ liệu và trách nhiệm kiểm tra

Một mẫu JSON hoàn chỉnh để cả người viết HTML, CSS và thuật toán sử dụng khi duyệt. Trong phiên bản đầu, mỗi cạnh là **một cung có hướng**. Tuyến hai chiều được nhập thành hai cung có ID riêng. Một khoản ưu đãi hai chiều có tổng phí lượt đi và về âm tạo chu trình âm. Giao diện cần chỉ ra ý nghĩa đó trước khi người dùng diễn giải kết quả.

```json
{
  "directed": true,
  "costModel": "operating",
  "nodes": [
    {"id":"S","label":"Trạm nguồn","x":10,"y":50},
    {"id":"A","label":"Trạm A","x":62,"y":22},
    {"id":"B","label":"Trạm B","x":35,"y":78},
    {"id":"T","label":"Trạm đích","x":90,"y":50}
  ],
  "edges": [
    {"id":"e1","from":"S","to":"A","cost":4},
    {"id":"e2","from":"S","to":"B","cost":2},
    {"id":"e3","from":"B","to":"A","cost":1},
    {"id":"e4","from":"A","to":"T","cost":3},
    {"id":"e5","from":"B","to":"T","cost":8}
  ]
}
```

- Đơn vị duy nhất trong bản này là nghìn đồng cho một lượt 1 MWh quy ước. `operating` nhận số nguyên không âm. `net` nhận số nguyên có dấu để mô phỏng phí ròng kinh tế. Góp ý riêng nếu nhóm muốn mức chi tiết nhỏ hơn một nghìn đồng.
- `nodes` có ít nhất một trạm. ID là chuỗi khác rỗng, không có khoảng trắng ở hai đầu, phân biệt chữ hoa/chữ thường, duy nhất trong từng tập đỉnh hoặc cạnh. Mỗi đầu mút phải thuộc tập đỉnh. Cho phép cung song song và khuyên. Giá trị `cost` phải là số nguyên an toàn của JavaScript. Phép cộng vượt miền an toàn trả lỗi rõ ràng. Chuỗi số, giá trị rỗng, NaN hoặc vô cực không hợp lệ trong lõi.
- Bộ nhập kiểm tra ô trống trước khi chuyển kiểu. `label` và cặp tọa độ x/y là dữ liệu trình bày tùy chọn, x/y tính theo phần trăm khung vẽ 0–100. Khi thiếu, bộ vẽ dùng ID làm nhãn và tự bố trí. Lõi chỉ đọc ID, hướng, chế độ phí và chi phí, không sửa dữ liệu do caller cấp.

## 3. Hàm và kết quả

| Hàm ES module | Hành vi đề xuất |
|---|---|
| `validateGraph(graph)` | Trả `{ok, issues}` cho lỗi dữ liệu, mỗi issue có `code, field, message`. Ví dụ `field="edges[2].cost"` giúp bộ nhập đưa người dùng đến đúng ô. |
| `runBellmanFord(graph, sourceId, {trace=false}={})` | Tự kiểm tra dữ liệu và nguồn. Khi thành công trả `{sourceId, distance, predecessor, status, steps, hasReachableNegativeCycle}`. Ba trường theo đỉnh là Map với khóa ID gốc. |
| `reconstructPath(result, targetId)` | Trả `{status, nodeIds, edgeIds, totalCost}`. Đường hữu hạn trả đỉnh và cạnh từ nguồn tới đích. Với `unreachable` hoặc `unbounded`, hai mảng rỗng và `totalCost=null`. |
| `mountPanel(root, graph)` trong panel.mjs | Trang chính chèn fragment rồi gọi hàm này một lần với phần tử bao. Trả `{setGraph, destroy}`. `setGraph(nextGraph)` đưa vào bản đồ mới sau khi sửa; `destroy()` dừng timer và gỡ listener khi tháo panel. |

Mã lỗi khi tính/truy vết gồm `INVALID_GRAPH` (kèm issues), `UNKNOWN_SOURCE`, `UNKNOWN_TARGET`, `COST_OUT_OF_RANGE`. Hàm báo lỗi qua Error có thuộc tính code. Bộ điều khiển bắt lỗi, hiển thị mô tả tiếng Việt, bỏ kết quả cũ. Lỗi dữ liệu phân biệt với một lần tính thành công nhưng đích không tới được.

| status.get(id) | distance.get(id) | predecessor.get(id) | Giao diện |
|---|---|---|---|
| `finite` | Chi phí nhỏ nhất | `{nodeId, edgeId}` hoặc null ở nguồn | Vẽ đúng chuỗi edgeIds. Nếu nguồn trùng đích hữu hạn, đường chỉ gồm nguồn và có phí 0. |
| `unreachable` | Infinity | null | “Không có đường từ nguồn đến trạm này”. |
| `unbounded` | −Infinity | null | “Chi phí có thể giảm vô hạn do một chu trình âm trên hành trình”. |

Trong ca mẫu, `reconstructPath(result,"T")` trả trạng thái finite, nodeIds = [S,B,A,T], edgeIds = [e2,e3,e4], totalCost = 6. Bảng của T lưu tiền nhiệm A và mã e4. Map và vô cực chỉ dùng trong bộ nhớ JS. Khi xuất bảng sau này hãy dùng cột trạng thái và chi phí rỗng cho hai trạng thái phi hữu hạn.

**Thuật toán cần hiện thực**

1. Đặt d[S] = 0, các nhãn khác là ∞, tiền nhiệm rỗng. Lưu một trạng thái đầu để bộ điều khiển có thể đặt lại.
2. Quét toàn bộ cung theo thứ tự đầu vào, tối đa |V|−1 lượt. Bỏ qua u chưa tới được. Nếu d[u] + cost < d[v], cập nhật d[v] và cặp tiền nhiệm (u, edgeId). Dùng so sánh nghiêm ngặt để khi hòa giữ phương án đã tìm được. Sau một lượt đầy đủ không đổi nhãn, dừng quét.
3. Quét phát hiện trên cùng bộ nhãn cuối. Với mỗi cung còn cải thiện được từ u hữu hạn, đánh dấu v làm hạt giống. Duyệt theo hướng từ các hạt giống bằng hàng đợi để đánh dấu mọi đích có thể nhận chi phí thấp tùy ý. Giữ kết quả hữu hạn của các nhánh khác. Cờ toàn cục đúng khi tập đánh dấu khác rỗng.
4. Với đích hữu hạn, truy ngược mã đỉnh và mã cung rồi đảo thứ tự. Kiểm tra số lần truy ngược không vượt |V|−1 để phát hiện chuỗi tiền nhiệm hỏng trong tích hợp.

Mỗi lượt hoàn tất bao phủ mọi đường đi có tối đa thêm một cạnh so với bảo đảm ở lượt trước. Cập nhật tại chỗ có thể lan xa hơn trong cùng lượt. Khi đích có tối ưu hữu hạn, có thể bỏ các chu trình có tổng không âm để lấy một đường đơn tối ưu. Đó là cơ sở của giới hạn |V|−1. Một cung còn cải thiện sau giới hạn này cho biết có ảnh hưởng của chu trình âm tới được từ nguồn.

**Chi phí và lịch sử.** Với V đỉnh và E cung, pha nới lỏng dùng tối đa O(VE) thời gian, dựng trạng thái và lan ảnh hưởng dùng O(V+E). Các nhãn và tiền nhiệm dùng O(V) bộ nhớ, nếu dựng danh sách cung đi để lan ảnh hưởng thì bộ nhớ phụ cả module là O(V+E). Truy vết một đích tốn O(V). Khi bật trace, ghi sự kiện kích thước cố định cho mỗi lần xét cung, gồm `pass, edgeId, outcome, oldDistance, newDistance, oldPredecessor, newPredecessor` của đỉnh nhận. Outcome là `updated`, `unchanged` hoặc `skipped`. Có tối đa O(VE) sự kiện. Giao diện tái hiện từ nhãn đầu bằng các thay đổi, lùi một bước bằng giá trị cũ. Trạng thái phủ ảnh hưởng chu trình âm và kết quả được hiển thị ở màn hình cuối riêng. Tắt trace cho phép đo tốc độ của lõi.

## 4. Biên HTML và trạng thái hiển thị

Phác thảo để thảo luận với Phương, Phú và Tân. Khi thu hẹp màn hình, các khối đọc theo thứ tự từ trên xuống.

```text
[Trạm nguồn ▼]   [Trạm đích ▼]   [Tính tuyến]
[Sơ đồ các trạm, chiều mũi tên, mã tuyến và phí]
[Chú giải: cạnh đang xét / cạnh trên tuyến / trạm nguồn / trạm đích]
[Lùi] [Tiếp] [Chạy/Tạm dừng] [Tốc độ] [Đặt lại]
[Lượt, cung đang xét và phép so sánh]
[Bảng: Trạm | Nhãn chi phí | Trạm trước | Tuyến trước]
[Kết quả: trạng thái, tuyến, tổng phí và đơn vị]
```

| Móc DOM do Hoàng giữ | Thành viên khác có thể dựa vào |
|---|---|
| `#bf-panel`, `#bf-source`, `#bf-target`, `#bf-run` | Vùng mô phỏng và các control có label, button dùng được bằng bàn phím. |
| `#bf-graph`, `#bf-legend` | SVG trong panel nhận dữ liệu đỉnh, cung, tập edgeIds của đường và ID cung đang xét. Cạnh có `data-edge-id`, đỉnh có `data-node-id`. Mũi tên chỉ hướng, cung song song được tách nét. |
| `#bf-prev`, `#bf-next`, `#bf-play`, `#bf-speed`, `#bf-reset` | Control điều hướng bước. Các trạng thái disabled, running, paused phải tương ứng với bước và timer thực. |
| `#bf-table`, `#bf-result`, `#bf-message` | Bảng có tiêu đề cột, vùng kết quả và thông báo có aria-live. Chú thích mô tả được thay đổi ngay cả khi người dùng không phân biệt được màu. |

Dùng tiền tố `bf-` cho class và ID của panel. Đề xuất class `bf-current` cho cung đang xét và `bf-path` cho cung thuộc tuyến cuối. Kèm nét đứt và nhãn “đang xét” cho trạng thái đầu, nét đậm và danh sách tuyến bằng chữ cho trạng thái sau. Chủ sở hữu CSS quyết định bảng màu, khoảng cách và điểm ngắt bố cục.

**Vòng đời thao tác.** Khi chạy, panel chụp dữ liệu của lượt đó và tính từ nguồn. Đổi đích chỉ gọi lại hàm truy vết từ kết quả kết thúc cùng nguồn. Khi đổi nguồn hay cập nhật mạng, dừng timer, xóa kết quả, lịch sử và nét tô cũ, rồi cho phép tính lại khi dữ liệu hợp lệ. Nút đặt lại trong panel đưa mô phỏng về bước đầu trên mạng hiện tại. Việc khôi phục bộ dữ liệu ban đầu thuộc bộ nhập, qua thao tác “Nạp lại mạng mẫu” và `setGraph`. Nếu nạp fragment lỗi, trang chính hiển thị lỗi tải và đường dẫn tương đối đang dùng.

## 5. Cổng kiểm tra trước khi ghép

1. Hai phía cùng đọc được JSON ở mục 2, nhất trí đơn vị và cách biểu diễn cung hai chiều. Với ID song song, lõi và bộ vẽ phải cùng chỉ đúng mã cạnh được chọn.
2. Hoàng chạy logic ngoài trình duyệt qua `node --test Source/tests/bellmanFord.test.mjs` sau khi có mã. Người ghép thử ứng dụng qua `python3 -m http.server 8000 --directory Source` từ gốc repo và mở trang gốc trên cổng 8000. Đây là lệnh dự kiến cho cấu trúc đề xuất.
3. Ghi kết quả thực tế và phiên bản cho từng ca, bao gồm đích hữu hạn cạnh một nhánh chu trình âm. Đối chiếu cùng phép cộng trong PPT. [Bảng ca kiểm thử](kiem-thu.md)
4. Trước khi lập trình chung, nhóm cần xác nhận ba điểm: (a) mô hình phí và hướng cung, (b) người giữ trang chính, bộ nhập, panel và CSS, (c) tên trường và hàm tích hợp. Hoàng và Tân chốt cụm slide trước khi thiết kế PPT.
