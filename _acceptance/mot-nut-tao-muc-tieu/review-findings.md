# Review findings: mot-nut-tao-muc-tieu (round 1)

## Trong hợp đồng

- **Hình dạng 3 (assert giá trị có mặt trong khi lời hứa là quan hệ): fixture làm «đơn vị đang xem» trùng «đơn vị dẫn đầu tiên», «chu kỳ đang xem» trùng «chu kỳ mặc định»**
  - file: `apps/app/test/mot-nut-tao-muc-tieu.dom.tsx:1083`
  - severity: high
  - AC: AC-4
  - source: measurement
  - detail: E6, E9 và E11 hứa một quan hệ: unitId bằng đơn vị đang xem chứ không phải đơn vị dẫn đầu tiên, cycleId bằng chu kỳ đang xem chứ không phải chu kỳ mặc định. Chiều đỏ ghi rõ «truyen unitId cua don vi dan dau tien thay vi don vi dang xem -> do 'mnt-tu-viet: unitId lech'» và «truyen chu ky mac dinh thay chu ky dang xem -> do 'mnt-tu-mau: cycleId lech'». Fixture làm hai vế trùng nhau. `chuKy()` (dòng 121-149) chỉ có một chu kỳ `q4` với `currentId: "q4"`, đường dẫn không mang `kyOkr`. TP2 (dòng 166-170) chỉ dẫn `departments: ["P2"]` và luôn xem `?donOkr=pb:P2`. Vì vậy các assert `vao.unit.departmentId !== "P2" || vao.cycleId !== "q4"` (dòng 1083-1089, mnt-tu-viet), `vao.unit.departmentId !== "P2"` cùng `vao.cycleId !== "q4"` (dòng 1133-1139, mnt-tu-mau) và `vao.unit.id !== "P2" || vao.cycleId !== "q4"` (dòng 1218, mnt-bang-tinh) thực chất chỉ kiểm một hằng có mặt. Bản sao lấy headOf.departments[0] hay cycles.currentId vẫn cho ra đúng P2/q4, nên ba chiều đỏ đã hứa không thể đỏ. Phải có ít nhất hai chu kỳ (xem chu kỳ không phải currentId) và một người xem dẫn hai đơn vị, đang xem đơn vị thứ hai.
  - rationale: AC-4/5/6 hứa tạo mục tiêu, mẫu, nhập cho đúng đơn vị và chu kỳ đích; bài kiểm không thể đỏ khi truyền sai đơn vị hay chu kỳ nên không chứng minh được AC.

- **Hình dạng 4 (assert âm tính một mình): bàn đo E3 đếm 0 nút chính khi khung hành động vắng hay màn không mở được, và màn so-do không có khung đó**
  - file: `_acceptance/mot-nut-tao-muc-tieu/rang/do-man.mjs:61`
  - severity: high
  - AC: AC-2
  - source: measurement
  - detail: `demNutChinh` trả `0` khi không có `[data-slot=page-shell-actions]` (dòng 61: `if (!goc) return 0;`). `moMan` (dòng 75-79) bỏ qua kết quả của `mo(...)`. `mo` không ném lỗi khi trang 404 (trả `thay: false`), và `choThay` trả false thay vì ném khi không thấy `[data-nut=hoi-kara]`. Màn `/okr/so-do` (so-do/page.tsx) dựng `PageShellHeader` không có `PageShellActions`, nên ở mọi vai dòng 100-107 luôn in «NUT CHINH so-do <vai> 0» dù màn có dựng hay không. Với lay-y-kien và suc-khoe, màn lỗi hay trống cũng in DUNG. Đối chứng dương duy nhất (dòng 84-88) chỉ chạy ở bo-okr, không chứng minh khung hành động có mặt ở từng màn đọc. Eval E3 hứa «khong mo duoc man thi thoat 2 kem ly do», nhưng mã không làm vậy. Ngoài ra chiều đỏ (dòng 93-99) tự chèn một `<button data-slot=button>` vào DOM thay vì chạy bản sao HanhDongKhu như eval ghi, nên nó chỉ chứng minh bộ đếm đếm được, không chứng minh đường mã của app làm bài đỏ.
  - rationale: Đường đo của hợp đồng giao bàn đo màn đếm nút chính từng màn cho AC-2, nhưng phép đếm cho 0 cả khi màn không dựng, nên không chứng minh được AC-2.

