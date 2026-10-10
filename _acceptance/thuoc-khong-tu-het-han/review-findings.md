# Review findings: thuoc-khong-tu-het-han (round 3)

## Trong hợp đồng

- **paths-chet scans fewer evals than the real gate, so two in-scope dossiers still lose the paths stale filter**
  file: `_acceptance/thuoc-khong-tu-het-han/rang/neo.mjs:85`
  severity: high
  AC: AC-1
  source: conventions
  detail: The repo already has a reader for eval paths: lib/evidence-core.cjs exports evalPathsOf, pathGlobToRe, phanLoaiMucPaths, dungCayPaths and staleByPaths, and the pre-merge net and repin-lane both use it. staleByPaths goes through the paths of EVERY eval: ui-check, judgment and status not-run included. A single entry that resolves to 'paths-khong-tro-toi-tep' makes the whole dossier return apply:false, which means the paths-based stale filter is off for that dossier. neo.mjs reimplements this instead (pathsCua: its own regex parser, and only script/test evals that are not not-run). So paths-chet.mjs (E1/AC-1) and the scan at a9e8bc75a never see dead globs in the other evals. I ran evidence-core's phanLoaiMucPaths/staleByPaths at HEAD on the 6 evals.yaml touched this round. dien-thoai-ca-nhan still returns 'paths-khong-tro-toi-tep:E1:apps/app/app/(app)/[[]slug]/contacts/**' (ui-check E1, E16, E17, E20 still use [[]slug]). the-gop-y-okr still returns 'paths-khong-tro-toi-tep:E1:apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx': only E2 was moved to the-gop-y-props.ts, while E1, E3–E9, E11, E14, E15 and E16 still point at the deleted cot-gop-y.tsx. Result: E1 prints '0 glob chet', yet the gate still turns the filter off for both dossiers. That is exactly the failure the contract promises to remove («Lượt sau không phải ghim lại thừa vì paths chết»). The scanner should reuse evidence-core's evalPathsOf + phanLoaiMucPaths over all evals (or call staleByPaths itself), and danh-sach.json should be rebuilt from that scan.

- **Hình dạng 5 (claims to sweep the whole class but only checks a filtered subset) plus hình dạng 1 (measures a proxy, not the stale filter's output): paths-chet.mjs skips every ui-check/judgment/not-run eval, so it misses dead globs that the real stale filter still rejects**
  file: `_acceptance/thuoc-khong-tu-het-han/rang/neo.mjs:84`
  severity: high
  AC: AC-1
  source: measurement
  detail: pathsCua() in neo.mjs (line 84) is `if (!/^(script|test)$/.test(loai) || /not-run/.test(...)) continue;`. paths-chet.mjs relies on it in two places. (1) Step (1) at line 42 checks the in-scope globs at the anchor commit. (2) The control at line 46, quetToanBo(MOC_GOC), is described as "quet moi ho so da ky" and is meant to land on exactly the 20 evals in danh-sach.json. But danh-sach.json was built with the same filter, so this control can only confirm itself. It never checks ui-check, judgment or not-run evals. The consumer that AC-1 is supposed to serve ("Lượt sau không phải ghim lại thừa vì paths chết") is the stale-by-paths filter: lib/evidence-core.cjs staleByPaths → phanLoaiMucPaths, enabled by config.yaml:2380 `stale_scope: paths` and called by repin-lane --skip-unchanged. That filter reads paths from EVERY eval, and if any single item is dead it drops the whole dossier back to the old rule. I ran staleByPaths at HEAD with a tree from git ls-files on the 6 dossiers this round edits: dien-thoai-ca-nhan → apply:false, reason `paths-khong-tro-toi-tep:E1:apps/app/app/(app)/[[]slug]/contacts/**`. E1 is executor: ui-check and still has the escaped-bracket form that this round fixed in E3/E5/E10/E14/E15/E21. the-gop-y-okr → apply:false, reason `paths-khong-tro-toi-tep:E1:apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx`. This is the ui-check E1 pointing at the file that E2 has just been moved off. So E1 (tkh_paths_chet) prints "XANH — 0 eval co glob chet" while the actual output of the filter for 2 of the 5 in-scope dossiers is still "refuse to filter because of a dead path". The measurement checks the glob matcher on a subset rather than the output of staleByPaths on the whole dossier. decisions.jsonl d-20261009T190336Z-11 already fixed this same filter in chi-paths.mjs (AC-2). paths-chet.mjs did not get that fix.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Orphan executor tkh_e10 silently runs the E7 check**
  Người dùng thấy gì: Còn sót một lệnh kiểm tra cũ cho một mục đã được chuyển đi nơi khác. Ai chạy nhầm lệnh đó sẽ thấy màu xanh nhưng thực ra nó đo một việc khác. Hiện không có mục nào trong hồ sơ này gọi lệnh đó.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **hai-thuoc.mjs keeps dead E10 branches with a hard-coded sha**
  Người dùng thấy gì: Trong script kiểm tra còn một đoạn mã cũ không còn được dùng nữa. Nó không làm kết quả nào sai, chỉ làm người đọc sau này khó hiểu hơn một chút.
  file: `_acceptance/thuoc-khong-tu-het-han/rang/hai-thuoc.mjs`
  severity: low
  Đề xuất: wont-fix

- **Old Gate 2 evidence page still describes E4/tkh_e10 after the scope cut**
  Người dùng thấy gì: Trang bằng chứng cũ vẫn nhắc đến một mục đã bị bỏ khỏi vòng này. Nó sẽ được dựng lại ở lượt kiểm tra kế tiếp, nên người xem tạm thời có thể thấy thông tin lỗi thời.
  file: `_acceptance/thuoc-khong-tu-het-han/evidence-page.html`
  severity: low
  Đề xuất: wont-fix

- **tkh_e10 trong config còn sót, và hai-thuoc.mjs bỏ qua cờ lạ, nên lệnh đó chạy thước E7 rồi in XANH**
  Người dùng thấy gì: Một lệnh kiểm tra đã hết dùng vẫn còn trong cấu hình, và nếu ai chạy nó thì sẽ nhận kết quả xanh dù không đo đúng việc nó tên. Chưa có mục nào trong hồ sơ này dựa vào lệnh đó.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **paths của E3 thiếu ha-tran-thang-hoi-zalo/evals.yaml và neo.mjs, dù hai-thuoc.mjs đọc cả hai**
  Người dùng thấy gì: Ở các lượt sau, một thay đổi nhỏ ở vài tệp có thể không làm kiểm tra này chạy lại, nên nó có thể tiếp tục báo xanh theo kết quả cũ dù thực tế đã đỏ.
  file: `_acceptance/thuoc-khong-tu-het-han/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **paths của E1 và E2 thiếu các tệp evals.yaml mà chúng đo ở HEAD trước khi gộp**
  Người dùng thấy gì: Nếu ai đó chỉnh lại các hồ sơ liên quan sau này, hai kiểm tra này có thể không được chạy lại và vẫn hiện xanh theo lần chạy trước.
  file: `_acceptance/thuoc-khong-tu-het-han/evals.yaml`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 5/8 lỗi rơi vào file không bộ đo nào phủ (_acceptance/config.yaml, _acceptance/thuoc-khong-tu-het-han/evidence-page.html, _acceptance/thuoc-khong-tu-het-han/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
