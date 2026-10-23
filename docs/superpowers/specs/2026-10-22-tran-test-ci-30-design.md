# Thiết kế — tran-test-ci-30: nâng trần job test của CI từ 20 lên 30 phút

Việc phụ F-129 của đợt `viec-du-an-kho-tai-lieu` (dãy V2), Điều phối M5 giao 22/10. Không có ô Cổng Đáng,
không mã lộ trình.

## Vấn đề

Job `test` của `.github/workflows/ci.yml` chạy ma trận ba ô (`api`, `app-ui`, `con-lai`) chung một trần
`timeout-minutes: 20`. Ô `test (api)` đã sát trần: lượt chậm bị GitHub cắt dù bài không hỏng, PR phải chạy lại.

Số đo M5 khi giao việc, 40 lượt gần nhất của `test (api)`: 15 lượt xanh 10–19′, trong đó 7 lượt 17–19′; 6 lượt bị cắt ở
trần 20′ hoặc sát trần; ô `app-ui` chạy khoảng 18′.

Số đo lại 22/10 bằng `gh api` (40 lượt CI gần nhất, 21/10 11:15 tới 22/10 12:05 UTC), chia thành các nhóm rời nhau:

| Ô | Xanh | Bị huỷ ở trần | Đỏ | Huỷ vì lượt mới đè lên | Cộng |
| --- | --- | --- | --- | --- | --- |
| `test (api)` | 33 — trung vị 17,0′, chậm nhất 19,8′, 16 lượt từ 17′ | 2 — cùng 20,3′ | 2 — 18,1′ và 20,0′ | 3 | 40 |
| `test (app-ui)` | 37 — trung vị 18,4′, chậm nhất 19,9′, 26 lượt từ 17′ | 0 | 0 | 3 | 40 |
| `test (con-lai)` | 40 — trung vị 9,2′, chậm nhất 11,9′ | 0 | 0 | 0 | 40 |
| `check` (đối chiếu) | 21 — trung vị 4,0′, chậm nhất 6,6′ | 0 | 1 | 5 | 27 (13 lượt còn lại nhảy qua vì PR nháp) |

Ô `app-ui` sát trần hơn ô `api`: hai ô cùng hưởng trần mới.

## Lựa chọn

Đổi đúng một dòng: `timeout-minutes` của job `test` từ 20 thành 30. Không đổi job nào khác, không đổi ma trận.

- Lượt xanh không tốn thêm phút máy nào: trần chỉ là chỗ cắt, không phải thời gian chờ.
- Chỉ lượt treo thật mới tốn thêm, tối đa 10′.
- Không tách ô `api` lúc này: mỗi ô mới tốn khoảng 3′ cài đặt (checkout, `bun install`, Postgres, `db:deploy`) cho
  MỌI lượt chạy. Hạt giống `docs/plan/2026-10-22-hat-giong-tach-o-api.md` ghi điều kiện mở lại.
- Trần job `check` (20′), `phan-loai` (5′), `ci-ok` (5′) giữ nguyên.

Việc này đảo một ngưỡng cũ. `docs/plan/ci-tach-job.md` (hồ sơ F21) đặt ngưỡng «Kho ta bỏ được bản vá
`timeout-minutes: 30`, quay về đúng trần 20′ của hãng», và ma trận ba ô đã đạt nó. Từ đó `test (api)` dài ra theo các
tính năng OneHub, nên trần 30′ quay lại, lần này ở job `test` thay vì job `check`. Đây là lựa chọn chỉ người quyết
được (sổ quyết định, dòng S1 đầu tiên); máy khuyên nâng trần theo số đo của M5.

`ci.yml` do OneHub giữ (luật 47, `CLAUDE.md`). Tệp dùng chung cho ba máy, nên trước khi đẩy, giám sát đăng
`cham-tep` trên #375.

## Eval cũ bị thay

Đổi trần làm đỏ đúng một eval đang sống của hồ sơ đã ký: `giam-phut-ci-nhap-t1/E3`. Eval đó so từng khoá của job
`test` với `ci.yml` ở sha ghim `27d47de0`, kể cả `timeout-minutes`. Đã đo 22/10 trên cây nền `05e3f774`: thoát 0
(«dat 19 o»); trên cây đã đổi trần: thoát 1, đúng một dòng `sai test.con-lai: khac ban ghim o timeout-minutes`.