- **Hình dạng 5 (tuyên quét lớp nhưng có trục ma trận không có tác dụng): trục vai và trục «quyền đang tải» không chạm tới hai màn server**
  - file: `apps/app/test/mot-nut-tao-muc-tieu.dom.tsx:593`
  - severity: medium
  - AC: AC-2
  - source: measurement
  - detail: Ở hai màn so-do và quanh, ma trận mnt-man-doc khai «x 3 vai» và «4 o quyen dang tai». `datNen({ xem })` và `datNen({ xem: TB1, treoQuyen: true })` (dòng 595, 617) chỉ đặt tRPC giả phía client. Còn `dauTrangServer` gọi thẳng hàm trang server với `getServerTrpc` đã mock thành `{}` rồi duyệt cây phần tử, nên không đọc dữ liệu nào trong số đó. Kết quả là 8 trên 18 ô (so-do và quanh × 3 vai, cộng 2 ô đang tải) chỉ là hai phép kiểm tĩnh lặp lại. `expect(soO).toBe(18)` đếm ô, nhưng số ô thật sự phân biệt ít hơn số đã tuyên, nên vai và trạng thái tải ở hai màn này chưa được đo.
  - rationale: AC-2 hứa «bất kỳ vai nào» và «kể cả trong lúc quyền còn tải» cho Sơ đồ và sơ đồ quanh; trục vai và trạng thái tải không tác động tới hai màn đó nên chưa được đo.

- **Hình dạng 2 (fixture viết tay theo đúng khuôn bên đọc): ma trận 12 ô của duongSoan đưa tay đầu vào, không đi qua useDuongSoan; chua-cau-hinh, het-tran, khong-quyen không bao giờ được dựng thành DOM**
  - file: `apps/app/test/mot-nut-tao-muc-tieu.dom.tsx:333`
  - severity: medium
  - AC: AC-7
  - source: measurement
  - detail: Ca «mnt-soan: 12 o» (dòng 331-428) gọi hàm thuần `duongSoan` với `goc` viết tay đúng kiểu `DauVaoDuongSoan`: `cauNoi: true`, `ngayMoLai: "01/11/2026"` gõ sẵn, `tenDon` gõ sẵn. Ca này không đi qua `useDuongSoan`, nơi thật sự tính `cauNoi`, `ngayMoLai: dauThangSau(homNayVn(new Date()))` và `tenDon`. Ở mức DOM, helper `dauTrang` cố định `<DauTrangOkr cauNoi />` (dòng 449), và ca DOM khoá (dòng 771-792) chỉ có dang-chay, het-cuoc, chua-khoa, chua-bat. E13 hứa (5) het-tran, (7) chua-cau-hinh, (8) khong-quyen ở mức dòng hộp (aria-disabled, ItemDescription, 0 soanMo), nhưng ba ô đó chỉ có ở mức hàm thuần. DOM test cũ sol_nut_dom (cauNoi=false) bị đánh dấu superseded sang mnt-tu-muc-tieu#AC-7. Phần nối dây cauNoi chỉ còn regex mã nguồn trong soan-okr-song-lai.spec.ts (`<HopChonDuong[^>]*cauNoi=\{cauNoi\}`), đó là đo chỉ dẫn thay vì đầu ra (hình dạng 1), và regex này không phủ chặng NoiDungHop → `useDuongSoan({ q, cauNoi })`. Bản sao đổi chặng đó thành `cauNoi: true` hay `ngayMoLai: ""` vẫn qua hết bài.
  - rationale: AC-7 liệt các ca khoá (hết trần, chưa cấu hình, không có quyền soạn) với câu lý do ở dòng hộp; các ca này chỉ được kiểm ở hàm thuần, không ở đầu ra DOM.

