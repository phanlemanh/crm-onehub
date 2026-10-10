# Bước Kara bỏ qua việc vô hại hiện «Đã bỏ qua» — design (K6d `buoc-kara-bo-qua`)

Ngày 2026-10-09 · làn P6 đợt sau-14-10 · hạng T2 · Cổng Đáng `build` theo luật 26 (Ngoài-6 của K6b, Cổng 2 2026-10-08T07:13:17Z). Anh chọn lối A.

## Bối cảnh

`outcomeTone` (`apps/app/lib/agent-transcript.ts`) coi `stored === false` hay `written === false` là `warning`; ngăn Kara (`agent-panel.tsx`) đổi `warning` thành bước «Chưa lưu được» và `KaraSteps` (`packages/ui`) tự mở danh sách bước khi có bước như vậy. Công cụ ảnh (`apps/agent/agent/lib/portrait.ts`: `storePortrait`, `runPortrait`) trả `stored: false` cả khi «They already have a photo.» và «Unchanged.» — hai ca vô hại.

## Thiết kế (lối A — công cụ tự khai)

1. **Agent** — `PortraitResult` thêm `skipped?: true`; ba chỗ trả vô hại («They already have a photo.» ở `storePortrait` và `runPortrait`, «Unchanged.») trả `skipped: true` cùng `stored: false`. Ca hỏng thật («The photo could not be fetched…», thiếu Blob, «No such contact.», «No photo on the profile.») không đổi.
2. **Khuôn chung** — `eveToolOutcome` (`packages/validation/src/eve-tool.ts`) thêm cờ `skipped` (cùng khuôn `flag` sẵn có). Mục `did` của dòng thời gian (`packages/validation/src/agent-transcript.ts`) thêm `skipped: boolean` mặc định `false` để dữ liệu cũ vẫn đọc được.
3. **App** — `outcomeTone`: `skipped === true` → `neutral` (đứng trước nhánh cảnh báo); mục `did` mang `skipped`. Khung tạo tác nhân đọc `tone` nên tự hết cảnh báo. `agent-panel.tsx`: `skipped` → trạng thái bước `skipped`.
4. **UI** — `KaraSteps` thêm trạng thái `skipped`: chấm `neutral`, nhãn «Đã bỏ qua» / «Skipped», không tính vào điều kiện tự mở, không đổi tiêu đề danh sách bước.

Trí khôn (việc nào là vô hại) nằm ở `apps/agent` — đúng `AGENTS.md`.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Kara chạy trên một cá nhân đã có ảnh → danh sách bước ở ngăn Kara đóng sẵn, tiêu đề «Đã làm N bước» → mở ra thấy bước tìm ảnh «Đã bỏ qua» chấm xám.
- Lỗi & quay lại: không lấy được ảnh thật → bước vẫn «Chưa lưu được», danh sách tự mở như cũ.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Danh sách bước trong ngăn Kara | cho thấy Kara đã làm gì | tab Kara của bản ghi |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-buoc-bo-qua | Danh sách bước | bước «Đã bỏ qua», chấm trung tính, khối đóng | không cần làm gì |
| ST-buoc-chua-luu | Danh sách bước | bước «Chưa lưu được», chấm cảnh báo, danh sách tự mở | xem lý do |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Bước bỏ qua không mở danh sách bước, không đổi tiêu đề danh sách bước.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `KaraSteps` (`packages/ui`) | mở rộng | thêm một trạng thái trong thành phần dùng chung, không vẽ ở nơi gọi |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: hội-thoại
Căn cứ: không đổi khuôn — danh sách bước nằm trong hội thoại Kara có sẵn.
<!-- UX-SPEC-TEMPLATE>>> -->
