# Từ phí từng tuyến đến đường đi rẻ nhất

**Phiếu dựng slide và tập demo • Phan Đức Hoàng • 51.01.104.131**

Bộ [PowerPoint của Hoàng](Bellman-Ford-Phan-Duc-Hoang.pptx) có bảy slide 16:9 để ghép sau phần giới thiệu đề tài của nhóm. Mở **View → Notes** hoặc **Presenter View** để xem thông điệp, lời trình bày, cách chỉ hình, câu chuyển và thời lượng của từng slide. Thời lượng nói dự kiến là 3 phút 32 giây. Bảng demo trực tiếp phía dưới là kịch bản 7 phút cho cả nhóm. Khi demo ngay ở slide 6, tính thời gian thao tác vào phần demo một lần.

## Storyboard bảy slide

| Slide | Hình chính và cách kể | Thời gian |
|---|---|---:|
| 1. Câu hỏi S → T | Cho người xem dò ba hành trình trên mạng năm trạm trước khi biết kết quả. | 24 giây |
| 2. Mô hình hóa | Ghép hai trạm và một tuyến truyền tải với hai đỉnh B, A và cung B → A có phí 1 nghìn đồng/MWh. | 25 giây |
| 3. Nới lỏng | Theo một lần nới lỏng, rồi chỉ hai nhánh dừng. Một lượt trọn vẹn không đổi nhãn thì dừng sớm. Nếu hết số lượt mà chưa xác nhận ổn định, kiểm tra chu trình âm. | 39 giây |
| 4. Tuyến rẻ nhất ở biểu phí cơ sở | Lần theo các cung tô đậm và cộng 2 + 1 + 3. | 30 giây |
| 5. Đổi biểu phí | So hai sơ đồ cùng bố cục. Phí B→A tăng lên 5. Theo biểu phí mới, tuyến cũ tốn 10, tuyến mới tốn 7. | 31 giây |
| 6. Quan sát panel | Theo năm dấu trên ảnh chụp chương trình, từ nguồn/đích đến bảng và kết quả. | 31 giây |
| 7. Phạm vi kết quả | Giải thích ý nghĩa của số 6, bài toán cây khung và trường hợp Dijkstra có lợi thế. | 32 giây |

Các lưu đồ, đỉnh, cung, trọng số và biểu tượng trạm trong PowerPoint là các đối tượng chỉnh sửa được. Ảnh ở slide 6 chụp từ panel độc lập trên Chromium. Khi ghép vào bộ slide chung, dùng **Keep Source Formatting** để giữ màu và bố cục. HCMUE cùng tên học phần, tên Hoàng và số trang của cụm slide nằm ở chân trang.

## Đáp án đối chiếu khi diễn tập

Từ S có ba nhánh đầu tiên. B chỉ đi tiếp được sang A, A và C chỉ đi tới T. Liệt kê hết ba đường là phép kiểm chứng độc lập cho mạng mẫu này.

| Đường S → T | Khi e2 = 1 | Khi e2 = 5 |
|---|---:|---:|
| S → B → A → T | 2 + 1 + 3 = **6** | 2 + 5 + 3 = 10 |
| S → A → T | 4 + 3 = 7 | 4 + 3 = **7** |
| S → C → T | 3 + 6 = 9 | 3 + 6 = 9 |

Đã chạy trực tiếp `runBellmanFord` và `reconstructPath` với tệp `Source/data/sampleGraph.json`, chỉ sửa phí của e2 trong bộ nhớ cho lần chạy thứ hai. Theo thứ tự S, A, B, C, T, các nhãn cuối lần lượt là **[0, 3, 2, 3, 6]** và **[0, 4, 2, 3, 7]**. Hai tuyến trả về có mã cung [e1, e2, e3] và [e4, e3]. Khi đặt T làm nguồn, kết quả cho S là `unreachable`.

## Kịch bản demo trực tiếp 7 phút

Trước khi trình chiếu, nhấp phải vào `Source/hoang/demo.html` trong VS Code và chọn **Open with Live Server**. Chọn **Mạng 5 trạm · Phí cơ sở**, nguồn **S** và đích **T**. Để minh họa slide 6, nhấn **Từng bước** rồi **Tiếp** hai lần. Hàng A sẽ hiện chi phí **3**, tiền nhiệm **B**, cung **e2**.

