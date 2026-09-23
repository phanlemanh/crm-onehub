## Trong hợp đồng

**QUA-CONG case adds its own label, so the red direction accepts any failure of the gate command**
- file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs:338`
- severity: high
- AC: AC-6
- source: conventions

lenhCong() adds the text `QUA-CONG: lenh cong thoat ${r.ma}` to the output whenever the gate command exits non-zero. ketCa() then looks for "QUA-CONG" in that same output, and caCapHaiChieu checks that the label is present. The label is always there when the exit code is non-zero, so the message check only repeats what the exit code already said. The gate command `cl_tieng_viet_den_man` can go red for an unrelated reason: dan-so with a stale NEO, another test in the same spec file failing, or bun failing to start. Any of those still counts as proof that the wiring works. This breaks the pattern AC-6 and E7 ask for: pair the exit code with the gate's own verbatim message, which here is the DEM-DU line with the broken component's name. Self-reported labels don't count. Round 1 already reported this (review-findings.md:156) and HEAD has not changed it. The fix is to look for the text the spec itself prints, `DEM-DU: ... ngoai khai: <file>` with the file phaMotComponent returned, in r.ra.

---

**HONG-MOT-CHIEU red side goes red because of shimmer.tsx (a file with no exports), never because a component broke in one state**
- file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs:229`
- severity: high
- AC: AC-6
- source: bugs

caHongMotChieu swaps the classifier for `tron = filter(both errors); if (tron.length === ban.length && ban.length > 0)`. The `ban.length > 0` guard is what lets packages/ui/src/components/ai-elements/shimmer.tsx through, because it has 0 exports. Ran it at HEAD: `CHIEU-DO thong-diep=HONG-MOT-CHIEU: packages/ui/src/components/ai-elements/shimmer.tsx hong nhung lot luoi phan nhom`. Also dumped the real ve-that.json: it has no entry at all with exactly one of loi_dong/loi_mo set — the 5 broken files all have both errors, or no entries. The spec also now sets both loi_dong and loi_mo when a module fails to load. So the red side never exercises the AC-2 condition (a component broken in only one state). Scenario: someone restores the original bug exactly (`ban.length === 0 || ban.every(b => b.loi_dong !== null && b.loi_mo !== null)`). Nothing is one-direction, so kiemHongMotChieu passes, and the regression goes through green. The 5-cell injected matrix ((co,null)·(null,co)·(co,co)·(null,null)·round-trip) that E2 in evals.yaml requires is not implemented. E6 (cap-hai-chieu) only checks that the injection matters for dem-du, so it cannot see this. The pass in the evidence report does not prove AC-2.

---

**MOT-NGUON red side is caused by 6 files already dead in the committed evidence, not by the component the case deletes**
- file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs:171`
- severity: medium
- AC: AC-6
- source: bugs

caMotNguon makes the spec read the committed `evidence/mac-dinh.json`, then calls xoaMotComponent. That deletes the first packages/ui component outside the declared list, which is ai-elements/conversation.tsx. That file is NOT in the committed evidence/mac-dinh.json, which lists 50 files. Six files in that list are already missing from the tree: artifact, chain-of-thought, checkpoint, model-selector, prompt-input, suggestion. So kiemMotNguon always goes red with those six paths whether or not anything is deleted. Evidence E1 confirms this: the red message lists exactly those six and not the deleted file. The deletion has no effect on the result. The case also never runs E1's 'Chieu do 1': delete a real component on the fixed spec and assert both lists shrink together. The claim that deleting a component shrinks both lists at once is never measured.

---

**QUA-CONG label is added by the case itself on any non-zero exit, so E6's label check always passes**
- file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs:338`
- severity: low
- AC: AC-6
- source: bugs

lenhCong returns `QUA-CONG: lenh cong thoat ${r.ma}` whenever the gate command exits non-zero. The gate command never prints that label. ketCa and caCapHaiChieu then find 'QUA-CONG' in the red-side message, which is the self-issued text that AC-6 forbids ('không phải dòng chữ ca tự khai'). Any non-zero exit on the red side satisfies E6's check that the red message contains the QUA-CONG label, whatever the cause. The green side on the same copy limits the risk, but the label check itself carries no information.

---

**Shape 3 (asserts a string is present when the promise is a relation): the DEM-DU red check stores the Expected line, not the missing component**
- file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs:126`
- severity: high
- AC: AC-6
- source: measurement

E4 promises a pinned message 'DEM-DU: ve duoc <N-1>/<N>, thieu: <ten>', which is a relation between the removed item and the name in the message. caDemDu (line 273) throws away the return value of boMotMucKhoiKhai(d), so the removed name is never compared with anything. ketCa (lines 125-126) only regex-matches the label `${nhan}[^\n]*` and keeps the first match that has no '${'. For bun's expect diff, that first match is the EXPECTED line. The evidence proves it: evidence-report.md:70 records 'CHIEU-DO thong-diep=DEM-DU: ve duoc 41/45, ngoai khai: khong"'. The message recorded as proof of the red direction says nothing is missing. Any failure of that expect(), for any file, satisfies the check.

---

**Shape 3 (asserts a string is present when the promise is a relation): the MOT-NGUON red direction never checks the file the case deleted, and the green direction never compares the two lists**
- file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs:171`
- severity: high
- AC: AC-6
- source: measurement

