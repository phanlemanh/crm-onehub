# Review findings: so-do-can-chinh-don-vi (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Lệnh nạp `ca-so-do.ts --nap` ghi vào DB mà không qua chặn production `kiemDuocNap`**
  Người dùng thấy gì: Nếu ai đó chạy tay lệnh nạp dữ liệu mẫu của sơ đồ khi máy đang trỏ vào hệ thống thật, dữ liệu mẫu sẽ chui vào dữ liệu thật của công ty, vì lối này không bị chặn như lối nạp mẫu cũ.
  file: `apps/api/scripts/okr-mau/ca-so-do.ts`
  severity: medium
  Đề xuất: new-contract

- **Sơ đồ đếm theo từng người xem, trái với luật tổng hợp của docs/api.md; ở cùng một thẻ thì Bảng và Sơ đồ ra hai con số khác nhau**
  Người dùng thấy gì: Quản trị viên chuyển từ Bảng sang Sơ đồ có thể thấy số mục tiêu và tiến độ của một đơn vị khác với con số ở Bảng, và hai người xem khác quyền có thể thấy hai con số khác nhau.
  file: `apps/api/src/okr/okr-xem.service.ts`
  severity: medium
  Đề xuất: known-limits

- **`so-do-don-vi.ts` viết lại `khoaCuaMucTieu` và `trungBinh` đã có ở `toan-canh.ts`, và lệch ngữ nghĩa**
  Người dùng thấy gì: Tiến độ trung bình của một đơn vị có thể lệch vài điểm phần trăm giữa Bảng và Sơ đồ do làm tròn khác nhau, và sau này sửa một chỗ dễ quên chỗ kia.
  file: `apps/api/src/okr/so-do-don-vi.ts`
  severity: low
  Đề xuất: known-limits

- **`TheDonVi` vẽ tay hộp thẻ ở chỗ gọi, trong khi chính diff thêm `FlowMapCard` vào packages/ui mà không dùng**
  Người dùng thấy gì: Người dùng thấy thẻ đơn vị bình thường, nhưng giao diện được dựng lệch quy ước chung nên sau này chỉnh kiểu thẻ phải sửa ở hai nơi và có một thành phần thừa không ai dùng.
  file: `apps/app/app/(app)/[slug]/okr/toan-canh/the-don-vi.tsx`
  severity: low
  Đề xuất: known-limits

- **Số tinh chỉnh viết thẳng trong flow-map.tsx, dù vùng này đã có config `FLOW_LAYOUT`**
  Người dùng thấy gì: Người dùng không thấy khác biệt; chỉ là khi muốn chỉnh độ mờ hay kiểu nét đứt của sơ đồ thì phải tìm trong mã thay vì một nơi cấu hình chung.
  file: `packages/ui/src/components/flow-map.tsx`
  severity: low
  Đề xuất: wont-fix

- **Chuỗi giao diện và prop thêm mà không dùng**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng; trong mã còn vài câu chữ và tuỳ chọn không được dùng đến, có thể gây rối khi bảo trì.
  file: `apps/app/lib/messages/okr-toan-canh.ts`
  severity: low
  Đề xuất: wont-fix

- **Mục tiêu giới hạn (không căn chỉnh được) bị gắn cờ «Có mục tiêu chưa góp vào đâu» / «Chưa nối lên»**
  Người dùng thấy gì: Quản trị viên có thể thấy một đơn vị bị đánh dấu «Cần chú ý» hoặc «Chưa nối lên» chỉ vì có mục tiêu hạn chế mà hệ thống không cho nối, tức là cảnh báo về việc không ai sửa được, còn người xem hẹp quyền thì không thấy cảnh báo ấy.
  file: `apps/api/src/okr/so-do-don-vi.ts`
  severity: medium
  Đề xuất: new-contract

