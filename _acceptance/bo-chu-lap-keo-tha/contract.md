---
schema_version: 1
feature: Bỏ vế «hoặc chọn tệp» khỏi câu gợi ý của vùng kéo-thả trong hộp «Tải nguồn lên», vì nút «Chọn tệp» đã đứng ngay cạnh
slug: bo-chu-lap-keo-tha
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
design_doc: docs/superpowers/specs/2026-09-28-bo-chu-lap-keo-tha-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-28T12:43:42Z
---

# Acceptance Contract: bo-chu-lap-keo-tha

## Context

PR #195 (hồ sơ đã ký `nguon-keo-tha-reui`) đặt nút outline «Chọn tệp» ngay trước câu gợi ý
của vùng kéo-thả trong hộp «Tải nguồn lên». Câu gợi ý (`nguon.hop.keoTha` trong
`apps/app/lib/messages/tai-lieu.ts`) vẫn là «Kéo tệp vào đây, hoặc chọn tệp» / «Drag a file
here, or choose a file» nên vế sau lặp việc của nút. Người ký ghi nó là Known limits
«Ngoài-1» (sổ `d-20260928T120837Z-6`) và yêu cầu sửa thành việc riêng. Luật «Ngôn ngữ sản
phẩm» của `CLAUDE.md`: xoá một chữ mà người đứng ở màn đó vẫn hiểu đúng thì chữ đó thừa.

Source input: prompt của chủ kho 28/09 — đổi thành «Kéo tệp vào đây» / «Drag a file here»,
hoặc câu tốt hơn qua được luật trên. Vòng giữ câu đề xuất; lý do từng chữ ở design doc.

## Criteria

- AC-1: Given hộp «Tải nguồn lên» thật (`NutTaiNguon`) dưới ngôn ngữ `vi`, When người mở hộp, Then chữ của vùng kéo-thả đúng trọn «Chọn tệp», «Kéo tệp vào đây», «Word (.docx) hoặc PDF, tới 20 MB» theo thứ tự nút → câu gợi ý → mô tả, không thêm chữ nào; And câu gợi ý bằng `taiLieuMessages("vi").nguon.hop.keoTha`.
- AC-2: Given cùng hộp dưới ngôn ngữ `en`, When người mở hộp, Then chữ của vùng đúng trọn «Choose file», «Drag a file here», «Word (.docx) or PDF, up to 20 MB» theo cùng thứ tự; And câu gợi ý bằng `taiLieuMessages("en").nguon.hop.keoTha`.
- AC-3: Given tệp chữ `tai-lieu.ts`, When đặt câu gợi ý `keoTha` cạnh nhãn nút `keoThaNut` của cùng ngôn ngữ, Then câu gợi ý không chứa động từ mở đầu của nhãn nút («chọn» / «choose», không phân biệt hoa thường), ở cả `vi` lẫn `en`.
- AC-4: Given tệp chữ sau vòng, When bộ canh chữ `messages-guard.spec.ts` chạy, Then nó xanh (bản `vi` có dấu và khác bản `en`).
- AC-5: Given các phép đo của hai hồ sơ đã ký `nguon-keo-tha-reui` và `may-soan-de-xuat` có đọc vùng kéo-thả hay hộp tải — bốn tệp test `nguon-keo-tha-chu.dom.tsx`, `nguon-canh-nhau.dom.tsx`, `nguon-keo-tha.dom.tsx`, `tai-lieu-nguon.dom.tsx` và thước màn thật `rang/man-tai-nguon.mjs` — When chạy nguyên văn sau vòng, Then chúng xanh; And so với điểm rẽ khỏi `onehub`, cây của nhánh (kể cả thay đổi chưa commit và tệp chưa theo dõi) không chạm tệp nào dưới `_acceptance/nguon-keo-tha-reui/`, `_acceptance/may-soan-de-xuat/`, cũng không chạm bốn tệp test trên.
- AC-6: Given ứng dụng thật chạy trên phiên đo riêng, When người mở hộp «Tải nguồn lên» ở 1440 và ở 390, Then chữ của vùng kéo-thả trên màn đúng trọn «Chọn tệp», «Kéo tệp vào đây», «Word (.docx) hoặc PDF, tới 20 MB» theo thứ tự nút → câu gợi ý → mô tả ở cả hai khổ; And ở 390 hộp và trang không tràn ngang.

## Coverage

Bỏ quét `morphological-scan` — xem entry `descope` «bỏ coverage-scan» trong
`decisions.jsonl`. Không gian nhỏ, liệt tay đủ:

- Trục A — ngôn ngữ: `vi` | `en` [thước CE: `Locale` của `@crm/ui/lib/locale` chỉ có hai giá trị]
- Trục B — chữ trong vùng: nút `keoThaNut` | câu gợi ý `keoTha` | mô tả `keoThaMoTa` [thước CE: ba prop chữ của `NguonKeoTha`]
- Trục C — nơi đọc: tệp chữ | DOM của hộp thật | màn thật trên trình duyệt [thước CE: ba lớp đo đang có của hai hồ sơ đã ký]
- Core: A×B×DOM (AC-1, AC-2); A×quan hệ gợi ý↔nút×tệp chữ (AC-3); A×tệp chữ canh chung (AC-4); thước đã ký ở lớp DOM và màn thật (AC-5); vi×B×màn thật×1440/390 (AC-6).
- Later: `en` trên màn thật — phiên đo chạy tiếng Việt; bản `en` đã đo ở lớp DOM (AC-2).

## Out of scope

- Đổi nhãn nút «Chọn tệp», câu mô tả «Word (.docx) hoặc PDF, tới 20 MB», hay câu chữ khác của hộp tải.
- Các vùng «Dán hoặc chọn tệp» của OKR và Cấu trúc tổ chức — chúng không có nút «Chọn tệp» đứng cạnh.
- Sửa `NguonKeoTha`, `hop-tai-nguon.tsx` hay bất kỳ phép đo nào của hồ sơ đã ký.
- Ba Known limits còn lại của `nguon-keo-tha-reui` (Ngoài-2, Ngoài-3, Ngoài-4/7).

## Notes

- Câu mới giữ chuỗi con «Kéo tệp vào đây» mà `tai-lieu-nguon.dom.tsx:445` và `rang/man-tai-nguon.mjs:425` (hồ sơ `may-soan-de-xuat`) khớp trên màn thật, nên hai thước chạy nguyên văn.
- Việc tải tệp lên (xin chỗ → PUT → hàng «Máy đang soạn» ở tab Nguồn) là lời hứa của `may-soan-de-xuat`; vòng này chỉ chạy lại thước của nó (AC-5), không hứa lại.
- Vế «không chạm» của AC-5 so diff với điểm rẽ khỏi `origin/onehub`; sau khi gộp vào `onehub` điểm rẽ trùng HEAD nên kiểm đó xanh rỗng — lời hứa là của vòng này.
