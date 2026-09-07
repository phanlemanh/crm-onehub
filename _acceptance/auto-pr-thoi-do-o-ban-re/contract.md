---
schema_version: 1
feature: Khoá workflow auto-pr về kho hãng — ở bản rẽ nó chết hai lần mỗi lượt đẩy và bôi đỏ mọi commit
slug: auto-pr-thoi-do-o-ban-re
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: []
status: implemented
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-07T01:50:06Z
design_doc: docs/superpowers/specs/2026-09-07-auto-pr-thoi-do-o-ban-re-design.md
---

# Acceptance Contract: auto-pr-thoi-do-o-ban-re

## Bối cảnh

`.github/workflows/auto-pr.yml` mở PR vào `main`. Bản rẽ không có `main`, và
`AUTOMATION_TOKEN` chưa đặt — nên workflow chết hai lần mỗi lượt đẩy, trên mọi nhánh.
Chưa xanh lần nào kể từ khi rẽ. Hậu quả là màu đỏ mất nghĩa: mọi commit đỏ sẵn thì một
màu đỏ thật sẽ trôi qua không ai thấy. Chi tiết ở design doc.

Bản vá là một dòng `if` ở tầng job. Đường xoá tệp đã cân nhắc và loại — tệp đang y
nguyên bản hãng, xoá là mua một xung đột delete/modify vĩnh viễn mỗi lần kéo bản mới.

## Acceptance Criteria

### AC-1 — Ở kho này, job không chạy — đo trên chính commit mang bản vá

**Given** commit `c042478` đã đẩy lên `phanlemanh/crm-onehub`
**When** chân đọc check-runs của commit đó qua `gh api`
**Then** check-run `Open a pull request into main` kết luận `skipped`; **và** `c042478`
là tổ tiên của `HEAD`; **và** `.github/workflows/auto-pr.yml` tại `c042478` bằng đúng
bản trên cây hiện tại.
**Đỏ khi** kết luận khác `skipped` · commit không phải tổ tiên của `HEAD` · tệp
workflow đã đổi kể từ đó — nêu đúng vế sai.
**Mã 2 khi** commit chưa đẩy, chưa chạy xong, hoặc `gh` chưa đăng nhập.

Mốc xanh **ghim cứng** chứ không lấy `HEAD`, đối xứng với mốc đỏ. Lý do: `HEAD` là mốc
di động — ở vòng chấm nó là commit hồ sơ vừa tạo, chưa đẩy và chưa chạy xong, nên chân
sẽ trả mã 2 và chặn cổng vì một lý do không liên quan đến bản vá. Hai vế đối chiếu
(tổ tiên + tệp không đổi) là thứ giữ cho một số đo ghim cứng vẫn nói về cây đang merge,
chứ không thành một con số chết.

Chiều đỏ tái lập được và đã chạy: cùng chân, cùng kho, `--sha 5ac85ef` (đầu `onehub`
trước bản vá) trả `failure`. Đây là chân duy nhất đo hành vi thật; ba chân còn lại đo
hình dạng.

### AC-2 — Khoá là một điều kiện duy nhất, trỏ đúng kho hãng

**Given** tệp `.github/workflows/auto-pr.yml`
**When** chân đọc thân job `open`, và rút `owner/repo` **từ** URL của remote `origin`
(không so nguyên URL với slug)
**Then** job có **đúng một** dòng `if`, nội dung đúng bằng
`github.repository == 'trycompai/crm'`; **và** slug rút được khác chuỗi đó.
**Đỏ khi** vắng dòng `if` · **có nhiều hơn một `if`** (in ra tất cả các dòng đọc được)
· điều kiện khác chuỗi mong đợi · slug rút được bằng đúng kho hãng.
**Mã 2 khi** không đọc được tệp, hoặc không rút được `owner/repo` từ remote.

