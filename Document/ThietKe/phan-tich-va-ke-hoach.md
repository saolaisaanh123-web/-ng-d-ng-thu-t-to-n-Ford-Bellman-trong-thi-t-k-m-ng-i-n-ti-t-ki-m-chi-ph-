# Phần thiết kế của Phan Đức Hoàng · 51.01.104.131

**Ứng dụng thuật toán Ford–Bellman trong thiết kế mạng điện tiết kiệm chi phí**
Tài liệu khảo sát ban đầu, lưu để đối chiếu quy định và lịch sử thiết kế. Mạng bốn trạm và phân công theo tệp bên dưới thuộc đề xuất ban đầu. Khi chạy thử, ghép code hoặc làm slide, dùng [hợp đồng hiện hành](hop-dong.md), [mạng năm trạm đã kiểm chứng](kiem-thu.md) và [kịch bản thuyết trình cập nhật](../Slides/hoang-demo.md).

## 1. Đối chiếu ba tài liệu

| Căn cứ | Nội dung đã đối chiếu | Áp dụng |
|---|---|---|
| *Quy định thực hiện đồ án Lý thuyết đồ thị*, mục 1–2, trang 1 | Cho phép JavaScript, VS Code. Soạn bằng Word, giấy A4, Unicode Times New Roman 13 pt cho thân bài, tiêu đề có thể khác. Giãn dòng 1,5. Lề trên 3 cm, dưới 3,5 cm, trái 3,5 cm, phải 2 cm. Số trang giữa chân trang. Với bảng ngang, đầu bảng nằm phía lề trái. Đánh số chương bằng số Ả Rập và phân cấp như 2.1, 2.1.1. Dùng chuẩn trích dẫn khoa học như APA hoặc IEEE. | Thành viên phụ trách Word kiểm tra các section sau khi ghép. Hoàng bàn giao hình có chú thích, bảng có đơn vị và nguồn. |
| Cùng quy định, mục 3–4, trang 1–2 | Nộp link GitHub hoặc Google Drive. Document chứa báo cáo Word, slide, hướng dẫn sử dụng và video thuyết trình nhóm. Source chứa mã nguồn. Release chứa bản cài đặt hoặc bản thực thi. Hạn cuối là 3 ngày trước buổi thuyết trình, lịch dự kiến buổi học cuối và có thể đổi theo thông báo lớp. Có thể tham khảo code, cấm chép nguyên văn. Quy định nêu đề tài bị 0 điểm nếu không hiểu và không trả lời được câu hỏi về code. | Chốt ngày cụ thể khi lớp có lịch. Với web tĩnh, đề xuất bàn giao bản chạy đã thử trên máy sạch cùng lệnh mở, xác nhận hình thức Release với giảng viên. |
| *TL_Mau tieu luandocx.docx* | Bìa chính, bìa phụ có học phần, người thực hiện, MSSV và giảng viên, tiếp theo là mục lục, nhiệm vụ từng người, danh mục ký hiệu, bảng và hình. Mở đầu gồm lý do, mục tiêu và nhiệm vụ, đối tượng và phạm vi, phương pháp, kết cấu. Mẫu yêu cầu chương kết luận, sau đó là tài liệu tham khảo. | Giữ bố cục. Cả năm section trong tệp mẫu đặt lề trái khoảng 3 cm, lề dưới khoảng 2–2,5 cm. Chỉnh theo PDF chính thức. Thay nội dung minh họa, mã lớp, năm và tên người hướng dẫn bằng thông tin đã xác nhận. |
| *Mẫu báo cáo đồ án cuối kỳ*, nhóm Yakult, 45 trang PDF | Năm chương đi từ cơ sở lý thuyết, bài toán, mô hình, áp dụng đến kết luận. Theo số trang **in trên báo cáo**, Bảng 2.1 tr. 13 ánh xạ thực tế sang đồ thị, Bảng 4.1 tr. 24 nối thuật toán với chức năng, Hình 4.3–4.11 tr. 25–29 ghi lại thao tác và kết quả. Ví dụ tr. 29 xóa ba tuyến, quan sát hai thành phần liên thông. | Học cách chứng minh qua chuỗi dữ liệu → thao tác → kết quả. Với Hoàng, mỗi ảnh ghi nguồn, đích, đơn vị, mã ca và phép cộng đối chiếu. Điểm 10 là thông tin người cung cấp thuật lại. |
| Lưu ý của giảng viên do Hoàng cung cấp | Trực quan hóa, liên hệ thực tế, chức năng có ích, hỏi được lý do chọn thuật toán, ít code trên Word/PPT, kiểm tra dấu câu, demo thật 5–10 phút, mọi thành viên tham gia và hiểu hệ thống, tự trả lời khi bảo vệ. | Dùng làm tiêu chí tập dượt. Ghi đúng phạm vi hỗ trợ của AI theo hướng dẫn học thuật của giảng viên. Bản thiết kế này có sự hỗ trợ của OpenAI Codex. |

