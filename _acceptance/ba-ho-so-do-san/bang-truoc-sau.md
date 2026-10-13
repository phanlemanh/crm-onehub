# Bảng trước/sau — ba-ho-so-do-san

Máy sinh bằng `rang/bang.mjs` từ `danh-sach.json`, mốc nền `3a2783409894908bc8dd1ee3893b88f990d1aebe`. Mỗi mục là một eval mà vòng này khai không chạy hoặc sửa răng.

## khoa-con-bat-xa-tran:E4 — khai-not-run

Lý do: kcb: tro-ly-okr-nen S4-r1 gan tran 60 giay cho 5 ca do quyen cua go-la-cat-quyen.spec.ts (go-la-cat-quyen het tran 5 giay duoi tai S4); loi hua AC-4 «khong ca nao mang tran rieng» bi quyet dinh da ky sau thay — chu kho chon (b) o Cong Pham vi F24 13/10 (P7-2)

Căn cứ: `_acceptance/tro-ly-okr-nen/decisions.jsonl:28`

Mục paths trong dòng: `apps/api/bunfig.toml`, `bunfig.toml`, `-`

Trước (mốc nền):
```
  - id: E4
    criterion: AC-4
    executor: script
    cmd: config:executors.script.kcb_khong_noi_tran
    paths:
      - "apps/api/test/go-la-cat-quyen.spec.ts"
      - "apps/api/test/setup.ts"
      - "apps/api/package.json"
      - "apps/api/bunfig.toml"
      - "bunfig.toml"
      - ".github/workflows/ci.yml"
      - ".github/workflows/acceptance.yml"
      - "_acceptance/khoa-con-bat-xa-tran/rang/soi-tep.mjs"
      - "_acceptance/khoa-con-bat-xa-tran/rang/chung.mjs"
    expected: |
      Doc tep (vang = khong cau hinh, in ra la vang). Ma tran viet truoc:
      - tep spec: dung 18 loi goi test( (quet ngoac can bang); moi loi goi dung hai doi so
        — 18 khang dinh, thong diep ghim ten ca;
      - tep spec + moi tep preload rut tu `--preload` cua script test (hien: apps/api/test/setup.ts):
        khong goi setDefaultTimeout; khong co --preload nao -> do (khong soat duoc);
      - apps/api/bunfig.toml, bunfig.toml: khong co khoa `timeout`;
      - moi script cua apps/api/package.json co `bun test`: khong `--timeout`;
      - MOI dong cua ci.yml va acceptance.yml (khong chi dong co `run:`): khong `--timeout`;
        ci.yml phai co >= 1 dong chay test (doi chung: bo soat nhin thay lenh CI); in so dong da doc.
      Tu kiem hai chieu, moi nhanh mot lan, tren cung ham soat, dot bien dung MOT tep:
      spec them `, 15_000` vao khoa-con-bat -> "test khoa-con-bat co tran rieng";
      script test them `--timeout 15000` -> "apps/api/package.json script test co --timeout";
      bunfig them `[test] timeout = 15000` -> "apps/api/bunfig.toml co khoa timeout";
      ci.yml them buoc `run: |` nhieu dong chua `bun test --timeout 15000` -> ".github/workflows/ci.yml co --timeout";
      setup.ts them setDefaultTimeout -> "apps/api/test/setup.ts goi setDefaultTimeout".
      Mot lan tu kiem khong bat -> script do, thuoc hong.
```

Sau (HEAD):
```
  - id: E4
    criterion: AC-4
    executor: script
    cmd: config:executors.script.kcb_khong_noi_tran
    paths:
      - "apps/api/test/go-la-cat-quyen.spec.ts"
      - "apps/api/test/setup.ts"
      - "apps/api/package.json"
      - "apps/api/bunfig.toml"
      - "bunfig.toml"
      - ".github/workflows/ci.yml"
      - ".github/workflows/acceptance.yml"
      - "_acceptance/khoa-con-bat-xa-tran/rang/soi-tep.mjs"
      - "_acceptance/khoa-con-bat-xa-tran/rang/chung.mjs"
    expected: |
      Doc tep (vang = khong cau hinh, in ra la vang). Ma tran viet truoc:
      - tep spec: dung 18 loi goi test( (quet ngoac can bang); moi loi goi dung hai doi so
        — 18 khang dinh, thong diep ghim ten ca;
      - tep spec + moi tep preload rut tu `--preload` cua script test (hien: apps/api/test/setup.ts):
        khong goi setDefaultTimeout; khong co --preload nao -> do (khong soat duoc);
      - apps/api/bunfig.toml, bunfig.toml: khong co khoa `timeout`;
      - moi script cua apps/api/package.json co `bun test`: khong `--timeout`;
      - MOI dong cua ci.yml va acceptance.yml (khong chi dong co `run:`): khong `--timeout`;
        ci.yml phai co >= 1 dong chay test (doi chung: bo soat nhin thay lenh CI); in so dong da doc.
      Tu kiem hai chieu, moi nhanh mot lan, tren cung ham soat, dot bien dung MOT tep:
      spec them `, 15_000` vao khoa-con-bat -> "test khoa-con-bat co tran rieng";
      script test them `--timeout 15000` -> "apps/api/package.json script test co --timeout";
      bunfig them `[test] timeout = 15000` -> "apps/api/bunfig.toml co khoa timeout";
      ci.yml them buoc `run: |` nhieu dong chua `bun test --timeout 15000` -> ".github/workflows/ci.yml co --timeout";
      setup.ts them setDefaultTimeout -> "apps/api/test/setup.ts goi setDefaultTimeout".
      Mot lan tu kiem khong bat -> script do, thuoc hong.
```

