# Thiết kế — thuoc-7-ngay-loc-pr

## Bài toán

`_acceptance/ci-ma-tran-ba-o/rang/do-7-ngay.mjs` là thước của ngưỡng 7 ngày của F21: «job dài nhất của lượt xanh có trung vị
≤ 15′ trên ≥ 10 lượt; 0 lượt huỷ vì trần». Hôm nay thước đọc 0 lượt và thoát 0 (opportunity.md, bảng đo S0). Vòng này viết lại
thước tại chỗ, để đúng dòng lệnh Đường đo đã ký của F21 — `node _acceptance/ci-ma-tran-ba-o/rang/do-7-ngay.mjs --nhanh onehub`
— chạy ra số thật vào ngày đo (khoảng 2026-10-16).

## Sự thật đã đo (09/10, kho `phanlemanh/crm-onehub`)

1. `ci.yml` chạy ở `pull_request` và ở `push` lên `main`/`release`. Lượt của PR vào `onehub` chỉ có sự kiện `pull_request`.
2. Trường `pull_requests` của một lượt chạy chỉ liệt PR còn mở: 6 lượt từ 05:42Z có 2 lượt của #335 (mở) mang số PR, 4 lượt
   của #332/#333/#334 (đã gộp) mang mảng rỗng. `GET /repos/{r}/commits/{head_sha}/pulls` trả cả PR đã gộp kèm `base.ref` và
   `head.ref`. PR đóng mà không gộp (#323, `thu/ci-tach-job`) thì không trả gì.
3. Mỗi job huỷ có annotation do GitHub ghi: «The job has exceeded the maximum execution time of 30m0s» khi chạm
   `timeout-minutes`, «Canceling since a higher priority waiting request for ci-CI-<n> exists» khi lượt mới đè (luật
   `concurrency … cancel-in-progress` của `ci.yml`). 30 lượt huỷ gần nhất chia đúng hai lớp này (5 và 25).
4. `GET /actions/runs/{id}/jobs` mặc định chỉ trả job của lần chạy mới nhất; `filter=all` trả mọi lần. Lượt 37841386976 (08/10,
   `feat/trang-lo-trinh-trong-crm`) có lần 1 huỷ vì trần và lần 2 xanh — mặc định thì lần huỷ biến mất.
5. Lượt `pull_request` chạy `ci.yml` của ref gộp (`refs/pull/<n>/merge`), không phải của `head_sha`, nên thước cũ đọc trần ở
   `head_sha` là đọc nhầm tệp. Điều 3 làm cho việc đọc trần thành thừa.

## Cách làm

Một tệp, hai phần: các hàm thuần được xuất ra (phân loại, gắn PR, tổng hợp, kết luận, cửa sổ) và phần chạy chỉ thi hành khi
tệp là lệnh chính (so `realpath` của `process.argv[1]` với tệp — khuôn `scripts/kiem-cheo/tep-chinh.mjs`, chạy được dưới `node`
và `bun`). Không đọc YAML, không `Bun.*`.

Luồng:

1. **Cửa sổ.** `--tu`/`--den` (ISO) nếu có. Vắng `--tu`: giờ commit của commit gộp cuối trên dòng cha-đầu của
   `origin/<nhánh>` đã đổi `.github/workflows/ci.yml` (`git log -1 --first-parent --format=%cI origin/<nhánh> -- …`) — với
   `onehub` hôm nay là commit gộp #331, 2026-10-09T05:42:52Z. Vắng `--den`: `--tu` + 7 ngày. Cửa sổ chưa đóng khi `--den` sau
   giờ chạy.
2. **Lượt.** `gh api --paginate repos/<r>/actions/runs?event=pull_request&created=<tu>..<den>`, giữ `path ==
   .github/workflows/ci.yml`.
3. **Gắn PR.** Mỗi lượt gọi `commits/<head_sha>/pulls`, lấy PR có `head.ref == head_branch`. Vào mẫu khi `base.ref ==
   --nhanh`. Còn lại đếm vào «base khác» hoặc «không gắn được PR» và in ra.
4. **Job.** `actions/runs/<id>/jobs?filter=all` (phân trang). Job huỷ: đọc annotation `check-runs/<job id>/annotations`, xếp
   vào `tran` · `de` · `tay` theo ba câu GitHub. Một job huỷ có annotation ngoài ba lớp, hoặc không có annotation, là lỗi mã 2
   gọi tên lượt, job và câu — không xếp đoán.
5. **Lượt xanh** = job `ci-ok` của lần chạy cuối có kết luận `success`. **Job dài nhất** = max(`completed_at − started_at`)
   trên các job của lần chạy cuối. Lượt không có job `ci-ok` đếm vào «không mang hình ma trận».
6. **Kết luận.** Cửa sổ đã đóng và ≥ 10 lượt xanh: SỐNG khi trung vị ≤ 15′ và 0 huỷ vì trần; CHẾT khi trung vị > 20′ hoặc ≥ 1
   huỷ vì trần; còn lại «giữa hai ngưỡng». Mã 0. Cửa sổ chưa đóng hoặc < 10 lượt xanh: in số tạm, không kết luận, mã 3. Một dòng
   nhắc điều kiện CHẾT thứ ba của F21 («một gói có test không chạy ở ô nào») do `cmtb_phu_goi` đo, thước này không đo.
7. **Lỗi đọc.** `gh` thoát khác 0, JSON hỏng, tham số sai → mã 2, in lệnh `gh` hỏng, không in dòng kết luận.

Mã thoát: 0 có kết luận · 2 không đo được · 3 chưa đủ để kết luận.

`--nhanh` đổi nghĩa từ «branch của lượt» sang «base của PR». Dòng Đường đo của F21 (`--nhanh onehub`) đúng ngay với nghĩa mới;
dòng `cmtb_do_7_ngay` của `config.yaml` (`--nhanh thu/ci-tach-job`) không còn eval nào gọi.

## Nối với F21

E5 của `ci-ma-tran-ba-o` (đo hành vi cũ) chuyển `status: not-run` + `superseded_by: thuoc-7-ngay-loc-pr#AC-4`. Bộ kit nhận con
trỏ khi hồ sơ này đã ký và hợp đồng của nó nêu thẻ `ci-ma-tran-ba-o/E5` — cùng cách F9 đã thay E11 của `tra-loi-tin-nhac`.
Trước khi ký, lưới trước-merge sẽ báo E5 xung đột; không gộp trước chữ ký.

## Thử

- Bài kiểm đơn vị (`node --test`) trên JSON thật đã chụp từ GitHub (`rang/mau/`), mỗi luật một cặp xanh/đỏ cùng mẫu.
- Cửa sổ cũ cố định 2026-10-08T16:00Z → 2026-10-09T04:00Z trên GitHub thật, số đã tính bằng đường độc lập ở S0: 20 lượt, 18 vào
  mẫu, 2 không gắn được PR (`thu/ci-tach-job`), 3 huỷ vì trần (gồm lần 1 của 37841386976), 2 bị đè, 0 lượt xanh, 18 lượt không
  mang hình ma trận.
- Cửa sổ mặc định trên GitHub thật hôm nay: bắt đầu 2026-10-09T05:42:52Z, chưa đóng, mã 3.
- `gh` giả trên `PATH` cho ba ca lỗi.
- Cửa sổ rộng hơn 100 lượt để chứng phân trang.

## Đặc tả UX

Không áp: thước dòng lệnh cho người ký Cổng Giá trị, không có màn.
