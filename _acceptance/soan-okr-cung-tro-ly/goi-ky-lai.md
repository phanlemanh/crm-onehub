# Gói ký lại Cổng Phạm vi — soan-okr-cung-tro-ly

1. Trong lúc làm (S3), điều phối đã quyết vài chỗ làm lời của hợp đồng hay phép đo đã ký không còn đúng với sản phẩm.
2. Gói này gom mọi chỗ đó để ký lại một lần. Mỗi mục có lời cũ nguyên văn và lời mới dán được ngay.
3. Hai tệp đã ký (`contract.md`, `evals.yaml`) chưa bị sửa. Chúng chỉ đổi sau khi chủ kho mở lại hợp đồng.
4. Không ngưỡng nào đổi. Các mục chỉ sửa câu chữ cho khớp hành vi đã dựng và thước đã đo.
5. Mục 10 nằm trong mã chứ không trong hai tệp đã ký. Đề xuất sửa nó thẳng ở S3, trước S4.

**Số mục: 11.** 9 mục sửa lời đã ký (1–5, 7–9, 11), 1 mục sửa mã không cần ký (10), 1 mục đã gộp vào mục 5 và 9 (6). Mục 11 do lần soát này tìm thêm.

Cách ký: chủ kho mở lại hợp đồng → máy áp đúng các lời mới, status về draft, dựng thẻ → `/acceptance-gate:approve duyệt`

Đối chiếu trên HEAD `fdb5d8a4`. Số dòng là số dòng của tệp ở HEAD đó. Báo cáo dẫn ở dưới nằm trong `.superpowers/sdd/2026-09-30-soan-okr-cung-tro-ly/` (không vào git). Sổ quyết định tạm sau lần niêm phong: `decisions.jsonl` d-…-10, -11, -12.

---

## 1. Người không vào được một cuộc soạn nhận 404 như khi mã không có (AC-1, E1)

**Ở đâu:** `contract.md:41` (AC-1), `evals.yaml:9` (E1).

**Lời cũ (AC-1, hai đoạn):**

```text
giá trị ô là một trong {mở, một mã lý do có tên, 403}, không «hoặc»
```

```text
(trưởng phòng gọi `soanDanhSach`/`soanQuyet` trên cuộc quản trị mở → 403)
```

**Lời mới (AC-1, hai đoạn):**

```text
giá trị ô là một trong {mở, một mã lý do có tên, 403, 404}, không «hoặc» — 403 ở ba thủ tục theo đơn vị (`okr.soanSanSang`, `okr.soanMo`, `okr.soanDanhSachCuoc`), 404 cùng câu với mã cuộc không có ở ba thủ tục theo mã cuộc (`okr.soanDanhSach`, `okr.soanQuyet`, `okr.soanDuaVao`); cửa `/eve/agents/okr/eve/v1` vẫn trả 403
```

```text
(trưởng phòng gọi `soanDanhSach`/`soanQuyet` trên cuộc quản trị mở → 404 cùng câu với mã cuộc không có)
```

**Lời cũ (E1):**

```text
→ giá trị ô là ĐÚNG MỘT trong {mo, <maLyDo có tên>, 403}, không có ô 'hoặc';
```

**Lời mới (E1):**

```text
→ giá trị ô là ĐÚNG MỘT trong {mo, <maLyDo có tên>, 403, 404}, không có ô 'hoặc' — 403 ở soanSanSang, soanMo, soanDanhSachCuoc; 404 ở soanDanhSach, soanQuyet, soanDuaVao và bài chỉ đọc một ô là 404 khi câu trả về đúng câu của mã không có (khongCoCuoc; ở soanQuyet là câu dòng không có), để 404 «thủ tục chưa có» không khớp nhầm; bảng 378 ô gồm 108 ô 403 và 126 ô 404;
```

**Vì sao:** Sau khi gộp lượt 8c, người ngoài đơn vị không được biết một cuộc soạn có tồn tại hay không, nên API trả cùng câu «không có» như khi mã sai. 126 ô của ma trận đổi từ 403 sang 404 (H1: `dab25876`…`cb36aa04`, sổ ô trong `task-H1-report.md`; quyết định d-…-10).

## 2. Thước «0 số đích do máy ghi» đọc vết tạo KR, không đọc đích hiện tại (hợp đồng dòng 79)

**Ở đâu:** `contract.md:79` (Đường đo).

**Lời cũ:**

