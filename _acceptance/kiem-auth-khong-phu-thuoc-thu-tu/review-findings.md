## Trong hợp đồng

### Hình dạng 5 (thiếu ma trận viết trước) kéo theo hình dạng 3: chốt tổng số ca của E4 luôn đúng vì tự suy ra từ chính kết quả đo
- file: `_acceptance/kiem-auth-khong-phu-thuoc-thu-tu/rang/thu-tu-tep.mjs:213`
- severity: medium
- source: measurement
- AC: AC-4

tuNhien() tính `moi = sua.ca.filter(c => !coGoc.has(khoaCa(c)))` (dòng 199) từ chính lượt chạy bản sửa, rồi ở dòng 213 khẳng định `sua.tong === goc.tong + moi.length`. Khi `mat.length === 0` (dòng 209 đã chặn riêng), đẳng thức này đúng theo định nghĩa tập hợp: |sua| = |goc| + |sua \ goc|. Nó chỉ đỏ được khi dòng 209 đã đỏ rồi, hoặc khi thuộc tính `tests` của junit lệch với số thẻ testcase. AC-4 hứa một quan hệ giữa các con số: 'tổng số ca bằng tổng ở b812b65a'. Không có danh sách ca mới viết trước. Theo diff, đó là ba hàng của hd-cua-google.spec.ts và ca 'cua google tu choi token co hd lech' trong chia-mat-khau. Số ca mới vì thế không bị chặn trên: thêm, nhân đôi hay đổi tên một ca mới bất kỳ đều vẫn xanh. Ràng buộc duy nhất là dòng 204: có ít nhất một ca từ KAT.tepMoi. Lời hứa về tổng thực ra không được đo.

Rationale khớp AC: AC-4 hứa 'tổng số ca bằng tổng ở b812b65a cùng env', và finding chỉ ra phép đo hiện tại tính đẳng thức này một cách tautological (tự suy từ chính lượt chạy bản sửa) nên không thực sự kiểm chứng lời hứa đó — đây là chính AC-4 thất bại về mặt đo, không phải một AC khác.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): token Google giả lấy hd từ chính cấu hình mà Better Auth dùng để so**
  Người dùng thấy gì: Một phần cách kiểm tra tự lấy giá trị mong đợi từ đúng nơi mà hệ thống dùng để so sánh, nhưng hai phép kiểm độc lập khác đã được thêm riêng để bắt đúng lỗi này, nên rủi ro bỏ sót đã được giảm chứ chưa biến mất hoàn toàn.
  file: `packages/auth/test/chia-mat-khau.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