| Thời gian | Thao tác và bàn giao lời nói | Bằng chứng trên màn hình |
|---|---|---|
| 0:00–0:45 | Người mở đầu của nhóm giới thiệu đơn vị và mục đích. Chuyển lời cho Hoàng ngay khi hiện mạng mẫu. | 5 trạm, 6 cung. B→A có phí 1. |
| 0:45–2:10 | Hoàng chọn S, T. Nhấn **Tính tuyến**, chọn **Từng bước**, nhấn **Tiếp** để xét e1, e2, e3. **Lùi** một bước rồi tiến lại. | e1 cho B = 2. e2 cho A = 3, tiền nhiệm B. e3 cho T = 6. Khi lùi qua e3, nhãn T trở về ∞. |
| 2:10–3:00 | Chạy đến cuối. Đọc tuyến từ các mã cung và kiểm nhanh với tuyến qua C. | Cung e1, e2, e3 cho tổng 6. Tuyến qua C có phí 9. Lượt 2 không cập nhật. |
| 3:00–4:40 | Chuyển sang trường hợp phí B→A bằng 5, tính lại. Cho xem cuối lượt 1 rồi xét e3 của lượt 2. | Ở lượt 1, T lần lượt nhận 10 rồi 9. Cung e4 (S → A) giảm nhãn của A từ 7 xuống 4 ngay sau lần xét e3 đầu tiên. Lượt 2 duyệt lại e3, T giảm còn 7. Lượt 3 không đổi. |
| 4:40–5:40 | Đổi nguồn thành T, đích thành S và tính lại. Chỉ mũi tên tại T. | S là đỉnh có trong mạng nhưng T không có cung đi ra. Panel báo không tới được. |
| 5:40–7:00 | Hoàng giải thích phạm vi của kết quả. Chuyển lời cho thành viên phụ trách kết luận và mời câu hỏi. | Hai kết quả 6 và 7 cùng đơn vị. Phân biệt chi phí tuyến với chi phí nối tất cả các trạm. |

Nếu thao tác lệch bước, tạm dừng, chọn đúng kịch bản ban đầu, chọn lại S và T rồi tính lại. Trước buổi bảo vệ, nhóm tập đủ thời lượng 5–10 phút trên máy sẽ trình chiếu, phân lời cho đủ các thành viên thực tế, thử chế độ toàn màn hình và lưu ảnh đối chiếu để giải thích khi cần.

## Tự bảo vệ theo ba mức

### Cơ bản

- **Vì sao được cộng phí?** Mỗi cung tính phí cho cùng 1 MWh giả định. Khi đi qua ba cung, cùng lượng tham chiếu chịu ba khoản phí. Thay đổi tọa độ trạm chỉ thay đổi hình vẽ.
- **Vì sao tối đa V−1 lượt?** Với đích có nghiệm hữu hạn, tồn tại đường tối ưu đơn với nhiều nhất V−1 cung. Sau k lượt, nếu có đường tối ưu đến một đỉnh qua nhiều nhất k cung thì đỉnh đó đã nhận nhãn tối ưu. Cập nhật tại chỗ đôi khi truyền xa hơn ngay trong một lượt.
- **Có cần Bellman–Ford khi mọi phí đều dương?** Dijkstra cũng đúng và thường nhanh hơn trên mạng thưa với hàng đợi ưu tiên. Bellman–Ford cho phép giải thích từng lượt quét và dùng lại khi thử phí ròng âm.
- **Vì sao Prim/Kruskal cho kết quả khác?** Trên đồ thị vô hướng liên thông, hai thuật toán đó tìm một cây nối tất cả các đỉnh với tổng trọng số nhỏ nhất. Ở đây ta tối thiểu tổng phí trên đường S→T của mạng có hướng. Số 6 là phí của một tuyến.

### Trung bình

