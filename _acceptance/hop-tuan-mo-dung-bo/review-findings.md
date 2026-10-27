# Review findings: hop-tuan-mo-dung-bo (round 2)

## Trong hợp đồng

- **E12 checks the base and the tree by different rules, so a regression on an eval with a declared expected_exit is hidden as "DO SAN TREN NEN"**
  AC: AC-10
  file: `_acceptance/hop-tuan-mo-dung-bo/rang/khong-doi-hinh.mjs:477`
  severity: medium
  source: conventions
  detail: Commit 57c82772c changed the pass rule on the tree to `ma === m.kyVong || ma === 0` (line ~522), so an eval counts as passing if it exits with its declared code or with 0. In `chayTrenNen` the base only counts as passing when `nen === m.kyVong` (`const xauHon = nen === m.kyVong;` and `if (nen !== m.kyVong) console.log("DO SAN TREN NEN ...")`). Case: an eval declaring `expected_exit: 1`, such as tro-ly-okr-de-xuat#E24, exits 2 on the tree (crash, or the script cannot measure) and 0 on origin/onehub. The base passes cleanly, so this is a regression. But 0 !== 1, so the script prints "DO SAN TREN NEN", does not add to `sai`, and E12 still reports "dat". The base should use the same rule as the tree (`nen === m.kyVong || nen === 0`). This also breaks the criterion signed in evals.yaml E12: «SAI AC-10» when the base is 0 and the tree is not. Run-log entry d-20261025T221105Z-46 only covers the case where the tree exits with the declared code. It does not cover this case.

- **chayTrenNen treats base exit 0 as already red on base when expected_exit is non-zero, so a real regression passes silently**
  AC: AC-10
  file: `_acceptance/hop-tuan-mo-dung-bo/rang/khong-doi-hinh.mjs:477`
  severity: medium
  source: bugs
  detail: This round's change makes the tree-side check accept two exit codes: `if (ma === m.kyVong || ma === 0)` (line ~522). The base-side check in chayTrenNen was changed to accept only one: `const xauHon = nen === m.kyVong;` and `if (nen !== m.kyVong) console.log("DO SAN TREN NEN ...")`. The two sides now judge a pass differently. When an eval declares expected_exit != 0 and the base run returns 0, the base is green by the tree-side rule. The script still prints "DO SAN TREN NEN" and does not count SAI. The concrete case is tro-ly-okr-de-xuat#E24 (expected_exit: 1). In S4 r1 its base run returned 0 (decisions.jsonl d-...-46: "cay 1 · nen 0"). Suppose the tree now breaks it and returns 2 (missing key) or 3 (crashed run), while the base returns 0 as in r1. The script reports it as red on base, sai stays 0, and it prints KET LUAN dat with exit 0. That is a silent false pass of AC-10. The fix is to use the same rule as the tree side: `const nenDat = nen === m.kyVong || nen === 0; const xauHon = nenDat;` and print DO SAN TREN NEN only when `!nenDat`.

