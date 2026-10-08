---
schema_version: 1
slug: khung-ban-ghi-kara
feature: «Kara trong hồ sơ bản ghi có một khung chung»
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-07T13:13:50Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: K4
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

Mở từ hàng K4 của «OKR» (`docs/plan/lo-trinh-okr.json`), dãy P2 của đợt `sau-14-10`. Gốc quyết định:
chủ kho chốt 04/10 thứ tự lượt Kara 0 → 1 → 2 → 3, «lượt 4 (khung bản ghi) song song khi chủ kho duyệt
bố cục». K1 `bo-xuong-kara` (#258) đã gộp nên sáu khối Kara đã có trong `packages/ui`. Đợt `sau-14-10`
xếp K4 đầu dãy P2 và ngân sách mô hình cho K4 đã nạp 07/10. Chủ kho ký `build` cho K4 cùng 15 hàng khác của
đợt lúc 2026-10-07T13:13:50Z («Ký build cả 16 hàng», luật 16 của LUAT.md đợt); ngưỡng dưới đây do máy soạn và
được giữ nguyên khi ký.

Nguồn: `.acceptance-runs/dieu-phoi-1410/nguon/lai-thu-prod-0410/` (`bao-cao.md` mục P1–P2,
`khao-sat-dong-nhat.md` mục 1–6), Ngoài-1/2 của `hop-thoai-giu-cho-dang-nhap` (sổ
d-20260927T053525Z, «tách thành hợp đồng mới»).

## Vấn đề & ai gặp

«Kara trong hồ sơ bản ghi có một khung chung»

Người gặp: mọi người dùng mở ngăn một cá nhân, công ty hay thoả thuận — tức hầu hết thao tác CRM hằng
ngày ngoài OKR. Khảo sát 04/10 trên production thấy:

- Tab «Tác nhân» của ngăn bản ghi (`agent-panel.tsx`, `lib/agent-record.ts`) nói **tiếng Anh viết cứng**
  («Ask about this person», «Still working…», «This conversation has ended.»), avatar là logo OneHub thay
  vì dấu Kara, chờ bằng `Spinner` trần, và khi lỗi in `error.message` thô kèm **gợi ý cho lập trình
  viên** («Start it with `bun run dev`, or check AGENT_URL»).
- Khung bản ghi tải lỗi (`record-parts.tsx`) chỉ in «Không tải được bản ghi» + thông điệp thô, **không có
  nút Thử lại**.
- Thông tin liên hệ Kara bổ sung (facts, mạng xã hội, enrichment) ghi thẳng, không biên nhận, không Hoàn
  tác (ai-ux §4); chấm trạng thái tự vẽ thay vì `StatusIndicator`.
- Kế hoạch công ty lỗi thì im lặng.
- Lỡ đóng ngăn **thêm nhanh** cá nhân/thoả thuận/bước giữa chừng thì chữ vừa nhập mất ngay, không hỏi lại
  (Ngoài-2 của `hop-thoai-giu-cho-dang-nhap`, chủ kho chọn «mở hợp đồng mới» 27/09).

Ở OKR, Kara đã có tên, dấu, lời «Kara đang…», lỗi có Thử lại và đề xuất có biên nhận; ở ngăn bản ghi thì
chưa có gì trong số đó — người dùng gặp hai trợ lý khác nhau trong cùng một sản phẩm.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: một người chưa từng dùng, mở ngăn của một cá nhân, một công ty và
  một thoả thuận trên bản chạy thật, có gặp Kara như ở OKR — tiếng Việt, đúng dấu, «Kara đang…» khi chờ,
  lỗi có «Thử lại», thông tin Kara ghi có biên nhận và Hoàn tác — và không mất chữ khi lỡ đóng ngăn thêm
  nhanh không?
- Kết quả nào là SỐNG: lái thử người lạ trên ba loại ngăn không ghi lần vấp nào thuộc năm
  nhóm trên; thước máy đếm 0 chữ tiếng Anh viết cứng và 0 gợi ý lập trình viên trong các tệp của ranh
  giới K4.
- Kết quả nào là CHẾT: lái thử vẫn gặp chữ tiếng Anh hay gợi ý lập trình viên ở tab Kara,
  hoặc mất chữ khi lỡ đóng ngăn thêm nhanh; hoặc bố cục ngăn mới không được chủ kho duyệt ở bản bấm được
  (S1-D) — khi đó dừng ở Cổng Phạm vi, không dựng.
- Timebox: PR mở trước 17/10/2026 (ba ngày làm việc sau mốc 14/10).
