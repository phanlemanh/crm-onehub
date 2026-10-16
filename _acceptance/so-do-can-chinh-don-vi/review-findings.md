# Review findings: so-do-can-chinh-don-vi (round 3)

## Trong hợp đồng

- **Trạng thái «kỳ chưa có mục tiêu công bố» của Sơ đồ (AC-10) không bao giờ hiện trong app thật**
  AC: AC-10
  file: `apps/app/app/(app)/[slug]/okr/toan-canh/toan-canh.tsx:326`
  severity: medium
  source: bugs
  detail: Thẻ «Theo đơn vị», kèm ViewSwitch Bảng/Sơ đồ và `<SoDoDonVi>`, chỉ dựng ở nhánh `tuanDau ? <Empty…> : <Card…>`. Trong đó `tuanDau = hang.every(h => h.soMucTieu === 0)` và `hang` lấy từ `toanCanh`, vốn đếm mọi mục tiêu `cong-bo` công khai (pham `so-gop` = `boGioiHan`) của các đơn vị. Nhánh `kyRong` trong so-do-don-vi.tsx (`q.data.nut.every(n => n.soMucTieu === 0)`) chỉ đúng khi người xem không thấy mục tiêu công bố nào của đơn vị. Mọi mục tiêu công khai đã công bố đều có trong `mucTieuCuaCay`, nên hễ `tuanDau` sai thì `kyRong` cũng sai. Còn khi kỳ thật sự rỗng thì `tuanDau` đúng, thẻ chứa Sơ đồ không được dựng. Hệ quả: câu «Kỳ này chưa có mục tiêu công bố» cùng thẻ công ty (AC-10) không bao giờ tới tay người dùng, kể cả khi đường dẫn mang `?xemToanCanh=so-do`; người dùng chỉ thấy Empty «tuần đầu» và không có ViewSwitch. Bài DOM `dh4-trang-thai` vẫn xanh vì nó dựng thẳng `<SoDo.default cycleId={QUY}/>` (okr-so-do-don-vi.dom.tsx:706), bỏ qua `ToanCanh`, nên phép đo không gắn vào đường người dùng thật đi qua.
  rationale: AC-10 hứa kỳ chưa có mục tiêu công bố thì thẻ công ty kèm câu «Kỳ này chưa có mục tiêu công bố»; finding nói trên đường người dùng thật câu đó không bao giờ tới.

- **Mục tiêu công ty giới hạn hiển thị bị loại khỏi nút `goc`, lệch với cây căn chỉnh (AC-3)**
  AC: AC-3
  file: `apps/api/src/okr/so-do-don-vi.ts:89`
  severity: medium
  source: bugs
  detail: Bộ lọc `(!vao.gioiHan.has(m.id) || coDichThay(m))` bỏ mọi mục tiêu có hiển thị giới hạn mà không căn chỉnh tới đâu, và áp cho mọi cấp, kể cả `onehub`. `gioiHan` (okr.service.ts:1687) là tập mục tiêu người xem THẤY nhưng không công khai; với quản trị thì đó là mọi mục tiêu không công khai. Mục tiêu cấp công ty thường không căn chỉnh lên đâu, nên một mục tiêu công ty giới hạn, dù người xem thấy được, sẽ bị loại khỏi nút `goc`: `soMucTieu`, `soKr`, `tienDo` và danh sách mục tiêu khi mở thẻ công ty đều thiếu nó. Trong khi đó `dungCayCanChinh` (can-chinh.ts:114) đưa MỌI mục tiêu `level === "onehub"` vào `roots` bất kể `gioiHan`; luật loại «giới hạn không căn chỉnh» ở đó chỉ áp cho `chuaCanChinh` của cấp khác công ty. Vậy AC-3 («tập mục tiêu dùng cho sơ đồ bằng đúng tập mục tiêu công bố của kỳ mà cây căn chỉnh trả cho cùng người xem») sai với mọi người xem thấy được một mục tiêu công ty giới hạn. Bài `dh4-quyen` không phủ ca này: bộ gieo `ca-so-do.ts` chỉ khai mục tiêu cấp `bo-phan`/`phong-ban`.
  rationale: AC-3 đòi tập mục tiêu của sơ đồ bằng đúng tập cây căn chỉnh trả cho cùng người xem; finding chỉ ra sai lệch với mục tiêu công ty giới hạn.