Căn cứ `_acceptance/tro-ly-okr-nen/decisions.jsonl:28`: ```
{"id":"d-20260927T112853Z-28","type":"fix","stage":"S4-r1","at":"2026-09-27T11:28:53Z","decision":"Vòng 1 REJECT vì bun run test đỏ (go-la-cat-quyen hết trần 5 giây dưới tải S4) và một phát hiện trong hợp đồng ở AC-1. Sửa: E1 viết lại thành bảng kỳ vọng viết tay 10 ô có nghĩa cộng bảng NGOAI có lý do cho 65 ô, mọi tổ hợp phải nằm trong một bảng; năm bài dò ma trận thủ tục trong go-la-cat-quyen mang trần 60 giây. 22 phát hiện ngoài hợp đồng không sửa ở vòng này, chờ Cổng Bằng chứng.","impact":"Thước AC-1 không còn tự suy kỳ vọng từ chính logic sản phẩm; đổi lại bảng phải được sửa tay khi thêm mục đích phiên hay phiên con."}
```

Vật của mục `apps/api/bunfig.toml` ở HEAD: VẮNG

Căn cứ `_acceptance/tro-ly-okr-nen/decisions.jsonl:28`: ```
{"id":"d-20260927T112853Z-28","type":"fix","stage":"S4-r1","at":"2026-09-27T11:28:53Z","decision":"Vòng 1 REJECT vì bun run test đỏ (go-la-cat-quyen hết trần 5 giây dưới tải S4) và một phát hiện trong hợp đồng ở AC-1. Sửa: E1 viết lại thành bảng kỳ vọng viết tay 10 ô có nghĩa cộng bảng NGOAI có lý do cho 65 ô, mọi tổ hợp phải nằm trong một bảng; năm bài dò ma trận thủ tục trong go-la-cat-quyen mang trần 60 giây. 22 phát hiện ngoài hợp đồng không sửa ở vòng này, chờ Cổng Bằng chứng.","impact":"Thước AC-1 không còn tự suy kỳ vọng từ chính logic sản phẩm; đổi lại bảng phải được sửa tay khi thêm mục đích phiên hay phiên con."}
```

Vật của mục `bunfig.toml` ở HEAD: VẮNG

Căn cứ `_acceptance/tro-ly-okr-nen/decisions.jsonl:28`: ```
{"id":"d-20260927T112853Z-28","type":"fix","stage":"S4-r1","at":"2026-09-27T11:28:53Z","decision":"Vòng 1 REJECT vì bun run test đỏ (go-la-cat-quyen hết trần 5 giây dưới tải S4) và một phát hiện trong hợp đồng ở AC-1. Sửa: E1 viết lại thành bảng kỳ vọng viết tay 10 ô có nghĩa cộng bảng NGOAI có lý do cho 65 ô, mọi tổ hợp phải nằm trong một bảng; năm bài dò ma trận thủ tục trong go-la-cat-quyen mang trần 60 giây. 22 phát hiện ngoài hợp đồng không sửa ở vòng này, chờ Cổng Bằng chứng.","impact":"Thước AC-1 không còn tự suy kỳ vọng từ chính logic sản phẩm; đổi lại bảng phải được sửa tay khi thêm mục đích phiên hay phiên con."}
```

## khung-tao-okr-nhu-deal:E6 — khai-not-run

Lý do: expected do chinh cot gop y trong ngan (cot >= 360 px, cot cung hang form); cot gop y da go khi gop y Kara neo tai cho

Căn cứ: `081c9b7927a2b15d75f688e775713e737b4d94d3`

Trước (mốc nền):
```
  - id: E6
    criterion: AC-5
    executor: ui-check
    layer: ui-observed
    cmd: config:executors.script.kto_man_gop_y
    steps:
      - "Kịch bản lái màn của the-gop-y-okr (đã sửa bám ngăn), ảnh ghi vào evidence/gop-y của hồ sơ này"
      - "Phiên đo riêng có tác tử; bật góp ý cho một phòng; trưởng phòng nhờ góp ý (model thật)"
      - "1440, 1024, 1023, 390: ngăn Sửa mục tiêu rồi ngăn Sửa KR với cột mở"
    expected: "exit 0; the-gop-y-okr/rang/man-the-gop-y.mjs trên vỏ ngăn, cùng ngưỡng như lúc hồ sơ đó ký: ngăn mang data-size=assist khi cột mở, cột ≥ 360 px, câu mới ≥ 320 px, cột form ≥ form khi không có cột; 1440 và 1024 cột cùng hàng form (top chênh < 8 px); 1023 và 390 cột dưới form; scrollWidth == innerWidth mọi bước; sau mỗi cú bấm trong cột còn đúng một ngăn OKR ([data-hop-thoai-*]). Ảnh ở _acceptance/khung-tao-okr-nhu-deal/evidence/gop-y/. Thiếu khoá model → mã 2. Chiều đỏ ghim của script đó giữ nguyên (cột 292 px → 'cau moi hep' mã 1)."
    evidence_required: [run_id, exit_code, verifier, verified_at, output, screenshot]
    paths: ["packages/ui/src/components/sheet.tsx", "apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx", "apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx", "apps/app/app/(app)/[slug]/okr/hop-thoai-muc-tieu.tsx", "_acceptance/the-gop-y-okr/rang/man-the-gop-y.mjs"]
```

