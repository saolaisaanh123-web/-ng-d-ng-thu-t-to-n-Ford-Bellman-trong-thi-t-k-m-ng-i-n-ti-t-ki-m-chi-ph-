# Hợp đồng tích hợp phần Phan Đức Hoàng

Bản triển khai dùng HTML5, CSS của panel, ES modules và SVG, chạy bằng HTTP tĩnh. Repo trước khi triển khai có README, .gitignore và ba tài liệu thiết kế. Yêu cầu mới thay ví dụ bốn trạm và tên trường đề xuất ở bản đầu.

| Dữ liệu | Ràng buộc |
|---|---|
| directed, nodes | directed luôn là true. Ít nhất một trạm, id là chuỗi khác rỗng, duy nhất trong tập đỉnh, không có khoảng trắng thừa ở hai đầu. label, x, y là thông tin hiển thị tùy chọn. |
| edges | id duy nhất trong tập cạnh, from/to là ID trạm tồn tại. cost là số hữu hạn theo nghìn đồng/MWh. Cho phép số thập phân, khuyên, cung song song. Hai chiều dùng hai cung riêng. |
| costModel | Tùy chọn, mặc định operating cho phí không âm. Dùng net khi minh họa phí ròng sau ưu đãi có thể âm. |

Mạng Source/data/sampleGraph.json có năm trạm S,A,B,C,T. Theo thứ tự quét e1=S→B(2), e2=B→A(1), e3=A→T(3), e4=S→A(4), e5=S→C(3), e6=C→T(6). Ca hai chỉ đổi e2 thành 5. Tọa độ phục vụ vẽ. Mô hình xếp hạng tuyến cho một lượng điện tham chiếu 1 MWh. Đầu tư để nối mọi trạm là bài toán khác. Mô hình chưa xét công suất, điện áp, tổn thất và phân bố dòng.

| Hàm xuất | Đầu ra |
|---|---|
| validateGraph(graph) | {ok, issues}. Mỗi issue gồm code, field, message tiếng Việt. |
| runBellmanFord(graph, sourceId, {trace=true}={}) | {sourceId, distances, predecessors, status, steps, negativeCycle, affectedNodes, passes}. Ba Map distances, predecessors và status có khóa ID. Mỗi tiền nhiệm là {nodeId,edgeId} hoặc null. negativeCycle là boolean chỉ chu trình âm tới được từ nguồn. affectedNodes là Set đích bị ảnh hưởng. passes đếm lượt nới lỏng đầy đủ. |
| reconstructPath(result,targetId) | {status,nodeIds,edgeIds,totalCost}. finite trả tuyến theo chiều đi và chi phí. unreachable và unbounded trả hai mảng rỗng, totalCost=null. |
| mountPanel(root,graph) | Sau khi host nạp panel.html, gắn hành vi vào root. Trả {setGraph(nextGraph),destroy()}. Thay mạng làm hết hiệu lực kết quả cũ. destroy dừng timer và gỡ sự kiện. |

Ba hàm đầu xuất từ Source/hoang/bellmanFord.mjs, hàm cuối từ Source/hoang/panel.mjs. Lỗi có code và message, INVALID_GRAPH kèm issues. Các lỗi khác gồm UNKNOWN_SOURCE, UNKNOWN_TARGET, COST_OUT_OF_RANGE nếu cộng hai số hữu hạn bị tràn. INVALID_RESULT bảo vệ thao tác truy vết khi truyền vào chuỗi tiền nhiệm bị hỏng. Phép tính dùng Number của JavaScript với giới hạn chính xác dấu phẩy động.

distances dùng +Infinity cho unreachable, −Infinity cho unbounded. Với chi phí bằng nhau giữ tuyến tìm trước. Mỗi bước gồm pass,edgeId,from,to,outcome,oldDistance,newDistance,oldPredecessor,newPredecessor,message. outcome nhận updated, unchanged hoặc skipped. Phát lại từ nhãn khởi tạo bằng giá trị mới, tua lùi bằng giá trị cũ. Màn hình kết thúc dùng nhãn và trạng thái sau kiểm tra chu trình âm. Tắt trace khi đo tốc độ.

Panel dùng ID tiền tố bf-, bộ vẽ đánh dấu data-edge-id. Đổi đích dùng lại kết quả cùng nguồn, đổi nguồn hoặc đổi phí xóa tiến trình cũ. Nhóm sở hữu trang chính chèn một panel và gọi setGraph khi dữ liệu đổi. Trang thử riêng dùng chung module với điểm ghép.