- **Hình dạng 1 (đo CHỈ DẪN thay vì ĐẦU RA): aria-label của ba nút điều khiển và duration khi giảm chuyển động được đo bằng grep mã nguồn và hàm phụ, không đo FlowMap dựng ra**
  AC: AC-11
  file: `apps/app/test/okr-so-do-don-vi.dom.tsx:753`
  severity: medium
  source: measurement
  detail: E11 hứa «ba nút điều khiển có aria-label đúng msg; khi prefers-reduced-motion thì lời gọi lia khung có duration 0». Dòng 753-759 đọc chữ của packages/ui/src/components/flow-map.tsx rồi `expect(ma).toContain(`nhan: msg.${k}`)` và `toContain("aria-label={n.nhan}")`, tức là grep văn bản. Không có lần nào dựng FlowMap rồi đọc aria-label trên nút thật. Dòng 765/770 chỉ gọi `thoiGianChuyenDong()` của flow-layout.ts. Không phép đo nào chứng minh zoomIn/zoomOut/fitView (flow-map.tsx 203-205, 363) thật sự nhận giá trị đó: thoiGian lấy qua `useState(thoiGianChuyenDong)` ở dòng 266. Ví dụ đổi nút sang render `aria-label={msg.dieuKhien}` mà vẫn giữ chuỗi `nhan: msg.thuNho` trong mảng thì bài vẫn xanh. Đây là lỗi đã nêu ở r1 và vẫn còn.
  rationale: AC-11 hứa ba nút có aria-label và không lia/phóng hiệu ứng khi giảm chuyển động; bằng chứng của nó không đo vật thật.

- **Hình dạng 2 (fixture VIẾT TAY đúng khuôn bên đọc): mọi bài DOM ăn dauVaoThuan(), một bản chiếu tay DauVaoSoDo/MucTieuOutput chứ không rút từ docDauVaoSoDo thật**
  AC: AC-5
  file: `apps/api/scripts/okr-mau/ca-so-do.ts:384`
  severity: medium
  source: measurement
  detail: E5 và E7 khai dữ liệu «sinh từ bộ của E1 qua gopSoDoDonVi (không viết tay)». Nhưng `soDoThuan()` (dom.tsx:60-61) lấy đầu vào từ `dauVaoThuan()`/`mucTieuThuan()` (ca-so-do.ts:303-450). Đây là bộ ghi thứ hai viết tay theo khuôn bên đọc, không phải đường service rút từ CSDL. Nó lệch writer thật ở những chỗ cụ thể: `keyResultTitle: g.dichKr ?? null` gán id KR làm tên, `unitName: p.unitId ?? "OneHub"`, `expected` cố định 46, `truongGoc: null`, và bỏ hẳn mục tiêu gioiHan. dom.tsx:547 `expect(d.textContent).toContain(g.tenDich)` vì thế so thẻ với chính giá trị tay ấy (một id KR), không so với tên đích mà service thật trả. Writer thật (docDauVaoSoDo) và bản chiếu này có thể trôi khỏi nhau mà không bài nào đỏ. Lỗi đã nêu ở r1 và vẫn còn.
  rationale: Bài dựng thẻ và đường (AC-5) ăn dữ liệu viết tay không đi qua đường service thật, nên không chứng minh được thẻ đúng với đầu ra thật.

