# Review findings: doi-nhan-khu-muc-tieu (round 1)

## Trong hợp đồng

- **dnk-goc: the 'doi chung' test runs git show against a pinned commit with no guard for shallow checkouts, so it fails in CI**
  file: `apps/app/test/doi-nhan-khu-muc-tieu.spec.ts:44`
  severity: high
  AC: AC-7
  source: conventions
  detail: `nguonGoc` calls `execFileSync("git", ["-C", GOC_KHO, "show", `${MOC_GOC_DNK}:${tep}`])`, with MOC_GOC_DNK = "1fce5d49c" (set in apps/app/test/doi-nhan-khu-muc-tieu-luat.ts:11). The test "doi chung: cau van ca cong ty chi pham vi giu nguyen nhu goc" (line ~113-125, in describe dnk-goc) calls it with no check that the commit exists. This spec is a .spec.ts file in apps/app/test, so `bun test` picks it up through apps/app's `test` script. The `test` job in .github/workflows/ci.yml (matrix cell app-ui, `--filter=app`) uses `actions/checkout@v5` with no `fetch-depth`, which means depth 1. Commit 1fce5d49c is not in that clone, so git show exits non-zero, execFileSync throws, and the test goes red once the PR is marked ready. The repo already has a pattern for this case: apps/app/test/kara-mot-ten.spec.ts:143-163 runs `git rev-parse --verify --quiet ${MOC_GOC}^{commit}` first, and when it fails it prints `console.warn("... (checkout nong) — bo qua phan so goc")` and returns. apps/app/test/khung-man-chung.spec.ts:102/476 does the same thing (GHI_CHU_NONG). This new test does not follow that pattern. It only passes locally and under the dnk_goc executor because the worktree has full history. Fix: add the same rev-parse guard before calling nguonGoc, or pin the original values in the test instead of reading them from git.
  lý do vào hợp đồng: AC-7 đòi bộ kiểm của kho xanh; bài đối chứng đỏ trên checkout nông của CI thì bộ kiểm không xanh khi PR sẵn sàng.

- **E15 do-phu: phép đo hàng gốc luôn xanh vì đầu trang cũng hiện tên workspace trong translate="no"**
  file: `_acceptance/doi-nhan-khu-muc-tieu/rang/chup.mjs:214`
  severity: medium
  AC: AC-3
  source: bugs
  detail: Đoạn `hangGoc` quét `document.querySelectorAll('[translate="no"]')` trên cả trang và tìm phần tử có textContent === tenGoc. Nó không giới hạn trong `[data-khoi="do-phu"]`. AppHeader (apps/app/components/app-header.tsx:83) có mặt trên mọi trang dưới [slug]/layout.tsx và vẽ `<span translate="no">{workspaceLabel(workspace.data?.name)}</span>`. workspaceLabel trả nguyên tên đã trim, trừ khi tên là «crm». tenGoc ở đây lại đọc từ `organization.name` của cùng kho. Vì vậy dòng `E15 do-phu: hang goc mang dung «…» trong translate=no` vẫn DUNG ngay cả khi hàng gốc của bảng độ phủ hiện «Công ty», hiện «OneHub» do API trả về, hay không có tên. Vế AC-3 «hàng gốc bảng độ phủ mang tên workspace» do đó chưa được máy đo thật. Cách sửa: giới hạn selector vào `[data-khoi="do-phu"] [translate="no"]`, như ô chọn đơn vị đã giới hạn vào `[data-chon-don-vi]`.
  lý do vào hợp đồng: AC-3 hứa hàng gốc bảng độ phủ mang tên workspace trong translate=no; phép đo không phân biệt được với tên ở đầu trang nên vế này chưa được chứng.

