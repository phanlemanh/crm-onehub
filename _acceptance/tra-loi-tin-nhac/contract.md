---
schema_version: 1
feature: Người nhận tin nhắc qua Zalo trả lời «xong 2» (hay «xong 1 3») thì các bước đó của tin sáng nay được đánh dấu xong bằng đúng thủ tục ghi của màn kế hoạch, bot xác nhận một dòng; tin nhắc Zalo đánh số dòng
slug: tra-loi-tin-nhac
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, docs]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-09-25T09:54:10Z
design_doc: docs/superpowers/specs/2026-09-25-tra-loi-tin-nhac-design.md
---

# Acceptance Contract: tra-loi-tin-nhac

## Context

Vòng 3 của `docs/plan/lo-trinh-zalo.md`. Tin nhắc buổi sáng qua Zalo liệt kê tới 10
việc (bước quá hạn, sắp hạn, kế hoạch im, mốc ngày) nhưng người nhận không làm được
gì từ Zalo: Zalo Bot API không có nút, và bot chỉ đáp một câu cố định. Vòng này cho
người trả lời bằng chữ. Chủ kho mở vòng ngày 25/09, trước khi đủ ba điều kiện mở của
lộ trình (xem `decisions.jsonl`).

Người dùng: thành viên đã nối Zalo và nhận tin nhắc. Source input: yêu cầu của chủ kho
25/09 · lộ trình mục 4 · brainstorm 25/09 (bốn lựa chọn và cách A) · design doc ở
`design_doc`.

Trong mọi AC: «tin nhắc hôm nay» là hàng `AgentTask` loại `nhac-ke-hoach` có subject
`user:<người>:<ngayVN(lúc nhận)>`; «gửi xong qua Zalo» là hàng đó có `payload.kenh =
"zalo"` và `payload.daGui` khác rỗng; «mục n» là `payload.daGui[n-1]`. Mọi tin trả lời
đi qua `nhanWebhook` thật, DB thật, Zalo giả bắt `sendMessage`. Mọi hàng tin nhắc
trong AC được dựng bằng chính bên ghi thật (`lenLichNhac` rồi `chayNhac` với Zalo giả
hay Slack giả), không chèn `AgentTask` bằng tay; bên đọc đọc `payload` bằng
`parseNhacPayload` của `@crm/validation/nhac-ke-hoach`, cùng schema bên ghi dùng.

## Criteria

