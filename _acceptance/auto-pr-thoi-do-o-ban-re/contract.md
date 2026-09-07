---
schema_version: 1
feature: Khoá workflow auto-pr về kho hãng — ở bản rẽ nó chết hai lần mỗi lượt đẩy và bôi đỏ mọi commit
slug: auto-pr-thoi-do-o-ban-re
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: []
status: verified
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

## Phạm vi đã thu — vì sao hợp đồng này ngắn

Hai vòng chấm đầu dựng một bộ đo riêng 260 dòng JavaScript cho một bản vá **một dòng
YAML**. Kết quả đo được: **25 lỗi được xác nhận trong bộ đo, 0 lỗi trong thứ được đo.**
Vòng 2 tái sinh đúng ba lớp lỗi của vòng 1 ngay bên trong đoạn mã viết ra để diệt chúng
— so tập hợp thay vì so diff, assertion âm tính so với chính nó, nuốt lỗi thành mã đạt.

Chủ kho chọn thu phạm vi ngày 07/09. Bộ đo tự chế bị xoá. Ba tiêu chí dưới đây đo bằng
**lệnh trần** — `gh api`, `git diff`, và bốn lệnh chứng sẵn có của kho — mỗi eval đúng
một khẳng định, đọc một dòng là biết nó đo gì. Không dòng mã nào của vòng này tham gia
vào việc chấm chính nó.

## Acceptance Criteria

### AC-1 — Ở kho này, job không chạy — đo bằng số GitHub trả về

**Given** commit `c042478` đã đẩy lên `phanlemanh/crm-onehub` và CI đã chạy xong
**When** chạy:

```
gh api repos/phanlemanh/crm-onehub/commits/c042478/check-runs \
  --jq '.check_runs[] | .name + " = " + (.conclusion // .status)' \
  | grep -qx 'Open a pull request into main = skipped'
```

**Then** mã 0.
**Đỏ khi** kết luận khác `skipped`.

Chiều đỏ tái lập được, đã chạy, và chỉ khác **một tham số**: đổi `c042478` thành
`5ac85ef` (đầu `onehub` trước bản vá) thì cùng lệnh trả `Open a pull request into
main = failure` và mã 1.

Đây là tiêu chí duy nhất đo **hành vi thật**. Nó không suy luận từ ngữ nghĩa `if` của
GitHub Actions — nó đọc kết luận GitHub đã ghi.

Mốc **ghim cứng** `c042478` chứ không lấy `HEAD`: ở vòng chấm, `HEAD` là commit hồ sơ
vừa tạo, chưa đẩy và chưa chạy CI, nên lấy `HEAD` sẽ chặn cổng vì một lý do không liên
quan đến bản vá.

### AC-2 — Lệch bản hãng đúng một dòng, và dòng ấy đúng là dòng khoá

Hai khẳng định, hai eval, vì một eval một khẳng định thì đọc một dòng là biết nó đo gì.

**Given** `origin/release` — bản gương của hãng trong kho, đã đối chiếu khớp từng dòng
với `upstream/HEAD` cho tệp này
**When** chạy hai lệnh:

```
git diff --numstat origin/release -- .github/workflows/auto-pr.yml \
  | tr '\t' ' ' | grep -qx '1 0 .github/workflows/auto-pr.yml'

git diff -U0 origin/release -- .github/workflows/auto-pr.yml \
  | grep -qxF "+    if: github.repository == 'trycompai/crm'"
```

**Then** cả hai mã 0.
**Đỏ khi** lệch khác 1/0 · dòng thêm không đúng nguyên văn, kể cả **bốn dấu cách** đầu
dòng — bốn dấu cách mới là tầng job.

Chiều đỏ đã chạy, mỗi lệnh một cách: lệnh đầu đổi nền sang `HEAD` (không lệch dòng nào)
→ mã 1; lệnh sau đổi khuôn đối khớp sang hai dấu cách (tầng sai) → mã 1.

Vì sao phải có vế thứ hai: đếm dòng là **đo con số** trong khi lời hứa là **quan hệ**.
Một dòng trống, một dòng `env`, hay một `if` đặt nhầm tầng đều cho 1/0 và đều lọt.