«Ô» ở đây là một mục kiểm của `rang/hinh.mjs`, không phải ô ma trận. Hàm `kiemNang` của nó kiểm `needs` và `if` của
job `check` và `test` thành hai mục riêng, rồi gom mọi khoá còn lại của job (`name`, `runs-on`, `timeout-minutes`,
`strategy`, `services`, `env`, `steps`) vào một mục `<job>.con-lai`. `timeout-minutes` là khoá cấp job, chung cho ba
ô ma trận, nên nó chỉ làm đỏ đúng mục `test.con-lai`.

| Eval cũ | Tiêu chí thay sẵn | Vì sao |
| --- | --- | --- |
| giam-phut-ci-nhap-t1/E3 | tran-test-ci-30#AC-2 | AC-2 chạy lại chính răng của E3 và đòi nó chỉ sai đúng ô `timeout-minutes`, mọi ô khác đạt, mọi ca đột biến bị bắt |

Vòng này KHÔNG khai E3 là thay bởi (Cổng Phạm vi duyệt lại 22/10, lối A). Lượt chấm 1 cho thấy khai sẵn làm gãy con
trỏ đã ký `ci-ma-tran-ba-o/E3 → giam-phut-ci-nhap-t1#AC-3` (AC-3 của hồ sơ ấy chỉ có E3), và sửa `evals.yaml` của
`giam-phut-ci-nhap-t1` kéo hồ sơ ấy vào lưới trước gộp với bằng chứng đã cũ. AC-2 là đích sẵn sàng: ở lượt ghim lại kế
của `giam-phut-ci-nhap-t1`, E3 đỏ thì khai `superseded_by: tran-test-ci-30#AC-2` (hồ sơ này có chữ ký người), và nối
lại con trỏ của `ci-ma-tran-ba-o/E3` cùng lượt.

Các eval khác đọc `ci.yml`: 18 eval đang sống của hồ sơ khác có `paths` khớp `.github/workflows/ci.yml` theo glob (kể
cả `.github/**` và `**`, đếm 22/10). Vòng này không chạy lại chúng trên hai cây: giám sát đợt chốt phép đo tương xứng
một dòng đổi, và lượt thử đo được một eval (`chuyen-goi-dieu-phoi/E10`) mất 1213 giây. Chốt thay: AC-2 cho eval duy nhất
so trần job `test` với bản ghim, lượt CI GitHub thật trên PR xanh trọn trước gộp, và lượt ghim lại riêng của từng hồ
sơ. Lượt thử cũng thấy `chuyen-goi-dieu-phoi/E1` đỏ trên cây vì `apps/agent/test/mau/lo-trinh-kit.html`, không vì
`ci.yml`; `giam-phut-ci-nhap-t1/E2` (`rang/mot-nguon.mjs`) đỏ sẵn trên nền `05e3f774` với «lech pre-merge» ở các tệp T1.

## Đo

Răng `_acceptance/tran-test-ci-30/rang/kiem.mjs`, mỗi chế độ có ca đột biến cùng lượt. Nền không ghim sha: răng tìm
trong lịch sử `ci.yml` commit đổi trần job `test` từ 20 thành 30, và lấy cha của nó làm nền. Lịch sử đã có thì không
đổi, nên phép đo vẫn đúng sau khi gộp và sau khi `onehub` đi tiếp; cây đang sửa chưa commit thì nền là `HEAD`.

- `mot-khoa`: so `ci.yml` ở nền và ở commit đổi trần bằng `Bun.YAML` — lệch đúng `jobs.test.timeout-minutes`, 20 → 30;
  so từng dòng — khác đúng một dòng; và `ci.yml` của cây hiện tại còn trần 30.
- `e3-cu`: bung `ci.yml` và `rang/` của `giam-phut-ci-nhap-t1` ở nền ra một thư mục tạm (`git archive`), chạy
  `rang/hinh.mjs ci` thật trên nền và trên cây. Đòi quan hệ: cùng một tập mục kiểm; nền đạt hết; cây chỉ khác nền ở mục
  `test.con-lai` với lý do `timeout-minutes`; cùng một tập ca đột biến bị bắt.

Chiều đỏ trên vật thật: cây nền (trần 20, lịch sử chưa có commit đổi) cho `mot-khoa` mã 1 với «sai khong tim thay
commit doi tran job test tu 20 len 30 trong lich su ci.yml».
