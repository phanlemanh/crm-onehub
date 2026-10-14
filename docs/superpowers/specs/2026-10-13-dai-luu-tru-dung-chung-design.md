# Dải lưu trữ dùng chung — thiết kế

Hàng V2e của `docs/plan/lo-trinh-okr.json`, dãy P3 đợt r2. Cổng Đáng `build` (chủ kho, 2026-10-12T23:58:15Z). Mở từ
Ngoài-7 ở Cổng Bằng chứng của V2 `vong-doi-mot-cach-cat` (09/10): dải báo và vùng khoá dựng trong `apps/app`, chưa
thành mảnh chung.

## Vấn đề

`docs/vong-doi.md` dặn: «Lắp từ mảnh có sẵn, đừng dựng lại. Mảnh nào chưa có thì thêm vào `packages/ui` rồi mới
dùng.» Bảng «Mảnh dùng chung» của nó còn ghi dòng «Dải báo bản ghi đã lưu trữ» là «chưa — lượt 2».

V2 đã dựng hai mảnh cho ngăn bản ghi đã cất, nhưng đặt trong `apps/app/components/crm/record-sheet/record-actions.tsx`:

| Mảnh | Việc | Dùng ở |
| --- | --- | --- |
| `DaiLuuTru` | dải đầu ngăn «Đã lưu trữ ngày … · Khôi phục» | ngăn Công ty, Cá nhân, Thoả thuận |
| `KhoaLuuTru` | bọc phần chi tiết trong `<fieldset disabled>` và chặn bấm vào chỗ sửa | ba ngăn trên |

Loại bản ghi kế tiếp có ngăn chi tiết và trạng thái đã cất (khuôn kế hoạch, đơn vị, trang tài liệu ở lượt 3b) sẽ
phải với vào thư mục `record-sheet` của CRM hoặc chép lại — đúng kiểu thứ mười sáu mà `docs/vong-doi.md` sinh ra để
chặn. `AGENTS.md`: «`/packages/ui` is the single source of truth for UI».

## Cách làm

**Hai mảnh vào `packages/ui/src/components/dai-luu-tru.tsx`**, giữ tên đang dùng:

- `DaiLuuTru` — phần trình bày: khung `shrink-0 border-b p-3`, `Alert` có icon lưu trữ, tiêu đề, nút «Khôi phục»
  `variant="outline" size="sm"`. Nhận `tieuDe: ReactNode` (chỗ gọi ghép chữ và ngày), `nhanKhoiPhuc: string`,
  `onKhoiPhuc: () => void`, `dangKhoiPhuc?: boolean`. Giữ `data-dai-luu-tru` (bài của V2 đọc nó), thêm
  `data-slot="dai-luu-tru"` theo nếp shadcn của kho. `packages/ui` không biết tRPC, chữ của app hay
  `LocalDateTime` — đúng nếp `ArchivedList` nhận `label`, `restoreLabel` qua prop.
- `KhoaLuuTru` — chép nguyên: `<fieldset disabled={khoa} className="contents">` cộng bốn bộ chặn capture
  (pointerdown, mousedown, click, keydown) trên bộ chọn chỗ sửa. Không có phụ thuộc app nào nên dời trọn.

**Phần CRM giữ ở `record-actions.tsx` một lớp mỏng** `DaiLuuTruBanGhi({record, archivedAt})`: gọi
`useRestoreRecord(record)`, ghép `m.sheet.daLuuTruNgay` + `LocalDateTime` thành `tieuDe`, truyền `m.bulk.restore`,
`restore.mutate` và `dangKhoiPhuc={restore.isPending}` xuống mảnh chung — nút tắt trong lúc chờ, như V2 đang làm. Ba ngăn đổi `DaiLuuTru` → `DaiLuuTruBanGhi` và nhập `KhoaLuuTru` từ
`@crm/ui/components/dai-luu-tru`. Định nghĩa cũ của hai mảnh rời khỏi `apps/app`.

**`docs/vong-doi.md`**: dòng «Dải báo bản ghi đã lưu trữ» trong bảng «Mảnh dùng chung» thành «có —
`DaiLuuTru`, `KhoaLuuTru` (`packages/ui`)».

Không đổi chữ, không đổi khoá chữ, không đổi hình, không đổi máy chủ.

## Không làm

- Lắp dải báo vào ngăn của loại bản ghi khác (khuôn kế hoạch, đơn vị, trang tài liệu) — việc của lượt mang loại đó.
- Nút «Đã lưu trữ» trên thanh công cụ bảng thành mảnh chung — dòng riêng của bảng «Mảnh dùng chung».
- Toast lưu trữ có «Hoàn tác» — đã là `baoDaLuuTru` ở `packages/ui` từ V2.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở một bản ghi đã cất (bảng › bản ghi) → dải «Đã lưu trữ ngày dd/mm/yyyy» với «Khôi phục» đầu ngăn, các ô
  chi tiết chỉ đọc (điểm ra: bấm «Khôi phục», hoặc đóng ngăn).
- Biên: bản ghi đang dùng → không có dải, ô sửa được như thường.
- Lỗi & quay lại: khôi phục lỗi → toast lỗi như hôm nay, dải và vùng khoá giữ nguyên.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Ngăn Công ty / Cá nhân / Thoả thuận | xem và sửa một bản ghi | bảng của loại đó / đóng ngăn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-ngan-da-cat | ngăn bản ghi | dải «Đã lưu trữ ngày …» + «Khôi phục», ô chi tiết tắt | bấm «Khôi phục» hoặc đóng |
| ST-ngan-dang-dung | ngăn bản ghi | không dải, ô sửa được | sửa |
| ST-dang-khoi-phuc | ngăn bản ghi | nút «Khôi phục» tắt trong lúc chờ | chờ |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Không đổi so với V2: cùng chữ, cùng nút, cùng vùng khoá, cùng chỗ đặt.
- Ngày đi qua `LocalDateTime` (Intl) ở phía app; mảnh chung chỉ nhận nút đã ghép.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Alert`, `AlertTitle`, `AlertAction`, `Button`, `Icon` (`packages/ui`) | ghép | dải báo dựng từ mảnh có sẵn như V2 |
| `DaiLuuTru`, `KhoaLuuTru` (`packages/ui/src/components/dai-luu-tru.tsx`) | tạo (dời từ `apps/app`) | bậc 5 của `docs/design.md`: không bậc nào có; ReUI không có dải trạng thái bản ghi |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: ngăn bản ghi là chi tiết của bảng; vòng này chỉ dời mã, không đổi luồng — luồng hiển nhiên, không tra.
<!-- UX-SPEC-TEMPLATE>>> -->

## Chuẩn nội đã nạp

`feature_loop.ui_standards_skill: web-design-guidelines` — nạp bản Web Interface Guidelines (13/10). Áp ở đây: hành
động là `<button>`, icon trang trí `aria-hidden` (đã có ở `Icon`), ưu tiên `<fieldset disabled>` gốc thay cho ARIA,
ngày định dạng bằng `Intl`. Bản hướng dẫn không có luật về hình của trạng thái tắt — giữ đúng hình của V2.