**Chi tiết cần kiểm tra khi học từ bài mẫu.** Ở trang in 10, câu giới thiệu bản đồ dẫn “Hình 1.9”, trong khi bản đồ mang số 1.13 và hình 1.9 ở trang 7 là mã giả Dijkstra. Bảng ánh xạ trang 13 dùng trọng số cho chiều dài hoặc chi phí. Muốn so sánh hai tuyến của đồ án này, hai tổng phải cùng đơn vị. Nhóm mẫu dùng Kruskal cho đầu tư toàn mạng và Dijkstra cho một bài toán định tuyến. Kết quả của họ thuộc các mục tiêu đó.

## 2. Giả thuyết để bảo vệ đề tài

Câu hỏi thực nghiệm là “Với danh sách tuyến được phép dùng, vận chuyển một lượng điện quy ước 1 MWh từ S đến T theo tuyến nào có tổng phí nhỏ nhất?”. Mỗi đỉnh đại diện một trạm, mỗi cung đại diện một lựa chọn chuyển tiếp. Đề xuất dùng phí vận hành giả định tính bằng **nghìn đồng cho cùng một lượt 1 MWh**. Giả định phí cộng được qua các chặng, tuyến khả dụng trong suốt lượt tính. Không có dữ liệu biểu giá hay số đo vận hành trong repo. Chế độ thông thường dùng số không âm. Kịch bản ưu đãi riêng cho phép phí ròng âm theo chiều, đánh dấu rõ là giả định kinh tế.

Bellman–Ford phù hợp vì cùng một module có thể tính từ một nguồn, dựng lại tuyến, minh họa nới lỏng và nhận biết chu trình âm tới được. Với mọi trọng số không âm và cần tốc độ, Dijkstra dùng hàng đợi ưu tiên thường thích hợp hơn. Tổng chi phí mua hoặc xây dây để nối tất cả trạm là mục tiêu cây khung nhỏ nhất trên mạng vô hướng liên thông khi chỉ tính chi phí xây các cạnh. Có thể dùng Prim hoặc Kruskal. Ví dụ tam giác vô hướng SA = 2, ST = 2, AT = 1. Hai đường rẻ nhất từ S đến A và T dùng hai cạnh có tổng 4. Một cây khung dùng SA và AT có tổng 3. Mọi con số trong ví dụ là chi phí quy ước.

Kết quả chỉ xếp hạng các tuyến trong mô hình. Thiết kế lưới thực cần xét công suất, phân bố dòng, điện áp, tổn thất, an toàn và nhiều phụ tải đồng thời. Khoản tiết kiệm khi trình bày phải nêu tuyến đối chứng, cùng nguồn, đích, bảng phí và lượng quy ước. Khi biểu giá thay đổi, việc chi phí tối ưu tăng từ 6 lên 7 thể hiện tác động của thay đổi biểu giá.

## 3. Phạm vi bàn giao