- **Hình dạng 4 (assert âm tính một mình): «0 lần gọi thủ tục ghi» ở các ô đường dẫn của mnt-khoa không có hành động nào để có thể sai**
  - file: `apps/app/test/mot-nut-tao-muc-tieu.dom.tsx:1014`
  - severity: low
  - AC: AC-8
  - source: measurement
  - detail: `s.kiem(GHI.every((g) => soLanGoi(g) === 0), ...)` (dòng 1014-1017) được đếm thành một ô cho mỗi đường dẫn (`URL.length * 4`). Nhưng ở nhánh không quyền, ô này chỉ dựng trang rồi đọc, không bấm, không gõ, không gửi gì. createObjective, taoTuMau, previewImport, applyImport, soanMo đều chỉ chạy khi người bấm, nên assert này luôn đúng dù hộp có bị chặn hay không. Đối chứng dương ở dòng 1019-1023 chỉ kiểm hộp mở, không kiểm rằng ở cùng dựng đó có thể đếm được một lời gọi ghi.
  - rationale: AC-8 hứa không thủ tục ghi nào được gọi khi người không quyền mở thẳng đường dẫn; assert đếm 0 mà không có hành động nào có thể gọi nên luôn đúng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Thước màn của các hồ sơ đã ký vẫn bấm đường cũ mà không có superseded_by (mới khai cho eval DOM)**
  Người dùng thấy gì: Một số bài đo màn của các tính năng đã ký trước đây vẫn bấm vào nút cũ đã bị gỡ, nên khi kiểm lại chúng sẽ báo đỏ dù tính năng không hỏng.
  Căn cứ: Không ảnh hưởng người dùng cuối nhưng làm các lần kiểm lại sau này đỏ giả và gây nhiễu; sửa cần một việc riêng đi qua 11 hồ sơ đã ký.
  file: `_acceptance/dieu-huong-khu-muc-tieu/evals.yaml`
  severity: high
  Đề xuất: new-contract

- **NutSoan nay là code chết, chỉ bài kiểm còn giữ nó sống; eval đã ký vẫn đo «nút soạn» trên chính component chết đó, còn logic và hằng thì bị nhân đôi sang duong-soan.ts**
  Người dùng thấy gì: Trong mã còn một nút Soạn cũ không còn hiện ở màn nào; người dùng không thấy gì, nhưng sau này hai bản logic có thể lệch nhau.
  Căn cứ: Không gây lỗi hay mất dữ liệu cho người dùng, chỉ là nợ bảo trì; dọn sau rẻ và không gấp.
  file: `apps/app/app/(app)/[slug]/okr/soan/duong-soan.ts`
  severity: medium
  Đề xuất: known-limits

- **Mở thẳng đường dẫn tuMauOkr thì vào hộp chọn mẫu rỗng không lối ra; nút «Viết tay» đã bị gỡ**
  Người dùng thấy gì: Nếu ai mở một liên kết cũ dẫn thẳng vào bước chọn mẫu cho đơn vị chưa có mẫu, họ thấy một hộp trống và chỉ còn cách đóng lại.
  Căn cứ: Hiếm gặp (cần liên kết cũ hoặc mẫu bị xoá), không mất dữ liệu và người dùng thoát được bằng cách đóng rồi bấm Thêm mục tiêu lại.
  file: `apps/app/app/(app)/[slug]/okr/tu-mau.tsx`
  severity: medium
  Đề xuất: known-limits

- **useCoMau gộp lúc đang tải và lúc lỗi vào lý do khoá «Chưa có mẫu cho cấp này»**
  Người dùng thấy gì: Trong lúc danh sách mẫu còn đang tải hoặc tải lỗi, dòng «Từ mẫu» có thể báo sai là chưa có mẫu cho cấp này.
  Căn cứ: Chỉ là thông báo sai thoáng qua, người dùng tải lại là hết và không mất dữ liệu.
  file: `apps/app/app/(app)/[slug]/okr/hop-chon-duong.tsx`
  severity: low
  Đề xuất: known-limits

- **DsCuocTheoUrl bỏ mất cổng quyền và pha mà NutSoan từng áp cho ?dsCuoc**
  Người dùng thấy gì: Người chỉ được xem có thể mở một liên kết để thấy danh sách các cuộc soạn của đơn vị, dù không có quyền soạn.
  Căn cứ: Dữ liệu vẫn được máy chủ lọc theo quyền nên không lộ gì thêm, chỉ lệch nếp giao diện; sửa sau rẻ.
  file: `apps/app/app/(app)/[slug]/okr/hanh-dong-khu.tsx`
  severity: low
  Đề xuất: known-limits

