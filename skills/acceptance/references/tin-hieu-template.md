# Khuôn tín hiệu và bản gom (cửa tín hiệu của kho)

Một **tín hiệu** là điều một người gặp và gửi vào cửa của kho — người không dùng git (qua nút «Gửi tín
hiệu» của sản phẩm), hay một phiên thợ phát sinh việc giữa lúc làm. Kit KHÔNG giữ kho tín hiệu: kho khai
nơi đặt tín hiệu trong `_acceptance/config.yaml` (ổ cắm `tin_hieu`), kit chỉ đọc, kiểm và vẽ đường đi.

```yaml
tin_hieu:
  nguon: [<thư mục>, …]   # một chuỗi, dòng [a, b], hoặc danh sách - a
  gom: <thư mục bản gom>   # các tệp *.md trong git
```

## Một hộp thư: khuôn tín hiệu = khuôn yêu cầu của gói Điều phối

Mỗi tín hiệu là MỘT tệp `<id>.json` trong một thư mục nguồn; `id` là tên tệp bỏ đuôi (khuôn
`<phiên>-<số>` của gói Điều phối). Thân tệp đúng khuôn yêu cầu `{phien, loai, hang, noi_dung, luc}`
(spec 2026-10-05 §4.9) và phải qua chính hàm kiểm của gói Điều phối (`kiemYeuCau` trong
`dieu-phoi/scripts/hinh-dang.mjs`). Kit kiểm thêm: `luc` là thời điểm ISO đọc được; tín hiệu người
(`loai: tin-hieu`) có `noi_dung.tieu_de` không rỗng.

Tín hiệu người KHÔNG đi vào thư mục yêu cầu của một đợt Điều phối — ở đó bộ xét trả «cần phán» và đánh
thức giám sát. Nó nằm ở nguồn kho khai.

<!-- <<<TIN-HIEU-MAU -->
```
tệp: crm-u7-1.json
{"phien":"crm-u7","loai":"tin-hieu","hang":null,"noi_dung":{"tieu_de":"Mở cập nhật KR không thấy số tuần trước","man":"/okr/kr"},"luc":"2026-10-15T03:00:00Z"}
```
<!-- TIN-HIEU-MAU>>> -->

### Loại được gom

Chỉ ba loại dưới đây là tín hiệu. Các loại khác của kênh yêu cầu (`cham-tep`, `gia-han`, `can-nguoi`,
`khac`…) là yêu cầu vận hành: không vào gom, nhưng lệnh của kit in MỘT dòng đếm «ngoài khuôn tín hiệu»
theo từng loại — không im.

<!-- <<<TIN-HIEU-LOAI -->
```
- tin-hieu — người gửi qua cửa của kho
- viec-phu — phiên thợ đề xuất một việc phụ
- hang-moi — việc mới mở từ một cổng («mở hợp đồng mới»)
```
<!-- TIN-HIEU-LOAI>>> -->

Tiêu đề hiển thị của một tín hiệu: `noi_dung.tieu_de`, vắng thì `noi_dung.viec`, rồi
`noi_dung.cau_giao`, rồi chính `noi_dung` khi nó là chuỗi.

## Bản gom

Bản gom là MỘT tệp markdown trong git, trong thư mục `tin_hieu.gom`. Nó cũng là **bản phạm vi** của cắt
lượt (khuôn `pham-vi-template.md`): mỗi nhóm là một mã. Hai khoá thêm: `truc` (phải bằng chính sách trục
ở khối `GOM-TRUC` của skill `gom-tin-hieu`) và `den` (mốc ISO — mọi tín hiệu có `luc` không sau mốc này
phải có chỗ). Mỗi tín hiệu ở ĐÚNG MỘT chỗ trên mọi bản gom:

- **nhóm** — dòng mã `- \`<mã>\` — <tên nhóm>`, dòng thụt `  - tín hiệu: \`<id>\`, …` kê tín hiệu;
- **lẻ** — `- lẻ \`<id>\` — <lý do>`;
- **đã phủ** — `- đã phủ \`<id>\` — <hồ sơ đã giao>`.

Dòng lẻ và đã phủ không mở bằng «- \`», nên bộ đọc bản phạm vi không nhặt chúng thành mã.

<!-- <<<GOM-MAU -->
```
dot: gom-mau
dang: chuoi
nguon: cửa tín hiệu — tín hiệu tới 2026-10-28
truc: ket-qua
den: 2026-10-28T00:00:00Z

- `G1` — Trưởng phòng ban thấy số tuần trước khi cập nhật KR
  - tín hiệu: `crm-u7-1`, `crm-u2-4`
- `G2` — Kỹ sư ghim lại một hồ sơ mà không trả giá cho hồ sơ khác
  - tín hiệu: `P1-12`

- lẻ `crm-u9-1` — hỏi cách dùng, không phải điều cần làm
- đã phủ `crm-u4-2` — kiem-cheo-sau-gop
```
<!-- GOM-MAU>>> -->
