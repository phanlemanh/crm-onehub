# Review findings: sua-an-chu-ky-okr (round 1)

## Trong hợp đồng

- **Hình dạng 5 — E1 tuyên quét đủ lớp 48 ca nhưng kỳ vọng không phải bảng viết trước: đáp án là bản chép công thức của mã, và 8 ca trùng nhau**
  file: `packages/validation/test/okr-chu-ky-viec.spec.ts:19`
  severity: medium
  AC: AC-1
  source: measurement
  detail: E1 hứa mỗi ca trong 48 ca được so với kỳ vọng «tra từ một bảng luật viết tay trong bài theo design doc», và số ca đã chạy là 48. Mã bài làm khác ở hai chỗ. (1) Đáp án `mong()` (dòng 19-29) không phải bảng tra. Nó là bản chép gần nguyên văn thân `viecChuKy` trong packages/validation/src/okr-chu-ky.ts:104-119: cùng `if (daAn) → chỉ hienLai`, `suaMoiO: trong && phase==='lap-ke-hoach'`, `suaTen: phase!=='da-dong'`, `go: trong`, `an: !trong && !(nam && quyConHien>0)`. Vì vậy 48 lệnh `expect(viecChuKy(t)).toEqual(mong(t))` chỉ so mã với chính nó. Hiểu sai design doc thì cái sai nằm ở cả hai bên và bài vẫn xanh. Chỉ bốn «ca ghim» ở dòng 56-111 là kỳ vọng viết độc lập, còn trống ở pha cham-diem, trống ở da-dong, năm đã ẩn… thì không có đáp án độc lập nào. (2) Dòng 47 `quyConHien: trong && l.kind === 'nam' ? 0 : l.quyConHien` gộp ca `nam/1` vào `nam/0` mỗi khi trong=true. Như vậy 4 pha × 2 trạng thái ẩn = 8 ca trùng hệt nhau, ma trận thật chỉ có 40 phần tử khác nhau. Thế mà `expect(CA.length).toBe(48)` (dòng 51) vẫn khẳng định 48, tức số lệnh assert không bằng số phần tử của lớp. Mẫu P105 đòi ma trận có kỳ vọng viết trước và số assert bằng số phần tử khác nhau; ở đây là công thức tính lại cộng một con số đếm độ dài mảng.
  căn cứ phân loại: AC-1 đòi bảng ca có kỳ vọng năm cờ viết trước theo bảng luật của design doc; bài hiện chép công thức của hàm nên không chứng minh được điều AC-1 khai.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The five action flags are defined twice: a hand-written type and a separate Zod schema**
  Người dùng thấy gì: Hôm nay năm nút ở menu chu kỳ hiện đúng. Nhưng nếu sau này thêm nút thứ sáu, phía máy chủ tính ra mà màn hình không nhận được, nút mới sẽ lặng lẽ không xuất hiện.
  file: `apps/api/src/okr/okr.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **The hide input is in the closing-cycle module while its sibling cycle inputs are in okr-chu-ky**
  Người dùng thấy gì: Người dùng không thấy gì khác: ẩn chu kỳ vẫn chạy đúng. Chỉ là luật kiểm tra mã chu kỳ nằm ở hai chỗ, người sửa sau phải nhớ cả hai.
  file: `packages/validation/src/okr-khep.ts`
  severity: low
  Đề xuất: wont-fix

- **Some screens skip `kyTrongOChon` and filter hidden cycles inline**
  Người dùng thấy gì: Hôm nay các ô chọn chu kỳ đều không hiện chu kỳ đã ẩn. Nếu sau này đổi định nghĩa thế nào là đã ẩn, ba màn này phải sửa riêng nên dễ sót một màn.
  file: `apps/app/components/okr/hop-chuyen-okr.tsx`
  severity: low
  Đề xuất: known-limits

- **`assertKyChuaAn` is called outside a transaction, so its row lock does nothing**
  Người dùng thấy gì: Nếu một quản trị ẩn chu kỳ đúng lúc người khác nhờ trợ lý soạn đề xuất cho chu kỳ đó, trợ lý vẫn có thể làm việc trên chu kỳ vừa ẩn. Tình huống trùng khít thời điểm này hiếm.
  file: `apps/api/src/okr/tro-ly.service.ts`
  severity: low
  Đề xuất: known-limits

- **Failed hide leaves the menu stuck on 'hide', so the dialog reopens by itself later**
  Người dùng thấy gì: Khi ẩn một chu kỳ bị lỗi vì người khác vừa đổi nó, về sau hộp thoại ẩn có thể tự bật lên dù người dùng chưa bấm gì. Đóng hộp thoại đi là xong, không mất dữ liệu.
  file: `apps/app/app/(app)/[slug]/settings/okr/hop-thoai-an-chu-ky.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