Sau (HEAD):
```
  - id: E6
    status: not-run
    criterion: AC-5
    executor: ui-check
    layer: ui-observed
    cmd: config:executors.script.kto_man_gop_y
    steps:
      - "Kịch bản lái màn của the-gop-y-okr (đã sửa bám ngăn), ảnh ghi vào evidence/gop-y của hồ sơ này"
      - "Phiên đo riêng có tác tử; bật góp ý cho một phòng; trưởng phòng nhờ góp ý (model thật)"
      - "1440, 1024, 1023, 390: ngăn Sửa mục tiêu rồi ngăn Sửa KR với cột mở"
    expected: "exit 0; the-gop-y-okr/rang/man-the-gop-y.mjs trên vỏ ngăn, cùng ngưỡng như lúc hồ sơ đó ký: ngăn mang data-size=assist khi cột mở, cột ≥ 360 px, câu mới ≥ 320 px, cột form ≥ form khi không có cột; 1440 và 1024 cột cùng hàng form (top chênh < 8 px); 1023 và 390 cột dưới form; scrollWidth == innerWidth mọi bước; sau mỗi cú bấm trong cột còn đúng một ngăn OKR ([data-hop-thoai-*]). Ảnh ở _acceptance/khung-tao-okr-nhu-deal/evidence/gop-y/. Thiếu khoá model → mã 2. Chiều đỏ ghim của script đó giữ nguyên (cột 292 px → 'cau moi hep' mã 1)."
    evidence_required: [run_id, exit_code, verifier, verified_at, output, screenshot]
```

Commit căn cứ: ```
081c9b792 2026-10-03 feat(gop-y-dung-cho): góp ý Kara neo tại chỗ trong khung chi tiết, chip và bộ lọc trên danh sách, hộp Sửa chỉ còn dòng dẫn

 apps/api/src/okr/danh-sach.ts                      |    7 +-
 apps/api/src/okr/okr-xem.contracts.ts              |    3 +-
 apps/api/src/okr/okr.contracts.ts                  |    1 +
 apps/api/src/okr/tro-ly.service.ts                 |    2 +
 apps/api/test/gop-y-dung-cho.spec.ts               |   47 +-
 apps/api/test/tro-ly-okr-de-xuat-quyen.spec.ts     |   16 +-
 apps/app/app/(app)/[slug]/okr/bang-vet.tsx         |    6 +-
 apps/app/app/(app)/[slug]/okr/chip-gop-y.tsx       |   39 +
 apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx        |  516 --------
 apps/app/app/(app)/[slug]/okr/cua-toi.tsx          |    8 +-
 apps/app/app/(app)/[slug]/okr/dong-dan-gop-y.tsx   |   58 +
 apps/app/app/(app)/[slug]/okr/gop-y-kara.ts        |  267 ++++
 apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx     |   47 +-
 .../app/(app)/[slug]/okr/hop-thoai-muc-tieu.tsx    |   46 +-
 apps/app/app/(app)/[slug]/okr/loc-okr.tsx          |   31 +-
 apps/app/app/(app)/[slug]/okr/nhom-kara.tsx        |  347 ++++++
 apps/app/app/(app)/[slug]/okr/okr-search-params.ts |   10 +
 apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx    |    3 +-
 apps/app/app/(app)/[slug]/okr/the-gop-y.tsx        |  133 --
 .../(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx   |   10 +-
 .../crm/record-sheet/objective-sheet.tsx           |   69 +-
 apps/app/lib/messages/okr-gop-y.ts                 |  187 ++-
 apps/app/lib/okr-chu-ky-nhan.ts                    |    6 +
```

Vật của mục `apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx` ở HEAD: VẮNG

## khung-tao-okr-nhu-deal:E24 — khai-not-run

Lý do: expected do tieu de cot va dau X dong cot cua cot gop y; cot da go

Căn cứ: `081c9b7927a2b15d75f688e775713e737b4d94d3`

Trước (mốc nền):
```
  - id: E24
    criterion: AC-14
    executor: ui-check
    layer: ui-observed
    cmd: config:executors.script.kto_man_dau_cot
    steps:
      - "Phiên đo riêng (tien-de, tên kho kto-e24); bật góp ý cho phòng; trưởng phòng mở ngăn Sửa mục tiêu và Sửa KR bằng URL"
      - "Bấm «Nhờ Trợ lý OKR góp ý» — cột mở ở trạng thái đang soạn; đo phần đầu cột ở 1440 và 390"
      - "Khi có thẻ (dòng góp ý đã có trong kho đo) đo lại; ảnh E24-<khổ>-<ngăn>.png"
    expected: "exit 0; rang/man-khung.mjs --chi dau-cot đo bằng getBoundingClientRect: left của chữ tiêu đề cột − left của dòng mô tả ngay dưới và của phần tử đầu (khung đang soạn hoặc thẻ) ≤ 1 px; right của dấu X đóng cột − right của phần tử đầu ≤ 1 px; font-size và font-weight tính toán của tiêu đề cột bằng của tiêu đề ngăn (sheet-title); font-size của dòng mô tả ≤ font-size tiêu đề cột; ở 1440 |tâm dọc hàng tiêu đề cột − tâm dọc nút đầu của form| ≤ 2 px; khoảng cách giữa hộp dấu X đóng cột và hộp dấu X đóng ngăn ≥ 8 px. In từng số, mỗi ngăn, mỗi khổ. Chiều đỏ ghim: trang giả có tiêu đề cột thụt 11 px (--kiem-do-do dau-cot) phải in 'dau cot lech trai: 11' và mã 1; trang giả tiêu đề cột 12 px cạnh tiêu đề ngăn 14 px phải in 'dau cot khac co chu' và mã 1."
    evidence_required: [run_id, exit_code, verifier, verified_at, output, screenshot]
    paths: ["packages/ui/src/components/sheet.tsx", "apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx", "apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx", "apps/app/app/(app)/[slug]/okr/hop-thoai-muc-tieu.tsx", "_acceptance/khung-tao-okr-nhu-deal/rang/man-khung.mjs"]
```

