# Tách «Đang theo dõi» khỏi tab «Của tôi» — design

Ngày: 2026-10-07 · Hồ sơ: `_acceptance/okr-cua-toi-tach-theo-doi/` · Hạng: T2

## Vấn đề

Tab «Của tôi» của khu Mục tiêu hiện mục tiêu của người khác mà không nói vì sao.
`okr.mine` (`apps/api/src/okr/okr.service.ts`, hàm `mine`) gom năm vai trò: phụ trách,
cá nhân của tôi, tham gia, giữ một KR, và **đang theo dõi**. Vai thứ năm thêm ở commit
`49bd46b6d` và lệch ba chỗ đã chốt:

- mô tả trang (`apps/app/lib/messages/okr.ts`, `moTa["cua-toi"]`): «Mục tiêu bạn phụ
  trách hoặc tham gia, và mục tiêu có KR bạn phụ trách»;
- AC-10 của `_acceptance/dat-okr-trong-crm`: tab gom ba vai đó;
- `CONTEXT.md`, mục «Theo dõi (mục tiêu)»: theo dõi là nhận báo, «không đổi ai phụ trách».

Bảng chỉ đánh dấu ở mức KR (`bang-kr.tsx`, `kr.laCuaToi`), nên một mục tiêu chỉ được bấm
«Theo dõi» trông y như mục tiêu của mình. Chủ kho thấy đúng điều đó trên production.

## Quyết định (chủ kho chốt 07/10, phương án A)

1. «Của tôi» = bốn vai: phụ trách · cá nhân của tôi · tham gia · giữ KR.
2. Mục tiêu **chỉ** đang theo dõi hiện ở một nhóm gập riêng «Đang theo dõi (n)», dưới
   bảng chính, trên «Đã bỏ (n)», đóng sẵn khi mở trang.
3. Mục tiêu vừa thuộc một trong bốn vai vừa được theo dõi ở bảng chính, không lặp.
4. Mục tiêu chỉ-theo-dõi mà đã bỏ không hiện trong «Của tôi»; «Đã bỏ» giữ nghĩa «đã bỏ
   của tôi». Vẫn tìm thấy ở «Theo đơn vị».

## Thiết kế

### API

`mine(userId, cycleId)` giữ một lượt `docMucTieu` với năm vai như hôm nay (một nguồn
quyền xem, `nguCanhXem`), cộng một truy vấn nhẹ song song:
`okrObjective.findMany({ where: { cycleId, OR: <bốn vai> }, select: { id: true } })`.
Hai mệnh đề `OR` cùng đọc từ một hằng `vaiCuaToi(userId)` để bốn vai không trôi khỏi
nhau; mệnh đề đọc chính là `[...vaiCuaToi(userId), theoDoi(userId)]`.

Hàm thuần mới `chiaCuaToi(ds, idsCuaToi)` ở `apps/api/src/okr/cua-toi.ts`:

| id thuộc idsCuaToi | status | vào |
|---|---|---|
| có | ≠ `da-bo` | `objectives` |
| có | `da-bo` | `daBo` |
| không | ≠ `da-bo` | `dangTheoDoi` |
| không | `da-bo` | bỏ |

`mineOutput` thêm trường bắt buộc `dangTheoDoi: z.array(mucTieuOutput)`. Đây là đổi thêm
trường của `GET /okr/mine`, không đổi trường cũ. Các fixture test đang `mineOutput.parse`
thêm `dangTheoDoi: []` — schema mô tả cái thật trả, không nới thành `.default([])`.

Vì sao truy vấn id thay vì gọi `docMucTieu` hai lần: `docMucTieu` nặng (KR, căn chỉnh,
đếm góp ý); một lượt cộng một `select id` giữ chi phí gần như cũ. Vì sao không suy vai từ
đầu ra (`owner`, `participants`, `laCuaToi`): đầu ra không mang `personUserId`, và suy
ngược từ đầu ra là đo lại quy tắc ở hai nơi.

### Giao diện

`nhom-da-bo.tsx`: tách thân gập thành `NhomMucTieuGap({ nhan, ma, ds, hienDonVi,
danhDauCuaToi })`; `NhomDaBo` gọi nó với `ma="da-bo"` và giữ thuộc tính `data-nhom-da-bo`
mà test hiện có đọc. Nhóm mới gọi cùng thành phần với `ma="dang-theo-doi"`
(`data-nhom-dang-theo-doi`), `danhDauCuaToi={false}`.

