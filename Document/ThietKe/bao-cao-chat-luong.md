# Báo cáo kiểm tra chất lượng phần Bellman–Ford của Phan Đức Hoàng

## A. Tổng quan

Đã rà soát **24 tệp** đang được Git quản lý ở đầu đợt kiểm tra. Nhánh là `hoang/trien-khai-bellman-ford`, mốc ban đầu là `52fc73b`, thư mục làm việc sạch trước khi sửa. Phần mô phỏng độc lập đã chạy qua HTTP trên bản sao sạch của mã bàn giao. Với cùng 1 MWh, tăng phí B → A từ 1 lên 5 làm tuyến tối ưu S → T đổi từ S → B → A → T (tổng 6) sang S → A → T (tổng 7), đúng với phép cộng tay.

| Phạm vi ban đầu | Số tệp | Nội dung đã đối chiếu |
|---|---:|---|
| Source/hoang | 7 | Thuật toán, mã vẽ SVG, vòng đời panel, khởi tạo demo, hai tệp HTML và CSS |
| Source/data và Source/tests | 2 | Đọc JSON, kiểm tra ID và chiều của sáu cung, đơn vị phí và đáp án. Chạy toàn bộ bộ kiểm thử có sẵn |
| Document/Slides | 7 | PowerPoint gốc, PDF, kịch bản thuyết trình và bốn ảnh minh họa |
| Document/ThietKe và Document/UserGuide | 6 | Phân tích, hợp đồng, kiểm thử, hướng dẫn sơ đồ, sáu trang sơ đồ draw.io và hướng dẫn bàn giao |
| Gốc repo | 2 | Rà soát README và quy tắc bỏ qua tệp của Git |

Nhánh này chưa có trang chính của nhóm hay báo cáo Word tổng hợp. Phạm vi nghiệm thu là các tệp của Hoàng và giao diện công khai mà nhóm có thể dùng để tích hợp.

## B. Các phát hiện

Vị trí trong bảng dùng tên hàm, thao tác hoặc trang chiếu để dễ tìm sau khi số dòng thay đổi.