Sau (HEAD):
```
  - id: E24
    status: not-run
    criterion: AC-14
    executor: ui-check
    layer: ui-observed
    cmd: config:executors.script.kto_man_dau_cot
    steps:
      - "Phiên đo riêng (tien-de, tên kho kto-e24); bật góp ý cho phòng; trưởng phòng mở ngăn Sửa mục tiêu và Sửa KR bằng URL"
      - "Bấm «Nhờ Trợ lý OKR góp ý» — cột mở ở trạng thái đang soạn; đo phần đầu cột ở 1440 và 390"
      - "Khi có thẻ (dòng góp ý đã có trong kho đo) đo lại; ảnh E24-<khổ>-<ngăn>.png"
    expected: "exit 0; rang/man-khung.mjs --chi dau-cot đo bằng getBoundingClientRect: left của chữ tiêu đề cột − left của dòng mô tả ngay dưới và của phần tử đầu (khung đang soạn hoặc thẻ) ≤ 1 px; right của dấu X đóng cột − right của phần tử đầu ≤ 1 px; font-size và font-weight tính toán của tiêu đề cột bằng của tiêu đề ngăn (sheet-title); font-size của dòng mô tả ≤ font-size tiêu đề cột; ở 1440 |tâm dọc hàng tiêu đề cột − tâm dọc nút đầu của form| ≤ 2 px; khoảng cách giữa hộp dấu X đóng cột và hộp dấu X đóng ngăn ≥ 8 px. In từng số, mỗi ngăn, mỗi khổ. Chiều đỏ ghim: trang giả có tiêu đề cột thụt 11 px (--kiem-do-do dau-cot) phải in 'dau cot lech trai: 11' và mã 1; trang giả tiêu đề cột 12 px cạnh tiêu đề ngăn 14 px phải in 'dau cot khac co chu' và mã 1."
    evidence_required: [run_id, exit_code, verifier, verified_at, output, screenshot]
```

Commit căn cứ: ```
081c9b792 2026-10-03 feat(gop-y-dung-cho): góp ý Kara neo tại chỗ trong khung chi tiết, chip và bộ lọc trên danh sách, hộp Sửa chỉ còn dòng dẫn

 apps/api/src/okr/danh-sach.ts                      |    7 +-
 apps/api/src/okr/okr-xem.contracts.ts              |    3 +-
 apps/api/src/okr/okr.contracts.ts                  |    1 +
 apps/api/src/okr/tro-ly.service.ts                 |    2 +
 apps/api/test/gop-y-dung-cho.spec.ts               |   47 +-
 apps/api/test/tro-ly-okr-de-xuat-quyen.spec.ts     |   16 +-
 apps/app/app/(app)/[slug]/okr/bang-vet.tsx         |    6 +-
 apps/app/app/(app)/[slug]/okr/chip-gop-y.tsx       |   39 +
 apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx        |  516 --------
 apps/app/app/(app)/[slug]/okr/cua-toi.tsx          |    8 +-
 apps/app/app/(app)/[slug]/okr/dong-dan-gop-y.tsx   |   58 +
 apps/app/app/(app)/[slug]/okr/gop-y-kara.ts        |  267 ++++
 apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx     |   47 +-
 .../app/(app)/[slug]/okr/hop-thoai-muc-tieu.tsx    |   46 +-
 apps/app/app/(app)/[slug]/okr/loc-okr.tsx          |   31 +-
 apps/app/app/(app)/[slug]/okr/nhom-kara.tsx        |  347 ++++++
 apps/app/app/(app)/[slug]/okr/okr-search-params.ts |   10 +
 apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx    |    3 +-
 apps/app/app/(app)/[slug]/okr/the-gop-y.tsx        |  133 --
 .../(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx   |   10 +-
 .../crm/record-sheet/objective-sheet.tsx           |   69 +-
 apps/app/lib/messages/okr-gop-y.ts                 |  187 ++-
 apps/app/lib/okr-chu-ky-nhan.ts                    |    6 +
```

Vật của mục `apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx` ở HEAD: VẮNG

## soan-okr-song-lai:E12 — sua-rang

Lý do: lenh sol_san_thiet_ke chay design-gate nham man-soan.tsx, tep da go khi soan OKR thanh trang rieng — o do do sach sau moi lan chay (design-gate thoat 1 vi tep vang). Tro lenh sang khoa moi sol_san_thiet_ke_trang do cung loi hua tren cac tep ke nhiem (trang-soan, khung-soan) cung nut-soan, hoi-thoai-soan; paths doi theo. Khai not-run bi luat hai ve 2.12.0 chan vi bao cao da ky co ma thoat cho E12. Gioi han do 13/10: design-gate --mode static voi nguong mac dinh P0 tren tep .tsx khong chan duoc luat P0 nao (tuong phan, anh hong can che do DOM); chieu do duy nhat cua o la tep dich vang — dung ca da lam E12 do; bao viec phu cho 74 dong lenh cung kieu

Căn cứ: `574292047`

Trước (mốc nền):
```
  - id: E12
    criterion: AC-7
    executor: script
    cmd: config:executors.script.sol_san_thiet_ke
    expected: "exit 0; sàn thiết kế chế độ tĩnh trên nut-soan.tsx, man-soan.tsx, hoi-thoai-soan.tsx: không lỗi P0 nào (low-contrast, gray-on-color, text-overflow, broken-image, body-text-viewport-edge). Chiều đỏ ghim: bản sao nut-soan.tsx chèn một phần tử text-gray-400 trên bg-blue-600 → REJECT, mã 2, hit 'gray-on-color'."
    evidence_required: [run_id, exit_code, verifier, verified_at, output]
    paths: ["apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx", "apps/app/app/(app)/[slug]/okr/soan/man-soan.tsx", "apps/app/app/(app)/[slug]/okr/soan/hoi-thoai-soan.tsx"]
```

