# dieu-phoi-truoc-mo-dot — design (hợp đồng nối tiếp của dieu-phoi-va-bien)

Gốc: Cổng 2 lượt 3 của `_acceptance/dieu-phoi-va-bien/` (ký 07/10, Phan Le Manh) — owner chọn «mở hợp đồng
mới» cho Ngoài-4 và Ngoài-5 (sổ `d-20261007T031925Z-21`); cộng một lỗ lộ ra lúc đẩy PR #291 (owner được báo,
đề xuất đưa vào hợp đồng nối tiếp). Cả ba phải gộp TRƯỚC khi «Mở đợt sau-14-10». Nhánh
`feat/dieu-phoi-truoc-mo-dot` rẽ từ `origin/onehub` @ `dc7b4f62` (#291 đã gộp).

## 1. Ba lỗ và cách vá

| # | Lỗ | Vá ở | Cách vá |
|---|---|---|---|
| 1 | `apGiaHan` đọc `tra-loi/<id>.json` bằng `docJson` thô; một tệp do giám sát gõ tay hỏng cú pháp làm `motNhip` ném ở mọi nhịp — không cấp, không thu hồi khoá, bảng không cập nhật | `phat-lich.mjs`, `hinh-dang.mjs` | Parse ở biên đúng như `xin/` và `yeu-cau/`: `kiemTraLoi` (đóng với khoá lạ) + `docTraLoi` cách ly tệp hỏng vào `tra-loi/hong/` kèm một sự kiện `tra-loi-hong` `can_phan` nêu tệp và lý do. Một tệp hỏng chỉ làm yêu cầu của nó coi như chưa trả lời; giám sát ghi lại là nhịp kế áp |
| 2 | `lenhBoc` coi `TZ=UTC node …` là «an toàn» (tập ký tự an toàn có `=`), gợi ý `giu-nhip.mjs -- TZ=UTC node …`; `giu-nhip` spawn không qua shell nên chạy chương trình tên `TZ=UTC` → ENOENT, thoát 127 | `hook-chan-s4.mjs` | Bỏ `=` khỏi tập an toàn: lệnh có `=` ở bất kỳ đâu đi đường `bash -c '<lệnh>'`. Chuẩn đo là QUAN HỆ: dòng lệnh bọc chạy ra cùng stdout và mã thoát như lệnh gốc chạy bằng `bash -c` |
| 3 | `core.hooksPath` của mọi worktree trỏ `.githooks` của checkout chính, nên cổng chạy pre-push của nhánh mà checkout chính đang đứng, trong khi `verify-gate-shape.mjs` và `gate-shape.json` lấy từ cây đang đẩy → «reported no test summary» khi hai bản lệch | `.githooks/pre-push` | Ngay sau nhánh `CRM_SKIP_HOOKS` và TRƯỚC khi đọc stdin: tính gốc cây đang đẩy; nếu cây có `.githooks/pre-push` và đó không phải chính tệp đang chạy (so `realpath`) thì `exec bash` tệp của cây với nguyên đối số và stdin. Tệp của cây tự nhận ra mình nên không lặp |

## 2. Quyết định thiết kế

- **Cách ly thay vì bỏ qua (lỗ 1).** Bỏ qua tệp hỏng im lặng thì giám sát tưởng đã duyệt; cách ly + `can_phan`
  là đúng khuôn đã có cho `xin/`, `yeu-cau/` (AC-12, AC-16 của `dieu-phoi-hai-tang`).
- **Đóng với khoá lạ ở `tra-loi`.** Tệp do người gõ tay; khoá máy ghi gồm `ket_qua, boi, ly_do, luc, voi,
  tai_nguyen` cộng `uoc_phut` giám sát được thêm. Khoá lạ = gõ nhầm tên → cách ly, nêu tên.
- **Lối thoát `bash -c` cho mọi lệnh không thuần (lỗ 2)** thay vì tách tiền tố biến ra `env`: một luật, phủ cả
  `cd … &&`, ống, nháy, biến.
- **Chuyển hook bằng `exec` ở đầu tệp (lỗ 3)** thay vì đổi `core.hooksPath` của từng worktree: cấu hình
  worktree do app tạo, sửa từng cái là việc tay; `exec` giữ nguyên stdin (danh sách ref) và mã thoát.
  Hiệu lực sau khi checkout chính có bản pre-push này; trước đó vẫn đẩy được bằng cách tạm trỏ
  `core.hooksPath` của worktree (bộ nhớ `dieu-phoi-va-bien-pr291`).

## 3. Giữ nguyên

- Mọi mốc đột biến của hai bộ đột biến trước (`dieu-phoi-hai-tang`, `dieu-phoi-va-bien`) và răng `git-sach`,
  `cong` của `dieu-phoi-va-bien` (dòng `unset $(git rev-parse --local-env-vars)`, vòng `for task in …`, dòng
  `echo … | tee -a "$LOG"`) còn nguyên; các bộ đó vẫn xanh trên cây mới.
- Thứ tự một nhịp không đổi.

## 4. Đo

- Lỗ 1: ca nhịp thật (`motNhip`) với một khoá khác cần cấp và một khoá hết hạn cần thu hồi cùng nhịp có tệp hỏng.
- Lỗ 2: ma trận bảy dạng lệnh chạy THẬT bằng bash — so stdout + mã thoát giữa lệnh gốc và dòng bọc.
- Lỗ 3: răng `rang/hook-cay.mjs` dựng kho nháp + worktree + kho trần, `git push` thật từ worktree với
  `core.hooksPath` trỏ checkout chính — dấu vết cho biết hook nào đã chạy; chiều đỏ trên bản sao bỏ `exec`.
- Bộ đột biến của vòng: `rang/dot-bien.mjs` (cùng khuôn hai vòng trước).
