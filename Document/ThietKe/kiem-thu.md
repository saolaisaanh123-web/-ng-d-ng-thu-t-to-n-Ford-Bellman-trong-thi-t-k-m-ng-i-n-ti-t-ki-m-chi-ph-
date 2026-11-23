# Kiểm chứng Bellman–Ford và số liệu thực nghiệm

**Trên Node.js v24.22.3, 16/16 ca ban đầu đạt trước khi sửa; 20/20 ca đạt sau khi bổ sung bốn ca hồi quy.** Bộ kiểm thử nhập trực tiếp ba hàm của mô-đun thuật toán và đọc cùng tệp JSON dùng cho panel. Chạy lại từ thư mục gốc của repo:

```sh
node --test Source/tests/bellmanFord.test.mjs
```

## 1. Đối chứng độc lập cho ví dụ thuyết trình

Sáu cung của mạng mẫu tạo đúng ba đường S → T. Từ S có ba lựa chọn A, B hoặc C. Sau mỗi lựa chọn, mọi trạm trung gian chỉ có đúng một cung đi tiếp. Phép cộng tay sau đây cho đáp án độc lập với chương trình. Đơn vị là nghìn đồng/MWh.

| Đường đi | Khi B → A có phí 1 | Khi B → A có phí 5 |
|---|---:|---:|
| S → B → A → T | 2 + 1 + 3 = **6** | 2 + 5 + 3 = 10 |
| S → A → T | 4 + 3 = 7 | 4 + 3 = **7** |
| S → C → T | 3 + 6 = 9 | 3 + 6 = 9 |

Với thứ tự cung e1 đến e6 trong JSON, ở ca đầu e1 gán B = 2, e2 gán A = 3 và e3 gán T = 6 ngay trong lượt quét thứ nhất. Lượt thứ hai không có cập nhật nên thuật toán dừng. Ở ca tăng phí, T lần lượt nhận 10 qua A và 9 qua C trong lượt thứ nhất. Sang lượt thứ hai, A đã có nhãn 4 nhờ cung S → A nên e3 giảm nhãn của T xuống 7. Sự khác biệt giữa các lượt xuất phát từ thứ tự xét cung và việc cập nhật nhãn tại chỗ.

## 2. Kết quả theo ca

Trong bảng, `S→T(3)` là một cung hướng từ S đến T, chi phí 3. Trừ khi có ghi chú, nguồn là S và đích cần tra là T. Các thông số không hữu hạn được lưu nội bộ trong Map và chuyển thành trạng thái có tên khi trả về đường đi.