```text
và mọi KR mang vết `soan-okr:*` có `targetValue`/`startValue` bằng số trong `after` của vết (số người gõ) — đối chứng dương: gieo một KR mang vết với đích khác `after` → thước đỏ
```

**Lời mới:**

```text
và ở mọi vết tạo KR mang `soan-okr:*`, số ghi vào KR lúc đưa vào (`after.startValue`/`after.targetValue`) bằng số người gõ lưu cùng vết (`after.soNguoiGoKhoiDiem`/`after.soNguoiGoDich`; KR mốc ghi 0 → 1 và không mang số người gõ); vết thiếu số người gõ hay sai khuôn là lệch; người sửa đích sau khi đưa vào không tính — đối chứng dương: gieo một vết có số ghi khác số người gõ → thước đỏ
```

**Vì sao:** Sau khi Đưa vào, người sửa đích như mọi OKR (AC-8). So với đích hiện tại thì thước đỏ giả và không còn đo máy nữa. Lúc đưa vào, vết tạo nay ghi thêm hai số người gõ (C7: `38ee6f46`, `ec5f9222`; `task-C7-vong-va-1.md`; quyết định d-…-11).

## 3. KR mốc không nhận số khởi điểm hay đích (hợp đồng dòng 71, AC-8, E14)

**Ở đâu:** `contract.md:71` (Coverage), `contract.md:48` (AC-8), `evals.yaml:133` (E14).

**Lời cũ (dòng 71):**

```text
- [GIẢ ĐỊNH] KR kiểu mốc trong bản nháp: máy không đề xuất số; người điền khởi điểm và đích trên thẻ như mọi kiểu (luật `assertSoTheoKieu` của kho quyết số hợp lệ).
```

**Lời mới (dòng 71):**

```text
- [GIẢ ĐỊNH] KR kiểu mốc trong bản nháp: máy không đề xuất số và người cũng không điền — KR mốc vào bộ OKR với khởi điểm 0 và đích 1 như mọi KR mốc của kho, gửi số cho KR mốc bị từ chối có tên. Các kiểu khác: người điền khởi điểm và đích trên thẻ (luật `assertSoTheoKieu` của kho quyết số hợp lệ).
```

**Lời cũ (AC-8, ba đoạn):**

```text
điền khởi điểm và đích cho từng KR đã nhận trên thẻ
```

```text
`soanDuaVao` từ chối có tên khi một KR đã nhận thiếu khởi điểm hay đích
```

```text
KR với `startValue`/`targetValue` bằng đúng số trong lời gọi (số người gõ)
```

**Lời mới (AC-8, ba đoạn):**

```text
điền khởi điểm và đích cho từng KR đã nhận trên thẻ (trừ KR mốc — mốc không có ô số)
```

```text
`soanDuaVao` từ chối có tên khi một KR đã nhận không phải mốc thiếu khởi điểm hay đích, hay khi lời gọi gửi số cho KR mốc
```

```text
KR với `startValue`/`targetValue` bằng đúng số trong lời gọi (số người gõ; KR mốc 0 → 1)
```

**Lời cũ (E14):**

```text
soanDuaVao thiếu khoiDiem hay dich cho một KR đã nhận → từ chối 'thieu-so-kr' và 0 bản ghi;
```

**Lời mới (E14):**

```text
soanDuaVao thiếu khoiDiem hay dich cho một KR đã nhận không phải mốc → từ chối 'thieu-so-kr' và 0 bản ghi; gửi số cho KR mốc → 400 có tên và 0 bản ghi; KR mốc được tạo với 0 → 1;
```

**Vì sao:** Kho đã có sẵn mô hình KR mốc (0 → 1). Đưa vào giữ đúng mô hình đó, và màn soạn không vẽ ô số cho KR mốc (C5: `ae26eda4`, `f291e4b5`, `e8159b17`; `task-C5-report.md` mục lo ngại 3). Báo cáo C5 gọi tên cả dòng 71 lẫn AC-8. E14 thêm câu theo, vì bài của nó đã có ca KR mốc.

## 4. Phép đo E15: trưởng phòng B thấy một cuộc, không phải hai

**Ở đâu:** `evals.yaml:142` (E15).

**Lời cũ:**

```text
trưởng phòng B → hai;
```

**Lời mới:**

```text
trưởng phòng B → một (cuộc thứ hai của phòng B là cuộc ẩn quản trị mở ở nấc an), quản trị → hai;
```

