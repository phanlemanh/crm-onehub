# Review findings: dich-ten-nganh-bang-bang (round 2)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bảng ngành mới làm hỏng cổng lint:slop của kho (rule anti-slop/no-known-value-widening) (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nhánh này không qua được bước kiểm tra chất lượng mã của kho nên không đẩy lên được theo đường bình thường. Người dùng cuối không thấy gì khác, nhưng bản tên ngành tiếng Việt sẽ không đến tay họ cho tới khi sửa.
  Căn cứ: Không mất dữ liệu và không ảnh hưởng người dùng cuối, nhưng chặn việc đưa bản lên; sửa rất rẻ và chỉ cần làm một lần trước khi gộp.
  file: `apps/app/lib/ten-nganh.ts`
  severity: high
  Đề xuất: new-contract

- **E8: dòng «ngăn công ty hiện tên ngành» ở màn 1440 luôn đạt nhờ chữ có sẵn trong ô bảng, dù ngăn có mở hay không (r1)**
  Người dùng thấy gì: Khi chụp màn hình rộng, dòng máy tự báo «ngăn công ty hiện tên ngành: ĐÚNG» có thể đúng ngay cả khi ngăn không mở. Người duyệt nên xem ảnh chụp thay vì tin dòng đó ở khổ rộng.
  Căn cứ: Hệ quả chỉ là một dòng báo có thể gây yên tâm sai ở khổ rộng; ảnh chụp đi kèm vẫn cho thấy sự thật và người xem tự kiểm được.
  file: `_acceptance/dich-ten-nganh-bang-bang/rang/chup.mjs`
  severity: medium
  Đề xuất: known-limits

- **Assert "chuỗi có mặt" trong khi lời hứa là QUAN HỆ (hình dạng 3): dòng kiểm ngăn công ty của E8 xanh nhờ chính cột bảng ở khổ 1440 (r1)**
  Người dùng thấy gì: Ở màn hình rộng, dòng máy tự báo ngăn công ty đã hiện tên ngành Việt có thể đúng chỉ vì cột bảng bên cạnh đã có sẵn chữ đó. Chỉ ảnh chụp mới chứng được ngăn thật sự hiện đúng.
  Căn cứ: Chỉ làm một dòng báo tự động kém tin cậy ở khổ rộng, không ảnh hưởng người dùng cuối, và người duyệt xem ảnh là thấy ngay.
  file: `_acceptance/dich-ten-nganh-bang-bang/rang/chup.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