| Tệp và vị trí | Phát hiện đã tái hiện | Mức | Cách xử lý và kiểm chứng |
|---|---|---:|---|
| bellmanFord.mjs, phép cộng khi nới lỏng | Sai số khi cộng −0,1, −0,2 và 0,3 làm một vòng có tổng 0 giảm nhãn và có thể tạo chuỗi tiền nhiệm vòng. Một khuyên có phí −1 sau nhãn 10²⁰ lại có thể bị bỏ qua do mất đơn vị | 1 | Cộng theo giá trị thập phân của các phí, kiểm tra khả năng biểu diễn của tổng trước khi ghi nhãn. Ca 17–18 phân biệt vòng tổng 0, vòng âm nhỏ và tổng vượt độ chính xác |
| panel.mjs, mountPanel và destroy | Gắn panel lần hai trong lúc phát để lại bộ đếm và trình xử lý của phiên trước. Một lần nhấn có thể tiến hai bước | 2 | Mỗi fragment giữ một phiên hoạt động. Gắn lại sẽ dừng phiên cũ. Trang panel.test.html kiểm tra cả việc gọi destroy trên phiên cũ sau khi đã gắn phiên mới |
| demo.mjs, nạp mô-đun và mạng mẫu | Thiếu mô-đun làm trang dừng ở “Đang tải”. JSON hỏng hoặc thiếu e2 có thể hiện lỗi kỹ thuật. Nếu e2 trỏ nhầm đầu mút, nút đổi phí sẽ sửa nhầm cung | 2 | Bắt lỗi tải ngay lúc khởi tạo, kiểm tra cấu trúc mạng và xác nhận e2 đúng chiều B → A trước khi mở các nút thao tác |
| graph.mjs, drawGraph và bố trí SVG | Dữ liệu null hoặc cung thiếu đầu mút gây ngoại lệ. Một số trạm quá gần và nhãn của các cung song song, giao nhau hoặc tự khuyên bị chồng | 2 | Kiểm tra đồ thị ở đầu hàm, hiển thị lý do khi dữ liệu sai. Dành chỗ cho từng trạm và nhãn, nối chú thích về đúng cung khi phải dời. Kiểm lại hình học và ID cung được tô |
| bellmanFord.mjs, reconstructPath | Đầu vào thiếu cấu trúc kết quả hoặc chuỗi tiền nhiệm thiếu mã cung có thể gây lỗi kỹ thuật hoặc trả về đường đi không dùng được | 2 | Kiểm tra kết quả và giới hạn số bước truy vết theo số đỉnh. Ca 20 xác nhận lỗi có mã INVALID_RESULT |
| panel.html và panel.css, sơ đồ ở chiều rộng 320 px | Trọng số thu nhỏ còn khoảng 6 px trên sơ đồ mẫu | 3 | Thêm điều khiển “Phóng to sơ đồ” cho màn hình nhỏ. Chữ phí đạt 14 px khi bật, có thể cuộn ngay trong khung |
| panel.mjs, Tính tuyến, Phát và Tạm dừng | Tính một tuyến cũng tạo lịch sử. Đổi trạng thái phát ở cùng một bước vẫn dựng lại cả hình và các hàng của bảng | 3 | Tách tính kết quả khỏi tạo lịch sử. Giữ lại hàng bảng và chỉ dựng lại hình khi dữ liệu hiển thị thay đổi. Số đo ở mục E |
| Kịch bản, PowerPoint trang 7 và sơ đồ thiết kế | Phần diễn giải đổi phí thiếu bước e4 hạ nhãn A. Điều kiện áp dụng cây khung và điều kiện chu trình âm ảnh hưởng tới đích cần nêu chính xác hơn. Một nhánh dùng “cô lập” cho trường hợp chỉ biết đích chưa tới được | 4 | Đối chiếu với từng lượt chạy và hướng cung, sửa kịch bản, trang chiếu, ghi chú và nhãn lưu đồ. Xuất PDF và xem lại cả bảy trang |

Các rủi ro chưa kiểm chứng trên sản phẩm chung và giới hạn thể hiện đồ thị dày được ghi riêng ở mục F.

## C. Các tệp thay đổi và ảnh hưởng đến tích hợp

| Tệp | Thay đổi và lý do |
|---|---|
| Source/hoang/bellmanFord.mjs | Sửa số học chi phí, tái sử dụng tổng của cung khi nhãn đầu chưa đổi, bỏ lượt phát hiện chu trình dư sau một lượt ổn định, kiểm tra truy vết |
| Source/hoang/graph.mjs | Xử lý dữ liệu vẽ sai và điều chỉnh hình học của trạm, tự khuyên, nhãn phí. Tô tuyến theo ID riêng của từng cung |
| Source/hoang/panel.mjs | Quản lý một phiên cho mỗi panel, kiểm tra thành phần HTML lúc gắn, chỉ tạo lịch sử khi mô phỏng, tái sử dụng các hàng bảng |
| Source/hoang/demo.mjs và demo.html | Xác thực mạng mẫu, báo lỗi khi khởi động, khai báo biểu tượng trang và hành vi nút đóng hướng dẫn |
| Source/hoang/panel.html và panel.css | Bổ sung khung sơ đồ cuộn, phóng to và điều khiển được bằng bàn phím |
| Source/tests/bellmanFord.test.mjs | Bổ sung ca 17–20 cho các lỗi có thể lọt qua bộ cũ |
| Source/tests/doi-chieu.mjs, graph.test.html và panel.test.html | Ba tệp mới để chạy lại phép đối chứng độc lập, hình học SVG và vòng đời panel |
| Document/Slides/hoang-demo.md và Bellman-Ford-Phan-Duc-Hoang.pptx, .pdf | Sửa lời thuyết trình và trang 7, xuất lại PDF. Kịch bản Markdown tiếp tục dùng UTF-8 có BOM |
| Document/ThietKe/Hinh/so-do-hoang.drawio và huong-dan.md | Sửa nhánh dừng sớm và diễn giải đích không tới được |
| Document/ThietKe/phan-tich-va-ke-hoach.md, hop-dong.md và kiem-thu.md | Khớp mô tả thuật toán, giới hạn số học, cách lưu lịch sử và kết quả kiểm thử với mã hiện tại |
| Document/UserGuide/ban-giao-hoang.md và báo cáo này | Bổ sung cách mở qua Live Server, kiểm thử và kiểm tra lại kết quả trên máy khác |