**Vì sao:** Theo AC-10, cuộc ẩn chỉ quản trị thấy. Bài E15 gieo một trong hai cuộc của phòng B ở nấc ẩn, và khẳng định đúng «một / hai» (C6 `71854783`; `apps/api/test/soan-okr-cuoc.spec.ts:245–272`). Chỗ sai là lời ghi lúc viết phép đo.

## 5. Chín thủ tục chứ không phải bảy; E26 nhận câu về tệp của hãng; bỏ bốn luật trùng với E27 (AC-15, E26)

**Ở đâu:** `contract.md:55` (AC-15), `evals.yaml:235` (E26).

**Lời cũ (AC-15):**

```text
`docs/api.md` §OKR nói bảy thủ tục mới và ai gọi được
```

**Lời mới (AC-15):**

```text
`docs/api.md` §OKR nói chín thủ tục mới và ai gọi được
```

**Lời cũ (E26):**

```text
    expected: "exit 0; rang/tai-lieu.mjs: CONTEXT.md có năm mục mới; docs/api.md §OKR nhắc đủ bảy thủ tục soan*; docs/agent.md có mục app eve thứ hai và cửa mới; docs/chat-ui.md sổ có Conversation, ConversationEmptyState, Suggestion, PromptInput ở nhóm đã dùng; .env.example VÀ globalPassThroughEnv của turbo.json có OKR_AGENT_URL và OKR_AGENT_BRIDGE_SECRET; docs/setup.md mục phiên đo nhắc apps/agent-okr; lo-trinh-okr.md mục 10 có dòng slug soan-okr-cung-tro-ly; grep 'from \"../../agent' hay '@/agent' trong apps/agent-okr → 0; không chú thích mới trong diff (đếm // và /* ở dòng thêm của *.ts/*.tsx ngoài test fixtures); không lời gọi model trong apps/api. Thiếu mục nào → đỏ nêu tên."
```

**Lời mới (E26):**

```text
    expected: "exit 0; rang/tai-lieu.mjs tự chứng 33 ca gài trước rồi mới đo: CONTEXT.md có năm mục mới; docs/api.md §OKR nhắc đủ chín thủ tục soan* (router có chín: soanSanSang, soanMo, soanDanhSachCuoc, soanDanhSach, soanQuyet, soanDuaVao, soanTangLuot, soanSoDo, soanAn; thước đòi tối thiểu chín); docs/agent.md có mục app eve thứ hai, cửa mới và mục chỗ rẽ liệt kê đúng 22 tệp của hãng lượt này chạm — danh sách cố định trong thước, mỗi tệp còn có ở origin/release và còn khác bản đó ở HEAD; chiều ngược (một tệp của hãng mới bị chạm mà chưa vào danh sách) thước không đo, người soát diff trước gộp gánh; docs/chat-ui.md sổ có Conversation, ConversationEmptyState, Suggestion, PromptInput ở nhóm đã dùng; .env.example VÀ globalPassThroughEnv của turbo.json có OKR_AGENT_URL và OKR_AGENT_BRIDGE_SECRET; docs/setup.md mục phiên đo nhắc apps/agent-okr; lo-trinh-okr.md mục 10 có dòng slug soan-okr-cung-tro-ly; thành phần client ('use client') trong vùng tệp mới của lượt không nhập @crm/db hay @crm/auth. Nhập chéo từ apps/agent, chú thích, kiểu lỏng và lời gọi model trong API do E27 đo trên cả cây. Thiếu tệp nguồn → mã 2. Thiếu mục nào → đỏ nêu tên."
```

**Vì sao:** Bộ thủ tục đã dựng có chín, không phải bảy (router `apps/api/src/okr/okr.router.ts`; E4 `5cf0485a` nâng thước lên tối thiểu chín; E5 ghi «ký lại»). Câu về tệp của hãng chưa khai từng định đặt ở E27, nhưng việc so với `release` không phải luật kho, nên về E26 cạnh phần kiểm 22 tệp (`so-dieu-phoi-s3.md` «Chỗ đổi thứ chín»). Thước chung của E27 đo rộng hơn và trên cả cây cho bốn luật trùng: nhập chéo (giải đường thật, thêm chiều ngược), chú thích, kiểu lỏng, gói model trong app Nest. Đã chạy `--du-luat` trên HEAD: sáu luật xanh, chiều đo 32/32. Chỉ luật «thành phần client không nhập gói máy chủ» không có ở thước chung, nên giữ ở E26. Thước `tai-lieu.mjs` không phải sửa, vì bốn mục thừa vẫn đo không sai.

