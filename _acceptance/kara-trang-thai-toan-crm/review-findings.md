# Review findings: kara-trang-thai-toan-crm

## Trong hợp đồng

- **E4 was rewritten to expect wording that contradicts the signed AC-4, and the contract was not changed**
  file: `_acceptance/kara-trang-thai-toan-crm/evals.yaml:67`
  severity: medium
  AC: AC-4
  source: conventions
  detail: The signed AC-4 in contract.md:30 says the error title must read «Kara chưa tải được tóm tắt tuần». The round-1 fix changed loiKara in apps/app/lib/messages/okr-toan-canh.ts:117 to the verb phrase «tải tóm tắt tuần». KaraState builds the title from that phrase, so the screen now shows «Kara chưa tải tóm tắt tuần được». E4 in evals.yaml (and the kts case in apps/app/test/tro-ly-okr-tom-tat.dom.tsx:866) was then edited to require the new wording exactly (`expect(tieuDe).toBe("Kara chưa tải tóm tắt tuần được")`). contract.md was not amended. So the machine eval now checks text that differs from what the criterion promises: E4 passes against wording AC-4 does not allow, and it would fail on the wording AC-4 does promise. This breaks the rule that an eval must test what the criterion promises, and it happens under `enforcement: strict` without a re-signed contract. The deviation is recorded only as a decision (d-20261008T063518Z-12, cost_if_wrong refers it to the owner). Either amend AC-4 and have the owner re-approve it, or keep the AC-4 wording by adding a free-title variant to KaraState in packages/ui, which is what docs/design.md prescribes for a new variant.
  rationale: AC-4 hứa nguyên văn tiêu đề lỗi «Kara chưa tải được tóm tắt tuần»; màn hiện «Kara chưa tải tóm tắt tuần được» và E4 đã bị sửa theo chữ lệch, nên đúng tiêu chí AC-4 không đạt và không có mục Out of scope nào che chữ này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Timeline treats a failed "load more" or background refetch as a full load error and hides entries already loaded (r1)**
  Người dùng thấy gì: Khi bấm xem thêm hoạt động cũ mà bị lỗi mạng, các hoạt động đã hiện trước đó biến mất và thay bằng khung «Không tải được hoạt động». Bấm «Thử lại» sẽ tải lại từ đầu thay vì chỉ tải tiếp phần còn thiếu.
  file: `apps/app/components/crm/timeline/timeline.tsx`
  severity: medium
  Đề xuất: new-contract

- **Website activity also drops existing data on a refetch error (bare isError) (r1)**
  Người dùng thấy gì: Nếu việc làm mới ngầm mục «Hoạt động trên website» bị lỗi trong lúc người dùng đang đọc, nội dung đang xem bị thay bằng khung lỗi dù dữ liệu cũ vẫn dùng được.
  file: `apps/app/components/crm/website-activity.tsx`
  severity: medium
  Đề xuất: known-limits

- **Loading skeleton copied into two features instead of moved into packages/ui (r1)**
  Người dùng thấy gì: Hai chỗ đang tự vẽ cùng một khung chờ, nên sau này sửa kiểu khung chờ phải sửa hai nơi và dễ lệch nhau. Người dùng không thấy khác biệt ngay.
  file: `apps/app/components/crm/record-sheet/contact-plans.tsx`
  severity: low
  Đề xuất: known-limits

- **docs/vong-doi.md still says the archive toast with Undo is not a shared piece (r1)**
  Người dùng thấy gì: Tài liệu hướng dẫn vẫn nói chưa có thông báo lưu trữ có Hoàn tác dùng chung, nên lượt làm sau có thể dựng lại từ đầu thay vì dùng bản đã có.
  file: `packages/ui/src/lib/bao-luu-tru.ts`
  severity: low
  Đề xuất: known-limits

- **Timeline replaces entries already on screen with the error box when 'Show older' or a background refetch fails (r1)**
  Người dùng thấy gì: Khi bấm «Tải thêm» và bị lỗi, toàn bộ hoạt động đang xem biến mất và chỉ còn khung lỗi. Người dùng mất chỗ đang đọc và phải tải lại cả danh sách.
  file: `apps/app/components/crm/timeline/timeline.tsx`
  severity: medium
  Đề xuất: new-contract

- **Harmless no-op agent outcomes now read as 'Kara couldn't save' and force the steps panel open (r1)**
  Người dùng thấy gì: Khi Kara bỏ qua một việc vì không cần làm, ví dụ liên hệ đã có ảnh rồi, bước đó vẫn hiện «Kara chưa lưu được» như một thất bại và tự mở ra. Người dùng có thể tưởng Kara làm hỏng việc.
  file: `apps/app/components/crm/agent-panel.tsx`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E12 đọc chữ điều kiện của `return null`, nên lỗi đúng loại nó canh vẫn qua (r1)**
  Người dùng thấy gì: Một lần sửa sau này có thể làm mục «Hoạt động trên website» hoặc «30 ngày đầu» lại biến mất lúc đang tải hay bị lỗi mà bước kiểm tự động không báo đỏ.
  file: `_acceptance/kara-trang-thai-toan-crm/rang/chu.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E9 gọi hàm chữ `created`, không đo toast mà ngăn tạo thật hiện ra (r1)**
  Người dùng thấy gì: Nếu sau này một ngăn tạo mới hiện nhầm tên hay nhầm chữ trên thông báo «Đã thêm …», bước kiểm tự động vẫn có thể báo xanh.
  file: `_acceptance/kara-trang-thai-toan-crm/rang/chu.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (lời hứa là quan hệ): E7 cắt chuỗi «hoàn tác hỏng → Khôi phục trong menu vẫn dùng được» bằng cách dựng ngăn mới (r1)**
  Người dùng thấy gì: Sau khi Hoàn tác bị lỗi, nếu menu của ngăn bị khoá hoặc không cho Khôi phục nữa thì bước kiểm tự động vẫn không phát hiện.
  file: `apps/app/test/kara-trang-thai-luu-tru.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính đứng một mình): ô «chưa nhận diện», «rỗng» của E2 và ô «rỗng» của E3 chỉ kiểm tiêu đề vắng (r1)**
  Người dùng thấy gì: Nếu một mục bị lỗi và biến mất hoàn toàn thay vì ẩn đúng cách khi chưa có dữ liệu, bước kiểm tự động vẫn có thể báo xanh nhầm.
  file: `apps/app/test/kara-trang-thai-vung.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên ma trận nhưng chỉ có điểm-case): E4 khai «Ba ô» nhưng lệnh chỉ chạy hai test, không có ô quá hạn và không kiểm vắng Shimmer (r1)**
  Người dùng thấy gì: Khối Tóm tắt tuần có thể vô tình giữ lại hiệu ứng chờ cũ hoặc mất dòng «Tải lại» khi chờ quá lâu mà bước kiểm tự động không báo.
  file: `apps/app/test/tro-ly-okr-tom-tat.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (lời hứa là quan hệ): bước 1 của E13 kiểm «Thử lại» có mặt ở cả trang, không kiểm nó nằm trong khung lỗi web (r1)**
  Người dùng thấy gì: Nếu khung «Không tải được hoạt động trên website» mất nút «Thử lại» nhưng một vùng khác trên trang vẫn có nút đó, bước kiểm tự động vẫn báo đạt.
  file: `_acceptance/kara-trang-thai-toan-crm/rang/man.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
