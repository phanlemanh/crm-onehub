# Review findings: gop-y-dung-cho (round 2)

Tổng 10 phát hiện: 1 trong hợp đồng, 9 ngoài hợp đồng (6 mới ở round này, 3 mang sang từ round 1 không chấm lại). Không finder nào chết, không có mục chờ phân loại, không có mục thiếu bác bỏ vì refuter chết.

## Trong hợp đồng

- **Chip danh sách và số góp ý của Mục tiêu không làm mới sau khi Kara đọc xong trong khung**
  file: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts:243`
  severity: medium
  AC: AC-12
  source: bugs
  detail: `nho()` khi thành công chỉ `setBatDau(Date.now())` và `danhSach.refetch()` (dòng 243-244). Không có lệnh `cache.okr(objectiveId)` nào. Phép so để đồng bộ ở `useEffect` dòng 179-193 chỉ chạy một lần, vì có cờ `daDongBo.current = true`, và nó đã chạy lúc khung vừa tải `ds`. Khi đó `dong` còn rỗng và bằng `soGopYCho = 0`, nên không lệch và không làm mới. Kara đọc xong, `ds.dong` có N dòng mới, nhưng effect đã khoá và không chạy lại. Trong `apps/app/lib/trpc/query-client.ts` cũng không có `MutationCache` hay refetch nào khác chạm `okr.objective`, `okr.danhSach` hay `okr.mine`. Cách tái hiện: mở khung của Mục tiêu chưa có góp ý (ST-b-chua-goi), bấm «Nhờ Kara góp ý», chờ Kara trả 2 góp ý. (1) Đóng khung mà không quyết: hàng trên danh sách không có chip «Kara · 2 góp ý chờ», và lọc «Có góp ý chờ» không gồm Mục tiêu này cho tới khi focus cửa sổ hoặc mở lại khung. (2) Còn trong khung, mở «Sửa» từ menu: `hop-thoai-muc-tieu.tsx:339` đọc `cu.soGopYCho` từ cache `okr.objective` vẫn là 0, nên `DongDanGopY` trả `null` và không có dòng dẫn «Kara · 2 góp ý chờ», trái AC-12. Hộp Sửa KR cũng vậy vì `soGopYKr` lấy từ cùng dữ liệu. Ca «quyết hết rồi Nhờ Kara đọc lại» vòng này vừa sửa cũng dính: các lần quyết đã đưa chip về 0, lần đọc lại sinh dòng mới nhưng chip vẫn ở 0. Thiết kế (spec dòng 45-49) hứa chip khớp với khung sau lần mở; bất biến đó vỡ ngay trong lần mở có Kara đọc.
  lý do thuộc hợp đồng: Sau khi Kara đọc xong trong khung, hộp Sửa vẫn đọc số cũ nên không hiện dòng dẫn «Kara · N góp ý chờ» dù đang có góp ý chờ, trái mệnh đề «khi có góp ý chờ» của AC-12 (chip lệch cũng chạm bảo đảm «khớp lại sau lần mở» của AC-3 và mục Out of scope chỉ miễn cho lệch trước lần mở khung đầu).

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **setSystemTime is reset in try/finally inside the test, not in afterEach as every other apps/app dom test does**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối. Nếu một bài kiểm tra tự động bị quá hạn thì bài kế tiếp có thể báo lỗi khó hiểu, làm người bảo trì khó tìm nguyên nhân thật.
  file: `apps/app/test/gop-y-dung-cho-ra-soat.tsx`
  severity: low
  Đề xuất: known-limits

- **Two new local wall-clock wait helpers copy the shared cho(); choLau's 8000 ms deadline is longer than bun's 5000 ms test timeout**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối. Nếu việc Kara đọc lại bị hỏng, bài kiểm tra chỉ báo hết giờ chung chung thay vì nói rõ lỗi gì, nên khó chẩn đoán hơn.
  file: `apps/app/test/gop-y-dung-cho-ra-soat.tsx`
  severity: low
  Đề xuất: known-limits

- **docLai copies noiDung's 'dang-doc' and 'loi' branch conditions word for word**
  Người dùng thấy gì: Hiện người dùng không thấy gì sai. Về sau nếu đổi luật báo lỗi ở một chỗ mà quên chỗ kia, màn Kara đọc lần đầu và màn Kara đọc lại có thể hiện hai trạng thái khác nhau.
  file: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts`
  severity: low
  Đề xuất: known-limits

