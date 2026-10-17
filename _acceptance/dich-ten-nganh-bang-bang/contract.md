---
schema_version: 1
feature: "Tên ngành công ty hiện tiếng Việt từ một bảng theo danh sách cố định của nhà cung cấp"
slug: dich-ten-nganh-bang-bang
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
approved_by: Manh Phan
approved_at: 2026-10-17T12:19:51Z
design_doc: docs/superpowers/specs/2026-10-17-dich-ten-nganh-bang-bang-design.md
---

# Acceptance Contract: dich-ten-nganh-bang-bang

## Context

Sau vòng `tra-cuu-thuong-hieu-viet-nam` (#462), mô tả công ty đã ra tiếng Việt nhưng ngành vẫn là chữ
tiếng Anh nhà cung cấp trả («Real Estate & PropTech» — đo trên production 17/10, Đất Xanh Miền Bắc).
Thư viện nhà cung cấp khai ngành là danh sách cố định. Vòng này dịch ngành lúc hiển thị bằng một bảng
trong mã ở ba chỗ người dùng thấy ngành — dòng phụ đầu ngăn công ty, cột «Ngành» và bộ lọc «Ngành»
của bảng công ty — không gọi model, không đổi dữ liệu đã lưu.

Source input: hàng VN1 của `docs/plan/lo-trinh-okr.json` + ô cơ hội đã ký Cổng Đáng 17/10.

## Criteria

- AC-1: Given thư viện nhà cung cấp mà tác nhân đang cài khai danh sách ngành cố định, When bài kiểm so bảng dịch với danh sách đó, Then hai tập bằng nhau; bảng thiếu một ngành thư viện có, hoặc còn một khoá thư viện đã bỏ, thì bài kiểm đỏ và gọi đúng tên giá trị lệch.
- AC-2: Given một công ty ngành «Real Estate & PropTech», When người xem mở ngăn công ty ở giao diện tiếng Việt, Then dòng phụ đầu ngăn hiện «Bất động sản & Công nghệ bất động sản» và phần chữ đó không còn bị đánh dấu là tiếng Anh; ở giao diện tiếng Anh dòng phụ hiện «Real Estate & PropTech» như hôm nay.
- AC-3: Given bảng công ty có công ty ngành «Technology» và «Real Estate & PropTech», When người xem mở bảng ở giao diện tiếng Việt, Then cột «Ngành» hiện «Công nghệ» như chữ tiếng Việt thường, và tên dài bị cắt trong cột vẫn đọc đủ khi rê chuột vào ô; ở giao diện tiếng Anh hiện «Technology» như hôm nay.
- AC-4: Given bảng công ty có công ty thuộc hai ngành trong danh sách, When người xem ở giao diện tiếng Việt mở bộ lọc «Ngành» và chọn «Công nghệ», Then các lựa chọn mang tên Việt kèm số đếm như cũ, và yêu cầu lọc gửi đi mang chữ gốc «Technology» — kết quả lọc giống hệt khi chọn ở giao diện tiếng Anh.
- AC-5: Given một công ty có ngành ngoài danh sách (rep tự gõ «Môi giới nhà phố», hoặc nhà cung cấp trả một giá trị mới «Quantum Computing»), When người xem mở bảng, bộ lọc và ngăn công ty ở giao diện tiếng Việt rồi tiếng Anh, Then ngành hiện nguyên văn ở cả ba chỗ, cách hiển thị giống hệt hôm nay, và màn không vỡ; công ty không có ngành vẫn hiện ô trống như hôm nay.
- AC-6: Given bảng tên Việt của mọi ngành trong danh sách, When đọc cả bảng như một nhân viên kinh doanh Việt Nam, Then mỗi tên đúng nghĩa ngành gốc, tự nhiên, không hai ngành trùng tên Việt, và không có từ ghép tự đúc trái luật ngôn ngữ của kho. (judgment)
- AC-7: Given bàn đo có 24 công ty, mỗi công ty một ngành trong danh sách, When chụp bảng công ty ở 1440 và 390 px bằng hai ngôn ngữ và mở ngăn một công ty, Then ảnh cho thấy tên Việt ở cột «Ngành» và dòng phụ đầu ngăn ở tiếng Việt, chữ gốc ở tiếng Anh, trang không tràn ngang, và lượt chụp in số tên bị cắt trong cột ở mỗi ngôn ngữ và khổ.

## Coverage

- Trục chỗ hiển thị: dòng phụ đầu ngăn (AC-2) | cột bảng (AC-3) | bộ lọc (AC-4) [thước CE: mọi chỗ đọc `industry` trong `apps/app` — `grep -rn "industry" apps/app --include=*.tsx` trừ trang giới thiệu dữ liệu tĩnh]
- Trục ngôn ngữ: vi | en (AC-2, AC-3, AC-4, AC-7) [thước CE: `LOCALES` trong `packages/ui/src/lib/locale.ts`]
- Trục giá trị: trong danh sách | ngoài danh sách do rep gõ | giá trị mới của nhà cung cấp | trống (AC-2…AC-5; ngoài danh sách × vi, en ở AC-5) [thước CE: union `Industries.Eic.industry` của `context.dev` agent cài]
- Trục phủ bảng: đủ | thiếu | thừa | khuôn thư viện đổi (AC-1) [thước CE: chính union đó, rút trong lúc chạy]
- [GIẢ ĐỊNH] Nhà cung cấp trả đúng chuỗi enum (khớp sau trim, không lệch hoa thường) — giá trị lệch rơi về AC-5, hiện nguyên văn.

## Out of scope

- Ngành phụ (danh sách cố định 220 giá trị) — không màn nào của ứng dụng hiện nó; chỉ API và Kara đọc (Hỏi-1).
- Kara nói tên ngành bằng tiếng Việt — Kara đọc chữ gốc; không đổi tác nhân ở vòng này.
- Ngành rep tự gõ bằng tiếng Việt vẫn bị đánh dấu là tiếng Anh như hôm nay (có từ trước vòng này; gỡ nhãn cho mọi giá trị ngoài bảng là đánh đổi với chữ Anh mới của nhà cung cấp).
- Sắp xếp theo cột «Ngành» ở giao diện tiếng Việt vẫn theo chữ gốc tiếng Anh.
- Dịch lúc ghi (tác nhân ghi tên Việt vào ô ngành) — làm vỡ phép so «rep đã sửa ô ngành» của #462 và buộc tra lại mọi công ty cũ.
- «Tra cứu lại» không bỏ bộ đệm 90 ngày của nhà cung cấp (`apps/agent/agent/lib/dispatch.ts:104`).
- Mỗi lần «Tra cứu lại» tốn hơn 2 tín dụng vì Kara soạn thêm hồ sơ công ty (đo 17/10: thêm một lượt tra web 19,7 s).

## Đường đo

- Ngưỡng «tên ngành tiếng Việt ở ba chỗ, không tra lại»: số từ phiên xem production sau gộp (Đất Xanh Miền Bắc) — AC-2, AC-3, AC-4 bảo đảm hành vi; AC-7 là ảnh trên bàn đo.
- Ngưỡng «bộ lọc ra đúng số công ty như trước»: trước khi gộp, máy đọc số đếm bộ lọc «Ngành» trên production (giao diện tiếng Anh, theo từng chữ gốc) vào `_acceptance/dich-ten-nganh-bang-bang/evidence/dem-loc-truoc-gop.md` kèm ngày; sau khi bản lên, đọc lại cùng cách ở giao diện tiếng Việt và so từng dòng — AC-4 bảo đảm giá trị lọc vẫn là chữ gốc.

## Notes

- Hỏi-1: ngành phụ ra ngoài vòng vì không màn nào hiện nó; ngưỡng đã ký ở Cổng Đáng có vế «ngành phụ» do đọc nhầm từ phiên đo — người xác nhận bỏ vế đó.
- Hỏi-2: tên Việt của 24 ngành do máy soạn (bảng trong bản thiết kế, kèm số chữ so với chữ gốc); hội đồng chấm ở AC-6, lượt chụp AC-7 đếm tên bị cắt, người sửa từng dòng bất cứ lúc nào.