- **Hình dạng 3 (lời hứa là QUAN HỆ, assert chỉ đếm hoặc kiểm có mặt): thẻ «đủ số liệu» chỉ đếm 3 phần tử [data-tinh-trang], cờ kiểm bằng toContain**
  AC: AC-5
  file: `apps/app/test/okr-so-do-don-vi.dom.tsx:478`
  severity: medium
  source: measurement
  detail: E5 hứa thẻ có «số mục tiêu · KR · tiến độ, ba số tình trạng» và «[data-co] liệt kê đúng tên các cờ đang bật». Đây là quan hệ giữa chữ trên thẻ và nut.soMucTieu/soKr/tienDo/tinhTrang/co. Dòng 478 `expect(a1?.querySelectorAll("[data-tinh-trang]").length).toBe(3)` chỉ đếm phần tử, không so ba con số với `nut.tinhTrang`. soMucTieu, soKr và tienDo không có assert nào. Vòng năm cờ (462-475) dùng `expect(tenCo).toContain(vi.co[c])`, chỉ kiểm có mặt, nên thẻ in thêm cờ không bật vẫn xanh. Riêng B2 được so bằng toEqual.
  rationale: AC-5 hứa thẻ mang số mục tiêu, KR, tiến độ, ba số tình trạng và dòng gọi tên đúng cờ đang bật; assert chỉ đếm phần tử và kiểm có mặt.

- **Hình dạng 4 (âm tính một mình): dh4-the không có đối chứng dương rằng có dây hiển thị**
  AC: AC-5
  file: `apps/app/test/okr-so-do-don-vi.dom.tsx:417`
  severity: medium
  source: measurement
  detail: `const hien = ve.day.filter((d) => d.data?.kind !== "an")`. Sau đó `if (hien.some(d => d.target === n.khoa)) throw 'duong ve cho don vi chua noi'` và vòng `for (const d of hien) expect(d.data?.kind).toBe(goc.loai)` đều đúng một cách rỗng khi hien rỗng. Không có `expect(hien.length).toBeGreaterThan(0)`, cũng không so tập dây hiện với s.duong. Một dungSoDo không vẽ dây nào (hoặc gán mọi dây kind 'an') vẫn qua cả hai kiểm «nét liền/đứt đúng loại» lẫn «không dây cho đơn vị chưa nối». Lỗi đã nêu ở r1 và vẫn còn.
  rationale: AC-5 hứa đường lien nét liền, dut nét đứt và đơn vị chưa nối lên không có đường đi lên; kiểm đúng một cách rỗng khi không có dây nào.

- **Hình dạng 4 (âm tính một mình): ca xemToanCanh=la/mặc định chỉ kiểm vắng [data-so-do], bảng SimpleTable không bao giờ được assert**
  AC: AC-4
  file: `apps/app/test/okr-so-do-don-vi.dom.tsx:379`
  severity: medium
  source: measurement
  detail: E4 hứa «mặc định bang và bảng SimpleTable có mặt; xemToanCanh=so-do thì sơ đồ hiện, bảng vắng; giá trị lạ đọc như bang». Dòng 372 `expect(querySelector("[data-so-do]")).toBeNull()` và dòng 379 `coSoDo: ts.endsWith("so-do")` chỉ đo sự vắng hoặc có của sơ đồ. Không chỗ nào assert bảng có mặt ở mặc định và ở `la`, hay bảng vắng ở `so-do`. Màn trắng (bảng không render) vẫn cho `coSoDo === false` và xanh. Lỗi đã nêu ở r1 và vẫn còn.
  rationale: AC-4 hứa mặc định là Bảng và bảng hiện có giữ nguyên; không bài nào assert bảng có mặt.

