# Review findings: okr-cua-toi-tach-theo-doi (round 1)

## Trong hợp đồng

- **Shape 3 (asserts the value is present when the promise is a relation): E2/E3/E4 check whether each seeded id is in an array, but the contract promises set equality and exactly-once**
  AC: AC-1
  file: `apps/api/test/okr-cua-toi-theo-doi.spec.ts:75`
  severity: medium
  source: measurement
  detail: The helper `noi = (r, id) => MANG.filter((k) => r[k].some((m) => m.id === id))` only answers which arrays contain a given id. Every assertion in the spec is built from it. E2's `expected` promises 'tập id objectives toEqual {M1..M4}, dangTheoDoi toEqual [M5], daBo rỗng'. Lines 130-144 only check that M1..M6 sit in the expected arrays. They never compare the whole `objectives`, `dangTheoDoi` or `daBo` array. An extra id outside the six, or a non-empty `daBo`, still passes. Example: a regression that drops the `cycleId` filter, or adds a foreign objective, would not go red. Same gap in E4 (lines 188-196): 'tập daBo toEqual {D1..D4}' is checked per id, so an extra item in `daBo` is not caught. E3 (lines 164-169) promises 'mỗi id xuất hiện đúng một lần trên cả ba mảng gộp lại'. `noi` uses `.some` per array, so an id repeated inside one array (T1 twice in `objectives`) still returns `["objectives"]` and the test passes. To match the promise, the full id sets of the three arrays need asserting with toEqual (by set, since order does not matter), and duplicates need counting.
  rationale: AC-1 hứa mỗi mảng có «đúng» bốn mục tiêu và «đúng» mục tiêu chỉ theo dõi; phép kiểm chỉ xét sự hiện diện nên không chứng minh được lời hứa «đúng» đó (AC-3 cùng dạng với daBo).

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Shape 5 (claims to sweep a class without a fixed matrix): E15 checks the number of pairs run against a count derived from the same table, not against the 8 declared up front**
  Người dùng thấy gì: Bộ tự phá thử để kiểm tra các phép kiểm có thể lặng lẽ bớt đi một ca mà vẫn báo xanh. Người dùng không thấy gì khác đi, chỉ là về sau khó phát hiện nếu ai đó vô tình xoá bớt một ca phá thử.
  file: `_acceptance/okr-cua-toi-tach-theo-doi/rang/dot-bien.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