- AC-1: Given người A có bốn việc thuộc đủ bốn loại mục và chọn kênh Zalo, When `chayNhac` gửi tin nhắc qua Zalo, Then trong văn bản gửi đi, dòng việc thứ n bắt đầu bằng `n. ` với n = 1..số mục của `daGui`, dòng số n thuộc đúng kế hoạch `daGui[n-1].planId` (đường mở kế hoạch trên dòng đó) và nằm dưới tiêu đề nhóm của `daGui[n-1].loai`; tin có đúng một dòng gợi ý chứa `xong 2`; với mười hai việc tên dài, văn bản không vượt `ZALO.tranKyTu` kể cả dòng gợi ý và số dòng đánh số bằng độ dài `daGui`; When cùng dữ liệu gửi qua Slack, Then văn bản Slack không có dòng nào bắt đầu bằng một số và dấu chấm, và không có dòng gợi ý.
- AC-2 (cross-layer): Given A đã nối Zalo ZA, tin nhắc hôm nay gửi xong qua Zalo và mục 2 là bước S chưa xong, When ZA nhắn `xong 2`, Then đọc lại từ DB: `S.completedAt` khác null; có đúng một `Activity` loại `PLAN_CHANGE` mới với `meta` = `{kind: "buoc.xong", stepId: S, nhan: <nhãn S>, giaoLucXong: <người được giao S>, source: "zalo"}`, `createdById` = A, `planId` = kế hoạch của S; mọi bước khác của các mục trong `daGui` giữ nguyên `completedAt`; ZA nhận đúng một `sendMessage`, văn bản một dòng (không chứa `\n`) chứa cặp `2 · <nhãn S>` và tên công ty của kế hoạch S; và dấu vết đó đọc được qua đường đọc dòng thời gian của API: thủ tục liệt kê hoạt động theo `planId` của S trả đúng một mục `buoc.xong` của S, và `meta` của nó qua `onboardingActivityMeta.safeParse` thành công.
- AC-3: Given mỗi ô một tin nhắc mới với mục 1 và mục 3 là hai bước chưa xong, When người nhắn lần lượt `Xong 1 3`, `xong 1,3`, `done 1 3`, `  XONG  1 , 3 `, `xong 3 1 3`, Then ở mọi ô cả hai bước có `completedAt`, đúng hai `Activity` `buoc.xong` mới mang `source: "zalo"`, và một câu xác nhận một dòng chứa cặp `1 · <nhãn bước mục 1>` và cặp `3 · <nhãn bước mục 3>`; và `docLenh` trả `{lenh: "xong", so: [1, 3]}` cho năm chuỗi đó, `{lenh: "xong-thieu-so"}` cho `xong` và `Xong  `, `null` cho `xong đi`, `xong 0`, `xong -1`, `xong 1.5`, `123456`, `cảm ơn`, `xonG2a`.
- AC-4: Given tin nhắc hôm nay có bốn mục, When người nhắn `xong 2 9`, Then không bước nào đổi `completedAt` và không `Activity` mới; câu trả lời một dòng nêu `9` và dải `1–4`.
- AC-5: Given tin nhắc hôm nay có mục k là «kế hoạch im» và mục m là «mốc ngày» của kế hoạch P, mục 1 là bước chưa xong, When người nhắn `xong 1 k`, và ở ô khác `xong 1 m`, Then không bước nào đổi và không `Activity` mới ở cả hai ô; câu trả lời nêu số k (hay m), nói mục đó không đánh dấu xong được, và chứa đường mở kế hoạch `?record=plan:<P>` khi có `APP_URL`, không chứa đường dẫn nào khi `APP_URL` vắng.
- AC-6: Given tin nhắc hôm nay với mục 2 và mục 3 là hai bước, When (a) bước mục 2 đã được đánh dấu xong trước đó bằng `setStepDone` của API rồi người nhắn `xong 2 3`, Then bước mục 3 có `completedAt`, số `Activity` `buoc.xong` của bước mục 2 không tăng, câu trả lời có phần «vừa xong» chứa đúng tập số `{3}` và phần «đã xong từ trước» chứa đúng tập số `{2}`; When (b) bước mục 2 đã bị xoá, hay (c) kế hoạch của bước mục 2 đã đóng, rồi người nhắn `xong 2 3`, Then không bước nào đổi, không `Activity` mới, câu trả lời nêu `2` và lý do, và hàng `ZaloUpdateSeen` của tin đó có (tin không bị Zalo gửi lại).
- AC-7: Given A đã nối và mục 1 của mọi tin nhắc sau là một bước chưa xong, When A nhắn `xong 1` trong bốn trạng thái: (a) chỉ có tin nhắc của hôm qua gửi xong qua Zalo; (b) tin hôm nay gửi qua Slack; (c) tin hôm nay đóng `khong-viec`; (d) tin hôm nay chưa chạy, Then ở cả bốn không bước nào đổi, không `Activity` mới, câu trả lời chứa `Hôm nay chưa có tin nhắc qua Zalo` và giờ nhắc; và với tin nhắc gửi xong qua Zalo lúc 08:30 ngày D giờ VN, `xong 1` nhận lúc 23:59 ngày D giờ VN đánh dấu được, còn nhận lúc 00:01 ngày D+1 giờ VN thì rơi vào (a).
- AC-8: Given B có tin nhắc hôm nay gửi xong qua Zalo, When (a) A đã nối, là thành viên, không có tin nhắc hôm nay, nhắn `xong 1`, Then bước mục 1 của B không đổi và A nhận câu «chưa có tin nhắc»; When (b) người nhắn đã nối nhưng vai workspace là `okr` và có tin nhắc hôm nay gửi xong qua Zalo, nhắn `xong 1`, Then không bước nào đổi, không `Activity` mới, câu trả lời nói không có quyền; When (c) một Zalo chưa nối nhắn `xong 1`, Then câu trả lời là câu hướng dẫn nối hiện có (`ZALO.loi.huongDan`), không bước nào đổi; When (d) Zalo đang bị chặn vì mã sai nhắn `xong 1`, Then webhook trả 200, có hàng `ZaloUpdateSeen` cho tin đó, không `sendMessage` nào và không bước nào đổi.
- AC-9: Given A đã nối, When A nhắn `xong`, Then câu trả lời hướng dẫn cú pháp (chứa `xong 2`) và không gì đổi; When A nhắn một câu không phải lệnh, Then câu trả lời gồm câu «đã nối» hiện có và dòng gợi ý `xong 2`; When A nhắn một mã nối còn sống của chính mình, Then luật nối mã giữ nguyên (liên kết ghi lại, mã đã dùng); và với tập hồ sơ `signed-off`/`machine-cleared` mà `paths` của một eval giao với `git diff --name-only` so với `merge-base` của `origin/onehub` — tập do máy rút từ `_acceptance/*/evals.yaml`, không liệt tay — làn ghim lại (`repin-lane.mjs`, không `--write`) chạy mọi eval máy của cả tập tại HEAD với bốn suite thoát 0, và mọi eval máy đỏ ở HEAD cũng đỏ khi chạy lại đúng lệnh đó trên cây `merge-base` của `origin/onehub` — vòng này không làm đỏ thêm eval nào; năm spec Zalo đã ký (`nhac-qua-zalo`, `nhac-ke-hoach`, `zalo-qua-webhook`, `noi-zalo-cho-nguoi-moi`, `zalo-webhook-doc-khuon-that`) không bị sửa so với `merge-base`.
- AC-10: Given tin nhắc hôm nay với mục 1 và mục 2 là hai bước chưa xong, When cùng một tin `xong 1 2` (cùng `message_id`) tới webhook hai lần, Then mỗi bước đúng một `Activity` `buoc.xong` mới và người nhắn nhận đúng một `sendMessage`; When lượt ghi bước thứ hai ném lỗi DB, Then không bước nào đổi `completedAt`, không hàng `ZaloUpdateSeen` nào cho `message_id` đó, webhook trả 500; và khi Zalo gửi lại chính tin đó lúc DB lành, Then cả hai bước xong và có đúng một câu xác nhận.
- AC-11: Given `OnboardingGhi.setStepDone` gọi `datBuocXong` của `@crm/db/onboarding-buoc`, When gọi `setStepDone` qua API cho một bước chưa xong, cho bước đã xong, cho `stepId` không có, và cho bước của kế hoạch đã đóng, Then lần lượt: bước xong cùng đúng một `Activity` `buoc.xong` có `meta` không có khoá `source`; không `Activity` mới; `NotFoundException`; `ConflictException` — đúng như trước khi tách; và `ke-hoach-ban-ghi.spec.ts`, `moi-phia-ke-hoach.spec.ts` của API chạy xanh; và không tệp nào dưới `apps/agent/agent/` import từ `apps/api`.
- AC-12: Given một chuỗi đánh dấu duy nhất, When người đã nối nhắn một câu không phải lệnh chứa chuỗi đó, và một câu `xong 1 <chuỗi>`, Then không hàng nào trong `ZaloUpdateSeen`, `ZaloLink`, `ZaloLinkAttempt`, `Activity`, `AgentTask` chứa chuỗi đó, và không dòng `console.log`/`console.error` nào của lượt đó chứa chuỗi đó, trong khi bộ bắt log thu được ít nhất một dòng của lượt đó.
- AC-13: Given DB có ba tin nhắc trong khoảng ngày [D1, D2]: R1 gửi qua Zalo và có một lần `xong` qua Zalo, R2 gửi qua Zalo không lần nào, R3 gửi qua Slack; thêm một bước được đánh dấu trên màn (không `source`); và một `Activity` `buoc.xong` `source: "zalo"` của một bước không nằm trong `daGui` của tin cùng người cùng ngày, When chạy script đường đo `_acceptance/tra-loi-tin-nhac/rang/nguong.ts --tu D1 --den D2`, Then nó in đúng `ti_le_co_xong: 1/2` và `danh_dau_nham: 1` cùng id của dấu vết nhầm; bỏ dấu vết nhầm thì in `danh_dau_nham: 0`.
- AC-14: Given nhánh này, When đọc `CONTEXT.md`, `docs/agent.md` và bảng mục 7 của `docs/plan/lo-trinh-zalo.md`, Then mục **Bot Zalo** của `CONTEXT.md` nêu bot đánh dấu bước xong khi người trả lời `xong` kèm số, và bản ở `merge-base` của `origin/onehub` không nêu điều đó; `docs/agent.md` có một đoạn tả lệnh `xong`, luật được cả hoặc không, «chỉ tin hôm nay» và `source: "zalo"`; dòng `tra-loi-tin-nhac` ở mục 7 có Trạng thái thuộc tập giá trị của mục đó và khác `chờ điều kiện`.

