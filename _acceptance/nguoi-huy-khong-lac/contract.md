---
schema_version: 1
feature: "Ca «người dùng huỷ thì không hoàn lượt» của cửa soạn OKR không lắc theo tốc độ máy: huỷ đúng lúc đang chờ Trợ lý OKR, fetch giả từ chối signal đã huỷ như fetch thật"
slug: nguoi-huy-khong-lac
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: approved
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-07T06:01:06Z
design_doc: docs/superpowers/specs/2026-10-07-nguoi-huy-khong-lac-design.md
---

# Acceptance Contract: nguoi-huy-khong-lac

## Context

Ca `nguoi-huy: nguoi dung huy thi khong hoan n=5` — thước của eval E4 (`r1h_huy`) trong hồ sơ đã ký
`soan-okr-khong-tru-luot` — quá hạn 5000 ms ở CI ngày 07/10 (run 37572504550 lần 1, PR #291). Ca ngủ 20 ms
rồi huỷ; máy chậm thì lệnh huỷ tới trước `fetch`, và `fetch` giả của `khung-cua-hoan.ts` treo mãi trên
signal đã huỷ sẵn trong khi `fetch` thật từ chối ngay. Mỗi PR vào `onehub` đều chạy ca này, nên nó đỏ ngẫu
nhiên trên PR không liên quan. Chủ kho chọn PR riêng có hồ sơ tối thiểu thay vì gộp vào #291 hay vượt cổng.

Source input: prompt · run 37572504550 (lần 1) · `apps/app/test/soan-okr-khong-tru-luot.spec.ts` ·
`apps/app/test/khung-cua-hoan.ts` · `_acceptance/soan-okr-khong-tru-luot/evals.yaml` (E4)

## Criteria

- AC-1: Given một cuộc soạn `gui-tiep` có soLuot n ∈ {0, 5}, Trợ lý OKR giả treo, và đường từ lúc cửa nhận yêu cầu tới lúc gọi `fetch` chậm thêm `TRE_TOI_FETCH_MS` (200 ms tiêm vào bước tăng lượt — gấp 10 lần mức ngủ 20 ms cũ), When người dùng huỷ yêu cầu theo cách ca `nguoi-huy` huỷ, Then lúc huỷ `fetch` giả đã nhận đúng 1 lời gọi và đang treo, sau khi cửa trả lời không lời gọi nào của yêu cầu mang signal đã huỷ sẵn, việc chờ `fetch` giả treo tự có hạn `HAN_KHONG_LAC_MS` (quá hạn là đỏ có tên chứ không treo tới 5000 ms), cửa trả lời trước `HAN_KHONG_LAC_MS` (2000 ms, dưới trần 5000 ms của bun), soLuot sau = n + 1, và thân trả lời không có trường `luot`.
- AC-2: Given `fetch` giả của khung kiểm cửa soạn với từng kiểu trả lời nó giả được (`nem`, `treo`, `luong-cham`, 202, 500), When gọi nó với một signal đã huỷ sẵn, Then ở cả năm kiểu nó từ chối trước hạn với đúng `signal.reason` (mỗi ô đỏ có tên riêng khi trả về, treo, hay từ chối sai lý do) — giống `fetch` thật của Bun gọi với cùng signal; còn gọi với signal chưa huỷ và kiểu trả lời 202 thì nó vẫn trả 202.
- AC-3: Given describe `nguoi-huy` của `soan-okr-khong-tru-luot.spec.ts` (thước E4 của hồ sơ đã ký), When chạy đúng lệnh `r1h_huy`, Then sáu ca xanh, khẳng định cũ giữ nguyên và ca người dùng huỷ thêm vế huỷ-trong-lúc-chờ của AC-1 (dùng chung một hàm với AC-1 nên hai ca không trôi khỏi nhau) — người dùng huỷ: lúc huỷ `fetch` giả đã nhận đúng 1 lời gọi và đang treo, soLuot = n + 1, thân không có `luot`; lỗi thường không huỷ: 502 và soLuot = n; cửa cắt vì quá hạn: 504 `{ error: 'tro-ly-okr-qua-han', luot: 'da-hoan' }` và soLuot = n.

## Coverage

Bỏ quét bằng skill `morphological-scan` (entry `descope` «bỏ coverage-scan» trong `decisions.jsonl`);
không gian có hai trục, liệt kê tay:

- Trục thời điểm huỷ so với `fetch`: trước khi gọi `fetch` (AC-2, mọi nhánh) | trong lúc `fetch` treo
  (AC-1 trên đường chậm, AC-3 trên đường thường) | sau khi `fetch` đã trả header (ngoài phạm vi — đường
  luồng, `luong-khong-cat` của hồ sơ gốc đo) [thước CE: ba trạng thái của một lời gọi `fetch` có signal]
- Trục nhánh của `fetch` giả: `nem` | `treo` | `luong-cham` | 2xx | không-2xx — AC-2 phủ đủ năm
  [thước CE: các nhánh `if` của `fetchGia` trong `khung-cua-hoan.ts`]

## Out of scope

- Route cửa soạn `apps/app/app/eve/agents/okr/eve/v1/[...path]/route.ts` — không đổi; lỗi ở thước, không ở vật.
- Các ca dùng đồng hồ thật có chủ đích trong cùng tệp (`doi chung qua han cua cat` chờ 300 ms thật,
  `luong-khong-cat` đẩy 6 mẩu cách 120 ms) — chúng đo thời hạn, không đoán tốc độ máy.
- Các ca chập chờn khác của kho, và hai tệp anh em dùng chung khung (`soan-okr-huy-luot.spec.ts`,
  `soan-okr-hoan-hong.spec.ts`) ngoài việc chúng phải còn xanh.

## Notes

- Chiều đỏ của E1/E2 chạy ở S3 trên bản sao (measure-birth): E1 — ca chờ `Bun.sleep(20)` thay vì
  `k.choTreo()` → `huy-truoc-fetch n=<n>`; E2 — khung bỏ dòng kiểm signal huỷ sẵn → `fetch-gia-treo-khi-da-huy <ket>`.
- Chiều đỏ thứ hai của E3 (gap-probe P1): bản sao ca `nguoi-huy` dùng `Bun.sleep(0)` thay `k.choTreo()` →
  `huy-truoc-fetch n=<n>` — chứng chính thước E4 đo huỷ-trong-lúc-chờ, không chỉ describe mới.
- Chiều đỏ của hạn `choTreo` (gap-probe P2): bản sao mock tăng lượt ném lỗi (cửa không tới `fetch`) →
  `cho-treo-qua-han` dưới 2000 ms.
- Chiều đỏ của E3 là chiều đỏ ghim của E4 hồ sơ gốc, chạy lại ở S3 dưới khung mới: gỡ nhánh «huỷ thì
  không hoàn» của route → `hoan-khi-nguoi-huy n=<n>` trong dưới 1 s — chứng thước còn cắn và đỏ vì khẳng
  định chứ không vì quá hạn.
- «huỷ» trong hợp đồng này là người dùng ngắt yêu cầu HTTP đang chờ (`AbortSignal`), đúng chữ `docs/api.md`
  dùng («Người dùng tự huỷ thì không hoàn»); không phải «Bỏ» trong vòng đời bản ghi (cảnh báo W6 của
  `eval-coverage-lint` giữ có chủ đích).
- Lượt tái hiện trước vòng (07/10, phiên này): `Bun.sleep(0)` thay `Bun.sleep(20)` trên khung cũ → hai ca
  `nguoi dung huy` quá hạn 5000.69 / 5001.09 ms.