- **Shape 3 (presence check standing in for a relation): «worse than base» uses a different pass rule for the tree than for the base**
  AC: AC-10
  file: `_acceptance/hop-tuan-mo-dung-bo/rang/khong-doi-hinh.mjs:477`
  severity: medium
  source: measurement
  detail: The promise E12 measures is a relation between two values: an eval that passes on the base must not fail on the tree. Since d-46, the tree counts as passing when `ma === m.kyVong || ma === 0` (line 522). The base is judged differently: `chayTrenNen` only counts SAI when `nen === m.kyVong` (line 477), and line 482 prints `DO SAN TREN NEN` for every `nen !== m.kyVong`, which includes `nen === 0`. For an eval that declares a nonzero expected_exit, a base exit of 0 is a pass under E12's own rule. The signed set has three such evals: tro-ly-okr-de-xuat#E24 (expected_exit 1), man-cai-dat-noi-tieng-viet and ngan-ho-so-trong-lo-trinh (expected_exit 2). Take E24 with base 0 and tree 2 (MA_KHONG_DO after the retry) or any other code: that is a regression from pass to fail, but it is reported as «already red on the base» and is not added to `sai`. The comparison should use the same predicate on both sides: `xauHon = nen === m.kyVong || nen === 0`.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The E12 expected text in evals.yaml was not updated to match the new expected_exit semantics**
  Người dùng thấy gì: Lời mô tả của bài kiểm so sánh với bản nền nói khác với cách nó thật sự chạy. Người dùng cuối không bị ảnh hưởng, chỉ người đọc hồ sơ nghiệm thu có thể hiểu nhầm.
  Căn cứ: Không ảnh hưởng gì tới người dùng, không mất dữ liệu; chỉ cần chỉnh lại câu chữ khi có dịp, sửa rẻ.
  file: `_acceptance/hop-tuan-mo-dung-bo/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **--chi with an empty or misspelled list runs no evals and still reports "dat" with exit 0**
  Người dùng thấy gì: Khi người làm gõ sai tên mục trong lệnh chạy thử riêng, công cụ vẫn báo đạt dù không chạy gì. Người dùng cuối không gặp, chỉ có thể làm người kiểm tin nhầm một lần chạy thử.
  Căn cứ: Chỉ ảnh hưởng lần chạy thử bằng tay, không đụng tới phép đo chính thức; người làm tự phát hiện và chạy lại được, không mất gì.
  file: `_acceptance/hop-tuan-mo-dung-bo/rang/khong-doi-hinh.mjs`
  severity: low
  Đề xuất: known-limits

- **Shape 4 (negative assertion with no positive control): --chi with an unmatched name passes vacuously**
  Người dùng thấy gì: Chạy thử riêng một mục với tên gõ sai vẫn ra kết quả đạt mà không đo gì. Người dùng cuối không bị ảnh hưởng, chỉ người kiểm có thể tin nhầm kết quả chạy thử.
  Căn cứ: Chỉ nằm ở đường chạy thử bằng tay, lần chạy chính thức vẫn đúng; lỗi dễ nhận ra và chạy lại, không mất dữ liệu.
  file: `_acceptance/hop-tuan-mo-dung-bo/rang/khong-doi-hinh.mjs`
  severity: low
  Đề xuất: known-limits

- **Schema quyền ở packages/validation chép lại okrAccessOutput của API, nên hai bản sẽ lệch nhau (r1)**
  Người dùng thấy gì: Hiện nay Họp tuần vẫn mở đúng bộ cho từng người. Nhưng nếu sau này phần quyền ở máy chủ đổi hình dạng mà phía trang không đổi theo, việc tự chuyển về bộ của mình có thể tắt đi mà không ai được báo.
  Căn cứ: Hiện chưa gây hại cho người dùng, chỉ là rủi ro lệch về sau và nếu lệch thì người dùng chỉ mất việc tự chuyển bộ (vẫn vào được bộ bằng tay); sửa lúc nào cũng rẻ.
  file: `packages/validation/src/okr-bo-hop-tuan.ts`
  severity: medium
  Đề xuất: known-limits

- **page.tsx gọi fetchQuery cho access và cây tổ chức mà không bắt lỗi, khác cách proxy và các trang cùng khu xử lý lỗi (r1)**
  Người dùng thấy gì: Khi hệ thống không đọc được quyền hay cây tổ chức của người xem, cả trang Bộ OKR hiện màn lỗi thay vì mở một bộ mặc định. Người dùng tải lại là vào được.
  Căn cứ: Hợp đồng chủ ý không cho trang âm thầm mở bộ OneHub khi lỗi, nên màn lỗi là hậu quả nhẹ, người dùng tự gỡ bằng cách tải lại, và chỉ xảy ra khi máy chủ đang trục trặc.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **okr:mau xoá ca Họp tuần theo tiền tố tên hiển thị ở mọi lần chạy, trước bước kiểm OKR thật (r1)**
  Người dùng thấy gì: Lệnh nạp dữ liệu mẫu có thể xoá nhầm một chu kỳ hoặc phòng ban do người dùng tự đặt tên bắt đầu bằng «Ca Họp tuần» trên máy dev hoặc máy đo. Môi trường thật không bị ảnh hưởng vì lệnh bị chặn ở đó.
  Căn cứ: Chỉ chạm môi trường dev và đo, không chạm dữ liệu khách; dữ liệu mất là dữ liệu thử, và trùng tên đúng tiền tố là hiếm.
  file: `apps/api/scripts/okr-mau/lenh.ts`
  severity: low
  Đề xuất: known-limits

- **Hai khoá message thôi dùng được thêm vào danh sách miễn của guard thay vì xoá (r1)**
  Người dùng thấy gì: Hai câu chữ cũ của dòng tóm tắt tuần vẫn nằm trong kho chữ dù màn đã không còn dùng. Người dùng không thấy gì khác.
  Căn cứ: Không có hậu quả nào với người dùng, chỉ là rác nhỏ trong mã; dọn lúc nào cũng được và chi phí mở việc riêng vượt lợi ích.
  file: `apps/app/test/messages-guard.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Lặp helper ngày: ngayThang có hai bản trong cùng thư mục, NGAY_MS khai thêm một lần nữa (r1)**
  Người dùng thấy gì: Cách đổi ngày sang dạng ngày/tháng được viết hai lần ở hai nơi của màn Họp tuần. Người dùng vẫn thấy ngày đúng.
  Căn cứ: Không ảnh hưởng người dùng, hai bản cho cùng kết quả; sửa sau rẻ nhưng cũng không đáng mở việc riêng.
  file: `apps/app/app/(app)/[slug]/okr/hop-tuan.tsx`
  severity: low
  Đề xuất: wont-fix

