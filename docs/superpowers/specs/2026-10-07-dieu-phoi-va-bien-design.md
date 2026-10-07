# dieu-phoi-va-bien — design (hợp đồng nối tiếp của dieu-phoi-hai-tang)

Gốc: Cổng 2 lượt 4 của `_acceptance/dieu-phoi-hai-tang/` (ký 07/10, Phan Le Manh). Owner chọn «mở
hợp đồng mới» cho năm mục ngoài hợp đồng (`review-findings.md`: Ngoài-1, 3, 5, 6, 7; sổ quyết định
`d-20261007T002515Z-16`). Vòng này phải gộp TRƯỚC khi mở đợt sau-14-10: Ngoài-5 đánh trúng đúng thước
«S4 chạy không giữ khoá» mà đợt sinh ra để giữ.

Nhánh `feat/dieu-phoi-va-bien` rẽ từ `origin/feat/dieu-phoi-hai-tang` @ `a3ac4cfc` vì PR #288 chưa
gộp lúc mở vòng. PR của vòng này nhắm `onehub` và chỉ gộp SAU #288 (diff khi đó chỉ còn phần của vòng).

## 1. Năm lỗ hổng và cách vá

| # | Ngoài | Lỗ hổng | Vá ở | Cách vá |
|---|---|---|---|---|
| 1 | 5 (cao) | Hook chặn S4 chỉ nhận `scriptPath` kết thúc bằng `acceptance-verify.js`; kho chạy S4 từ bản chép `.acceptance-runs/wf/acceptance-verify-<slug>-r<N>.js` nên hook để lọt | `hook-chan-s4.mjs` | Nhận diện theo **danh tính của workflow**, không theo tên tệp: `meta.name: 'acceptance-verify'` đọc từ tệp `scriptPath` hoặc `script` nội tuyến, hoặc `name: 'acceptance-verify'`; tên tệp `acceptance-verify*.js` là đường lùi khi không đọc được tệp |
| 2 | 1 | `dieu-phoi.config.json`, `hang-viec.json` đọc thẳng; `bao_ve` là chuỗi bị trải thành từng ký tự → máy duyệt tệp bảo vệ; thiếu `han_thue_phut[loai]` → `NaN` sau `mkdir` → thư mục khoá trống, thu hồi, lặp lại | `hinh-dang.mjs` + mọi chỗ đọc | `kiemCauHinh`, `kiemHangViec` (đóng: khoá lạ là lỗi); mọi chỗ đọc đi qua `docCauHinh`/`docHangViec`. Sai hình dạng thì nhịp ném lỗi có tên trường → `loi-nhip` `can_phan`, không cấp, không duyệt |
| 3 | 3 | `bun run test:dieu-phoi` không ở `bun run test`, pre-push hay CI | `.githooks/pre-push`, `gate-shape.json`, `scripts/verify-gate-shape.mjs`, `.github/workflows/acceptance.yml` | Thêm vào vòng lệnh pre-push; khai checker kiểu mới `node-test` (so số ca của cổng với một lượt tham chiếu trên mọi `*.test.mjs` của thư mục khai); job CI riêng trong `acceptance.yml`. Không vào `bun run test`: lệnh đó dựng CSDL theo lượt cho các gói turbo, bộ điều phối không cần CSDL — lý do ghi trong khai báo checker |
| 4 | 6 | Thợ chờ một việc nền dài thì không có lời gọi công cụ nào → hook nhịp im → hết hạn thuê + nhịp cũ → thu hồi giữa chừng | `giu-nhip.mjs` (mới), `hook-chan-s4.mjs`, `cau-hinh.mjs` | Lệnh bọc `giu-nhip.mjs -- <lệnh>`: chạy lệnh con, chạm `nhip` của khoá mình mỗi `NHIP.giuNhipMs` (1′) tới khi lệnh con thoát, trả đúng mã thoát. Hook chặn S4 ép dùng: lệnh nặng được phân loại, chạy nền (`run_in_background: true`), phiên đang giữ khoá, chưa bọc → thoát 2 kèm đúng dòng lệnh đã bọc |
| 5 | 7 | `gia-han` được máy duyệt nhưng `han_thue_den` không đổi | `yeu-cau.mjs`, `lich.mjs`, `phat-lich.mjs` | Máy chỉ duyệt khi phiên đang giữ đúng một khoá khớp (`noi_dung.tai_nguyen` tuỳ chọn); mỗi nhịp áp mọi `gia-han` có `tra-loi` duyệt (máy hay giám sát) vào `chu.json`: `han_moi = max(hạn cũ, bây giờ) + phút`, ghi id vào `chu.gia_han_theo` để không áp hai lần, bỏ qua yêu cầu viết trước `cap_luc` của lượt hiện tại |

### Lỗ thứ sáu — tìm ra lúc đẩy, sau chữ ký Cổng 2 (hợp đồng mở lại 07/10, AC-15)

Git chạy hook pre-push với `GIT_DIR` trỏ vào kho thật. Bộ test điều phối gọi `git init`, `git commit`,
`git worktree add` trong thư mục tạm; trong môi trường hook chúng nhắm vào kho thật. Với gitdir của worktree
liên kết, `git init` ghi `core.bare=true` vào `.git/config` chung (sự cố 09:25 ngày 07/10, xảy ra ở lượt
tham chiếu của checker `node-test`). Vá ở hai cửa vào, không vá trong từng test:

- `.githooks/pre-push` gỡ mọi biến cục bộ của git (`unset $(git rev-parse --local-env-vars)`) ngay sau khi
  lấy `ROOT`, nên mọi lệnh của cổng chạy như ở dòng lệnh thường;
