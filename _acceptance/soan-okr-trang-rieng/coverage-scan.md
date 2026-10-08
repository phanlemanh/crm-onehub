---
slug: soan-okr-trang-rieng
at: 2026-10-07T13:40:00Z
preset: entity-feature (thực thể = dòng bản nháp), chất vấn lại trục
---

# Quét độ phủ — K2 Soạn OKR trang riêng

## Ngữ cảnh

- Sản phẩm: OneHub Center (CRM nội bộ của OneHub), khu OKR — chân sản phẩm: đào repo
  [SUY-TỪ-REPO: CLAUDE.md, docs/ai-ux.md, docs/chat-ui.md, apps/app/app/(app)/[slug]/okr/soan/, packages/validation/src/okr-cuoc-soan.ts].
  Không có mục `## Product Context` trong CLAUDE.md; kho đủ đồ để suy.
- Chân ngành: hội thoại hẹp cạnh vật phẩm rộng có chấp nhận từng dòng hay cả nhóm —
  [NGÀNH: ChatGPT Canvas; Claude Artifacts; Microsoft Copilot Pages; Copilot in Word «Accept / Accept all»;
  Gemini trong Google Docs; Perdoo «Import selected»; WorkBoard Co-Author; Tability] — danh sách và URL ở đề xuất
  04/10 `.acceptance-runs/dieu-phoi-1410/nguon/lai-thu-prod-0410/de-xuat-kara.html` mục «Nguồn».

Preset entity-feature đòi trục vòng đời · người × quyền · vào–ra · thời gian. Chất vấn: «người × quyền» đã do
lượt trước đóng (`soan-okr-quyen.spec.ts`, cổng `congCuoc` của API) và K2 không đổi quyền → không là trục của
lượt này, ghi Never. «Vào–ra» rút về một trục nhỏ (vào: Kara nộp; ra: Đưa vào) nằm trong trục A. «Thời gian»
thành trục C (trạng thái của Kara và cuộc). Thêm trục D (hiển thị) vì lượt này đổi khung.

## Trục

- **Trục A1 — việc Kara làm với một dòng:** thêm · sửa chữ · chuyển sang Mục tiêu khác · bỏ khỏi bản nháp
  [thước CE: `soBanNhap` trong `luat-ban-nhap.ts` (bốn nhãn vua-them / vua-sua / vua-chuyen / da-bo) — SUY-TỪ-REPO]
- **Trục A2 — việc người làm với một dòng:** nhận · sửa rồi nhận · bỏ qua · nhận cả nhóm · hoàn tác · gõ số ·
  hỏi Kara về dòng · đưa vào
  [thước CE: `docs/ai-ux.md` §5–6; ghi chú K2 trong `docs/plan/lo-trinh-okr.json`; NGÀNH: Copilot «Accept / Accept all», Perdoo «Import selected»]
- **Trục B — loại dòng:** Mục tiêu · KR có số · KR mốc · căn chỉnh
  [thước CE: `DongSoan` trong `soan/kieu.ts`, `canSo` — SUY-TỪ-REPO]
- **Trục C — trạng thái của Kara và cuộc:** rảnh · đang soạn · lỗi/hỏng · hết lượt · chưa cấu hình ·
  cuộc đóng · đã đưa vào
  [thước CE: bảng §7 `docs/ai-ux.md`; `useCuocSoan` (khoaSoan, hong, hetLuot, cuocDong, chuaCauHinh) — SUY-TỪ-REPO]
- **Trục D — hiển thị:** rộng có thanh kéo (≥ 641 px) · hẹp hai tab (≤ 640 px) · sáng · tối · bàn phím
  [thước CE: `SOAN_UI.khoHep`; `~/.claude/rules/web/testing.md` (320–1920); web-design-guidelines (focus, URL là trạng thái)]

