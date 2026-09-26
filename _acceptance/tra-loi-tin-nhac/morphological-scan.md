---
slug: tra-loi-tin-nhac
preset: test-matrix
at: 2026-09-25
---

# Quét không gian AC — tra-loi-tin-nhac

## Ngữ cảnh

- Sản phẩm: CRM nội bộ của OneHub, bot Zalo gửi tin nhắc buổi sáng về kế hoạch
  30 ngày đầu; vòng này cho người trả lời «xong n» để đánh dấu bước xong.
- Chân sản phẩm: đào repo — `apps/agent/agent/lib/zalo-nhan.ts`,
  `apps/agent/agent/lib/nhac-ke-hoach.ts`, `apps/agent/agent/lib/tin-nhac.ts`,
  `packages/db/src/onboarding-nhac.ts`, `apps/api/src/onboarding/onboarding-ghi.ts`,
  `docs/plan/lo-trinh-zalo.md` mục 4 (Vòng 3).
- Chân ngành (đã tra web ở brainstorm 25/09): Twilio Studio appointment reminders
  («reply 1 to confirm», nhánh «No Condition Matches»), Twilio conversation state
  hết hạn sau tối đa 4 giờ, Geekbot commands (vài từ đồng nghĩa cho một lệnh),
  bot Telegram `/done <n>` (số trượt khi danh sách đổi — lỗi phải tránh), Slack
  interactive messages (xác nhận lại trạng thái sau thao tác).

## Trục

- **Trục A · Tin trả lời:** một số hợp lệ | nhiều số hợp lệ | có số ngoài dải |
  có số trỏ mục không phải bước | «xong» thiếu số | câu khác | mã nối
  [thước CE: lộ trình Vòng 3 + `[NGÀNH: Twilio Studio — No Condition Matches]` +
  `[NGÀNH: Geekbot commands]`]
- **Trục B · Tin nhắc của người nhắn:** hôm nay đã gửi qua Zalo | hôm nay gửi qua
  Slack | hôm nay chưa chạy hay hết việc (`khong-viec`) | chỉ có tin hôm qua
  [thước CE: `[SUY-TỪ-REPO: apps/agent/agent/lib/nhac-ke-hoach.ts]` — bốn outcome và
  `payload.daGui`/`kenh`; `[NGÀNH: Twilio — state hết hạn]`]
- **Trục C · Trạng thái bước lúc trả lời:** chưa xong | đã xong trước | đã xoá |
  kế hoạch đã đóng
  [thước CE: `[SUY-TỪ-REPO: apps/api/src/onboarding/onboarding-ghi.ts]` —
  `buocCuaKeHoachMo`, `keHoachMo`, lối ra sớm khi không đổi]
- **Trục D · Người nhắn:** đã nối, thành viên | đã nối, vai `okr` | chưa nối | bị
  chặn vì mã sai
  [thước CE: `[SUY-TỪ-REPO: apps/agent/agent/channels/eve.ts]` (`repFromCrm` chặn
  `okr`), `[SUY-TỪ-REPO: packages/db/src/zalo-lien-ket.ts]` (`dangBiChan`),
  `[SUY-TỪ-REPO: apps/api/src/workspace/workspace.service.ts]` (gỡ thành viên xoá
  `ZaloLink`)]

Trục «loại mục» (quá hạn, sắp hạn, kế hoạch im, mốc ngày) không đứng riêng: nó chỉ
quyết một điều — mục có `stepId` hay không — nên gộp thành giá trị «số trỏ mục không
phải bước» của Trục A.

## Không gian

Tích đầy đủ 7 × 4 × 4 × 4 = 448 ô; phần lớn vô nghĩa vì các trục chặn nhau theo thứ
tự xử lý: D khác «đã nối, thành viên» thì A, B, C không được xét; B khác «hôm nay
Zalo» thì C không được xét; A khác lệnh hợp lệ thì C không được xét. Quét theo lát cắt
của D rồi B.

## Core

1. A một số × B Zalo hôm nay × C chưa xong × D thành viên — luồng chính (AC-2).
2. A nhiều số, nhiều cách viết — cú pháp và được cả hoặc không (AC-3).
3. A số ngoài dải — không ghi gì (AC-4).
4. A số trỏ «kế hoạch im» / «mốc ngày» — không ghi, trả đường dẫn (AC-5).
5. C đã xong trước, đã xoá, kế hoạch đóng (AC-6).
6. B Slack, chưa chạy, `khong-viec`, chỉ có hôm qua, ranh giới nửa đêm giờ VN (AC-7).
7. D `okr`, chưa nối, bị chặn; người A không chạm tin nhắc của B (AC-8).
8. A «xong» thiếu số, câu khác, mã nối — hướng dẫn và hồi quy (AC-9).
9. Tin nhắc đánh số khớp `daGui` (AC-1) — tiền đề của mọi ô trên.

## Later

- Hoàn tác trong chat («hoàn 2») — chủ kho chọn gỡ trên màn kế hoạch (brainstorm 25/09).
- Hiện «qua Zalo» trên dòng thời gian kế hoạch — chủ kho chọn chỉ ghi dữ liệu.
- Mục KR trong tin nhắc — chờ lượt 4 OKR; luật viết theo loại mục để cắm thêm.
- Mô hình hiểu câu khi cú pháp trượt — vòng 4 `hoi-crm-qua-zalo`.
- Trả lời trên Slack — kho chưa có đường nhận tin Slack nào.
- Từ đồng nghĩa ngoài «xong»/«done» (vd «x», «ok») — thêm khi có dữ liệu thật.

## Never

- Đánh dấu theo số của tin hôm qua — chủ kho chọn chỉ nhận tin hôm nay; bot Telegram
  `/done <n>` cho thấy số trượt là lỗi ghi nhầm bản ghi.
- Đánh dấu một nửa khi có số sai — chủ kho chọn được cả hoặc không.
- Nhóm Zalo — lộ trình mục 6: nền tảng gắn `GROUP` là bản thử, nhắc là tin riêng.
- Lưu nội dung tin để kiểm lại — trái luật «message text is never stored or logged»
  của `docs/agent.md`.

## Cross-cutting áp mọi ô Core

- Chống trùng: cùng `message_id` giao hai lần không ghi hai lần, không trả lời hai lần.
- Nguyên tử: lỗi DB giữa chừng thì không bước nào đổi, webhook trả 500 để Zalo gửi lại.
- «Hôm nay» là ngày giờ VN (`ngayVN`), không phải UTC.
- Nội dung tin không vào DB, không vào log.
- Người đứng tên dấu vết là người nhắn, nguồn ghi `source: "zalo"`.
- Câu trả lời là một dòng, trong trần ký tự của Zalo; `APP_URL` vắng thì không đường dẫn.
