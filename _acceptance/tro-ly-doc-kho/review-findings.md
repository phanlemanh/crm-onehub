# Review findings: tro-ly-doc-kho (round 3)

## Trong hợp đồng

- **Shape 1 (measures the helper/config, not the output): E12 ZDR never runs the tro_ly_kho model, only modelTaiLieu() directly**
  AC: AC-12
  file:line: `apps/agent/test/tro-ly-kho-ranh-gioi.spec.ts:200`
  severity: high
  source: measurement
  detail: E12 promises "Chay mot phien tren model gia ghi lai params: moi loi goi co providerOptions.gateway.zeroDataRetention === true". The test at lines 200-235 calls `modelTaiLieu("hoi", env, tao)` itself and runs one bare `doGenerate({prompt: []})` on it. The only check on the real agent is line 193: `troLyKho.model.fallback === TAI_LIEU_AGENT.hoi.maModel`. agent.ts declares `model: defineDynamic({ fallback: maModel, events: { "step.started": () => modelTaiLieu("hoi") } })`, and the test never calls that `step.started` resolver and never runs a session. Failing case: change agent.ts so step.started returns the bare string `TAI_LIEU_AGENT.hoi.maModel`, or drop the events key so the plain fallback id is used. Every production call then goes out without ZDR, and all of tlk-ranh-gioi stays green. Only the call that `daGoi[0]` records is checked, and it is the test's own call, not a call the agent made.
  rationale: AC-12 hứa chạy một phiên trên model giả và mọi lời gọi model mang ZDR; phép đo chỉ gọi hàm dựng model trực tiếp, nên đổi cách agent chọn model vẫn xanh, tức AC-12 chưa được chứng minh.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **nop_tra_loi and the other tro_ly_kho tools hardcode limits that TAI_LIEU_HOI already owns, and they disagree with it**
  Người dùng thấy gì: Một số giới hạn độ dài của trợ lý kho nằm rải ở nhiều chỗ và có chỗ lệch nhau. Sau này chỉnh giới hạn ở một nơi có thể quên nơi khác, nhưng hiện chưa làm người dùng thấy sai.
  file: `apps/agent/agent/subagents/tro_ly_kho/tools/nop_tra_loi.ts`
  severity: medium
  Đề xuất: known-limits

- **New tai-lieu mutations refresh the cache by listing query keys at the call site instead of going through useCrmCache**
  Người dùng thấy gì: Sau khi đặt hạn xác minh cho một trang, tab Sức khoẻ đang mở sẵn có thể chưa hiện trang đó trong mục Quá hạn xác minh cho tới khi tải lại trang.
  file: `apps/app/app/(app)/[slug]/tai-lieu/suc-khoe-viec.tsx`
  severity: medium
  Đề xuất: new-contract

- **MA_LOI_MAY_CHU = 500 and the 'server message or generic' error logic are copied into four new files**
  Người dùng thấy gì: Cùng một đoạn xử lý thông báo lỗi bị chép ở bốn màn Kho tài liệu. Người dùng không thấy khác biệt; chỉ tốn công bảo trì.
  file: `apps/app/app/(app)/[slug]/tai-lieu/hoi.tsx`
  severity: low
  Đề xuất: wont-fix

- **The stored taiLieuHoi.lyDo shape is parsed by separate local schemas in the API and the agent, not one exported parser**
  Người dùng thấy gì: Lý do một câu hỏi bị từ chối hoặc lỗi được đọc theo hai cách viết riêng ở hai nơi. Nếu sau này đổi danh sách lý do mà quên một nơi, câu hỏi có thể báo lỗi lạ.
  file: `apps/api/src/tai-lieu/tai-lieu-hoi.service.ts`
  severity: low
  Đề xuất: known-limits

- **Some «Ask» tab text comes from Vietnamese-only constants in @crm/validation, skipping the en/vi message catalog**
  Người dùng thấy gì: Người dùng chọn tiếng Anh vẫn thấy câu từ chối, câu báo lỗi và cảnh báo quá hạn bằng tiếng Việt trong tab Hỏi.
  file: `apps/app/app/(app)/[slug]/tai-lieu/hoi-tra-loi.tsx`
  severity: low
  Đề xuất: known-limits

- **Câu hỏi kho bị xếp sau cả lượt drainAll, hết hạn 3 phút trước khi kịp gửi**
  Người dùng thấy gì: Khi hệ thống đang bận xử lý nhiều việc nền, câu hỏi vừa gõ ở tab Hỏi hoặc qua Zalo có thể chờ quá lâu và chỉ nhận lại câu Chưa trả lời được lúc này dù trang có đáp án.
  file: `apps/agent/agent/channels/crm.ts`
  severity: medium
  Đề xuất: new-contract

- **Hook đóng câu và hook ghi chi phí của trợ lý kho chỉ log error.name, mất nguyên nhân**
  Người dùng thấy gì: Khi việc đóng câu hỏi hoặc ghi chi phí bị hỏng, người vận hành không có đủ thông tin trong log để biết vì sao.
  file: `apps/agent/agent/hooks/dong-tro-ly-kho.ts`
  severity: low
  Đề xuất: known-limits

