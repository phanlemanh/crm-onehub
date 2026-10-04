# Review findings: khung-okr-truoc-r1 (round 1)

## Trong hợp đồng

- **Phép đo dạng «mo-duoc» không kiểm dữ liệu nút soạn đã về, nên trạng thái kẹt đang tải vẫn in «thanh ok»**
  file: `_acceptance/khung-okr-truoc-r1/rang/man-khung.mjs:216`
  severity: low
  AC: AC-2
  source: bugs
  detail: doMotDang('mo-duoc', {}) không có chuPhu, nên sau khi trả request chỉ so tops, cao, dsTop và cuoiLaNhom của truoc với sau. Không có khẳng định nào cho thấy nhóm soạn đã rời dạng đang tải (sau.nutKhoa === false, hoặc data-nut-soan khác 'dang-tai'). Thêm vào đó, waitForSelector ở dòng 148 nuốt timeout bằng .catch(() => {}). Nếu soanSanSang lỗi hay không bao giờ trả (đúng lỗi ở nut-soan.tsx:222), ảnh 'sau' giống hệt 'truoc' và phép đo vẫn in «thanh ok mo-duoc». AC-2 hứa đo cả «sau khi dữ liệu nút soạn về», nhưng ở dạng này phép đo không chứng minh được dữ liệu đã về.

- **Hình dạng 3 — E9 chỉ kiểm tiền tố chữ «lẽ ra», không kiểm số kỳ vọng mà AC-8 hứa**
  file: `_acceptance/khung-okr-truoc-r1/rang/man-khung.mjs:293`
  severity: medium
  AC: AC-8
  source: measurement
  detail: `tienDo.includes(leRa.split("{n}")[0].trim())`: `okrMessages('vi').sheet.leRa` là "lẽ ra {n}%", nên phép đo chỉ tìm chuỗi "lẽ ra". AC-8 và expected của E9 hứa một quan hệ giữa hai giá trị: innerText ô Tiến độ phải chứa leRa điền đúng số `expected` của seed (ví dụ «lẽ ra 40%»). Phép đo không đọc `expected` của Mục tiêu trong DB và không điền nó vào khuôn, nên số kỳ vọng sai, thiếu hay bị cắt mất vẫn in 'o so ok'. Đây là assert «chuỗi có mặt» thay cho quan hệ giữa các giá trị.

- **Hình dạng 4 — E8 thoả thuận: «tên đứng yên» chỉ là phép âm, không có đối chứng dương rằng thân tab đã cuộn**
  file: `_acceptance/khung-okr-truoc-r1/rang/man-khung.mjs:337`
  severity: medium
  AC: AC-7
  source: measurement
  detail: Dòng 330–337: lăn con lăn 200 px trên tabpanel đang mở rồi chỉ kiểm `|dd2.tenTop − dd.tenTop| ≤ 1`. AC-7 hứa với khung thoả thuận «đầu khung đứng yên, chỉ thân tab cuộn». Không có phép nào đo scrollTop của vùng cuộn thân tab (hay vị trí nội dung tab) trước và sau khi lăn. Vậy nếu con lăn không cuộn được gì (nội dung ngắn hơn khung, chuột rơi ngoài vùng cuộn, hoặc cả thân tab bị khoá), tên vẫn đứng yên và phép đo vẫn xanh. Đây là phép âm đứng một mình, không có đối chứng dương rằng việc cuộn đã xảy ra.

- **Hình dạng 4 — E18/E15 ba vai không quản trị: «không có nhóm soạn» xanh cả khi trang không vẽ**
  file: `_acceptance/khung-okr-truoc-r1/rang/bon-vai.mjs:89`
  severity: medium
  AC: AC-4
  source: measurement
  detail: Dòng 70: `p.waitForSelector("[data-hang-nut], [data-trang-thai]").catch(() => null)` nuốt lỗi hết giờ chờ. Dòng 89: với trưởng phòng, nhân viên và chỉ OKR, kết luận chỉ là `!d.coNhom && !d.coCau`. Không có phép nào khẳng định trang Theo đơn vị đã vẽ (có [data-hang-nut]) cho từng vai đó. Trang lỗi, trang chuyển hướng hay trang trắng đều không có [data-nhom-soan] và không có câu «chưa được bật», nên vẫn in 'vai soan ok <vai>'. Đối chứng dương chỉ có ở vai quản trị. Chiều đỏ --kiem-do-vai thì `if (!h) return;`, nên cũng chỉ chứng minh thanh nút có mặt cho trưởng phòng ở lượt đỏ.

- **Hình dạng 4 — E14 so sánh người xem «như trước» có thể là undefined === undefined**
  file: `apps/app/test/khung-okr-truoc-r1.dom.tsx:816`
  severity: medium
  AC: AC-12
  source: measurement
  detail: Dòng 795 lấy `truoc = q("[data-nguoi-xem]")?.textContent`, dòng 816 kiểm `expect(q("[data-nguoi-xem]")?.textContent).toBe(truoc)`. `[data-nguoi-xem]` chỉ được vẽ khi `nguoiXem.length > 0` (objective-hien-thi.tsx:217), và bài không hề khẳng định `truoc` chứa HUNG.name, tức là chưa khẳng định bước thêm người xem trong choTuChoi đã thật sự thêm được người. Nếu bước thêm không có tác dụng (Lưu vẫn bật nhờ đổi radio), cả hai vế đều là undefined và phép đo xanh. Vế «người xem như trước» của AC-12 vì thế không được kiểm: không có đối chứng dương.