## 6. Câu «tệp mới rẽ khỏi release mà chưa khai» cho E27 — đã gộp

**Ở đâu:** ghi «ký lại» ở `so-dieu-phoi-s3.md` dòng E5 vá 1; `docs/agent.md:1226–1227` hứa «phép đo E27 sẽ được thêm câu này».

**Lời cũ / Lời mới:** không có lời riêng. Câu này chuyển sang E26 (mục 5). E27 thay hẳn bằng thước luật kho (mục 9).

**Vì sao:** Ghi lại để không mục «ký lại» nào biến mất không dấu. Sau khi ký, `docs/agent.md:1227` phải đổi «E27» thành «E26» (việc tài liệu, không cần cổng).

## 7. Phép đo E28 thu hẹp theo đúng thước, đường màn Tổ chức là `settings/organization`

**Ở đâu:** `evals.yaml:251` (expected), `evals.yaml:253` (paths).

**Lời cũ (expected):**

```text
    expected: "exit 0; design-gate tĩnh trên từng tệp màn mới của lượt (màn soạn, bảng nháp, hội thoại, danh sách cuộc, thẻ cài đặt, thẻ số đo, ô mô tả/chức danh, màn kho loại chiến lược): không className đổi màu/góc/khoảng cách của component @crm/ui, không radius/màu lạ."
```

**Lời mới (expected):**

```text
    expected: "exit 0; rang/san-thiet-ke.mjs chạy trên từng tệp .tsx của vùng màn cố định của lượt (màn soạn và bảng nháp, theo-don-vi, thẻ Trợ lý OKR và thẻ số đo ở settings/okr, năm tệp settings/organization lượt này dựng, màn kho tài liệu, sáu thành phần mới ở packages/ui): mỗi tệp qua design-gate tĩnh của bộ nghiệm thu (mã 0) và có 0 chỗ khớp sáu mẫu vẽ tay — góc literal rounded-[…], mã màu hex trong className hay style, <table> thô, divide-y, navigator.clipboard, chấm size-2 rounded-full; in một dòng DUNG/SAI mỗi tệp và dòng KET LUAN. Không đo className đổi màu hay khoảng cách trên thành phần @crm/ui ngoài các mẫu trên (lẫn với lớp bố cục hợp lệ). Chiều đỏ, cùng lệnh thêm --pha: bản sao gắn className 'bg-red-500 text-gray-400' lên Button → design-gate khác 0; sáu tệp gài, mỗi mẫu bắt đúng dòng gài; đủ 7 DUNG mới mã 0. Thiếu bộ kit hay vùng không có tệp .tsx → mã 2."
```

**Lời cũ (paths):**

```text
    paths: ["apps/app/app/(app)/[slug]/okr/soan/**", "apps/app/app/(app)/[slug]/settings/okr/**", "apps/app/app/(app)/[slug]/settings/to-chuc/**", packages/ui/src/components/**]
```

**Lời mới (paths):**

```text
    paths: ["apps/app/app/(app)/[slug]/okr/soan/**", "apps/app/app/(app)/[slug]/okr/theo-don-vi/**", "apps/app/app/(app)/[slug]/settings/okr/**", "apps/app/app/(app)/[slug]/settings/organization/**", "apps/app/app/(app)/[slug]/tai-lieu/**", packages/ui/src/components/**, _acceptance/soan-okr-cung-tro-ly/rang/san-thiet-ke.mjs]
```

**Vì sao:** Lời cũ hứa rộng hơn thước đo được. Soát D9 chốt: bắt sáu mẫu vẽ tay rõ ràng cộng design-gate của bộ nghiệm thu, còn «className trên thành phần dùng chung» thì không bắt, vì không phân biệt được với lớp bố cục hợp lệ. Màn Tổ chức sống ở `settings/organization`, không phải `settings/to-chuc` (D9: `f3b7646d`, `fb30411d`, `49370404`, `b6525976`; điều phối tự chạy 41 DUNG, `--pha` 7 DUNG).

## 8. Trần tháng đặt OKR chỉ áp trong cửa lập kế hoạch ba tháng (AC-5, AC-10, dòng 67, E16)

**Ở đâu:** `contract.md:45` (AC-5), `contract.md:50` (AC-10), `contract.md:67` (Coverage), `evals.yaml:151` (E16).