- **Hình dạng 4 (thiếu đối chứng dương): «mo the trong nhanh gop» không chứng minh nhánh B bị gộp trước khi đặt moDonVi; ngưỡng 11 chép số**
  AC: AC-7
  file: `apps/app/test/okr-so-do-don-vi.dom.tsx:584`
  severity: medium
  source: measurement
  detail: `gopSoDoDonVi(toChuc(11, null, null))` hardcode 11 (3+11=14 đơn vị) thay vì suy từ `SO_DO.thuGonKhiHon`, trong khi dh4-thu-gon có suy. Kiểm `if (!ve.nut.some(n => n.id === pbB.khoa)) throw 'mo the trong nhanh gop'` chỉ là có mặt. Không có đối chứng rằng với TT0 (moDonVi null) pbB KHÔNG là nút. Nếu ngưỡng tăng lên ≥14 hoặc dungSoDo thôi thu gọn, pbB luôn là nút và bài vẫn xanh, không phân biệt được «tự mở nhánh vì moDonVi» với «chưa bao giờ gộp». Bài cũng không assert thẻ B1 ở trạng thái mở (dangMo), dù E7 hứa «thẻ B1 mở».
  rationale: AC-7 hứa tải lại mở đúng thẻ kể cả khi thẻ là phòng ban đang bị gộp (nhánh tự mở); bài không phân biệt được nhánh tự mở với chưa từng gộp.

- **Hình dạng 5 (tuyên mọi khoá nhưng chỉ kiểm một điểm): khoá soDo của packages/ui/src/lib/messages.ts chỉ so thuNho vi≠en**
  AC: AC-11
  file: `apps/app/test/okr-so-do-don-vi.dom.tsx:733`
  severity: medium
  source: measurement
  detail: E11 hứa «khoá soDo trong packages/ui/src/lib/messages.ts cũng vậy», tức mọi khoá có ở vi và en và hai bản khác nhau. Khối này có 13 khoá (dieuKhien, thuNho, phongTo, vuaKhung, mucPhong, vaiNut, vaiDay, day, moTaNut, moTaDay, banDoNho, diemNoi, nutDaDich). Dòng 732 so tập khoá, đúng. Nhưng dòng 733 chỉ `expect(uiVi.thuNho).not.toBe(uiEn.thuNho)`: 12 khoá còn lại có chép bản en sang vi vẫn xanh. Khối của app (724-729) thì có lặp đủ mọi khoá, nên đây là lệch giữa hai nửa của cùng một lời hứa.
  rationale: AC-11 đòi chữ khung có đủ vi, en khác nhau; chỉ một trong 13 khoá được kiểm khác nhau.

- **Hình dạng 5 (số đếm tự suy thay vì ma trận viết trước): dh4-ly-do `expect(soCap).toBe(canh.length)` là phép đếm tự đúng**
  AC: AC-7
  file: `apps/api/test/okr-so-do-don-vi.spec.ts:401`
  severity: medium
  source: measurement
  detail: `soCap` tăng 1 cho mỗi phần tử của `canh` trong chính vòng `for (const c of canh)`, mọi nhánh lệch đều throw trước đó, nên `soCap === canh.length` đúng theo cấu tạo. Nó không ghim số cặp mong đợi. Nếu bộ lọc `cay.canh.filter((c) => idSoDo.has(c.tu))` trả ít cạnh hơn (sơ đồ thiếu mục tiêu, hoặc cây rỗng), số đếm vẫn khớp. Chỉ có `hai.length === 2` cho sd-a3-1 và `≥1 mucTin khác chua-co-ly-do` là ghim thật. Không có assert nào kiểm có một cạnh `lyDoTuKara === true`, dù E17 khai «một cạnh co-so-lieu do Kara viết». Hình dạng tự-đếm đã nêu ở r1 và vẫn còn.
  rationale: AC-7 đòi mức tin, câu lý do, dấu Kara của mỗi cặp bằng đúng trường cạnh của cây căn chỉnh; phép đếm tự đúng không ghim được điều đó.