- **drainHoiKho nuốt lý do từ chối của guiHoiKho**
  Người dùng thấy gì: Khi một câu hỏi không mở được phiên trả lời, người dùng thấy Chưa trả lời được nhưng người vận hành không có dấu vết nào để tìm nguyên nhân.
  file: `apps/agent/agent/lib/tai-lieu-hoi-phien.ts`
  severity: low
  Đề xuất: known-limits

- **Nút Thử lại sau khi «Hỏi lại» thất bại gửi nội dung ô nhập, không gửi câu đang hỏi lại**
  Người dùng thấy gì: Nếu bấm Hỏi lại mà gặp lỗi mạng, nút Thử lại có thể không làm gì, hoặc gửi nhầm câu đang soạn dở thay cho câu cần hỏi lại.
  file: `apps/app/app/(app)/[slug]/tai-lieu/hoi.tsx`
  severity: low
  Đề xuất: known-limits

- **Lỗi workspace.get bị .catch(() => null) làm tab Hỏi biến mất không báo**
  Người dùng thấy gì: Nếu lúc mở Kho tài liệu có một lỗi tạm thời, tab Hỏi biến mất mà không có thông báo, người dùng tưởng mình mất quyền hỏi.
  file: `apps/app/app/(app)/[slug]/tai-lieu/page.tsx`
  severity: low
  Đề xuất: known-limits

- **Shape 1 (Đo CHỈ DẪN thay vì ĐẦU RA) / Shape 4 (assertion that cannot fail): E15 red run exits 1 only because the 3-question set has no 'khong-co' questions**
  Người dùng thấy gì: Kiểm tra chứng minh bộ chấm biết báo đỏ khi trợ lý trả lời sai trang thực ra luôn đỏ vì bộ câu thử thiếu câu phải từ chối, nên chưa chứng minh được bộ chấm bắt lỗi trong bộ câu thật.
  file: `_acceptance/tro-ly-doc-kho/bo-do/chieu-do-3-cau.json`
  severity: high
  Đề xuất: new-contract

- **Shape 4 (assertion that cannot fail): E12 'result to the root agent has no page text' is built from hoiId only**
  Người dùng thấy gì: Bài kiểm tra không thể phát hiện nếu kết quả trợ lý kho trả về agent chính có lẫn chữ trong trang; việc chặn hiện dựa vào lớp lọc khác.
  file: `apps/agent/test/tro-ly-kho-ranh-gioi.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (assertion that cannot fail): E8 cases (1) and (3) never measure the root agent's routing, so 'no TaiLieuHoi row for c3' is vacuous**
  Người dùng thấy gì: Bài kiểm tra Zalo không thật sự thử việc bot tự nhận ra câu về quy định hay câu về thoả thuận, nên chưa chứng minh được bot chuyển đúng loại câu.
  file: `apps/agent/test/tro-ly-kho-zalo.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 (asserts presence while the promise is a relation): E4 case (ii) checks 'contains hoaHong' instead of 'ganNhat == search_pages results in order'**
  Người dùng thấy gì: Danh sách trang gần nhất kèm câu từ chối có thể sai thứ tự hoặc thiếu trang mà bài kiểm tra vẫn không phát hiện.
  file: `apps/agent/test/tro-ly-kho-nop.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 (relation promised, presence asserted): E5 uses one owner for all four pages, so 'the name of THIS page's owner' cannot be told apart**
  Người dùng thấy gì: Bài kiểm tra cảnh báo quá hạn dùng cùng một chủ trang cho mọi trang, nên không bắt được lỗi nêu nhầm tên chủ trang khác.
  file: `apps/agent/test/tro-ly-kho-nop.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture in the reader's shape): ctxConCua invents `session.parent`, which real eve child contexts do not have**
  Người dùng thấy gì: Bài kiểm tra các công cụ của trợ lý kho dùng ngữ cảnh phiên không giống thật, nên một số lỗi nhận biết phiên con có thể lọt qua.
  file: `apps/agent/test/support/tro-ly-kho-gia.ts`
  severity: medium
  Đề xuất: wont-fix

- **Shape 4 (negative assertion alone, no pinned message): E10 and E11 negative cells carry none of the contract's red pins**
  Người dùng thấy gì: Khi bài kiểm tra quyền xem câu chưa trả lời được hoặc báo sai đỏ, thông báo lỗi không nói rõ lỗi nào, khó đối chiếu với hợp đồng.
  file: `apps/api/test/tai-lieu-hoi-suc-khoe.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 5 (claims the full matrix, asserts a subset): E9 promises non-null tokenVao/tokenRa/chiPhiUsd/nhanKhoa on the 4 TRA_LOI rows, and the test never asserts it**
  Người dùng thấy gì: Bài kiểm tra nhật ký hỏi không kiểm tra từng câu trả lời có ghi token, chi phí và nhãn khoá, nên thiếu số liệu chi phí có thể không bị phát hiện.
  file: `apps/api/test/tai-lieu-hoi.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Shape 5 (matrix cell asserts fewer properties than promised): E2 never compares duyetLuc or xacMinhDen, and there is no 5-cell count**
  Người dùng thấy gì: Bài kiểm tra đọc trang không kiểm tra ngày duyệt và hạn xác minh trả về, nên sai ngày trong câu trả lời có thể không bị phát hiện.
  file: `apps/agent/test/tro-ly-kho-tim-doc.spec.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/20 lỗi rơi vào file không bộ đo nào phủ (apps/agent/agent/channels/crm.ts, apps/agent/test/support/tro-ly-kho-gia.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
