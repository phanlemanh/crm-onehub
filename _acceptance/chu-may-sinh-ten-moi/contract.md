---
schema_version: 1
feature: "Câu báo lỗi của máy chủ, tin nhắc buổi sáng và lời Kara về OKR dùng đúng tên mới: Góp vào, Lấy ý kiến, và tên không gian làm việc cho đơn vị gốc"
slug: chu-may-sinh-ten-moi
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, agent]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-10-20-chu-may-sinh-ten-moi-design.md
---

# Acceptance Contract: chu-may-sinh-ten-moi

## Context

Hàng VK5 của `docs/plan/lo-trinh-okr.json`, dãy V2 đợt `vo-khu-muc-tieu`, Cổng Đáng ký `build` 19/10, đứng trên
VK4 (#496). VK4 đổi chữ trên màn; máy vẫn sinh tên cũ ở ba chỗ người đọc: câu báo lỗi của API OKR, tin nhắc
buổi sáng Zalo/Slack, và lời dặn của Kara. Tên đơn vị gốc «OneHub» còn viết cứng ở API và agent-okr trong khi
màn đã lấy tên không gian làm việc. Kiểm kê ở mốc `37dc2da8d` (`kiem-ke.json`): 51 dòng trong 13 tệp.

Source input: hàng VK5 và ô cơ hội đã ký · ba mục `CONTEXT.md` (Căn chỉnh, Đơn vị, Lấy ý kiến) · hợp đồng VK4
mục Out of scope · luật riêng 24 của đợt.

## Criteria

- AC-1: Given mọi câu báo lỗi của `OKR.thongDiep` (hàm gọi với tham số mẫu) và lỗi «không có đích» của `okr.service.ts`, When đọc chữ, Then không câu nào còn «căn chỉnh» (mọi hoa thường); And bảy câu của kiểm kê đọc đúng bảng thay chữ của design doc — ví dụ «Mục tiêu không góp vào chính nó được.», «Mục tiêu còn 2 chỗ góp vào — gỡ hết, cả chỗ nó góp vào lẫn mục tiêu góp vào nó, rồi mới đặt mức giới hạn.».
- AC-2: Given mọi câu báo lỗi nhóm `hoiY`, lý do không xoá `muc-tieu.chuDeHoiY`, và lỗi đọc con số của `packages/validation/src/okr-hoi-y.ts`, When đọc chữ, Then không câu nào còn «hỏi ý» (mọi hoa thường), câu nói về cả lần dùng «lần lấy ý kiến»; And mã, khoá và đường dẫn `hoi-y` giữ nguyên.
- AC-3: Given hai câu nói cấp của đơn vị gốc (`hoiY.congBoVuotTran`, `duyet.khongCanDuyet`), When đọc chữ, Then chúng viết «cấp Công ty»; And không câu nào của `OKR.thongDiep` còn «OneHub» đứng riêng (tên sản phẩm «OneHub Center» giữ).
- AC-4: Given không gian làm việc mang tên «Kho Thử Nghiệm», When API trả tên đơn vị của một mục tiêu cấp gốc (`unitName` của mục tiêu và của đích góp vào), hàng gốc bảng độ phủ Lấy ý kiến, hàng gốc bảng chưa chấm và cột đơn vị của tệp CSV khi khép kỳ, Then tên đó là «Kho Thử Nghiệm»; And khi tên rỗng hay chỉ có khoảng trắng thì là «Công ty»; And `OKR.tenGoc`, `TRO_LY_OKR_HOI.tenGoc` không còn, và mọi chỗ kiểm kê ghi tên gốc viết cứng (toàn cảnh, sức khoẻ, sơ đồ đơn vị, soạn, tái cơ cấu, hỏi đáp của Kara) lấy tên qua cùng một hàm `readTenGoc`.
- AC-5: Given tin nhắc buổi sáng hai loại Lấy ý kiến (`okr-hoi-y-gop`, `okr-hoi-y-cong-bo`) gửi qua Zalo và Slack, When dựng tin, Then tiêu đề là «Lấy ý kiến» / «Lấy ý kiến đã công bố», câu là «Công ty đang lấy ý kiến cho mục tiêu …», nhãn liên kết Slack là «mở Lấy ý kiến», đường dẫn vẫn `/okr/hoi-y`; And không tin nào còn «hỏi ý».
- AC-6: Given hai lời dặn của Kara (`apps/agent-okr/agent/lib/loi-dan-soan.ts`, `apps/agent/agent/subagents/tro_ly_okr/instructions.md`), When đọc chữ ngoài tên mã trong dấu `` ` ``, Then không còn «Căn chỉnh»; danh sách chữ Kara dùng có «Góp vào»; mỗi tệp có câu dặn không viết «căn chỉnh» hay «hỏi ý» cho người đọc; And tên mã `dichCanChinh`, `ungVienCanChinh`, `can-chinh` giữ nguyên.
- AC-7: Given bộ chấm soạn của Kara (eval `okr-soan`) chạy một lần trên lời dặn trước khi đổi (`nen`) và một lần trên lời dặn ở đỉnh nhánh (`sau`), cùng bộ ca, cùng judge, cùng model, When so hai bản tóm tắt, Then số ca đạt của `sau` không thấp hơn `nen` quá 2, số chốt mã hỏng không cao hơn quá 1, trung bình mỗi tiêu chí judge không thấp hơn quá 0,1; And các đề xuất Kara nộp trong lần `sau` không chứa «căn chỉnh» hay «hỏi ý».
- AC-8: Given luật máy mới (`packages/validation/src/ten-cu-okr.ts`) chạy trên chữ của AC-1…AC-6, When một chữ mang một cụm cấm («căn chỉnh», «hỏi ý», «cấp onehub», «toàn công ty», «toàn onehub», không phân biệt hoa thường), Then bài đỏ và gọi tên nguồn, khoá và cụm; And trên cây sau hàng này bài xanh; And `kiem-ke.json` nằm trong commit đứng trước mọi commit của nhánh chạm `apps/**` hay `packages/**`, và mọi dòng `doi` của kiểm kê không còn chữ cũ ở đỉnh nhánh.
- AC-9: Given các bài kiểm và thước có sẵn ghim chữ cũ, When so nhánh với nền, Then không bài nào bị xoá, bớt ca hay thêm `.skip`/`.only`/`.todo`; bản chụp tin nhắc được sinh lại từ mã; thước màn đã ký duy nhất ghim câu lỗi cũ (`gioi-han-duyet-cay-okr/rang/man-gioi-han-duyet.mjs`) chỉ đổi đúng chuỗi, có dòng sổ `fix` mang `decided_by` chủ kho; And mọi hồ sơ đã ký bị chạm được ghim lại trên đỉnh nhánh trước khi gộp.

## Coverage

Quét bằng `morphological-scan`, bản đầy đủ ở `coverage-scan.md`.

- **Trục A — khái niệm:** Góp vào · Lấy ý kiến · cấp và tên gốc [thước CE: ba mục `CONTEXT.md` + kiểm kê ở mốc] → AC-1…AC-4
- **Trục B — nơi máy sinh chữ:** câu báo lỗi API · lỗi của gói validation · tin nhắc Zalo/Slack · lời dặn Kara · tên gốc trong dữ liệu trả về [thước CE: kiểm kê 13 tệp] → AC-1…AC-6
- **Trục C — giữ chất lượng Kara:** bộ chấm soạn trước/sau [thước CE: `bat_khi` của hàng] → AC-7
- **Trục D — giữ lâu:** luật máy · bài có sẵn · bản chụp · thước hồ sơ đã ký [thước CE: luật riêng 21 làm tiền lệ, tiền lệ K6a cho bản chụp] → AC-8, AC-9

## Đường đo

- «Không còn tên cũ trong câu báo lỗi và tin nhắc người dùng thấy»: số lỗi của luật máy trên cây (AC-8) — 0 là
  SỐNG; thước bảo đảm AC-1, AC-2, AC-3, AC-5, AC-8.
- «Bộ chấm soạn không tụt so với đường nền trước khi đổi lời dặn»: kết luận của `rang/so-eval-soan.mjs` (AC-7).

## Out of scope

- Lệnh dev `apps/api/scripts/okr-mau/**` — người đọc là lập trình viên; `okr-ca-quy-4.spec.ts` ghim chữ của nó.
- Tên sản phẩm «OneHub Center»; lời mở «You help a person at OneHub» của lời dặn (OneHub là công ty dùng sản phẩm).
- Chữ cho judge của eval soạn (`van.ts`, `tieuChi`, `luatJudge`) và dữ liệu ca eval (`ten: "OneHub"`, `ghiChu`) — đổi là đổi thước giữa hai lần đo của AC-7.
- Lời dặn của các phiên Kara khác (hỏi đáp, tác nhân) và bộ chấm của chúng — làn M5 đo MH4, MH2 sau khi VK5 chốt lời dặn (luật riêng 24).
- Khoá mã, tên tệp, đường dẫn `/okr/hoi-y`.

## Notes

- Bảng thay chữ ở design doc.
- Luật 24: khi lời dặn chốt (đỉnh nhánh qua S4), báo giám sát để báo M5 trên #375.
- Thước màn `gioi-han-duyet-cay-okr` chờ chủ kho cho đổi chuỗi (yêu cầu V2-9).