Trục B có **bốn** hình dạng, và cả bốn phải có một lượt chạy — không phải một lượt xanh
rồi suy ra ba lượt kia. Bốn lượt đã chạy ngày 07/09.

Vế "nhiều `if`" không phải cầu kỳ: một lượt kéo bản mới của hãng về hoàn toàn có thể
thêm một `if` thứ hai ở tầng job. Khi đó điều kiện chồng nhau và không ai đọc được bằng
mắt job chạy ở đâu — đúng thứ AC này tự nhận là chặn.

Vế "slug khác kho hãng" là chỗ chân tự chặn một màu xanh dối: chạy chân này *trong* kho
hãng thì kết luận "job không chạy" là sai, và chân phải đỏ. Vế này là một assertion âm
tính, nên nó có chiều đỏ riêng — bơm remote giả `https://github.com/trycompai/crm.git`
qua `--remote`; đã chạy, mã 1. Không có lượt ấy thì vế này có thể là một hằng đúng mà
không ai biết.

### AC-3 — Lệch bản hãng đúng một dòng, và dòng ấy đúng là dòng khoá

**Given** `origin/release` — bản gương của hãng trong kho
**When** chân đọc `git diff -U0` cho riêng `.github/workflows/auto-pr.yml`
**Then** đúng một dòng thêm, không dòng nào bớt; **và** dòng thêm bằng đúng
`    if: github.repository == 'trycompai/crm'` — kể cả **bốn dấu cách** đầu dòng, vì
bốn dấu cách mới là tầng job; **và** khi `upstream/HEAD` giải được ở máy đang chạy, kết
quả so với nó cũng đúng như vậy.
**Đỏ khi** không lệch dòng nào · lệch khác +1/−0 · dòng thêm khác nội dung mong đợi ·
`origin/release` không còn gương đúng bản hãng — in ra dòng đọc được.
**Mã 2 khi** không giải được ref nền.

Đếm dòng là **đo con số** trong khi lời hứa là **quan hệ**: một dòng trống, một dòng
`env`, hay một `if` đặt nhầm ở tầng step đều cho +1/−0. Nên tiêu chí này khẳng định nội
dung và độ thụt, không chỉ số lượng. Chiều đỏ đã chạy: thay dòng khoá bằng một dòng
trống thì chân đỏ và in ra dòng đọc được.

Vế đối chiếu `upstream/HEAD` biến tiền đề "`origin/release` khớp bản hãng" từ một câu
văn xuôi thành một phép đo. Máy nào không có remote `upstream` thì chân nói rõ nó chỉ
đo trên nền `origin/release`, chứ không im lặng bỏ qua.

### AC-4 — Vòng này chỉ chạm những tệp đã ghim tên

**Given** nền so là `origin/onehub`, và danh sách cho phép ghim tên:
`.github/workflows/auto-pr.yml` · `_acceptance/config.yaml` ·
`_acceptance/auto-pr-thoi-do-o-ban-re/**` · design doc và bản kế hoạch của vòng
**When** chân liệt kê **toàn bộ** tệp đổi (không giới hạn dưới `.github/`)
**Then** mọi tệp nằm trong danh sách, và `auto-pr.yml` có mặt.
**Đỏ khi** có tệp ngoài danh sách (in tên) · không tệp nào đổi · `auto-pr.yml` vắng.
**Mã 2 khi** không giải được ref nền.

Bản đầu của tiêu chí này chỉ nhìn dưới `.github/`, nên một tệp sửa lây ở `packages/`
hay `.env.example` sẽ lọt qua trong khi Coverage khai đã phủ trục C. Nay chân nhìn toàn
bộ diff. Chiều đỏ đã chạy: đổi nền sang `origin/release` thì 897 tệp rơi ngoài danh
sách và chân in tên ra.

`pr-base.yml` mang đúng bệnh nhưng đang ngủ (không ai PR vào `release` ở bản rẽ). Nó
nằm ngoài phạm vi vòng này, và AC-4 là chân giữ cho nó ở ngoài thật.

