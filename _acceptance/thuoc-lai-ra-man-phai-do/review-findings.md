## Trong hợp đồng

- **When a component fails to render, phanNhom reports it as BO-VE-CHET (drawer died) and never classifies it**
  file: `_acceptance/chan-lai-component-ra-man/rang/lai-ra-man.mjs:80`
  severity: medium
  source: conventions
  AC: AC-2
  This diff adds a DEM-DU `expect` to the spec test "lai tung component ra man" (packages/ui/test/lai-ra-man.spec.tsx:280-285). Any component outside khai-khong-ve-duoc.json that fails to render now makes that test fail, and bun exits 1. It exits 1 even though ve-that.json was already written. chayBanVe (lines 61-73) treats every non-zero exit as a dead drawer: it prints `BO-VE-CHET: buoc ve thoat 1, khong cham tiep`, and phanNhom returns at line 80 before it classifies anything. As a result, the khong_ve_duoc bucket (AC-2) can never be reached for a component that actually breaks — only files already in khai reach it. The label says the drawer crashed (AC-3's meaning), but what actually happened is a DEM-DU assertion failure (AC-4); a syntax error in the spec and a single broken component produce the same message and exit code. phan-biet-hai-chieu.mjs:59-62 then turns any BO-VE-CHET into KhongDoDuoc (exit 2, "cannot measure"), so a real product regression becomes "cannot measure" instead of red — breaking the repo's 1=DO / 2=KHONG DO DUOC convention. Suggested fix: check whether ve-that.json exists, or whether the output contains DEM-DU, before labelling it BO-VE-CHET; or move the DEM-DU assertion out of the test that phanNhom invokes.

- **A file counts as drawn when any one export draws, so defaults owned by exports that crash are filed as technical without ever being drawn**
  file: `_acceptance/chan-lai-component-ra-man/rang/lai-ra-man.mjs:96`
  severity: high
  source: bugs
  AC: AC-4
  The checks work per file, not per export. In phanNhom, `tron = ban.filter(clean)` with `if (tron.length === 0)` puts a default into khong_ve_duoc only when no export in the file draws cleanly. The spec's DEM-DU count uses the same test (`packages/ui/test/lai-ra-man.spec.tsx:270-272`, `!b.some(clean)`). The contract removed the "at least one component draws" check at the list level; this code brings the same "at least one" back at the file level. `bun test -t "lai tung component ra man"` passes at HEAD with 47 files. questionnaire.tsx has 2 clean exports while QuestionnairePrevious, Skip, Next and Submit all crash in both states ("must be used within a Questionnaire.Item"). Those four own all 8 of the file's defaults (lines 202-278). Because the file counts as drawn, phanNhom looks for each default in text from the other exports, does not find it, and files all 8 under ky_thuat — they never reach khong_ve_duoc. The same happens in message-scroller.tsx, select.tsx, tabs.tsx, toggle-group.tsx, carousel.tsx, chart.tsx, detail-sheet.tsx, simple-table.tsx and others: 47 defaults in total are owned by exports that crash. Today all of them are technical tokens so no wrong result shows, but if a reader-facing default were added to one of these components it would be filed as technical and DEM-DU would stay green — the silent failure AC-2 and AC-4 were meant to close. Fix: link each default to the export that owns it and check that export's own loi_dong/loi_mo, or treat a file as broken when any export crashes.

- **When the count check fails, phan-nhom reports a crashed drawing step and writes no grouping**
  file: `_acceptance/chan-lai-component-ra-man/rang/lai-ra-man.mjs:79`
  severity: low
  source: bugs
  AC: AC-2
  chayBanVe now runs the whole test "lai tung component ra man", and that test now ends with the DEM-DU check. Suppose a new component outside the declaration file fails to draw. The drawing finishes and writes ve-that.json, then the DEM-DU check makes `bun test` exit 1. chayBanVe prints "BO-VE-CHET: buoc ve thoat 1, khong cham tiep" and phanNhom returns before writing phan-nhom.json. AC-2's promise that the grading side puts the component in "khong ve duoc" and names it is only kept for components already in the declaration file; every real undeclared failure is reported as the drawing step dying instead. The same applies to cl_lai_ra_man and phan-biet-hai-chieu.mjs (which turns it into KHONG DO DUOC, exit 2). The DEM-DU text does appear in the last ~1200 characters of output so the failure is not silent, but the label is wrong. Fix: have phanNhom check whether ve-that.json was written, or run the drawing step without the count check, so "drawing crashed" and "count mismatch" are told apart.

- **Hình dạng 3 (kiểm «có mặt» trong khi lời hứa là QUAN HỆ): hai con số DEM-DU nằm ở cả hai vế của toBe**
  file: `packages/ui/test/lai-ra-man.spec.tsx:275`
  severity: medium
  source: measurement
  AC: AC-4
  `expect(dem + (ngoaiKhai.join(", ") || "khong")).toBe(\`${dem}khong\`)`: chuỗi `dem` chứa `ve duoc ${file.length - hong.length}/${file.length}` và nằm y hệt ở cả vế nhận lẫn vế mong đợi. Quan hệ giữa số vẽ được và N không bao giờ được so — thứ duy nhất được kiểm là `ngoaiKhai` rỗng (hong ⊆ khai). E4 hứa "Assert đo QUAN HỆ bằng-nhau giữa hai số", nhưng hai số chỉ để trang trí. Code cũng không kiểm chiều ngược lại: một mục trong khai-khong-ve-duoc.json nay đã vẽ được, hoặc file đã bị xoá, vẫn được miễn im lặng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **thuoc-phai-do.mjs writes its own sandbox copy instead of using dungCaySao/voiCaySao; process.exit inside try skips cleanup**
    Người dùng thấy gì: Nếu phiên đo bị ngắt hoặc lỗi giữa chừng, thư mục tạm có thể còn sót lại trên máy, và lần đo kế tiếp có thể vô tình chạm nhầm bản code cũ chưa commit.
    file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs`
    severity: medium
    Đề xuất: new-contract

- **Two parallel sources for 'not a component': KHONG_PHAI_COMPONENT in the spec and khai-khong-ve-duoc.json**
    Người dùng thấy gì: Nếu ai thêm một file không phải component mà quên cập nhật đủ cả hai nơi khai báo, phép đếm có thể báo sai mà không ai biết.
    file: `_acceptance/thuoc-lai-ra-man-phai-do/khai-khong-ve-duoc.json`
    severity: low
    Đề xuất: known-limits

- **khai-khong-ve-duoc.json is cast straight to Record<string,string> with no schema check**
    Người dùng thấy gì: Một dòng khai báo miễn trừ bị gõ sai tên hoặc để trống lý do vẫn được chấp nhận, có thể âm thầm bỏ sót một component thật sự hỏng.
    file: `packages/ui/test/lai-ra-man.spec.tsx`
    severity: low
    Đề xuất: known-limits

- **memo() and forwardRef() exports are skipped without any record, and the declaration for shimmer.tsx gives the wrong reason**
    Người dùng thấy gì: Một số component dùng kỹ thuật memo hoặc forwardRef không bao giờ thực sự được thử vẽ, nên nếu chúng hỏng, thước sẽ không bao giờ thấy để báo đỏ.
    file: `packages/ui/test/lai-ra-man.spec.tsx`
    severity: medium
    Đề xuất: new-contract

- **Hình dạng 4 (âm-tính-một-mình, không ghim thông điệp): chiều đỏ của QUA-CONG tự gắn nhãn cho mọi mã thoát khác 0**
    Người dùng thấy gì: Bằng chứng ký duyệt cho tiêu chí 'cổng bắt được component bị phá' có thể xanh giả — lệnh cổng thoát lỗi vì bất kỳ lý do gì cũng được tính là đã bắt đúng.
    file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs`
    severity: high
    Đề xuất: known-limits

- **Hình dạng 4 (âm-tính-một-mình, không ghim thông điệp): chiều đỏ MOT-NGUON không do component mà ca xoá gây ra**
    Người dùng thấy gì: Bằng chứng cho tiêu chí một nguồn danh sách có thể xanh giả — ca đo có thể đỏ vì lý do khác, không phải vì bước xoá component.
    file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs`
    severity: high
    Đề xuất: known-limits

- **Hình dạng 3 (kiểm «có mặt» trong khi lời hứa là QUAN HỆ): chiều xanh MOT-NGUON không so danh sách bên VẼ với docMacDinh()**
    Người dùng thấy gì: Bằng chứng cho tiêu chí một nguồn danh sách có thể xanh dù danh sách vẽ không thực sự khớp với danh sách quét kho.
    file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs`
    severity: high
    Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): thiếu ma trận 5 ô của E2, chiều đỏ HONG-MOT-CHIEU do file rỗng gây ra**
    Người dùng thấy gì: Bằng chứng cho tiêu chí phân loại lỗi một chiều có thể đỏ vì một lý do khác (file rỗng), không chứng minh được đúng trường hợp cần bắt.
    file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs`
    severity: high
    Đề xuất: known-limits

- **Hình dạng 2 (fixture VIẾT TAY theo khuôn bên đọc): danh sách trường SAN-KHUON gõ tay, không rút từ bên CHẤM**
    Người dùng thấy gì: Nếu định dạng dữ liệu bên trong đổi tên trường, bằng chứng vẫn có thể xanh dù phép so sánh không còn đúng.
    file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs`
    severity: medium
    Đề xuất: known-limits

- **Hình dạng 4 (âm-tính-một-mình, không ghim thông điệp): chiều đỏ DEM-DU không ghim tên component bị gỡ khỏi bản khai**
    Người dùng thấy gì: Bằng chứng cho tiêu chí đếm đủ có thể xanh mà không chắc thông điệp đỏ có nêu đúng tên component bị thiếu hay không.
    file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs`
    severity: medium
    Đề xuất: known-limits

- **Hình dạng 1 (đo CHỈ DẪN thay vì ĐẦU RA): ketCa chấp nhận dòng mã nguồn bị in lại làm thông điệp đã ghim**
    Người dùng thấy gì: Một số bằng chứng ký duyệt có thể xanh dù không có thông điệp thật nào được phát ra để chứng minh điều đó.
    file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs`
    severity: medium
    Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): KHONG-BAN-CAY chỉ chạy một test đã lọc, không chạy `bun run test`**
    Người dùng thấy gì: Bằng chứng cho tiêu chí 'không bẩn cây' chỉ được chứng minh trên một phần nhỏ lệnh kiểm, chưa chắc đúng cho toàn bộ lệnh mà tiêu chí đó nhắc tới.
    file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs`
    severity: medium
    Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
