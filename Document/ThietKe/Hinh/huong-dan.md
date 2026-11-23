# Chỉnh hình cho panel và phần trình bày

Mở [sơ đồ của Hoàng](so-do-hoang.drawio) trong diagrams.net bằng File → Open From → Device. Sáu trang dùng các đối tượng và đầu nối có thể chọn riêng. Bản phác này được dựng bằng mã để Hoàng tiếp tục biên tập. Đồ thị SVG trong chương trình được vẽ từ dữ liệu của lần chạy.

1. Trong **Kiến trúc**, chọn từng mũi tên để kiểm tra tên dữ liệu truyền giữa lõi và panel. Nếu vẽ lại, dùng hình chữ nhật bo góc cho module, gắn hai đầu mũi tên vào viền module, nhấp đúp đường nối để ghi tham số.
2. Trong **Lưu đồ**, đặt hình thoi cho điều kiện, ghi “đủ/chưa” và “có/không” ở nhánh ra. Lần theo các mũi tên với ca một đỉnh và ca chu trình âm để kiểm tra hướng đường quay lại.
3. Trong **Mockup**, kéo các vùng chọn trạm, đồ thị, điều khiển, bảng và kết quả theo kích cỡ máy chiếu. Nhân đôi trang để làm bản khung hẹp, xếp bảng sau sơ đồ. Gửi ảnh xem trước cho người giữ CSS.
4. Trong **Trước khi đổi phí** và **Sau khi đổi phí**, đối chiếu e2 với JSON. Chọn mũi tên B→A và sửa phí khi biểu diễn ca mới. Chọn các cung thuộc tuyến tối ưu, tăng độ dày nét, cập nhật phép cộng ở cuối hình. Nét dày cho phép đọc cả khi in đen trắng.
5. Trong **Ký hiệu**, chọn hình trạm cần dùng. Vào File → Export as → SVG hoặc PNG, bật Selection only để xuất riêng biểu tượng. Lưu bản gốc trong thư mục này. Đặt hình dành cho thuyết trình cạnh nội dung slide của Hoàng.
6. Chụp riêng **ảnh thực nghiệm** khi chạy panel với bộ dữ liệu phí giả định trong repo. Đặt dưới ảnh mã ca, nguồn/đích, chi phí e2, tuyến tìm được và đơn vị nghìn đồng/MWh. Phân biệt ảnh chụp này với sơ đồ thuyết minh tĩnh khi ghi chú hình.
