---
schema_version: 1
feature: «Tôi bấm một việc đã giao trong trang Lộ trình và đọc trong một phút: vì sao làm, đã lên chưa, sẽ đo gì, còn thiếu gì, ai quyết»
slug: ngan-ho-so-trong-lo-trinh
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-10-12-ngan-ho-so-trong-lo-trinh-design.md
---

# Acceptance Contract: ngan-ho-so-trong-lo-trinh

## Context

Trang Lộ trình (LT1, trên production từ 10/10) cho người không dùng git biết một việc đang ở đâu. Vòng này
thêm vào ngăn việc LT1 đã dựng phần trả lời năm câu kế tiếp — vì sao làm, đã lên chưa, sẽ đo gì và khi nào,
còn thiếu gì, ai quyết — bằng dải tóm tắt hồ sơ do bộ kit xuất (`hang.tom_tat`, khối `lo-trinh-du-lieu`
bản 2, hàng X2 của kit). Mọi người thấy tầng chung; vai `owner` thấy thêm bảy con số của vòng làm. CRM chỉ
đọc nguyên chữ của dải: không đọc hồ sơ, không đọc tệp kế hoạch, không tự tính ô nào.

Source input: `_acceptance/ngan-ho-so-trong-lo-trinh/opportunity.md` (Cổng Đáng `build` 2026-10-12, hàng
LT1b của `docs/plan/lo-trinh-okr.json`; gốc `_acceptance/trang-lo-trinh-trong-crm/`); đặc tả khối:
`skills/acceptance/references/lo-trinh-du-lieu.md` của bộ kit nhánh chính `7f65e5a0` (X2,
phanlemanh/acceptance-gate-kit#307); dữ liệu thật: trang kit nhánh chính vẽ trên bản sao crm `27d47de04`.

## Criteria

- AC-1: Given khối bản 2 có `hang.tom_tat` cho một việc, When một thành viên mở ngăn của việc đó, Then thân ngăn mở đầu bằng «Tóm tắt hồ sơ» (chỉ hai cảnh báo sẵn có của LT1 — trạng thái theo lời ghi, kế hoạch lệch hồ sơ — được đứng trước nó; «Chi tiết» và hai danh sách việc liên quan đứng sau) với đúng tám hàng theo thứ tự Đã giao gì · Vì sao làm · Hồ sơ cập nhật · Lên production · Sẽ đo gì, khi nào · Kết quả đo · Còn thiếu gì · Ai quyết; mỗi hàng mang nguyên văn ô tương ứng của `tom_tat.moi_nguoi` (ngày qua định dạng ngày của trang); và ô `trang_thai` của dải bằng chữ trạng thái của việc mà ngăn LT1 đã hiện (nhãn nhóm ở dải số đầu ngăn, cộng dòng «Kế hoạch ghi» khi chữ khác các chữ cùng nghĩa) — đúng cho mọi việc có dải trong trang kit nhánh chính vẽ trên bản sao crm.
- AC-2: Given dải của một việc có ô vắng (null), When mở ngăn, Then hàng của ô đó vẫn có và hiện «Chưa có» bằng chữ phụ; không hàng nào bị bỏ, và không ô nào được điền từ chỗ khác của khối.
- AC-3: Given một việc không có dải (`tom_tat` null), When mở ngăn, Then phần «Tóm tắt hồ sơ» hiện đúng một câu «Chưa có tóm tắt hồ sơ cho việc này.», không hàng nào của dải và không phần «Số liệu làm việc»; dải số, «Chi tiết» và hai danh sách việc liên quan vẫn như LT1.
- AC-4: Given người xem mang vai `owner`, When mở ngăn của một việc có dải, Then ngay sau «Tóm tắt hồ sơ» là «Số liệu làm việc» kèm câu «Chỉ chủ không gian làm việc thấy phần này.», sáu số — tiêu chí, phép đo, lượt chấm, token đầu ra (định dạng theo ngôn ngữ), quyết định của máy, quyết định của người — mỗi số vắng hiện «Chưa có»; commit đã chấm hiện bảy ký tự đầu, nút sao chép mang trọn mã, và liên kết «Tìm PR» trỏ ô tìm PR của GitHub theo trọn mã, mở tab mới; ngăn không có ô nhập hay nút ghi nào khác.
- AC-5: Given người xem mang vai `admin`, `member`, `okr` hoặc không có vai, When trang Lộ trình dựng ở máy chủ, Then dữ liệu gửi xuống mã khách có `tom_tat.chu_kho` là null ở mọi việc — không con số và không mã commit nào của tầng chủ kho có trong trang trả về — và ngăn không có «Số liệu làm việc»; Given vai `owner`, Then tầng đó giữ nguyên như khối. (cross-layer)
- AC-6: Given `LO-TRINH.html` mang khối bản 1 (bộ kit 2.26), When mở trang, Then không có băng cảnh báo cả trang, danh sách như LT1, và ngăn của mọi việc hiện «Chưa có tóm tắt hồ sơ cho việc này.»; Given khối mang phiên bản mới hơn 2, Then băng cảnh báo «một phần trang có thể thiếu» của LT1 hiện và dải vẫn hiện phần biết; Given một ô của dải sai kiểu, Then trang về khung «dữ liệu lộ trình hỏng» của LT1 với đường khoá trong phần gập, không nuốt thành «Chưa có».
- AC-7: Given mã của trang, When soát nguồn, Then hàm đọc khối là bản chép nguyên văn hàm `docDuLieu` bản 2 — thân hàm khớp băm ghi trong nhãn nguồn của tệp mẫu, và khớp từng ký tự với `scripts/lo-trinh.mjs` của kho khi tệp đó đã mang bản 2; khi `LO-TRINH.html` ở gốc đã mang bản 2, bộ đọc giữ nguyên từng ô của dải trên chính tệp đó; khuôn Zod có đúng bộ khoá của bảng khoá bản 2 (thêm ba cấp `tom_tat`, `moi_nguoi`, `chu_kho`); và không tệp nào của trang đọc hồ sơ nghiệm thu hay tệp kế hoạch.
- AC-8: Given tệp mẫu của vòng, When soát, Then nó là trang do bộ vẽ của kit vẽ trên một bản sao crm, không sửa byte nào: nhãn nguồn ghi `sha` kit, `sha` crm, lệnh, ngày và băm thân hàm `docDuLieu` của bộ vẽ; vẽ lại bằng đúng `sha` kit và `sha` crm đã ghi ra đúng từng byte; và khối của nó là bản 2.
- AC-9: Given ngăn dựng bằng thành phần thật trên dữ liệu thật (bản mẫu của vòng), When nhìn ở máy tính 1280 và điện thoại 375, nền sáng và tối, Then với LT1 «Tóm tắt hồ sơ» mở đầu thân ngăn, trước «Chi tiết»; «Số liệu làm việc» chỉ có ở trạng thái vai `owner`; ô «Vì sao làm» 1.311 ký tự của R1g xuống dòng trọn, trang và ngăn không cuộn ngang; chữ của dải và mã commit mang dấu không dịch.
- AC-10: Given ảnh ngăn của LT1, R1g và 4n ở hai khổ cùng tệp lời của trang, When một trưởng phòng ban không dùng git đọc, Then họ trả lời được năm câu của câu giao từ ngăn trong một phút: nhãn bằng chữ thường, có bản vi và en trong tệp lời (không chữ viết thẳng trong mã), và không gặp tên tệp, tên lệnh hay chữ nội bộ của bộ công cụ ở nhãn. Chữ của chính dải do bộ kit viết, không thuộc phạm vi tiêu chí này. (judgment)

## Coverage

- Trục A — Dải của việc: dải đủ | ô vắng | không dải | khối bản 1 | khối mới hơn | sai kiểu [thước CE: bảng «Đọc khoan dung» bản 2 của đặc tả khối + đếm trên trang kit vẽ thật: 81 việc có dải, 5 việc đã giao không dải, 12 ô «sẽ đo gì» vắng, 14 ô lượt chấm/token vắng] → AC-1, AC-2, AC-3, AC-6, AC-8
- Trục B — Người xem: `owner` | `admin` | `member` | `okr` | không vai [thước CE: `WORKSPACE_ROLES` trong `packages/validation/src/vai-workspace.ts`] → AC-4, AC-5
- Trục C — Câu người xem hỏi: vì sao làm | đã lên chưa | sẽ đo gì, khi nào | kết quả | còn thiếu gì | ai quyết | (chủ kho) đo kỹ cỡ nào, tốn bao nhiêu, ai quyết, PR nào [thước CE: câu giao và ghi chú hàng LT1b, chín ô và bảy con số của đặc tả khối; NGÀNH: ngăn chi tiết việc của Linear, trang PR của GitHub] → AC-1, AC-4, AC-10
- Cắt ngang: hai khổ màn, nền sáng/tối, hai ngôn ngữ nhãn, chữ của dải không dịch, mọi đường vào dùng chung một ngăn, bộ đọc chép nguyên → AC-7, AC-9, AC-10
- Quét đầy đủ (Core / Later / Never): `_acceptance/ngan-ho-so-trong-lo-trinh/coverage-scan.md`
- [GIẢ ĐỊNH] «Vai chủ kho» trong CRM là vai `owner` của không gian làm việc, và ở OneHub vai đó là chủ kho.
- [GIẢ ĐỊNH] Đường tìm PR bằng ô tìm của GitHub theo mã commit là đủ cho chủ kho (không cần số PR).

## Đường đo

- Thước: chủ kho và ít nhất 2 trưởng phòng ban trả lời đúng năm câu từ ngăn trong một phút · số từ: phiên nghiệm thu (bảng chấm kín của nghi thức nghiệm thu, việc máy chọn ngẫu nhiên trong các việc có dải) · bảo đảm bởi: đã có sẵn: nghi thức phiên nghiệm thu; ngăn phải trả lời được — AC-1, AC-3, AC-10
- Thước: ngăn hiện đúng chữ dải của `LO-TRINH.html` cùng lượt vẽ (vế CHẾT) · số từ: E1 so từng việc của tệp mẫu (trang kit nhánh chính vẽ thật, đóng băng 12/10) với khối thô; E7 dòng 5 đọc chính `LO-TRINH.html` ở gốc qua bộ đọc và so với khối thô của nó khi kho đã mang bản 2 — trước kit 2.27 dòng đó trả mã đã khai 2, sau đó chạy ở mỗi lượt ghim lại · bảo đảm bởi: AC-1, AC-7
- bỏ đường-đo — vế mức dùng «tin hỏi tiến độ của chủ kho dưới nửa nền 23/48»: kho chưa có máy đếm tin, đếm tay ở phiên nghiệm thu như LT1 (xem sổ quyết định của hồ sơ này)

## Out of scope

- Sửa hay tự tính chữ trong dải — ô production, ô chưa làm, ô vì sao cụt; lỗi dữ liệu đi về kit bằng chip riêng, CRM hiện nguyên chữ.
- Tự suy «đã lên production» từ chữ trạng thái — dựng nguồn sự thật thứ hai.
- Số PR và liên kết thẳng tới PR — khối cố ý không mang; tầng chủ kho dùng mã commit.
- Thu gọn đoạn dài — đo ở phiên nghiệm thu trước.
- Tầng chủ kho cho vai `admin`.
- Nút «Gửi tín hiệu» và phần hiện tín hiệu — hàng LT2, phiên khác.
- Ghi gì từ CRM vào lộ trình hay hồ sơ.
- Đưa `LO-TRINH.html` do kit nhánh chính vẽ vào gốc kho; gộp vào `onehub` trước khi crm nhận kit 2.27.
- Ô Mốc ở khổ máy tính bảng (Ngoài-1 của `lo-trinh-dong-bo-ho-so`) — hợp đồng riêng chưa mở.

## Notes

- Phụ thuộc: crm nhận kit 2.27 (bộ vẽ mang khối bản 2). Trước đó phép đo bản chép của LT1 (`trang-lo-trinh-trong-crm`, `rang/ban-chep.mjs`) đỏ vì so với bộ kit 2.26 đang cài, và E7 của hồ sơ này trả mã đã khai 2. Gộp: gộp `onehub` có kit 2.27 vào nhánh, ghim lại LT1 và LT1b một làn, rồi chủ kho bấm gộp.
- Tệp mẫu `apps/app/test/fixtures/lo-trinh/x2/LO-TRINH.html` do `rang/sinh-mau-x2.mjs` sinh; không viết tay khối dữ liệu nào.
- Chip sang kho kit (12/10): ô production 81/81 «chưa ghi quan sát production», ô chưa làm của LT1 thiếu 13 giới hạn, 11/81 ô vì sao cụt.