## Coverage

Quét bằng `morphological-scan` (preset test-matrix) —
`_acceptance/tra-loi-tin-nhac/morphological-scan.md`.

- Trục A · Tin trả lời: một số | nhiều số | số ngoài dải | số trỏ mục không phải bước | «xong» thiếu số | câu khác | mã nối [thước CE: lộ trình Vòng 3 + `[NGÀNH: Twilio Studio — No Condition Matches]` + `[NGÀNH: Geekbot commands]`]
- Trục B · Tin nhắc của người nhắn: hôm nay Zalo | hôm nay Slack | hôm nay chưa chạy hay `khong-viec` | chỉ hôm qua [thước CE: `[SUY-TỪ-REPO: apps/agent/agent/lib/nhac-ke-hoach.ts]` + `[NGÀNH: Twilio — conversation state hết hạn]`]
- Trục C · Trạng thái bước: chưa xong | đã xong trước | đã xoá | kế hoạch đóng [thước CE: `[SUY-TỪ-REPO: apps/api/src/onboarding/onboarding-ghi.ts]`]
- Trục D · Người nhắn: đã nối thành viên | vai `okr` | chưa nối | bị chặn [thước CE: `[SUY-TỪ-REPO: apps/agent/agent/channels/eve.ts]`, `[SUY-TỪ-REPO: packages/db/src/zalo-lien-ket.ts]`]
- Ô → AC: A một số → AC-2 · A nhiều số, cú pháp → AC-3 · A ngoài dải → AC-4 · A không phải bước → AC-5 · C → AC-6 · B → AC-7 · D → AC-8 · A thiếu số, câu khác, mã nối → AC-9 · tiền đề đánh số → AC-1 · cross-cutting: trùng và lỗi DB → AC-10, lõi dùng chung → AC-11, không lưu nội dung → AC-12, đường đo → AC-13, tài liệu → AC-14.
- Ô gạch: D khác «đã nối thành viên» × mọi A/B/C (bị chặn trước khi xét lệnh); B khác «hôm nay Zalo» × C (không có mục để xét).
- [GIẢ ĐỊNH] Người gỡ khỏi workspace mất `ZaloLink` ngay (`workspace.service.ts` `removeMember`), nên ô «đã nối nhưng không còn là thành viên» chỉ xảy ra khi hàng `member` bị xoá ngoài đường đó; lớp 3 vẫn kiểm hàng `member` và chặn như vai `okr`, nhưng không AC nào dựng riêng ô đó.
- [GIẢ ĐỊNH] Thứ tự dòng vẽ trong tin trùng thứ tự `daGui` (`tin-nhac.ts`: `daGui` là tiền tố của danh sách đã xếp theo `LOAI_NHAC`, và các nhóm vẽ theo cùng thứ tự). AC-1 đo quan hệ đó trên tin gửi thật.
- [GIẢ ĐỊNH] Zalo không cho biết người đang trả lời tin nào (không có trích dẫn trong Bot API), nên «tin hôm nay» là quy ước duy nhất để neo số.

