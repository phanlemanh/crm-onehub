# Vùng kéo-thả tệp nguồn dựng trên ReUI — thiết kế

Ngày: 2026-09-28 · Hồ sơ: `_acceptance/nguon-keo-tha-reui/` · Hạng: T2

## Vì sao

`packages/ui/src/components/nguon-keo-tha.tsx` (vùng kéo-thả một tệp Word/PDF trong
hộp «Tải nguồn lên» của kho tài liệu) được dựng tay ở bậc 5 của thang «Vẽ tay là bậc
cuối» (`docs/design.md`): tự bắt `dragenter/dragleave/dragover/drop`, tự giữ trạng thái
kéo, tự nối ô tệp. ReUI có sẵn ở bậc 3 thành phần miễn phí `file-upload` — phát hành
dưới dạng móc `@reui/use-file-upload` — cùng ví dụ `c-file-upload-3` «Basic drag and
drop file upload». Vòng này đưa vùng kéo-thả về bậc 3.

## Đo trước khi chọn

`bun run ui:add @reui/c-file-upload-3 --dry-run` (từ `packages/ui`) cho:

| Tệp | Việc |
| --- | --- |
| `src/components/reui/alert.tsx` | tạo — bản `alert` thứ hai cạnh `alert.tsx` của kho |
| `src/components/button.tsx` | **ghi đè** bản đã tuỳ biến |
| `src/hooks/use-file-upload.ts` | tạo |
| `src/components/examples/c-file-upload-3.tsx` | tạo — `Pattern` nhiều ảnh, có ảnh xem trước, icon Lucide, `import { cn } from "cn"` |
| `globals.css` | thêm 18 biến màu mở rộng của ReUI |

`bun run ui:add @reui/use-file-upload --dry-run` chỉ tạo `src/hooks/use-file-upload.ts`.

## Hướng đã duyệt (A)

Ba hướng được xét trong brainstorm; người duyệt chọn A.

- **A — chỉ cài móc, ghép theo bố cục `c-file-upload-3`.** Cài `@reui/use-file-upload`
  vào `packages/ui/src/hooks/`, sửa bốn chỗ của `docs/reui.md` (chỉ chỗ «chú thích» có
  việc: móc không dùng `cn`, icon hay màu). Viết lại `NguonKeoTha` trên móc theo bố cục
  của ví dụ: một hàng viền đứt, nút «Chọn tệp» và dòng gợi ý. Tệp ví dụ không cài.
- B — cài nguyên `c-file-upload-3`: phải chặn ghi đè `button`, rồi gỡ `alert` thứ hai,
  18 biến màu, icon Lucide và phần ảnh xem trước — cài xong xoá gần hết. Loại.
- C — giữ khung to hiện tại, chỉ thay phần kéo-thả bằng móc. Rủi ro thấp nhất nhưng
  không theo bố cục ví dụ người yêu cầu. Loại.

### Hợp đồng của `NguonKeoTha` giữ nguyên

Tên tệp, tên export, `lyDoTuChoiTep`, các prop (`nhan`, `moTa`, `chapNhan`, `toiDaByte`,
`tat`, `onChon`, `onTuChoi`, `loi`) và các dấu máy-đọc (`data-slot="nguon-keo-tha"`,
`data-tat`, `data-keo`, `input[type=file]` mang `accept`, `aria-describedby`,
`aria-invalid`) giữ nguyên, vì hai phép đo đang sống bám vào chúng mà không được sửa:

- `packages/ui/test/nguon-canh-nhau.dom.tsx` (khối `NguonKeoTha`).
- `apps/app/test/tai-lieu-nguon.dom.tsx` (E3d, E5d, E10d của `may-soan-de-xuat`) và
  `_acceptance/may-soan-de-xuat/rang/man-tai-nguon.mjs` (E2u) — hồ sơ đã ký.

Thêm đúng một prop: `nutChon` — nhãn nút mở hộp chọn tệp.

### Phân vai giữa móc và thành phần

- Móc giữ: trạng thái đang kéo (`isDragging`), bốn bộ bắt sự kiện kéo-thả, `openFileDialog`,
  và `getInputProps` (ô tệp, `ref`, `onChange`). Thả khi ô tệp khoá thì móc bỏ qua.
- Thành phần gọi móc **không truyền `accept`/`maxSize`** để móc không tự từ chối bằng câu
  tiếng Anh; `accept` vẫn đặt lên ô tệp qua `getInputProps({ accept })`. Tệp tới qua
  `onFilesAdded` → thành phần phân loại bằng `lyDoTuChoiTep` của kho → `onChon` hoặc
  `onTuChoi(tep, "loai" | "co")`.
- Tác dụng phụ của móc (đo 28/09): `addFiles` tạo URL xem trước bằng `URL.createObjectURL` cho
  mọi tệp và giữ danh sách tệp riêng; chỉ URL của ảnh được thu hồi. Môi trường DOM của `bun test`
  có hàm này (Bun tự có, preload jsdom không che), nên hai tệp test đã ký chạy nguyên văn được.
  Móc giữ nguyên như bản ReUI — mỗi tệp Word/PDF đã chọn giữ một URL tới khi đóng trang.
