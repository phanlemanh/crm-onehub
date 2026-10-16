# Review findings: goi-y-mo-ke-hoach (round 1)

## Trong hợp đồng

- **gymk_hoi_quy ghim mốc cũ 7ebcb0242, chạy tại HEAD thì đỏ vì thay đổi test của PR khác**
  AC: AC-10
  file: `_acceptance/config.yaml:2908`
  severity: high
  source: conventions
  detail: evals.yaml (dòng 109) hứa `--moc <merge-base của nhánh với origin/onehub>`. Nhưng nhánh đã merge origin/onehub (324914243), nên merge-base bây giờ là 28d8ca19f (duong-nen.md cũng ghi sha này), còn lệnh vẫn ghim 7ebcb0242. Tôi đã chạy thử tại HEAD: `node _acceptance/goi-y-mo-ke-hoach/rang/khong-xoa-expect.mjs --moc 7ebcb0242` thoát 1. Nó báo expect bị xoá hay sửa ở 7 tệp OKR (khung-okr-truoc-r1.dom.tsx, okr-theo-don-vi.dom.tsx, soan-okr-song-lai.spec.ts...), mà mấy tệp này do PR khác của onehub sửa trong khoảng 7ebcb0242..28d8ca19f, không phải vòng này. Chạy với `--moc 28d8ca19f` thì ra 0 tệp và thoát 0. Vậy là E-hồi-quy (AC-10) đang đỏ vì lý do nằm ngoài vòng: hoặc cổng chặn oan, hoặc người ta quen tay ghi đè. `rang/san-thiet-ke.mjs` dòng 11 (`const MOC = "7ebcb0242"`) cũng lệch y như vậy. Nó vẫn xanh, nhưng phạm vi soi bị nới ra cả những dòng .tsx của PR khác dưới record-sheet và onboarding.
  lý do vào hợp đồng: AC-10 đòi mọi suite xanh và không expect nào bị xoá hay sửa; phép kiểm hồi quy của chính AC này đang đỏ tại HEAD vì ghim mốc cũ.

- **Hình dạng 6 (biến thể mốc hardcode): E10 so với mốc 7ebcb0242, không phải merge-base thật của cây, nên đo lịch sử onehub thay cho nhánh**
  AC: AC-10
  file: `_acceptance/config.yaml:2908`
  severity: high
  source: measurement
  detail: gymk_hoi_quy chạy `khong-xoa-expect.mjs --moc 7ebcb0242`. evals.yaml E10 ghi mốc phải là «merge-base của nhánh với origin/onehub», nhưng merge-base hiện tại là 28d8ca19f (nhánh đã merge origin/onehub ở 324914243), cách 7ebcb0242 168 commit. Tôi chạy thử: `--moc 7ebcb0242` quét 7 tệp kiểm và thoát 1 vì các expect bị sửa trong apps/app/test/okr-to-chuc-va.dom.tsx, soan-okr.dom.tsx, soan-okr-song-lai.spec.ts..., toàn là thay đổi của các commit onehub (vd fc6ba49c1, 3ea08d773), nhánh này không chạm tệp nào trong số đó. Với `--moc 28d8ca19f` thì quét 0 tệp và thoát 0. Như vậy thước đang đo một khoảng lịch sử khác chứ không đo diff của cây đang kiểm. Hệ quả: E10 đỏ vì việc của người khác, và chữ «7 tệp · 353 câu expect» trong output không nói gì về vòng này. Cùng mốc 7ebcb0242 cũng được hardcode trong rang/san-thiet-ke.mjs dòng 11. Ở đó hiện chưa gây sai vì cả hai mốc ra cùng hai tệp .tsx, nhưng cơ chế lệch là một.
  lý do vào hợp đồng: cùng gốc với mục trên: phép kiểm của AC-10 so với mốc cũ nên đỏ vì thay đổi ngoài vòng, làm AC-10 không đạt.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Chữ tiếng Việt trên màn và trong tin nhắc dùng «Deal … đã thắng», trái từ điển CONTEXT.md**
  Người dùng thấy gì: Thẻ gợi ý và tin nhắc buổi sáng gọi giao dịch là «Deal … đã thắng», khác với chữ «Thoả thuận» và «Chốt» mà phần còn lại của ứng dụng dùng. Người dùng thấy hai cách gọi cho cùng một thứ, và có chỗ còn lẫn chữ tiếng Anh «sheet».
  file: `apps/app/lib/messages/record-sheet.ts`
  severity: medium
  Đề xuất: known-limits

