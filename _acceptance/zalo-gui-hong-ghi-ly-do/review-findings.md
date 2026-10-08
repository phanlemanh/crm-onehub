# Review findings: zalo-gui-hong-ghi-ly-do (round 1)

## Trong hợp đồng

- **Swap-bot write order breaks the invariant written in docs/connections.md and design.md**
  file: `apps/agent/agent/lib/zalo-bot-xuong.ts:198`
  severity: medium
  AC: AC-8
  source: conventions
  detail: Both docs promise that Zalo accepts first, and only then the bot is swapped and every zaloLink is removed, in one transaction. They also say any failed write changes nothing. design.md S1: «Ghi AppSetting (token, khoá, tên bot mới) và gỡ mọi zaloLink nằm trong MỘT db.$transaction, chạy sau khi setWebhook nhận». The code does something else. It writes the new zaloBotToken, zaloWebhookSecret and zaloBotName with ghiCot before dangKy/setWebhook, outside any transaction. chotDoiBot's transaction only writes zaloWebhookUrl/zaloWebhookLyDo and deleteMany. If the transaction fails, rollback is a separate ghiCot(truoc) with no try. When the DB is the reason the transaction failed, that ghiCot throws too, and datBot rejects. AppSetting is then left on the new bot (new token and key) while every old zaloLink is still there: the swapped-but-not-unlinked state the confirm dialog exists to prevent. Pre-writing the key may be needed so Zalo can verify the webhook. If so, the docs must say that and the rollback must be guarded. Otherwise move the token write into the transaction.

- **When the swap transaction fails, the rollback leaves the new bot's webhook at Zalo pointing at a secret the database no longer holds**
  file: `apps/agent/agent/lib/zalo-bot-xuong.ts:237`
  severity: medium
  AC: AC-8
  source: bugs
  detail: On a swap, ghiCot writes the new token and the new secret `khoa` (line 197-202) outside any transaction. Then setWebhook registers the NEW bot at Zalo with secret_token=khoa. Then chotDoiBot opens the transaction. If that transaction throws, the catch block calls ghiCot(truoc) and restores the OLD zaloWebhookSecret, but never undoes the new bot's setWebhook. The new bot keeps posting to /zalo/webhook with khoa. nhanWebhook compares it against the restored old secret, returns 403, and datKhoaLech sets zaloWebhookLyDo = "khoa-lech". So a failed swap that reports "bot cũ giữ nguyên" leaves a sticky khoa-lech warning, and the only fix is another Đăng ký lại. Separately, the token and secret write is not in the same transaction as the link removal, which AC-8 and design.md require. If the run is cut off between ghiCot (line 198) and chotDoiBot, the state is new token plus all old links, again the silent dead-link state. That can happen through a serverless timeout, or a process kill during setWebhook, which has no fetch timeout. ghiCot(truoc) itself is also not guarded: if it throws, the restore is lost and the error escapes.

- **Shape 5 (claims a class scan, has only point cases): rieng-tu says it re-runs the E3 and E4 inputs but covers only part of them**
  file: `apps/agent/test/zalo-gui-hong-ly-do.spec.ts:895`
  severity: high
  AC: AC-6
  source: measurement
  detail: In evals.yaml, E6 says the test re-runs the inputs of E1 row 1, E3 and E4. E3 is a written-first matrix of eight places and E4 has four branches. The rieng-tu test (lines 912-956) runs only some of them with TOKEN_RT, CHAT_RT and CHU_RT. From E3 it runs traLoiVe, loiVe and dongHoiQuaHan: 3 of 8. It never runs guiThu, the getMe call of datBot, moPhien on the sendChatAction path or the could-not-open-session path, or bat-dau-lai. From E4 it runs khong-rieng (rt-4) and chua-noi (rt-5), plus one NaN-date row (rt-6). It never runs da-gap or bi-chan. There is no list of the places it was supposed to cover and no count assertion equal to 8+4 (the P105 pattern). The guiThu and datBot paths read the token from AppSetting, so a token leak in their log lines (for example a line that prints String(loi) while the URL carries the token) is outside this check. The final assertion at lines 966-969 (the three strings do not appear) is therefore only proven for a subset of the class AC-6 promises.

