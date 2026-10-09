# Review findings: khoa-eve-khong-tranh (round 1)

## Trong hợp đồng

- **Hình dạng 5 — tuyên quét lớp (ba phần của dấu) nhưng ma trận không cô lập phần ino**
  file: `apps/agent-okr/test/khoa-eve-khong-tranh.spec.ts:232`
  severity: high
  AC: AC-6
  source: measurement
  detail: AC-6 hứa một quan hệ trên cả ba phần: cungDau chỉ trả true khi ino, mtimeMs và ma đều bằng nhau. Ma trận sáu dòng có một dòng chỉ đổi ma (dòng 2, l.208) và một dòng chỉ đổi mtime (dòng 3, l.214), nhưng không dòng nào chỉ đổi ino. Dòng 6 «hai thu muc khac» (l.232) so goc0 với dauTrong, mà hai dấu này khác nhau cả ở ma (uuid so với null, vì thư mục `trong` không có chu.json) lẫn mtime. Nên nếu bỏ hẳn `a.ino === b.ino` khỏi cungDau thì cả sáu dòng vẫn xanh: dòng 6 vẫn ra false nhờ ma. Bảng đột biến trong dot-bien.mjs cũng không có cặp nào bỏ ino (cặp h chỉ bỏ mtimeMs). Vậy ma trận khai đủ số dòng (6) nhưng không phải ma trận toàn phần theo từng phần của dấu, và phần ino không có phép đo nào giữ.
  rationale: AC-6 đòi cả ba phần (ino, mtime, ma) đều phải bằng mới là cùng khoá, kể cả ca ino bị cấp lại; không phép đo nào làm đỏ khi bỏ phần ino nên AC-6 không được chứng minh ở phần ino.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Spec đọc chu.json bằng JSON.parse trần với kiểu viết tay, cạnh schema zod chuKhoaEve đã có**
  Người dùng thấy gì: Bài thử đọc tệp ghi chủ khoá theo cách riêng thay vì dùng chung khuôn đã có, nên nếu sau này đổi tên một trường thì bài thử có thể vẫn xanh mà không còn kiểm đúng. Không ảnh hưởng người dùng cuối; chỉ làm bài thử kém chắc về sau.
  file: `apps/agent-okr/test/khoa-eve-khong-tranh.spec.ts`
  severity: medium
  Đề xuất: wont-fix
- **Ca so-dau dòng (5) và (2) dựng dấu khoá bằng tay, trái với E9 «dấu RÚT từ thư mục khoá thật… (không gõ tay)»**
  Người dùng thấy gì: Hai trong sáu ca so sánh dấu khoá dùng dữ liệu dựng tay thay vì lấy từ khoá thật, nên một thay đổi nhỏ ở cách đọc dấu có thể lọt qua mà bài thử vẫn xanh. Người dùng không thấy gì; chỉ là bài kiểm chưa chặt như đã hứa.
  file: `apps/agent-okr/test/khoa-eve-khong-tranh.spec.ts`
  severity: medium
  Đề xuất: known-limits
- **Spec mới chép lại các helper của khoi-dong-don.spec.ts thay vì dùng chung qua test/support**
  Người dùng thấy gì: Bài thử mới chép lại vài đoạn phụ trợ của bài thử cũ, hai bản có thể lệch nhau dần. Không ảnh hưởng người dùng, chỉ tốn công bảo trì.
  file: `apps/agent-okr/test/khoa-eve-khong-tranh.spec.ts`
  severity: low
  Đề xuất: wont-fix
- **The new «da doi chu» throw leaves the eve dev it just spawned running, recorded in no lock**
  Người dùng thấy gì: Khi một lượt thử phát hiện khoá đã bị lượt khác lấy, nó báo lỗi nhưng có thể để lại một tiến trình eve chạy ngầm không ai quản. Lượt thử sau trên cùng thư mục có thể gặp lỗi «đã có máy chủ đang chạy» và đỏ ngẫu nhiên.
  file: `apps/agent-okr/test/support/khoi-dong.ts`
  severity: medium
  Đề xuất: new-contract
- **In gianhKhoaCu the rename back is not caught: ENOTEMPTY rejects giuKhoaEve and strands B's live lock under a .cu- name, or the rename silently replaces a new empty lock**
  Người dùng thấy gì: Khi ba lượt thử tranh nhau cùng một lúc rất hẹp, một lượt có thể báo lỗi lạ hoặc làm hai lượt cùng tin mình giữ khoá. Hiếm gặp và chỉ xảy ra ở bài thử nội bộ, không chạm khách hàng.
  file: `apps/agent-okr/test/support/khoi-dong.ts`
  severity: low
  Đề xuất: known-limits
- **Hình dạng 2 — dòng (5) của so-dau dựng dấu bằng tay, trái với khai «dấu RÚT, không gõ tay»**
  Người dùng thấy gì: Một ca so sánh dấu khoá («vắng mã ở một bên») được dựng bằng dữ liệu tự bịa nên không đi qua đoạn đọc thật. Nếu đoạn đọc thật đổi cách xử lý chỗ vắng thì bài thử vẫn xanh.
  file: `apps/agent-okr/test/khoa-eve-khong-tranh.spec.ts`
  severity: medium
  Đề xuất: known-limits
- **Hình dạng 4 — luật «config.yaml chỉ thêm dòng» trong pham-vi.mjs không có đối chứng**
  Người dùng thấy gì: Phép kiểm «tệp cấu hình chỉ được thêm dòng» chưa có ca đối chứng chứng minh nó thật sự bắt được dòng bị xoá. Không có dấu hiệu nó đang sai; nếu hỏng thì chỉ làm lọt một thay đổi ngoài phạm vi.
  file: `_acceptance/khoa-eve-khong-tranh/rang/pham-vi.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
