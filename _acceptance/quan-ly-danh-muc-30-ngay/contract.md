---
schema_version: 1
feature: Người điều phối lọc, sắp, tìm và xem theo bảng cột trên danh mục 30 ngày đầu — và bộ lọc ra không kết quả không còn đẩy họ vào ngõ cụt
slug: quan-ly-danh-muc-30-ngay
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui]
status: da-cham-boi-thuc-te
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-21T11:36:00Z
design_doc: docs/superpowers/specs/2026-09-21-quan-ly-danh-muc-30-ngay-design.md
---

# Acceptance Contract: quan-ly-danh-muc-30-ngay

## Context

Màn danh mục «30 ngày đầu» đã lên prod nhưng thiếu công cụ quản lý: lọc ra không
kết quả thì mất lối bỏ lọc, không tìm, không sắp, cắt ở 25 hàng, và không có cách
nhìn theo cột. Vòng này chuyển màn sang khung danh sách chung của kho và thêm bảng
cột chỉ để xem, với bốn cách chia chủ kho đã chọn.

Source input: `_acceptance/quan-ly-danh-muc-30-ngay/opportunity.md` (Cổng Đáng ký
«build» 2026-09-21).

## Criteria

- AC-1: Given một bộ lọc hoặc ô tìm đang bật mà không kế hoạch nào khớp, When mở danh mục ở dạng bảng hoặc bảng cột, Then màn giữ thanh lọc, hiện «Không kế hoạch nào khớp» kèm nút «Bỏ lọc», và bấm nút đó trả về danh sách không lọc mà vẫn giữ cách xem; «chưa có khuôn» hay «chưa có kế hoạch» không bao giờ hiện khi đang lọc. (cross-layer)
- AC-2: Given ba kế hoạch của ba công ty, When tìm một đoạn tên công ty khác hoa thường, Then chỉ kế hoạch khớp hiện ra và tổng số bằng đúng số khớp.
- AC-3: Given các kế hoạch có số ngày im và số bước đã xong khác nhau, When sắp theo từng khoá (tên công ty, ngày bắt đầu, số ngày im, số bước đã xong) và từng chiều, Then thứ tự đúng trên toàn tập đã lọc, không chỉ trong một trang; hai kế hoạch cùng giá trị khoá được xếp theo một thứ tự phụ cố định, nên qua các trang không kế hoạch nào lặp hay mất.
- AC-4: Given nhiều kế hoạch hơn một trang, When sang trang hai, Then thấy đúng các kế hoạch kế tiếp, tổng số bằng số kế hoạch đã lọc, không kế hoạch nào bị cắt lặng.
- AC-5: Given kế hoạch thuộc nhiều bộ phận và nhiều người cầm trịch, When lọc theo tab trạng thái (đang chạy / đã đóng), theo bộ phận đang cầm và theo người cầm trịch, Then chỉ kế hoạch khớp hiện ra, và số đếm cạnh mỗi lựa chọn lọc khớp đúng số hàng sẽ hiện nếu chọn nó.
- AC-6: Given một danh mục đã tìm, lọc, sắp, sang trang và đổi sang bảng cột với một cách chia, When tải lại màn từ chính đường dẫn đó, Then mọi lựa chọn còn nguyên.
- AC-7: Given các kế hoạch đang tắc ở những bước khác nhau và một kế hoạch đã xong mọi bước, When xem bảng cột chia theo bước đang tắc, Then mỗi nhãn bước đang tắc là một cột, kế hoạch xong mọi bước nằm ở cột «Đã xong mọi bước», và mỗi kế hoạch nằm đúng một cột.
- AC-8: Given các kế hoạch đang tắc ở bước thuộc những bộ phận khác nhau, When xem bảng cột chia theo bộ phận, Then mỗi bộ phận đang cầm là một cột, cộng cột «Đã xong mọi bước», và mỗi kế hoạch nằm đúng một cột.
- AC-9: Given các môi giới đã ghi danh đạt những bậc cao nhất khác nhau, When xem bảng cột chia theo bậc phễu, Then có năm cột theo thứ tự bậc, mỗi môi giới nằm đúng ở cột bậc cao nhất họ đã đạt, và bộ lọc kế hoạch cũng áp vào các môi giới.
- AC-10: Given kế hoạch đang chạy và kế hoạch đã đóng, When xem bảng cột chia theo trạng thái, Then có hai cột «Đang chạy» và «Đã đóng», mỗi kế hoạch nằm đúng một cột.
- AC-11: Given bảng cột ở bất kỳ cách chia nào, When người dùng thao tác, Then không có đường kéo thẻ nào đổi dữ liệu; bấm hoặc nhấn Enter trên một thẻ mở hồ sơ kế hoạch của thẻ đó.
- AC-12: Given một cột có nhiều thẻ hơn trần hiển thị trong cấu hình, When xem cột đó, Then cột hiện đúng số thẻ bằng trần, ghi «còn N thẻ» với N bằng phần còn lại, và số đếm ở tiêu đề cột bằng tổng thật.
- AC-13: Given danh mục có dữ liệu, When chụp dạng bảng và bảng cột ở cả bốn cách chia, ở khổ 1440 và 768, Then nhìn thấy trên ảnh: bảng có ô tìm và thanh lọc; mỗi bảng cột có tiêu đề cột kèm số đếm; ở khổ 768 trang không tràn ngang và chữ trên thẻ không bị cắt mất nghĩa.
- AC-14: Given số kế hoạch đã lọc nhiều hơn một trang của dạng bảng, When xem bảng cột ở bất kỳ cách chia nào, kể cả khi đường dẫn đang ở trang hai, Then tổng số đếm của các cột bằng đúng số kế hoạch đã lọc và mọi kế hoạch đều có mặt — bảng cột không phân trang.