Các tên export, chữ ký hàm, cấu trúc đồ thị JSON và hình dạng kết quả công khai được giữ nguyên. Với tổng vượt độ chính xác, bên gọi nhận mã lỗi `COST_OUT_OF_RANGE`. Khi truyền kết quả truy vết hỏng, bên gọi nhận `INVALID_RESULT`. Các tệp mới dùng API hiện có. Dữ liệu mẫu gốc và bốn ảnh minh họa tiếp tục dùng được.

## D. Kết quả kiểm thử

Môi trường chạy là Linux, Node.js v24.22.3 và Chromium 156.0.8078.79. Phép thử Live Server dùng máy chủ đi kèm tiện ích Live Server 5.7.10 của Ritwick Dey (live-server 2.2.0). Các lệnh Node chạy ở thư mục chứa Source và Document.

| Phép thử | Trước sửa | Trên bản bàn giao |
|---|---|---|
| node --test Source/tests/bellmanFord.test.mjs | 16 đạt, 0 lỗi | **20 đạt, 0 lỗi**, gồm đủ 16 ca ban đầu |
| node Source/tests/doi-chieu.mjs | Chưa có trong repo | Floyd–Warshall trên 500 đồ thị có hạt giống cố định. Cả **10.224 cặp** đều khớp, gồm 1.328 hữu hạn, 2.862 không tới được và 6.034 không có cận dưới |
| Source/tests/graph.test.html qua HTTP | Tái hiện chồng nhãn và ngoại lệ khi vẽ | **5/5 ca đạt**, gồm cung song song, tự khuyên, giao cắt và dữ liệu bất thường |
| Source/tests/panel.test.html qua HTTP | Phiên cũ vẫn nhận thao tác | **Đạt** khi gắn lại, tháo phiên cũ, lùi từ kết quả và thay mạng lúc đang phát |
| Demo trên bản sao sạch | Dùng làm mốc tái hiện | **10/10 nhóm thao tác đạt**. Trang chạy bình thường và trang kiểm tra khi thiếu CSS đều có 0 ngoại lệ JavaScript và 0 lỗi Console |

Ca 17 kiểm tra đồng hạng thập phân, vòng tổng 0 và vòng âm nhỏ. Ca 18 kiểm tra mất đơn vị khi cộng vào số lớn. Ca 19 kiểm tra đổi phí liên tiếp và đảo thứ tự các cung. Ca 20 kiểm tra chuỗi tiền nhiệm sai. Phép đối chứng dùng ma trận Floyd–Warshall và đơn vị một phần mười biểu diễn bằng số nguyên. Với mỗi tuyến hữu hạn, phép thử còn kiểm tra mã cung, chiều đi và tổng trọng số trên đường trả về.

**Đáp án độc lập của mạng mẫu** (nghìn đồng/MWh)

| Tuyến | Phí B → A bằng 1 | Phí B → A bằng 5 |
|---|---:|---:|
| S → B → A → T | **2 + 1 + 3 = 6** | 2 + 5 + 3 = 10 |
| S → A → T | 4 + 3 = 7 | **4 + 3 = 7** |
| S → C → T | 3 + 6 = 9 | 3 + 6 = 9 |

