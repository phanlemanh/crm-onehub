# Review findings: don-okr-nhap-sai (round 1)

## Trong hợp đồng

- **Shape 4 (negative assertion alone, message not pinned): the REST DELETE leg of E14 checks status 400 but never pins the message**
  file: `apps/api/test/luu-tru-chat.spec.ts:104`
  AC: AC-12
  severity: medium
  detail: E14 promises 'REST DELETE X → 400 with the same message' (ARCHIVE.thongDiep.chuaLuuTru). xoaRest() computes `loi` from res.body.message, but the purge-chua-luu-tru test throws it away. It records only `{ status: rRest.status, con }` and compares that to `{ status: 400, con: null }` (lines 103-107). Any other 400 also passes, for example a validation error from the REST bridge or a wrong route that never reaches the archivedAt check, because X is untouched either way. The tRPC and bulkPurge legs both pin CAU. The REST leg, the one that goes through the real Nest app, is the only one that does not, so this cell does not prove the archivedAt guard runs on the REST path.
  source: measurement

- **Shape 4 (negative assertion alone, no positive control): canGuiDuyet is only ever seen as false from the server**
  file: `apps/api/test/okr-xoa-muc-tieu.spec.ts:1162`
  AC: AC-15
  severity: medium
  detail: Which toast appears after 'Dùng lại' ('Gửi duyệt lại…' vs 'Công bố lại…') depends on canGuiDuyet, which dungLaiMucTieu computes from congBoHayGuiDuyet. The whole diff has exactly one server-side assertion on it: `canGuiDuyet: false` in the canh-bao case of dung-lai (duyetCongBo off). No case turns duyetCongBo on and calls dungLaiMucTieu to see true, so a service that always returned false passes every eval. The DOM test (okr-xoa-muc-tieu.dom.tsx:178-186) feeds canGuiDuyet=true through kho.traGhi. That value has the hand-written type KetGhi (okr-don-san.tsx:199, `canGuiDuyet?: boolean`) and is not parsed through dungLaiOutput, so it is a reader-shaped fixture (shape 2), not a round trip from the server. man-don-okr.mjs also only checks the congBo toast. As a result, the guiDuyet branch of 'toast follows whether there is an approval step' is never measured from the server's real output.
  source: measurement

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Shape 3 (asserts presence while the promise is a relation): the E7 order relation is lost because the ids are sorted**
  Người dùng thấy gì: Danh sách «Đã bỏ» có thể hiện các mục tiêu theo thứ tự khác với danh sách chính mà không có kiểm tra nào phát hiện. Người dùng vẫn thấy đủ và đúng các mục tiêu đã bỏ, chỉ có thể bị xếp lộn thứ tự.
  file: `apps/api/test/okr-xoa-muc-tieu.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative assertion alone, no positive control): 'restricted R is not in daBo' has no viewer who should see R**
  Người dùng thấy gì: Chưa có kiểm tra nào xác nhận người được phép xem một mục tiêu hạn chế thì vẫn thấy nó trong mục «Đã bỏ». Nếu có lỗi làm mục tiêu hạn chế biến mất với cả người có quyền, hiện chưa có phép đo nào bắt được.
  file: `apps/api/test/okr-xoa-muc-tieu.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 (asserts presence while the promise is a relation): the wait-for-lock check in dong-thoi counts any Lock wait in the DB, not the xoa request waiting on T1**
  Người dùng thấy gì: Kiểm tra «lời xoá có chờ» có thể nhận nhầm một lần chờ khác trên cùng cơ sở dữ liệu thử. Kết quả cuối cùng (xoá bị từ chối, dữ liệu còn nguyên) vẫn được kiểm đúng, nên người dùng không bị ảnh hưởng.
  file: `apps/api/test/okr-xoa-muc-tieu.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
