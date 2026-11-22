# Phiếu kiểm chứng phần thuật toán của Phan Đức Hoàng

Dùng phiếu này để viết kiểm thử cho mô-đun độc lập và đối chiếu số liệu trên giao diện, slide và hình thực nghiệm. Mỗi ca bắt đầu với dữ liệu mới. Cung được xét theo thứ tự ghi trong bảng. Thư mục, tên hàm và cấu trúc trả về tuân theo hợp đồng tích hợp của nhóm.

## 1. Ví dụ dùng chung khi chạy thử và thuyết trình

Bốn trạm S, A, B, T có năm tuyến có hướng. Chi phí trên mỗi tuyến dùng cùng một đơn vị nghìn đồng cho một lượt 1 MWh quy ước. Người dùng chọn nguồn S và đích T.

| Mã tuyến | Từ | Đến | Ban đầu | Sau điều chỉnh |
|---|---|---|---:|---:|
| e1 | S | A | 4 | 4 |
| e2 | S | B | 2 | 2 |
| e3 | B | A | 1 | 5 |
| e4 | A | T | 3 | 3 |
| e5 | B | T | 8 | 8 |

Có thể kiểm tra độc lập bằng cách liệt kê đường đi. Từ S đi qua A thì chỉ còn một cách đến T. Từ S đi qua B thì có thể qua A hoặc đến T trực tiếp. Đồ thị này không có chu trình nên ba trường hợp đã bao quát mọi đường đi S đến T.

| Đường đi khả thi | Chi phí ban đầu | Chi phí sau điều chỉnh |
|---|---:|---:|
| S → A → T | 4 + 3 = 7 | 4 + 3 = 7 |
| S → B → A → T | 2 + 1 + 3 = **6** | 2 + 5 + 3 = 10 |
| S → B → T | 2 + 8 = 10 | 2 + 8 = 10 |

Ở lần chạy đầu, khi xét e3, nhãn của A giảm từ 4 xuống 3, tiền nhiệm đổi từ S sang B. Khi xét e4 tiếp theo, T nhận nhãn 6 và tiền nhiệm A. Nếu dùng cập nhật tại chỗ theo thứ tự e1 đến e5, lượt quét thứ hai không đổi nhãn nào. Khi sửa e3 và chạy lại từ đầu, ứng dụng phải thay cả chi phí, tiền nhiệm và nét tô trên sơ đồ.

## 2. Bảng ca kiểm thử đã thiết kế

Ký hiệu `S→A(4)` chỉ một cung có chi phí 4. Dùng costModel = net cho ca 07, 08, 09, 14 và operating cho các ca còn lại. Các ca độc lập dùng nguồn S, đích T trừ khi có ghi chú. Kết quả thực tế và kết luận thuộc lần chạy mã nguồn, để người chạy điền kèm mã commit. Cột đáp án là dữ liệu đối chiếu đã xác định trước.