- **HopTuan nuốt lỗi của truy vấn okr.cycles (và org.tree): mất hàng số, sai lý do rỗng, câu có tên trống (r1)**
  Người dùng thấy gì: Nếu việc tải danh sách chu kỳ hoặc cây tổ chức bị lỗi, màn Họp tuần lặng lẽ mất hàng bốn số, có thể báo sai lý do trống, và câu «chưa có KR công bố trong …» hiện thiếu tên bộ hoặc tên chu kỳ. Không có thông báo lỗi hay nút thử lại.
  Căn cứ: Người dùng thấy màn thiếu chữ và dễ hiểu nhầm nhưng không mất dữ liệu, chỉ xảy ra khi hệ thống lỗi và tải lại thường khỏi; sửa không đắt nên nên đăng thành việc riêng nếu chủ kho muốn.
  file: `apps/app/app/(app)/[slug]/okr/hop-tuan.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): ô goc của htmb-chua-kr chèn tay 4 hàng toanCanh, nên «theo thứ tự cây» thành phép đo tự đúng (r1)**
  Người dùng thấy gì: Bài kiểm danh sách «Đơn vị có KR» dựng dữ liệu bằng tay, nên nếu thứ tự đơn vị trên màn thật bị đảo thì bài kiểm vẫn báo đạt. Màn hiện nay vẫn hiển thị đúng.
  Căn cứ: Không làm người dùng gặp lỗi ngay, chỉ làm lưới an toàn lỏng hơn cho lần sửa sau; củng cố bài kiểm lúc nào cũng được.
  file: `apps/app/test/hop-tuan-mo-dung-bo.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): bẫy MutationObserver «dòng vị trí không mang tên gốc» không có đối chứng dương (r1)**
  Người dùng thấy gì: Phép đo xác nhận dòng vị trí không từng hiện tên bộ gốc có thể báo đạt dù công cụ bắt lỗi hỏng, nên có thể bỏ sót một lần nháy sai tên bộ. Người dùng thật chưa bị ảnh hưởng.
  Căn cứ: Rủi ro là bỏ sót một lần nháy tên sai thoáng qua, tác hại nhỏ và tự hết khi tải lại; gia cố phép đo rẻ và làm lúc nào cũng được.
  file: `_acceptance/hop-tuan-mo-dung-bo/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng thiếu ma trận viết trước): khong-doi-hinh.mjs không có sàn hay danh sách mong đợi, nên lớp rỗng vẫn kết luận «dat» (r1 · tệp đã đổi)**
  Người dùng thấy gì: Công cụ kiểm không-đổi-hình có thể báo «đạt» ngay cả khi vì lỗi nào đó nó không quét được hồ sơ nào. Người dùng không thấy gì.
  Căn cứ: Chỉ làm lỏng công cụ kiểm nội bộ chứ không chạm người dùng, và lỗi lớn kiểu này sẽ lộ ra ở các eval khác của từng hồ sơ.
  file: `_acceptance/hop-tuan-mo-dung-bo/rang/khong-doi-hinh.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
