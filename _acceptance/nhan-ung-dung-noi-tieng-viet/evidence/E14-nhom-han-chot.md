# E14 — bằng chứng hội đồng đòi ở vòng 7

Vòng 7, góc nhìn `spec-alignment` để UNCERTAIN và nêu đúng hai thứ cần thấy.
Đây là hai thứ đó.

## Câu (2) — năm nhãn nhóm hạn chốt có đứng cùng một khối không?

**Có.** Chúng là năm lựa chọn của **cùng một facet**, không phải năm chỗ rời rạc.

- `apps/app/components/crm/closing-window.ts:4-15` — `KHOA` liệt kê năm giá trị
  (`overdue`, `this-month`, `next-month`, `later`, `none`), và `closingOptions(locale)`
  trả về cả năm kèm nhãn từ `crmMessages(locale).closing`.
- `apps/app/app/(app)/[slug]/deals/deals-table.tsx:215-222` — chúng nạp vào **một**
  facet `id: "closing"`, nhãn nhóm là `m.facets.closing`.

Nên điều kiện hội đồng nêu — *"nếu hai nhãn cụm động từ không đứng cùng khối hiển
thị với ba nhãn kia thì câu (2) hết vướng"* — **không thoả**. Chúng đứng cùng khối.

Năm nhãn tiếng Việt hiện tại (`apps/app/lib/messages/crm.ts:413-419`):

| khoá | nhãn | loại từ |
| --- | --- | --- |
| `overdue` | Quá hạn | tính từ |
| `thisMonth` | Chốt trong tháng này | cụm động từ |
| `nextMonth` | Chốt tháng sau | cụm động từ |
| `later` | Muộn hơn | tính từ |
| `none` | Chưa có ngày chốt | mệnh đề |

Ba loại từ trong một danh sách năm mục. Điều hội đồng lo là có thật.

**Một lưu ý về chỗ hiện:** `deals-table.tsx:218-222` lọc theo `facetCounts > 0`,
nên một nhãn chỉ hiện khi dữ liệu có ít nhất một thoả thuận rơi vào ô đó. Ảnh chụp
của một cơ sở dữ liệu thử vì thế **không chứng minh được cả năm cùng hiện** — mã
mới chứng minh được. Đó là lý do mục này là chữ và mã, không phải ảnh.

Sửa hay không là quyết định của người ở Cổng 2: đây là chọn chữ sản phẩm, và
`CONTEXT.md` chưa có mục từ cho nhóm này.

## Câu (3) — cặp nhãn cột trên bảng Công ty có dễ lẫn không?

Hai ảnh chụp thật, tiếng Việt, dựng từ máy chủ của chính cây này:

- `evidence/E14-bang-cong-ty-1280.png` — 1280px
- `evidence/E14-bang-cong-ty-1024.png` — 1024px

Bảng có **18 công ty thật** (dữ liệu seed của kho), workspace `onehub`.
Bảy tiêu đề đọc được ở cả hai khổ, không cắt:

`Tên` · `Tên miền` · `Ngành` · `Phụ trách` · `Số lượng cá nhân` ·
`Số thoả thuận đang mở` · `Hoạt động gần nhất`

Cặp hội đồng hỏi — `Số lượng cá nhân` và `Số thoả thuận đang mở` — đứng cạnh
nhau, chung tiền tố `Số`, và khác nhau ngay ở chữ thứ hai (`lượng` / `thoả`).