- **«Thử lại» trong khối lỗi bị khoá mà không nói lý do khi nút Kara đang khoá hoặc ẩn**
  Người dùng thấy gì: Khi Kara đọc hỏng đúng lúc người dùng đã hết lượt trong ngày (hoặc tính năng đang tạm nghỉ), nút «Thử lại» xám đi mà không nói vì sao và khi nào dùng lại được. Người dùng có thể tưởng màn hình bị treo.
  file: `apps/app/app/(app)/[slug]/okr/nhom-kara.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (khai ma trận toàn phần nhưng có ô rỗng): 4/12 ô của ma trận E3 kỳ vọng null, nên chỉ đo «không có trong okr.mine» chứ không đo soGopYCho**
  Người dùng thấy gì: Con số «góp ý chờ» cho người chỉ đọc và cho Mục tiêu của đơn vị khác chưa được bài kiểm tra tự động đối chiếu từng số; sản phẩm không có dấu hiệu hiện sai, chỉ là bằng chứng yếu hơn con số 12 ô đã khai.
  file: `apps/api/test/gop-y-dung-cho.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt trong khi lời hứa là quan hệ): E10 hứa note 'tro-ly-okr:<id>' nhưng bài chỉ kiểm tiền tố qua krTheoKara**
  Người dùng thấy gì: Bài kiểm tra chỉ xác nhận dòng vết có dấu «theo Kara», chưa kiểm dòng đó trỏ đúng đề xuất đã nhận. Người dùng vẫn thấy đúng dấu và đúng chữ trong tab Vết, nên hậu quả rất nhỏ.
  file: `apps/api/test/gop-y-dung-cho.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **okr-theo-kara.ts viết tay kiểu ảnh chụp vết, trùng z.infer okrVetSnapshot có sẵn trong cùng gói (r1)**
  Người dùng thấy gì: Người dùng không thấy gì khác hôm nay; chỉ là mã có hai nơi cùng mô tả dạng bản ghi vết, nếu một nơi đổi mà nơi kia không đổi thì tab Vết có thể hiển thị sai về sau.
  file: `packages/validation/src/okr-theo-kara.ts`
  severity: medium
  Đề xuất: wont-fix

- **bang-vet.tsx vẫn viết cứng tiền tố «tro-ly-okr:» sau khi diff đã tách hằng TIEN_TO_VET_KARA (r1)**
  Người dùng thấy gì: Hôm nay dấu «theo Kara» ở tab Vết và trên khung vẫn đúng; nhưng cách nhận ra «theo Kara» được định nghĩa ở hai nơi, nếu sửa một nơi thì hai chỗ có thể hiện không khớp nhau.
  file: `apps/app/app/(app)/[slug]/okr/bang-vet.tsx`
  severity: low
  Đề xuất: known-limits

- **dem-gop-y.ts tự viết lại hàm dựng DonViCuaMucTieu thay vì dùng donViCua/chonDonVi có sẵn (r1)**
  Người dùng thấy gì: Số góp ý chờ trên danh sách hôm nay vẫn đúng; chỉ là cách tính quyền xem được viết lặp ở hai nơi, nếu luật quyền đổi mà chỉ sửa một nơi thì số trên chip có thể lệch.
  file: `apps/api/src/okr/dem-gop-y.ts`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 2/7 lỗi rơi vào file không bộ đo nào phủ (apps/app/test/gop-y-dung-cho-ra-soat.tsx) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.