| Thành viên trong bảng do Hoàng cung cấp | Nhiệm vụ đã nêu | Ranh giới đề xuất để phối hợp |
|---|---|---|
| Phan Đức Hoàng | Thuật toán, HTML, PPT | Lõi tính đường đi, phục hồi theo mã cạnh, ca kiểm thử và panel mô phỏng. Chuẩn bị cụm slide thuật toán và thực nghiệm. |
| Đoàn Viễn Phương | Thuật toán, HTML, Word | Thảo luận quyền sở hữu trang chính và bộ nhập dữ liệu. Nhận sơ đồ, dữ liệu, lời giải thích để tích hợp báo cáo. |
| Nguyễn Phú | Thuật toán, CSS, Word | Trao đổi về trạng thái đồ thị, ký hiệu và cách đối chiếu kết quả. Nhận bảng thực nghiệm phục vụ Word. |
| Trần Chí Minh Tân | Thuật toán, CSS, PPT | Thỏa thuận kích cỡ panel, bộ ký hiệu trạng thái, master slide, thứ tự và điểm chuyển lời giữa hai người. |

Ghi chú khác nói có năm thành viên. Dùng bốn tên trên để trao đổi phạm vi hiện có. Chờ danh sách thực tế trước khi điền người thứ năm, phân lịch hoặc thời lượng nói. Mỗi file có một người tích hợp tại một thời điểm. Phần phân công chi tiết dưới đây là đề nghị để các bạn phản hồi.

## 4. Hợp đồng cần nhóm duyệt

Chốt cách truyền đồ thị, quy tắc chọn tuyến khi hòa, trạng thái cho từng đích, mã cạnh để vẽ, biên HTML và chủ sở hữu file trước khi ghép. [Bản đề xuất hợp đồng tích hợp](hop-dong.md)

## 5. Trình tự thực hiện sau khi duyệt

| Giai đoạn | Hoàng làm trước | Làm song song và phụ thuộc | Điều kiện chuyển bước |
|---|---|---|---|
| Thiết kế | Đối chiếu tài liệu, duyệt schema bằng một ví dụ thường và một chu trình âm | Phương rà đầu vào, Phú/Tân góp ý bố cục, Tân duyệt phạm vi slide | Nhóm xác nhận đơn vị, kiểu đồ thị, API và người giữ từng file |
| Lõi | Viết kiểm tra dữ liệu, nới lỏng, phát hiện đích bị ảnh hưởng, truy vết | Có thể chạy kiểm thử độc lập với HTML | Tất cả ca thuật toán có kết quả thực tế đối chiếu kỳ vọng |
| HTML | Dựng panel ngữ nghĩa theo wireframe và ID đã chốt | Thành viên CSS dùng cùng các móc DOM và dữ liệu mẫu | Dùng bàn phím được, nhãn rõ, bảng và chú giải đọc được khi chưa có CSS |
| Tích hợp | Nối nguồn dữ liệu với bộ điều khiển, ghép panel vào trang chính | Cần shell của Phương và CSS nhóm để nghiệm thu sản phẩm chung | Mỗi thao tác sửa mạng làm hết hiệu lực kết quả cũ, nút đặt lại về bước đầu và thao tác nạp lại khôi phục đúng mạng mẫu |
| Thực nghiệm | Chạy ca trước/sau và trường hợp đặc biệt, lưu số liệu và ảnh | Người viết Word dùng đúng mã ca, chú thích, nguồn | Kết quả khớp phép tính độc lập, ảnh và bảng cùng bộ dữ liệu |
| PPT và bàn giao | Viết slide trong master đã thống nhất, tập demo và phản biện | Tân ghép slide, cả nhóm kiểm tra bản phát hành | Chạy lại từ bản sạch, đúng khung 5–10 phút, nhóm tự trình bày |

## 6. Hình cần thiết kế

| Tư liệu | Thao tác trực tiếp đề xuất | Điểm kiểm tra |
|---|---|---|
| Mockup panel | Trong diagrams.net hoặc PowerPoint, chia khung thành vùng chọn S/T và điều khiển, sơ đồ ở giữa, bảng khoảng cách và kết quả bên dưới. Vẽ thêm phiên bản màn hình hẹp xếp dọc. | Có vị trí riêng cho cảnh báo và chú giải. Duyệt cùng người làm CSS trước khi đặt HTML. |
| Sơ đồ mạng tĩnh | Vẽ S bên trái, B và A ở hai hàng giữa, T bên phải. Gắn mũi tên và số cho từng cung theo ca 02 và 03 trong bảng kiểm thử. Nhân đôi hình, đánh dấu lần lượt hai tuyến trước và sau khi sửa. | Dùng nét đậm và ký hiệu bên cạnh màu. Phân biệt sơ đồ thuyết minh với ảnh chụp ứng dụng. |
| Lưu đồ thuật toán | Dùng hình thoi cho điều kiện cập nhật, còn vòng, còn thay đổi và còn cạnh có thể cải thiện từ nguồn. Nối nhánh cuối với bước lan ảnh hưởng rồi truy vết theo đích. | Nét quay lại ứng với quét cạnh hoặc lượt kế tiếp, kết thúc sớm vẫn dẫn đến kết quả đúng. |
| Ảnh thực nghiệm | Khi có ứng dụng, chụp cùng tỉ lệ ở trạng thái đầu, lần giảm d[A], tuyến cuối và trạng thái sau đổi phí. | Ghi mã dữ liệu, đơn vị và chú thích. Dùng ảnh của bản chạy thật trong slide và Word. |

