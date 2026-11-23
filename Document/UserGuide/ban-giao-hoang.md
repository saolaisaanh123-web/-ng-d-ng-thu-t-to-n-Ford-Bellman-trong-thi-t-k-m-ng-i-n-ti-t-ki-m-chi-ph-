# Chạy và bàn giao phần mô phỏng Bellman–Ford

**Phan Đức Hoàng · 51.01.104.131 · Lý thuyết đồ thị và Ứng dụng**

## Mở trên máy cá nhân

Nếu nhận bản ZIP, hãy giải nén cả thư mục. Nếu dùng Git, chọn nhánh `main`. Thư mục gốc của dự án chứa `Source` và `Document`.

### Dùng Live Server trong VS Code

1. Chọn **File → Open Folder…** và mở thư mục gốc của dự án.
2. Trong **Extensions** (**Ctrl+Shift+X** trên Windows), tìm **Live Server** của **Ritwick Dey**. Chọn **Install** nếu tiện ích chưa được cài.
3. Trong **Explorer**, mở **Source → hoang**, nhấp phải vào **demo.html** và chọn **Open with Live Server**.
4. Trên trang vừa mở, kiểm tra tiêu đề **Tuyến truyền tải tối ưu**. Địa chỉ thường kết thúc bằng `/Source/hoang/demo.html` nếu Live Server đang phục vụ thư mục gốc. Cổng do tiện ích chọn. Mở trang qua HTTP để trình duyệt tải được các mô-đun và dữ liệu JSON.

Trên điện thoại, chọn **Phóng to sơ đồ** rồi cuộn ngang trong khung để đọc trọng số.

Live Server tự phục vụ toàn bộ tệp của bản thử. Python là lựa chọn riêng cho người muốn mở bằng terminal.

### Dùng máy chủ tĩnh của Python

Mở terminal tại thư mục gốc của dự án. Khởi động máy chủ bằng lệnh phù hợp với hệ điều hành.

```sh
# Windows có Python Launcher
py -3 -m http.server 8080 --directory Source

# macOS hoặc Linux có Python 3
python3 -m http.server 8080 --directory Source
```

Trong trình duyệt hiện đại, mở **http://localhost:8080/hoang/demo.html**. Nếu máy đang dùng cổng 8080, chọn cổng khác trong cả lệnh và địa chỉ. Nhấn **Ctrl+C** trong terminal để dừng máy chủ Python.

### Chạy bộ kiểm thử độc lập

Mở một terminal tại thư mục gốc của dự án. Nếu máy có Node.js với bộ chạy `node:test` (đã thử với v24.22.3), chạy lệnh sau và xem tổng số ca đạt hoặc thất bại ở cuối kết quả.

```sh
node --test Source/tests/bellmanFord.test.mjs
```

## Thử trong hai phút

1. Giữ kịch bản **Mạng 5 trạm · Phí cơ sở**, nguồn S, đích T. Nhấn **Tính tuyến**. Kết quả là **S → B → A → T, tổng 6 nghìn đồng/MWh**. Các cung e1, e2, e3 hiện nét đậm.
2. Nhấn **Từng bước**, nhấn **Tiếp** hai lần. Khi xét e2, nhãn A đổi từ ∞ thành 3 vì B đã có nhãn 2 và B→A có phí 1. Nhấn **Lùi** để thấy A trở lại ∞. Có thể dùng **Phát**, **Tạm dừng** và thay tốc độ.
3. Nhập **5** vào ô phí B→A, nhấn **Áp dụng phí**, rồi **Tính tuyến**. Tuyến cũ nay có phí 10. Chương trình chọn **S → A → T, tổng 7**, thấp hơn 3 so với giữ tuyến cũ theo bảng phí mới. Để quay về phí 1, chọn lại kịch bản phí cơ sở. **Đặt lại** đưa phần mô phỏng về nhãn ban đầu trên mạng đang chọn.
4. Chọn **Trạm đích bị cô lập** rồi tính. T vẫn xuất hiện trong mạng và bảng cho T hiển thị ∞. Trong **Chu trình phí ròng âm**, T có nhãn −∞ vì từ S có thể đi vòng B→A→B rồi đến T. Chuyển đích sang C, panel cho S→C với phí 3 dù nhánh kia vẫn có chu trình âm.