**Lời cũ (AC-10):**

```text
trần áp dụng cho tháng có và không có chu kỳ pha lập kế hoạch
```

**Lời mới (AC-10):**

```text
trần áp dụng cho tháng có và không có chu kỳ pha lập kế hoạch — «tháng đặt OKR» là tháng nằm trong cửa lập kế hoạch của một chu kỳ đang ở pha lập kế hoạch và chưa ẩn: từ ba tháng trước tháng bắt đầu của chu kỳ tới tháng kết thúc của nó
```

**Lời cũ (AC-5):**

```text
(trần riêng tháng đặt OKR khi có chu kỳ pha lập kế hoạch, bằng trần thường khi không đặt)
```

**Lời mới (AC-5):**

```text
(trần riêng tháng đặt OKR khi tháng nằm trong cửa lập kế hoạch ba tháng của một chu kỳ pha lập kế hoạch như AC-10 định nghĩa, bằng trần thường khi không đặt)
```

**Lời cũ (dòng 67):**

```text
trần tháng đặt OKR áp cho tháng có chu kỳ pha lập kế hoạch.
```

**Lời mới (dòng 67):**

```text
trần tháng đặt OKR áp cho tháng nằm trong cửa lập kế hoạch — từ ba tháng trước tháng bắt đầu của một chu kỳ pha lập kế hoạch chưa ẩn tới tháng kết thúc của nó.
```

**Lời cũ (E16):**

```text
tranThangApDung(thang) = 15 khi tháng có chu kỳ lap-ke-hoach và cột đặt, = aiTranThangUsd khi null hoặc tháng không có;
```

**Lời mới (E16):**

```text
trần áp dụng của tháng (tranThangCuaThang) = 15 khi tháng nằm trong cửa lập kế hoạch của một chu kỳ lap-ke-hoach chưa ẩn (từ tháng bắt đầu lùi ba tháng tới tháng kết thúc) và cột đặt, = aiTranThangUsd khi null hoặc khi không cửa nào chạm tháng — ca biên cho tháng 2026-11: bắt đầu 28/02/2027 → 15, bắt đầu 01/03/2027 → 9, chu kỳ năm 2028 → 9, kết thúc 31/10/2026 → 9, chu kỳ đó bị ẩn → 9;
```

**Vì sao:** Bộ mẫu có một chu kỳ năm kế đang ở pha lập kế hoạch dù còn cách nhiều tháng. Nó nâng trần cho mọi tháng, nên trần riêng mất nghĩa «tháng đặt OKR». Cửa ba tháng (hằng `thangLapKeHoachTruocKy = 3`) giữ nghĩa đó (gộp onehub lần 2: `e55eeb37`; `gop-onehub-2-report.md` mục 2; quyết định d-…-12; bài `apps/api/test/soan-okr-nac.spec.ts` › `tran-thang`). E9 không cần sửa: nó dùng cụm «tháng có chu kỳ pha lap-ke-hoach», nay đã được AC-10 định nghĩa.

## 9. E27 thành thước máy đo luật kho trên cả cây; thêm E29 phán quyết hẹp

**Ở đâu:** `evals.yaml:239–245` (E27); E29 thêm ngay sau E28 (sau `evals.yaml:253`).

**Lời cũ (E27):**

```yaml
  - id: E27
    criterion: AC-15
    executor: judgment
    inputs: [docs/superpowers/specs/2026-09-30-soan-okr-cung-tro-ly-design.md, _acceptance/soan-okr-cung-tro-ly/contract.md, AGENTS.md, docs/agent.md]
    expected: "Người đọc diff và ba luật kho: trí khôn ở app eve (không enrichment/scoring trong API), khuôn parse ở packages/validation, hằng tinh chỉnh ở một tệp cấu hình mỗi khu, thành phần mới ở packages/ui, apps/agent-okr không nhập từ apps/agent; nêu vi phạm nếu có."
    evidence_required: [run_id, verifier, verified_at, output]
    paths: [apps/agent-okr/**, apps/api/src/okr/**, packages/validation/src/**, packages/ui/src/**]
```

**Lời mới (E27 thay thế, E29 thêm sau E28):**

