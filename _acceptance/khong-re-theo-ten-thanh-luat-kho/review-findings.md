## Trong hợp đồng

- **Moving the check into oxlint quietly drops a file from the signed scan, and E17 does not check ignorePatterns**
  file: `_acceptance/giai-doan-thoa-thuan/rang/khong-re-theo-ten.mjs:105`
  severity: medium
  AC: AC-4
  source: conventions
  detail: The old E17 (at f46c0bbda) scanned every tracked .ts/.tsx/.mjs/.js file in the seven directories. It skipped only TRU (generated, giai-doan.ts, proto) and CHO_PHEP (GIAI_DOAN_GOC in allowlist.ts). Contract AC-2 lists the same exemptions. The new check runs through oxlint, which honours the `ignorePatterns` in .oxlintrc.json. Line 22 of that file already ignores `apps/app/lib/lo-trinh/doc-du-lieu.js`, which sits inside apps/app/lib. So that file is now outside both rules and outside E17, with no exemption declared anywhere.

  I measured it in a temporary tree (copy of .oxlintrc.json, symlinks to tools and node_modules). With `"CLOSED_WON"` added, apps/app/lib/khac.js and apps/api/src/dashboard/x.ts were both reported by onehub(khong-re-theo-ten-giai-doan). apps/app/lib/lo-trinh/doc-du-lieu.js was not reported. Output: `Found 0 warnings and 2 errors`.

  The bypass check `kiemDuongTat()` looks only at `overrides`, nested oxlintrc files and disable directives. It never reads `ignorePatterns`. `kiemMoi()` puts its seed file only at the root of each of the seven directories. As a result, adding a line like `"apps/api/src/dashboard/**"` to `ignorePatterns` switches off both repo rules for that area while E17 stays green. AC-4 promises that turning the rule off locally ('removing a directory from the config') gives KHONG DO DUOC with exit 2, but this path is not covered. chieu-do.mjs has no mutation for ignorePatterns either.

  Fix direction: kiemDuongTat should flag any `ignorePatterns` entry that falls inside THU_MUC and is not one of the declared exemptions (generated, giai-doan.ts, proto). Alternatively, declare doc-du-lieu.js as an exemption in the contract or evals and add a mutation for ignorePatterns.
  rationale: AC-4 hứa rằng luật bị tắt cục bộ, kể cả bỏ một thư mục khỏi cấu hình, thì E17 phải in KHONG DO DUOC mã 2; thêm glob vào ignorePatterns tắt cả hai luật ở một thư mục con mà E17 vẫn xanh.

- **E17 'soat duong tat' bo sot ignorePatterns va .eslintignore: them mot glob thu muc con la mien luat ma E17 van xanh**
  file: `_acceptance/giai-doan-thoa-thuan/rang/khong-re-theo-ten.mjs:105`
  severity: medium
  AC: AC-4
  source: bugs
  detail: kiemDuongTat chi soat ba loai: overrides tat luat, tep cau hinh oxlintrc long, va chi thi (oxlint|eslint)-disable. No khong soat .oxlintrc.json ignorePatterns, cung khong soat .eslintignore (oxlint 1.78 mac dinh doc tep nay qua --ignore-path). kiemMoi chi gieo moi-krtt.ts o goc moi thu muc trong THU_MUC, nen mot glob nham vao thu muc con thi khong bi bat. Da thu tren cay tam co ban sao .oxlintrc.json va apps/api/src/dashboard/d.ts chua "CLOSED_WON": (a) them "apps/api/src/dashboard/**" vao ignorePatterns, (b) them dong do vao tep .eslintignore. Ca hai lan oxlint --format=json deu khong bao d.ts, chi con bao tep o goc. Ran so tep (>=50) cung khong bat duoc vi kho co 1455 tep. Vay mot PR chi can mo rong ignorePatterns, hoac them .eslintignore, la vua mien luat kho vua de E17 thoat 0. Rieng .eslintignore con khong nam trong paths cua E17, nen thay doi do khong lam E17 chay lai. Ban cu tu loc bang danh sach TRU cua chinh no nen khong ho lo nay; ban moi giao viec loai tru cho cau hinh oxlint ma khong soat cau hinh do.
  rationale: Cùng lỗ hổng với mục trên: một thư mục trong bảy thư mục bị loại khỏi cấu hình lint bằng ignorePatterns mà E17 không báo KHONG DO DUOC như AC-4 hứa.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **ghim-xanh khong doi E17 co mat trong evals_exit; thieu evals_exit cung coi la dat**
  Người dùng thấy gì: Bước kiểm tra việc ghim hồ sơ có thể báo đạt dù thiếu kết quả của phép kiểm này, nên một hồ sơ ghim thiếu có thể lọt qua mà không ai thấy.
  file: `_acceptance/khong-re-theo-ten-thanh-luat-kho/rang/ghim-xanh.mjs`
  severity: low
  Đề xuất: known-limits

- **oxlint() khong kiem r.error/r.status: oxlint khong chay duoc thi bi xep ma 1 'HONG' thay vi ma 2 'KHONG DO DUOC'**
  Người dùng thấy gì: Khi công cụ kiểm tra mã không chạy được trên máy, kết quả bị báo như có vi phạm thay vì báo không đo được, nên người đọc có thể đi tìm lỗi sai chỗ.
  file: `_acceptance/giai-doan-thoa-thuan/rang/khong-re-theo-ten.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): AC-4 «E17 lấy kết luận từ chính luật kho» chỉ được đo bằng cách grep mã nguồn của script E17**
  Người dùng thấy gì: Phép kiểm xác nhận phép kiểm kia dùng đúng luật chung chỉ đọc chữ trong mã, nên nếu sau này có người đổi cách làm mà giữ nguyên chữ thì vẫn không bị phát hiện.
  file: `_acceptance/khong-re-theo-ten-thanh-luat-kho/rang/e17-qua-luat.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): bảng ma trận chỉ gieo GIAI_DOAN_GOC ở 1/7 thư mục, và các chỗ miễn chỉ thử với id cũ**
  Người dùng thấy gì: Bộ thử mới chỉ kiểm một phần các tổ hợp thư mục và từ cấm, nên một thư mục bị tắt luật riêng cho tên giai đoạn gốc có thể không bị phát hiện.
  file: `_acceptance/khong-re-theo-ten-thanh-luat-kho/rang/ma-tran-luat.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): ghim-xanh coi evals_exit thiếu E17 hay rỗng là xanh**
  Người dùng thấy gì: Bước kiểm tra việc ghim hồ sơ coi như đạt khi thiếu kết quả của phép kiểm này, nên có thể xác nhận nhầm một hồ sơ chưa đủ.
  file: `_acceptance/khong-re-theo-ten-thanh-luat-kho/rang/ghim-xanh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt trong khi lời hứa là quan hệ): ca chèn không ghim số dòng của dòng HONG**
  Người dùng thấy gì: Bộ thử không kiểm số dòng trong thông báo vi phạm, nên nếu thông báo chỉ sai dòng thì người sửa sẽ phải tự tìm lại chỗ đúng.
  file: `_acceptance/khong-re-theo-ten-thanh-luat-kho/rang/e17-qua-luat.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