### AC-3 — Bốn lệnh chứng của kho vẫn xanh

**Given** cây có bản vá
**When** chạy `bun run test`, `check-types --force`, `lint --force`, `lint:slop`
**Then** cả bốn mã 0.

Bản vá không chạm mã nguồn, nên đây là lưới chống tác dụng phụ ngoài dự đoán, không
phải phép đo lời hứa chính.

## Coverage

Ba trục, sau khi thu phạm vi.

| Trục | Giá trị |
| --- | --- |
| A — nơi đo | bản rẽ (`phanlemanh/crm-onehub`) · **kho hãng (`trycompai/crm`)** |
| B — mặt đo | hành vi thật (check-run) · hình dạng bản vá (diff) · tác dụng phụ (bốn lệnh chứng) |
| C — chiều | xanh · đỏ |

**Thước CE — 5/6 ô Core được phủ, mỗi ô bằng một lượt chạy có thật.**

- **A×B, bản rẽ.** hành vi thật → AC-1, hai chiều. hình dạng → AC-2, hai lệnh × hai
  chiều. tác dụng phụ → AC-3.
- **A×B, kho hãng.** **KHÔNG phủ được.** Bản rẽ không có quyền đẩy lên `trycompai/crm`
  nên không quan sát được job có còn chạy ở đó không. Xem Known limits — đây là giới
  hạn đã khai, không phải ô bị quên.
- **C.** Mọi eval máy của AC-1 và AC-2 đều có chiều đỏ đã chạy, mỗi chiều chỉ khác chiều
  xanh **một tham số**. AC-3 không có chiều đỏ riêng: nó là lưới, không phải lời hứa.

## Out of scope

- **Bộ đo tự chế cho phạm vi diff.** Hai vòng đầu có AC-4 «vòng này chỉ chạm những tệp
  đã ghim tên», đo bằng script riêng. Đã xoá cùng bộ đo. Phạm vi diff nay do người đọc
  ở PR kiểm — `git diff --stat` là một màn hình, và mọi lỗi của AC-4 cũ đều là lỗi của
  script chứ không phải của bản vá.
- **`pr-base.yml`** — cùng bệnh (`--base main`), nhưng chỉ kích hoạt khi có PR mở vào
  `release`, việc không xảy ra ở bản rẽ. Để nguyên.
- **Đặt `AUTOMATION_TOKEN` và bật quyền mở PR cho Actions** — đường làm cho auto-pr chạy
  THẬT ở bản rẽ. Loại vì bản rẽ không muốn PR tự mở vào một nhánh nó không có.
- **Dựng một workflow auto-pr riêng nhắm `onehub`** — tính năng mới, không phải bản vá
  màu đỏ.
- **Đo hành vi ở kho hãng** — cần quyền đẩy lên `trycompai/crm`.

## Known limits

1. **Không đo được hành vi ở kho hãng.** Kết luận "job vẫn chạy bình thường ở
   `trycompai/crm`" là suy luận từ ngữ nghĩa `if` của GitHub Actions, không phải số đo.
   Muốn số thật thì phải có quyền đẩy lên kho hãng, thứ bản rẽ không có và không nên có.

2. **AC-1 phụ thuộc `gh` đã đăng nhập và mạng tới GitHub.** Máy thiếu một trong hai thì
   lệnh thất bại, và thất bại ấy phải đọc là **không đo được**, không phải bản vá sai.
   Lệnh trần không phân biệt được hai loại thất bại ấy bằng mã thoát — đó là cái giá của
   việc bỏ bộ đo tự chế, và giá này rẻ hơn 25 lỗi trong bộ đo.

3. **`pr-base.yml` còn mang bệnh.** Nó ngủ, không đỏ, và không có phép đo nào canh nó.
   Nó nổ ngay lượt đầu có người mở PR vào `release`.

4. **Bốn finding ngoài hợp đồng của vòng chấm 1 chưa xử.** Bản đồ chưa vẽ lại (đã vẽ ở
   vòng 2, khai lệch luật trong sổ quyết định) · thiếu kiểm `null` · bảng design doc lỗi
   thời · ba lời gọi git ngoài `try`. Ba mục sau nằm trong bộ đo đã xoá nên tự hết.