### AC-5 — Bốn lệnh chứng của kho vẫn xanh

**Given** cây có bản vá
**When** chạy `bun run test`, `check-types --force`, `lint --force`, `lint:slop`
**Then** cả bốn mã 0.
**Đỏ khi** bất kỳ lệnh nào khác 0.

Bản vá không chạm mã nguồn, nên tiêu chí này là lưới chống tác dụng phụ ngoài dự đoán,
không phải phép đo lời hứa chính. `--force` bắt buộc: một màu xanh phát lại không phân
biệt được cây lành với thước chưa từng chạy.

## Coverage

Quét theo bốn trục. Ô Core là ô vòng này phải phủ; ô Later/Never ghi ở `Out of scope`.

| Trục | Giá trị |
| --- | --- |
| A — kho chạy | bản rẽ (`phanlemanh/crm-onehub`) · **kho hãng (`trycompai/crm`)** |
| B — hình dạng khoá | vắng `if` · đúng một `if` trỏ kho hãng · `if` trỏ nhầm kho này · nhiều `if` |
| C — bề mặt lệch | `auto-pr.yml` · workflow khác dưới `.github/` · ngoài `.github/` |
| D — chiều đo | tĩnh (đọc tệp/diff) · động (check-run thật) |

**Thước CE — 11/12 ô Core được phủ, mỗi ô bằng một lượt chạy có thật.**

- **A×D.** (bản rẽ, động) → AC-1, hai lượt: `c042478` xanh, `5ac85ef` đỏ. (bản rẽ,
  tĩnh) → AC-2. **(kho hãng, động) KHÔNG phủ được** — bản rẽ không có quyền đẩy lên kho
  hãng; giới hạn đã khai ở design doc, không phải ô bị quên. (kho hãng, tĩnh) → AC-2,
  lượt bơm remote giả.
- **B — bốn giá trị, bốn lượt.** đúng một `if` → lượt xanh; vắng `if` → đỏ 1; trỏ nhầm
  kho → đỏ 2; nhiều `if` → đỏ 3. Cả bốn đã chạy 07/09.
- **C — ba giá trị.** `auto-pr.yml` → AC-3. Workflow khác dưới `.github/` **và** tệp
  ngoài `.github/` → cùng do AC-4 phủ, vì chân nay quét toàn bộ diff theo danh sách
  ghim tên chứ không giới hạn thư mục.
- **D.** tĩnh → AC-2, AC-3, AC-4. động → AC-1.

## Out of scope

- **`pr-base.yml`** — cùng bệnh (`--base main`), nhưng chỉ kích hoạt khi có PR mở vào
  `release`, việc không xảy ra ở bản rẽ. Để nguyên; AC-4 giữ nó ở ngoài.
- **Đặt `AUTOMATION_TOKEN` và bật quyền mở PR cho Actions** — đường làm cho auto-pr chạy
  THẬT ở bản rẽ. Loại vì bản rẽ không muốn PR tự mở vào một nhánh nó không có.
- **Dựng một workflow auto-pr riêng nhắm `onehub`** — tính năng mới, không phải bản vá
  màu đỏ. Nếu muốn thì mở hồ sơ riêng.
- **Đo hành vi ở kho hãng** — cần quyền đẩy lên `trycompai/crm`. Xem Giới hạn đã biết.

## Notes

Chân `chay-that` phụ thuộc `gh` đã đăng nhập và commit đã đẩy. Chạy trong máy chưa
đăng nhập sẽ trả mã 2 (không đo được), không trả xanh.

Chân `lech-mot-dong` đo thêm trên `upstream/HEAD` khi remote ấy có ở máy đang chạy.
Trong CI của GitHub Actions remote đó không tồn tại, nên chân nói rõ nó chỉ đo trên
`origin/release`. Vế ấy là thêm chứ không phải thay.
