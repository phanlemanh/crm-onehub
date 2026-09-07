# Kế hoạch — auto-pr-thoi-do-o-ban-re

Ngày 07/09 · T2 · nhánh `fix/auto-pr-thoi-do-o-ban-re`

Một task, không có task nào độc lập song song được. Không fan-out.

## Task 1 — Khoá job `open` của auto-pr về kho hãng

**Files:** `.github/workflows/auto-pr.yml`

**Việc:** thêm đúng một dòng ở tầng job, giữa `name:` và `runs-on:`:

```yaml
    if: github.repository == 'trycompai/crm'
```

**Verify per-task:** `pre-push` của kho — `check-types`, `lint`, `lint:slop`, `test`.
Đã chạy khi đẩy `c042478`: check-types 9/9 fresh · lint 9/9 fresh · test 9/9 fresh
(257 pass, 0 fail) · lint:slop 909 tệp, 9 rule.

**Phục vụ:** E1, E2, E3, E4 (và E5–E8 là lưới chống tác dụng phụ).

**independent:** false — chỉ có một task.

## Trạng thái

Task 1 đã xong ở commit `c042478`, đẩy lên `origin` cùng ngày. Bốn chân đo và hồ sơ
nghiệm thu ở commit `ba5e95a` và các commit sau.

Bản kế hoạch này viết sau khi mã đã có: vòng đi ngược từ một bản vá đã đẩy sang hồ sơ,
vì cổng chặn PR mới lộ ra rằng `.github/workflows/**` nằm ngoài `t1_skip_globs`. Ghi
đúng thứ tự đã xảy ra chứ không dựng lại một trình tự đẹp hơn sự thật.
