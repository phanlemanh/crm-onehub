# Thẻ Cổng Bằng chứng đếm eval mang sang thành «chưa đạt»

Bộ vẽ thẻ: `acceptance-gate` 2.33.0, `scripts/gate-card.js`.

- Dòng 1035 đọc ô Verdict nguyên chữ: `verdict: m[4].trim().toUpperCase()`.
- Dòng 1095 (`machinePass`) so `r.verdict === 'PASS'`.
- Dòng 1262 (danh sách «Eval chưa đạt») so `r.verdict !== 'PASS'`.

Báo cáo round 4 (commit `74a181089`) ghi ô Verdict của eval mang sang là `PASS (carried từ round 1)`,
nên sáu eval đạt (E2, E4, E5, E6, E8, E10) bị đếm là chưa đạt cùng hai eval đỏ thật (E9, E13).
Bảng round 3 và round 5 ghi `PASS` trần nên không bị.

## Tái hiện (từ gốc kho crm-onehub)

```bash
T=$(mktemp -d); mkdir -p $T/_acceptance/s; cp _acceptance/config.yaml $T/_acceptance/
for f in contract.md evals.yaml evidence-report.md run-log.jsonl decisions.jsonl review-findings.md; do
  git show 74a181089:_acceptance/sua-sau-chay-that/$f > $T/_acceptance/s/$f; done
sed -i '' 's/^slug: sua-sau-chay-that/slug: s/' $T/_acceptance/s/contract.md
node <acceptance-gate 2.33.0>/scripts/gate-card.js --root $T --slug s | sed -e 's/<[^>]*>/ /g' | grep -o 'Eval chưa đạt[^—]*'
```

Kết quả đo 19/10: `Eval chưa đạt: E2 (AC-2), E4 (AC-4), E5 (AC-5), E6 (AC-6), E8 (AC-8), E9 (AC-9), E10 (AC-10), E13 (AC-13)`;
`failed_evals` của chính báo cáo đó là `["E9","E13"]`.