- **Biến thể khoá của Item làm mờ 50% đúng câu lý do khoá mà thiết kế đòi người dùng đọc được**
  Người dùng thấy gì: Các dòng bị khoá trong hộp Thêm mục tiêu bị làm mờ, nên câu giải thích vì sao khoá hơi khó đọc, nhất là với người nhìn kém.
  Căn cứ: Chữ vẫn hiện và đọc được ở mức vừa phải, không mất chức năng; sửa nằm ở thành phần dùng chung nên cần cân nhắc ảnh hưởng chỗ khác.
  file: `packages/ui/src/components/item.tsx`
  severity: low
  Đề xuất: known-limits

- **Hết cuộc soạn trong kỳ thì lối «Các cuộc đã soạn» biến mất, đúng ca mà quyết định d-15 muốn giữ**
  Người dùng thấy gì: Khi một đơn vị đã dùng hết số cuộc soạn trong kỳ, người dùng không còn cách nào mở lại danh sách các cuộc đã soạn từ màn này.
  Căn cứ: Mất một khả năng xem lại đang có, nhưng không mất dữ liệu và chỉ xảy ra ở đơn vị đã hết cuộc; nên xử lý bằng việc riêng.
  file: `apps/app/app/(app)/[slug]/okr/soan/duong-soan.ts`
  severity: high
  Đề xuất: new-contract

- **Chọn «Soạn cùng Kara» mà soanMo từ chối (ok:false, không có cuocDang) thì không có phản hồi nào, lý do bị bỏ**
  Người dùng thấy gì: Hiếm khi, bấm «Soạn cùng Kara» đúng lúc vừa hết lượt thì hộp đóng lại mà không có thông báo vì sao.
  Căn cứ: Chỉ xảy ra khi hai thao tác đua nhau, không mất dữ liệu và người dùng bấm lại sẽ thấy dòng đã khoá kèm lý do.
  file: `apps/app/app/(app)/[slug]/okr/soan/duong-soan.ts`
  severity: medium
  Đề xuất: known-limits

- **Mở ngăn ở chế độ «Từ mẫu» mà danh sách mẫu rỗng thì kẹt: không còn nút «Viết tay» để thoát**
  Người dùng thấy gì: Nếu mở lại một liên kết đang ở bước chọn mẫu mà đơn vị không còn mẫu, ngăn chỉ còn tiêu đề và danh sách trống, người dùng chỉ có thể bấm Huỷ.
  Căn cứ: Hiếm gặp, không mất dữ liệu, người dùng thoát được bằng Huỷ rồi làm lại từ nút Thêm mục tiêu.
  file: `apps/app/app/(app)/[slug]/okr/tu-mau.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): item-khoa kiểm chuỗi lớp Tailwind có mặt, không kiểm nền khi rê chuột của dòng khoá**
  Người dùng thấy gì: Dòng bị khoá trong hộp có thể vẫn đổi màu nền khi rê chuột, làm trông như bấm được, và bài kiểm hiện tại không phát hiện được lỗi này.
  Căn cứ: Chỉ là chi tiết thị giác nhẹ, không mất dữ liệu; dòng khoá vẫn không bấm được.
  file: `packages/ui/test/item-khoa.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt trong khi lời hứa là quan hệ đếm): E8 hứa «dung mot muc tieu» nhưng chỉ dò innerText.includes**
  Người dùng thấy gì: Bài đo màn sẽ không phát hiện nếu bấm lưu một lần mà sinh ra hai mục tiêu trùng tên.
  Căn cứ: Lỗi nhân đôi nếu có sẽ thấy ngay trên màn và người dùng xoá được; bài đo yếu hơn lời ghi nhưng không che lỗi của tiêu chí đã ký.
  file: `_acceptance/mot-nut-tao-muc-tieu/rang/do-man.mjs`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/16 lỗi rơi vào file không bộ đo nào phủ (_acceptance/dieu-huong-khu-muc-tieu/evals.yaml, packages/ui/test/item-khoa.dom.tsx) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.