| Ca | Đầu vào hoặc thao tác | Đáp án cần đối chiếu | Thực tế | Kết luận |
|---|---|---|---|---|
| 01 · Một trạm | Chỉ có S, không có cung. Chọn S làm đích. | `finite`, chi phí 0, danh sách đỉnh [S], danh sách cạnh rỗng. | Chưa chạy | Chờ |
| 02 · Chi phí dương | Mạng e1–e5 ban đầu. | Khoảng cách theo thứ tự S, A, B, T là [0, 3, 2, 6]. Đến T theo [e2, e3, e4]. | Chưa chạy | Chờ |
| 03 · Đổi một chi phí | Sau ca 02, sửa e3 thành 5 rồi chạy lại. | [0, 4, 2, 7]. Tuyến đến T theo [e1, e4]. | Chưa chạy | Chờ |
| 04 · Đích cô lập | S→A(2), có thêm T. | T có trạng thái `unreachable`, không hiển thị tuyến. A vẫn có chi phí 2. | Chưa chạy | Chờ |
| 05 · Hai đường đồng hạng | S→A(1), S→B(1), A→T(2), B→T(2). | Tổng 3. Với thứ tự đã cho và chỉ cập nhật khi nhỏ hơn, tiền nhiệm của T vẫn là A. | Chưa chạy | Chờ |
| 06 · Trọng số 0 | S→A(0), A→T(2), S→T(4). | S → A → T, tổng 2. Nhãn của A bằng 0 và A đến được từ S. | Chưa chạy | Chờ |
| 07 · Ưu đãi một chiều | Kịch bản chi phí ròng giả định có hướng. S→T(1), S→A(4), A→T(−5). | S → A → T, tổng −1, không có chu trình âm. | Chưa chạy | Chờ |
| 08 · Chu trình âm tới được | S→A(1), A→B(−3), B→A(1), B→T(4), S→C(7). | Chu trình A → B → A có tổng −2. A, B, T có trạng thái `unbounded`. S và C vẫn có nghiệm hữu hạn lần lượt 0 và 7. | Chưa chạy | Chờ |
| 09 · Chu trình âm ở thành phần khác | S→T(3), X→Y(−4), Y→X(1). | T có chi phí 3. X, Y là `unreachable`. Cờ phát hiện chu trình âm **tới được từ S** là sai. | Chưa chạy | Chờ |
| 10 · Hai tuyến song song | p và q đều đi từ S tới T, lần lượt có chi phí 7 và 2. | `edgeIds` chỉ chứa q, tổng 2. Kiểm tra cả mã tuyến trên sơ đồ. | Chưa chạy | Chờ |
| 11 · Nguồn hoặc đích lạ | Với mạng ca 02, chạy từ Z. Ở lượt riêng, chạy từ S rồi tra đích Z. | Từng thao tác báo lỗi định danh tương ứng. Đích lạ khác với đích tồn tại nhưng cô lập ở ca 04. | Chưa chạy | Chờ |
| 12 · Đầu vào sai | Tạo bốn biến thể riêng của ca 02: trùng ID đỉnh, trùng ID cạnh, cung đến Z, chi phí là chuỗi “abc”. | Mỗi biến thể bị từ chối khi kiểm tra dữ liệu, UI chỉ rõ mục cần sửa. | Chưa chạy | Chờ |
| 13 · Nhiều vòng, đồ thị lớn | 500 trạm n0…n499. Với i từ 498 giảm đến 0, ghi cung ni→n(i+1), chi phí 1. Chọn n0 và n499. Tắt lịch sử. | Chi phí đến ni bằng i, đường đến n499 gồm 499 cung. Ghi thời gian đo được cùng phiên bản môi trường. | Chưa chạy | Chờ |
| 14 · Về lại nguồn qua chu trình âm | S→S(−1), S→T(3). Tra lần lượt S và T. | Cả hai là `unbounded`, kể cả khi đích trùng nguồn. | Chưa chạy | Chờ |

Khi kiểm tra mọi tuyến hữu hạn, đối chiếu đỉnh đầu, đỉnh cuối, hướng và ID của từng cung, rồi cộng lại chi phí từ chính bộ dữ liệu đầu vào. Khi có nhiều nghiệm, cho phép đổi đường sau khi đổi thứ tự cung nếu tổng tối ưu còn đúng. Ở ca 13, đo tối thiểu năm lượt sau một lượt làm nóng và ghi trung vị kèm số vòng quét. Phép đo này chỉ mô tả môi trường đã chạy.

## 3. Nghiệm thu khi ghép giao diện

- Chọn ca 02, chạy từng bước đến e3 rồi lùi một bước. Bảng, thông báo và dấu nhận biết cạnh phải cùng trở về thời điểm trước khi A đổi tiền nhiệm. Thử tạm dừng, đổi tốc độ, chạy đến cuối rồi đặt lại.
- Chụp cùng một bố cục trước và sau ca 03. Mỗi hình cần ghi nguồn, đích, chi phí và mã tuyến thay đổi. Mô tả cho người viết Word là chi phí tối ưu tăng từ 6 lên 7 sau khi e3 tăng 4 đơn vị. Tuyến tối ưu mới đi qua A trực tiếp từ S.
- Sau ca 02, chuyển sang ca 04 hoặc 08. Kiểm tra giao diện xóa tuyến cũ và giải thích đúng vì sao không thể trả về một tuyến hữu hạn cho T. Ở ca 08, chọn C để kiểm tra các đích có nghiệm hữu hạn vẫn xem được.
- Chạy lại trong bản sao sạch của nhánh bàn giao, mở trên trình duyệt thứ hai và kiểm tra nút, chú giải, bảng khoảng cách khi thu hẹp cửa sổ. Ghi thiết bị/trình duyệt thực sự dùng. Khi lỗi, lưu mã ca, commit, bước tái hiện, mong đợi, thực tế, file phụ trách và kết quả kiểm lại sau sửa.
