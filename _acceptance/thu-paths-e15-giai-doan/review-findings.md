## Trong hợp đồng

- **Hình dạng 3/4 (lời hứa là quan hệ, đo bằng một nhãn chữ; nhánh loại trừ không có đối chứng): E3 cho hồ sơ vào LOAI_TRU «do PR khac» mà không đo nguyên nhân và cũng không đo «không bị vòng này chạm»**
  AC: AC-3
  file: `_acceptance/thu-paths-e15-giai-doan/rang/them-paths.mjs:290`
  severity: medium
  source: measurement
  detail: AC-3(a) mới trong contract.md hứa một quan hệ: hồ sơ chỉ bị trừ khi nó «hoá cũ ở HEAD do PR khác», và hồ sơ bị trừ «không bị vòng này chạm». Trong luatDocLap() (dòng 290–296), điều kiện duy nhất để trừ là `const r = hoaCuHoSo(slug, chu); if (!r.vc || (r.apply && !r.kept.length)) luat.push(slug); else loaiTru.push({ slug, ly_do: `hoa cu o HEAD do PR khac (...)` })`. Nghĩa là cứ hoá cũ ở HEAD thì bị trừ. Phần «do PR khac» chỉ là chữ gõ sẵn trong ly_do. Mã không đem r.kept so với tập tệp chính nhánh này đổi (các commit không phải merge trên first-parent từ mốc tới HEAD). Mã cũng không kiểm rằng thư mục _acceptance/<slug>/ của hồ sơ bị trừ đứng yên từ merge-base tới HEAD. kiemDanhSach() (dòng 304) chỉ in LOAI_TRU, không đếm lỗi nào cho nhánh này. Con số «2 loại trừ» ghi trong expected cũng không được ghim: không khẳng định nào về số hay tên hồ sơ bị trừ. dot-bien.mjs không có cặp đột biến nào nhắm vào nhánh LOAI_TRU (vòng này không sửa tệp đó; các cặp E3 chỉ là THIEU_PATHS, LECH_PATHS, KHONG_CO_TEN, THIEU/THUA_TRONG_DANH_SACH). Hôm nay nhãn này tình cờ đúng: nhánh chỉ chạm _acceptance/ và các tệp T1 (LO-TRINH.html, PRODUCT-MAP.md, docs/*.md), lưới bỏ qua hết chúng, và git diff merge-base..HEAD trên hai thư mục dieu-huong-khu-muc-tieu, ghim-thuoc-soi-xem-okr rỗng. Nhưng sự đúng đó đến từ hiện trạng của nhánh chứ không từ phép đo. Một vòng sau mà sửa tệp ngoài _acceptance/ nằm trong paths của một hồ sơ, rồi bỏ hồ sơ đó khỏi danh-sach.txt, thì vẫn được dán nhãn «do PR khac» và E3 vẫn ra mã 0. Đây là hình dạng âm tính một mình: một lối thoát khỏi luật không có vế dương nào chứng minh điều kiện thoát. Lý do phân loại: AC-3(a) hứa hồ sơ bị trừ phải hoá cũ do PR khác và không bị vòng này chạm, nhưng phép kiểm E3 chỉ dán nhãn chữ mà không đo hai điều kiện đó; không mục Ngoài-n nào phủ nhánh loại trừ này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **DongGopLen dựng tay hộp rounded-lg border thay vì dùng Card hoặc Item**
  Người dùng thấy gì: Một khung nhỏ trên màn OKR («Góp lên công ty qua KR…») được vẽ tay thay vì dùng thành phần chung, nên nó có thể lệch kiểu so với các màn khác. Người dùng vẫn thấy và đọc được nội dung bình thường.
  file: `apps/app/app/(app)/[slug]/okr/quanh-muc-tieu/quanh-muc-tieu.tsx`
  severity: medium
  Đề xuất: known-limits

- **hoaCuTaiMoc chép lại gần nguyên hoaCuHoSo, verifiedCommit, tepDoiTuPin và tepTai thay vì truyền thêm tham số mốc**
  Người dùng thấy gì: Công cụ kiểm tra nội bộ có đoạn mã chép lặp, sau này sửa luật lọc ở một chỗ mà quên chỗ kia thì kết quả kiểm có thể lệch. Người dùng sản phẩm không bị ảnh hưởng, chỉ người bảo trì.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/hoa-cu-theo-paths.mjs`
  severity: low
  Đề xuất: known-limits

- **Hằng TUAN và hai hàm ngày nằm trong tệp component cap-nhat-tuan.tsx, nay được tệp khác nhập**
  Người dùng thấy gì: Hạn của tuần cập nhật OKR được khai ở một tệp khó tìm, nên người muốn đổi hạn có thể mất công tìm đúng chỗ. Cách màn chạy với người dùng không đổi.
  file: `apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/cap-nhat-tuan.tsx`
  severity: low
  Đề xuất: known-limits

- **tro_ly_kho: a bare catch turns every moHoi error into a silent «no question, stop», and the log drops the reason**
  Người dùng thấy gì: Khi trợ lý kho gặp một lỗi bất ngờ lúc mở câu hỏi, nó lặng lẽ dừng và câu hỏi của người dùng cứ ở trạng thái «đang hỏi» mà không có câu trả lời, nhật ký cũng ghi sai nguyên nhân.
  file: `apps/agent/agent/subagents/tro_ly_kho/instructions.ts`
  severity: medium
  Đề xuất: new-contract

- **Của tôi part 1: after a partial send in place the user is stuck on «đã gửi» and cannot update the remaining KRs without reloading the page**
  Người dùng thấy gì: Nếu người dùng chỉ gửi cập nhật cho một số KR, màn cứ hiện «đã gửi» và không cho cập nhật tiếp các KR còn lại cho tới khi tải lại trang.
  file: `apps/app/app/(app)/[slug]/okr/phan-can-cap-nhat.tsx`
  severity: medium
  Đề xuất: new-contract

- **luatDocLap depends on staleness at HEAD, so the list check goes red when a PR from another hồ sơ makes a listed hồ sơ stale**
  Người dùng thấy gì: Sau khi vòng này được gộp, chạy lại bước kiểm trên một nhánh khác có thể báo đỏ giả chỉ vì PR khác làm một hồ sơ cũ đi. Việc gộp hôm nay không bị ảnh hưởng và sản phẩm không đổi.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/them-paths.mjs`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/7 lỗi rơi vào file không bộ đo nào phủ (apps/app/app/(app)/[slug]/okr/quanh-muc-tieu/quanh-muc-tieu.tsx, apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/cap-nhat-tuan.tsx, apps/agent/agent/subagents/tro_ly_kho/instructions.ts, apps/app/app/(app)/[slug]/okr/phan-can-cap-nhat.tsx) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