Kịch bản phí âm dùng số liệu ưu đãi giả định. Vị trí trạm trên hình chỉ tác động cách vẽ. Bài toán tính phí một hành trình cho cùng 1 MWh và chưa xét công suất hoặc phân bố dòng điện thực.

## Giải thích mã khi bảo vệ

| Tệp | Lần theo một thao tác |
|---|---|
| [sampleGraph.json](../../Source/data/sampleGraph.json) | Đọc sáu cung đúng thứ tự trong mảng. e2 luôn là B→A ở mạng mẫu. |
| [bellmanFord.mjs](../../Source/hoang/bellmanFord.mjs) | validateGraph kiểm tra kiểu, ID, đầu mút, phí và chế độ kinh tế. runBellmanFord đặt nguồn 0, quét cung, so chi phí ứng viên, giữ Map tiền nhiệm có mã cạnh, dừng khi hết thay đổi hoặc hết V−1 lượt. Nếu một lượt đầy đủ không đổi nhãn, thuật toán đã hội tụ. Khi cần kiểm tra chu trình âm, findAffectedNodes lấy các đỉnh có thể giảm nhãn rồi dùng hàng đợi để tìm mọi đích bị ảnh hưởng. reconstructPath lần ngược từ đích rồi đảo danh sách. |
| [panel.mjs](../../Source/hoang/panel.mjs) | solve dùng lại kết quả cho cùng nguồn và mạng. Tính tuyến trực tiếp bỏ qua lịch sử. Lần đầu cần xem từng bước, panel chạy có ghi lịch sử rồi dùng lại cho các thao tác tiếp theo. moveOne dùng giá trị cũ hoặc mới của một sự kiện để cập nhật bản sao bảng. render chọn nhãn tại con trỏ hoặc nhãn kết thúc. Đổi đích ở trạng thái hoàn tất gọi truy vết cho đích mới. |
| [graph.mjs](../../Source/hoang/graph.mjs) | drawGraph ánh xạ vị trí đỉnh và mã cạnh thành SVG có hướng. Các cung cùng cặp đầu mút được tách nét. Tô cung theo edgeId để hai đường song song vẫn được phân biệt. |
| [demo.mjs](../../Source/hoang/demo.mjs) | Host phục vụ kiểm thử. makeScenario sao dữ liệu gốc để tạo từng tình huống. Thay phí đưa đồ thị mới vào setGraph và xóa kết quả của lần tính cũ. |
| [bellmanFord.test.mjs](../../Source/tests/bellmanFord.test.mjs) | Tái hiện độc lập bằng Node, bao gồm kiểm tra đường đi, chu trình âm, dữ liệu sai, tua ngược, cạnh song song và mạng 500 trạm. |

Vì sao lặp được V−1 lần? Với một đích có tối ưu hữu hạn, có thể bỏ chu trình không âm trên đường đi và thu được một đường tối ưu đơn. Đường đơn đi qua tối đa V đỉnh, tức tối đa V−1 cung. Một lượt quét có thể truyền nhãn xa hơn một cung nếu thứ tự duyệt thuận lợi. Trong ca tăng phí, e3 được xét trước e4 nên nhãn T phải sang lượt sau mới giảm xuống 7.

P lượt nới lỏng dùng O(PE) thời gian với P ≤ V−1. Kiểm tra dữ liệu và lan ảnh hưởng chu trình âm tốn O(V+E). Các bảng nhãn và tiền nhiệm dùng O(V) bộ nhớ. Danh sách cung đi để xác định ảnh hưởng của chu trình âm đưa tổng bộ nhớ phụ của lõi lên O(V+E). Khi ghi hoạt ảnh, thêm tối đa O(PE) sự kiện. Truy vết một đích tốn O(V). Giá trị chi phí dùng kiểu `Number`. Các khoản phí như 0,1 và 0,2 cộng thành 0,3 theo quy ước thập phân của mô-đun. Nếu tổng chi phí ứng viên vượt độ chính xác có thể lưu (chẳng hạn 10²⁰ − 1), mô-đun báo lỗi `COST_OUT_OF_RANGE`.