- **Shape 5 (claims a class scan, has only point cases): webhook-403 checks 'body not read' on 1 of 7 wrong-key requests, while the eval says every one**
  file: `apps/agent/test/zalo-gui-hong-ly-do.spec.ts:326`
  severity: medium
  AC: AC-12
  source: measurement
  detail: E16 expected says: for every request with a wrong header, request.bodyUsed === false and the body stream is never pulled (soLanKeo = 0). The six wrong-key requests at lines 306-311 (three concurrent, three sequential) all go through guiWebhook (line 200-206), which throws away the yeuCauWebhook object, so bodyUsed and soLanKeo are never read for them. Only the tenth request (lines 326-330) is checked. The concurrent requests, where the reason write races, are the case most worth checking for an early body read, and the test never measures them.

- **Shape 3 (asserts a string is present when the promise is a relation): the DOM test looks for '3' anywhere on the page instead of tying soLienKet to the dialog sentence**
  file: `apps/app/test/zalo-doi-bot.dom.tsx:165`
  severity: medium
  AC: AC-7
  source: measurement
  detail: AC-7 and E15 promise that the ConfirmDialog states the new bot's name and the exact number n of links that the mutation returned. The assertion `expect([chuTrang().includes(TEN_MOI), chuTrang().includes("3")]).toEqual([true, true])` searches all of document.body.textContent for the single character "3". It does not tie that number to the dialog sentence or to HOI_DOI_BOT.soLienKet. Any '3' anywhere on the screen satisfies it, so a dialog showing the wrong count could still pass. The test already has `t = nhacQuaZaloMessages("vi").ketNoi` and could compare `chuTrang().includes(t.doiBotThan(TEN_MOI, HOI_DOI_BOT.soLienKet))`, as chup.mjs line 242 does. That check ties the relation between the returned value and the displayed sentence.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **maBotCua swallows the old bot's getMe error with no log line**
  Người dùng thấy gì: Khi Zalo không trả lời được về bot cũ lúc đổi bot, hệ thống tự đoán bot cũ có khác bot mới không mà không để lại dấu vết nào, nên sau này khó biết vì sao quyết định gỡ liên kết hay không.
  file: `apps/agent/agent/lib/zalo-bot-xuong.ts`
  severity: medium
  Đề xuất: known-limits

- **docBot parses the getMe body twice instead of carrying the id in the parsed type**
  Người dùng thấy gì: Không ảnh hưởng người dùng; chỉ là cách viết mã hơi thừa, hành vi lúc đổi bot vẫn đúng.
  file: `apps/agent/agent/lib/zalo-bot-xuong.ts`
  severity: low
  Đề xuất: wont-fix

- **setWebhook rejection still logs String(loi) and drops the maLoi/moTa that zaloGoi now attaches**
  Người dùng thấy gì: Khi quản trị đăng ký lại webhook mà Zalo từ chối, nhật ký chưa ghi lý do chi tiết của Zalo, nên người sửa lỗi phải đoán nguyên nhân.
  file: `apps/agent/agent/lib/zalo-bot-xuong.ts`
  severity: low
  Đề xuất: known-limits

- **canNoiLai is computed in the API service, not in packages/db/kenh-thong-bao.ts as design.md says**
  Người dùng thấy gì: Người chọn nhắc qua Zalo nhưng chưa từng nối vẫn thấy dòng nói bot đã đổi hoặc liên kết đã gỡ, câu này không đúng hẳn với họ dù nút nối lại vẫn hữu ích.
  file: `apps/api/src/zalo/zalo.service.ts`
  severity: low
  Đề xuất: known-limits

- **A confirmed bot swap over a non-https agent URL saves the new bot but never removes the old links**
  Người dùng thấy gì: Khi hệ thống chạy qua địa chỉ không mã hoá (môi trường thử hoặc tự dựng), đổi bot lưu bot mới nhưng giữ nguyên liên kết cũ, nên mọi người vẫn hiển thị đã nối mà tin nhắc không tới.
  file: `apps/agent/agent/lib/zalo-bot-xuong.ts`
  severity: medium
  Đề xuất: known-limits

- **Errors from the swap confirmation are shown behind the open modal, not in it**
  Người dùng thấy gì: Nếu bấm Gỡ liên kết và đổi bot mà bị lỗi, thông báo lỗi hiện phía sau hộp xác nhận nên quản trị có thể không thấy gì và tưởng nút không phản hồi.
  file: `apps/app/app/(app)/[slug]/settings/connections/zalo/o-token.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