- **Hình dạng 4 (đối chứng dương không cùng phép đo): «0 dây đi lên» đối chứng bằng tổng số cạnh, không qua cùng bộ khớp endsWith('->k')**
  AC: AC-12
  file: `_acceptance/so-do-can-chinh-don-vi/rang/man.mjs:161`
  severity: low
  source: measurement
  detail: Kiểm `c.day === 0` đếm `.react-flow__edge[data-id]` có data-id `endsWith(`->${k}`)`. Đối chứng ở dòng 163-169 chỉ là `tongDay > 0`, đếm MỌI cạnh, kể cả cạnh ẩn `${cha}~>${id}`. Không có đối chứng rằng bộ khớp `->k` bắt được ≥1 dây với một đơn vị ĐÃ nối (ví dụ A1/A3). Nếu định dạng id cạnh đổi (dungSoDo dòng 145) thì mọi đơn vị cho 0 dây, tongDay vẫn >0, và kiểm chưa-nối xanh rỗng. Tương tự ở dòng 177-194: «đúng tập cần chú ý không mờ» chỉ kiểm tập của writer ⊆ thẻ rõ cộng ≥1 thẻ mờ. Một thẻ không cần chú ý mà bị để rõ thì không bị bắt.
  rationale: AC-12 hứa trên màn thật đơn vị chưa nối lên không có đường đi lên; phép đo này có thể xanh rỗng.

- **Hình dạng 2 (chép tay thay vì rút từ nguồn khai): danh sách phụ thuộc được phép của package.json gán cứng**
  AC: AC-15
  file: `_acceptance/so-do-can-chinh-don-vi/rang/ranh-gioi.mjs:17`
  severity: low
  source: measurement
  detail: E16 hứa «packages/ui/package.json chỉ thêm khoá phụ thuộc có trong dòng chọn của Cổng Phạm vi ghi ở decisions.jsonl». Script lại khai `const PHU_THUOC_DUOC = ["@xyflow/react", "@dagrejs/dagre"]` và không đọc decisions.jsonl. Nguồn quyết định và thước có thể trôi khỏi nhau: sổ ghi chọn khác thì răng vẫn so với bản chép tay. Lỗi đã nêu ở r1 và vẫn còn.
  rationale: AC-15 đòi packages/ui/package.json chỉ thêm đúng phụ thuộc chủ kho chọn ở Cổng Phạm vi; thước gán cứng không đọc sổ quyết định.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E14 đã gỡ khỏi evals nhưng executor dh4_giu_ho_so, tệp rang/giu-ho-so.mjs và đoạn Notes «Giới hạn đo của AC-14» vẫn còn, viết như răng đang chạy**
  Người dùng thấy gì: Thẻ bằng chứng còn một đoạn nói kiểm tra chạy lại các bài đã ký vẫn đang hoạt động, trong khi ngay phía trên đã ghi là kiểm tra này bị gỡ. Người đọc có thể hiểu nhầm là có một lớp kiểm tra mà thực tế không còn chạy.
  file: `_acceptance/so-do-can-chinh-don-vi/contract.md`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP «mọi eval đã ký chạm diff» nhưng bộ lọc rơi im cả lớp đường [slug]): coDaiDien coi `[` là ký tự đại diện**
  Người dùng thấy gì: Một kiểm tra phụ chạy lại các bài đã ký bỏ sót những trang có đường dẫn dạng thư mục động, nhưng kiểm tra này đã được gỡ khỏi bộ nghiệm thu của lần ship này. Hậu quả với người dùng là không có, chỉ là lớp bảo vệ phụ ấy không phủ hết.
  file: `_acceptance/so-do-can-chinh-don-vi/rang/giu-ho-so.mjs`
  severity: low
  Đề xuất: known-limits