Sau (HEAD):
```
  - id: E12
    criterion: AC-7
    executor: script
    cmd: config:executors.script.sol_san_thiet_ke_trang
    expected: "exit 0; sàn thiết kế chế độ tĩnh trên nut-soan.tsx, man-soan.tsx, hoi-thoai-soan.tsx: không lỗi P0 nào (low-contrast, gray-on-color, text-overflow, broken-image, body-text-viewport-edge). Chiều đỏ ghim: bản sao nut-soan.tsx chèn một phần tử text-gray-400 trên bg-blue-600 → REJECT, mã 2, hit 'gray-on-color'."
    evidence_required: [run_id, exit_code, verifier, verified_at, output]
    paths: ["apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx", "apps/app/app/(app)/[slug]/okr/soan/trang-soan.tsx", "apps/app/app/(app)/[slug]/okr/soan/khung-soan.tsx", "apps/app/app/(app)/[slug]/okr/soan/hoi-thoai-soan.tsx"]
```

Diff `_acceptance/soan-okr-song-lai/evals.yaml`:
```
diff --git a/_acceptance/soan-okr-song-lai/evals.yaml b/_acceptance/soan-okr-song-lai/evals.yaml
index 753c69ab0..deacb1e87 100644
--- a/_acceptance/soan-okr-song-lai/evals.yaml
+++ b/_acceptance/soan-okr-song-lai/evals.yaml
@@ -23,7 +23,7 @@ evals:
     cmd: config:executors.test.sol_man_dom
     expected: "exit 0; bài DOM dựng ManSoan với cauNoi=false và một cuộc dang soLuot=0: có tiêu đề màn soạn và mô tả đơn vị · kỳ; [data-slot='empty'] chứa câu nut.chuaCauHinh; không textarea, không [data-slot='suggestion'], không bản nháp; fetch giả bắt mọi URL — không URL nào chứa /eve/agents/okr; hook phiên (useEveAgent) không được gọi. Đối chứng dương: cùng fixture với cauNoi=true thì có ô soạn và có request tới /eve/agents/okr. Chiều đỏ ghim: bản sao vẫn dựng hội thoại khi chưa cấu hình → 'man mo phien khi chua cau hinh'."
     evidence_required: [run_id, exit_code, verifier, verified_at, output]
-    paths: ["apps/app/app/(app)/[slug]/okr/soan/man-soan.tsx", "apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx", apps/app/test/soan-okr-song-lai.dom.tsx]
+    paths: ["apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx", apps/app/test/soan-okr-song-lai.dom.tsx]
 
   - id: E4
     criterion: AC-3
@@ -103,10 +103,10 @@ evals:
   - id: E12
     criterion: AC-7
     executor: script
-    cmd: config:executors.script.sol_san_thiet_ke
+    cmd: config:executors.script.sol_san_thiet_ke_trang
     expected: "exit 0; sàn thiết kế chế độ tĩnh trên nut-soan.tsx, man-soan.tsx, hoi-thoai-soan.tsx: không lỗi P0 nào (low-contrast, gray-on-color, text-overflow, broken-image, body-text-viewport-edge). Chiều đỏ ghim: bản sao nut-soan.tsx chèn một phần tử text-gray-400 trên bg-blue-600 → REJECT, mã 2, hit 'gray-on-color'."
     evidence_required: [run_id, exit_code, verifier, verified_at, output]
-    paths: ["apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx", "apps/app/app/(app)/[slug]/okr/soan/man-soan.tsx", "apps/app/app/(app)/[slug]/okr/soan/hoi-thoai-soan.tsx"]
+    paths: ["apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx", "apps/app/app/(app)/[slug]/okr/soan/trang-soan.tsx", "apps/app/app/(app)/[slug]/okr/soan/khung-soan.tsx", "apps/app/app/(app)/[slug]/okr/soan/hoi-thoai-soan.tsx"]
 
   - id: E13
     criterion: AC-2
```

Đột biến khai:
```
[
  {
    "ten": "tep-dich-vang",
    "kieu": "design-gate",
    "tep": "apps/app/app/(app)/[slug]/okr/soan/trang-soan.tsx",
    "xoa_tep": true,
    "thong_diep": "design-gate do khi tep dich vang (ca da lam E12 do sau 574292047)"
  }
]
```

Đầu ra chieu-do.mjs cho dòng này:
```
soan-okr-song-lai:E12 tep-dich-vang: that dat, dot bien bat — design-gate do khi tep dich vang (ca da lam E12 do sau 574292047)
```

## the-gop-y-okr:E1 — khai-not-run

Lý do: expected do cot gop y trong hop Sua muc tieu/Sua KR (cot >= 360 px); cot da go

Căn cứ: `081c9b7927a2b15d75f688e775713e737b4d94d3`

Trước (mốc nền):
```
  - id: E1
    criterion: AC-1
    executor: ui-check
    layer: ui-observed
    cmd: config:executors.script.tgy_man_that
    steps:
      - "Cảnh cây (canh-cay.mjs) trước màn đầu tiên; lệch cây → mã 2"
      - "Phiên đo riêng có tác tử (tien-de); nạp bộ OKR mẫu; bật góp ý cho phòng kd-bac qua okr.setProgram; đăng nhập dev:session trưởng phòng"
      - "1440 px: mở hộp Sửa KR «Gọi điện cho đối tác mới mỗi tuần», đo bề ngang form khi chưa có cột, đóng"
      - "1440 px: mở hộp Sửa mục tiêu, đo form, bấm «Nhờ Trợ lý OKR góp ý» (model thật), chờ thẻ viết lại → đo data-size, cột, câu mới, form, tràn ngang; ảnh E1-1440-muc-tieu"
      - "1440 px: mở lại hộp Sửa KR, cột mở với thẻ của KR (hoặc nhờ góp ý) → đo như trên; ảnh E1-1440-kr"
    expected: "exit 0; rang/man-the-gop-y.mjs trong phiên đo riêng mở hộp Sửa mục tiêu rồi hộp Sửa KR, mỗi hộp có đề xuất, ở 1440 px, đo bằng getBoundingClientRect trong trình duyệt thật cho từng hộp: hộp mang data-size=assist, cột góp ý ≥ 360 px, khối câu mới của thẻ viết lại ≥ 320 px, cột form ≥ bề ngang cột form khi không có cột (đo cùng lượt, cùng hộp trước khi bấm góp ý), document.documentElement.scrollWidth == innerWidth. In từng số. Chiều đỏ ghim trong script: cùng phép đo chạy trên một bản dựng cố ý đặt cột 292 px (tham số --kiem-do-do) phải in 'cau moi hep: <px> < 320' và mã 1; hộp KR để cỡ wide phải in 'cau moi hep (kr)' và mã 1."
    evidence_required: [run_id, exit_code, verifier, verified_at, output, screenshot]
    paths: ["packages/ui/src/components/dialog.tsx", "packages/ui/src/components/proposed-change.tsx", "packages/ui/src/components/ai-elements/confirmation.tsx", "apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx", "apps/app/app/(app)/[slug]/okr/hop-thoai-muc-tieu.tsx", "apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx", "_acceptance/the-gop-y-okr/rang/man-the-gop-y.mjs"]
```

