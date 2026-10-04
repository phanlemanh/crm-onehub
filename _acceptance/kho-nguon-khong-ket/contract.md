---
schema_version: 1
feature: «Nguồn không kẹt mãi ở «đang đọc» khi máy soạn lỗi; «Soạn lại» chạy được; hộp chèn liên kết báo lỗi thay vì «không trang nào khớp»»
slug: kho-nguon-khong-ket
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui]
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-04T08:37:26Z
design_doc: docs/superpowers/specs/2026-10-04-kho-nguon-khong-ket-design.md
---

# Acceptance Contract: kho-nguon-khong-ket

## Context

Từ 26/10 mọi phòng ban nạp tệp vào Kho tài liệu. Một lỗi thoáng qua khi máy soạn đọc tệp để
nguồn kẹt mãi ở «đang đọc», và «Soạn lại» từ chối chính nguồn đó (#22). Hộp chèn liên kết báo
«Không có trang nào khớp.» cả khi lượt tìm lỗi (#20). Bài kiểm liên kết chưa đo tiền tố
workspace thật (#21, Ngoài-12 của `tim-va-dieu-huong-kho`).

Source input: `docs/plan/lo-trinh-kho-tai-lieu.json` hàng l4a; `opportunity.md` của hồ sơ này.

## Criteria

- AC-1: Given một nguồn có việc `soan-tu-nguon` đang chạy, When đọc tệp từ lưu trữ ném lỗi, hoặc bóc chữ ném lỗi, Then nguồn ở `LOI` với lý do cố định «Chưa đọc được tệp — bấm Soạn lại để thử lần nữa.», việc đã đóng với cùng lý do, `chaySoanTuNguon` không ném ra ngoài, và thông điệp lỗi gốc không nằm trong `lyDo`; còn các ca lỗi đã có (không tải được tệp, băm lệch, cần gõ tay, thiếu quy tắc viết) giữ đúng lý do cũ của chúng.
- AC-2: Given nguồn ở `CHO_DOC` mà không việc `soan-tu-nguon` nào của nó còn mở (đã bị cho nghỉ, đã đóng, hoặc không có), When nhịp dispatch chạy, Then nguồn về `LOI` với lý do «Máy soạn dừng giữa chừng — bấm Soạn lại để thử lần nữa.»; còn nguồn `CHO_DOC` có việc còn mở (lease sống hay đang chờ lượt thử) và nguồn ở mọi mức khác `CHO_DOC` (`CHO_SOAN`, `DANG_SOAN`, `DA_SOAN`, `CAN_GO_TAY`, `LOI`) thì giữ nguyên cả `lyDo`; chạy lần hai không đổi thêm hàng nào; và cận «lease × số lượt thử + một nhịp dispatch mỗi lượt» của làn chạy việc này không vượt 30 phút.
- AC-3: Given một nguồn đã về `LOI` theo AC-1 hoặc AC-2, When người tải nó bấm «Soạn lại» (`taiLieuNguon.soanLai`), Then nguồn về `CHO_DOC` không lý do, có đúng một việc `soan-tu-nguon` mới mở cho nó, và chạy việc đó với tệp đọc được thì nguồn đi tiếp `CHO_SOAN`.
- AC-4: Given hộp chèn liên kết trang đang mở, When lượt tìm mới nhất (≥ 2 chữ) bị từ chối, Then ô trống hiện «Chưa tìm được trang — thử gõ lại.» chứ không phải «Không có trang nào khớp.»; lượt mới nhất trả rỗng thì vẫn hiện «Không có trang nào khớp.»; lượt mới nhất trả về trang sau một lượt lỗi thì câu lỗi biến mất và danh sách hiện; lượt cũ bị từ chối về muộn sau khi lượt mới đã trả về trang thì không hiện câu lỗi; sau một lượt lỗi, gõ lùi còn dưới 2 chữ thì hiện «Gõ ít nhất hai chữ.», và đóng rồi mở lại hộp thì không còn câu lỗi.
- AC-5: Given chữ mới `loiTim` của hộp chèn liên kết, When đọc bảng chữ ở hai ngôn ngữ, Then có đúng câu tiếng Việt và câu tiếng Anh đã khai, và khoá được ghim ở `messages-guard`.
- AC-6: Given màn soạn trang thật (`ManSoan`) dưới workspace `kho-thu`, When chèn liên kết tới một trang tìm được qua hộp chèn liên kết rồi lưu, Then markdown được gửi đi mang href đúng `/kho-thu/tai-lieu/<slug trang>`, với đường dẫn do `ManSoan` dựng chứ không do fixture viết sẵn.
- AC-7: Given màn soạn trang chạy thật trên bàn đo riêng của cây, When lượt tìm trang của hộp chèn liên kết bị chặn, Then người dùng thấy câu «Chưa tìm được trang — thử gõ lại.» trong hộp ở khổ 1440 và 390, không thấy «Không có trang nào khớp.», hộp không tràn ngang; và trên cùng bàn đo, một từ không khớp trang nào (lượt tìm không bị chặn) vẫn hiện «Không có trang nào khớp.».
- AC-8: Given một kho có nguồn ở `CHO_DOC`, `CHO_SOAN`, `DANG_SOAN` với việc `soan-tu-nguon` mới nhất tạo trước và sau mốc 30 phút, cộng nguồn `LOI` với hai lý do, When chạy `rang/dem-ket.ts`, Then nó in đúng số nguồn kẹt quá 30 phút ở từng mức `CHO_DOC`/`CHO_SOAN`/`DANG_SOAN` (`CHO_DOC`, `CHO_SOAN` tính từ lúc tạo việc `soan-tu-nguon` mới nhất; `DANG_SOAN` tính từ `soanLuc`), không đếm nguồn dưới 30 phút (kể cả 29 phút) và không đếm `DA_SOAN`, `CAN_GO_TAY` và số nguồn `LOI` theo lý do, và không ghi hàng nào.

## Coverage

Quét bằng skill morphological-scan, preset test-matrix.

- Trục A — điểm hỏng trên đường đọc nguồn: `kho.doc` ném | `docChu` ném | tiến trình chết giữa chừng (lease hết, việc bị cho nghỉ) | lỗi đã có nhánh (`khongTai`, `bamLech`, `can-go-tay`, `thieuQuyTac`) [thước CE: SUY-TỪ-REPO `apps/agent/agent/lib/tai-lieu-soan.ts:49-75`; Ngoài-11/19 của `may-soan-de-xuat`]
- Trục B — việc `soan-tu-nguon` của nguồn: lease sống | chờ lượt thử | đã cho nghỉ (`retireExhausted`) | đã đóng | không có [thước CE: SUY-TỪ-REPO `apps/agent/agent/lib/tasks.ts`, `docs/agent.md` «Stale rows»; NGÀNH: Sidekiq `sidekiq_retries_exhausted` — hết lượt thử thì đánh dấu bản ghi nghiệp vụ hỏng]
- Trục C — trạng thái nguồn: `CHO_DOC` | `CHO_SOAN` | `DANG_SOAN` | `DA_SOAN` | `LOI` | `CAN_GO_TAY` [SUY-TỪ-REPO `apps/api/src/tai-lieu/tai-lieu-nguon.service.ts`]
- Trục D — kết quả lượt tìm của hộp chèn liên kết: dưới tối thiểu | có kết quả | rỗng | lỗi | lỗi cũ về muộn sau lượt mới [SUY-TỪ-REPO `packages/ui/src/components/trinh-soan-lien-ket-trang.tsx`]
- Trục E — người gọi «Soạn lại»: người tải | người khác không có quyền [SUY-TỪ-REPO `dieuKienSoanLai`]
- Core: A1/A2 × B lease sống → AC-1 · A4 → đối chứng của AC-1 (giữ lý do cũ) · A3 × B nghỉ/đóng/không có × C `CHO_DOC` → AC-2 · B lease sống/chờ × C `CHO_DOC` và đủ năm giá trị C khác → đối chứng của AC-2 · C `LOI` × E người tải → AC-3 · D lỗi/rỗng/có/lỗi-cũ-muộn → AC-4, AC-7 · tiền tố workspace → AC-6 · đường đo → AC-8.
- Later: C `CHO_SOAN` kẹt vì gửi máy soạn lỗi lặp; E người khác (đã có kiểm quyền ở `dieuKienSoanLai`, không đổi); báo người nạp qua Zalo khi nguồn `LOI`.
- Never: tự thử lại lỗi thoáng qua sau khi đã `LOI` — đánh đổi đã chọn (entry d-20261004T080602Z-2 trong decisions.jsonl).

## Đường đo

- Thước: số nguồn kẹt quá 30 phút ở `CHO_DOC`/`CHO_SOAN`/`DANG_SOAN` · số từ: bảng `taiLieuNguon` nối việc `soan-tu-nguon` mới nhất trong `agentTask`, đếm bằng `rang/dem-ket.ts` · bảo đảm bởi: AC-8
- Thước: mọi nguồn `LOI` soạn lại được · số từ: số nguồn `LOI` theo lý do từ `rang/dem-ket.ts`, đối chiếu lượt «Soạn lại» trong phiên nghiệm thu · bảo đảm bởi: AC-3, AC-8
- Thước: lần người viết báo «không tìm thấy trang» khi trang có thật · số từ: phiên nghiệm thu hỏi người viết trang · bảo đảm bởi: đã có sẵn: phiên nghiệm thu (`/acceptance-gate:uat-session`)

## Out of scope

- Tự thử lại lỗi thoáng qua sau khi nguồn đã về `LOI`: người nạp bấm «Soạn lại».
- Nguồn kẹt ở `CHO_SOAN` khi gửi máy soạn lỗi lặp lại.
- Báo người nạp qua Zalo hay email khi nguồn về `LOI`.
- Đổi giao diện màn Nguồn; lý do `LOI` đã hiện ở đó.

## Notes

- Không migration: lưới mồ côi tìm qua `agentTask.payload->>'nguonId'`; tải lên và soạn lại ghi nguồn và việc trong cùng transaction (`tai-lieu-nguon.service.ts:159-220`, `350-355`).
- Bỏ design-pass theo chủ kho duyệt 04/10 (entry `bỏ design-pass` trong decisions.jsonl); khung hình thật ở AC-7.