- **Răng E14 (giu-ho-so.mjs) tha mọi eval đỏ trên vật thành «DO SAN» khi bản nền đỏ vì BẤT KỲ lý do gì, không so cùng mã như hợp đồng hứa (r2)**
  Người dùng thấy gì: Bước kiểm tra xem vòng này có làm hỏng các hồ sơ đã ký trước đó có thể bỏ sót một lỗi thật: nó coi mọi trường hợp bản gốc cũng lỗi là «lỗi sẵn có», kể cả khi bản gốc lỗi vì lý do khác. Người dùng cuối không bị ảnh hưởng ngay, nhưng báo cáo «giữ hồ sơ đã ký đạt» có thể xanh trong khi một hồ sơ đã ký thực ra bị hỏng.
  file: `_acceptance/so-do-can-chinh-don-vi/rang/giu-ho-so.mjs`
  severity: medium
  Đề xuất: known-limits

- **giu-ho-so.mjs: an eval that fails on the base for any reason, with any exit code, is labelled 'DO SAN' and is not counted against the round (r2)**
  Người dùng thấy gì: Bước kiểm tra hồ sơ cũ có thể nhầm một lỗi thật thành «đã lỗi từ trước» chỉ vì bản đối chiếu cũng chạy lỗi vì lý do không liên quan. Khi đó một tính năng đã được ký nhận có thể hỏng mà báo cáo vẫn hiện xanh.
  file: `_acceptance/so-do-can-chinh-don-vi/rang/giu-ho-so.mjs`
  severity: high
  Đề xuất: known-limits