E1 promises two things: on the intact copy the draw-side and grade-side lists match item by item, with both counts printed; after deleting a component, 'MOT-NGUON kem duong dan file chet'. kiemMotNguon (lines 146-156) never calls docMacDinh and never compares the two lists. It only checks that each path in ve-that.json exists on disk, so a draw-side list that is shorter than the grade side passes green. The red direction discards the return value of xoaMotComponent(d) (line 171). The evidence shows the red fired because of the 6 AI Elements files already deleted in 84440ce, which are still listed in the committed evidence/mac-dinh.json (evidence-report.md:37). The file the case deleted itself is not in the message, so the red would fire just the same without that deletion. The 'Chieu do 1' direction (real spec, delete one file, both lists get shorter) is not implemented at all.

---

**Shape 4 (negative assertion with no real message pin): the measurer prefixes the QUA-CONG label onto any non-zero exit of the gate command**
- file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs:338`
- severity: high
- AC: AC-6
- source: measurement

lenhCong returns `ra: r.ma === 0 ? r.ra : \`QUA-CONG: lenh cong thoat ${r.ma}...\``. The QUA-CONG label is written by the measurer itself whenever the exit code is non-zero, so ketCa's 'message pin' check always passes. The real assertion is only ma != 0. The gate command failing for an unrelated reason (the dan-so step off its NEO anchor, a missing dependency, a crash) would satisfy it. E7 promises 'thong diep chua nhan QUA-CONG kem ten ca da do', but the name of the component broken by phaMotComponent (line 348, return value discarded) is never checked. The evidence captured only 'QUA-CONG: lenh cong thoat 1' (evidence-report.md:103).

---

**Shape 3 (asserts a string is present when the promise is a relation): E6's 'message contains the right label' check is a tautology on the case's own self-reported line**
- file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs:397`
- severity: medium
- AC: AC-6
- source: measurement

E6 asserts `td[1].includes(NHAN[ten])`. td comes from the 'CHIEU-DO thong-diep=' line that ketCa prints, and that line is `bat`, a regex match of `${nhan}[^\n]*` (line 125), so it always contains the label unless it is empty. The check can only fail when the line is empty, so it measures non-emptiness, not a relation. For MOT-NGUON, HONG-MOT-CHIEU, KHONG-BAN-CAY and QUA-CONG, the labelled message is also written by thuoc-phai-do.mjs itself, not by the thing under test. This contradicts AC-6/E6 ('Do QUAN HE, khong do chuoi co mat trong loi tu xung cua ca'). With the self-labels found above, E6 cannot detect a case whose message does not name what was broken.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The copy is built by hand from `git archive HEAD` instead of the shared dungCaySao/khiBiNgat helpers the sibling script in this area uses**
    Người dùng thấy gì: Nếu bạn sửa lỗi ngay trước khi kiểm tra nhưng chưa lưu (commit) thay đổi, hệ thống có thể vẫn đo bản cũ và báo đạt nhầm; và nếu quá trình kiểm tra bị ngắt giữa chừng, một số bản sao tạm sẽ bị bỏ quên trên máy, chiếm dần dung lượng.
    file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs`
    severity: medium
    Đề xuất: known-limits

- **SAN-KHUON hand-copies the field list the CHAM side reads, and E6 never checks its label**
    Người dùng thấy gì: Nếu cách chấm điểm sau này đọc thêm hoặc bớt một trường dữ liệu trong bản vẽ, phép kiểm tra này sẽ không nhận ra và vẫn báo ổn, dù hai bên đã lệch nhau.
    file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs`
    severity: medium
    Đề xuất: known-limits

- **The spec casts khai-khong-ve-duoc.json without parsing it and keeps a second, hand-maintained list of non-components**
    Người dùng thấy gì: Nếu có người thêm một mục mới vào danh sách loại trừ nhưng chỉ cập nhật một trong hai nơi lưu danh sách đó, phép kiểm tra sẽ báo lỗi dù không ai làm gì sai, và người sửa phải tự dò ra chỗ còn thiếu.
    file: `packages/ui/test/lai-ra-man.spec.tsx`
    severity: low
    Đề xuất: known-limits

- **card.html cuts every AC off mid-sentence and puts AC-3 under 'Sẽ KHÔNG làm'**
    Người dùng thấy gì: Người dùng ký duyệt có thể thấy các điều kiện chấp nhận bị cắt cụt giữa câu, thiếu phần kết quả mong đợi, nên khó biết chắc mình đang ký duyệt điều gì.
    file: `_acceptance/thuoc-lai-ra-man-phai-do/card.html`
    severity: low
    Đề xuất: new-contract

- **process.exit inside try skips finally, leaving the git-archive copy in tmp**
    Người dùng thấy gì: Sau nhiều lần kiểm tra bị lỗi hoặc dừng giữa chừng, một số bản sao tạm không được dọn sẽ tồn đọng trên máy, chiếm dần dung lượng đĩa theo thời gian.
    file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs`
    severity: low
    Đề xuất: known-limits

- **Shape 5 (claims a sweep of the whole class but has only one point case): the 5-cell matrix for E2 is missing**
    Người dùng thấy gì: Phép kiểm tra hiện chỉ thử một tình huống hỏng cụ thể thay vì mọi tình huống có thể xảy ra, nên một số kiểu lỗi phân loại vẫn có thể lọt qua mà không ai biết.
    file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs`
    severity: high
    Đề xuất: known-limits

- **Shape 2 (hand-written fixture matching the reader's shape): the SAN-KHUON field list is typed by hand instead of being derived from the grade side**
    Người dùng thấy gì: Nếu cách chấm điểm sau này đọc thêm hoặc bớt một trường dữ liệu, phép kiểm tra này sẽ không phát hiện ra và vẫn báo ổn dù hai bên đã lệch nhau.
    file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs`
    severity: medium
    Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
