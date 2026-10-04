---
schema_version: 1
feature: «Kara sập giữa lượt thì không mất lượt soạn; «Thử lại» nói rõ vì sao không chạy»
slug: soan-okr-khong-tru-luot
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-10-04
design_doc: docs/superpowers/specs/2026-10-04-soan-okr-khong-tru-luot-design.md
---

# Acceptance Contract: soan-okr-khong-tru-luot

## Context

Phòng ban dùng Soạn OKR cho quý 4. Hôm nay cửa `/eve/agents/okr` tính lượt trước khi chuyển tới
Trợ lý, nên lượt nào không tới được Trợ lý (không nối được, 401, 5xx, không ghi được phiên) vẫn bị
trừ, và cuộc mà lượt đầu đã hỏng vẫn ăn một trong ba cuộc của kỳ (#7). «Thử lại» không nói vì sao
không chạy, và có đường bấm xong không thấy gì đổi (#8). Lượt này: cửa hoàn lượt khi lượt không
tới được Trợ lý; chỗ báo lỗi nói lý do và đếm số lần đã thử.

Source input: `docs/plan/lo-trinh-okr.json` hàng R1h; khảo sát lộ trình 04/10 mục K2 (#7, #8) và
quyết định 5; `_acceptance/soan-okr-khong-tru-luot/opportunity.md` (Cổng Đáng ký 04/10).

## Criteria

- AC-1: Given một cuộc `dang` của người gọi có `soLuot = n`, với n ∈ {0, `luotMoiCuoc` − 1}, When người đó gửi qua cửa một lượt mở phiên (`POST session`) hoặc gửi tiếp (`POST session/:phien`), và Trợ lý cho đúng một trong mười một kết quả hỏng viết trước — `fetch` ném lỗi (không nối được), không trả lời trong thời hạn `CUA_OKR.choTroLyMs`, status 400, 401, 403, 404, 409, 422, 500, 502, 503 — Then `soLuot` của cuộc trong kho sau lượt bằng n; status cửa trả bằng status hôm nay (ném lỗi → 502, quá hạn → 504, còn lại → status của Trợ lý); thân là JSON có tên của cửa (`tro-ly-okr-khong-noi-duoc`, `tro-ly-okr-qua-han`, `tro-ly-okr-tu-choi` cho 4xx, `tro-ly-okr-loi` cho 5xx) mang `luot: "da-hoan"`; 2 đường × 11 kết quả × 2 giá trị n = 44 ô, mỗi ô một khẳng định. Khi chính việc hoàn lượt hỏng (kho ném lỗi), cửa vẫn trả status của lỗi gốc, thân KHÔNG mang `luot: "da-hoan"`, và ghi đúng một dòng cảnh báo chứa `hoan-luot-hong` và mã cuộc. (cross-layer)
- AC-2: Given một cuộc `dang` đang giữ chỗ phiên (`cho-eve:…`) có `soLuot = 0`, When mở phiên qua cửa và Trợ lý trả 2xx nhưng cửa không dùng được kết quả — không đọc được mã phiên (502 `khong-doc-duoc-phien`), ghi phiên hỏng (502 `khong-ghi-duoc-phien`), thua đua với một lần mở khác (409 `da-co-phien`) — Then `soLuot` sau bằng 0 ở cả ba ca, thân mang `luot: "da-hoan"` cạnh mã lỗi cũ, và mã phiên eve vẫn vào `cacPhien` như hôm nay. (cross-layer)
- AC-3: Given một cuộc `dang` có `soLuot = 0`, When gửi qua cửa các lượt mà Trợ lý trả 2xx, xen giữa bằng các lượt hỏng (502 và không nối được), Then mỗi lượt 2xx tăng `soLuot` đúng 1, mỗi lượt hỏng để `soLuot` đứng yên; đúng `luotMoiCuoc` lượt 2xx tới được Trợ lý, lượt 2xx kế tiếp nhận 429 `het-luot-cuoc` và không tới Trợ lý — lượt hỏng không ăn trần và cũng không nới trần; và khi `soLuot = luotMoiCuoc − 1`, hai lượt gửi song song thì đúng một lượt tới Trợ lý. (cross-layer)
- AC-4: Given một cuộc `dang` có `soLuot = n`, When người dùng huỷ yêu cầu (`request.signal` đã huỷ) trong lúc cửa đang chuyển lượt và `fetch` ném lỗi vì huỷ, Then cửa không hoàn lượt: `soLuot` sau bằng n + 1; còn khi `fetch` bị cắt vì thời hạn `CUA_OKR.choTroLyMs` của chính cửa (người dùng không huỷ) thì cửa hoàn như AC-1. (cross-layer)
- AC-5: Given một phòng ban đã có `cuocMoiDonViMoiKy − 1` cuộc có lượt trong kỳ, và một cuộc `dang` mới mà mọi lượt gửi qua cửa đều hỏng, When gọi `okr.soanSanSang` rồi bỏ cuộc đó và mở cuộc mới bằng `okr.soanMo` (`boCuocDangId`), Then `soCuocDaDung` bằng `cuocMoiDonViMoiKy − 1` (cuộc hỏng không bị tính) và `soanMo` trả `ok`, không trả `het-cuoc-ky`. (cross-layer)
- AC-6: Given các cuộc có `soLuot` ∈ {0, 1, 3} và một cuộc khác làm đối chứng, When gọi `hoanLuot` của `packages/db` cho từng cuộc, kể cả hai lần song song trên cuộc có `soLuot = 1`, Then `soLuot` thành {0, 0, 2}, không bao giờ âm, cuộc đối chứng không đổi, và hàm trả cho biết có trừ hay không.
- AC-7: Given bảng viết trước gồm mọi lỗi mà phiên soạn có thể nhận — mỗi mã lỗi có tên của cửa ở đúng status của nó, có và không có `luot: "da-hoan"`, status 4xx và 5xx không mang mã cửa, lỗi không có status (mất mạng), quá 45 giây, phiên dừng không lỗi, lần mở lại ném lỗi — When gọi `lyDoHong`, Then mỗi dòng cho đúng một mã lý do trong tập đóng của thiết kế cùng cờ `daHoan`; `daHoan` đúng KHI VÀ CHỈ KHI thân mang `luot: "da-hoan"` (lỗi không status, lỗi của luồng GET và mọi thân không mang trường đó cho `daHoan = false`); các ca đã có chỗ riêng (từ chối lượt có tên, chưa cấu hình, phiên khác đang sống) trả `null`; và tập mã mà bảng phủ bằng đúng tập khoá câu lý do trong `lib/messages/okr-soan.ts` ở cả `vi` và `en`.
- AC-8: Given màn soạn đang hiện chỗ báo lỗi, When bấm «Thử lại» và lần thử đó cũng không chạy — gửi lại bị cửa trả 502 `tro-ly-okr-khong-noi-duoc` có và không có `luot: "da-hoan"`; gửi lại mất mạng; gửi lại bị 401 `chua-dang-nhap`; mở lại cuộc ném lỗi; mở lại cuộc trả `ok: false` với một lý do có tên; gửi lại bị từ chối lượt có tên ở mọi mã của `CUA_OKR.trangThaiTuChoiLuot`; gửi lại bị 503 `chua-cau-hinh-tro-ly-okr` — Then không ca nào giữ nguyên chỗ báo lỗi cũ: ở ca có mã `lyDoHong`, chỗ báo lỗi hiện câu lý do của lần thử mới nhất, câu «Lượt này không bị tính.» CHỈ khi lỗi mang `luot: "da-hoan"`, và dòng «Đã thử lại N lần» với N bằng số lần đã bấm, cả ba trong vùng `aria-live`; ở ca từ chối có tên và chưa cấu hình, chỗ báo lỗi chung biến mất và hiện đúng thông báo có tên sẵn có của mã đó; nút «Thử lại» khoá trong lúc lần thử đang chạy và mở lại khi xong; khi lần thử chạy được thì chỗ báo lỗi biến mất.
- AC-9: Given màn thật trong phiên đo riêng, cầu nối đã cấu hình nhưng `OKR_AGENT_URL` trỏ tới một cổng không ai nghe, và một cuộc `dang` có `soLuot = 0`, When trưởng phòng ban mở màn soạn của cuộc đó ở 1440 và 390 (màn tự gửi lượt mở đầu qua cửa) rồi bấm «Thử lại» một lần, Then thấy câu «Không nối được tới Trợ lý OKR.» kèm «Lượt này không bị tính.», sau khi bấm thấy «Đã thử lại 1 lần», không tràn ngang, cửa đã nhận ít nhất một POST lượt (đếm qua nghe mạng), và `soLuot` của cuộc trong kho phiên đo vẫn bằng 0 sau cả hai lần; đối chứng: cùng các bước với `OKR_AGENT_URL` trỏ tới máy giả trả 202 thì `soLuot` thành 1. (cross-layer)
- AC-10: Given các khoá chữ mới của lượt này, When chạy bài ghim chữ và sàn thiết kế, Then mọi câu mới có ở cả `vi` và `en` trong `lib/messages/okr-soan.ts`, được `messages-guard` ghim, `hoi-thoai-soan.tsx` không có chữ cứng, và sàn thiết kế tĩnh không có lỗi P0 trên `hoi-thoai-soan.tsx`.

## Coverage

Không gian: Đường của cửa (mở phiên · gửi tiếp) × Kết quả Trợ lý (không nối · quá hạn · người dùng huỷ ·
3xx/4xx · 5xx · 2xx dùng được · 2xx không dùng được) × `soLuot` trước (0 · giữa · `luotMoiCuoc` − 1)
× Đồng thời (một lượt · hai lượt song song) × Lối «Thử lại» (gửi lại · mở lại) × Kết quả lần thử
(qua · cửa có lý do · mất mạng · mở lại ném).

- Quét (skill morphological-scan, preset test-matrix): trục Đường × Kết quả Trợ lý × `soLuot` trước, đồng thời là lớp cắt ngang; trục Lối «Thử lại» × Kết quả lần thử. Chân ngành: mẫu giữ chỗ rồi bù trừ (Saga, Garcia-Molina & Salem 1987) `[NGÀNH: Saga — compensating transaction]`. Lượt quét bổ sung hai ô: mở lại trả `ok: false` (AC-8) và hoàn lượt hỏng (AC-1).
- Lượt phản biện context sạch thêm: thời hạn chờ Trợ lý (ca treo), cờ `luot: "da-hoan"` để câu «không bị tính» chỉ hiện khi đúng, và các lần thử mà `lyDoHong` trả `null` (AC-8).
- Core: hỏng × hai đường × biên `soLuot` → AC-1; 2xx không dùng được → AC-2; trần còn chặn và không nới → AC-3; người dùng huỷ → AC-4; trần cuộc của kỳ → AC-5; hàm hoàn → AC-6; lý do → AC-7; «Thử lại» → AC-8; nhìn thấy trên màn thật → AC-9; chữ và sàn → AC-10.
- Thước CE: tập mã lỗi có tên của cửa đọc từ `CUA_OKR.loi` và `CUA_OKR.trangThaiTuChoiLuot` lúc chạy bài AC-7, không chép tay; trần đọc từ `TRO_LY_OKR_TRAN.soan`.
- Later: lượt tới Trợ lý rồi mới hỏng trong luồng (`turn.failed`) → hoàn ở `apps/agent-okr`, vòng riêng.
- Later: Trợ lý trả 3xx (eve không chuyển hướng; cửa đã đặt `redirect: "manual"` và quy tắc «không `ok` thì hoàn» phủ luôn, nhưng không đo riêng).
- Never: thủ tục tRPC «hoàn lượt» mà người dùng gọi được.

## Đường đo

- Thước: lượt không tới được Trợ lý không làm giảm số lượt (không nối được, quá hạn, 4xx, 5xx, 2xx không dùng được) · số từ: `OkrCuocSoan.soLuot` trước/sau lượt qua cửa · bảo đảm bởi: AC-1, AC-2, AC-9
- Ngoài đường đo của lượt này (ngưỡng CHẾT đã ký nói «còn một ca hỏng phía agent vẫn trừ lượt»): lượt Trợ lý đã NHẬN rồi mới hỏng trong luồng (`turn.failed` — mô hình lỗi, Gateway hết ngân sách) vẫn bị tính; cửa không thấy ca này (sổ d-…-3). Cổng 1 chọn: ký lại ngưỡng thành «lượt không tới được Trợ lý» và mở vòng riêng cho `turn.failed`, hoặc nới phạm vi sang `apps/agent-okr`.
- Thước: cuộc hỏng không ăn trần cuộc của kỳ · số từ: `soanSanSang.soCuocDaDung` · bảo đảm bởi: AC-5
- Thước: trần không thủng · số từ: số lượt 2xx tới Trợ lý trên một cuộc · bảo đảm bởi: AC-3
- Thước: «Thử lại» không còn đường im · số từ: câu lý do và «Đã thử lại N lần» trên màn · bảo đảm bởi: AC-7, AC-8, AC-9

## Hồ sơ đã ký bị thay

<!-- <<<BANG-THAY-THE -->
| hồ sơ/eval | đo gì | vì sao vỡ | thay bởi |
|---|---|---|---|
<!-- BANG-THAY-THE>>> -->

Bảng rỗng có quét (luật `doi-ham-dem-quet-truong-dan-xuat`). Hai hàm đếm `tangLuot` và
`demCuocTrongKy` giữ nguyên; lượt này chỉ thêm đường hoàn trên nhánh hỏng của cửa. Đã đọc mọi
khẳng định trên `soLuot`, `soCuocDaDung`, `tranCuoc`, `luotMoiCuoc`, `demCuocTrongKy`:

- `soan-okr-song-lai` E5 (`sol_dem_db`), E6 (`sol_tran_api`), E7, E8, E9 (`soan_tran`) — gieo lượt bằng `tangLuot` trực tiếp, không qua cửa; giữ nghĩa.
- `soan-okr-song-lai` E4 (`sol_loi_dom`) — khẳng định có `[data-luot="loi"]` và nút «Thử lại» ở 503 mã khác và lỗi mạng, không khẳng định chữ; giữ nghĩa vì `LuotLoi` vẫn hiện cùng hai phần tử.
- `soan-okr-cung-tro-ly` E9 và các eval trần — đếm qua `soanMo`/`tangLuot`, không qua nhánh hỏng của cửa; giữ nghĩa.
- `soan_cua` (`apps/app/test/cua-okr.spec.ts`) — giả lập `soanTangLuot` nên `soLuot` trong kho không tăng; `hoanLuot` chỉ trừ khi `soLuot > 0`, nên các ca 500, 502, 409 trong tệp đó giữ đúng kỳ vọng `sessionId` và `cacPhien`. Lượt này không sửa tệp đó.

## Out of scope

- Hoàn lượt khi lượt đã tới Trợ lý rồi mới hỏng trong luồng (`turn.failed`, Gateway hết ngân sách) — cần `apps/agent-okr` tự hoàn, ngoài ranh giới tệp của P5; vòng riêng.
- Thủ tục tRPC hay REST để hoàn lượt.
- Hoàn lượt khi người dùng tự huỷ yêu cầu (AC-4 khẳng định không hoàn).
- Đổi chữ «Trợ lý OKR» sang Kara trên màn soạn — hàng K6a.
- Trang riêng, Hoàn tác biên nhận, trạng thái chờ theo khuôn chung — K2 `soan-okr-trang-rieng`.
- Trả lại lượt đã mất trước lượt này trên production.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry
> `descope` trong `decisions.jsonl`.

## Notes

- Ranh giới tệp (LUAT điều phối 1410): P5 sửa cửa `apps/app/app/eve/agents/okr/**` và `okr/soan/**` trừ `nut-soan.tsx`; điều phối duyệt thêm `packages/db/src/okr-cuoc-soan.ts` và `apps/api/src/okr/soan.service.ts` (Nhật ký 12:50). Không chạm `nop_ban_nhap.ts`, `packages/validation/src/okr-cuoc-soan.ts` (PR #248), `schema.prisma`.
- Không mở cuộc hay gửi lượt AI trên production.