Sau (HEAD):
```
  - id: E1
    status: not-run
    criterion: AC-1
    executor: ui-check
    layer: ui-observed
    cmd: config:executors.script.tgy_man_that
    steps:
      - "Cảnh cây (canh-cay.mjs) trước màn đầu tiên; lệch cây → mã 2"
      - "Phiên đo riêng có tác tử (tien-de); nạp bộ OKR mẫu; bật góp ý cho phòng kd-bac qua okr.setProgram; đăng nhập dev:session trưởng phòng"
      - "1440 px: mở hộp Sửa KR «Gọi điện cho đối tác mới mỗi tuần», đo bề ngang form khi chưa có cột, đóng"
      - "1440 px: mở hộp Sửa mục tiêu, đo form, bấm «Nhờ Trợ lý OKR góp ý» (model thật), chờ thẻ viết lại → đo data-size, cột, câu mới, form, tràn ngang; ảnh E1-1440-muc-tieu"
      - "1440 px: mở lại hộp Sửa KR, cột mở với thẻ của KR (hoặc nhờ góp ý) → đo như trên; ảnh E1-1440-kr"
    expected: "exit 0; rang/man-the-gop-y.mjs trong phiên đo riêng mở hộp Sửa mục tiêu rồi hộp Sửa KR, mỗi hộp có đề xuất, ở 1440 px, đo bằng getBoundingClientRect trong trình duyệt thật cho từng hộp: hộp mang data-size=assist, cột góp ý ≥ 360 px, khối câu mới của thẻ viết lại ≥ 320 px, cột form ≥ bề ngang cột form khi không có cột (đo cùng lượt, cùng hộp trước khi bấm góp ý), document.documentElement.scrollWidth == innerWidth. In từng số. Chiều đỏ ghim trong script: cùng phép đo chạy trên một bản dựng cố ý đặt cột 292 px (tham số --kiem-do-do) phải in 'cau moi hep: <px> < 320' và mã 1; hộp KR để cỡ wide phải in 'cau moi hep (kr)' và mã 1."
    evidence_required: [run_id, exit_code, verifier, verified_at, output, screenshot]
```

Commit căn cứ: ```
081c9b792 2026-10-03 feat(gop-y-dung-cho): góp ý Kara neo tại chỗ trong khung chi tiết, chip và bộ lọc trên danh sách, hộp Sửa chỉ còn dòng dẫn

 apps/api/src/okr/danh-sach.ts                      |    7 +-
 apps/api/src/okr/okr-xem.contracts.ts              |    3 +-
 apps/api/src/okr/okr.contracts.ts                  |    1 +
 apps/api/src/okr/tro-ly.service.ts                 |    2 +
 apps/api/test/gop-y-dung-cho.spec.ts               |   47 +-
 apps/api/test/tro-ly-okr-de-xuat-quyen.spec.ts     |   16 +-
 apps/app/app/(app)/[slug]/okr/bang-vet.tsx         |    6 +-
 apps/app/app/(app)/[slug]/okr/chip-gop-y.tsx       |   39 +
 apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx        |  516 --------
 apps/app/app/(app)/[slug]/okr/cua-toi.tsx          |    8 +-
 apps/app/app/(app)/[slug]/okr/dong-dan-gop-y.tsx   |   58 +
 apps/app/app/(app)/[slug]/okr/gop-y-kara.ts        |  267 ++++
 apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx     |   47 +-
 .../app/(app)/[slug]/okr/hop-thoai-muc-tieu.tsx    |   46 +-
 apps/app/app/(app)/[slug]/okr/loc-okr.tsx          |   31 +-
 apps/app/app/(app)/[slug]/okr/nhom-kara.tsx        |  347 ++++++
 apps/app/app/(app)/[slug]/okr/okr-search-params.ts |   10 +
 apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx    |    3 +-
 apps/app/app/(app)/[slug]/okr/the-gop-y.tsx        |  133 --
 .../(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx   |   10 +-
 .../crm/record-sheet/objective-sheet.tsx           |   69 +-
 apps/app/lib/messages/okr-gop-y.ts                 |  187 ++-
 apps/app/lib/okr-chu-ky-nhan.ts                    |    6 +
```

Vật của mục `apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx` ở HEAD: VẮNG

## the-gop-y-okr:E11 — khai-not-run

Lý do: expected do cot gop y o 390/1024/1440 (cot duoi form, cung hang); cot da go

Căn cứ: `081c9b7927a2b15d75f688e775713e737b4d94d3`

