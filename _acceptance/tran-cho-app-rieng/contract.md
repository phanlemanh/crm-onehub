---
schema_version: 1
feature: "Bài app-rieng chạy cạnh apps/agent có trần chờ riêng"
slug: tran-cho-app-rieng
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-14T23:30:45Z
design_doc: docs/superpowers/specs/2026-10-15-tran-cho-app-rieng-design.md
---

# Acceptance Contract: tran-cho-app-rieng

## Context

Bài «chạy cạnh apps/agent» của Soạn OKR đỏ 4 lần ngày 14/10 ở làn ghim của F24 (chặn #406) vì hết trần mặc định
5 000 ms của bun khi lần gọi `/eve/v1/health` đầu tiên chậm; chạy riêng thì xanh. Giám sát r2 giao 14/10.

Source input: nhật ký làn ghim F24 (repin-20261014T230428Z-37869) · design doc.

## Criteria

- AC-1: Given mọi lời gọi tới `/eve/v1/health` trong tiến trình test bị làm chậm thêm 6 000 ms, When chạy bài «chạy cạnh apps/agent» của bản sửa, Then bài xanh (đúng một bài chạy và qua); và không làm chậm thì cũng xanh.
- AC-2: Given cùng độ chậm 6 000 ms, When chạy bài đó của bản trước vòng (3818ad4ec), Then bài đỏ với «timed out after 5000ms»; không làm chậm thì xanh; và sau lượt đo cây không còn tệp tạm.
- AC-3: Given diff của vòng tính từ merge-base với onehub, When bỏ tệp hồ sơ và tài liệu, Then chỉ còn `apps/agent-okr/test/app-rieng.integration.spec.ts` và `apps/agent-okr/test/support/khoi-dong.ts`; trần là hằng `KHOI_DONG.baiHaiMay.tranMs`, không số trần viết tại chỗ; và danh sách thêm một tệp ngoài thì thước đánh không đạt.

## Coverage

Quét tay một trục: độ chậm của lời gọi health — không chậm và chậm quá trần cũ (6 000 ms) — × hai bản → AC-1, AC-2.
`[CE chưa kiểm chứng]`

## Out of scope

- Các bài app-rieng khác (đã xanh ở mọi lượt đỏ của F24; trần chờ khởi động của `beforeAll` đã riêng).
- Vì sao `/eve/v1/health` đầu tiên chậm (biên dịch eve dev lúc gọi đầu) — không đổi eve hay mã sản phẩm.

## Notes

- Đường nền chưa chạy cho hồ sơ này: cây đã sửa trước khi mở hồ sơ (việc gấp chặn #406); S4 chạy trọn suite trên đỉnh mới.
