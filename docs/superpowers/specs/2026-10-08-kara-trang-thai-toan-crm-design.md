# K6b `kara-trang-thai-toan-crm` — lỗi không hiện như rỗng, lưu trữ có Hoàn tác

Hàng K6b của `docs/plan/lo-trinh-okr.json`, dãy P2 đợt `sau-14-10`, sau K4 `khung-ban-ghi-kara` (#306). Cổng
Đáng: anh ký `build` 2026-10-07T13:13:50Z (luật 16). Ô cơ hội: `_acceptance/kara-trang-thai-toan-crm/opportunity.md`.

## Vấn đề

Khảo sát 04/10 trên production (`khao-sat-dong-nhat.md` mục 5, 6, 12), kiểm lại trên onehub 1596ad65:

| Mã | Chỗ | Hôm nay | Người dùng hiểu sai thành |
| --- | --- | --- | --- |
| C4a | Dòng thời gian ngăn bản ghi (`timeline.tsx`) | không đọc `isError`; lỗi rơi vào nhánh rỗng | «chưa có hoạt động» |
| C4b | Hoạt động web (`website-activity.tsx`) | `return null` khi tải và khi lỗi | mục biến mất — «không có hoạt động web» |
| C4c | Kế hoạch của cá nhân (`contact-plans.tsx`) | `return null` khi tải; lỗi là một hàng tự dựng | mục nhảy ra muộn; lỗi lệch kiểu |
| C5a | Tóm tắt tuần (`khoi-tom-tat.tsx`) | đang soạn: `Shimmer` trần; lỗi: `Alert` + nút xs | trái ai-ux §7 (không Shimmer trần, không Alert đứng yên) |
| Ngoài-5 của K4 | Bước Kara trong tab Kara (`agent-panel.tsx`, `kara/steps.tsx`) | `stored:false`/`written:false` vẽ như «xong» | thông tin đã vào hồ sơ |
| (f) | Lưu trữ cá nhân/công ty/thoả thuận (`record-actions.tsx`) | toast «Đã lưu trữ…» không Hoàn tác | phải tìm menu Khôi phục |
| (d) | Toast tạo bản ghi (`create-*-sheet.tsx`) | «<tên> added.» viết cứng | chữ tiếng Anh giữa giao diện Việt |
| (c) | «Sửa Mục tiêu» (`okr-gop-y.ts`) cạnh «Sửa mục tiêu» (`okr.ts`) | hai cách viết | — |
| (e) | «Cảm ơn, đã ghi» (`okr-toan-canh.ts`) | không nói điều gì xảy ra (ai-ux §8) | — |

## Quyết định đã chốt

- **Lưu trữ có Hoàn tác làm ở K6b** (anh chọn (a) 08/10, sổ `d-20261008T043131Z-1`): dựng mảnh toast dùng chung trong
  `packages/ui`, áp cho ba ngăn bản ghi. Hoàn tác gọi lệnh khôi phục có sẵn (`<loại>.restore`) — không đổi API. V2
  `vong-doi-mot-cach-cat` dùng lại mảnh này cho bảng, Kanban và Cài đặt.
- **Ngoài-5 của K4 gộp vào K6b** (giám sát P2-14) như một tiêu chí riêng; anh gạt ra ở Cổng 1 thì giám sát tách hàng.

## Cách làm

**Một khung «không tải được» cho vùng con** — `VungTaiLoi` mới trong `packages/ui` (`vung-tai-loi.tsx`): `Empty`
viền liền cỡ gọn, tiêu đề «Không tải được <thứ>», một câu mô tả, `KaraRetry` (nút «Thử lại» duy nhất của ai-ux §10).
Không in thông điệp lỗi thô. Ba chỗ dùng: dòng thời gian (thay nhánh rỗng khi `history.isError`), hoạt động web (trong
`DetailSheetSection` của nó), kế hoạch cá nhân (thay hàng tự dựng). K4b `khung-loi-ban-ghi-dung-ly-do` có thể dùng lại
cho khung bản ghi. Đang tải: hoạt động web và kế hoạch cá nhân hiện mục kèm `Skeleton` hai dòng và chữ đọc màn «Đang
tải» thay vì `return null`; dòng thời gian giữ `Spinner` giữa khung (vùng lớn, không phải việc của Kara). Rỗng thật
(chưa nhận diện được khách, chưa có kế hoạch) giữ hành vi cũ — ẩn mục — vì đó không phải lỗi.

**Tóm tắt tuần theo ai-ux §7** — đang soạn: `KaraState kind="working"` «Kara đang tóm tắt tuần này…» (dùng
`ThinkingIndicator`; thay chữ cũ «Trợ lý OKR đang tóm tắt tuần này…»), giữ dòng mô tả và nút «Tải lại» khi quá hạn chờ; lỗi: `KaraState kind="error"` «Kara chưa tải
được tóm tắt tuần» + mô tả cũ «Bảng đáng bàn bên dưới vẫn dùng được.» + «Thử lại» (thay `Alert`). Mã trạng thái `ST-tomtat-*` giữ nguyên để bài kiểm cũ còn bám được.

**Toast lưu trữ có Hoàn tác** — `baoDaLuuTru()` mới trong `packages/ui/src/lib/bao-luu-tru.ts`: một kiểu
`toast.success`, nút `action` «Hoàn tác», thời lượng chung đặt trong hằng của tệp (đủ lâu để đọc và bấm). `record-actions.tsx`
gọi nó khi lưu trữ thành công; Hoàn tác gọi `restore.mutate({ id })` của chính ngăn — thành công là toast «Đã khôi phục
<tên>.» có sẵn và ngăn về trạng thái đang dùng; lỗi là toast «Chưa hoàn tác được. Bản ghi vẫn ở mục Đã lưu trữ.» (không
in lỗi thô). Bấm Hoàn tác hai lần chỉ gọi khôi phục một lần.

**Bước Kara chưa lưu** — `KaraStep.state` thêm giá trị `"unsaved"` (chỉ thêm vào `steps.tsx`): chấm tông cảnh báo,
`data-trang-thai="chua-luu"`, chữ đọc màn «chưa lưu được»; tiêu đề khối khi không còn bước đang chạy hay lỗi: «Kara
chưa lưu được: <bước>». `agent-panel.tsx` đổi bước có `tone === "warning"` mà không `failed` thành `"unsaved"`. Lý do
do tác tử trả (`reason`) là chữ tiếng Anh của tác tử — tab tiếng Việt không in nó (ai-ux §9), tab tiếng Anh giữ như cũ.

**Chữ** — toast tạo bản ghi qua khoá mới ở `contacts.ts`/`companies.ts`/`deals.ts` («Đã thêm <tên>.» / «<name>
added.»); «Sửa Mục tiêu» → «Sửa mục tiêu» (`okr.ts` viết thường 61 chỗ, viết hoa 12); «Cảm ơn, đã ghi» → «Đã ghi —
quản trị viên thấy số phản hồi này ở Toàn cảnh › Sức khoẻ chương trình.» (đúng sự thật: `tom-tat-quan-tri.tsx` hiện số hữu
ích/không).

## Vòng đời (luật 14 — ba câu)

1. **Dọn thế nào:** không đổi — cá nhân, công ty, thoả thuận vẫn Lưu trữ → Khôi phục → Xoá vĩnh viễn; K6b chỉ thêm
   Hoàn tác vào toast lưu trữ như `docs/vong-doi.md` đòi.
2. **«Lịch sử» nghĩa là gì:** không đổi — K6b không thêm nút Xoá nào.
3. **Danh sách mặc định hiện gì:** không đổi — bảng lọc `archivedAt: null`, nút «Đã lưu trữ» có sẵn; bản ghi hoàn tác
   về lại danh sách chính.

## Ngoài phạm vi

- Hoàn tác lưu trữ ở bảng, thao tác hàng loạt, Kanban, Cài đặt; dải báo «Đã lưu trữ ngày …» đầu ngăn — V2.
- Khung bản ghi phân biệt «đã xoá» / «không có quyền» / «mất kết nối» — K4b.
- Tóm tắt quản trị (`tom-tat-quan-tri.tsx`) vẫn dùng `Alert` + nút xs khi lỗi.
- Lỗi khi «Tải thêm» trang sau của dòng thời gian.
- Lý do «không lưu» bằng tiếng Việt — chữ do tác tử sinh (`apps/agent`).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở ngăn cá nhân → tab Hoạt động, mục «Hoạt động trên website», mục «30 ngày đầu» tải xong → đọc (điểm ra: đóng ngăn).
- Lưu trữ: menu «⋯» của ngăn → «Lưu trữ <loại>» → toast «Đã lưu trữ <tên>.» + «Hoàn tác» → bấm → «Đã khôi phục <tên>.»,
  ngăn về đang dùng (điểm ra: toast tự tắt).
- Biên: khách chưa nhận diện → không có mục «Hoạt động trên website»; chưa có kế hoạch → không có mục «30 ngày đầu».
- Lỗi & quay lại: một vùng tải hỏng → khung «Không tải được …» + «Thử lại» trong đúng vùng đó, phần còn lại của ngăn
  vẫn dùng được; Hoàn tác hỏng → toast lỗi, bản ghi còn ở «Đã lưu trữ», khôi phục từ menu.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Ngăn cá nhân / công ty / thoả thuận | xem và làm việc với một bản ghi | từ danh sách hay liên kết / đóng ngăn |
| Tab Kara của ngăn | hỏi Kara về bản ghi | tab trong ngăn |
| OKR › Họp tuần (khối Tóm tắt tuần, `hop-tuan.tsx`) | đọc tóm tắt tuần của đơn vị | trang OKR |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-dongthoigian-loi | Ngăn (tab Hoạt động) | «Không tải được hoạt động» + «Kiểm tra kết nối rồi thử lại.» + «Thử lại» | bấm Thử lại |
| ST-dongthoigian-rong | Ngăn (tab Hoạt động) | trạng thái rỗng cũ («chưa có hoạt động») — chỉ khi tải xong | ghi hoạt động |
| ST-web-dang-tai | Ngăn (Tổng quan) | mục «Hoạt động trên website» + Skeleton hai dòng + «Đang tải» đọc màn | chờ |
| ST-web-loi | Ngăn (Tổng quan) | mục «Hoạt động trên website» + «Không tải được hoạt động trên website» + «Thử lại» | bấm Thử lại |
| ST-kehoach-dang-tai | Ngăn cá nhân | mục «30 ngày đầu» + Skeleton + «Đang tải» đọc màn | chờ |
| ST-kehoach-loi | Ngăn cá nhân | mục «30 ngày đầu» + «Không tải được kế hoạch» + «Thử lại» | bấm Thử lại |
| ST-tomtat-dang-soan | Họp tuần | «Kara đang tóm tắt tuần này…» (ThinkingIndicator) | chờ; quá hạn thì «Tải lại» |
| ST-tomtat-loi | Họp tuần | «Kara chưa tải được tóm tắt tuần» + «Bảng đáng bàn bên dưới vẫn dùng được.» + «Thử lại» | bấm Thử lại |
| ST-tomtat-da-ghi | Họp tuần | «Đã ghi — quản trị viên thấy số phản hồi này ở Toàn cảnh › Sức khoẻ chương trình.» | — |
| ST-luutru-hoantac | Ngăn | toast «Đã lưu trữ <tên>.» + «Hoàn tác» | bấm Hoàn tác hoặc để tắt |
| ST-luutru-hoantac-loi | Ngăn | toast «Chưa hoàn tác được. Bản ghi vẫn ở mục Đã lưu trữ.» | khôi phục từ menu |
| ST-kara-buoc-chua-luu | Tab Kara | bước chấm cảnh báo, tiêu đề «Kara chưa lưu được: <bước>» | đọc; hỏi lại Kara |
| ST-tao-da-them | Ngăn thêm cá nhân/công ty/thoả thuận | toast «Đã thêm <tên>.» | mở bản ghi |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- «Thử lại» chỉ gọi lại đúng truy vấn của vùng đó; bấm khi đang tải thì không gọi chồng.
- Hoàn tác trong toast chỉ gọi khôi phục một lần dù bấm lại; toast tắt khi bấm.
- 390: khung lỗi vùng con nằm trong bề rộng ngăn, không tràn ngang.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `VungTaiLoi` | tạo (bậc 5, `packages/ui`) | `Empty` + `KaraRetry` lặp ở ba vùng; K4b dùng lại |
| `baoDaLuuTru` | tạo (bậc 5, `packages/ui/lib`) | Cài đặt tự dựng hai kiểu toast lưu trữ khác nhau; V2 dùng lại |
| `KaraState` working/error | dùng | ai-ux §7 đã có |
| `KaraSteps` | mở rộng (thêm trạng thái `unsaved`) | ai-ux §6–7: hệ quả thật của bước |
| `Skeleton`, `DetailSheetSection` | dùng | có sẵn |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: K6b không đổi bố cục — sửa trạng thái trong ngăn bản ghi (chi tiết của danh sách) và một khối của trang Họp tuần OKR;
luồng hiển nhiên, không tra mẫu ngoài.
<!-- UX-SPEC-TEMPLATE>>> -->