- **Chữ «gợi ý» trần trên màn, trái mục từ điển «Gợi ý mở kế hoạch» thêm ngay trong vòng này**
  Người dùng thấy gì: Một số câu báo cho người dùng chỉ nói «gợi ý», trong khi tên đầy đủ là «gợi ý mở kế hoạch». Người dùng có thể nhầm với câu «gợi ý» của nhắc kế hoạch im.
  file: `packages/db/src/goi-y-ke-hoach.ts`
  severity: medium
  Đề xuất: known-limits

- **companyId của gợi ý là bản chụp lúc sinh; đổi công ty của deal thì thẻ mở kế hoạch cho công ty cũ, và mở kế hoạch cho công ty mới không đóng gợi ý**
  Người dùng thấy gì: Nếu sau khi deal thắng người ta đổi công ty của deal, thẻ gợi ý vẫn đề nghị mở kế hoạch cho công ty cũ. Mở kế hoạch cho công ty mới cũng không làm gợi ý đó tự đóng, và nhắc buổi sáng vẫn ghi tên công ty cũ.
  file: `apps/api/src/onboarding/onboarding.service.ts`
  severity: medium
  Đề xuất: known-limits

- **boQuaGoiY trả 404 kèm lời «Gợi ý này đã được xử lý.» khi id không tồn tại**
  Người dùng thấy gì: Nếu gợi ý không còn tồn tại, người dùng nhận lời báo «đã được xử lý» thay vì «không tìm thấy». Hiếm gặp và vô hại, chỉ là câu báo hơi lệch.
  file: `apps/api/src/onboarding/onboarding.service.ts`
  severity: low
  Đề xuất: wont-fix

- **Đổi giai đoạn ngay trên sheet deal không làm mới query goiYCuaDeal, nên thẻ gợi ý không hiện sau khi thắng và không ẩn khi deal rời thắng**
  Người dùng thấy gì: Khi người phụ trách chuyển deal sang thắng ngay trên sheet đang mở, thẻ gợi ý không hiện ngay mà phải đợi khoảng nửa phút hoặc mở lại sheet. Ngược lại, deal rời thắng thì thẻ cũ vẫn còn đó một lúc.
  file: `apps/app/components/crm/record-sheet/goi-y-ke-hoach.tsx`
  severity: medium
  Đề xuất: new-contract

- **Thẻ Cổng Phạm vi xếp AC-1, AC-4 (và AC-6 ở bản HTML) vào mục «Sẽ KHÔNG làm / sẽ chặn»**
  Người dùng thấy gì: Thẻ người ký duyệt phạm vi xếp hai lời hứa chính (sinh gợi ý và đóng gợi ý) vào cột «sẽ không làm». Người ký có thể hiểu nhầm hệ thống hứa gì.
  file: `_acceptance/goi-y-mo-ke-hoach/card-plain.json`
  severity: medium
  Đề xuất: known-limits

- **dot-bien.mjs ghim thông điệp cho cặp (h) khác với thông điệp mà evals.yaml E11 đã khai**
  Người dùng thấy gì: Bằng chứng kiểm thử chứng minh một thông báo lỗi hơi khác với thông báo ghi trong mô tả. Người dùng cuối không thấy gì, nhưng người đọc hồ sơ nghiệm thu có thể bối rối.
  file: `_acceptance/goi-y-mo-ke-hoach/rang/dot-bien.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4: ô «đọc rỗng» của bảng quyền E3 coi mọi phản hồi lỗi là null, không ghim giá trị trả về**
  Người dùng thấy gì: Bài kiểm quyền đọc chưa phân biệt được «người khác nhận về trống» với «thủ tục bị lỗi». Nếu có lỗi, bài kiểm có thể vẫn xanh.
  file: `apps/api/test/goi-y-mo-ke-hoach.spec.ts`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/10 lỗi rơi vào file không bộ đo nào phủ (_acceptance/config.yaml, _acceptance/goi-y-mo-ke-hoach/card-plain.json) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
