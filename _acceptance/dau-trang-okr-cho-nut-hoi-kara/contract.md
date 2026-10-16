---
schema_version: 1
feature: Khung chờ đầu trang OKR chừa đúng chỗ cho nút «Hỏi Kara», hàng tiêu đề không nhảy khi tải xong
slug: dau-trang-okr-cho-nut-hoi-kara
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
veto_state: mo
veto_opened_at: 2026-10-16T01:36:21Z
design_doc: docs/superpowers/specs/2026-10-16-dau-trang-okr-cho-nut-hoi-kara-design.md
---

# Acceptance Contract: dau-trang-okr-cho-nut-hoi-kara

## Context

#419 thêm nút «Hỏi Kara» vào cụm bên phải đầu trang các màn OKR. Khung chờ của đầu trang vẫn chỉ chừa chỗ cho ô
chọn kỳ, nên ở khổ 375 hàng tiêu đề Toàn cảnh cao 32 px lúc chờ và 96 px khi xong: trang nhảy khi dữ liệu tới, và
phép đo E12m của hồ sơ đã ký `khung-man-chung` đỏ. Vòng này cho khung chờ dựng chính nút «Hỏi Kara» ở đúng chỗ của
nó.

Source input: `_acceptance/dau-trang-okr-cho-nut-hoi-kara/opportunity.md` (Cổng Đáng `build`, chủ kho ký ở phiên
giám sát đợt r2, 15/10).

## Criteria

- AC-1: Given màn OKR › Toàn cảnh ở khổ 375 và 1280 trên máy chủ thật của cây, When truy vấn chính của màn bị giữ (đang tải) rồi được thả (xong), Then hàng tiêu đề lúc đang tải và lúc xong lệch không quá 4 px ở y và ở chiều cao, vùng nội dung lệch không quá 8 px ở y — đúng ngưỡng E12 của `khung-man-chung` — và mọi bước còn lại của phép đo đó vẫn đạt.
- AC-2: Given đầu trang OKR đang chờ dữ liệu, ở tiếng Việt và tiếng Anh, When người nhìn cụm bên phải của đầu trang, Then nút «Hỏi Kara» thật (cùng chữ, cùng dấu Kara như khi xong) đã đứng trước ô chọn kỳ trong cùng cụm, không bị khoá.
- AC-3: Given đầu trang OKR đang chờ dữ liệu, When người bấm «Hỏi Kara» — kể cả khi dữ liệu đầu trang tới và khung chờ được thay bằng đầu trang thật trước khi lời mở cuộc hỏi trả về — Then một cuộc hỏi được mở đúng một lần và cột hỏi mở ra, như khi đầu trang đã tải xong; trong lúc lời mở chưa trả về, nút ở đầu trang thật vẫn ở trạng thái «đang mở» và bấm lại không mở thêm cuộc hỏi nào; lời mở lỗi sau khi khung chờ bị thay thì câu báo lỗi của nút vẫn hiện ở đầu trang thật.
- AC-4: Given các màn đã có phép đo khung chờ (Liên hệ, Cài đặt, Chiến dịch, Tài liệu, Onboarding), When chạy lại bộ kiểm hiện có của `khung-man-chung`, Then chúng chạy không sửa một dòng và đều xanh; và không commit nào của vòng này (commit không phải gộp, mang slug trong tiêu đề) chạm hai tệp kiểm của `khung-man-chung`.
- AC-5: Given máy chủ thật của cây, ở khổ 375 và 1280, When chụp Toàn cảnh lúc đang tải và lúc xong, Then hai ảnh cho thấy cùng một hàng tiêu đề (cùng số dòng chữ tiêu đề), nút «Hỏi Kara» có mặt ở cả hai ảnh ở cùng chỗ.

## Coverage

- Bỏ quét không gian tiêu chí — xem dòng sổ «bỏ coverage-scan»: lỗi một chiều (một khung chờ thiếu một nút), các
  trục khổ × trạng thái × ngôn ngữ đã nằm sẵn trong phép đo E12 của `khung-man-chung` và trong AC-2.

## Out of scope

- Đổi bố cục đầu trang OKR ở khổ hẹp (tiêu đề xuống dòng khi cụm phải có nút và ô chọn kỳ) — bố cục của #419,
  vòng này chỉ cho khung chờ khớp nó.
- Tổng quan của vai chỉ OKR — không có khung chờ riêng cho đầu trang, nút dựng từ máy chủ cùng tiêu đề.
- Lỗi hydration của Theo đơn vị (`trang-thai-okr.tsx`, `DangTai`) — hàng `ngan-soan-hydrat-theo-don-vi` của DH2.

## Notes

- Hạng T2: chỉ `apps/app`.
- Sau khi gộp nhánh vào `onehub` mới nhất, ghim lại hồ sơ đã ký `khung-man-chung` cùng lượt làn với hồ sơ này
  (`repin-lane --slug dau-trang-okr-cho-nut-hoi-kara --slug khung-man-chung`), để E12m của nó đứng trên cây đã sửa.
