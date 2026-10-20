# Quét độ phủ — ngan-kr-mot-cho (VK7)

Preset `entity-feature` + `test-matrix` của `morphological-scan`, 20/10/2026. Thực thể là một KR và ngăn của nó.

## Ngữ cảnh

- Sản phẩm: CRM OneHub, khu Mục tiêu (OKR) — chân sản phẩm: đào kho (`record-stack.ts`, `kr-sheet.tsx`,
  `so-kr-sheet.tsx`, `objective-sheet.tsx`, `hop-thoai-cap-nhat-kr.tsx`, `okr-cap-nhat.ts`, `okr-kr.ts`,
  `schema.prisma`, bản mẫu `NganKr` ở `2790552ac`) · chân ngành: Tability — một ngăn KR, «Create check-in» ở đầu, ‹ ›
  sang KR kế, 3 bấm [SUY-TỪ-REPO: docs/plan/lo-trinh-okr.json, trường `vi_sao` của VK7, ghi từ lượt rà Tability 18/10].

## Trục

- **Trục A — lối vào KR:** dòng KR trang đơn vị | nút Việc trong bảng KR | con số KR | thẻ KR sơ đồ | khối KR Tổng quan,
  Của tôi, họp tuần | ‹ › từ ngăn KR khác.
  - Thước CE: bảng lối hôm nay (khảo sát 20/10) [SUY-TỪ-REPO: apps/app/components/crm/record-sheet/record-stack.ts];
  «bấm ở bốn chỗ ra bốn nơi» [SUY-TỪ-REPO: docs/plan/lo-trinh-okr.json].
- **Trục B — người xem và KR:** được cập nhật | chỉ đọc | KR số | KR mốc | KR đã bỏ hay chu kỳ khép.
  - Thước CE: `canEditKr`, `hienTaiQuaCapNhat` [SUY-TỪ-REPO: apps/app/components/crm/record-sheet/objective-sheet.tsx];
  `tienDoKr` [SUY-TỪ-REPO: packages/validation/src/okr-kr.ts].
- **Trục C — vị trí KR:** đầu | giữa | cuối | mục tiêu một KR.
  - Thước CE: `OkrKeyResult.position` [SUY-TỪ-REPO: packages/db/prisma/schema.prisma].
- **Trục D — trạng thái:** đang tải | lỗi | không thấy | giá trị hợp lệ | giá trị sai | chưa chọn tự tin | gửi hỏng.
  - Thước CE: nếp «Chờ tải và lỗi tải» [SUY-TỪ-REPO: docs/design.md]; hộp hôm nay [SUY-TỪ-REPO:
  apps/app/app/(app)/[slug]/okr/hop-thoai-cap-nhat-kr.tsx].

## Không gian (A × B rút gọn)

| Lối \ Người xem | Được cập nhật | Chỉ đọc |
|---|---|---|
| Mọi lối mở KR | Core (AC-1, AC-2 có nút) | Core (AC-2 không nút) |
| Nút Cập nhật trên dòng | Core (AC-6, AC-7) | — vô nghĩa (không có nút) |
| Nút Cập nhật đầu ngăn | Core (AC-5) | — vô nghĩa |
| ‹ › | Core (AC-4) | Core (AC-4) |

Lát C: AC-4 (đầu, cuối, một KR ở AC-2). Lát D: AC-8 (hộp), AC-10 (ngăn). Kiểu KR (số, mốc): AC-8.

## Core

1. Mọi lối mở `{ kind: "kr" }` (AC-1).
2. Đầu ngăn có mục tiêu, đếm, ‹ ›, Cập nhật theo quyền (AC-2).
3. Thân ngăn gộp số, lịch sử có đồ thị, việc, số và nguồn, chi tiết (AC-3).
4. ‹ › bằng `thayDinh`, ngăn không đóng (AC-4).
5. Cập nhật ở đầu ngăn, ngăn ở lại (AC-5).
6. Cập nhật trên dòng, «…» còn (AC-6).
7. 3 bấm, ghi thật (AC-7).
8. Hộp xem trước điểm mới so với đích (AC-8).
9. Hẹp (AC-9). 10. Trạng thái và chữ (AC-10). 11. Màn thật, hồ sơ đã ký (AC-11).

## Later

- ‹ › qua cả bộ OKR (nếu Hỏi-2 chọn trong một mục tiêu).
- Cập nhật hàng loạt trong ngăn; Kara gợi ý giá trị; lối `record=kr:` từ tin nhắc và thông báo.
- [NGÀNH: Tability] bình luận ngay trên lần cập nhật trong ngăn — thuộc VK12 «Cập nhật gần đây» (trả lời tại chỗ).

## Never

- Sửa tại chỗ trong thân ngăn — thêm nơi cập nhật thứ hai.
- Bỏ bắt buộc mức tự tin để còn 2 bấm — mất tín hiệu tự tin của lần cập nhật.

## Cross-cutting

- 1440 | 390 (Sheet | Drawer); `vi` | `en`; `translate="no"`; phím và tiêu điểm; chồng ngăn của VS8; hồ sơ đã ký.
