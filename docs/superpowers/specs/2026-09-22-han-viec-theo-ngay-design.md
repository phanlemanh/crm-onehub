# Hạn việc tính theo ngày — design

Ngày 2026-09-22 · hồ sơ `_acceptance/han-viec-theo-ngay/` · hạng T2 · sửa lỗi, không
qua Cổng Đáng (không `opportunity.md`).

## 1. Hai lệch đã đo

Đo trên dev ngày 2026-09-22, tài khoản `manh.phan@onemount.com`:

1. **Thẻ «Việc quá hạn» không theo chế độ.** `dashboard.service.ts:145-161` luôn lọc
   `createdById = người đăng nhập`, kể cả khi tổng quan ở chế độ «Cả đội»; các thẻ
   khác của trang đi theo chế độ.
2. **Việc hạn hôm nay hiện quá hạn từ đầu ngày.** Ô soạn chọn hạn «22/09» lưu
   `dueAt = 2026-09-21T17:00:00Z` (00:00 giờ VN). Thẻ so `dueAt < now`, nên lúc 20:54
   VN ngày 22/09 việc đó hiện đỏ «20 giờ trước». Bước kế hoạch cùng hạn trên cùng thẻ
   hiện chưa quá hạn, vì client tính bước theo ngày (`apps/app/lib/qua-han.ts`).

Chỗ tính «quá hạn» của việc bằng phép so thời điểm: `dashboard.service.ts` (thẻ),
`activities.service.ts` `myTasks` (khung `overdue` / `upcoming`),
`apps/app/components/crm/timeline/timeline-entry.tsx:67-71` (dòng thời gian). Bước
«của tôi» (`buocCuaToi`, lượt 2) cắt khung theo ngày UTC. `filterClause("upcoming")`
không so hạn nên không đổi.

## 2. Luật chung

Một việc hay một bước **quá hạn khi và chỉ khi `dueAt` sớm hơn 00:00 hôm nay theo giờ
Việt Nam**. Hạn là cả ngày. Dữ liệu cũ đúng luật mà không cần sửa, vì ô soạn lưu
00:00 của ngày đã chọn.

- Server: thêm `dauNgayVN(now): Date` vào `packages/db/src/onboarding-nhac.ts`, cạnh
  `ngayVN` và `NHAC.muiGio` sẵn có; là mốc duy nhất.
- Client: `timeline-entry.tsx` dùng `quaHan(dueAt, completedAt, now)` sẵn có — hàm tính
  theo ngày trình duyệt. Người dùng ở VN thì trùng giờ VN; ngoài VN có thể lệch (giới
  hạn đã biết).

## 3. Thay đổi

- `dashboard.summary`: việc quá hạn lọc `dueAt < dauNgayVN(now)`; chế độ `team` bỏ lọc
  `createdById`; mỗi việc thêm `createdBy: { id, name }`. `mySteps` và `keHoachCanDeY`
  không đổi theo chế độ.
- `activities.myTasks`: `overdue` = `dueAt < dauNgayVN(now)`, `upcoming` = `dueAt ≥
  dauNgayVN(now)`.
- `buocCuaToi`: khung = `dueAt < dauNgayVN(now) + (cuaSoNgay + 1) ngày`; trường `dueAt`
  trả `ngayVN(dueAt)` thay cho `toISOString().slice(0, 10)`.
- `timeline-entry.tsx`: `overdue` = `quaHan(...)`.
- Thẻ Tasks: ở chế độ «Cả đội», dòng phụ của việc bắt đầu bằng tên người tạo (`translate="no"`).

Không đổi: schema, ô soạn, tiêu đề thẻ.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: tổng quan («Tôi» hoặc «Cả đội») → thẻ «Việc quá hạn» → tích xong hoặc bấm mở bản ghi (điểm ra: sheet bản ghi).
- Biên: việc hạn hôm nay → không nằm trong «Việc quá hạn», dòng thời gian tô xanh «Hạn …» chứ không đỏ; việc không hạn → không bao giờ lên thẻ.
- Lỗi & quay lại: không có luồng lỗi mới — thẻ giữ trạng thái lỗi sẵn có.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Thẻ «Việc quá hạn» (tổng quan) | cho thấy việc đã trễ, của tôi hoặc của cả đội theo chế độ | tổng quan / sheet bản ghi |
| Dòng việc trên dòng thời gian | cho biết việc còn hạn hay đã trễ | sheet bản ghi / tại chỗ |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-the-toi | Thẻ «Việc quá hạn» | chỉ việc do tôi tạo đã qua ngày hạn | tích xong / mở |
| ST-the-ca-doi | Thẻ «Việc quá hạn» | việc đã qua ngày hạn của mọi người, dòng phụ mang tên người tạo | mở bản ghi |
| ST-the-rong | Thẻ «Việc quá hạn» | trạng thái rỗng sẵn có | không cần làm gì |
| ST-dong-han-hom-nay | Dòng thời gian | chỉ báo xanh «Hạn …» | làm trong ngày |
| ST-dong-qua-han | Dòng thời gian | chỉ báo đỏ «Quá hạn …» | làm ngay |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Tên người tạo là dữ liệu người nhập: `translate="no"`.
- Dòng phụ ở chế độ «Cả đội» bắt đầu bằng tên người tạo, rồi mới tới tên bản ghi; ở khổ 375 tên người hiện đủ, phần tên bản ghi phía sau mới bị cắt. Không tràn ngang.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| Dòng việc của thẻ Tasks | dùng | chỉ thêm một đoạn chữ vào dòng phụ sẵn có |
| `StatusIndicator` của dòng thời gian | dùng | chỉ đổi luật chọn `tone` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: bảng-điều-khiển (dashboard-first)
Căn cứ: không màn mới; sửa luật trên thẻ và dòng thời gian sẵn có. Luồng hiển nhiên, không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## 4. Kiểm thử

- Máy chủ, `setSystemTime` 20:54 VN 22/09 và 00:30 VN 23/09: hạn hôm nay không quá hạn,
  hạn hôm qua quá hạn, việc xong và việc không hạn không lên; «Cả đội» thấy việc người
  khác kèm tên, «Tôi» không; `myTasks` chia đúng mốc; «bước của tôi» cắt đúng biên
  ngày VN và trả ngày VN.
- Màn: dòng thời gian không tô đỏ việc hạn hôm nay; thẻ «Cả đội» hiện tên người tạo;
  payload khớp đầu ra thật của `dashboard.summary`.
- Ảnh thẻ ở «Cả đội» khổ 1440 và 375.

## 5. Ngoài phạm vi

- Người được giao cho việc (`Activity` chỉ có người tạo) — việc riêng.
- Gom luật «ngày im» của danh mục và sheet kế hoạch về ngày VN (Ngoài-8 của
  `may-nhac-truoc-nguoi`) — chạm hồ sơ đã ký của lượt 1–2.
- Múi giờ theo người dùng hay theo xưởng — lượt này cố định giờ VN.
