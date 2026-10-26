# Review findings: thu-paths-e15-giai-doan (round 5)

## Trong hợp đồng

Không có finding nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hằng số đơn vị và độ dài cắt đặt tại chỗ, không nằm trong cấu hình THONG_BAO.day**
  Người dùng thấy gì: Chỉ là cách đặt con số trong mã của tính năng đẩy thông báo; người dùng không thấy khác biệt nào. Khi cần chỉnh độ dài lời báo lỗi, người sửa phải tìm ở hai nơi.
  Căn cứ: Hậu quả với người dùng gần như bằng không, không mất dữ liệu, và dọn lại sau này rẻ nên ghi lại để tính năng đó tự xử lý.
  file: `apps/agent/agent/lib/thong-bao-day.ts`
  severity: low
  Đề xuất: known-limits

- **Trạng thái «Kara đang xếp» hiện bằng thẻ <p> trần, không qua bộ trạng thái chung của Kara**
  Người dùng thấy gì: Khi Kara đang soạn tóm tắt tuần, màn chỉ hiện một dòng chữ thường thay vì chỉ báo đang làm việc quen thuộc, nên người dùng đọc màn hình bằng giọng nói không biết là còn đang chờ.
  Căn cứ: Ảnh hưởng nhẹ và chỉ ở một trạng thái chờ ngắn; người dùng tải lại là thấy kết quả, và việc này đã được ghi nhận từ hồ sơ riêng của màn đó.
  file: `apps/app/app/(app)/[slug]/okr/khoi-tom-tat.tsx`
  severity: low
  Đề xuất: known-limits

- **Cách chọn lần cập nhật cuối của KR được viết lại lần thứ hai, và hai bản chọn khác nhau khi trùng giờ**
  Người dùng thấy gì: Hiếm khi hai lần cập nhật KR trùng đúng giờ; khi đó hộp cập nhật có thể hiện hai mức tự tin khác nhau cho cùng một «lần trước».
  Căn cứ: Chỉ xảy ra khi hai bản ghi trùng thời điểm, không mất dữ liệu, số liệu thật không đổi và sửa gộp hai chỗ về một hàm là rẻ nhưng không gấp.
  file: `apps/app/app/(app)/[slug]/okr/lan-truoc-kr.ts`
  severity: low
  Đề xuất: known-limits

- **Dấu «đã xanh» của hook gắn cho sha được đẩy, trong khi năm bước chạy trên cây làm việc, có thể bẩn hoặc là nhánh khác**
  Người dùng thấy gì: Trong một số cách đẩy nhánh, máy có thể ghi nhận nhầm rằng một phiên bản mã đã qua đủ bước kiểm, rồi bỏ các bước đó cho những lần đẩy sau trong 14 ngày. Một lỗi có thể lọt qua mà không ai chạy kiểm thật.
  Căn cứ: Hậu quả vừa phải vì chỉ làm mất một lớp bảo vệ chứ không hỏng dữ liệu, và CI vẫn còn là lớp sau; nhưng nó kéo dài nhiều ngày nên đáng một việc riêng.
  file: `scripts/verify-gate-shape.mjs`
  severity: medium
  Đề xuất: new-contract

- **Nguồn CI coi check-run xanh trên head sha là bằng chứng cho cây của head, nhưng CI pull_request kiểm commit gộp với nhánh đích**
  Người dùng thấy gì: Màu xanh của CI có thể là của bản đã gộp với nhánh chính chứ không phải của chính nhánh đang đẩy, nên máy có thể bỏ kiểm một nhánh mà thực tế chưa ai chạy kiểm đúng nó.
  Căn cứ: Một lỗi chỉ lộ ra khi tách khỏi nhánh chính có thể lọt qua, người dùng cuối chỉ gặp khi nó đã được gộp; sửa cần quyết định về cách tin CI nên làm thành việc riêng.
  file: `scripts/pre-push-da-chung.mjs`
  severity: medium
  Đề xuất: new-contract

- **Đẩy sự kiện ra Zalo/Slack: bị ngắt giữa lúc giữ hàng và lúc gửi thì thông báo mất lặng lẽ, không thử lại, không ghi lỗi**
  Người dùng thấy gì: Nếu tiến trình gửi bị ngắt đúng lúc, một thông báo gửi tới Zalo hoặc Slack có thể mất hẳn mà không ai biết, vì hệ thống không thử lại và không ghi lại là đã lỡ.
  Căn cứ: Người dùng mất một thông báo mà không thể tự lấy lại, nhưng chỉ xảy ra khi bị ngắt đúng khoảng ngắn và dữ liệu gốc vẫn còn; sửa cần thiết kế lại trạng thái gửi nên là việc riêng.
  file: `apps/agent/agent/lib/thong-bao-day.ts`
  severity: low
  Đề xuất: new-contract

- **Hình dạng 3 — lời hứa là QUAN HỆ (tin sau khi tắt A so với tin trước khi tắt), nhưng bài kiểm so với đáp án do chính đường sản xuất dựng ra**
  Người dùng thấy gì: Bài kiểm chưa chứng minh được rằng khi tắt một kênh, chữ của tin buổi sáng cho các kênh còn lại giữ nguyên; nếu sản phẩm đổi chữ ở đó thì bài vẫn báo xanh.
  Căn cứ: Người dùng chưa bị ảnh hưởng và không mất dữ liệu, chỉ là lưới bắt lỗi thủng một chỗ; việc này thuộc hồ sơ khác nên cần việc riêng để siết bài kiểm.
  file: `apps/agent/test/thong-bao-kenh.integration.spec.ts`
  severity: medium
  Đề xuất: new-contract

⚠ Cụm ngoài vùng phủ: 7/7 lỗi rơi vào file không bộ đo nào phủ (apps/agent/agent/lib/thong-bao-day.ts, apps/app/app/(app)/[slug]/okr/khoi-tom-tat.tsx, apps/app/app/(app)/[slug]/okr/lan-truoc-kr.ts, scripts/verify-gate-shape.mjs, scripts/pre-push-da-chung.mjs, apps/agent/test/thong-bao-kenh.integration.spec.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