- Vùng tắt vẫn nối bốn bộ bắt của móc (để thả vào vùng tắt không làm trình duyệt tự mở tệp — móc
  gọi `preventDefault` rồi bỏ qua vì ô tệp khoá), nhưng `data-keo` = đang kéo VÀ không tắt.
- Ô tệp `tabIndex={-1}`: phím Tab dừng ở nút «Chọn tệp», không dừng hai lần. Nút mang cùng
  `aria-describedby` với ô tệp (mô tả, lý do tắt, câu lỗi).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: tab Tài liệu → «Tải nguồn lên» → hộp tải → bấm «Chọn tệp» hoặc thả tệp vào hàng
  viền đứt → dòng «tệp đã chọn» hiện dưới vùng → điền đích → «Tải lên» (điểm ra: tab Nguồn).
- Biên: lưu tệp nguồn chưa bật → nút «Tải nguồn lên» ngoài trang đã khoá (không đổi); nếu
  vùng nhận `tat` thì nút «Chọn tệp» và ô tệp khoá, lý do hiện dưới vùng.
- Lỗi & quay lại: tệp sai loại / quá 20 MB → câu lỗi đỏ dưới vùng, viền vùng đổi sang
  `destructive`, tệp không được giữ; chọn hay thả tệp khác → câu lỗi mất.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hộp «Tải nguồn lên» | nhận một tệp Word/PDF và nơi nó sẽ vào | nút «Tải nguồn lên» / tab Nguồn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-hop-tai-thuong | Hộp tải | hàng viền đứt: nút «Chọn tệp» + «Kéo tệp vào đây, hoặc chọn tệp» + «Word (.docx) hoặc PDF, tới 20 MB» | bấm nút hoặc thả tệp |
| ST-hop-tai-dang-keo | Hộp tải | viền đổi `border-ring`, nền `bg-muted/50` (`data-keo="true"`) | thả tệp |
| ST-hop-tai-loi | Hộp tải | viền `destructive`, câu lỗi dưới vùng gắn vào ô tệp và nút | chọn tệp khác |
| ST-hop-tai-tat | Hộp tải | vùng mờ, nút khoá, lý do dưới vùng | nhờ quản trị bật lưu tệp |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Chỉ một tệp: thả nhiều tệp thì lấy tệp đầu (như bản cũ).
- Phím: Tab dừng ở nút «Chọn tệp»; Enter/Space mở hộp chọn tệp của trình duyệt.
- 390 px: chữ gợi ý xuống dòng, hàng không làm hộp tràn ngang.
- Theo `web-design-guidelines` (chuẩn giao diện khai ở `feature_loop.ui_standards_skill`):
  không lấy `animate-bounce` của ví dụ khi đang kéo (luật `prefers-reduced-motion`); ô tệp ẩn
  mang `aria-label` bằng nhãn nút (luật «form control cần nhãn»); cử chỉ thả có đường bấm và
  phím thay thế là nút «Chọn tệp».

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `useFileUpload` (`@reui/use-file-upload`) | dùng | thành phần `file-upload` miễn phí của ReUI, bậc 3 |
| `NguonKeoTha` | ghép | bố cục `c-file-upload-3` dựng bằng `Button`, `Field*`, `Icon` sẵn có |
| `Button variant="outline"` | dùng | chỉ «Tải lên» của hộp được tô nền |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: vùng nằm trong hộp thoại một cột đã có; vòng không đổi luồng hay màn, chỉ đổi
thành phần — luồng hiển nhiên nên không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Đo

- Hai tệp test hiện có chạy nguyên văn: khối `NguonKeoTha` của `nguon-canh-nhau.dom.tsx`;
  `tai-loi`, `nguon-tat`, `hang-nguon` của `tai-lieu-nguon.dom.tsx`.
- Tệp test mới `packages/ui/test/nguon-keo-tha.dom.tsx`: nút «Chọn tệp» mở ô tệp; Tab chỉ
  dừng ở nút; nút mang mô tả và lỗi; tắt thì nút khoá; kéo vào/ra bật/tắt `data-keo`.
- `rang/cai-sach.mjs`: bản cài sạch (móc không chú thích, không `cn`/Lucide, `button.tsx`,
  `alert.tsx`, `globals.css`, `package.json` không đổi, không có `reui/alert.tsx` hay
  `examples/`) và vùng không tự bắt sự kiện kéo-thả. Có `--chieu-do` trên bản sao.
- Màn thật: E2u của `may-soan-de-xuat` (`msd_man_tai_nguon`) chụp hộp ở 1440 và 390.
- `msd_san_thiet_ke` (design-gate static) phủ `packages/ui/src/components/nguon-*.tsx`.
