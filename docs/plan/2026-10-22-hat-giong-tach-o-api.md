# Hạt giống — Tách ô `test (api)` của CI khi trung vị vượt 22 phút

Gốc: `_acceptance/tran-test-ci-30/` (F-129, 22/10), nâng trần job `test` của `.github/workflows/ci.yml` từ 20 lên 30
phút thay vì tách ô.

Mở lại khi: trung vị thời gian các lượt xanh của job `test (api)` lớn hơn 22 phút.

Vì sao chưa tách: mỗi ô ma trận mới tốn khoảng 3 phút cài đặt (checkout, `bun install`, Postgres, `db:deploy`) cho mọi
lượt chạy, kể cả lượt xanh. Nâng trần thì lượt xanh không tốn thêm phút nào; chỉ lượt treo thật tốn thêm tối đa 10 phút.
Khi trung vị đã quá 22 phút, ô `api` một mình chiếm gần hết trần mới và lượt chậm lại chạm trần, nên tách mới đáng.

Số đo lúc gieo (M5, 40 lượt gần nhất của `test (api)`): 15 lượt xanh 10–19 phút, trong đó 7 lượt 17–19 phút; 6 lượt bị
cắt ở trần 20 phút hoặc sát trần. Ô `app-ui` chạy khoảng 18 phút.

Hướng: tách `apps/api/test` thành hai ô theo nhóm tệp, giữ `--concurrency=1` trong mỗi ô (`CONTRIBUTING.md`), và
sửa các eval chụp hình ma trận (`giam-phut-ci-nhap-t1`, `tran-test-ci-30`) cùng lượt.