Ở biểu phí mới, chọn lại tuyến tiết kiệm 3 nghìn đồng/MWh so với tiếp tục dùng tuyến qua B. Bảng khoảng cách, kết quả, các mã cung được tô, kịch bản và trang chiếu đều đã đối chiếu với hai biểu phí.

**Trình duyệt.** Đã đổi nguồn, đích và mạng trong lúc phát, nhấn nhanh tới hai đầu lịch sử, tạm dừng, tiếp tục, đặt lại giữa chừng, nhập trống hoặc âm ở mô hình phí cơ sở, đổi phí bốn lần và quay lại mạng gốc. Đã kiểm tra hộp hướng dẫn bằng bàn phím, nhãn của biểu mẫu, ID phần tử và dữ liệu nhãn có dấu ngoặc nhọn. Ở các độ rộng 320, 390, 768, 1024 và 1440 px, các nút và ô nhập của trang mẫu đều nằm trong khung, các nhãn phí không đè lên trạm. Trong phép thử cố tình bỏ tệp, trình duyệt ghi HTTP 404 như dự kiến và trang chỉ rõ tài nguyên bị thiếu.

**Tích hợp và trình chiếu.** Live Server phục vụ đủ tám tài nguyên với HTTP 200 ở đường dẫn từ gốc repo, bao gồm bốn mô-đun JavaScript đúng kiểu nội dung. Phép chạy này xác nhận cả hai tuyến mẫu và Console sạch. Đã xuất và xem cả bảy trang chiếu ở kích thước 1920 × 1080, đối chiếu PDF, ghi chú và bốn ảnh minh họa. Sáu trang đầu cho ảnh kết xuất giống bản gốc. Trang 7 chứa phần giải thích đã sửa.

## E. Kết quả tối ưu

| Phép đo | Trước | Sau | Ý nghĩa |
|---|---:|---:|---|
| Số mục lịch sử được tạo khi bấm riêng “Tính tuyến” trên mạng phí cơ sở | 12 | 0 | Khi người dùng bấm “Lùi” từ kết quả, panel mới tạo lịch sử và vẫn về đúng bước 12/12 |
| Bấm Phát hoặc Tạm dừng tại cùng bước, đếm nút con SVG và hàng bảng mới tạo | 59 nút SVG, 5 hàng | 0 nút SVG, 0 hàng | Thay đổi trạng thái nút phát không còn vẽ lại dữ liệu đứng yên |
| Số cặp nhãn phí giao nhau trên ba cung song song hoặc ngược chiều, hai cung giao cắt và 14 tự khuyên | Lần lượt 2, 1, 13 | 0, 0, 0 | Đo từ hình học của các phần tử SVG trong Chromium |
| Chuỗi ngược 300 trạm, phí mỗi cung 0,1, tắt lịch sử | 4,08 ms, kết quả 29,900000000000155 | 6,09 ms, kết quả 29,9 | Bản cộng thập phân đúng nhưng chưa tái sử dụng tổng mất 87,98 ms |
| Cùng chuỗi, phí mỗi cung 1 | 2,86 ms | 5,77 ms | Phép đo số nguyên này chậm hơn bản ban đầu |

Hai hàng thời gian là trung vị bảy lần đo sau hai lần làm nóng, chạy luân phiên trên cùng phiên bản Node. Chúng minh họa chi phí để giữ đúng số thập phân trên bộ dữ liệu đã nêu. Thời gian thực tế còn phụ thuộc máy và thứ tự cung.