## Điểm ghép cho người giữ trang chính

Chép nguyên thư mục hoang và các tệp dữ liệu cần dùng vào cây Source của nhóm hoặc giữ cấu trúc tương đương. Ví dụ tối thiểu dưới đây giả định trang chính ở Source/index.html, có một phần tử `<div id="algorithm-host"></div>`, và đoạn mã nằm trong script type="module". Chèn fragment một lần cho mỗi trang vì các control có ID duy nhất.

```js
import { mountPanel } from "./hoang/panel.mjs";

const host = document.querySelector("#algorithm-host");
async function load(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error("Không tải được " + path);
  return response;
}

try {
  host.innerHTML = await (await load("./hoang/panel.html")).text();
  const graph = await (await load("./data/sampleGraph.json")).json();
  const panel = mountPanel(host, graph);
  // Khi bộ nhập chấp nhận đồ thị mới: panel.setGraph(nextGraph).
  // Khi tháo vùng mô phỏng khỏi trang: panel.destroy().
} catch (error) {
  host.textContent = error.message;
}
```

Trang chính có thể liên kết `./hoang/panel.css` hoặc tự áp dụng CSS của nhóm theo tiền tố bf-. Mỗi ID trạm/cung trong đồ thị phải ổn định suốt một lần chạy. Hợp đồng gồm kiểu dữ liệu, các trường trả về và cách xử lý lỗi. [Hợp đồng tích hợp](../ThietKe/hop-dong.md)

## Bằng chứng và phạm vi nghiệm thu

- **Đã đạt trong phần của Hoàng.** 20 ca kiểm thử thuật toán bằng Node.js đã đạt. Bản thử HTTP trên Chromium 156.0.8078.79 đã tái hiện phí 6 và 7, đúng mã cung, quay lui e2, phát/tạm dừng, đặt lại, đổi nguồn và tái dùng kết quả khi đổi đích. Thử cả kịch bản cô lập, ưu đãi, chu trình âm, nhập phí sai, dữ liệu lỗi khi gắn panel, thay mạng một trạm và tháo listener. Đã kiểm tra chiều rộng 320, 390, 768, 1024 và 1440 px. Đây là kiểm tra trình duyệt trên máy đám mây. [Bảng kết quả thuật toán](../ThietKe/kiem-thu.md)
- **Ảnh chụp bản chạy.** Giữ cùng bố cục để đối chiếu. [Phí cơ sở](../Slides/Anh/01-phi-co-so.png) · [Nới lỏng B→A](../Slides/Anh/02-noi-long-e2.png) · [Tăng phí](../Slides/Anh/03-tang-phi.png) · [Chu trình âm](../Slides/Anh/04-chu-trinh-am.png)
- **Có thể chỉnh sửa hình.** Mở tệp draw.io để sửa lưu đồ, sơ đồ kiến trúc, mockup, ký hiệu trạm và cặp hình trước/sau. [Sơ đồ sáu trang](../ThietKe/Hinh/so-do-hoang.drawio) · [Hướng dẫn biên tập](../ThietKe/Hinh/huong-dan.md)
- **Khi nhóm ghép.** Người phụ trách trang chính gắn panel, truyền dữ liệu của bộ nhập, thay đổi mạng khi đang phát, kiểm tra thông báo lỗi và kết quả sau khi đổi nguồn/đích. Khi có trang chính và CSS chung, nhóm chạy lại bộ kiểm thử, so sánh hai biểu phí và thử các trạng thái lỗi trên máy dùng để thuyết trình. Hai mốc kết nối với trang chung và kiểm thử toàn ứng dụng còn chờ các thành phần đó.
