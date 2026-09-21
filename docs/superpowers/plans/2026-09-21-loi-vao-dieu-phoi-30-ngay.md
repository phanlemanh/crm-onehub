# Kế hoạch: loi-vao-dieu-phoi-30-ngay

Mã của vòng này có trước kế hoạch (xem dòng sổ `d-20260921T082259Z-3`). Kế hoạch
ghi lại hai việc đã làm để S4 và người đọc đối chiếu.

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Thanh điều hướng chính có mục «30 ngày đầu» ngay trước Cài đặt | `apps/app/lib/khung-dieu-huong.ts`, `apps/app/components/app-icon-rail.tsx`, `apps/app/lib/messages/khung-ung-dung.ts` | AC-1 (có lối vào), AC-2 (đánh dấu đúng mục), AC-4 (nhãn khớp tiêu đề) |
| Thanh bên Cài đặt có mục «Điều phối 30 ngày» ở cuối | `apps/app/lib/cai-dat-dieu-huong.ts`, `apps/app/app/(app)/[slug]/settings/settings-sidebar.tsx`, `apps/app/lib/messages/settings.ts` | AC-3 (có lối vào Cài đặt), AC-4 (nhãn khớp tiêu đề) |

## Task 1 — mục trên thanh điều hướng chính

- Files: như dòng một của bảng, cộng `apps/app/test/khung-dieu-huong.spec.ts`
- Verify: `cd apps/app && bun test test/khung-dieu-huong.spec.ts`
- Phục vụ E1, E2, E4, E5
- independent: true

## Task 2 — mục trên thanh bên Cài đặt

- Files: như dòng hai của bảng, cộng `apps/app/test/cai-dat-dieu-huong.spec.ts`
- Verify: `cd apps/app && bun test test/cai-dat-dieu-huong.spec.ts`
- Phục vụ E3, E4, E5
- independent: true