## Out of scope

- Hoàn tác qua Zalo («hoàn 2», «bỏ xong 2») — gỡ trên màn kế hoạch.
- Hiện «qua Zalo» trên dòng thời gian kế hoạch — `source` chỉ nằm trong dữ liệu.
- Mục KR của OKR trong tin nhắc — chờ lượt 4 OKR.
- Mô hình hiểu câu khi cú pháp trượt, hội thoại với tác tử qua Zalo — vòng 4 `hoi-crm-qua-zalo`.
- Trả lời trên Slack — kho chưa nhận tin Slack nào.
- Đổi giờ nhắc, trần mục (`NHAC.tran`) hay cách chọn kênh.
- Triển khai production (hàng T của lộ trình) và đo ngưỡng trên dữ liệu thật.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Ngưỡng của lộ trình (≥30% tin nhắc qua Zalo có một lần «xong» trong hai tuần; không
  lần đánh dấu nhầm nào) chỉ đo được sau hàng T. AC-13 bảo đảm có thước đo sẵn.
- `setStepDone` qua API giữ hành vi; phần đổi duy nhất là nó đi qua `datBuocXong`.
- AC-9 sửa ở S3 (25/09) sau lượt chạy thật: làn ghim lại trên 28 hồ sơ đã ký bị chạm
  cho 4 suite xanh và 46 eval đỏ; chạy lại đúng 46 lệnh đó trên `merge-base` `680d112a`
  cho cả 46 đỏ cùng mã thoát. Các eval đó đo màn hình qua máy chủ dev, đo `diff` của
  vòng riêng hồ sơ ấy, hoặc đo chính bộ kit — đỏ ở mọi cây trong môi trường này. Lời
  hứa cũ «làn thoát 0» không đo được; lời hứa mới là «không làm đỏ thêm eval nào».
  Duyệt lại Cổng Phạm vi cho riêng thay đổi này.