Đề nghị lưu bản chỉnh sửa tại `Document/ThietKe/Hinh/`, bản xuất SVG/PNG dùng trong web tại `Source/assets/`. Bảng trên là đặc tả để người thực hiện vẽ và duyệt. Đồ thị tương tác sau này lấy tọa độ và kết quả từ dữ liệu.

## 7. Danh sách chức năng và tiêu chí

| Mức | Chức năng và dữ liệu | Người thực hiện đề xuất | Nghiệm thu |
|---|---|---|---|
| Cốt lõi | Nạp mạng mẫu, chọn S/T, tính chi phí, dựng đường, thông báo đích không tới được hoặc có chi phí không bị chặn dưới | Hoàng phụ trách tính toán và panel | Dữ liệu trong bảng kiểm thử cho đúng trạng thái, tuyến, tổng phí |
| Cốt lõi khi ghép | Thêm trạm, thêm tuyến, nhập và sửa phí | Chốt người giữ bộ nhập với Phương. Hoàng cung cấp kiểm tra và ví dụ | ID trùng, chi phí rỗng, đầu cạnh sai bị báo đúng trường. Đổi phí chạy lại được |
| Nên có | Tiếp/lùi, chạy/tạm dừng, chỉnh tốc độ, đặt lại, bảng khoảng cách và tiền nhiệm, đánh dấu cạnh | Hoàng làm điều khiển panel, phối hợp CSS | Tạm dừng giữ nguyên bước, lùi rồi tiến cho cùng bảng. Trạng thái có cả chữ và nét |
| Mở rộng ưu tiên | Đổi một chi phí rồi so hai kết quả hoặc khóa một tuyến | Hoàng cung cấp cặp dữ liệu, nhóm duyệt phần nhập/so sánh | Đổi đúng một trường, công bố cả tuyến và tổng trước/sau, khôi phục mẫu được |
| Để nhóm cân nhắc | Nhập/xuất tệp, xuất ảnh hoặc so nhiều thuật toán | Chưa phân công | Chỉ bổ sung sau khi kiểm tra tính đúng, có tiêu chí riêng và người phụ trách |

## 8. Dữ liệu kiểm chứng

Bắt đầu bằng ca một đỉnh và ví dụ bốn trạm, tiếp theo là đỉnh cô lập, chi phí bằng nhau, cạnh 0, trọng số âm, cạnh song song, dữ liệu lỗi và đồ thị lớn. Ghi kết quả thực tế từ lệnh chạy khi module đã có. [Đặc tả ca kiểm thử](kiem-thu.md)

## 9. Cụm slide và demo dành cho Hoàng

Đề xuất với Tân bốn slide trong cùng bản trình chiếu. (1) Sơ đồ bốn trạm kèm đơn vị và câu hỏi S→T. (2) Một bước giảm d[A] từ 4 xuống 3 với mũi tên qua B và phép cộng 2 + 1. (3) Ghép hai ảnh trước/sau, chỉ thay phí B→A và giải thích vì sao tuyến đổi. (4) Minh họa nhánh có chu trình âm và nêu giới hạn vật lý. Giao lại cho Tân ở slide tổng kết chung. Tư liệu cho Word gồm sơ đồ, mã giả ngắn, bảng kỳ vọng/thực tế, ảnh số liệu và đường dẫn tới phiên bản chạy.