Bellman–Ford thực hiện tối đa V−1 lượt nới lỏng. Nếu một lượt trọn vẹn không đổi nhãn thì mọi cung đều đã thỏa điều kiện tối ưu, có thể bỏ qua lần quét tìm cung còn giảm được. Với một đỉnh, bước kiểm tra vẫn chạy để bắt khuyên âm. Chi phí thời gian xấu nhất là O(VE + V + E), bộ nhớ phụ O(V + E) khi tắt lịch sử. Bật mô phỏng có thể sinh thêm O(VE) mục. Bộ nhớ đệm phép cộng chỉ giữ kết quả gần nhất của từng cung trong một lần chạy.

## F. Giới hạn còn lại

- Chưa nghiệm thu trên trang chính hoặc CSS thực tế của nhóm, giao diện VS Code trên Windows, thiết bị di động vật lý hay máy chiếu lớp học. Kiểm tra kích thước màn hình dùng cửa sổ Chromium trên Linux. Chưa có số đo tương phản trên máy chiếu.
- Đầu vào JSON chuyển sang kiểu Number trước khi thuật toán xử lý. Các chữ số đã mất ngay khi đọc JSON không thể phục hồi. Nếu một tổng trung gian không thể giữ đúng dưới dạng số thập phân của Number, ứng dụng báo lỗi và dừng lượt tính.
- Đồ thị dày hoặc tên trạm rất dài có thể khó đọc. Khi chuyển bước thật sự, panel vẫn vẽ lại sơ đồ. Chế độ từng bước có thể dùng nhiều bộ nhớ trên đồ thị lớn. Chưa đo bộ nhớ đỉnh hoặc tốc độ khung hình trên thiết bị di động.
- Mô hình tính phí của một tuyến cho 1 MWh. Các kết luận về công suất, điện áp, tổn thất và tối ưu vận hành toàn bộ lưới điện cần mô hình khác.

## G. Tự kiểm tra bằng VS Code và Live Server

1. Nếu nhận tệp ZIP, giải nén toàn bộ. Trong VS Code, chọn **File → Open Folder…**, mở thư mục có cả **Source** và **Document**.
2. Mở **Extensions** bằng **Ctrl+Shift+X**, tìm **Live Server** của **Ritwick Dey** và cài nếu cần. Trong **Explorer**, mở **Source → hoang**, nhấp phải **demo.html** rồi chọn **Open with Live Server**. Cách chạy này không cần Python.
3. Trên trang **Tuyến truyền tải tối ưu**, chọn **Mạng 5 trạm · Phí cơ sở**, nguồn **S**, đích **T**, bấm **Tính tuyến**. Kiểm tra chi phí **6**, tuyến **S → B → A → T** và ba cung e1, e2, e3 được tô.
4. Nhập **5** vào **Phí B → A**, bấm **Áp dụng phí** rồi **Tính tuyến**. Kiểm tra chi phí **7**, tuyến **S → A → T** và hai cung e4, e3 được tô.
5. Bấm **Từng bước**, **Tiếp**, **Lùi**, **Phát** rồi **Tạm dừng**. Đổi kịch bản khi đang phát, kiểm tra trạng thái cũ đã được xóa. Ở kịch bản chu trình phí ròng âm, đích **T** không có cận dưới, còn đích **C** có tổng phí **3**. Thu hẹp cửa sổ và bật **Phóng to sơ đồ** để đọc trọng số.
6. Có thể mở **Source/tests/graph.test.html** và **Source/tests/panel.test.html** bằng chính lệnh **Open with Live Server**. Hai trang sẽ tự chạy và hiển thị kết quả. Để chạy cả bộ thuật toán, vào **Terminal → New Terminal** và gõ từng lệnh sau nếu máy đã cài Node.js.

```sh
node --version
node --test Source/tests/bellmanFord.test.mjs
node Source/tests/doi-chieu.mjs
```

Kết quả mong đợi là 20 ca Node đạt, 0 thất bại và thông báo đối chiếu đủ 500 đồ thị. [Bảng chi tiết từng ca](kiem-thu.md) · [Hướng dẫn bàn giao](../UserGuide/ban-giao-hoang.md)