Trước (mốc nền):
```
  - id: E11
    criterion: AC-11
    executor: ui-check
    layer: ui-observed
    cmd: config:executors.script.tgy_man_that
    steps:
      - "Cùng phiên và dữ liệu của E1 (dòng chờ còn trong kho đo)"
      - "Ở 390, 1023, 1024, 1440 px: mở hộp Sửa mục tiêu rồi hộp Sửa KR, cột tự mở với thẻ chờ"
      - "390 và 1023: đo top cột so với bottom form, bề ngang từng thẻ so với cột; 1024 và 1440: đo lệch top cột và form"
      - "Mọi khổ: scrollWidth so innerWidth; ảnh E11-<khổ>-muc-tieu và E11-<khổ>-kr"
    expected: "exit 0; cùng script E1 ở khung 390 px, cho hộp Sửa mục tiêu và hộp Sửa KR: khối cột góp ý nằm dưới khối form (top cột ≥ bottom form), mỗi thẻ rộng bằng cột trừ lề, scrollWidth == innerWidth ở mọi bước; ở 1440 px và 1024 px cột và form cùng hàng (top chênh < 8 px); ca biên ngay dưới mốc: ở 1023 px cột KHÔNG cùng hàng với form (top cột ≥ bottom form). Ảnh evidence/E11-*.png từng bước. Chiều đỏ ghim: phép đo tràn ngang chạy trên trang có một phần tử cố ý rộng 500 px (--kiem-do-do) phải in 'tran ngang' và mã 1."
    evidence_required: [run_id, exit_code, verifier, verified_at, output, screenshot]
    paths: ["packages/ui/src/components/dialog.tsx", "packages/ui/src/components/proposed-change.tsx", "apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx", "apps/app/app/(app)/[slug]/okr/hop-thoai-muc-tieu.tsx", "apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx", "_acceptance/the-gop-y-okr/rang/man-the-gop-y.mjs"]
```

Sau (HEAD):
```
  - id: E11
    status: not-run
    criterion: AC-11
    executor: ui-check
    layer: ui-observed
    cmd: config:executors.script.tgy_man_that
    steps:
      - "Cùng phiên và dữ liệu của E1 (dòng chờ còn trong kho đo)"
      - "Ở 390, 1023, 1024, 1440 px: mở hộp Sửa mục tiêu rồi hộp Sửa KR, cột tự mở với thẻ chờ"
      - "390 và 1023: đo top cột so với bottom form, bề ngang từng thẻ so với cột; 1024 và 1440: đo lệch top cột và form"
      - "Mọi khổ: scrollWidth so innerWidth; ảnh E11-<khổ>-muc-tieu và E11-<khổ>-kr"
    expected: "exit 0; cùng script E1 ở khung 390 px, cho hộp Sửa mục tiêu và hộp Sửa KR: khối cột góp ý nằm dưới khối form (top cột ≥ bottom form), mỗi thẻ rộng bằng cột trừ lề, scrollWidth == innerWidth ở mọi bước; ở 1440 px và 1024 px cột và form cùng hàng (top chênh < 8 px); ca biên ngay dưới mốc: ở 1023 px cột KHÔNG cùng hàng với form (top cột ≥ bottom form). Ảnh evidence/E11-*.png từng bước. Chiều đỏ ghim: phép đo tràn ngang chạy trên trang có một phần tử cố ý rộng 500 px (--kiem-do-do) phải in 'tran ngang' và mã 1."
    evidence_required: [run_id, exit_code, verifier, verified_at, output, screenshot]
```

Commit căn cứ: ```
081c9b792 2026-10-03 feat(gop-y-dung-cho): góp ý Kara neo tại chỗ trong khung chi tiết, chip và bộ lọc trên danh sách, hộp Sửa chỉ còn dòng dẫn

 apps/api/src/okr/danh-sach.ts                      |    7 +-
 apps/api/src/okr/okr-xem.contracts.ts              |    3 +-
 apps/api/src/okr/okr.contracts.ts                  |    1 +
 apps/api/src/okr/tro-ly.service.ts                 |    2 +
 apps/api/test/gop-y-dung-cho.spec.ts               |   47 +-
 apps/api/test/tro-ly-okr-de-xuat-quyen.spec.ts     |   16 +-
 apps/app/app/(app)/[slug]/okr/bang-vet.tsx         |    6 +-
 apps/app/app/(app)/[slug]/okr/chip-gop-y.tsx       |   39 +
 apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx        |  516 --------
 apps/app/app/(app)/[slug]/okr/cua-toi.tsx          |    8 +-
 apps/app/app/(app)/[slug]/okr/dong-dan-gop-y.tsx   |   58 +
 apps/app/app/(app)/[slug]/okr/gop-y-kara.ts        |  267 ++++
 apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx     |   47 +-
 .../app/(app)/[slug]/okr/hop-thoai-muc-tieu.tsx    |   46 +-
 apps/app/app/(app)/[slug]/okr/loc-okr.tsx          |   31 +-
 apps/app/app/(app)/[slug]/okr/nhom-kara.tsx        |  347 ++++++
 apps/app/app/(app)/[slug]/okr/okr-search-params.ts |   10 +
 apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx    |    3 +-
 apps/app/app/(app)/[slug]/okr/the-gop-y.tsx        |  133 --
 .../(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx   |   10 +-
 .../crm/record-sheet/objective-sheet.tsx           |   69 +-
 apps/app/lib/messages/okr-gop-y.ts                 |  187 ++-
 apps/app/lib/okr-chu-ky-nhan.ts                    |    6 +
```

Vật của mục `apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx` ở HEAD: VẮNG

## lenh-dung-do-khong-ai-thay:E5 — sua-rang

Lý do: dieu 2 so ci.yml tung ky tu voi ban cua hang o sha 3c97e759, tien de bi luat 47 (09/10) lat — thay bang kiem cau truc buoc bun run build; spawnSync khai maxBuffer (dau ra pre-push > 1 MiB lam status null). Chu kho chon o Cong Pham vi F24 13/10 (P7-4)

