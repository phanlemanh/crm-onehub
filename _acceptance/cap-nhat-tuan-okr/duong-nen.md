---
slug: cap-nhat-tuan-okr
at: 2026-09-25T14:37:01.761Z
sha: 58b316ac6fcbf3b62f27ee888ac32a01899dd444
nen: do
cong_cu: do
suite: do
luoi: xanh
engine: xanh
---

## Dòng đỏ

- nen cong-cu: THIEU merge-base (khoa executors.script.zqw_giu_nqz)
- nen cong-cu: THIEU merge-base (khoa executors.script.nzm_giu_da_ky)
- nen suite: DO SAN executors.script.build_khong_cache ma 1

## Lượt nền thứ hai, 2026-09-25 (theo điều phối: PATH Node 24 export trước khi gọi script)

Lệnh: `export PATH=/Users/manhphan/.local/share/fnm/node-versions/v24.15.0/installation/bin:$PATH` rồi `node duong-nen.mjs --root . --slug cap-nhat-tuan-okr --base origin/onehub`, tại `58b316ac`. Kết quả thật: vẫn đỏ ở cùng dòng build — `agent:build: eve requires Node.js >=24. You are running v22.18.0.`, `Failed: agent#build`, 2/4 task. Nguyên nhân đo được: script chạy mỗi lệnh suite qua `bash -lc` (shell đăng nhập); shell đăng nhập đọc lại hồ sơ của máy và đặt `/usr/local/bin` lên trước, nên `bash -lc 'node --version'` trả `v22.18.0` (`/usr/local/bin/node`) dù PATH của tiến trình cha đã có Node 24. Export PATH không tới được tiến trình con — không gỡ được từ phía người gọi.

Cách gỡ giữ nguyên: build chạy tay với tiền tố Node 24 xanh 4/4 (23,4 s, lượt đầu ở trên); làn S4 đặt cùng tiền tố. `test`, `lint`, `lint:slop` xanh cả hai lượt; lưới trước-merge 0 vi phạm; engine khớp.

Known limits của đường nền (theo điều phối 2026-09-25):

- `THIEU merge-base` ở hai khoá `zqw_giu_nqz`, `nzm_giu_da_ky` là báo giả của bộ kit (đầu lệnh `B=$(git merge-base …)` bị đọc thành tên chương trình).
- `CAY BAN SAU SUITE …/opportunity.md` ở lượt đầu là báo giả: tệp do phiên viết trong lúc suite chạy; lượt thứ hai chạy trên cây sạch không còn dòng này.
