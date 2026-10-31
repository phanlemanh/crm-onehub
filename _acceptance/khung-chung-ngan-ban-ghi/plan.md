# Kế hoạch — khung-chung-ngan-ban-ghi

Phần mã dựng ngay ở S1 để có bản mẫu chạy bằng thành phần thật (luật 33) và để đo răng trên mã thật. S2 ghi lại thứ tự
đã làm và việc còn lại; S3 chỉ còn rà.

| # | Việc | Tệp | Trạng thái | Đo bằng |
|---|---|---|---|---|
| 1 | Hình «ngan» cho `KhungXuong` (cham-tep K-6) | `packages/ui/src/components/khung-xuong.tsx` | xong 845f2a6f9 | E3, E11 |
| 2 | `KhungNgan` + `RecordSheetFrame`, khe bắt buộc, `KhungTaiLoi`, `KhungXuongNgan` | `record-parts.tsx` | xong 845f2a6f9 | E3–E7, E11 |
| 3 | Ngăn KR vào khung qua `KhungKr` + `useTrangKhungKr` | `kr-sheet.tsx` | xong 845f2a6f9 | E1, E8 |
| 4 | Ngăn Số KR vào khung | `so-kr-sheet.tsx` | xong 845f2a6f9 | E1, E8 |
| 5 | Khuôn và luật thiết kế | `design/patterns/ngan-ban-ghi.md`, `docs/design.md` | xong ffef9eabb | E2 |
| 6 | Bản mẫu bảy ngăn × ba trạng thái (cham-tep K-7) | `apps/app/app/proto/…` | xong ffef9eabb | E9, E10 |
| 7 | Gộp onehub sau khi #609 lên (cùng sửa `docs/design.md`) | — | chờ #609 | E2 chạy lại |

Không có migration, không chạm API. Lệnh cổng kho trước S4: `bun run check-types`, `bun run lint`, `bun run lint:slop`,
`bun run build --filter=app`.