- **Hình dạng 3 (assert chuỗi có mặt thay cho quan hệ): E15 kiểm «hàng gốc độ phủ mang tên» bằng cách tìm khắp trang, và đầu trang luôn có tên không gian làm việc**
  file: `_acceptance/doi-nhan-khu-muc-tieu/rang/chup.mjs:214`
  severity: high
  AC: AC-3
  source: measurement
  detail: Lời hứa là: hàng gốc của bảng độ phủ mang đúng tên workspace, đặt trong translate=no. Nhưng `hangGoc` dò `document.querySelectorAll('[translate="no"]')` trên toàn tài liệu, không giới hạn trong `[data-khoi="do-phu"]` hay hàng loai goc. Mà apps/app/components/app-header.tsx:83 hiện `workspaceLabel(workspace.data?.name)` trong `<span translate="no">` ở mọi trang app. Với tên thật của kho đo, workspaceLabel trả nguyên tên. Vì vậy dòng «E15 do-phu: hang goc mang dung …» luôn DUNG nhờ đầu trang, kể cả khi NhanHang của bảng độ phủ vẫn hiện «Công ty», «OneHub» hay rỗng. Bước waitForSelector `[data-khoi="do-phu"] [translate="no"]` ngay trước đó cũng không cứu: hàng phòng ban cũng là translate=no.
  lý do vào hợp đồng: cùng gốc với phát hiện trước; vế hàng gốc bảng độ phủ của AC-3 được đo bằng chuỗi có mặt khắp trang nên không chứng được.

- **Hình dạng 4 (không có đối chứng dương): ca dự phòng «tên rỗng» của E3 đọc DOM lúc truy vấn còn đang tải, không chứng được name '' đã được dùng**
  file: `apps/app/test/doi-nhan-khu-muc-tieu.dom.tsx:131`
  severity: high
  AC: AC-3
  source: measurement
  detail: useTenGoc trả `workspace.data?.name || duPhong || goc`, nên lúc workspace.get chưa về thì nó cũng trả «Công ty»/«Company». Bộ dựng `dung` tạo QueryClient mới, cache trống. Không tệp nào vá notifyManager, nên TanStack vẫn báo dữ liệu về qua setTimeout 0. Trong khi đó `cho` gọi `xong()` ngay ở vòng 0, trước mọi `nhip`. Hai chỗ bị ảnh hưởng: (1) dòng 131–133, ca ChonDonVi: `await choCo(r.o, "Công ty")` đạt ngay ở lượt dựng đầu, lúc đang tải. (2) dòng 107–117, ca BangDoPhu vi/en: `choCo(s.o, "Kinh doanh")` đạt ngay vì DO_PHU đi vào qua prop, rồi danh sách translate=no được đọc tức thì, cũng lúc đang tải. Không ca nào chờ hay ghim rằng workspace.get với name "" đã được tiêu thụ. Một hồi quy như đổi `||` thành `??` (tải xong thì hiện chuỗi rỗng) vẫn qua cả ba ca. Thiếu một mốc chờ dữ liệu đã về, chẳng hạn chờ một giá trị khác mà chỉ có sau khi tải.
  lý do vào hợp đồng: AC-3 hứa khi tên chưa có thì chữ dự phòng là «Công ty» / «Company»; bài không chứng được dữ liệu đã về nên vế này chưa được đo thật.