Căn cứ: `CLAUDE.md:14`

Trước (mốc nền):
```
  - id: E5
    criterion: AC-5
    executor: script
    cmd: config:executors.script.ld_ba_noi_deu_chay
    paths:
      - "_acceptance/config.yaml"
      - ".githooks/pre-push"
      - ".github/workflows/**"
      - "_acceptance/lenh-dung-do-khong-ai-thay/rang/**"
    expected: |
      NAM dieu. Hai dieu dau doc ban khai; ba dieu sau do HANH VI — vi cau mo dau
      cua vong nay la "mot lenh khong ai chay thi khong phai bang chung", va mot
      ban khai khong ai chay cung the.
      1. `_acceptance/config.yaml` co mot o cam chay `build`, VA `feature_loop.suite_keys`
         goi ten dung o cam ay.
      2. `.github/workflows/ci.yml` KHONG doi mot ky tu so voi sha ghim.
      3. `.githooks/pre-push` co `build` trong danh sach task — doc bang cach TACH
         danh sach that (bien vong `for task in ...`), khong grep chuoi "build".
      4. HANH VI cua pre-push: tren BAN SAO da cay lai loi cu (mot loi goi getLocale
         o than mot man), chay `.githooks/pre-push` -> ma KHAC 0. Doi chung duong:
         ban sao chua cay thi pre-push ma 0. Khong co doi chung duong -> ma 2.
      5. `.github/workflows/acceptance.yml`: buoc chay lenh dung KHONG mang
         `continue-on-error: true`, va KHONG nam duoi mot `if:` khong bao gio dung —
         doc bang trinh phan tich YAML, khong bang tim chuoi.
      Thieu mot trong nam -> ma 1, neu dieu nao.
      Chieu do: go `build` khoi suite_keys trong ban sao -> ma 1 neu dung dieu 1;
      them `continue-on-error: true` vao buoc ay -> ma 1 neu dung dieu 5.
```

Sau (HEAD):
```
  - id: E5
    criterion: AC-5
    executor: script
    cmd: config:executors.script.ld_ba_noi_deu_chay
    paths:
      - "_acceptance/config.yaml"
      - ".githooks/pre-push"
      - ".github/workflows/**"
      - "_acceptance/lenh-dung-do-khong-ai-thay/rang/**"
    expected: |
      NAM dieu. Hai dieu dau doc ban khai; ba dieu sau do HANH VI — vi cau mo dau
      cua vong nay la "mot lenh khong ai chay thi khong phai bang chung", va mot
      ban khai khong ai chay cung the.
      1. `_acceptance/config.yaml` co mot o cam chay `build`, VA `feature_loop.suite_keys`
         goi ten dung o cam ay.
      2. `.github/workflows/ci.yml` KHONG doi mot ky tu so voi sha ghim.
      3. `.githooks/pre-push` co `build` trong danh sach task — doc bang cach TACH
         danh sach that (bien vong `for task in ...`), khong grep chuoi "build".
      4. HANH VI cua pre-push: tren BAN SAO da cay lai loi cu (mot loi goi getLocale
         o than mot man), chay `.githooks/pre-push` -> ma KHAC 0. Doi chung duong:
         ban sao chua cay thi pre-push ma 0. Khong co doi chung duong -> ma 2.
      5. `.github/workflows/acceptance.yml`: buoc chay lenh dung KHONG mang
         `continue-on-error: true`, va KHONG nam duoi mot `if:` khong bao gio dung —
         doc bang trinh phan tich YAML, khong bang tim chuoi.
      Thieu mot trong nam -> ma 1, neu dieu nao.
      Chieu do: go `build` khoi suite_keys trong ban sao -> ma 1 neu dung dieu 1;
      them `continue-on-error: true` vao buoc ay -> ma 1 neu dung dieu 5.
```

Diff `_acceptance/lenh-dung-do-khong-ai-thay/rang/ba-noi-deu-chay.mjs`:
```
diff --git a/_acceptance/lenh-dung-do-khong-ai-thay/rang/ba-noi-deu-chay.mjs b/_acceptance/lenh-dung-do-khong-ai-thay/rang/ba-noi-deu-chay.mjs
index 261684c24..6b568df5e 100644
--- a/_acceptance/lenh-dung-do-khong-ai-thay/rang/ba-noi-deu-chay.mjs
+++ b/_acceptance/lenh-dung-do-khong-ai-thay/rang/ba-noi-deu-chay.mjs
@@ -66,6 +66,7 @@ const chayPrePush = () => {
 	const r = spawnSync("bash", [join(GOC, ".githooks", "pre-push")], {
 		cwd: GOC,
 		encoding: "utf8",
+		maxBuffer: 256 * 1024 * 1024,
 		input: dongRef,
 		env: { ...process.env, TURBO_TELEMETRY_DISABLED: "1" },
 	});
```

Diff `_acceptance/lenh-dung-do-khong-ai-thay/rang/dieu-ci.mjs`:
```
(khong doi)
```

Đột biến khai:
```
[
  {
    "ten": "bo-buoc-build",
    "tep": ".github/workflows/ci.yml",
    "thay": [
      "bun run build",
      "bun run khong-build"
    ],
    "thong_diep": "ci.yml khong con buoc nao chay bun run build"
  },
  {
    "ten": "if-tren-buoc-build",
    "tep": ".github/workflows/ci.yml",
    "chen_if": true,
    "thong_diep": "buoc chay bun run build mang if hoac continue-on-error"
  }
]
```

Đầu ra chieu-do.mjs cho dòng này:
```
HONG DOT_BIEN_LECH lenh-dung-do-khong-ai-thay:E5 bo-buoc-build
HONG DOT_BIEN_LECH lenh-dung-do-khong-ai-thay:E5 if-tren-buoc-build
```

