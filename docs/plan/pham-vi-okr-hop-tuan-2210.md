# Bản phạm vi — Họp tuần dùng được cho bộ OKR đang chạy (22/10)

Chủ kho báo ngày 22/10: trên production, bấm nút «Họp tuần» thì «không thấy gì». Bộ OKR quý 4 đang chạy,
nên đây là việc phải xử lý ngay. Phiên rà hôm đó làm ba việc:

- **Lái màn trên local**, bằng bộ OKR mẫu trong phiên đo riêng, ở bốn khổ 1440 · 1024 · 768 · 375.
- **Đối chiếu tám phát hiện với các hàng chưa gộp:** VK3 `trang-bo-okr`, VK8 `bo-okr-co-so`, VK12 `cap-nhat-gan-day`.
- **Chụp Tability thật** trong không gian «onehub» (plan mẫu «Sales OKRs 2026 Q4»).

Ảnh, căn cứ và đường dẫn tệp nằm ở báo cáo https://claude.ai/artifact/AqQLbpZtPYUUoj1TiUKKui.

Điều đã kiểm:

- **Nguyên nhân màn trống.** Bấm «Họp tuần» mà URL không có `donOkr` thì bảng là của đơn vị gốc. Bảng này chỉ đọc
  mục tiêu cấp OneHub (`apps/api/src/okr/okr-xem.service.ts:160-161`). Cấp này không có KR công bố, nên
  `tuanDau = every()` trên mảng rỗng ra `true` (`okr-xem.service.ts:586`). Màn khi đó hiện câu «Chưa có lần cập nhật
  nào để bàn», trong khi phòng của chính người xem đã cập nhật 4/4 KR.
- **VK3 chỉ sửa một phần.** AC-7 của VK3 giữ luật «`xemOkr` trần mở bộ OneHub», nên liên kết trần vẫn ra bảng rỗng.
  VK8 AC-3 đặt hàng số «chỉ ở thẻ OKR». Ngăn KR đi ‹ › trong một mục tiêu theo AC-2 đã ký của VK7
  (`apps/app/components/crm/record-sheet/kr-sheet.tsx:400-401`).
- **Tability thật** không có trang họp hay trang cập nhật riêng:
  - Người ta họp trên chính plan và chế độ trình chiếu của plan.
  - Mọi KR hiện câu phân tích mới nhất cạnh con số và mức đổi.
  - Ngăn KR đi ‹ › qua mọi KR của plan.
  - Form cập nhật hiện lần cập nhật trước.
  - Mỗi lần cập nhật có Reply và Like.

Nhóm H gồm các việc làm Họp tuần dùng được. Mỗi hàng là một màn hay một vùng, chạy song song. Hàng chạm cùng tệp thì
nối thứ tự trong mốc, không qua `dung_tren`. Mục «ai chưa cập nhật» đã có ở VK-C2 nên không cắt lại.

<!-- <<<PHAM-VI-MA -->
```
dot: okr-hop-tuan-2210
dang: lan-va
nguon: chủ kho báo 22/10 «bấm Họp tuần không thấy gì»; audit lái local và chụp Tability thật, báo cáo artifact AqQLbpZtPYUUoj1TiUKKui

- `H1` — bấm Họp tuần hay mở liên kết Họp tuần không kèm đơn vị thì tới bộ OKR người xem dẫn; chỉ quản trị mặc định OneHub
- `H2` — màn rỗng của Họp tuần nói đúng lý do (bộ chưa có KR công bố, chu kỳ chưa chạy, chưa ai cập nhật) và chỉ sang đơn vị trực thuộc có KR
- `H3` — mỗi dòng Họp tuần hiện ghi chú mới nhất và mức đổi so với lần trước ở mọi khổ màn, cả phần «Còn lại»
- `H4` — đầu thẻ Họp tuần có hàng số của tuần (KR đã cập nhật, đáng bàn, tự tin, ngày còn lại) thay dòng chữ nhỏ
- `H5` — cập nhật được ngay từ dòng Họp tuần; ngăn KR mở từ bảng đi ‹ › theo thứ tự đáng bàn
- `H6` — hộp cập nhật hiện lần cập nhật trước (ngày, số, mức tự tin, ghi chú) và câu hỏi gợi ý cho ô ghi chú
- `H7` — khối Tóm tắt tuần ở nấc bật mà chưa có bản thì nói khi nào bản đầu tiên tới
- `H8` — thả cảm xúc lên một lần cập nhật tuần, người cập nhật thấy ai đã thả
- `H9` — chế độ trình chiếu riêng cho buổi họp: trang tổng quan rồi mỗi KR một trang
```
<!-- PHAM-VI-MA>>> -->
