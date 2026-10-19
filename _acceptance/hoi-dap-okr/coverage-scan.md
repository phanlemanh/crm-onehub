# Quét không gian tiêu chí — hoi-dap-okr (hàng C)

## Ngữ cảnh

- Sản phẩm: CRM của OneHub, khu OKR — chân sản phẩm: đào kho (`CONTEXT.md`, `docs/agent.md`,
  `docs/ai-ux.md`, `packages/validation/src/vai-workspace.ts`, `packages/db/src/okr-hien-thi.ts`,
  `apps/api/scripts/okr-mau/cong-ty.json`) · chân ngành: Profit.co (tác tử AI soạn, căn chỉnh, tổng kết
  OKR — [profit.co](https://www.profit.co/okr-software-overview/us/)); sản phẩm cận kề cho «trả lời theo
  quyền người hỏi»: Microsoft 365 Copilot (chỉ trả lời từ dữ liệu người dùng đã có quyền đọc).
- Tra 14/10 không thấy sản phẩm OKR nào mô tả công khai hỏi đáp hội thoại có lọc quyền
  ([GIẢ ĐỊNH: chưa có chuẩn ngành đúng loại] cho trục A×B — neo tạm vào Copilot, cận kề).

## Trục

- **A — Người hỏi:** owner/admin · thành viên trưởng đơn vị · thành viên thường · vai chỉ OKR ·
  không thuộc workspace hay hết vai giữa chừng
  [thước CE: `VAI_WORKSPACE` ở `packages/validation/src/vai-workspace.ts` — đủ năm giá trị vai; người có
  trong bộ mẫu: 1 admin, 31 member, 8 vai `okr` — `apps/api/scripts/okr-mau/cong-ty.json`]
- **B — Ý định câu hỏi:** tra một Mục tiêu hay KR (tình trạng, tiến độ, mức tự tin) · liệt kê, lọc
  («KR nào đang trượt», «OKR phòng X») · «của tôi» · diễn biến theo Cập nhật tuần · câu ngoài OKR
  (đối tác, deal) · câu xin ghi hay sửa OKR · câu không trả lời được (không có dữ liệu, không xem
  được)
  [thước CE: luật đọc của Mục tiêu `dieuKienXemMucTieu` (`packages/db/src/okr-hien-thi.ts:56-84`);
  bảng thuật ngữ OKR của `CONTEXT.md`; chân ngành Profit.co (tiến độ, tổng kết kỳ)]
- **C — Kênh:** web (cột Kara) · Zalo · Slack
  [thước CE: `docs/ai-ux.md` §1 «Zalo chỉ là cửa vào»; kênh có thật ở `apps/agent/agent/channels/`]
- **D — Tình trạng dữ liệu và hệ thống:** đủ dữ liệu · Mục tiêu `gioi-han` người hỏi không có tên ·
  chu kỳ chưa có OKR · kỳ đã khép · hết lượt hay hết trần tháng · Kara hỏng (model, Gateway)
  [thước CE: `docs/ai-ux.md` §7 năm trạng thái; bộ mẫu M có đúng một Mục tiêu `gioi-han`
  (`q4-phap-che-3`) và quý 3 đã khép]

## Lát cắt theo trục B (ý định) × A (người hỏi), C và D là lớp xuyên

| B \ A | owner/admin | trưởng đơn vị | thành viên | vai chỉ OKR | ngoài/hết vai |
| --- | --- | --- | --- | --- | --- |
| tra một Mục tiêu/KR | Core 1 | Core 1 | Core 1 | Core 1 | Core 3 |
| liệt kê, lọc | Core 2 | Core 2 | Core 2 | Core 2 | gạch — chặn ở cửa |
| «của tôi» | Core 2 | Core 2 | Core 2 | Core 2 | gạch — chặn ở cửa |
| diễn biến Cập nhật tuần | Core 4 | Core 4 | Core 4 | Core 4 | gạch — chặn ở cửa |
| ngoài OKR (đối tác) | Later | Later | Later | Core 5 | gạch — chặn ở cửa |
| xin ghi hay sửa | Core 6 | Core 6 | Core 6 | Core 6 | gạch — chặn ở cửa |
| không trả lời được | Core 7 | Core 7 | Core 7 | Core 7 | gạch — chặn ở cửa |

Ô «ngoài OKR» với owner, trưởng đơn vị, thành viên là Later: họ đã có Kara của CRM cho câu đối tác;
cột Kara OKR chỉ chỉ đường sang đó.

## Core

1. **Tra một Mục tiêu/KR người hỏi xem được** — trả lời có trích dẫn tới đúng Mục tiêu/KR, mọi con số
   khớp dữ liệu; Mục tiêu `gioi-han` người hỏi không có tên thì Kara trả lời như không tồn tại (không
   lộ tên, không lộ số).
2. **Liệt kê, lọc và «của tôi»** — mã tính tình trạng (trượt, đúng hướng…) và danh sách theo quyền;
   model chỉ diễn giải.
3. **Người ngoài workspace hay hết vai giữa chừng** — cửa từ chối, thẻ cũ còn hạn cũng không mở được.
4. **Diễn biến theo Cập nhật tuần** — tiến độ và mức tự tin tuần gần nhất so tuần trước.
5. **Vai chỉ OKR hỏi câu đối tác** — 0 tên đối tác, 0 công cụ đối tác; câu trả lời nói Kara ở đây chỉ
   đọc OKR.
6. **Câu xin ghi hay sửa OKR** — Kara không ghi; nói chỗ làm (khung Mục tiêu, Soạn OKR).
7. **Không trả lời được** — «Kara không thấy…» kèm một câu vì sao; không bịa.
8. **Hết lượt, hết trần, Kara hỏng** (trục D) — trạng thái `KaraState` và «Thử lại» theo `docs/ai-ux.md` §7.
9. **Zalo** — chờ Hỏi-1 (giữ trong C hay tách hàng sau).

## Later

- Kỳ đã khép (hỏi quý 3): công cụ đọc nhận chu kỳ bất kỳ người hỏi xem được, nhưng bộ câu mẫu chỉ đo
  quý 4; đo kỳ đã khép là việc sau.
- Câu đối tác của owner/thành viên trong cột Kara OKR: chỉ đường sang Kara của CRM, không trả lời.
- Slack: chưa có kênh hỏi Slack cho OKR.
- So sánh hai kỳ, dự báo cuối kỳ: cần mã tính mới.
- [NGÀNH: Profit.co] tổng kết kỳ cho lãnh đạo: đã có tóm tắt tuần (9c), không lặp ở hỏi đáp.

## Never

- Ghi hay sửa OKR qua hỏi đáp — ghi là ranh giới khác (Soạn OKR của D, khung Mục tiêu).
- Gửi nội dung OKR tới model không ZDR — `docs/agent.md` luật dữ liệu 5.
- Trả dữ liệu đối tác cho vai chỉ OKR — `docs/agent.md` «App eve thứ hai».
- Hỏi đáp chạy trong `apps/agent` — bài học N0: không chặn được công cụ đối tác trong cùng tiến trình.

## Xuyên mọi ô Core

- Mọi lời gọi model mang ZDR (`xuongModelZdr`); sổ chi phí `okr.hoi-dap` riêng.
- Quyền ở `tool`: mỗi công cụ đọc tự dựng ngữ cảnh xem từ `auth.initiator` và cơ sở dữ liệu.
- Con số người đọc thấy do mã dựng hoặc mã kiểm lại (`docs/agent.md` luật 1).
- Chữ qua `lib/messages`, vi và en; dữ liệu người nhập không dịch.
- Trích dẫn `InlineCitation`, phản hồi `AiFeedback` (`docs/ai-ux.md` §8).