| Ca | Dữ liệu | Đáp án đã xác định | Thực tế quan sát qua kiểm thử | Kết luận |
|---|---|---|---|---|
| 01 · Một trạm | Chỉ S, không có cung, tra S | Đường đi chỉ gồm S, phí 0 | [S], 0 cạnh, 0 lượt quét | Đạt |
| 02 · Mạng mẫu | Nạp sampleGraph.json, e2 có phí 1 | S → B → A → T, tổng 6 | [e1,e2,e3], tổng 6. Nhãn [S,A,B,C,T] = [0,3,2,3,6], dừng sau 2 lượt | Đạt |
| 03 · Sửa phí | Cùng mạng, tăng e2 thành 5 rồi chạy lại | S → A → T, tổng 7 | [e4,e3], tổng 7. Nhãn [0,4,2,3,7]. Đối tượng kết quả lần trước vẫn có tổng 6 | Đạt |
| 04 · Cô lập | S→A(2), có T đứng riêng | T không đến được, A có phí 2. Chọn A làm nguồn thì S không đến được | T trả unreachable, hai mảng rỗng và tổng null. Đi từ A về S cũng trả unreachable | Đạt |
| 05 · Đồng hạng | S→A(1), S→B(1), A→T(2), B→T(2) | Hai tuyến tổng 3, giữ tuyến đầu gặp | S → A → T, [e1,e3], tổng 3 | Đạt |
| 06 · Chi phí 0 | S→A(0), A→T(2), S→T(4) | A có nhãn 0, T có nhãn 2 | Đường qua A, tổng 2 | Đạt |
| 07 · Phí ròng | Chế độ net, S→T(1), S→A(4,25), A→T(−5,5) | A có ưu đãi khi đi đến T, tổng 4,25 − 5,5 = −1,25 | S → A → T, tổng −1,25, cờ chu trình âm tắt | Đạt |
| 08 · Chu trình âm tới được | S→A(1), A→B(−3), B→A(1), B→T(4), S→C(7), chế độ net | Lặp A → B → A giảm 2 mỗi vòng. Chi phí đến A, B và T không bị chặn dưới. S và C có nghiệm hữu hạn | Cờ bật. affectedNodes đúng {A,B,T}, ba trạm trả unbounded. Đến S và C lần lượt tốn 0 và 7 | Đạt |
| 09 · Chu trình âm ở xa | S→T(3), X→Y(−4), Y→X(1), chế độ net | X, Y ngoài tầm nguồn, T có phí 3 | Cờ tắt, tập bị ảnh hưởng rỗng, X và Y unreachable, S → T có phí 3 | Đạt |
| 10 · Cung song song | e1 và e2 đều từ S đến T, phí lần lượt 7 và 2 | Chọn đúng tuyến e2 | edgeIds = [e2], tổng 2 | Đạt |
| 11 · Sai ID khi tra | Chạy từ Z. Ở phép thử riêng, tra đích Z từ kết quả ca 02 | Hai lỗi ứng với thao tác | UNKNOWN_SOURCE và UNKNOWN_TARGET | Đạt |
| 12 · Dữ liệu sai | 11 biến thể gồm graph null, vô hướng, rỗng đỉnh, trùng ID trạm, ID thừa khoảng trắng, đầu mút lạ, chuỗi chi phí, NaN, Infinity, phí vận hành âm, trùng ID cung | Từng dữ liệu sai bị từ chối, dữ liệu chuẩn được chấp nhận | 11 biến thể trả ok = false, mỗi issue có code/field/message, chạy thuật toán ném INVALID_GRAPH. Mẫu chuẩn trả ok = true | Đạt |
| 13 · Hiệu năng | Chuỗi n0 → … → n499, mọi cung phí 1. Đưa 499 cung vào theo thứ tự ngược. Tắt trace | Nhãn ni bằng i, đường đến n499 gồm 499 cung | Đúng đủ 500 nhãn và 499 mã cung theo thứ tự đi, 499 lượt quét, 0 bản ghi lịch sử | Đạt |
| 14 · Nguồn nằm trên chu trình âm | S→S(−1), S→T(3), chế độ net | Đi vòng tại S làm giảm phí tùy ý, kể cả khi tra S | Cả S và T trả unbounded, tổng null | Đạt |
| 15 · Phát và tua | Mạng mẫu thêm X không tới được cùng cung X→S(1). Áp giá trị mới cho từng bước rồi dùng giá trị cũ theo chiều ngược | Đủ ba trạng thái updated/unchanged/skipped. Khi kết thúc khớp kết quả lõi. Tua ngược khôi phục nhãn lẫn tiền nhiệm | So sánh từng bước đúng lượt, cung, đầu mút, nhãn và tiền nhiệm. Hai Map khớp ở cả hai đầu. Dữ liệu đồ thị gốc còn nguyên | Đạt |
| 16 · Tràn số | S→A và A→T đều có phí Number.MAX_VALUE | Hai số riêng lẻ hữu hạn, phép cộng vượt giới hạn biểu diễn | Ném COST_OUT_OF_RANGE | Đạt |