- **giu-ho-so.mjs banNen: symlinking node_modules back to GOC makes @crm/* imports resolve to the changed packages, not the base (r2)**
  Người dùng thấy gì: Phép so sánh với «bản trước khi sửa» thực ra vẫn dùng một phần mã mới, nên có thể che đi việc vòng này làm hỏng một tính năng cũ ở các màn dùng chung. Người dùng có thể gặp lỗi mà báo cáo kiểm tra không cảnh báo.
  file: `_acceptance/so-do-can-chinh-don-vi/rang/giu-ho-so.mjs`
  severity: high
  Đề xuất: known-limits

- **FlowMap's node description tells users that Enter/Space opens the card, but on the node wrapper Enter only selects the node (r2 · tệp đã đổi)**
  Người dùng thấy gì: Người dùng trình đọc màn hình có thể nghe «nhấn Enter để mở thẻ» ở một điểm dừng mà bấm Enter chỉ chọn thẻ chứ không mở ra. Họ phải chuyển sang nút bên trong thẻ mới mở được.
  file: `packages/ui/src/components/flow-map.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — assertion âm-tính-một-mình: nhánh «DO SAN» coi mọi lần bản nền không xanh là «đỏ sẵn», không đối chứng dương cho bản nền, không ghim mã/thông điệp (r2)**
  Người dùng thấy gì: Phép kiểm tra hồ sơ cũ có thể báo «lỗi sẵn có» cả khi bản đối chiếu hỏng vì lý do khác, mà không có bước xác nhận bản đối chiếu chạy được. Kết quả là một lỗi thật có thể bị bỏ sót và báo cáo vẫn hiện đạt.
  file: `_acceptance/so-do-can-chinh-don-vi/rang/giu-ho-so.mjs`
  severity: medium
  Đề xuất: known-limits

- **Lệnh nạp `ca-so-do.ts --nap` ghi vào DB mà không qua chặn production `kiemDuocNap` (r1)**
  Người dùng thấy gì: Nếu ai đó chạy tay lệnh nạp dữ liệu mẫu của sơ đồ khi máy đang trỏ vào hệ thống thật, dữ liệu mẫu sẽ chui vào dữ liệu thật của công ty, vì lối này không bị chặn như lối nạp mẫu cũ.
  file: `apps/api/scripts/okr-mau/ca-so-do.ts`
  severity: medium
  Đề xuất: new-contract

- **Sơ đồ đếm theo từng người xem, trái với luật tổng hợp của docs/api.md; ở cùng một thẻ thì Bảng và Sơ đồ ra hai con số khác nhau (r1)**
  Người dùng thấy gì: Quản trị viên chuyển từ Bảng sang Sơ đồ có thể thấy số mục tiêu và tiến độ của một đơn vị khác với con số ở Bảng, và hai người xem khác quyền có thể thấy hai con số khác nhau.
  file: `apps/api/src/okr/okr-xem.service.ts`
  severity: medium
  Đề xuất: known-limits

- **`so-do-don-vi.ts` viết lại `khoaCuaMucTieu` và `trungBinh` đã có ở `toan-canh.ts`, và lệch ngữ nghĩa (r1)**
  Người dùng thấy gì: Tiến độ trung bình của một đơn vị có thể lệch vài điểm phần trăm giữa Bảng và Sơ đồ do làm tròn khác nhau, và sau này sửa một chỗ dễ quên chỗ kia.
  file: `apps/api/src/okr/so-do-don-vi.ts`
  severity: low
  Đề xuất: known-limits

- **`TheDonVi` vẽ tay hộp thẻ ở chỗ gọi, trong khi chính diff thêm `FlowMapCard` vào packages/ui mà không dùng (r1)**
  Người dùng thấy gì: Người dùng thấy thẻ đơn vị bình thường, nhưng giao diện được dựng lệch quy ước chung nên sau này chỉnh kiểu thẻ phải sửa ở hai nơi và có một thành phần thừa không ai dùng.
  file: `apps/app/app/(app)/[slug]/okr/toan-canh/the-don-vi.tsx`
  severity: low
  Đề xuất: known-limits

- **Số tinh chỉnh viết thẳng trong flow-map.tsx, dù vùng này đã có config `FLOW_LAYOUT` (r1 · tệp đã đổi)**
  Người dùng thấy gì: Người dùng không thấy khác biệt; chỉ là khi muốn chỉnh độ mờ hay kiểu nét đứt của sơ đồ thì phải tìm trong mã thay vì một nơi cấu hình chung.
  file: `packages/ui/src/components/flow-map.tsx`
  severity: low
  Đề xuất: wont-fix

- **Chuỗi giao diện và prop thêm mà không dùng (r1)**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng; trong mã còn vài câu chữ và tuỳ chọn không được dùng đến, có thể gây rối khi bảo trì.
  file: `apps/app/lib/messages/okr-toan-canh.ts`
  severity: low
  Đề xuất: wont-fix

- **Mục tiêu giới hạn (không căn chỉnh được) bị gắn cờ «Có mục tiêu chưa góp vào đâu» / «Chưa nối lên» (r1)**
  Người dùng thấy gì: Quản trị viên có thể thấy một đơn vị bị đánh dấu «Cần chú ý» hoặc «Chưa nối lên» chỉ vì có mục tiêu hạn chế mà hệ thống không cho nối, tức là cảnh báo về việc không ai sửa được, còn người xem hẹp quyền thì không thấy cảnh báo ấy.
  file: `apps/api/src/okr/so-do-don-vi.ts`
  severity: medium
  Đề xuất: new-contract

- **Căn chỉnh tới đích ngoài tập nút: tắt «Chưa nối lên» mà không vẽ dây; đích không có trong mts thì bị bỏ im lặng (r1)**
  Người dùng thấy gì: Khi một mục tiêu nối tới đơn vị đã bị đổi hoặc gỡ khỏi cây, thẻ có thể không hiện đường đi lên mà cũng không có nhãn «Chưa nối lên», và dòng trong thẻ mở ra có thể ghi «Chưa góp vào đâu» trong khi số đếm nói khác.
  file: `apps/api/src/okr/so-do-don-vi.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên ma trận nhưng số đếm tự suy): soCap === canh.length là phép đếm tự đúng, không có ma trận viết trước (r1)**
  Người dùng thấy gì: Một bài kiểm tra đối chiếu mức tin và lý do giữa sơ đồ và cây căn chỉnh có thể báo xanh dù sơ đồ dư thêm một dòng góp; người dùng chưa thấy lỗi nhưng độ tin của bài kiểm giảm.
  file: `apps/api/test/okr-so-do-don-vi.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (lời hứa là QUAN HỆ bằng nhau, assert chỉ kiểm một chiều bao hàm): tập id sơ đồ ⊆ tập id cây (r1)**
  Người dùng thấy gì: Bài kiểm tra chưa bắt được trường hợp sơ đồ bỏ sót một mục tiêu mà người xem lẽ ra thấy, nên nếu có lỗi kiểu đó, người dùng sẽ thấy thiếu mục tiêu mà không ai báo trước.
  file: `apps/api/test/okr-so-do-don-vi.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính đứng một mình): dh4-the không có đối chứng dương rằng có dây hiện (r1)**
  Người dùng thấy gì: Bài kiểm tra có thể báo xanh dù sơ đồ không vẽ đường nối nào, nên nếu đường nối biến mất sau này thì không có bài nào kêu.
  file: `apps/app/test/okr-so-do-don-vi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4/5 (bỏ qua phần tử trong ma trận, đối chứng «Mọi đơn vị» chỉ âm tính): dh4-loc `if (!the) continue` (r1)**
  Người dùng thấy gì: Bài kiểm tra bộ lọc «Cần chú ý» có thể vẫn xanh nếu bộ lọc xoá hẳn các thẻ thay vì làm mờ, nên lỗi kiểu này có thể lọt tới người dùng.
  file: `apps/app/test/okr-so-do-don-vi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): ca xemToanCanh=la chỉ kiểm vắng [data-so-do], bảng SimpleTable không bao giờ được assert (r1)**
  Người dùng thấy gì: Bài kiểm tra chưa chắc chắn rằng Bảng vẫn hiện ra khi đường dẫn mang giá trị lạ, nên nếu trang trống trong ca đó thì không bài nào báo.
  file: `apps/app/test/okr-so-do-don-vi.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo mã nguồn/hàm phụ thay vì đầu ra dựng ra): aria-label ba nút điều khiển và duration lia khung (r1)**
  Người dùng thấy gì: Bài kiểm tra chưa chứng minh ba nút thu phóng có nhãn đọc được và chuyển động đã tắt thật khi người dùng chọn giảm chuyển động; nếu hỏng, người dùng đọc màn hình hoặc nhạy chuyển động sẽ gặp trước.
  file: `apps/app/test/okr-so-do-don-vi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo hằng cấu hình thay vì đầu ra): «chú giải có ba dòng» đo CHU_GIAI_SO_DO.length (r1)**
  Người dùng thấy gì: Bài kiểm tra chỉ đếm danh sách chú giải chứ không đếm chú giải hiện trên màn, nên nếu chú giải bị mất khỏi sơ đồ thì bài kiểm vẫn xanh.
  file: `apps/app/test/okr-so-do-don-vi.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc, không round-trip): mọi bài DOM ăn dauVaoThuan(), một bản chiếu tay của bộ gieo CSDL (r1)**
  Người dùng thấy gì: Các bài kiểm tra giao diện dùng dữ liệu dựng tay chứ không phải dữ liệu thật từ máy chủ, nên nếu hình dạng dữ liệu thật đổi, sơ đồ có thể sai trên màn mà bài kiểm vẫn xanh.
  file: `apps/api/scripts/okr-mau/ca-so-do.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (chép tay thay vì rút từ nguồn khai): danh sách phụ thuộc được phép của package.json gán cứng trong ranh-gioi.mjs (r1)**
  Người dùng thấy gì: Nếu chủ kho đổi danh sách gói được phép thêm thì phép kiểm ranh giới sẽ không tự theo, có thể cho phép hoặc chặn nhầm một gói; người dùng không thấy tác động trực tiếp.
  file: `_acceptance/so-do-can-chinh-don-vi/rang/ranh-gioi.mjs`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 2/14 lỗi rơi vào file không bộ đo nào phủ (apps/api/scripts/okr-mau/ca-so-do.ts, _acceptance/so-do-can-chinh-don-vi/rang/giu-ho-so.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
