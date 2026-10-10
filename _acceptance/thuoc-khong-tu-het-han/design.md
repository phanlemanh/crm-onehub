# Thiết kế — thuoc-khong-tu-het-han

## Hiện trạng đo 09/10 (cây `onehub` `a9e8bc75a` + nhánh F22)

Ô cơ hội viết 06/10, khi tám PR thước cloud (#263–#266, #270–#273) còn mở. Cả tám đã gộp. Đo lại phần còn sống:

1. **`paths` chết.** Quét mọi eval `script`/`test` của 195 hồ sơ đã ký bằng CHÍNH hàm khớp của bộ kit
   (`globToRe` trong `feature-loop/scripts/carry-plan.mjs`, bên đọc của bộ lọc hoá cũ): 20 eval ở 14 hồ sơ có ít nhất một
   glob không khớp tệp nào trong `git ls-files`. Luật 34 (08/10) liệt 11 hồ sơ; từ đó có hồ sơ đã được sửa (`toan-canh-okr`,
   `tro-ly-okr-de-xuat`, `khung-tao-okr-nhu-deal`) và hồ sơ mới chết (`danh-sach-keo-chung`, `dien-thoai-ca-nhan`,
   `tro-ly-doc-kho`, `tong-quan-va-khung-noi-tieng-viet`, `the-gop-y-okr` E2). Ba khuôn chết:
   - tệp đã dời hay xoá (`apps/app/lib/deal-stage.ts`, `auth-shader.tsx`, `confirm-dialog.tsx`, `okr/soan/man-soan.tsx`…);
   - thư mục viết có `/` cuối mà không `**` (`…/settings/giai-doan/`) — bộ kit khớp trọn chuỗi nên không khớp tệp nào;
   - ngoặc vuông thoát kiểu shell (`[[]slug]`) — bộ kit coi `[` là ký tự thường, nên glob đòi thư mục tên `[[]slug]`.
   Paths chết tắt bộ lọc hoá cũ của cả hồ sơ (bộ nhớ «F19 sửa paths chết»), nên mỗi lượt gộp chạm gần đó đòi ghim lại thừa.
2. **Thước «vòng này» còn tự hết hạn.** Trong ba thước ô cơ hội nêu tên, `tra-loi-tin-nhac` E17 đã được vá (thoát 0 trên nhánh
   F22). Hai thước còn đỏ trên mọi nhánh khác nhánh của chính chúng:
   - `ha-tran-thang-hoi-zalo` E7 (AC-6) so cây với `origin/onehub` và chạy kiểm trước-gộp với `--base origin/onehub` — nhánh
     F22 chạm một hồ sơ đã ký khác nên thoát 1 «truoc-gop vi pham 1 dong cua ho so khac».
   - `slack-thieu-quyen-email` E10 (AC-10) có vế «mọi commit trong `a62adb16..HEAD` mà `origin/onehub` chưa chứa phải mang tên
     hồ sơ» — commit của bất kỳ nhánh nào khác đều thiếu tên, thoát 1 «COMMIT KHONG TEN».
   Hai hồ sơ đã lên `onehub` qua PR #168 (`9dc1a037c`) và #187 (`52e00cad2`).
3. **Kho còn 162 tệp thước của hồ sơ đã ký nhắc `origin/onehub`, `merge-base` hay `..HEAD`** (quét chuỗi). Chuỗi có mặt không
   chứng minh thước tự hết hạn — nhiều tệp dùng chúng đúng cách lúc vòng còn mở. Biết chắc tệp nào hết hạn đòi chạy thước
   trên một nhánh khác — đúng việc lượt kiểm chéo đêm F9 (`kiem-cheo-sau-gop`) làm mỗi đêm cho hồ sơ bị chạm.
4. 868 eval máy của hồ sơ đã ký chưa khai `paths` (luôn chạy lại — an toàn, chỉ tốn giờ).

## Cách làm

- **Paths chết:** sửa đúng dòng `paths` của 20 eval, theo khuôn chết: trỏ tệp ở chỗ mới, thêm `**` sau thư mục, bỏ thoát
  ngoặc. Không đổi `cmd`, `expected`, `criterion` hay trường nào khác (luật 34). Glob nào không còn vật tương ứng (tệp đã xoá,
  phần việc đã gỡ) thì bỏ glob đó, giữ các glob còn lại; eval mất hết glob thì báo, không bịa glob mới.
- **Hai thước tự hết hạn:** viết lại phần mốc trôi bằng cặp sha của commit gộp PR của chính hồ sơ (bộ nhớ «neo thước vòng
  này»: đã lên `onehub` thì neo theo cặp sha gộp):
  - E7: (a) `git diff --name-only 9dc1a037c^1 9dc1a037c` không chạm `_acceptance/hoi-crm-qua-zalo/**` và tệp test đã ký;
    (b) vế «kiểm trước-gộp không vi phạm hồ sơ khác» là câu hỏi của lượt gộp, sau gộp do F9 trả lời mỗi đêm — bỏ khỏi thước,
    ghi lý do trong sổ của F10.
  - E10: tập commit của vòng = commit không phải gộp trong `a62adb16..52e00cad2^2` mang tên hồ sơ; vế chống sót đổi
    `^origin/onehub` thành `^52e00cad2^1` (commit của nhánh PR mà nền chưa có). Kết quả không còn phụ thuộc nhánh đang đứng.
  Lệnh, chiều đỏ và thông điệp ghim của hai thước giữ nguyên tên; chỉ mốc đổi.
- **Kiểm kê, không sửa:** `kiem-ke.md` liệt kê 162 tệp nhắc ref trôi và 868 eval thiếu `paths`, kèm lệnh quét để đo lại. Sửa từng
  thước khi lượt kiểm chéo đêm gọi tên nó đỏ. Luật chặn thước MỚI dùng ref trôi là việc của bộ kit (thước sinh ở S1 của mọi kho),
  mở chip sang `~/dev/acceptance-gate-kit`, không viết luật kho ở đây.

## Thử

- Thước quét paths chết dùng `globToRe` của bộ kit (đường giải bằng `resolve-plugin.mjs`), chạy trên cây thật: 0 eval chết
  trong hồ sơ đã ký; chiều đỏ trên bản sao một `evals.yaml` có glob chết → gọi tên hồ sơ/eval/glob.
- Thước «chỉ đổi paths»: so từng eval của 14 tệp `evals.yaml` trước/sau, mọi trường ngoài `paths` giống hệt.
- E7 và E10 chạy trên nhánh F10 (nhánh khác nhánh của chúng, có chạm hồ sơ đã ký khác và có commit không tên): thoát 0; chiều đỏ
  tự thân của chúng (`--gia-tep`, `--gia-commit-khong-ten`, phá-thử E7 (a)) vẫn đỏ.

## Lối B (10/10, sau S4 vòng 3)

- Thước cũ của AC-1 tự đọc `paths` và chỉ xét eval `script`/`test`. Lưới trước-gộp (`staleByPaths` của `lib/evidence-core.cjs`)
  xét MỌI eval, kể cả ui-check, judgment và ô `not-run`; một mục bị từ chối là cả hồ sơ mất bộ lọc hoá cũ. Thước mới gọi thẳng
  `staleByPaths`, `phanLoaiMucPaths`, `dungCayPaths` của lưới — đo đầu ra bộ lọc, không đo một bản sao của bên đọc.
- Đo ở `a9e8bc75a`: 13 hồ sơ đã ký bị lưới tắt lọc vì paths (12 `paths-khong-tro-toi-tep`, 1 `dang-khai-la`). Trong 5 hồ sơ
  phạm vi Lối 1, 3 hồ sơ bật lại bộ lọc ở tip; `dien-thoai-ca-nhan` (4 eval ui-check) và `the-gop-y-okr` (12 eval trỏ tệp đã xoá)
  còn chết, chuyển F24 và được trả về đúng bản `onehub` để vòng này không chạm chúng.
- `chi-paths.mjs` thêm vế «không chạm hai hồ sơ đó»: tập tệp đổi của vòng (cặp sha gộp khi đã gộp, merge-base khi còn mở).

## Đặc tả UX

Không áp: việc trên thước đo, không có màn.
