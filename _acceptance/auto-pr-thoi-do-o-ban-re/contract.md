---
schema_version: 1
feature: Khoá workflow auto-pr về kho hãng — ở bản rẽ nó chết hai lần mỗi lượt đẩy và bôi đỏ mọi commit
slug: auto-pr-thoi-do-o-ban-re
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: []
status: draft
approved_by:
approved_at:
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

### AC-1 — Ở kho này, job không chạy

**Given** một commit của bản vá đã đẩy lên `phanlemanh/crm-onehub`
**When** chân đọc check-runs của commit đó qua `gh api`
**Then** check-run `Open a pull request into main` kết luận `skipped`.
**Đỏ khi** kết luận là `failure` (hoặc bất cứ gì khác `skipped`) — nêu đúng commit rút
gọn và kết luận đọc được.
**Mã 2 khi** commit chưa đẩy, chưa chạy xong, hoặc `gh` chưa đăng nhập — không đo được
thì không được xanh.

Chiều đỏ tái lập được và đã chạy: cùng chân, cùng kho, `--sha 5ac85ef` (đầu `onehub`
trước bản vá) trả `failure`. Đây là chân duy nhất đo hành vi thật; ba chân còn lại đo
hình dạng.

### AC-2 — Khoá là một điều kiện duy nhất, trỏ đúng kho hãng

**Given** tệp `.github/workflows/auto-pr.yml`
**When** chân đọc thân job `open`
**Then** job có **đúng một** dòng `if`, nội dung đúng bằng
`github.repository == 'trycompai/crm'`; **và** kho tại chỗ (suy từ `git remote get-url
origin`) khác chuỗi đó.
**Đỏ khi** vắng dòng `if` · có nhiều hơn một `if` · điều kiện khác chuỗi mong đợi · kho
tại chỗ bằng đúng kho hãng (khi đó khoá không loại trừ gì) — nêu đúng vế sai.
**Mã 2 khi** không đọc được tệp.

Vế "đúng một `if`" không phải cầu kỳ: hai điều kiện chồng nhau thì không đọc được bằng
mắt job chạy ở đâu, và đó chính là thứ vòng này đang sửa.

Vế "kho tại chỗ khác kho hãng" là chỗ chân tự chặn một màu xanh dối: nếu ai đó chạy
chân này *trong* kho hãng, kết luận "job không chạy" là sai, và chân phải đỏ chứ không
được xanh theo quán tính.

### AC-3 — Lệch bản hãng đúng một dòng

**Given** `origin/release` — bản gương của hãng trong kho, đã đối chiếu khớp từng dòng
với `upstream/HEAD` cho tệp này
**When** chân chạy `git diff --numstat` cho riêng `.github/workflows/auto-pr.yml`
**Then** kết quả đúng `+1 / −0`.
**Đỏ khi** không lệch dòng nào (bản vá chưa có mặt) hoặc lệch nhiều hơn +1/−0 — nêu con
số đọc được.
**Mã 2 khi** không giải được ref nền.

Mỗi dòng lệch thêm là một mối xung đột phải xử khi kéo bản mới của hãng về. Tiêu chí này
là cách giữ lời hứa "chọn khoá thay vì xoá" thành một con số, không phải một ý định.

### AC-4 — Vòng này chỉ chạm đúng một tệp dưới `.github/`

**Given** nền so là `origin/onehub`
**When** chân liệt kê tệp đổi dưới `.github/`
**Then** đúng một tệp, và là `.github/workflows/auto-pr.yml`.
**Đỏ khi** số tệp khác 1, hoặc tệp không phải tệp đó — liệt kê tên đọc được.
**Mã 2 khi** không giải được ref nền.

`pr-base.yml` mang đúng bệnh nhưng đang ngủ (không ai PR vào `release` ở bản rẽ). Nó
nằm ngoài phạm vi vòng này, và AC-4 là chân giữ cho nó ở ngoài thật.

### AC-5 — Bốn lệnh chứng của kho vẫn xanh

**Given** cây có bản vá
**When** chạy `bun run test`, `check-types --force`, `lint --force`, `lint:slop`
**Then** cả bốn mã 0.
**Đỏ khi** bất kỳ lệnh nào khác 0.

Bản vá không chạm mã nguồn, nên tiêu chí này là lưới chống tác dụng phụ ngoài dự đoán,
không phải phép đo lời hứa chính.

## Coverage

Quét theo bốn trục. Ô Core là ô vòng này phải phủ; ô Later/Never ghi ở `Out of scope`.

| Trục | Giá trị |
| --- | --- |
| A — kho chạy | bản rẽ (`phanlemanh/crm-onehub`) · **kho hãng (`trycompai/crm`)** |
| B — hình dạng khoá | vắng `if` · đúng một `if` trỏ kho hãng · `if` trỏ nhầm kho này · nhiều `if` |
| C — bề mặt lệch | `auto-pr.yml` · workflow khác dưới `.github/` · ngoài `.github/` |
| D — chiều đo | tĩnh (đọc tệp/diff) · động (check-run thật) |

**Thước CE — 11/12 ô Core được phủ.** A×D: (bản rẽ, động) phủ bởi AC-1; (bản rẽ, tĩnh)
phủ bởi AC-2. **(kho hãng, động) KHÔNG phủ được** — bản rẽ không có quyền đẩy lên kho
hãng; đây là giới hạn đã khai ở design doc, không phải ô bị quên. B: cả bốn giá trị phủ
bởi AC-2 và hai chiều đỏ đã chạy. C: cả ba phủ bởi AC-3 + AC-4.

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
