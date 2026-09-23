---
schema_version: 1
feature: Thước o-soan.mjs dọn sạch mọi lối thoát — không sót dấu mốc, hội thoại hay Chrome; chặn cây bằng canh-cay; người đo bắt buộc khai; token và màu con trỏ lấy từ một nguồn
slug: thuoc-o-soan-don-dep
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [script]
status: implemented
design_doc: docs/superpowers/specs/2026-09-23-thuoc-o-soan-don-dep-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-23T08:50:00Z
---

# Acceptance Contract: thuoc-o-soan-don-dep

## Context

Thước `_acceptance/o-soan-va-ly-do-loi/rang/o-soan.mjs` (hồ sơ `o-soan-va-ly-do-loi`,
signed-off 2026-09-23, PR #90) thoát bằng `process.exit(2)` ở mọi lối không đo được, nên
bỏ qua `finally`: dấu mốc `o-soan-canh-*.svg` sót trong `apps/app/public`, hội thoại
«o-soan do» sót trong DB (một hàng còn nằm lúc viết), Chrome headless có thể mồ côi. Kèm
email thật ghi cứng làm mặc định, token `builder:` viết tay, và màu con trỏ khai hai lần
(Ngoài-1 của hồ sơ đó). Vòng này sửa thước, không sửa sản phẩm. Gốc: `7cf69d6a`.

Source input: prompt

Thuật ngữ trong hợp đồng này:
- **vật sót** của một lượt = (a) tệp mới trong `apps/app/public` so với trước lượt,
  (b) hàng `agentConversation` tiêu đề «o-soan do» của BẤT KỲ người dùng nào tạo sau lúc
  bắt đầu lượt, (c) tiến trình Chrome mà dòng lệnh chứa thư mục `TMPDIR` riêng bộ đo cấp
  cho lượt đó, còn sống sau khi lượt thoát. Các lượt của bộ đo chạy tuần tự qua khoá
  `_acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh`, nên (a) và (b) không lẫn lượt khác.
- **bản gốc** = `o-soan.mjs` ở `7cf69d6a`; **bản sửa** = `o-soan.mjs` ở HEAD.
- **máy chủ giả** = máy chủ tĩnh của bộ đo trên cổng ngẫu nhiên, đặt làm `APP_URL`.

## Criteria

- AC-1: Given máy chủ giả phục vụ một thư mục KHÁC `apps/app/public` của cây (có một tệp `.svg` làm đối chứng) và `NGUOI=dev@localhost`, When chạy bản sửa, Then thoát 2, in dòng `KHONG DO DUOC: may chu o <APP_URL> khong phuc vu cay dang xet.` của `canh-cay.mjs`, và lượt có 0 vật sót; cùng ca đó bản gốc để lại tệp `o-soan-canh-*.svg` và bộ đo in `khac-cay: sot dau moc`.
- AC-2: Given máy chủ giả phục vụ đúng `apps/app/public` của cây (canh-cay ra `dung-cay`) và `NGUOI=dev@localhost`, When bản sao của rang bị chèn `khongDo("pha-thu <moc>")` tại từng mốc — `giua-gieo` (sau khi hội thoại đã tạo, trước khi ghi sự kiện), `sau-gieo`, `sau-chrome` (Chrome đã mở, trước trang đầu) — và ở ca thứ tư `loi-la` bị chèn `throw new Error("pha-thu loi la")` tại mốc `sau-chrome`, Then mỗi lượt thoát 2, in `KHONG DO DUOC: pha-thu <moc>` (ca `loi-la`: dòng `KHONG DO DUOC:` có `pha-thu loi la`), và 0 vật sót; cùng bốn ca bản gốc để lại hội thoại, bộ đo in `<ca>: sot hoi thoai`.
- AC-3: Given như AC-2, bản sao bị chèn ở mốc `sau-chrome` một dòng in `PHA-THU SAN SANG` rồi treo, When bộ đo gửi SIGTERM (ca `sigterm`) hoặc SIGINT (ca `sigint`) sau khi thấy dòng đó, Then lượt thoát 143 hoặc 130 tương ứng và 0 vật sót; cùng hai ca bản gốc để lại hội thoại, bộ đo in `<ca>: sot hoi thoai`. Đối chứng dương của thước vật sót (ca `sigkill`): bộ đo gửi SIGKILL cho bản sửa ở cùng mốc — bộ đo PHẢI in `sigkill: sot chrome` và `sigkill: sot hoi thoai` (rồi tự dọn), nếu không thì chính thước (b)/(c) mù.
- AC-4: Given `NGUOI` vắng khỏi môi trường, When chạy bản sửa (máy chủ giả như AC-2), Then thoát 2 với dòng `KHONG DO DUOC:` có chữ `NGUOI`, và 0 vật sót; và tệp bản sửa không chứa chuỗi `@onemount.com`; cùng ca bản gốc thì có hội thoại mới (đã đi qua bước gieo) và không dòng `KHONG DO DUOC:` nào có chữ `NGUOI`, bộ đo in `thieu-nguoi: khong chan` — phân biệt bằng quan hệ, không bằng thời gian; hạn của lượt là hằng trong tệp cấu hình của bộ đo.
- AC-5: Given bản sửa, When đọc tệp, Then nó import `builderToken` từ `apps/agent/agent/lib/custom-agent-dispatch.ts` và không còn chuỗi `builder:` nào viết tay; bản gốc bị bộ đo gọi tên `token: builder viet tay`.
- AC-6: Given bản sửa, When lấy hai khai báo `MAU_CON_TRO` và `MAU_CON_TRO_RGB` ra và tính giá trị, Then chuỗi bằng đúng `rgb(<r>, <g>, <b>)` dựng từ mảng, và khai báo chuỗi tham chiếu `MAU_CON_TRO_RGB` (không có literal màu thứ hai); bản gốc bị gọi tên `mau: khai hai lan`.
- AC-7: Given máy chủ dev của cây đang xét ở 3600/3601 (app/api), When chạy lần lượt đúng dòng lệnh `Chay:` trong `steps` của E1, E2, E8 thuộc `_acceptance/o-soan-va-ly-do-loi/evals.yaml` với `BANG_CHUNG` trỏ thư mục bằng chứng của hồ sơ này, Then mỗi lượt thoát 0 và in `DAT: <che do>`, mỗi lượt 0 vật sót, và thư mục `_acceptance/o-soan-va-ly-do-loi/evidence/` không đổi byte nào.
- AC-8: Given diff từ `git merge-base origin/onehub HEAD` tới HEAD, When liệt kê tệp đổi ngoài `_acceptance/**` và ngoài `risk_tiers.t1_skip_globs`, Then danh sách rỗng; và một danh sách mẫu có `apps/agent/agent/lib/custom-agent-dispatch.ts` bị phép đo gọi tên.
- AC-9: Given diff của `_acceptance/o-soan-va-ly-do-loi/evals.yaml` từ `git merge-base origin/onehub HEAD` tới HEAD, When so từng dòng đổi, Then chỉ có đúng ba dòng `Chay:` của E1, E2, E8 đổi, và mỗi dòng mới bằng đúng dòng cũ với tiền tố `NGUOI=${NGUOI:-dev@localhost} ` chèn ngay trước `bun scripts/lan-do/tien-de.mjs`; một diff mẫu bớt một chế độ (hoặc thêm một cờ) bị phép đo gọi tên.

## Coverage

Không dùng skill morphological-scan: không gian là hai trục đã liệt đủ bằng tay dưới đây
(xem entry `descope` trong `decisions.jsonl`).

- Trục lối thoát: khác cây (AC-1) | thiếu người đo (AC-4) | giữa gieo · sau gieo · sau Chrome — ba mốc đại diện cho mọi `khongDo` sau gieo: không thấy ô soạn, không nhận focus, không thấy thanh nút (AC-2) | lỗi lạ không phải `khongDo` — rang hỏng giữa chừng (AC-2 ca `loi-la`) | SIGTERM · SIGINT (AC-3) | lượt thành công (AC-7) | SIGKILL — ngoài phạm vi sửa, chỉ dùng làm đối chứng dương của thước (AC-3)
- Trục vật sót: dấu mốc (a) · hội thoại (b) · Chrome (c) — mọi ca của AC-1..AC-4 và AC-7 đo đủ ba
- Trục chiều đo: bản sửa sạch (AC-1..AC-7) | bản gốc đỏ với thông điệp ghim (AC-1..AC-6) | thước vật sót thấy được vật sót (AC-3 ca `sigkill`) | phạm vi diff, có mẫu dương (AC-8, AC-9)
- Trục phép đo đã ký bị chạm: `steps` E1/E2/E8 của hồ sơ cũ (AC-9) | thước `o-soan.mjs` vẫn đo được trên máy chủ thật (AC-7)
- Trục nguồn một chỗ: token (AC-5) · màu (AC-6) · người đo (AC-4)

## Out of scope

- SIGKILL giữa lượt: tiến trình không chạy được mã dọn; vẫn có thể sót hàng hoặc Chrome.
- Gom rác hội thoại «o-soan do» cũ theo tuổi.
- Email mặc định ghi cứng trong `scripts/lan-do/tien-de.mjs` (tệp dùng chung, của hồ sơ khác).
- `gieo()` chọn `organization.findFirst()` thay vì không gian làm việc của người đo.
- Xoá hàng hội thoại «o-soan do» đang sót trong DB dev — việc tay, người quyết riêng.

## Notes

Không có bề mặt người nhìn của sản phẩm; AC-7 là eval `ui-check` vì cần máy chủ dev, và
là lần chứng lại E1/E2/E8 của `o-soan-va-ly-do-loi` (làn ghim lại không chạy `ui-check`).
Hồ sơ này sửa `steps` của E1/E2/E8 trong `evals.yaml` của hồ sơ đã ký để truyền `NGUOI`
— xem `decisions.jsonl`.