```yaml
  - id: E27
    criterion: AC-15
    executor: script
    cmd: config:executors.script.luat_kho_cay_du
    expected: "exit 0; scripts/luat-kho/do-cay.mjs đo trạng thái cây apps/ và packages/ (không diff), in sáu dòng XANH: khong-chu-thich, tri-khon-o-agent, parse-o-bien, hang-so-o-cau-hinh, ui-tu-crm-ui, cach-ly-hai-agent; vi phạm có sẵn từ onehub chỉ qua được nhờ nền theo tệp và chữ từng dòng trong scripts/luat-kho/cau-hinh.mjs; dòng KET LUAN ghi «6/6 luat ap dung xanh, 0 khong ap dung», chieu do 32/32. App được nhận theo nội dung, không theo tên thư mục: app Nest là apps/* có @nestjs/core trong package.json, app agent là apps/* có eve trong package.json và có agent/agent.ts. Chiều đỏ: một vi phạm mới in «DO <luật>: <tệp>:<dòng>» và exit 1 — chú thích // hay /* */ hay {/* */} (kể cả dòng mới thay dòng nền cũ trong cùng tệp); app Nest nhập ai, @ai-sdk/*, context.dev, @crm/ai-okr, eve hay đường vào một app agent, kể cả khi đã khai gói đó trong package.json của nó; Record<string, unknown> hay as unknown as; N * 60_000 hay N * 60 * 1000 ngoài tệp config/cau-hinh/danh-muc; thư mục components/ui, nhập radix-ui/vaul/cmdk ngoài packages/ui, components.json trỏ ui ra ngoài @crm/ui; một app agent nhập app agent khác hay nhập apps/api, apps/app — miễn duy nhất: tệp dưới <app agent>/test/** nhập app Nest; *.spec.ts, *.dom.tsx hay thư mục test/ nằm chỗ khác không được miễn; mã ngoài <app agent>/test/** nhập test/** của chính app cũng đỏ. Luật nào không áp dụng được (thiếu app Nest hay app agent) → exit 2 «KHONG DO DUOC: thieu luat: <luật>». Thước không đo được (thiếu .oxlintrc.json, không luật nào áp dụng, lỗi bất ngờ kể cả không nạp được typescript, chiều đo không bắt đủ 32 ca tự chứng) → exit 2."
    evidence_required: [run_id, exit_code, verifier, verified_at, output]
    paths: [apps/**, packages/**, scripts/luat-kho/**, .oxlintrc.json]

  - id: E29
    criterion: AC-15
    executor: judgment
    inputs: [AGENTS.md, apps/agent-okr/agent/lib/config.ts, apps/agent-okr/agent/lib/phien.ts, apps/agent-okr/agent/lib/kenh-cua.ts, apps/agent-okr/agent/hooks/chi-phi.ts, apps/agent-okr/agent/lib/goi-soan.ts, apps/agent-okr/agent/lib/nop-ban-nhap.ts, apps/api/src/okr/soan.service.ts, apps/api/src/okr/soan-so-do.service.ts, apps/api/src/okr/soan-ban-nhap.ts, apps/api/src/okr/soan-dua-vao.ts, apps/api/src/okr/soan-vet.ts, packages/db/src/okr-cuoc-soan.ts, packages/db/src/okr-goi-soan.ts, packages/validation/src/okr-cuoc-soan.ts, packages/validation/src/okr-kiem-ban-nhap.ts, apps/app/lib/cua-okr-config.ts, "apps/app/app/eve/agents/okr/eve/v1/[...path]/route.ts"]
    expected: "Người chấm đọc hai mục «Constants belong in one file per area» và «Parse at the boundary» của AGENTS.md, rồi đọc nội dung các tệp nguồn kèm theo đúng như chúng đang có. Trả lời hai câu, mỗi chỗ vi phạm nêu tệp:dòng và vì sao: (1) có khuôn Zod nào mô tả dữ liệu mà hai gói hay hai app cùng đọc hoặc một bên ghi bên kia đọc (cột Json, thân yêu cầu giữa app web và apps/agent-okr, sự kiện phiên) nhưng được khai ngoài packages/validation/src không; (2) có con số tinh chỉnh nào (trần, số lần thử, độ dài cắt, ngưỡng, khoảng chờ) viết thẳng ở chỗ dùng thay vì nằm trong object cấu hình của khu — đơn vị (1000, 60, 24, 7, 100) và giới hạn do khuôn dữ liệu quy định không tính. Không có chỗ nào → PASS; có → FAIL kèm danh sách."
    evidence_required: [run_id, verifier, verified_at, output]
    paths: [apps/agent-okr/agent/**, apps/api/src/okr/soan*.ts, packages/db/src/okr-cuoc-soan.ts, packages/db/src/okr-goi-soan.ts, packages/validation/src/**, apps/app/lib/cua-okr-config.ts, "apps/app/app/eve/agents/okr/eve/v1/[...path]/route.ts"]
```