### Known limits (Cổng Bằng chứng vòng 1, 2026-09-25)

- Ngoài-1: đường Zalo tự viết lại luật «ai được đánh dấu» (`coQuyen` trong
  `apps/agent/agent/lib/tra-loi-nhac.ts`) thay vì gọi `docDuocPhamVi(role, "doi-tac")`
  như màn kế hoạch; hôm nay hai bên cho cùng kết quả, đổi danh sách quyền của vai
  `okr` mà quên một bên thì hai lối vào lệch nhau.
- Ngoài-2: dòng `Activity` `PLAN_CHANGE` được ghi ở hai chỗ — `datBuocXong`
  (`packages/db/src/onboarding-buoc.ts`) cho `setStepDone` và `ghiVet` của API cho các
  thủ tục kế hoạch khác; sửa một chỗ mà quên chỗ kia thì dấu vết lệch.
- Ngoài-3: `rang/nguong.ts` lấy dấu vết tới `--den` + 24 giờ nhưng hàng nhắc chỉ tới
  `--den`, nên lần «xong» đúng ở ngày cuối kỳ đo bị tính là đánh dấu nhầm; phải sửa
  trước khi đo ngưỡng trên dữ liệu thật (sau hàng T).
- Ngoài-4: `rang/ho-so-cham.mjs` gọi `process.exit` bên trong `try`, nên ở nhánh lỗi
  worktree tạm ở `merge-base` không được gỡ; lượt kế tự gỡ.
- Ngoài-5: test của script ngưỡng kiểm `toContain` chuỗi con thay vì đúng dòng in ra,
  nên một con số lệch thêm chữ số vẫn có thể lọt.
- E11 của tra-loi-tin-nhac đổi sang judgment (chủ kho duyệt 06/10): kiểm hồi quy chéo đã đạt ở lượt ghim lại dài 2 của zalo-va (repin-20261005T144800Z-79320); lượt 3 và 4 đỏ vì ca chập chờn agent-okr app-rieng, không vì mã; kiểm chéo bằng máy chuyển sang hạt giống kiem-cheo-sau-gop.
