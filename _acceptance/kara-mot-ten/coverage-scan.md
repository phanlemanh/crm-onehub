# Quét vùng phủ — kara-mot-ten

## Ngữ cảnh
- Sản phẩm: OneHub Center (CRM nội bộ của OneHub, có khu OKR, Tài liệu, Zalo) — chân sản phẩm: `CLAUDE.md`, `CONTEXT.md`, `docs/ai-ux.md` · chân ngành: HubSpot (AI tên «Breeze» trên mọi bề mặt, kể cả phần cài đặt «Breeze Copilot», «Breeze Agents»), Salesforce («Einstein» / «Agentforce» — tách tên AI và tên tác nhân đội dựng) [NGÀNH: HubSpot Breeze, Salesforce Agentforce].

Đối chiếu ngành cho hai điều: (1) một tên AI xuyên mọi bề mặt, kèm hậu tố phạm vi ở chỗ cài đặt — HubSpot ghi «Breeze Copilot», «Breeze Agents», trùng khuôn «Kara · OKR»; (2) tách tên AI với tên vật người dựng — Salesforce gọi vật đội dựng là «agent», tên dịch vụ là «Agentforce», trùng luật «Tác nhân là vật đội dựng».

## Trục
- Trục A — bề mặt: tab bản ghi · tóm tắt tuần · Soạn OKR · Cài đặt · Tài liệu · dùng chung · Zalo [thước CE: sáu bề mặt của câu giao + kiểm kê 13/10 `[SUY-TỪ-REPO: docs/superpowers/specs/2026-10-13-kara-mot-ten-design.md]`]
- Trục B — nơi chữ sống: kho chữ `apps/app` · kho chữ `packages/ui` · chuỗi trong `packages/validation` · câu `apps/api` trả về · chuỗi `apps/agent` ghi hay gửi · chữ cứng trong tệp giao diện [thước CE: kiểm kê 13/10 `[SUY-TỪ-REPO: apps/app/lib/messages]`]
- Trục C — nghĩa chữ: tên AI (đổi) · vật đội dựng (giữ) · cửa vào Zalo (giữ) · công thức số đo (giữ) · hạ tầng (giữ) [thước CE: `[SUY-TỪ-REPO: docs/ai-ux.md]` §1, `[SUY-TỪ-REPO: CONTEXT.md]` mục «Kara», «Tác nhân», «Bot Zalo»]
- Trục D — giữ lâu: luật máy chặn tên cũ quay lại · bài có sẵn đổi theo [thước CE: `[SUY-TỪ-REPO: docs/plan/lo-trinh-okr.json]` ghi chú K6a «Ghim khoá mới ở messages-guard»]

## Không gian (A × B, ô có nghĩa)

| Bề mặt \ nơi | kho chữ app | kho chữ ui | validation | api | agent | chữ cứng |
|---|---|---|---|---|---|---|
| tab bản ghi | AC-1 | — | — | — | — | AC-1 (ảnh sản phẩm) |
| tóm tắt tuần | AC-2 | — | — | — | AC-2 (tin-nhac) | — |
| Soạn OKR | AC-3 | — | — | AC-3 (okr-config) | — | — |
| Cài đặt | AC-4 | — | — | — | — | — |
| Tài liệu | AC-5 | — | AC-5 | AC-5 | AC-5 | — |
| dùng chung | — | AC-6 | — | — | — | — |
| Zalo | — | — | AC-5 (hết hạn mức) | — | Hỏi-1 (lời dặn) | — |

Ô «—»: kiểm kê 13/10 không thấy chuỗi nào ở đó.

## Core
1. Mọi ô có chuỗi trong bảng — câu giao hứa «mọi chỗ».
2. Trục C giữ (AC-8) — không giữ thì luật một tên ăn mất tên một tính năng có thật.
3. Trục D (AC-7, AC-9) — không có luật máy thì tên cũ quay lại ở tệp chữ mới (Tài liệu đã thêm 35 chuỗi sai sau 01/10).

## Later
- Lời dặn mô hình tự xưng (Hỏi-1).
- Đổi tên khoá, tên tệp, thư mục mã.

## Never
- Trang `/proto/**` — bản mẫu đóng băng, không người dùng.

## Cross-cutting
- Mỗi chuỗi đổi cả vi và en.
- Dữ liệu người nhập (tên tác nhân do đội đặt) không đổi.

## [GIẢ ĐỊNH] chờ gạch ở Cổng 1
- [GIẢ ĐỊNH] «Zalo» trong câu giao được phủ bằng câu Kho tài liệu mà Zalo thấy; lời tự xưng của mô hình trên Zalo là Hỏi-1.