**Vì sao:** E27 cũ là phán quyết «người đọc diff», nhưng người chấm chỉ đọc được bốn tài liệu trong `inputs`, không đọc được diff, nên vòng nào cũng ra «không chắc» bất kể mã ra sao. Chín hồ sơ OKR trước mắc cùng lỗi. Thước chung đo trạng thái cây nên không hỏng sau mỗi lần gộp (`39779f90`, `157cdea5`, `018b9c8a`, `3d15d4af`, `fdb5d8a4`). Chạy trên HEAD `fdb5d8a4` với `--du-luat`: sáu luật xanh, chiều đo 32/32, mã 0. Hai ý thước không máy hoá được (khuôn đi qua hai gói phải ở `packages/validation`; số tinh chỉnh không phải thời lượng) chuyển sang E29 và chỉ đọc đúng tệp nguồn. So với bản nháp trong sổ, E29 thêm hai tệp: `soan-vet.ts` (khuôn vết tạo KR) và route của cửa (thân yêu cầu giữa app web và Trợ lý). Thiếu hai tệp đó thì câu (1) không chấm được ở hai chỗ dữ liệu đi qua biên.

## 10. Tiêu chí chấm tc2 theo đúng luật khởi điểm của sản phẩm (mã, không thuộc hai tệp đã ký)

**Ở đâu:** `apps/agent-okr/agent/lib/config.ts:113` (`DG.boiCanh.tieuChi[1]`). Kèm theo là `config.ts:98` (`luatJudge`), vì nó liệt kê nguồn khởi điểm thiếu hai nguồn.

**Lời cũ (dòng 113):**

```text
"dùng đúng khởi điểm từ kỳ trước và số CRM",
```

**Lời mới (dòng 113):**

```text
"khởi điểm mỗi KR là số đo gần nhất của đúng chỉ số đó, cùng đơn vị đo — từ lời người, số chốt kỳ trước, số CRM, số hiện tại của KR cấp trên cùng chỉ số, hồ sơ công ty hay trang chiến lược; để trống khi không nguồn nào đo đúng chỉ số đó; không bao giờ là một số đích",
```

**Lời cũ (dòng 98, đoạn):**

```text
khởi điểm chỉ ghi khi dữ liệu có số — kỳ trước, số CRM, hồ sơ công ty hay trang chiến lược — và để trống khi dữ liệu không có số
```

**Lời mới (dòng 98, đoạn):**

```text
khởi điểm chỉ ghi khi một nguồn đo đúng chỉ số đó cùng đơn vị đo — lời người, số chốt kỳ trước, số CRM, số hiện tại của KR cấp trên cùng chỉ số, hồ sơ công ty hay trang chiến lược — không bao giờ là một số đích, và để trống khi không nguồn nào có số đó
```

**Vì sao:** Lời dặn soạn đã theo luật đủ nguồn (`05e927a3`). Tiêu chí chấm thì vẫn hẹp hơn, nên judge tự mâu thuẫn giữa hai lần chạy: lần 6 trừ điểm vì bỏ trống, lần 7 trừ điểm vì lấy số hiện tại của KR cấp trên (`so-dieu-phoi-s3.md` «Chỗ đổi thứ mười», phát hiện chất lượng (2)).

**Thuộc gói hay sửa thẳng:** câu này không có trong `contract.md` hay `evals.yaml`, nên không cần chữ ký. Nhưng nó đổi thước mà ba phép đo đang đọc: chẩn đoán từng tiêu chí của E22, judge A/B mù của E22 (cổng ≥ 70 %, lời nhắc ghép cả sáu tiêu chí), và tờ chấm tay của E24 (`evidence/eval-soan.md` in nguyên sáu tiêu chí). **Khuyến nghị: sửa thẳng ở S3 như một commit mã, trước khi S4 chạy E22, và để mục này trong gói chỉ để chủ kho thấy thước đổi lúc ký.** Đảo được bằng một dòng, ngưỡng không đổi. `config.ts` nằm trong vùng đo của E22, nên bằng chứng lần 7 sẽ cũ. Đằng nào S4 cũng chấm lại E22, sửa trước thì lần chấm đó dùng đúng thước.

