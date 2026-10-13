# Bảng trước/sau — ba-ho-so-do-san

Máy sinh bằng `rang/bang.mjs` từ `danh-sach.json`, mốc nền `3a2783409894908bc8dd1ee3893b88f990d1aebe`. Mỗi mục là một eval mà vòng này khai không chạy hoặc sửa răng.

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

## khoa-con-bat-xa-tran:E4 — sua-rang

Lý do: d-20260927T112853Z-28 cua tro-ly-okr-nen gan tran 60 giay cho 5 ca do quyen (het tran 5 giay duoi tai S4) — loi hua AC-4 «khong ca nao mang tran rieng» cua khoa-con-bat-xa-tran va quyet dinh da ky sau mau thuan; chu kho chon (c) 13/10 (F24 P7-6): rang cho phep tran rieng CHI khi la hang co ten trong bang TRAN_CO_LY_DO kem ly do va khai trong tep spec; tran so tran hay hang ngoai bang van do. Khai not-run (lua chon b cu) bi luat hai ve 2.12.0 chan

Căn cứ: `_acceptance/tro-ly-okr-nen/decisions.jsonl:28`

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
      - ".github/workflows/ci.yml"
      - ".github/workflows/acceptance.yml"
      - "_acceptance/khoa-con-bat-xa-tran/rang/soi-tep.mjs"
      - "_acceptance/khoa-con-bat-xa-tran/rang/chung.mjs"
    expected: |
      Doc tep (vang = khong cau hinh, in ra la vang). Ma tran viet truoc:
      - tep spec: dung 18 loi goi test( (quet ngoac can bang); moi loi goi dung hai doi so, hoac ba doi so khi doi so thu ba la mot hang co ten nam trong
        bang TRAN_CO_LY_DO cua rang/tran-co-ly-do.mjs VA khai `const <TEN> = <so>;` trong tep spec (F24 P7-6, chu kho chon 13/10)
        — 18 khang dinh, thong diep ghim ten ca;
      - tep spec + moi tep preload rut tu `--preload` cua script test (hien: apps/api/test/setup.ts):
        khong goi setDefaultTimeout; khong co --preload nao -> do (khong soat duoc);
      - apps/api/bunfig.toml, bunfig.toml: khong co khoa `timeout`;
      - moi script cua apps/api/package.json co `bun test`: khong `--timeout`;
      - MOI dong cua ci.yml va acceptance.yml (khong chi dong co `run:`): khong `--timeout`;
        ci.yml phai co >= 1 dong chay test (doi chung: bo soat nhin thay lenh CI); in so dong da doc.
      Tu kiem hai chieu, moi nhanh mot lan, tren cung ham soat, dot bien dung MOT tep:
      spec them `, 15_000` vao khoa-con-bat -> "test khoa-con-bat co tran rieng";
      spec doi tran hang thanh `60_000` -> "tran 60_000 khong nam trong bang tran co ly do";
      spec doi tran thanh hang ngoai bang `TRAN_KHAC` -> "tran TRAN_KHAC khong nam trong bang tran co ly do";
      script test them `--timeout 15000` -> "apps/api/package.json script test co --timeout";
      bunfig them `[test] timeout = 15000` -> "apps/api/bunfig.toml co khoa timeout";
      ci.yml them buoc `run: |` nhieu dong chua `bun test --timeout 15000` -> ".github/workflows/ci.yml co --timeout";
      setup.ts them setDefaultTimeout -> "apps/api/test/setup.ts goi setDefaultTimeout".
      Mot lan tu kiem khong bat -> script do, thuoc hong.
```

Diff `_acceptance/khoa-con-bat-xa-tran/rang/soi-tep.mjs`:
```
diff --git a/_acceptance/khoa-con-bat-xa-tran/rang/soi-tep.mjs b/_acceptance/khoa-con-bat-xa-tran/rang/soi-tep.mjs
index ec2c778d6..084e1d45f 100644
--- a/_acceptance/khoa-con-bat-xa-tran/rang/soi-tep.mjs
+++ b/_acceptance/khoa-con-bat-xa-tran/rang/soi-tep.mjs
@@ -1,6 +1,7 @@
 import { existsSync, readFileSync } from "node:fs";
 import { join } from "node:path";
 import { API, GOC, hong, loiGoiTest, quetLoiGoi, SPEC } from "./chung.mjs";
+import { xetTran } from "./tran-co-ly-do.mjs";
 
 const SO_CA = 18;
 const CHO_GOI_MA_TRAN = [
@@ -52,8 +53,9 @@ function soiTran(vat) {
 		loi.push(`tep co ${cacCa.length} loi goi test(, ky vong ${SO_CA}`);
 	else dat.push(`tep co dung ${SO_CA} loi goi test(`);
 	for (const ca of cacCa) {
-		if (ca.doiSo.length !== 2)
-			loi.push(`test ${ca.ten} co tran rieng (${ca.doiSo.length} doi so)`);
+		const x = xetTran(spec, ca);
+		if (!x.dat) loi.push(`test ${ca.ten} co tran rieng (${ca.doiSo.length} doi so): ${x.chu}`);
+		else if (x.ten) dat.push(`test ${ca.ten}: tran ${x.ten} co ly do — ${x.lyDo}`);
 		else dat.push(`test ${ca.ten}: 2 doi so`);
 	}
 	const preload = tepPreload(vat[GOI_TUONG_DOI]);
@@ -191,6 +193,18 @@ if (nhom === "khong-noi-tran") {
 		(nd) => themVaoCuoiCa(nd, "khoa-con-bat", ", 15_000"),
 		"test khoa-con-bat co tran rieng",
 	);
+	tuKiemTran(
+		"tran so tran",
+		SPEC_TUONG_DOI,
+		(nd) => nd.replace("\t\tTRAN_MA_TRAN_MS,\n\t);", "\t\t60_000,\n\t);"),
+		"co tran rieng (3 doi so): tran 60_000 khong nam trong bang tran co ly do",
+	);
+	tuKiemTran(
+		"tran hang ngoai bang",
+		SPEC_TUONG_DOI,
+		(nd) => nd.replace("\t\tTRAN_MA_TRAN_MS,\n\t);", "\t\tTRAN_KHAC,\n\t);").replace("const TRAN_MA_TRAN_MS = 60_000;", "const TRAN_MA_TRAN_MS = 60_000;\nconst TRAN_KHAC = 90_000;"),
+		"co tran rieng (3 doi so): tran TRAN_KHAC khong nam trong bang tran co ly do",
+	);
 	tuKiemTran(
 		"package.json",
 		GOI_TUONG_DOI,
```

Diff `_acceptance/khoa-con-bat-xa-tran/rang/tran-co-ly-do.mjs`:
```
diff --git a/_acceptance/khoa-con-bat-xa-tran/rang/tran-co-ly-do.mjs b/_acceptance/khoa-con-bat-xa-tran/rang/tran-co-ly-do.mjs
new file mode 100644
index 000000000..8b90cc86a
--- /dev/null
+++ b/_acceptance/khoa-con-bat-xa-tran/rang/tran-co-ly-do.mjs
@@ -0,0 +1,27 @@
+import { loiGoiTest } from "./chung.mjs";
+
+export const TRAN_CO_LY_DO = {
+	TRAN_MA_TRAN_MS:
+		"d-20260927T112853Z-28 (tro-ly-okr-nen S4-r1): go-la-cat-quyen het tran 5 giay duoi tai S4; chu kho chon giu tran co ly do 13/10 (F24, P7-6)",
+};
+
+export function xetTran(spec, ca) {
+	if (ca.doiSo.length === 2) return { dat: true, ten: null };
+	if (ca.doiSo.length !== 3)
+		return { dat: false, chu: `${ca.doiSo.length} doi so` };
+	const ten = ca.doiSo[2];
+	const lyDo = Object.hasOwn(TRAN_CO_LY_DO, ten) ? TRAN_CO_LY_DO[ten] : null;
+	if (!lyDo)
+		return { dat: false, ten, chu: `tran ${ten} khong nam trong bang tran co ly do` };
+	if (!new RegExp(`^const ${ten} = [0-9_]+;$`, "m").test(spec))
+		return { dat: false, ten, chu: `hang ${ten} khong khai trong tep spec` };
+	return { dat: true, ten, lyDo };
+}
+
+export function soTranRieng(spec) {
+	const hong = loiGoiTest(spec)
+		.map((ca) => ({ ca, x: xetTran(spec, ca) }))
+		.filter(({ x }) => !x.dat)
+		.map(({ ca, x }) => `test ${ca.ten} co tran rieng: ${x.chu}`);
+	return { dat: hong.length === 0, chu: hong.join("; ") || "moi tran rieng deu co ly do" };
+}
```

Đột biến khai:
```
[
  {
    "ten": "tran-so-tran",
    "kieu": "ham",
    "mo_dun": "_acceptance/khoa-con-bat-xa-tran/rang/tran-co-ly-do.mjs",
    "ham": "soTranRieng",
    "tep": "apps/api/test/go-la-cat-quyen.spec.ts",
    "thay": [
      "\t\tTRAN_MA_TRAN_MS,\n\t);",
      "\t\t60_000,\n\t);"
    ],
    "thong_diep": "tran so tran 60_000 bi bat",
    "thong_diep_may": "khong nam trong bang tran co ly do"
  },
  {
    "ten": "hang-ngoai-bang",
    "kieu": "ham",
    "mo_dun": "_acceptance/khoa-con-bat-xa-tran/rang/tran-co-ly-do.mjs",
    "ham": "soTranRieng",
    "tep": "apps/api/test/go-la-cat-quyen.spec.ts",
    "thay": [
      "\t\tTRAN_MA_TRAN_MS,\n\t);",
      "\t\tTRAN_KHAC,\n\t);"
    ],
    "thong_diep": "hang TRAN_KHAC ngoai bang bi bat",
    "thong_diep_may": "TRAN_KHAC khong nam trong bang tran co ly do"
  }
]
```

Đầu ra chieu-do.mjs cho dòng này:
```
khoa-con-bat-xa-tran:E4 tran-so-tran: that dat, dot bien bat — tran so tran 60_000 bi bat
khoa-con-bat-xa-tran:E4 hang-ngoai-bang: that dat, dot bien bat — hang TRAN_KHAC ngoai bang bi bat
```

## lenh-dung-do-khong-ai-thay:E5 — sua-rang

Lý do: dieu 2 so ci.yml tung ky tu voi ban cua hang o sha 3c97e759; tien de «ci.yml cua hang khong doi» bi luat 47 (09/10) lat — chu kho chon bo han dieu 2 13/10 (F24 P7-7); ba noi chay build (suite_keys, pre-push, acceptance.yml) van do dieu 1, 3-4, 5 canh. spawnSync khai maxBuffer (dau ra pre-push > 1 MiB lam status null). Dieu 3 tach thanh ham dung chung dieu-prepush.mjs de do chieu do

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
      BON dieu. Dieu 1 doc ban khai; ba dieu sau do HANH VI — vi cau mo dau
      cua vong nay la "mot lenh khong ai chay thi khong phai bang chung", va mot
      ban khai khong ai chay cung the.
      1. `_acceptance/config.yaml` co mot o cam chay `build`, VA `feature_loop.suite_keys`
         goi ten dung o cam ay.
      2. (bo 13/10, F24 P7-7: tien de «ci.yml cua hang khong doi» bi luat 47 lat; ci.yml nay do OneHub giu.)
      3. `.githooks/pre-push` co `build` trong danh sach task — doc bang cach TACH
         danh sach that (bien vong `for task in ...`), khong grep chuoi "build".
      4. HANH VI cua pre-push: tren BAN SAO da cay lai loi cu (mot loi goi getLocale
         o than mot man), chay `.githooks/pre-push` -> ma KHAC 0. Doi chung duong:
         ban sao chua cay thi pre-push ma 0. Khong co doi chung duong -> ma 2.
      5. `.github/workflows/acceptance.yml`: buoc chay lenh dung KHONG mang
         `continue-on-error: true`, va KHONG nam duoi mot `if:` khong bao gio dung —
         doc bang trinh phan tich YAML, khong bang tim chuoi.
      Thieu mot trong bon -> ma 1, neu dieu nao.
      Chieu do: go `build` khoi suite_keys trong ban sao -> ma 1 neu dung dieu 1;
      them `continue-on-error: true` vao buoc ay -> ma 1 neu dung dieu 5.
```

Diff `_acceptance/lenh-dung-do-khong-ai-thay/rang/ba-noi-deu-chay.mjs`:
```
diff --git a/_acceptance/lenh-dung-do-khong-ai-thay/rang/ba-noi-deu-chay.mjs b/_acceptance/lenh-dung-do-khong-ai-thay/rang/ba-noi-deu-chay.mjs
index 261684c24..cce2e83b7 100644
--- a/_acceptance/lenh-dung-do-khong-ai-thay/rang/ba-noi-deu-chay.mjs
+++ b/_acceptance/lenh-dung-do-khong-ai-thay/rang/ba-noi-deu-chay.mjs
@@ -2,9 +2,9 @@ import { execFileSync, spawnSync } from "node:child_process";
 import { readFileSync, writeFileSync } from "node:fs";
 import { dirname, join, resolve } from "node:path";
 import { fileURLToPath } from "node:url";
+import { buildTrongPrePush } from "./dieu-prepush.mjs";
 
 const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
-const SHA = "3c97e759a6c87bc8b6f0621d3854cb486728b442";
 const O_CAM = "build_khong_cache";
 const VAT_CAY = "apps/app/app/layout.tsx";
 
@@ -28,33 +28,12 @@ ghi(
 	`suite_keys goi ten o cam ay (${khoaSuite.length} khoa)`,
 );
 
-let ciDoi = true;
-try {
-	const cu = execFileSync("git", ["show", `${SHA}:.github/workflows/ci.yml`], {
-		cwd: GOC,
-		encoding: "utf8",
-	});
-	ciDoi = cu !== doc(".github/workflows/ci.yml");
-} catch (e) {
-	console.error(`MA 2: khong doc duoc ci.yml tai sha ghim — ${e.message}`);
-	process.exit(2);
-}
-ghi(!ciDoi, "dieu 2", "ci.yml cua hang khong doi mot ky tu");
-
-const prePush = doc(".githooks/pre-push");
-const khopVong = prePush.match(/for task in ([^;]+); do/);
-if (!khopVong) {
-	console.error(
-		"MA 2: khong thay vong `for task in ...` trong .githooks/pre-push",
-	);
+const dieu3 = buildTrongPrePush(doc(".githooks/pre-push"));
+if (!dieu3.doc) {
+	console.error(`MA 2: ${dieu3.chu}`);
 	process.exit(2);
 }
-const danhSachTask = khopVong[1].trim().split(/\s+/);
-ghi(
-	danhSachTask.includes("build"),
-	"dieu 3",
-	`danh sach task cua pre-push: ${danhSachTask.join(" ")}`,
-);
+ghi(dieu3.dat, "dieu 3", dieu3.chu);
 
 const shaHEAD = execFileSync("git", ["rev-parse", "HEAD"], {
 	cwd: GOC,
@@ -66,6 +45,7 @@ const chayPrePush = () => {
 	const r = spawnSync("bash", [join(GOC, ".githooks", "pre-push")], {
 		cwd: GOC,
 		encoding: "utf8",
+		maxBuffer: 256 * 1024 * 1024,
 		input: dongRef,
 		env: { ...process.env, TURBO_TELEMETRY_DISABLED: "1" },
 	});
@@ -143,5 +123,5 @@ if (hong.length > 0) {
 	process.exit(1);
 }
 console.log(
-	"XANH: ca nam dieu deu dat — hai dieu doc ban khai, ba dieu do hanh vi.",
+	"XANH: ca bon dieu deu dat — dieu 1 doc ban khai, ba dieu do hanh vi.",
 );
```

Diff `_acceptance/lenh-dung-do-khong-ai-thay/rang/dieu-prepush.mjs`:
```
diff --git a/_acceptance/lenh-dung-do-khong-ai-thay/rang/dieu-prepush.mjs b/_acceptance/lenh-dung-do-khong-ai-thay/rang/dieu-prepush.mjs
new file mode 100644
index 000000000..49e143113
--- /dev/null
+++ b/_acceptance/lenh-dung-do-khong-ai-thay/rang/dieu-prepush.mjs
@@ -0,0 +1,11 @@
+export function buildTrongPrePush(prePush) {
+	const khopVong = prePush.match(/for task in ([^;]+); do/);
+	if (!khopVong)
+		return { doc: false, dat: false, chu: "khong thay vong `for task in ...` trong .githooks/pre-push" };
+	const danhSachTask = khopVong[1].trim().split(/\s+/);
+	return {
+		doc: true,
+		dat: danhSachTask.includes("build"),
+		chu: `danh sach task cua pre-push: ${danhSachTask.join(" ")}`,
+	};
+}
```

Đột biến khai:
```
[
  {
    "ten": "bo-build-khoi-pre-push",
    "kieu": "ham",
    "mo_dun": "_acceptance/lenh-dung-do-khong-ai-thay/rang/dieu-prepush.mjs",
    "ham": "buildTrongPrePush",
    "tep": ".githooks/pre-push",
    "thay": [
      "lint:slop test build; do",
      "lint:slop test; do"
    ],
    "thong_diep": "go build khoi danh sach task cua pre-push thi dieu 3 do"
  }
]
```

Đầu ra chieu-do.mjs cho dòng này:
```
lenh-dung-do-khong-ai-thay:E5 bo-build-khoi-pre-push: that dat, dot bien bat — go build khoi danh sach task cua pre-push thi dieu 3 do
```

## khoa-con-bat-xa-tran:E3 — sua-rang

Lý do: do san lo o luot ghim 13/10: chuoi dich cua dot bien con-thanh-vien ghim hai tab, spec da thut them mot tab sau b703e8bef nen chuoi xuat hien 0 lan; rang nay tu lay thut le tu dong doi chung REST that cua spec, y do khong doi (E3 va E6 chung mot lenh)

Căn cứ: `b703e8bef`

Trước (mốc nền):
```
  - id: E3
    criterion: AC-3
    executor: script
    cmd: config:executors.script.kcb_con_thanh_vien
    paths:
      - "apps/api/test/go-la-cat-quyen.spec.ts"
      - "apps/api/src/trpc/middlewares/**"
      - "_acceptance/khoa-con-bat-xa-tran/rang/pha-thu.mjs"
      - "_acceptance/khoa-con-bat-xa-tran/rang/chung.mjs"
      - ".github/workflows/ci.yml"
    expected: |
      Cung khung E2: (a) ban sao nguyen ven -> ma 0; (b) ban sao bo dong
      `await db.member.delete(...)` trong khoa-con-bat (khoa thuoc nguoi VAN la thanh vien) ->
      ma khac 0 VA dau ra co DONG LOI "error: tRPC: khoa con bat cua nguoi ngoai van qua duoc".
      Dong can bo khong tim thay -> ma 2.
```

Sau (HEAD):
```
  - id: E3
    criterion: AC-3
    executor: script
    cmd: config:executors.script.kcb_con_thanh_vien
    paths:
      - "apps/api/test/go-la-cat-quyen.spec.ts"
      - "apps/api/src/trpc/middlewares/**"
      - "_acceptance/khoa-con-bat-xa-tran/rang/pha-thu.mjs"
      - "_acceptance/khoa-con-bat-xa-tran/rang/chung.mjs"
      - ".github/workflows/ci.yml"
    expected: |
      Cung khung E2: (a) ban sao nguyen ven -> ma 0; (b) ban sao bo dong
      `await db.member.delete(...)` trong khoa-con-bat (khoa thuoc nguoi VAN la thanh vien) ->
      ma khac 0 VA dau ra co DONG LOI "error: tRPC: khoa con bat cua nguoi ngoai van qua duoc".
      Dong can bo khong tim thay -> ma 2.
```

Diff `_acceptance/khoa-con-bat-xa-tran/rang/pha-thu.mjs`:
```
diff --git a/_acceptance/khoa-con-bat-xa-tran/rang/pha-thu.mjs b/_acceptance/khoa-con-bat-xa-tran/rang/pha-thu.mjs
index 511f261a2..dba8f6357 100644
--- a/_acceptance/khoa-con-bat-xa-tran/rang/pha-thu.mjs
+++ b/_acceptance/khoa-con-bat-xa-tran/rang/pha-thu.mjs
@@ -15,8 +15,10 @@ const DAY_KET_QUA =
 	"kq.push(...(await Promise.all(ds.slice(dau, dau + lo).map(fn))));";
 const GOI_TRPC = "\treturn theoLo(\n\t\tsoThuTuc(),\n";
 const GOI_REST = "\treturn theoLo(\n\t\tduongRest(),\n";
-const XOA_MEMBER_KHOA_CON_BAT =
-	'\t\texpect(restTruoc.status, "doi chung REST: khoa doc duoc").toBe(200);\n\t\tawait db.member.delete({ where: { id: await memberId(bi) } });\n';
+const DOI_CHUNG_REST = 'expect(restTruoc.status, "doi chung REST: khoa doc duoc").toBe(200);';
+const LUI_REST =
+	new RegExp(`^([\\t ]*)${DOI_CHUNG_REST.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m").exec(readFileSync(SPEC, "utf8"))?.[1] ?? "\t\t";
+const XOA_MEMBER_KHOA_CON_BAT = `${LUI_REST}${DOI_CHUNG_REST}\n${LUI_REST}await db.member.delete({ where: { id: await memberId(bi) } });\n`;
 const LECH_TRPC = "ma tran tRPC song song lech danh sach thu tuc";
 const LECH_REST = "ma tran REST song song lech danh sach duong";
 const LOT_TRPC = "tRPC: khoa con bat cua nguoi ngoai van qua duoc";
@@ -99,7 +101,7 @@ const NHOM = {
 			{
 				ten: "con-thanh-vien",
 				tim: XOA_MEMBER_KHOA_CON_BAT,
-				thay: '\t\texpect(restTruoc.status, "doi chung REST: khoa doc duoc").toBe(200);\n',
+				thay: `${LUI_REST}${DOI_CHUNG_REST}\n`,
 				thongDiep: LOT_TRPC,
 				thongDiepLangGieng: LECH_TRPC,
 			},
```

Đột biến khai:
```
[
  {
    "ten": "dot-bien-con-thanh-vien-bi-bat",
    "kieu": "lenh-chua",
    "lenh": [
      "bun",
      "run",
      "test",
      "--",
      "bun _acceptance/khoa-con-bat-xa-tran/rang/pha-thu.mjs con-thanh-vien"
    ],
    "chua": "OK dot bien con-thanh-vien: ma 1",
    "thong_diep": "pha-thu xoa dong member trong ban sao va ca khoa-con-bat do dung thong diep ghim"
  }
]
```

Đầu ra chieu-do.mjs cho dòng này:
```
khoa-con-bat-xa-tran:E3 dot-bien-con-thanh-vien-bi-bat: that dat, dot bien bat — pha-thu xoa dong member trong ban sao va ca khoa-con-bat do dung thong diep ghim
```

## khoa-con-bat-xa-tran:E6 — sua-rang

Lý do: do san lo o luot ghim 13/10: chuoi dich cua dot bien con-thanh-vien ghim hai tab, spec da thut them mot tab sau b703e8bef nen chuoi xuat hien 0 lan; rang nay tu lay thut le tu dong doi chung REST that cua spec, y do khong doi (E3 va E6 chung mot lenh)

Căn cứ: `b703e8bef`

Trước (mốc nền):
```
  - id: E6
    criterion: AC-6
    executor: script
    cmd: config:executors.script.kcb_con_thanh_vien
    paths:
      - "_acceptance/khoa-con-bat-xa-tran/rang/pha-thu.mjs"
      - "_acceptance/khoa-con-bat-xa-tran/rang/chung.mjs"
      - "apps/api/test/go-la-cat-quyen.spec.ts"
    expected: |
      Cung lan chay voi E3, tren CUNG dau ra cua ban sao dot bien con-thanh-vien (fixture that,
      khong dung tay): thong diep cua khang dinh ben canh
      "ma tran tRPC song song lech danh sach thu tuc" PHAI co mat trong dau ra (bun in no trong
      khung ma nguon quanh dong do — chung minh ca nay la bay that) VA bo khop dong loi PHAI
      KHONG nhan no. Thieu ve thu nhat -> do "thong diep lang gieng trong dau ra VANG" (tu kiem
      khong ket luan duoc); ve thu hai khop -> do "KHOP NHAM". Doi chung duong cung dau ra: bo
      khop NHAN "tRPC: khoa con bat cua nguoi ngoai van qua duoc" (E3).
```

Sau (HEAD):
```
  - id: E6
    criterion: AC-6
    executor: script
    cmd: config:executors.script.kcb_con_thanh_vien
    paths:
      - "_acceptance/khoa-con-bat-xa-tran/rang/pha-thu.mjs"
      - "_acceptance/khoa-con-bat-xa-tran/rang/chung.mjs"
      - "apps/api/test/go-la-cat-quyen.spec.ts"
    expected: |
      Cung lan chay voi E3, tren CUNG dau ra cua ban sao dot bien con-thanh-vien (fixture that,
      khong dung tay): thong diep cua khang dinh ben canh
      "ma tran tRPC song song lech danh sach thu tuc" PHAI co mat trong dau ra (bun in no trong
      khung ma nguon quanh dong do — chung minh ca nay la bay that) VA bo khop dong loi PHAI
      KHONG nhan no. Thieu ve thu nhat -> do "thong diep lang gieng trong dau ra VANG" (tu kiem
      khong ket luan duoc); ve thu hai khop -> do "KHOP NHAM". Doi chung duong cung dau ra: bo
      khop NHAN "tRPC: khoa con bat cua nguoi ngoai van qua duoc" (E3).
```

Diff `_acceptance/khoa-con-bat-xa-tran/rang/pha-thu.mjs`:
```
diff --git a/_acceptance/khoa-con-bat-xa-tran/rang/pha-thu.mjs b/_acceptance/khoa-con-bat-xa-tran/rang/pha-thu.mjs
index 511f261a2..dba8f6357 100644
--- a/_acceptance/khoa-con-bat-xa-tran/rang/pha-thu.mjs
+++ b/_acceptance/khoa-con-bat-xa-tran/rang/pha-thu.mjs
@@ -15,8 +15,10 @@ const DAY_KET_QUA =
 	"kq.push(...(await Promise.all(ds.slice(dau, dau + lo).map(fn))));";
 const GOI_TRPC = "\treturn theoLo(\n\t\tsoThuTuc(),\n";
 const GOI_REST = "\treturn theoLo(\n\t\tduongRest(),\n";
-const XOA_MEMBER_KHOA_CON_BAT =
-	'\t\texpect(restTruoc.status, "doi chung REST: khoa doc duoc").toBe(200);\n\t\tawait db.member.delete({ where: { id: await memberId(bi) } });\n';
+const DOI_CHUNG_REST = 'expect(restTruoc.status, "doi chung REST: khoa doc duoc").toBe(200);';
+const LUI_REST =
+	new RegExp(`^([\\t ]*)${DOI_CHUNG_REST.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m").exec(readFileSync(SPEC, "utf8"))?.[1] ?? "\t\t";
+const XOA_MEMBER_KHOA_CON_BAT = `${LUI_REST}${DOI_CHUNG_REST}\n${LUI_REST}await db.member.delete({ where: { id: await memberId(bi) } });\n`;
 const LECH_TRPC = "ma tran tRPC song song lech danh sach thu tuc";
 const LECH_REST = "ma tran REST song song lech danh sach duong";
 const LOT_TRPC = "tRPC: khoa con bat cua nguoi ngoai van qua duoc";
@@ -99,7 +101,7 @@ const NHOM = {
 			{
 				ten: "con-thanh-vien",
 				tim: XOA_MEMBER_KHOA_CON_BAT,
-				thay: '\t\texpect(restTruoc.status, "doi chung REST: khoa doc duoc").toBe(200);\n',
+				thay: `${LUI_REST}${DOI_CHUNG_REST}\n`,
 				thongDiep: LOT_TRPC,
 				thongDiepLangGieng: LECH_TRPC,
 			},
```

Đột biến khai:
```
[
  {
    "ten": "dot-bien-con-thanh-vien-bi-bat",
    "kieu": "lenh-chua",
    "lenh": [
      "bun",
      "run",
      "test",
      "--",
      "bun _acceptance/khoa-con-bat-xa-tran/rang/pha-thu.mjs con-thanh-vien"
    ],
    "chua": "OK dot bien con-thanh-vien: ma 1",
    "thong_diep": "pha-thu xoa dong member trong ban sao va ca khoa-con-bat do dung thong diep ghim"
  }
]
```

Đầu ra chieu-do.mjs cho dòng này:
```
khoa-con-bat-xa-tran:E6 dot-bien-con-thanh-vien-bi-bat: that dat, dot bien bat — pha-thu xoa dong member trong ban sao va ca khoa-con-bat do dung thong diep ghim
```

## lenh-dung-do-khong-ai-thay:E2 — sua-rang

Lý do: do san lo o luot ghim 13/10: neo dan so 26 file goi getLocale la anh chup cay cua vong cu, nay 54 — thuoc tu het han. Rang quet tren cay xuat ra tai cap sha gop eeb6ea30 cua vong (luat F10: thuoc «vong nay» neo cap sha gop), neo 26 dung o moc do

Căn cứ: `eeb6ea30ec62369f2892d0a39a66d9a8b49fbcc1`

Trước (mốc nền):
```
  - id: E2
    criterion: AC-2
    executor: script
    cmd: config:executors.script.ld_khong_doc_ngoai_suspense
    paths:
      - "apps/app/app/**"
      - "_acceptance/lenh-dung-do-khong-ai-thay/rang/**"
    expected: |
      Dan so sinh TU DIA: quet `apps/app/app/**` tim moi file goi `getLocale`.
      So file tim duoc phai bang NEO 25 ghim trong hop dong — lech len hay xuong
      deu la ma 2. Dan so khong duoc lay bang chinh ket qua cua phep do.
      Do KHA NANG DI TOI, khong do cho dung tu vung: tu ham xuat mac dinh, bam
      tham chieu JSX MOT CHANG sang component con trong cung file; MOI duong tu
      ham xuat mac dinh toi mot loi goi `getLocale()` phai di qua mot ranh
      `<Suspense>`. Luat "nam trong than ham xuat mac dinh" la SAI cho vong nay:
      chinh cach sua dua loi goi sang mot ham anh em NGOAI than ay, nen luat tu
      vung se xanh oan tren dung ca no phai bat.
      Doc bang AST, khong bang tim chuoi.
      In ba con so: file co goi getLocale · file dat · neo.
      Chieu do: cay mot loi goi NGOAI ranh Suspense vao ban sao -> ma 1, neu
      `file:dong`. Chieu xanh dong thoi phai chung: mot man da sua (loi goi nam
      trong component con duoc Suspense boc) van DAT — mau duong ghim ten.
```

Sau (HEAD):
```
  - id: E2
    criterion: AC-2
    executor: script
    cmd: config:executors.script.ld_khong_doc_ngoai_suspense
    paths:
      - "apps/app/app/**"
      - "_acceptance/lenh-dung-do-khong-ai-thay/rang/**"
    expected: |
      Dan so sinh TU CAY TAI CAP SHA GOP eeb6ea30 (git archive; F24 13/10 — thuoc «vong nay» neo cap sha gop, khong neo HEAD): quet `apps/app/app/**` tim moi file goi `getLocale`.
      So file tim duoc phai bang NEO 25 ghim trong hop dong — lech len hay xuong
      deu la ma 2. Dan so khong duoc lay bang chinh ket qua cua phep do.
      Do KHA NANG DI TOI, khong do cho dung tu vung: tu ham xuat mac dinh, bam
      tham chieu JSX MOT CHANG sang component con trong cung file; MOI duong tu
      ham xuat mac dinh toi mot loi goi `getLocale()` phai di qua mot ranh
      `<Suspense>`. Luat "nam trong than ham xuat mac dinh" la SAI cho vong nay:
      chinh cach sua dua loi goi sang mot ham anh em NGOAI than ay, nen luat tu
      vung se xanh oan tren dung ca no phai bat.
      Doc bang AST, khong bang tim chuoi.
      In ba con so: file co goi getLocale · file dat · neo.
      Chieu do: cay mot loi goi NGOAI ranh Suspense vao ban sao -> ma 1, neu
      `file:dong`. Chieu xanh dong thoi phai chung: mot man da sua (loi goi nam
      trong component con duoc Suspense boc) van DAT — mau duong ghim ten.
```

Diff `_acceptance/lenh-dung-do-khong-ai-thay/rang/khong-doc-ngoai-suspense.mjs`:
```
diff --git a/_acceptance/lenh-dung-do-khong-ai-thay/rang/khong-doc-ngoai-suspense.mjs b/_acceptance/lenh-dung-do-khong-ai-thay/rang/khong-doc-ngoai-suspense.mjs
index 722885e02..78077d504 100644
--- a/_acceptance/lenh-dung-do-khong-ai-thay/rang/khong-doc-ngoai-suspense.mjs
+++ b/_acceptance/lenh-dung-do-khong-ai-thay/rang/khong-doc-ngoai-suspense.mjs
@@ -1,4 +1,6 @@
-import { readdirSync, readFileSync, statSync } from "node:fs";
+import { execFileSync } from "node:child_process";
+import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
+import { tmpdir } from "node:os";
 import { dirname, join, relative, resolve } from "node:path";
 import { fileURLToPath } from "node:url";
 import ts from "typescript";
@@ -8,7 +10,18 @@ const MAC_DINH = resolve(RANG, "..", "..", "..");
 
 const doi = process.argv.slice(2);
 const iGoc = doi.indexOf("--goc");
-const GOC = iGoc === -1 ? MAC_DINH : resolve(doi[iGoc + 1]);
+const MOC_GOP = "eeb6ea30ec62369f2892d0a39a66d9a8b49fbcc1";
+
+function cayTaiMocGop() {
+	const thuMuc = mkdtempSync(join(tmpdir(), "ld-moc-gop-"));
+	process.on("exit", () => rmSync(thuMuc, { recursive: true, force: true }));
+	const tar = join(thuMuc, "cay.tar");
+	execFileSync("git", ["archive", "--output", tar, MOC_GOP, "apps/app/app"], { cwd: MAC_DINH });
+	execFileSync("tar", ["-xf", tar, "-C", thuMuc]);
+	return thuMuc;
+}
+
+const GOC = iGoc === -1 ? cayTaiMocGop() : resolve(doi[iGoc + 1]);
 const iNeo = doi.indexOf("--neo");
 const NEO = iNeo === -1 ? 26 : Number(doi[iNeo + 1]);
 const LAYOUT_GOC = "apps/app/app/layout.tsx";
```

Đột biến khai:
```
[
  {
    "ten": "bo-suspense-o-layout",
    "kieu": "lenh-goc",
    "rang": "_acceptance/lenh-dung-do-khong-ai-thay/rang/khong-doc-ngoai-suspense.mjs",
    "sha": "eeb6ea30ec62369f2892d0a39a66d9a8b49fbcc1",
    "thu_muc": "apps/app/app",
    "tep": "apps/app/app/layout.tsx",
    "thay_cap": [
      [
        "<Suspense fallback={null}>",
        "<>"
      ],
      [
        "</Suspense>",
        "</>"
      ]
    ],
    "thong_diep": "bo ranh Suspense cua root layout tren cay moc gop thi rang do"
  }
]
```

Đầu ra chieu-do.mjs cho dòng này:
```
lenh-dung-do-khong-ai-thay:E2 bo-suspense-o-layout: that dat, dot bien bat — bo ranh Suspense cua root layout tren cay moc gop thi rang do
```

## lenh-dung-do-khong-ai-thay:E3 — sua-rang

Lý do: do san lo o luot ghim 13/10: rang so diff tu sha ghim toi HEAD nen moi PR sau cham apps/app deu lam no do — thuoc «vong nay» tu het han. Rang so dung cap sha gop eeb6ea30^1..eeb6ea30 (luat F10); o cap do diff chi co layout.tsx

Căn cứ: `eeb6ea30ec62369f2892d0a39a66d9a8b49fbcc1`

Trước (mốc nền):
```
  - id: E3
    criterion: AC-3
    executor: script
    cmd: config:executors.script.ld_man_khong_doi
    paths:
      - "apps/app/**"
    expected: |
      Dem chinh cai diff: `git diff --name-only <sha ghim> -- apps/app` phai liet
      DUNG MOT file, va do la `apps/app/app/layout.tsx`.
      Vi sao phep do nay manh hon phep so 15 man cua ban truoc: ban va nay LA mot
      file, nen "khong man nao doi mot ky tu" do duoc bang chinh danh sach file doi,
      khong can suy qua kho chuoi.
      File nao khac -> ma 1, neu ten file.
      Khong file nao doi -> ma 2: ban va chua co thi phep do khong con nghia.
```

Sau (HEAD):
```
  - id: E3
    criterion: AC-3
    executor: script
    cmd: config:executors.script.ld_man_khong_doi
    paths:
      - "apps/app/**"
    expected: |
      Dem chinh cai diff: `git diff --name-only eeb6ea30^1 eeb6ea30 -- apps/app` (cap sha gop cua vong; F24 13/10) phai liet
      DUNG MOT file, va do la `apps/app/app/layout.tsx`.
      Vi sao phep do nay manh hon phep so 15 man cua ban truoc: ban va nay LA mot
      file, nen "khong man nao doi mot ky tu" do duoc bang chinh danh sach file doi,
      khong can suy qua kho chuoi.
      File nao khac -> ma 1, neu ten file.
      Khong file nao doi -> ma 2: ban va chua co thi phep do khong con nghia.
```

Diff `_acceptance/lenh-dung-do-khong-ai-thay/rang/man-khong-doi.mjs`:
```
diff --git a/_acceptance/lenh-dung-do-khong-ai-thay/rang/man-khong-doi.mjs b/_acceptance/lenh-dung-do-khong-ai-thay/rang/man-khong-doi.mjs
index 65f2af4d9..e9f03d7e3 100644
--- a/_acceptance/lenh-dung-do-khong-ai-thay/rang/man-khong-doi.mjs
+++ b/_acceptance/lenh-dung-do-khong-ai-thay/rang/man-khong-doi.mjs
@@ -3,42 +3,41 @@ import { dirname, resolve } from "node:path";
 import { fileURLToPath } from "node:url";
 
 const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
-const SHA = "3c97e759a6c87bc8b6f0621d3854cb486728b442";
+export const MOC_GOP = "eeb6ea30ec62369f2892d0a39a66d9a8b49fbcc1";
 const DUOC_PHEP = "apps/app/app/layout.tsx";
 
-const doi = process.argv.slice(2);
-const iGoc = doi.indexOf("--goc");
-const goc = iGoc === -1 ? GOC : resolve(doi[iGoc + 1]);
+export function kiemDoi(danhSach) {
+	const ds = String(danhSach).split("\n").filter(Boolean);
+	const la = ds.filter((d) => d !== DUOC_PHEP);
+	if (la.length > 0)
+		return { ma: 1, dat: false, ds, chu: `${la.length} file ngoai ${DUOC_PHEP} da doi: ${la.join(", ")}` };
+	if (ds.length === 0) return { ma: 2, dat: false, ds, chu: "khong file nao doi — ban va chua co, phep do nay khong con nghia" };
+	return { ma: 0, dat: true, ds, chu: `dung mot file doi, va do la ${DUOC_PHEP}` };
+}
 
-let ra;
-try {
-	ra = execFileSync("git", ["diff", "--name-only", SHA, "--", "apps/app"], {
+export function diffCapGop(goc = GOC) {
+	return execFileSync("git", ["diff", "--name-only", `${MOC_GOP}^1`, MOC_GOP, "--", "apps/app"], {
 		cwd: goc,
 		encoding: "utf8",
 	});
-} catch (e) {
-	console.error(`MA 2: khong so duoc voi sha ghim — ${e.message}`);
-	process.exit(2);
 }
 
-const doi_ = ra.split("\n").filter(Boolean);
-console.log(`file cua apps/app doi so voi sha ghim: ${doi_.length}`);
-for (const d of doi_) console.log(`  ${d}`);
-
-const la = doi_.filter((d) => d !== DUOC_PHEP);
-if (la.length > 0) {
-	console.error(
-		`DO: ${la.length} file ngoai ${DUOC_PHEP} da doi — man hoac kho chuoi bi dung, nen chu tren man co the doi:`,
-	);
-	for (const d of la) console.error(`  ${d}`);
-	process.exit(1);
+if (import.meta.main) {
+	const doi = process.argv.slice(2);
+	const iGoc = doi.indexOf("--goc");
+	const goc = iGoc === -1 ? GOC : resolve(doi[iGoc + 1]);
+	let ra;
+	try {
+		ra = diffCapGop(goc);
+	} catch (e) {
+		console.error(`MA 2: khong so duoc cap sha gop ${MOC_GOP.slice(0, 9)}^1..${MOC_GOP.slice(0, 9)} — ${e.message}`);
+		process.exit(2);
+	}
+	const kq = kiemDoi(ra);
+	console.log(`file cua apps/app doi trong cap gop ${MOC_GOP.slice(0, 9)}^1..${MOC_GOP.slice(0, 9)}: ${kq.ds.length}`);
+	for (const d of kq.ds) console.log(`  ${d}`);
+	if (kq.ma === 1) console.error(`DO: ${kq.chu} — man hoac kho chuoi bi dung, nen chu tren man co the doi`);
+	else if (kq.ma === 2) console.error(`MA 2: ${kq.chu}`);
+	else console.log(`XANH: ${kq.chu}.`);
+	process.exit(kq.ma);
 }
-
-if (doi_.length === 0) {
-	console.error(
-		`MA 2: khong file nao doi — ban va chua co, phep do nay khong con nghia`,
-	);
-	process.exit(2);
-}
-
-console.log(`XANH: dung mot file doi, va do la ${DUOC_PHEP}.`);
```

Đột biến khai:
```
[
  {
    "ten": "them-mot-man-vao-diff",
    "kieu": "ham-git",
    "mo_dun": "_acceptance/lenh-dung-do-khong-ai-thay/rang/man-khong-doi.mjs",
    "ham": "kiemDoi",
    "git": [
      "diff",
      "--name-only",
      "eeb6ea30ec62369f2892d0a39a66d9a8b49fbcc1^1",
      "eeb6ea30ec62369f2892d0a39a66d9a8b49fbcc1",
      "--",
      "apps/app"
    ],
    "them": "apps/app/app/page.tsx",
    "thong_diep": "diff co them mot file ngoai layout.tsx thi rang do"
  }
]
```

Đầu ra chieu-do.mjs cho dòng này:
```
lenh-dung-do-khong-ai-thay:E3 them-mot-man-vao-diff: that dat, dot bien bat — diff co them mot file ngoai layout.tsx thi rang do
```

## lenh-dung-do-khong-ai-thay:E8 — sua-rang

Lý do: do san lo o luot ghim 13/10: spawnSync khong khai maxBuffer nen `bun run test` vuot 1 MiB -> ENOBUFS; menh de «apps/app dung ba canh bao lint» la so ghim cua vong cu (nay 20), tu het han — y «vong ay khong doi gi ngoai layout.tsx» da do E3 o cap sha gop. Khai maxBuffer, bo menh de dem canh bao; bon lenh van phai ma 0

Căn cứ: `eeb6ea30ec62369f2892d0a39a66d9a8b49fbcc1`

Trước (mốc nền):
```
  - id: E8
    criterion: AC-8
    executor: script
    cmd: config:executors.script.ld_bon_lenh_cu
    paths:
      - "apps/app/**"
      - "packages/**"
      - "apps/api/**"
      - "apps/agent/**"
    expected: |
      Chay `bun run test`, `check-types`, `lint`, `lint:slop`, in ma thoat tung lenh.
      Xanh: ca bon ma 0, VA `apps/app` ra dung ba canh bao lint — so ba la con so
      GHIM cua kho, lech len hay xuong deu la do.
      Mot lenh khac 0 -> ma 1, neu ten lenh va ma.
```

Sau (HEAD):
```
  - id: E8
    criterion: AC-8
    executor: script
    cmd: config:executors.script.ld_bon_lenh_cu
    paths:
      - "apps/app/**"
      - "packages/**"
      - "apps/api/**"
      - "apps/agent/**"
    expected: |
      Chay `bun run test`, `check-types`, `lint`, `lint:slop`, in ma thoat tung lenh.
      Xanh: ca bon ma 0. (Menh de «apps/app ra dung ba canh bao lint» bo 13/10, F24: so ghim cua
      vong cu tu het han khi kho lon; y «vong ay khong doi gi ngoai layout.tsx» do E3 o cap sha gop.)
      Mot lenh khac 0 -> ma 1, neu ten lenh va ma.
```

Diff `_acceptance/lenh-dung-do-khong-ai-thay/rang/bon-lenh-cu.mjs`:
```
diff --git a/_acceptance/lenh-dung-do-khong-ai-thay/rang/bon-lenh-cu.mjs b/_acceptance/lenh-dung-do-khong-ai-thay/rang/bon-lenh-cu.mjs
index fd73b2b09..4eb66bf06 100644
--- a/_acceptance/lenh-dung-do-khong-ai-thay/rang/bon-lenh-cu.mjs
+++ b/_acceptance/lenh-dung-do-khong-ai-thay/rang/bon-lenh-cu.mjs
@@ -1,9 +1,8 @@
 import { spawnSync } from "node:child_process";
-import { dirname, join, resolve } from "node:path";
+import { dirname, resolve } from "node:path";
 import { fileURLToPath } from "node:url";
 
 const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
-const CANH_BAO_GHIM = 3;
 
 const LENH = [
 	["test", ["bun", ["run", "test"]]],
@@ -12,37 +11,30 @@ const LENH = [
 	["lint:slop", ["bun", ["run", "lint:slop"]]],
 ];
 
-let hong = 0;
-for (const [ten, [lenh, doi]] of LENH) {
-	const ra = spawnSync(lenh, doi, { cwd: GOC, encoding: "utf8" });
-	if (ra.error) {
-		console.error(`MA 2: khong chay duoc \`${ten}\` — ${ra.error.message}`);
-		process.exit(2);
-	}
-	console.log(`${ten}: ma ${ra.status}`);
-	if (ra.status !== 0) hong += 1;
-}
-
-const lint = spawnSync("bun", ["run", "lint"], {
-	cwd: join(GOC, "apps", "app"),
-	encoding: "utf8",
-});
-const khop = `${lint.stdout}${lint.stderr}`.match(/Found (\d+) warning/);
-if (!khop) {
-	console.error("MA 2: khong doc duoc so canh bao lint cua apps/app");
-	process.exit(2);
+export function danhGia(ketQua) {
+	const ds = JSON.parse(String(ketQua));
+	const hong = ds.filter((k) => k.ma !== 0);
+	if (ds.length !== LENH.length) return { dat: false, chu: `chay ${ds.length} lenh, ky vong ${LENH.length}` };
+	return hong.length
+		? { dat: false, chu: `${hong.length} lenh chung cu khong ma 0: ${hong.map((k) => `${k.ten}=${k.ma}`).join(", ")}` }
+		: { dat: true, chu: "bon lenh chung cu deu ma 0" };
 }
-const soCanhBao = Number(khop[1]);
-console.log(`apps/app canh bao lint: ${soCanhBao} · ghim: ${CANH_BAO_GHIM}`);
 
-if (hong > 0) {
-	console.error(`DO: ${hong} lenh chung cu khong ma 0.`);
-	process.exit(1);
-}
-if (soCanhBao !== CANH_BAO_GHIM) {
-	console.error(
-		`DO: apps/app ra ${soCanhBao} canh bao lint, ghim la ${CANH_BAO_GHIM} — lech len hay xuong deu la do.`,
-	);
-	process.exit(1);
+if (import.meta.main) {
+	const ketQua = [];
+	for (const [ten, [lenh, doi]] of LENH) {
+		const ra = spawnSync(lenh, doi, { cwd: GOC, encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });
+		if (ra.error) {
+			console.error(`MA 2: khong chay duoc \`${ten}\` — ${ra.error.message}`);
+			process.exit(2);
+		}
+		console.log(`${ten}: ma ${ra.status}`);
+		ketQua.push({ ten, ma: ra.status });
+	}
+	const kq = danhGia(JSON.stringify(ketQua));
+	if (!kq.dat) {
+		console.error(`DO: ${kq.chu}.`);
+		process.exit(1);
+	}
+	console.log(`XANH: ${kq.chu}.`);
 }
-console.log("XANH: bon lenh chung cu deu ma 0, canh bao lint dung ghim.");
```

Đột biến khai:
```
[
  {
    "ten": "mot-lenh-cu-do",
    "kieu": "ham-chuoi",
    "mo_dun": "_acceptance/lenh-dung-do-khong-ai-thay/rang/bon-lenh-cu.mjs",
    "ham": "danhGia",
    "vao": "[{\"ten\": \"test\", \"ma\": 0}, {\"ten\": \"check-types\", \"ma\": 0}, {\"ten\": \"lint\", \"ma\": 0}, {\"ten\": \"lint:slop\", \"ma\": 0}]",
    "vao_dot": "[{\"ten\": \"test\", \"ma\": 0}, {\"ten\": \"check-types\", \"ma\": 1}, {\"ten\": \"lint\", \"ma\": 0}, {\"ten\": \"lint:slop\", \"ma\": 0}]",
    "thong_diep": "mot trong bon lenh cu khong ma 0 thi rang do"
  }
]
```

Đầu ra chieu-do.mjs cho dòng này:
```
lenh-dung-do-khong-ai-thay:E8 mot-lenh-cu-do: that dat, dot bien bat — mot trong bon lenh cu khong ma 0 thi rang do
```