`cua-toi.tsx`: cả hai nhánh (rỗng và có dữ liệu) xếp `[bảng chính | Empty] → Đang theo
dõi → Đã bỏ`. Nhãn `khoiMucTieu.nhomDangTheoDoi(n)`: «Đang theo dõi (n)» / «Following (n)».

Mutation `follow` đã làm mới `okr.mine` qua `cache.okr` (`apps/app/lib/trpc/cache.ts`),
nên bỏ theo dõi trong sheet thì nhóm tự cập nhật — không thêm mã, chỉ đo.

### Từ điển

`CONTEXT.md`, mục «Theo dõi (mục tiêu)»: thêm một câu — mục tiêu đang theo dõi hiện ở
nhóm «Đang theo dõi» của tab «Của tôi», không vào danh sách chính.

### Chuẩn nội đã soi

`feature_loop.ui_standards_skill: web-design-guidelines` — bộ luật Vercel Web Interface
Guidelines tải 07/10. Năm luật chạm nhóm gập (nút thật, `aria-expanded`, focus thấy được,
chuyển động `transform` + tôn trọng `prefers-reduced-motion`, số đếm bằng chữ số, rỗng
không vẽ hỏng) đều đã đạt ở `NhomDaBo`; nhóm mới dùng lại đúng thành phần đó.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Mục tiêu › Của tôi → bảng chính chỉ mục tiêu của mình → bấm «Đang theo dõi (n)» → nhóm mở bảng các mục tiêu đang theo dõi → bấm một hàng mở sheet mục tiêu (điểm ra: sheet).
- Biên: chưa giữ mục tiêu nào nhưng đang theo dõi → trạng thái rỗng vẫn hiện, nhóm ngay dưới; không theo dõi gì → không có nhóm.
- Lỗi & quay lại: `okr.mine` lỗi → `Loi` có «Thử lại» như hôm nay (không đổi); bỏ theo dõi trong sheet → đóng sheet, mục tiêu đã rời nhóm.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Mục tiêu › Của tôi | thấy mục tiêu mình giữ, tách khỏi mục tiêu mình chỉ theo dõi | thanh tab OKR / sheet mục tiêu |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-cuatoi-codulieu | Của tôi | bảng mục tiêu của mình; dưới là nút «Đang theo dõi (n)» đóng, rồi «Đã bỏ (m)» | mở nhóm / mở mục tiêu |
| ST-cuatoi-rong | Của tôi | Empty «chưa giữ mục tiêu nào» + nút sang Theo đơn vị; dưới là nhóm theo dõi nếu có | sang Theo đơn vị / mở nhóm |
| ST-cuatoi-theodoi-mo | Của tôi | nhóm mở: bảng mục tiêu đang theo dõi, KR không mang dấu «của tôi» | mở mục tiêu / gập lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Nhóm đóng sẵn mỗi lần vào trang; không nhớ trạng thái mở.
- Mũi tên xoay 90° khi mở, tắt chuyển động khi `prefers-reduced-motion`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Collapsible` (`@crm/ui`) | dùng | thân gập đang sống ở nhóm «Đã bỏ» |
| `NhomMucTieuGap` | ghép | tách từ `NhomDaBo` để hai nhóm cùng một khuôn |
| `BangMucTieu` | dùng | bảng mục tiêu đang dùng ở mọi tab |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: luồng hiển nhiên — trang đã là một cột cuộn có nhóm gập «Đã bỏ»; Asana Goals «My goals» chỉ gom mục tiêu bạn là chủ (help.asana.com, get-started-with-asana-goals), cùng hướng tách theo dõi khỏi «của tôi».
<!-- UX-SPEC-TEMPLATE>>> -->

## Đo

- Hàm thuần `chiaCuaToi`: ma trận viết trước 2 × 2 (thuộc bốn vai × đã bỏ), cộng chiều đỏ.
- `okr.mine` thật trên CSDL riêng: sáu vai × đã bỏ/chưa, trùng vai + theo dõi, mất quyền xem.
- DOM: ba trạng thái, nhãn vi/en.
- Màn thật: nhóm gập, rỗng, bỏ theo dõi trong sheet → rời nhóm và API đọc lại khớp.
- Soát tĩnh thiết kế cho hai tệp tsx đã chạm.