A2 có 8 giá trị (> 7): đã thử tách «quyết» (nhận, sửa rồi nhận, bỏ qua, nhận nhóm, hoàn tác) khỏi «chuẩn bị»
(gõ số, hỏi Kara, đưa vào) — hai nửa vẫn phụ thuộc nhau (nhận nhóm đòi số đã gõ), nên giữ một trục và nhận cờ.

## Không gian (lát cắt theo A2 × B, rồi A1 × C × D)

A2 × B = 32 ô; gạch vô nghĩa: «sửa rồi nhận» × căn chỉnh (căn chỉnh không có chữ để sửa), «gõ số» × {Mục tiêu,
KR mốc, căn chỉnh}, «nhận cả nhóm» × {căn chỉnh} (không tính số), «đưa vào» là việc của cả bản nháp nên một ô.
Còn 24 ô có nghĩa. A1 × C: 28 ô, 12 có nghĩa (Kara chỉ đổi dòng khi đang soạn; các trạng thái khác chỉ quyết
định khoá hay không). D cắt ngang mọi ô màn.

## Core

1. Nhận / sửa rồi nhận / bỏ qua × mọi loại dòng → mỗi lần thành biên nhận có Hoàn tác (AC-5).
2. Hoàn tác × Mục tiêu đã nhận có KR đã quyết, × Mục tiêu đã bỏ qua kéo KR theo (AC-5).
3. Nhận cả nhóm × Mục tiêu chờ có KR đã đủ số / KR mốc (AC-6).
4. Mọi quyết × Kara đang soạn → khoá kèm lý do; hết bận mở lại (AC-7).
5. A1 (thêm, sửa, chuyển, bỏ) × một lần nộp → một mốc có tóm tắt, nối hai chiều với dòng; dòng vừa sửa có diff (AC-8).
6. Hỏi Kara × một dòng → chip ngữ cảnh (AC-10). Quyết trên bảng → hội thoại biết (AC-11).
7. Gõ số × Kara nộp lại / đổi tab / tải lại → số còn (AC-12).
8. Đưa vào × còn thiếu số → danh sách bấm tới ô (AC-13).
9. C (lỗi, hết lượt, chưa cấu hình, cuộc đóng, đã đưa vào) → một khuôn trạng thái ở đầu bản nháp và hội thoại (AC-3).
10. D → khung co giãn bằng chuột và phím, hai tab ở khổ hẹp theo URL, không tràn ngang (AC-2, AC-15).

## Later

- Phiên bản của từng lần nộp để quay về (`checkpoint` của AI Elements) — cần lưu phía server.
- «Vì sao» có nguồn (`inline-citation`) — cần đổi lược đồ `viSao`.
- Hàng đợi «quyết trên bảng» chưa gửi sống qua tải lại trang — mất khi tải lại trước lượt kế; Kara vẫn biết qua
  `giuNguyen` khi nộp.
- Kéo thả đổi thứ tự Mục tiêu và KR trên bản nháp.

## Never

- Trục người × quyền — K2 không đổi quyền; `soan-okr-quyen.spec.ts` của lượt trước giữ.
- Sửa câu lệnh của Kara (`apps/agent-okr/agent/instructions.md`) — ngoài ranh giới đợt; Kara đọc chip và dòng hệ
  thống như chữ thường.
- Hoàn tác sau khi đã Đưa vào — khi đó Mục tiêu và KR đã là bản ghi thật, vòng đời của chúng thuộc màn OKR.
- Sheet rộng ~1120 px thay trang riêng — chủ kho chốt trang riêng 04/10.

## Cross-cutting áp mọi ô Core

- Chữ qua `apps/app/lib/messages/okr-soan.ts` cả hai tiếng; dữ liệu người nhập mang `translate="no"`.
- Một nút tô màu mỗi dòng; trạng thái đang làm/lỗi theo §7 `docs/ai-ux.md`; không `Spinner` trần.
- Focus nhìn thấy được, phím tới được mọi nút, `prefers-reduced-motion` khi cuộn tới dòng.
- Lỗi ghi của API hiện tại dòng, không mất chữ đã sửa.