- `runReference` của checker chạy `node --test` với môi trường đã lọc bỏ biến `GIT_*`.

Đo bằng `rang/git-sach.mjs`: kho nháp có worktree liên kết, chạy tệp pre-push thật với `bun` giả và lượt tham
chiếu thật, khẳng định kho nháp không đổi; bản sao bỏ bước gỡ biến thì kho nháp bị đổi.

## 2. Quyết định thiết kế

- **Danh tính thay vì tên tệp (lỗ 1).** Đổi đuôi so khớp từ `acceptance-verify.js` sang tiền tố vẫn
  để lọt bản chép đặt tên khác (`s4-r3.js`). Đọc `meta.name` trong 64 KiB đầu của tệp là cách duy
  nhất không phụ thuộc thói đặt tên của kho. Tên `acceptance-verify` là tên workflow của kit, không
  phải thứ riêng của crm. Không đọc được tệp mà tên không khớp → không phải S4 (Workflow sẽ tự lỗi vì
  tệp vắng). Gọi Workflow chỉ bằng `resumeFromRunId` không cho biết danh tính → ngoài phạm vi.
- **Kiểm hình dạng tay, không Zod.** `scripts/dieu-phoi/` không có gói và sẽ chuyển vào kit; mọi
  kiểm khác ở đó (`kiemDon`, `kiemYeuCau`) đã viết tay. Luật «parse ở biên» vẫn giữ: mỗi tệp đọc
  đúng một lần qua một hàm, người dùng phía sau nhận dữ liệu đã kiểm.
- **Đóng với khoá lạ.** Hai tệp do người gõ tay; lỗi gõ tên khoá tuỳ chọn (`tick_giay`) không có
  cách nào khác để lộ. Thêm trường cho 1b thì sửa luôn bộ kiểm.
- **Thất bại đóng.** Cấu hình sai → nhịp không làm gì ngoài báo; hook chặn S4 thấy cấu hình sai thì
  chặn lệnh S4 (đã là luật AC-5 cũ), lệnh thường vẫn 0; hook chờ người thấy `hang-viec.json` sai thì
  im (nhịp đã báo giám sát).
- **`nhip_cu_phut` phải lớn hơn chu kỳ giữ nhịp.** Bộ kiểm cấu hình đòi `nhip_cu_phut` > `giuNhipMs`
  tính bằng phút, để lệnh bọc luôn chạm kịp trước khi nhịp bị coi là cũ.
- **Ép bằng hook thay vì dặn trong LUAT.** Dặn suông là đúng thứ đã hỏng ngày 04/10. Hook chỉ chặn
  lệnh nền của phiên ĐANG giữ khoá, nên không thêm ma sát cho ai khác.
- **Gia hạn theo yêu cầu là cộng dồn có chặn.** Lấy `max(hạn cũ, bây giờ)` làm gốc: thợ xin «thêm 30′»
  được 30′ tính từ hạn còn lại, không mất phần hạn đang có. Chặn hai lần bằng `gia_han_theo` trong
  chính `chu.json` (không phải `trang-thai.json`, vốn có thể bị xoá), chặn áp nhầm lượt sau bằng
  `luc ≥ cap_luc`.
- **Checker `node-test` theo khuôn oxlint.** Cổng in một dòng tổng kết; bộ kiểm so với một lượt tham
  chiếu nó tự chạy (≈0,3 giây). Thu hẹp glob trong `package.json` làm số ca của cổng nhỏ hơn tham
  chiếu → bộ kiểm cắn.

## 3. Giữ nguyên

- Mọi mốc đột biến của bộ cũ `_acceptance/dieu-phoi-hai-tang/rang/dot-bien.mjs` còn đúng một lần;
  bộ cũ vẫn thoát 0 trên cây mới. Tên mọi ca test cũ giữ nguyên (hồ sơ cũ ghim theo tên).
- Fixture cũ ghi `dieu-phoi.config.json` là `{}` cho ca KHÔNG cố ý kiểm cấu hình hỏng được sửa thành
  cấu hình đúng hình dạng (AGENTS.md: fixture thiếu trường bắt buộc là dữ liệu không thể tồn tại).
- Thứ tự một nhịp đổi thành: yêu cầu → (mới) áp gia hạn → khoá → cấp → hàng kế → bảng. Lý do: áp
  gia hạn sau bước khoá thì hạn cũ luôn còn (khoá hết hạn đã bị tự gia hạn hoặc thu hồi trước đó),
  nên vế «hạn cũ đã qua thì gốc là giờ nhịp» không bao giờ xảy ra; áp trước thì một lời gia hạn đã
  duyệt cứu được khoá trước khi máy xét thu hồi (sổ quyết định, dòng S3 cùng ngày).
- Hạn chế đã biết của vòng trước (Ngoài-2 realpath, Ngoài-4 ba chỗ khai loại…) giữ nguyên là hạn chế.

## 4. Đo

Mỗi luật mới có ca hai chiều trên cùng fixture, và một đột biến trong bộ đột biến mới
`_acceptance/dieu-phoi-va-bien/rang/dot-bien.mjs` (cùng khuôn với bộ cũ) làm đúng ca ghim đỏ. Phần cổng
(lỗ 3) đo bằng răng `_acceptance/dieu-phoi-va-bien/rang/cong.mjs`: chạy checker `node-test` của
`verify-gate-shape.mjs` trên log mẫu (lành / thiếu mục / ít ca / có ca đỏ) và đọc pre-push, `package.json`,
`acceptance.yml` theo quan hệ (lệnh trong vòng pre-push gọi đúng script; glob của script phủ mọi tệp
test; job CI gọi đúng script).