**Kịch bản 6 phút dự kiến.** 0:00–0:45 xác định S/T và đơn vị. 0:45–2:15 nạp mẫu, bước tới lúc A nhận nhãn 3, chỉ rõ cạnh tiền nhiệm. 2:15–3:00 dựng tuyến S→B→A→T, cộng 2 + 1 + 3 = 6. 3:00–4:15 đổi phí B→A thành 5, chạy lại được S→A→T với 4 + 3 = 7. 4:15–5:15 minh họa đích cô lập hoặc chu trình âm giả định theo bảng ca. 5:15–6:00 đặt lại, nhắc phạm vi tối ưu và chuyển lời. Dự phòng bằng bộ dữ liệu gốc đi kèm và bản chạy cục bộ đã thử trước buổi bảo vệ.

| Mức phản biện | Câu hỏi để Hoàng tự luyện | Điểm cần giải thích bằng ví dụ |
|---|---|---|
| Cơ bản | Vì sao cần tối đa V−1 lượt? Khi nào dừng sớm? | Một đích có tối ưu hữu hạn có đường đơn tối ưu dài tối đa V−1 cạnh. Sau một lượt quét toàn bộ cung mà không đổi nhãn, mọi bất đẳng thức nới lỏng đều đã thỏa. |
| Cơ bản | “Tiết kiệm” so với cái gì? | Cùng biểu phí gốc, tuyến S→A→T tốn 7 và tuyến S→B→A→T tốn 6. Chênh 1 nghìn đồng cho lượt quy ước. |
| Trung bình | Đổi đích và đổi chi phí có cùng cách xử lý? | Đổi đích chỉ truy vết từ kết quả một nguồn. Đổi phí làm mất hiệu lực toàn bộ kết quả và lịch sử phụ thuộc dữ liệu cũ. |
| Trung bình | Vì sao lưu cả mã cạnh và đỉnh trước? | Hai cung cùng đầu mút có thể có phí khác nhau. Mã cạnh giúp vẽ và cộng lại đúng tuyến đã chọn. |
| Nâng cao | Vì sao chu trình âm chỉ làm một số đích mất tối ưu? | Phải đi từ nguồn tới chu trình, lặp được tùy ý rồi đi tiếp được tới đích. Đỉnh ở nhánh khác vẫn có thể có tối ưu hữu hạn. |
| Nâng cao | Nếu mọi phí đều dương, vì sao trình diễn Bellman–Ford? | Dijkstra dùng được cho ca thường. Mục tiêu học thuật còn gồm cơ chế nới lỏng và kịch bản phí ròng âm. So sánh với cây khung bằng tam giác ở mục 2. |

## 10. Checklist nghiệm thu cho giai đoạn triển khai

- [ ] Nhóm xác nhận quyền sở hữu, đơn vị, API, nhánh và danh sách người trình bày. Chốt lịch nộp từ lịch thực tế.
- [ ] Chạy ca thuật toán, so kết quả tay/đối chứng, ghi phiên bản, đầu vào, kỳ vọng, thực tế, kết luận. Lỗi ghi cả bước tái hiện, nguyên nhân sau chẩn đoán, file phụ trách và lần chạy lại.
- [ ] Kiểm tra DOM, trạng thái bận/lỗi, khôi phục dữ liệu, số tiền, đúng mã cạnh, hoạt ảnh và khả năng sử dụng bàn phím. Thử ở màn hình hẹp và máy chiếu.
- [ ] So diff trước ghép. Sau ghép chạy lại test và demo từ checkout sạch trên máy hoặc trình duyệt khác. Ghi tên phiên bản và kết quả.
- [ ] Đối chiếu phép tính, mã ca và ảnh giữa ứng dụng, Word và PPT. Kiểm tra dấu câu, đánh số đề mục, tiêu đề bảng, chú thích và dẫn chiếu hình, tính nhất quán thuật ngữ, nguồn trích dẫn, nội dung lặp, kết luận và khai báo hỗ trợ AI.
- [ ] Ghép slide với Tân, kiểm tra hình sau khi chiếu, bấm giờ demo thật, luyện trả lời độc lập. Kiểm tra đủ bốn loại tệp trong Document, Source và bản chạy trong Release trước khi nộp.
