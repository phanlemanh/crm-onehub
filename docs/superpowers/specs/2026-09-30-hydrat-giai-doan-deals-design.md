# Thiết kế: ô Giai đoạn trên màn Deals hydrat khớp máy chủ

Hồ sơ: `_acceptance/hydrat-giai-doan-deals/` · T2 · 30/09/2026

## Triệu chứng

Phép đo màn của `hop-thoai-giu-cho-dang-nhap` (`man-giu-cho.mjs`, bước 3 mở `/deals`)
thỉnh thoảng bắt lỗi React «Hydration failed because the server rendered text didn't
match the client». Bảy bước vẫn đạt nhưng kịch bản thoát 1. Hồ sơ
`khung-tao-okr-nhu-deal` phải bọc E17 bằng `giu-cho-han-che.mjs` để tha đúng lỗi này.

Lỗi chập chờn. Đo lại ngày 30/09 trong phiên này:

| Bản | Phép đo gốc `man-giu-cho` | Tải `/deals` hai lượt (đầu dò riêng) |
| --- | --- | --- |
| `9cda3569` (sau #218) | thoát 1 — `loi console app: 1`, đúng lỗi trên | 0 lỗi |
| `6e431a01` (sau #220) | thoát 0 | 0 lỗi |

## Chỗ lệch

Nhật ký máy chủ của lượt E17 cũ (`crm_kto_e17_do/app.log`) in nguyên diff của React:

```
<DealStageIndicator stage="QUALIFIED_...">
  <StatusIndicator tone="info" label="Qualified ...">
+   data-tone="info"            (trình duyệt)
-   data-tone="neutral"         (máy chủ)
  <span className="truncate">
+   Qualified to buy            (trình duyệt)
-   QUALIFIED_TO_BUY            (máy chủ)
at DealStageMenu (components/crm/stage-change.tsx)
at Object.cell (deals/deals-table.tsx:72)
```

Máy chủ vẽ mã giai đoạn thô với chấm xám. Trình duyệt vẽ nhãn với chấm xanh. Nghĩa là
lúc máy chủ vẽ ô, `useGiaiDoan()` chưa có dữ liệu; lúc trình duyệt hydrat thì có.

## Gốc

`page.tsx` của Deals có hai phần:

1. Đầu trang (vẽ ngay): `<CreateDealSheet />` — nút «Thoả thuận mới».
2. Trong `Suspense`: `Deals` chờ prefetch `deals.list`, `giaiDoan.list`, `users.list`…
   rồi bọc bảng trong `HydrateClient` (`HydrationBoundary` của TanStack).

`CreateDealForm` gọi `useGiaiDoan()`, `users.list`, `users.me`, `currency.settings`
ngay khi render — kể cả khi ngăn đang đóng. Hệ quả theo đúng luật của
`HydrationBoundary` (TanStack 5): truy vấn **chưa có** trong cache thì nạp ngay trong
render; truy vấn **đã có** thì hoãn sang effect.

- **Máy chủ:** đầu trang render trước → `giaiDoan.list` đã có trong cache (đang chờ,
  không dữ liệu, máy chủ không bao giờ tự tải). Tới lượt `HydrationBoundary` của bảng,
  truy vấn «đã có» → hoãn sang effect → effect không chạy trên máy chủ → ô vẽ mã thô.
  Luôn luôn như vậy, không phụ thuộc thời điểm.
- **Trình duyệt:** đầu trang hydrat trước và bắn lượt tải `giaiDoan.list`. Vùng bảng hydrat
  sau, khi phần HTML của `Suspense` tới. Nếu lượt tải kịp về trước → ô vẽ nhãn → lệch
  với máy chủ → lỗi. Nếu chưa về → ô vẽ mã thô → khớp → im lặng.

Vì vậy lỗi phụ thuộc tải máy: nhanh thì hiếm, chậm (nhiều phiên đo cùng chạy) thì hay.
Và ngay cả lượt «im lặng» cũng lộ mã thô `QUALIFIED_TO_BUY` trên màn cho tới khi effect
chạy — một lỗi hiển thị, không riêng lỗi console.

## Phương án

| | Cách | Được | Mất |
| --- | --- | --- | --- |
| **A (chọn)** | Truy vấn của ngăn tạo deal chỉ sinh khi ngăn mở: dời bốn truy vấn và phần thân ngăn vào một thành phần con nằm trong `SheetContent` (Radix chỉ dựng nội dung khi mở). Nháp và lệnh tạo ở lại cha. | Ngăn đóng không tạo truy vấn nào → vùng bảng nạp `giaiDoan.list` ngay trong render ở cả hai phía → máy chủ vẽ nhãn, trình duyệt vẽ nhãn. Một tệp. Bớt bốn lượt tải thừa mỗi lần mở `/deals`. | Mở ngăn lần đầu phải chờ ba danh sách nếu cache chưa có (thực tế `users.list`, `giaiDoan.list` đã có từ bảng). |
| B | Prefetch `giaiDoan.list` ở cấp trang và bọc cả đầu trang trong `HydrateClient`. | Không đụng ngăn. | Trang phải chờ truy vấn trước khi vẽ khung, hoặc tải trùng hai lần; ngăn vẫn tạo truy vấn khi đóng; thành phần đầu trang nào sau này dùng truy vấn khác lại mở lại đúng lớp lỗi. |
| C | API trả nhãn và loại giai đoạn kèm mỗi dòng deal; ô không đọc `giaiDoan.list`. | Ô hết phụ thuộc truy vấn khác. | Đổi `deals.list` ở API và kiểu dữ liệu; bảng Kanban, bộ lọc, menu đổi giai đoạn vẫn cần danh sách; đầu trang vẫn tạo truy vấn chờ trên máy chủ. |

Chọn A: sửa đúng chỗ sinh ra truy vấn rỗng trên máy chủ, nhỏ nhất, và không đổi hành vi
nào người dùng thấy ngoài việc hết mã thô.

## Thiết kế A

`create-deal-sheet.tsx`:

- `CreateDealForm` (cha, luôn dựng): trạng thái mở theo URL, **nháp** (tên, công ty,
  chủ sở hữu, giai đoạn, số tiền, tiền tệ, ngày chốt) và lệnh `deals.create` cùng các
  việc sau khi tạo (ghi cache, báo, đóng, xoá bốn ô, mở bản ghi). Không truy vấn nào.
- `CreateDealBody` (con, chỉ dựng khi ngăn mở): `useGiaiDoan`, `users.list`, `users.me`,
  `currency.settings`, các giá trị suy ra (chủ sở hữu mặc định, giai đoạn mở đầu, tiền tệ
  đã biết), tiêu đề, form, chân ngăn. Gửi form thì gọi hàm tạo của cha.

Nháp ở cha nên đóng rồi mở lại vẫn còn chữ đang gõ — đúng như hiện nay (nháp sống trong
`CreateDealForm` vốn luôn dựng). Tạo xong vẫn chỉ xoá tên, số tiền, tiền tệ, ngày chốt.

Không đổi: giao diện ngăn, thứ tự ô, chữ, nút, bộ giữ chỗ khi đang nhập, cách dùng
`CreateDealSheet companyId` trong ngăn công ty.

## Chứng minh

1. **Test DOM** (`apps/app/test/deals-giai-doan-hydrat.dom.tsx`), theo khuôn
   `thanh-bieu-tuong-hydrat.dom.tsx`: dựng cây «ngăn tạo deal (đóng) + `HydrationBoundary`
   mang danh sách giai đoạn + ô giai đoạn», render ở máy chủ bằng `renderToString`, hydrat
   ở trình duyệt với cache trống hoặc đã có dữ liệu. Đỏ trên bản trước sửa, đo được mà
   không phụ thuộc tải máy.
2. **Chiều đỏ tự động** của test DOM: bản sao cây, thay `create-deal-sheet.tsx` bằng bản ở
   `6e431a01`, chạy lại test — phải đỏ với thông điệp ghim.
3. **Màn thật** (`rang/man-deals.mjs`, trong phiên đo riêng): HTML máy chủ của `/deals` và
   `/deals?view=board` không có chữ nào là mã giai đoạn thô; ô Giai đoạn mang đúng nhãn và
   sắc của loại; N lượt tải Chrome không lỗi hydrat nào; chữ sau tải bằng chữ máy chủ.
   Chiều đỏ: bản sao với tệp ngăn của `6e431a01` phải đỏ ở bước HTML máy chủ — bước này
   tất định vì máy chủ trước sửa luôn vẽ mã thô.
4. **Phép đo chủ kho yêu cầu:** `man-giu-cho` qua `tien-de` thoát 0.
5. Gỡ lớp bọc E17 của `khung-tao-okr-nhu-deal`: lệnh `kto_man_giu` chạy thẳng
   `man-giu-cho`, xoá `giu-cho-han-che.mjs`, ghi chú trong hợp đồng hồ sơ đó.

## Ngoài vòng

- Ba ngăn tạo cùng khuôn (`create-company-sheet`, `create-contact-sheet`,
  `create-campaign-sheet`) cũng tạo `users.list` khi đóng. Chưa thấy chữ nào lệch trên
  màn của chúng; ghi thành việc riêng.
- Lỗi hydrat khác đã thấy trong nhật ký đo cũ (ô chọn «Chu kỳ» trên màn OKR).
- Đổi ngữ nghĩa `HydrateClient` cho toàn ứng dụng.