## Coverage

- Bỏ coverage-scan — chủ kho chốt phạm vi ở Cổng Đáng (bảng cột đủ bốn cách chia, chỉ để xem); không gian được liệt kê theo hai trục đã biết — công cụ bảng (tìm · lọc · sắp · trang · đường dẫn) ở AC-2 đến AC-6, và cách chia bảng cột (bước · bộ phận · bậc · trạng thái) ở AC-7 đến AC-10 (entry `d-20260921T105822Z-1` trong `decisions.jsonl`).

## Đường đo

- Thước: bộ lọc ra không kết quả hiện «không khớp» kèm lối bỏ lọc · số từ: phép đo trên CSDL thật và màn · bảo đảm bởi: AC-1
- Thước: danh mục dùng khung bảng chung, lựa chọn nằm trong đường dẫn · số từ: phép đo · bảo đảm bởi: AC-2, AC-3, AC-4, AC-5, AC-6
- Thước: bảng cột ở cả bốn cách chia hiện đủ mọi kế hoạch, không tràn ở 768 · số từ: phép đo và ảnh · bảo đảm bởi: AC-7, AC-8, AC-9, AC-10, AC-12, AC-13, AC-14
- Thước: câu «đối tác nào đang tắc, ở bước nào, bộ phận nào đang cầm» trả lời trong một phút · số từ: bấm đồng hồ tại phiên nghiệm thu — đã có sẵn: nghi thức phiên nghiệm thu, không cần vật mới

## Out of scope

- Kéo thẻ để đổi dữ liệu — chủ kho chưa trả lời câu kéo thẻ; bảng cột chỉ để xem. Bật kéo thẻ là vòng riêng, cần bước xác nhận và đường hoàn tác.
- Góc nhìn lưu sẵn cho danh mục — góc nhìn lưu sẵn của kho chỉ hỗ trợ Công ty, Cá nhân, Thoả thuận qua một enum trong lược đồ; thêm kế hoạch là đổi lược đồ (hạng T3). Cách xem và bộ lọc vẫn nằm trong đường dẫn nên gửi link giữ nguyên góc nhìn.
- Bảng cột cho Thoả thuận hay màn khác — thành phần dùng lại được, nhưng áp vào màn khác là ô riêng.
- Hạn chế khác của hồ sơ trước không nằm trên màn danh mục (điểm nhận, hồ sơ kế hoạch, cài đặt).

## Notes

- Bảng cột chỉ để xem là giả định an toàn máy ghi ở Cổng Đáng vì câu kéo thẻ chưa được trả lời; chủ kho có thể phủ quyết.
- Số ngày im và số bước đã xong là giá trị tính từ các bước, nên máy chủ tải trọn tập đã lọc rồi mới sắp và cắt trang. Ổn với cỡ vài trăm kế hoạch; nếu cỡ vượt xa, cần lưu sẵn hai giá trị đó.

Known limits — chấp nhận tại Cổng Bằng chứng 2026-09-21 (Phan Le Manh), từ các mục ngoài hợp đồng của S4:

- Ngoài-1: khoá cột «Đã xong mọi bước» và danh sách năm bậc phễu được chép hai nơi (máy chủ và màn); sửa một nơi mà quên nơi kia thì cột có thể hiện nhãn trống hoặc sai, dù các phép kiểm vẫn xanh.
- Ngoài-2: bài kiểm chưa đưa kết quả thật của bảng cột vào màn để kiểm nhãn cột «Đã xong mọi bước» người dùng thấy; nhãn đó sai thì người dùng có thể thấy trước.
- Ngoài-3: bằng chứng «không lỗi mạng» của ảnh chụp E13 chỉ là một câu viết sẵn, không kèm số request đã quan sát.
- Ngoài-4: mỗi lần mở, lọc hay tìm, máy chủ nạp lại toàn bộ kế hoạch thay vì chỉ phần cần xem; chậm dần khi danh mục lớn.
- Ngoài-5: bảng cột tải lỗi (mất mạng, máy chủ lỗi) thì khung chờ quay mãi, không có thông báo lỗi hay nút thử lại.
- Ngoài-6: ngay sau khi đổi cách chia cột, nhãn và số đếm của cột cũ có thể bị gán nhầm vài giây trước khi dữ liệu mới về.
- Ngoài-7: vế màn của E1 và E12 dựng màn từ kế hoạch mẫu viết tay trong bài kiểm (qua đúng phép tính của thủ tục), không từ kết quả truy vấn cơ sở dữ liệu thật.
