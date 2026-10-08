# «Đã lưu trữ» báo lỗi tải và cho thử lại — thiết kế (E3b `da-luu-tru-tai-loi`)

Ngày: 2026-10-08 · Hạng: T2 · Đợt: sau-14-10, dãy P3 · Hồ sơ: `_acceptance/da-luu-tru-tai-loi/`

## Vấn đề

Ở Cài đặt › Giai đoạn, khối «Đã lưu trữ (n)» (`DaLuuTruGiaiDoan` trong `giai-doan-settings.tsx`, thêm ở
`danh-sach-keo-chung`) đọc `giaiDoan.archived` bằng `useQuery` riêng và truyền `data ?? []` cho
`ArchivedList`. `ArchivedList` trả `null` khi danh sách rỗng, nên:

- tải lỗi → khối biến mất, trông y như «không có giai đoạn nào đã lưu trữ»; không thông báo, không thử lại;
- đang tải → khối cũng biến mất (trả rỗng), lệch luật «Đang tải: khung xương… Không `return null`».

`docs/settings.md` mục «Trạng thái»: lỗi khi tải = `Empty` có nút thử lại. Nguồn: Ngoài-3, Ngoài-5 của
`danh-sach-keo-chung` (Cổng Bằng chứng 2026-10-08, «mở hợp đồng mới» → luật 26 = Cổng Đáng `build`).

## Cách làm

Chỉ sửa `DaLuuTruGiaiDoan`, không đổi `ArchivedList` (`packages/ui`) hay API:

- Chưa có dữ liệu mà đã từng lỗi (`daCat.data === undefined && daCat.errorUpdateCount > 0`) → thay khối
  bằng `Empty border="solid"` (bậc 1, `packages/ui`): tiêu đề «Không tải được danh sách giai đoạn đã lưu
  trữ», mô tả «Kiểm tra kết nối rồi thử lại.», nút `outline` «Thử lại» gọi `daCat.refetch()` — chỉ tải lại
  danh sách đã lưu trữ, không tải lại trang hay danh sách giai đoạn đang dùng. Nút khoá khi
  `daCat.isFetching`. Không dựa vào `isError`: TanStack Query đưa truy vấn chưa có dữ liệu về
  `status: pending`, `error: null` ngay khi tải lại, nên chia theo `isError`/`isPending` làm khung lỗi nháy
  sang khung xương (gap-probe P1); `errorUpdateCount` không bị xoá khi tải lại.
- Chưa có dữ liệu và chưa từng lỗi (`errorUpdateCount === 0`) → một dòng `Skeleton` cao bằng nút gập
  «Đã lưu trữ (n)». App thử lại một lần với lỗi 5xx (`lib/trpc/query-client.ts`), nên khung lỗi hiện sau
  lần thử lại đó.
- Tải xong: như cũ (có giai đoạn đã cất → mục gập; không có → không có gì).
- Không phụ thuộc quyền: người không quản trị vẫn thấy khối lỗi và thử lại được (đọc là quyền của mọi
  thành viên; chỉ «Khôi phục» bị khoá).

Chữ mới ở `apps/app/lib/messages/settings.ts`, khoá `giaiDoan.loiTaiDaLuuTru` (vi, en); dùng lại
`giaiDoan.loiTaiMoTa` và `giaiDoan.thuLai` có sẵn.

## Loại

- **Thêm trạng thái lỗi vào `ArchivedList` của `packages/ui`**: mọi nơi dùng (Tổ chức, danh mục) được lợi,
  nhưng Tổ chức đọc đã-lưu-trữ từ cùng truy vấn cây (đã có trạng thái lỗi của trang), nên hiện chỉ Giai
  đoạn cần; mở rộng thành phần chung khi có nơi thứ hai cần.
- **Gộp `archived` vào `giaiDoan.list`**: một truy vấn, một trạng thái lỗi — nhưng đổi hình dạng đầu ra
  mà nhiều nơi đọc (bảng, Kanban, Kara), vượt phạm vi.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Cài đặt › Giai đoạn → ba thẻ nhóm → cuối trang «Đã lưu trữ (n)» (điểm ra: mở gập, Khôi phục)
- Biên: không có giai đoạn đã lưu trữ → không có khối; đang tải → một dòng khung xương
- Lỗi & quay lại: tải danh sách đã lưu trữ lỗi → khối lỗi có «Thử lại» → bấm → danh sách hiện ra (hoặc lỗi vẫn còn, bấm lại được)

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cài đặt › Giai đoạn | sắp, đổi tên, lưu trữ, khôi phục giai đoạn thoả thuận | thanh bên Cài đặt / Kanban và bảng thoả thuận |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-da-luu-tru-dang-tai | Giai đoạn | một dòng khung xương ở chỗ «Đã lưu trữ» | chờ |
| ST-da-luu-tru-loi | Giai đoạn | khung `Empty` viền liền: «Không tải được danh sách giai đoạn đã lưu trữ», «Kiểm tra kết nối rồi thử lại.», nút «Thử lại» | bấm Thử lại |
| ST-da-luu-tru-dang-thu-lai | Giai đoạn | khung lỗi, nút «Thử lại» khoá | chờ |
| ST-da-luu-tru-co | Giai đoạn | mục gập «Đã lưu trữ (n)» như `danh-sach-keo-chung` | mở gập, Khôi phục |
| ST-da-luu-tru-rong | Giai đoạn | không có khối | không |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- «Thử lại» chỉ tải lại `giaiDoan.archived`; ba thẻ nhóm giữ nguyên, không nháy.
- Khối lỗi không chặn kéo, lưu trữ hay đổi tên giai đoạn đang dùng.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Empty` (`border="solid"`) | dùng (bậc 1) | `docs/settings.md`: lỗi tải = `Empty` có nút thử lại |
| `Skeleton` | dùng (bậc 1) | trạng thái đang tải, không trả rỗng |
| `ArchivedList` | dùng (bậc 1), không đổi | mục gập đã có từ `danh-sach-keo-chung` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: không đổi khuôn — chỉ thêm hai trạng thái cho một khối có sẵn, theo bốn trạng thái của `docs/settings.md`.
<!-- UX-SPEC-TEMPLATE>>> -->

## Kiểm

- `apps/app/test/da-luu-tru-tai-loi.dom.tsx` (mới): lỗi → khối lỗi; Thử lại → danh sách; thử lại vẫn lỗi;
  đang tải → khung xương; người không quản trị; danh sách giai đoạn đang dùng không bị tải lại.
- Màn thật qua `mot-luot.sh`: chặn yêu cầu `giaiDoan.archived` trong trình duyệt → khối lỗi ở 1440 và 375;
  bỏ chặn, bấm «Thử lại» → «Đã lưu trữ (n)» hiện.
- Hồi quy: `giai-doan-cai-dat.dom.tsx` không sửa kỳ vọng.