- **Căn chỉnh tới đích ngoài tập nút: tắt «Chưa nối lên» mà không vẽ dây; đích không có trong mts thì bị bỏ im lặng**
  Người dùng thấy gì: Khi một mục tiêu nối tới đơn vị đã bị đổi hoặc gỡ khỏi cây, thẻ có thể không hiện đường đi lên mà cũng không có nhãn «Chưa nối lên», và dòng trong thẻ mở ra có thể ghi «Chưa góp vào đâu» trong khi số đếm nói khác.
  file: `apps/api/src/okr/so-do-don-vi.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên ma trận nhưng số đếm tự suy): soCap === canh.length là phép đếm tự đúng, không có ma trận viết trước**
  Người dùng thấy gì: Một bài kiểm tra đối chiếu mức tin và lý do giữa sơ đồ và cây căn chỉnh có thể báo xanh dù sơ đồ dư thêm một dòng góp; người dùng chưa thấy lỗi nhưng độ tin của bài kiểm giảm.
  file: `apps/api/test/okr-so-do-don-vi.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (lời hứa là QUAN HỆ bằng nhau, assert chỉ kiểm một chiều bao hàm): tập id sơ đồ ⊆ tập id cây**
  Người dùng thấy gì: Bài kiểm tra chưa bắt được trường hợp sơ đồ bỏ sót một mục tiêu mà người xem lẽ ra thấy, nên nếu có lỗi kiểu đó, người dùng sẽ thấy thiếu mục tiêu mà không ai báo trước.
  file: `apps/api/test/okr-so-do-don-vi.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính đứng một mình): dh4-the không có đối chứng dương rằng có dây hiện**
  Người dùng thấy gì: Bài kiểm tra có thể báo xanh dù sơ đồ không vẽ đường nối nào, nên nếu đường nối biến mất sau này thì không có bài nào kêu.
  file: `apps/app/test/okr-so-do-don-vi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4/5 (bỏ qua phần tử trong ma trận, đối chứng «Mọi đơn vị» chỉ âm tính): dh4-loc `if (!the) continue`**
  Người dùng thấy gì: Bài kiểm tra bộ lọc «Cần chú ý» có thể vẫn xanh nếu bộ lọc xoá hẳn các thẻ thay vì làm mờ, nên lỗi kiểu này có thể lọt tới người dùng.
  file: `apps/app/test/okr-so-do-don-vi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): ca xemToanCanh=la chỉ kiểm vắng [data-so-do], bảng SimpleTable không bao giờ được assert**
  Người dùng thấy gì: Bài kiểm tra chưa chắc chắn rằng Bảng vẫn hiện ra khi đường dẫn mang giá trị lạ, nên nếu trang trống trong ca đó thì không bài nào báo.
  file: `apps/app/test/okr-so-do-don-vi.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo mã nguồn/hàm phụ thay vì đầu ra dựng ra): aria-label ba nút điều khiển và duration lia khung**
  Người dùng thấy gì: Bài kiểm tra chưa chứng minh ba nút thu phóng có nhãn đọc được và chuyển động đã tắt thật khi người dùng chọn giảm chuyển động; nếu hỏng, người dùng đọc màn hình hoặc nhạy chuyển động sẽ gặp trước.
  file: `apps/app/test/okr-so-do-don-vi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo hằng cấu hình thay vì đầu ra): «chú giải có ba dòng» đo CHU_GIAI_SO_DO.length**
  Người dùng thấy gì: Bài kiểm tra chỉ đếm danh sách chú giải chứ không đếm chú giải hiện trên màn, nên nếu chú giải bị mất khỏi sơ đồ thì bài kiểm vẫn xanh.
  file: `apps/app/test/okr-so-do-don-vi.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc, không round-trip): mọi bài DOM ăn dauVaoThuan(), một bản chiếu tay của bộ gieo CSDL**
  Người dùng thấy gì: Các bài kiểm tra giao diện dùng dữ liệu dựng tay chứ không phải dữ liệu thật từ máy chủ, nên nếu hình dạng dữ liệu thật đổi, sơ đồ có thể sai trên màn mà bài kiểm vẫn xanh.
  file: `apps/api/scripts/okr-mau/ca-so-do.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (chép tay thay vì rút từ nguồn khai): danh sách phụ thuộc được phép của package.json gán cứng trong ranh-gioi.mjs**
  Người dùng thấy gì: Nếu chủ kho đổi danh sách gói được phép thêm thì phép kiểm ranh giới sẽ không tự theo, có thể cho phép hoặc chặn nhầm một gói; người dùng không thấy tác động trực tiếp.
  file: `_acceptance/so-do-can-chinh-don-vi/rang/ranh-gioi.mjs`
  severity: low
  Đề xuất: wont-fix

## Chi tiết kỹ thuật (tham khảo cho người sửa, không lên thẻ Cổng 2)

Mỗi mục dưới đây ứng với một finding ở trên theo thứ tự, kèm vị trí dòng, nguồn phát hiện (source) và lý do phân loại ngoài hợp đồng. Tất cả đều khongBacBo (chưa qua bác bỏ đối kháng).

### t1 — nạp mẫu không qua chặn production
Vị trí apps/api/scripts/okr-mau/ca-so-do.ts:441, nguồn conventions. Khối `import.meta.main && process.argv.includes("--nap")` import `@crm/db` rồi gọi `napCaSoDo` thẳng, không gọi `kiemDuocNap(process.env)` như `scripts/okr-mau.ts`. Test chặn `okr-mau-chan.spec.ts` chỉ quét `scripts/okr-mau.ts`; lệnh mới cũng chưa ghi ở mục «Bộ OKR mẫu» của docs/setup.md. Lý do ngoài hợp đồng: không AC nào đòi chặn production, đó là luật của kho.

### t2 — sơ đồ đếm theo từng người xem
Vị trí apps/api/src/okr/okr-xem.service.ts:470, nguồn conventions. docs/api.md ghi các số tổng hợp bỏ mục tiêu giới hạn cho mọi người qua `boGioiHan`; `docDauVaoSoDo` lấy mục tiêu qua `mucTieuCuaCay(userId, cycleId)` (lọc theo người xem) và bỏ tập `gioiHan`. Test xác nhận A1 ra soKr 3 với chủ/quản trị và 1 với NGUOI_XEM_HEP. Hướng sửa: đếm qua `boGioiHan` hoặc ghi ngoại lệ vào docs/api.md. AC-3 chủ động chọn bám cây căn chỉnh nên không AC nào hỏng.

### t3 — trùng mã khoaCuaMucTieu / trungBinh
Vị trí apps/api/src/okr/so-do-don-vi.ts:24, nguồn conventions. Tệp tự viết `khoaCua` và `trungBinh` thay vì dùng `khoaCuaMucTieu` (toan-canh.ts:41) và `trungBinh` (toan-canh.ts:57, có Math.round). Lệch ở ca unitId null (null so với `bp:null`) và cách làm tròn tiến độ.

### t4 — TheDonVi vẽ tay hộp thẻ
Vị trí apps/app/app/(app)/[slug]/okr/toan-canh/the-don-vi.tsx:78, nguồn conventions. docs/design.md trả lại hộp `rounded-lg border` tự dựng ở apps/app; `FlowMapCard` (packages/ui/src/components/flow-map.tsx:153) thêm trong diff nhưng không ai dùng. Dòng 197 thêm hộp `rounded-md bg-muted/40 p-2`; dòng 182 đè className lên Button variant link. Mẫu có sẵn: khoi-muc-tieu.tsx:93.

### t5 — số tinh chỉnh viết thẳng
Vị trí packages/ui/src/components/flow-map.tsx:96, nguồn conventions. `borderRadius: 8` (96), nét 1.5/1 (118), gạch đứt 6/4 (120), độ mờ dây 0.25 (121, 131), độ mờ nút 0.35 (284), `delayDuration={300}` (210), trong khi `FLOW_LAYOUT` đã có ở packages/ui/src/lib/flow-layout.ts. Vi phạm quy ước AGENTS.md về magic number.

### t6 — chuỗi và prop thừa
Vị trí apps/app/lib/messages/okr-toan-canh.ts:204, nguồn conventions. Khoá `soDo.moTa`, `soDo.moNhanh`, `soDo.dongNhanh`, `soDo.dong` (vi lẫn en) không được đọc ở đâu trong toan-canh/. `FlowMap` có prop `focusId`, `overview`, `onNodeClick` và export `FlowMapCard` mà caller duy nhất không dùng; Knip không bắt vì src/components/**/*.tsx của packages/ui là entry.

### t7 — mục tiêu giới hạn bị gắn cờ chưa góp
Vị trí apps/api/src/okr/so-do-don-vi.ts:115, nguồn bugs. `docDauVaoSoDo` (okr-xem.service.ts:472) bỏ tập `gioiHan`; server cấm căn chỉnh mục tiêu giới hạn (`gioiHanKhongCanChinh`) nên chúng luôn có alignments rỗng, nhưng `gopSoDoDonVi` vẫn tính vào `chuaGop`, bật cờ `muc-tieu-chua-gop` và canChuY; nếu mọi mục tiêu của đơn vị là giới hạn thì thêm `chua-noi`. Cây căn chỉnh (`dungCayCanChinh`) đã lọc đúng các mục này. Cờ đổi theo người xem chứ không theo vật. Bộ gieo `sd-g` tránh ca này bằng cách cho một căn chỉnh mà server thật không cho tạo. Cách sửa: truyền `gioiHan` vào DauVaoSoDo và không đếm cho id thuộc gioiHan. Chưa chỉ được AC nào bị vi phạm đích danh.

### t8 — đích ngoài tập nút
Vị trí apps/api/src/okr/so-do-don-vi.ts:119, nguồn bugs. `khoaMucTieu` không kiểm khoá có trong `donVi` dựng từ cayGon; nhánh dòng 136–147 vẫn đặt `raNgoai = true` và đẩy `duong` có `tu` không phải nút; phía khách `dungSoDo` lọc dây này (`hien.has(d.tu)`), nên thẻ không có dây và không có cờ «Chưa nối lên». Chiều ngược: đích không có trong mts (dòng 119) thì dòng góp bị bỏ im lặng, trong khi `chuaGop` tính theo `m.alignments.length`, nên thẻ mở in «Chưa góp vào đâu» mâu thuẫn số đếm. Cách sửa: chỉ coi là góp ra ngoài khi `tenDonVi.has(khoaDich)` và tính `chuaGop` theo `gop.length` sau lọc.

### t9 — soCap === canh.length tự đúng
Vị trí apps/api/test/okr-so-do-don-vi.spec.ts:375, nguồn measurement. dh4-ly-do tăng `soCap` mỗi vòng `for (const c of canh)` rồi `expect(soCap).toBe(canh.length)`; assert không bao giờ đỏ. Tập cần so rút từ đầu ra (cay.canh lọc theo idSoDo) thay vì ma trận cặp viết trước, và phép so chỉ một chiều canh sang dòng.

### t10 — chỉ kiểm một chiều bao hàm
Vị trí apps/api/test/okr-so-do-don-vi.spec.ts:336, nguồn measurement. E3 khai toEqual tập id với okr.cayCanChinh, code chỉ có `expect(idCay.has(id)).toBe(true)` (sơ đồ ⊆ cây). Chiều cây ⊆ sơ đồ không có assert; chỉ A1 được ghim số lượng riêng.

### t11 — dh4-the thiếu đối chứng dương cho dây
Vị trí apps/app/test/okr-so-do-don-vi.dom.tsx:416, nguồn measurement. `hien` lọc bỏ dây kind "an"; kiểm chưa nối là `if (hien.some(...)) throw` (âm tính), vòng liền/đứt rỗng khi hien rỗng, không có assert hien.length > 0. Đột biến (d) chỉ thử chiều an sang lien. Lưu ý liên quan E12: phép đếm dây bằng selector rf__edge-* ở màn thật cũng đang ra 0.

### t12 — dh4-loc bỏ qua im lặng
Vị trí apps/app/test/okr-so-do-don-vi.dom.tsx:496, nguồn measurement. Vòng `if (!the) continue` bỏ qua thẻ không còn trong DOM nên bản lọc XOÁ thẻ vẫn xanh; đối chứng «Mọi đơn vị» ở dòng 504 chỉ là `querySelectorAll("[data-chim]").length === 0`, cũng âm tính một mình.

### t13 — ca xemToanCanh=la
Vị trí apps/app/test/okr-so-do-don-vi.dom.tsx:378, nguồn measurement. Vòng `["xemToanCanh=so-do", "xemToanCanh=la"]` chỉ so `coSoDo` với `ts.endsWith("so-do")`; bảng SimpleTable không bao giờ được truy vấn (có mặt ở bang/la, vắng ở so-do).

### t14 — aria-label và duration đo mã nguồn
Vị trí apps/app/test/okr-so-do-don-vi.dom.tsx:757, nguồn measurement. Bài dh4-chu đọc flow-map.tsx bằng readFileSync rồi `toContain` chuỗi mã; phần giảm chuyển động chỉ gọi `thoiGianChuyenDong()` trực tiếp, không kiểm zoomIn/zoomOut/fitView/setCenter nhận duration (flow-map.tsx giữ qua `useState(thoiGianChuyenDong)` dòng 266).

### t15 — chú giải đo hằng
Vị trí apps/app/test/okr-so-do-don-vi.dom.tsx:478, nguồn measurement. `SoDo.CHU_GIAI_SO_DO.length` bằng 3 là đo mảng hằng, không đếm dòng đã render (so-do-don-vi.tsx dòng 279).

### t16 — dauVaoThuan() là bản chiếu tay
Vị trí apps/api/scripts/okr-mau/ca-so-do.ts:374, nguồn measurement. Bài DOM (dòng 61, 700 của okr-so-do-don-vi.dom.tsx) ăn `dauVaoThuan()` dựng tay: progress là trung bình KR, expected gán cứng KY_VONG_THUAN = 46, alignments tự đặt, giới hạn lọc tay bằng `filter(m => !m.gioiHan)`. Không bài nào so nó với đầu ra của `OkrXemService.docDauVaoSoDo` thật trên cùng bộ gieo.

### t17 — danh sách phụ thuộc gán cứng
Vị trí _acceptance/so-do-can-chinh-don-vi/rang/ranh-gioi.mjs:17, nguồn measurement. `PHU_THUOC_DUOC = ["@xyflow/react", "@dagrejs/dagre"]` là hằng chép tay, không đọc decisions.jsonl; đối chứng doiChung() cũng chỉ thử chống lại chính hằng này.

⚠ Cụm ngoài vùng phủ: 2/17 lỗi rơi vào file không bộ đo nào phủ (apps/api/scripts/okr-mau/ca-so-do.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