- **Hình dạng 3 (có mặt thay cho bằng nhau): đối chứng «phạm vi giữ» của E4 kiểm giá trị mới là chuỗi con của cả tệp cũ, không so với giá trị cũ của chính khoá đó**
  file: `apps/app/test/doi-nhan-khu-muc-tieu.spec.ts:122`
  severity: medium
  AC: AC-4
  source: measurement
  detail: E4 hứa: donViBang.caCongTy vi «cả công ty» và trong.quanTriMoTa vi bằng giá trị ở git show 1fce5d49c, tức là quan hệ bằng nhau tại cùng khoá. Bài lại viết `nguonGoc(tep).includes(v)`, nghĩa là giá trị hiện tại chỉ cần xuất hiện ở đâu đó trong cả tệp okr.ts cũ. Với caCongTy, tệp cũ chứa «cả công ty», «Cả công ty» (goc ở dòng 36) và «công ty» ở nhiều chỗ. Nếu khoá bị đổi sang «Cả công ty» hay «công ty», bài vẫn xanh. Cũng không có ghim đúng chữ «cả công ty» như expected nêu.
  lý do vào hợp đồng: AC-4 đòi câu văn «cả công ty» chỉ phạm vi giữ nguyên; đối chứng lỏng nên đổi sang «Cả công ty» hay «công ty» vẫn qua.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **bang-chu.mjs: khoá đọc hụt thành «(không đọc được)» mà lệnh vẫn thoát 0**
  Người dùng thấy gì: Bảng đối chiếu chữ cũ và mới dùng để người duyệt đọc có thể chứa một ô ghi «không đọc được» mà không báo lỗi. Màn hình người dùng không bị ảnh hưởng.
  Căn cứ: Chỉ làm tài liệu duyệt kém tin cậy một chút, không đổi chữ người dùng thấy, và người duyệt tự nhận ra ô lạ khi đọc.
  file: `_acceptance/doi-nhan-khu-muc-tieu/rang/bang-chu.mjs`
  severity: low
  Đề xuất: known-limits

- **chup.mjs: lệnh chép ảnh sang evidence không kiểm kết quả, vẫn ghi dòng ANH evidence/…**
  Người dùng thấy gì: Nếu việc chép ảnh chụp màn hình bị hỏng, ảnh của lượt trước có thể nằm lại làm bằng chứng mà không ai biết. Người dùng cuối không gặp gì.
  Căn cứ: Hiếm xảy ra, chỉ ảnh hưởng hồ sơ duyệt chứ không ảnh hưởng sản phẩm, và người duyệt nhìn ảnh là thấy chữ cũ.
  file: `_acceptance/doi-nhan-khu-muc-tieu/rang/chup.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 (tuyên quét lớp nhưng phép khớp rỗng): E8 (c) phủ mọi chỗ trúng trong okr.ts vì một cu.vi bắt đầu bằng 'X'**
  Người dùng thấy gì: Phép kiểm xem danh sách chữ cần đổi có đủ hay không bỏ sót được nhiều dòng trong một tệp chữ lớn. Chữ cũ còn sót trên màn vẫn bị một bài kiểm khác bắt.
  Căn cứ: Rủi ro chỉ là danh sách kê thiếu, còn chữ cũ lọt ra màn thì có lưới kiểm thứ hai chặn, nên hậu quả cho người dùng nhẹ.
  file: `_acceptance/doi-nhan-khu-muc-tieu/rang/kiem-ke.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên cả lớp nhưng chỉ chép tay một phần): CAM_VI của E15 phân biệt hoa thường và thiếu cụm so với CAM_VI của luật**
  Người dùng thấy gì: Phép quét chữ trên ảnh chụp màn hình bỏ sót vài cách viết của chữ cũ như «hỏi ý» viết thường. Chữ cũ trong kho chữ vẫn bị bài kiểm chính chặn.
  Căn cứ: Chỉ là lưới phụ trùng với bài kiểm chính nên chữ cũ khó lọt tới người dùng, và nếu có thì thấy ngay trên màn.
  file: `_acceptance/doi-nhan-khu-muc-tieu/rang/chup.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo mã nguồn thay vì đầu ra): thanh hành động khu (hanh-dong-khu.tsx) chỉ được kiểm bằng cách grep 'useTenGoc(' trong mã**
  Người dùng thấy gì: Câu giải thích vì sao nút thêm bị khoá chỉ được kiểm gián tiếp, nên nếu tên workspace ghép sai vào câu đó thì bài kiểm không thấy.
  Căn cứ: Chỉ ảnh hưởng một câu giải thích hiếm gặp, người dùng vẫn hiểu nút bị khoá, và lỗi này dễ sửa lại sau khi phát hiện.
  file: `apps/app/test/doi-nhan-khu-muc-tieu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