## 11. Mã loại thứ mười `khoi-diem-la-dich` vào danh sách của AC-6 và E10 (mới tìm)

**Ở đâu:** `contract.md:46` (AC-6), `evals.yaml:87` (E10).

**Lời cũ (AC-6):**

```text
`moc-co-dich-so`, `khong-don-vi`) một dòng đỏ
```

**Lời mới (AC-6):**

```text
`moc-co-dich-so`, `khong-don-vi`, `khoi-diem-la-dich`) một dòng đỏ
```

**Lời cũ (E10):**

```text
moc-co-dich-so, khong-don-vi} một dòng đỏ
```

**Lời mới (E10):**

```text
moc-co-dich-so, khong-don-vi, khoi-diem-la-dich} một dòng đỏ
```

**Vì sao:** Sau lần niêm phong, bộ kiểm bản nháp có thêm mã loại thứ mười: khởi điểm chỉ khớp một số đích thì dòng bị loại (`a8e4f900`; `packages/validation/src/okr-kiem-ban-nhap.ts:15`). Bài E10 đã có dòng đỏ và dòng lành cho mã này (`packages/validation/test/okr-kiem-ban-nhap.spec.ts:128`), nhưng danh sách mã trong lời đã ký vẫn là chín. Phần đánh đổi của mã này lên Cổng Bằng chứng (dưới), không thuộc mục này.

---

## Đã soát, không cần sửa lời

- **E2 (cửa):** cửa gọi Trợ lý vẫn trả 403 khi cuộc của người khác hay không còn mở (`route.ts:68–77`). Chỉ API đổi sang 404.
- **E9:** dùng cụm «tháng có chu kỳ pha lap-ke-hoach», nay được AC-10 định nghĩa (mục 8).
- **AC-8, chu kỳ đã ẩn:** gộp onehub thêm từ chối 400 «chu kỳ đã ẩn» ở mọi thủ tục soạn ghi (`8bce34e6`). Hành vi này nằm trong «từ chối có tên, bảng giữ nguyên» của AC-8. Ma trận AC-1 không có ô chu kỳ ẩn.
- **AC-8, bấm Đưa vào hai lần:** lần sau bị từ chối có tên, theo lời đã ký (C5, quyết định 2). Không đổi.
- **AC-9 sau D1b:** mỗi cuộc vẫn một phiên sống, `sessionId` vẫn duy nhất, mở trùng vẫn bị từ chối.
- **E22:** quyết định «đi tiếp» của chủ kho (01/10) đặt mã thoát đúng theo năm thứ hợp đồng đòi, ngưỡng không đổi. Lời E22 vẫn đúng.
- **AC-15 «diff giữ luật kho»:** E27 mới đo cả cây với nền có sẵn từ onehub. Cây không có vi phạm ngoài nền tức là lượt này không thêm vi phạm.

## Không thuộc gói này — lên thẻ Cổng Bằng chứng

- **Luật «mỗi Mục tiêu có ít nhất một KR đối trọng»** do điều phối thêm vào lời dặn soạn (`a9a7bc20`), khớp tiêu chí chấm đã duyệt nhưng chưa qua chủ kho. Chủ kho có thể bác.
- **Đánh đổi của mã `khoi-diem-la-dich`:** một số đo thật trên trang chiến lược mà trùng một số đích trong gói (mẫu «120 xe tải» = đích 120) bị loại làm khởi điểm, dù luật cho trang chiến lược là nguồn hợp lệ. Người vẫn gõ được số đó. Còn hở: số mục tiêu viết trong trang chiến lược (vd «giao đúng hẹn 96%») lấy làm khởi điểm vẫn lọt, chỉ lời dặn giữ (`a8e4f900`).
- Hai phát hiện chất lượng khác cũng đã ghi «Trình Cổng 2» trong sổ: KR đo việc vẫn lọt ở 3 đơn vị; đơn vị gốc «OneHub» của bộ mẫu bị judge chấm «không hợp đơn vị».

Quyết riêng của chủ kho, ngoài gói: có thêm thước luật kho (`luat_kho_cay`, không cờ) vào bộ kiểm chung của mọi hồ sơ không. Việc này chạm mọi hồ sơ (`so-dieu-phoi-s3.md` «Chỗ đổi thứ chín», đoạn cuối).