- **Hình dạng 5 — E4: «N/3 cuộc mở danh sách» nằm sau if (ds), không ghim số ca phải bấm**
  file: `apps/app/test/khung-okr-truoc-r1.dom.tsx:516`
  severity: medium
  AC: AC-3
  source: measurement
  detail: Dòng 515–519: `const ds = qa("[data-thong-tin-soan] [data-nut=ds-cuoc]")[0]; if (ds) { ...expect(url dsCuoc).toBe("1") }`. Expected của E4 hứa bấm «N/3 cuộc» trong popover thì mở danh sách cuộc. Bốn trong sáu dạng (nut-tiep, nut-an, mo-co-cuoc, nut-het-cuoc) phải có nút này, nhưng bài không có ma trận viết trước và không đếm số lần bấm (không có kiểm kiểu soCaDs === 4). Nếu nút bị đổi thành chữ thường, hoặc mất `data-nut=ds-cuoc`, nhánh bấm bị bỏ qua mà không ai biết. Kiểm chữ chỉ thấy chữ có mặt, không thấy hành vi mở danh sách. Số lần kiểm không bằng số phần tử của lớp.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Lỗi của truy vấn soanSanSang bị nuốt: nhóm soạn kẹt mãi ở nút khoá «đang tải»**
  Người dùng thấy gì: Nếu máy chủ hoặc mạng trục trặc đúng lúc mở trang Theo đơn vị, quản trị sẽ thấy nút Soạn bị khoá mãi như đang tải, không có thông báo lỗi và không có cách thử lại cho tới khi tải lại trang.
  file: `apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx`
  severity: medium
  Đề xuất: known-limits

- **DetailSheetHeader đi vòng qua responsive-sheet: tự gọi useIsMobile và nhập thẳng DrawerHeader**
  Người dùng thấy gì: Người dùng không thấy gì khác trên màn hình; chỉ là việc chọn giữa ngăn kéo và khung bên được quyết định ở hai chỗ, nên sau này đổi một chỗ dễ quên chỗ kia.
  file: `apps/app/components/detail-sheet.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hai khoá thông điệp chết (tabVet, tienDoTu) được miễn trong messages-guard, trong khi các bài kiểm khác vẫn tìm tab bằng khoá chết**
  Người dùng thấy gì: Một vài bài kiểm tự động cũ tìm tab «Vết» bằng nhãn không còn hiện trên màn hình; chúng chỉ xanh vì bản tiếng Việt trùng chữ, nên khi chạy bằng tiếng Anh chúng sẽ không thấy tab. Người dùng không bị ảnh hưởng.
  file: `apps/app/test/messages-guard.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Cờ sangCanChinh còn bật sau khi người huỷ hộp hỏi lại; đóng bằng nút X về sau lại nhảy sang tab Căn chỉnh**
  Người dùng thấy gì: Trong một chuỗi thao tác hiếm (bấm Mở tab Căn chỉnh, chọn tiếp tục sửa, rồi đóng hộp bằng nút X và xác nhận bỏ), người chỉ muốn đóng hộp lại bị chuyển sang tab Căn chỉnh.
  file: `apps/app/components/crm/record-sheet/objective-hien-thi.tsx`
  severity: medium
  Đề xuất: known-limits

- **soanSanSang lỗi (retry: false) thì nút soạn kẹt ở dạng «đang tải» khoá mãi, lỗi bị nuốt**
  Người dùng thấy gì: Khi tải dữ liệu nút soạn lỗi, quản trị chỉ thấy nút Soạn khoá mãi không có giải thích. Ở một số trạng thái, nút khoá hiện thoáng lúc đang tải rồi biến mất khi dữ liệu về.
  file: `apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 — bài DOM của Badge và DrawerHeader kiểm chuỗi lớp Tailwind thay cho kiểu tính ra**
  Người dùng thấy gì: Một bài kiểm tự động phụ chỉ so tên lớp trang trí chứ không đo kết quả hiển thị thật; kết quả hiển thị đã có phép đo khác trong trình duyệt kiểm tra, nên người dùng không bị ảnh hưởng.
  file: `packages/ui/test/khung-okr-badge-drawer.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 — E14 dựng tay lỗi máy chủ đúng khuôn mà bên đọc chờ ({data:{code:"BAD_REQUEST"}})**
  Người dùng thấy gì: Nếu sau này cách máy chủ báo lỗi từ chối đổi đi, nút «Mở tab Căn chỉnh» có thể không hiện trên ứng dụng thật mà bài kiểm tự động vẫn báo xanh.
  file: `apps/app/test/khung-okr-truoc-r1.dom.tsx`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/13 lỗi rơi vào file không bộ đo nào phủ (apps/app/test/messages-guard.spec.ts, packages/ui/test/khung-okr-badge-drawer.dom.tsx) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
