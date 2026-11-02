# Review findings: sua-tai-cho-muc-tieu-va-kr (round 1)

## Trong hợp đồng

- **Ngăn mục tiêu lấy danh sách Phụ trách từ users.list (mọi user, kể cả người đã rời) thay vì okr.thanhVien: nhãn «đã rời» không bao giờ hiện, và người đã rời vẫn chọn được nhưng máy chủ từ chối**
  AC: AC-4
  file: `apps/app/components/crm/record-sheet/chi-tiet-okr.tsx:75`
  severity: medium
  source: bugs
  detail: KhuChiTietMucTieu gọi `trpc.users.list.queryOptions()`. Ở apps/api/src/users/users.service.ts:16 hàm đó là `db.user.findMany()` không lọc theo bảng member, nên nó trả cả user đã bị gỡ khỏi workspace. Trong khi đó, máy chủ kiểm người phụ trách qua `assertThanhVien` → `locThanhVien` (apps/api/src/okr/okr.service.ts:708), và hàm này chỉ nhận người có hàng `member` ở WORKSPACE_ID. Ngăn KR thì đúng: nó dùng `okr.thanhVien` (lọc theo member, kr-sheet.tsx). Lệch này gây hai lỗi trên production. (1) Nhánh «đã rời» mà vòng này thêm vào `luaChonNguoi` (kieu-truong.tsx:421) chỉ chạy khi `hienTai` không có trong `moTa.nguoiDung`. Owner đã rời vẫn còn hàng user nên luôn có trong users.list, vì vậy ô Phụ trách của mục tiêu hiện tên trần, không kèm «đã rời». Bài DOM vẫn xanh chỉ vì mock users.list bỏ owner ra. (2) Danh sách chọn có cả người đã rời. Chọn họ thì máy chủ ném BadRequest `khongPhaiThanhVien`, người dùng nhận toast lỗi cho một lựa chọn mà UI đã cho phép. Cách sửa: dùng `trpc.okr.thanhVien` như ngăn KR.
  lý do vào hợp đồng: AC-4 đòi người phụ trách đã rời vẫn hiện tên kèm nhãn «đã rời»; với dữ liệu thật nhãn này không bao giờ hiện ở ngăn mục tiêu.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Validation duplicates the shared schema's length limits as hand-copied constants instead of reusing mucTieuUpdate/krInput**
  Người dùng thấy gì: Hiện giới hạn độ dài tên và «Vì sao» ở ngăn khớp với máy chủ nên người dùng không thấy gì sai. Nếu sau này máy chủ đổi giới hạn mà ngăn không đổi theo, ngăn có thể chặn nhầm hoặc cho qua nhầm.
  Căn cứ: Hôm nay không ảnh hưởng người dùng; chỉ có rủi ro lệch khi giới hạn đổi, và sửa lúc đó rẻ.
  file: `apps/app/components/crm/record-sheet/truong-okr.ts`
  severity: medium
  Đề xuất: known-limits

- **The «Phụ trách» field on the KR sheet takes its people list from okr.thanhVien, while the objective sheet and the KR create/edit dialog use users.list**
  Người dùng thấy gì: Ở ngăn KR, danh sách người phụ trách lấy từ một nguồn khác với ngăn mục tiêu, và vẫn tải danh sách ngay cả khi người xem không được đổi người. Người dùng không thấy khác biệt rõ ràng, chỉ tốn thêm một lần tải.
  Căn cứ: Hậu quả nhẹ, chỉ là tải thừa và không nhất quán bên trong, không mất dữ liệu; gom về một nguồn có thể làm ở vòng dọn dẹp sau.
  file: `apps/app/components/crm/record-sheet/kr-sheet.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng ma trận có ô trùng): KHOA năm ca thực ra chỉ có bốn ca khác nhau**
  Người dùng thấy gì: Một trường hợp quyền «KR chỉ đọc nhưng vẫn sửa được mục tiêu» chưa được bài kiểm tự động kiểm riêng. Người dùng chưa gặp lỗi nào, chỉ là một tình huống hiếm có thể hỏng mà không ai báo sớm.
  Căn cứ: Không ảnh hưởng người dùng hiện tại và không mất dữ liệu; bổ sung ca kiểm sau là việc rẻ.
  file: `apps/app/test/sua-tai-cho-okr.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): mock useCrmCache.okr bỏ id và options, xoá cache mọi query**
  Người dùng thấy gì: Bài kiểm tự động việc làm mới dữ liệu sau khi lưu dùng bản giả rộng hơn bản thật, nên nếu việc làm mới hỏng ở ngăn KR thì có thể không bị phát hiện. Hiện chưa có dấu hiệu người dùng thấy dữ liệu cũ sau khi lưu.
  Căn cứ: Người dùng tự gỡ được bằng cách tải lại trang, không mất dữ liệu; chỉ là mức tin cậy của bài kiểm thấp hơn mong muốn.
  file: `apps/app/test/sua-tai-cho-okr.dom.tsx`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