| Ca hồi quy | Đầu vào | Kết quả kỳ vọng | Kết quả thực chạy | Kết luận |
|---|---|---|---|---|
| 17 · Phí thập phân | S→A(0,1), A→T(0,2), S→T(0,3). Ở mạng khác, chu trình có phí −0,1, −0,2, +0,3. | Hai tuyến đến T đồng giá. Tổng chu trình bằng 0. | Giữ tuyến qua A với phí 0,3. Chu trình tổng 0 cho nhãn hữu hạn; giảm cung cuối xuống 0,2999999999999999 thì đích trở thành unbounded. | Đạt |
| 18 · Khoản ưu đãi quá nhỏ so với nhãn | S→A(10²⁰), A→A(−1) ở chế độ net. Mạng đối chiếu cộng hai phí 10²⁰. | Báo lỗi nếu tổng chính xác không lưu được vào Number. Vẫn chấp nhận tổng lớn có thể lưu chính xác theo quy ước thập phân. | Trường hợp đầu ném COST_OUT_OF_RANGE. Mạng đối chiếu cho tổng 2 × 10²⁰. | Đạt |
| 19 · Sửa phí nhiều lần | Đặt e2 lần lượt thành 1, 5, 0, 2, 1 và đảo thứ tự mảng cung sau mỗi lần sửa. | Lấy giá trị nhỏ nhất trong ba tổng 2 + e2 + 3, 7 và 9 cho mỗi lần chạy. | Kết quả lần lượt là 6, 7, 5, 7, 6. | Đạt |
| 20 · Truy vết trên kết quả bị hỏng | Truyền null, undefined hoặc đối tượng rỗng; sau đó thử tiền nhiệm thiếu mã cung và tiền nhiệm tự trỏ về đích. | Mỗi trường hợp phải báo lỗi dữ liệu truy vết. | Trả mã INVALID_RESULT cho cả năm trường hợp. | Đạt |

**Đối chứng độc lập.** Chạy lại bằng `node Source/tests/doi-chieu.mjs`. Phép thử bổ sung dùng Floyd–Warshall trên 500 mạng có hướng từ 1 đến 7 đỉnh. Trọng số trong đáp án được tính theo đơn vị nguyên bằng một phần mười nghìn đồng/MWh. Cả 10.224 cặp nguồn–đích đều khớp, gồm 1.328 cặp có đường đi hữu hạn, 6.034 cặp có chi phí không bị chặn dưới và 2.862 cặp không tới được.

**Thời gian ca 13.** Với Node.js v24.22.3 trong môi trường đám mây, chạy một lượt làm nóng rồi năm lượt đo, ghi nhận trung vị **14,07 ms** trong một lần chạy bộ 20 ca. Thời gian chỉ tính cuộc gọi `runBellmanFord(..., {trace: false})`, bao gồm cả xác thực đầu vào. Ngưỡng đạt của phép thử là kết quả toán học đúng. Thời gian phụ thuộc máy, phiên bản Node và tải hệ thống.

## 3. Kiểm tra sau khi ghép vào trang của nhóm

1. Chạy mạng mẫu từng bước qua e1, e2 và e3. Lùi lại một bước để kiểm tra bảng, thông báo và cạnh nổi bật cùng trở về thời điểm trước khi T nhận nhãn 6.
2. Sửa e2 thành 5, chạy lại và đối chiếu hai hình chụp cùng bố cục với bảng ở mục 1. Xác minh đường mới chỉ có e4, e3 và tổng bằng 7. Đặt lại rồi tải mẫu ban đầu.
3. Sau ca thành công, đổi sang ca 04 và 08. Kiểm tra tuyến cũ được xóa, cảnh báo phân biệt trạm cô lập với đích bị chu trình âm ảnh hưởng. Ở ca 08, chọn C để xác minh người dùng vẫn xem được lộ trình hữu hạn.
4. Ghi phiên bản của trang chính, trình duyệt và thiết bị dùng để nghiệm thu. Nếu lỗi, ghi mã ca, bước tái hiện, mong đợi, thực tế, file phụ trách và kết quả chạy lại. Các ca phía trên kiểm tra mô-đun thuật toán độc lập. Các bước trong mục này dành cho chủ trang thực hiện sau khi tích hợp.