- **Khi xét một cung, nhãn trên bảng thay đổi thế nào?** Trong `runBellmanFord`, đọc nhãn đầu cung, cộng phí rồi so với nhãn cuối cung. Nếu nhỏ hơn thì thay nhãn, ghi cả đỉnh trước và mã cung. Bảng của panel đọc lại các thay đổi theo thứ tự.
- **Vì sao cần mã cung nếu đã biết trạm trước?** Có thể có hai tuyến A→T với phí khác nhau. `reconstructPath` lấy cả `nodeId` và `edgeId` của từng tiền nhiệm để tô đúng cung.
- **Nếu hai tuyến đồng giá?** So sánh nhỏ hơn nghiêm ngặt giữ phương án gặp trước. Đổi thứ tự cung có thể đổi tuyến đại diện và số lần cập nhật. Chi phí tối ưu vẫn giữ nguyên.
- **Tua lùi có làm sai kết quả không?** Mỗi mục `steps` giữ giá trị và tiền nhiệm cũ, mới cho đầu nhận. Khi lùi qua e3 ở ca đầu, trả T về ∞ và tiền nhiệm rỗng. Kết quả cuối của lõi vẫn là 6.
- **Đổi đích và đổi dữ liệu khác nhau ở đâu?** Một lần chạy cho nhãn của mọi đỉnh từ cùng nguồn nên đổi đích chỉ cần truy tuyến. Đổi nguồn hoặc thay e2 làm nhãn cũ mất hiệu lực. Host truyền đồ thị mới cho `setGraph`, sau đó người dùng tính lại.

### Nâng cao

- **Cung có trọng số âm khác chu trình âm thế nào?** Một ưu đãi đơn lẻ có thể tạo phí ròng âm và vẫn cho nghiệm hữu hạn. Nếu chu trình có tổng âm, đi từ nguồn tới đó, vòng lại tùy ý rồi đi tiếp đến đích, tổng phí của hành trình không có cận dưới. Bởi vậy `findAffectedNodes` lấy các đầu nhận còn giảm được sau các lượt nới lỏng và lan theo chiều cung. Một chu trình tách biệt không ảnh hưởng nguồn đang chọn.
- **Nếu đích thiếu hoặc mạng sai?** `validateGraph` kiểm mã, đầu mút và chi phí. Nguồn lạ và đích lạ sinh lỗi riêng. Một đỉnh có thật nhưng không có đường đến thì truy tuyến trả `unreachable`, hai mảng rỗng cùng `totalCost=null`.
- **Chi phí thời gian và bộ nhớ là bao nhiêu?** Nếu có V đỉnh, E cung và P lượt quét thì phần nới lỏng tốn O(PE) thời gian, với P ≤ V − 1. Kiểm tra dữ liệu và lan ảnh hưởng cần O(V+E). Nhãn và tiền nhiệm tốn O(V), danh sách kề kiểm tra ảnh hưởng tăng bộ nhớ phụ lên O(V+E). Khi bật lịch sử, mỗi lần xét cung ghi một thay đổi kích thước hằng theo số trường, tối đa O(PE) mục. Bảng có thể phát lại mà không sao chép cả V nhãn cho từng bước. Khi đo lõi dùng `trace:false`.
- **Tuyến rẻ nhất có vận hành được ngoài thực tế không?** Kết quả xếp hạng các hành trình theo đơn giá đã cho. Đánh giá vận hành cần thêm công suất, điện áp, tổn hao, phân bố dòng và điều kiện an toàn. Chỉ có số liệu giả định trong ví dụ hiện tại.
- **Tại sao tin kết quả 7?** Yêu cầu bạn cùng nhóm đổi phí ngay trước mắt, tính tay cả ba tuyến rồi đối chiếu với tuyến trả về và mã cung. Nếu ai dự đoán 10, cho họ chỉ ra cạnh S→A phí 4 và hỏi liệu 4 + 3 có rẻ hơn không.

## Phiếu kiểm tra trước khi ghép PowerPoint

- Chạy lại bộ thử của nhánh vừa ghép. Đối chiếu hai tuyến, đơn vị, số lượt, chiều mũi tên và tiền nhiệm với kết quả trên máy trình diễn. Nếu gặp lỗi khi trình chiếu, ghi kịch bản, thao tác, kết quả mong đợi, kết quả quan sát và phiên bản đã chạy.
- Đặt ảnh trước/sau cạnh nhau, ghi chú thích cùng nguồn dữ liệu. Trong Word, người phụ trách dẫn chiếu hình, ghi tài liệu theo IEEE hoặc APA. Theo quy định đồ án, nhóm nộp slide chung, Word, hướng dẫn và video ở Document, mã ở Source và bản chạy ở Release chậm nhất ba ngày trước buổi thuyết trình.
- Nhóm duyệt lời khai báo theo yêu cầu của giảng viên. Với tài liệu này, OpenAI Codex hỗ trợ soạn kịch bản, giải thích mã và chạy phép đối chiếu. Hoàng tự chạy lại, tự diễn giải các phép so sánh và trả lời trực tiếp khi bảo vệ. Chỉ ghi nhận việc tự kiểm tra của sinh viên sau khi thực sự thực hiện.
