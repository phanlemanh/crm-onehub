---
schema_version: 1
feature: trang máy vẽ gộp không xung đột (giữ bản mình rồi vẽ lại) và hook trước-đẩy bỏ bước nặng khi cây mã đã xanh
slug: trang-ve-gop-va-dau-cay
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: implemented
approved_by: Manh Phan
approved_at: 2026-10-23T09:40:32Z
design_doc: docs/superpowers/specs/2026-10-23-trang-ve-gop-va-dau-cay-design.md
---

# Acceptance Contract: trang-ve-gop-va-dau-cay

## Context

Hai hạng B và E của gói «cắt 80%» (đoạn ký → gộp, 23/10). B: `PRODUCT-MAP.md` và `LO-TRINH.html` — hai tệp duy nhất
`scripts/product-map.mjs` ghi — xung đột ở mọi lần `onehub` đi tiếp; ca #550 lúc 13:19 xung đột đúng ở hai tệp này và
mất 53 phút gộp, đẩy lại. E: `.githooks/pre-push` chạy năm bước nặng ở mọi lần đẩy kể cả khi đúng phần mã ấy đã xanh.
Thuật ngữ «cây mã», «cùng cây mã», «dấu», «phiếu», «nguồn» theo design doc. `.githooks/pre-push` và
`.githooks/gate-shape.json` không đổi (design doc, mục «không sửa `.githooks/pre-push`»).

## Criteria

- AC-1: Given cây sau vòng này, When đọc `.gitattributes` và chạy `node scripts/product-map.mjs --root .` trong một bản
  sao sạch đã xoá mọi tệp mang `merge=trang-ve`, Then tập tệp mang `merge=trang-ve` đúng bằng tập tệp bộ vẽ dựng lại, và
  bộ vẽ không đổi tệp đang theo dõi nào khác; `bun install` (script `prepare`) ghi `merge.trang-ve.driver` vào cấu hình
  git chung, nên một worktree khác của cùng kho đọc được nó mà không chạy gì thêm.
- AC-2: Given ca thật 23/10 13:19 — đầu #550 `bcf7ecdf9` gộp `onehub` `084ec4d12` — với bộ công cụ của vòng này
  thêm vào cả hai phía, When gộp không có driver, Then xung đột đúng ở `LO-TRINH.html` và `PRODUCT-MAP.md`; When gộp có
  driver và hook của cây, Then `git merge` thoát 0 không xung đột, đỉnh có đúng hai cha là hai đầu đem gộp cùng lời,
  tác giả git đã tạo, `node scripts/product-map.mjs --root . --check` trên một bản sạch của đỉnh thoát 0, và cây làm
  việc cùng chỉ mục sạch.
- AC-3: Given lần gộp dừng vì xung đột ở một tệp không phải trang máy vẽ, hoặc `git merge --no-commit`, When người giải
  xong và `git commit`, Then hai trang trong commit gộp khớp bộ vẽ trên cây của chính commit đó (`--check` thoát 0), và
  trang không bao giờ là chỗ git dừng.
- AC-4: Given bước «Product map» của `.github/workflows/acceptance.yml`, When so với `origin/onehub`, Then không đổi một
  byte; và cùng ca của AC-2 gộp với `CRM_SKIP_HOOKS=1` thì `git merge` vẫn thoát 0 nhưng `--check` thoát 1 và gọi tên
  cả hai trang — bỏ bước vẽ lại thì CI đỏ đúng chỗ.
- AC-5: Given cây làm việc có thư mục hồ sơ chưa commit dưới `_acceptance/`, bộ vẽ hỏng, hay một commit thường hoặc gộp
  tua nhanh, When hook gộp chạy, Then trang vẽ chỉ từ nội dung đã vào commit (hoặc chỉ mục) — thư mục chưa commit không
  lọt vào trang; bộ vẽ hỏng thì lần gộp và commit không bị chặn, in đúng một dòng gọi lệnh vẽ tay, thoát 0; không còn
  worktree tạm nào sau đó; commit thường và gộp tua nhanh không vẽ, không in gì; hook gộp mới luôn chạy bản của chính
  cây kể cả khi `core.hooksPath` trỏ checkout chính.
- AC-6: Given hai commit chỉ khác nhau ở tệp T1 thường (`docs/*.md`, `_acceptance/<hồ sơ>/run-log.jsonl`), When so cây
  mã, Then cùng cây mã; khác một tệp mã, một tệp `t1_ma_doc` (`LO-TRINH.html`), một tệp `.github/` (`ci.yml`, dù T1),
  `_acceptance/config.yaml`, hoặc diff vượt ngưỡng tệp → khác cây mã.
- AC-7: Given một lần đẩy chạy đủ năm bước xanh, When đẩy tiếp một commit cùng cây mã, Then hook không chạy bước nào,
  stderr có đúng một dòng `pre-push: cây mã của <sha> đã xanh ở hook (…) — bỏ check-types, lint, lint:slop, test, build.`
  và thoát 0; dấu chỉ ghi đúng các bước vừa thật sự chạy xanh — lần đẩy có bước đỏ không ghi, lần đẩy được chứng đủ
  không ghi dấu mới (dấu không tự gia hạn), bước do nguồn khác chứng không vào dấu; dấu quá hạn, dấu mang vân tay môi
  trường khác (`node`, `bun`, `.env`), hay tệp dấu hỏng không được dùng; đẩy nhiều ref thì chỉ bỏ bước mà mọi ref đều đã
  chứng.
- AC-8: Given sổ chạy của cây đang đẩy có dòng S4 hoặc dòng ghim lại xanh trên một sha cùng cây mã, When đẩy, Then hook
  bỏ đúng các bước mà lệnh xanh chứng theo tệp khai và vẫn chạy phần còn lại (hôm nay: `check-types`); `test` chỉ được
  bỏ khi các lệnh test xanh phủ đủ mọi gói cần test; dòng có mã khác 0 không chứng gì.
- AC-9: Given check-run của GitHub trên một commit cùng cây mã, When đẩy, Then hook bỏ bước theo ánh xạ job → bước của
  tệp khai, ô test bị bỏ qua hay đỏ thì `test` vẫn chạy; remote không phải GitHub, `gh` lỗi hay quá hạn giờ thì không bỏ
  gì và lần đẩy không hỏng vì nguồn này.
- AC-10: Given không có dấu nào, When đẩy, Then stdout, stderr của bộ phân loại và các bước hook chạy y như bản
  `origin/onehub` trên cùng kho mẫu; `verify-gate-shape.mjs` chỉ nhận bước bỏ vì đã chứng khi có phiếu của chính lần đẩy
  và tệp khai có `vi_sao`, và từ chối khi bước ấy vẫn chạy hay không phải checker đã khai; xoá tệp khai thì mọi lần đẩy
  chạy đủ dù có dấu; `.githooks/pre-push` và `.githooks/gate-shape.json` giống từng byte `origin/onehub`; không dòng
  thêm nào của vòng trong `.githooks/`, `scripts/`, `.github/` hay `package.json` mang `--no-verify`.

## Coverage

Quét bằng `morphological-scan` preset test-matrix; trục, thước CE, nhãn nguồn và phần cắt ở design doc mục «Quét không
gian». Ánh xạ trục → AC:

- B · kiểu gộp: tự động (AC-2) | dừng vì xung đột tệp khác (AC-3) | `--no-commit` (AC-3) | tua nhanh (AC-5) | rebase,
  cherry-pick (Out of scope).
- B · cấu hình: có driver và hook (AC-2) | không driver (AC-2 đối chứng) | hook tắt (AC-4) | bộ vẽ hỏng (AC-5) | hook
  của checkout chính cũ hơn cây (AC-5: hook mới chạy bản của cây).
- B · cây làm việc: sạch (AC-2) | có hồ sơ chưa commit (AC-5).
- E · nguồn: dấu hook (AC-7) | sổ chạy S4 (AC-8) | sổ chạy ghim lại (AC-8) | CI (AC-9) | không có (AC-10).
- E · trạng thái dữ liệu: đủ năm bước (AC-7) | một phần (AC-8, AC-9) | đỏ hoặc bỏ qua (AC-8, AC-9) | quá hạn, hỏng,
  môi trường khác (AC-7).
- E · tệp khác giữa hai commit: T1 thường | `t1_ma_doc` | `.github/` | mã | `config.yaml` | quá ngưỡng (AC-6).
- Cross-cutting: nhiều ref (AC-7); phiếu theo cây làm việc, phiếu cũ không dùng (AC-10).

## Đường đo

Không có ngưỡng: vòng không đi từ Cổng Đáng (không có `opportunity.md`). Số đo gốc (53 phút ở #550; sáu lượt test
cho một PR hai lần đẩy) nằm trong design doc để so sau khi gộp, không phải cổng của vòng. B cắt phần giải tay và phần
đẩy lại vì trang vẽ sai; không cắt lần gộp và đẩy lại mà GitHub vẫn đòi (design doc, «Phần nào của 53 phút B cắt
được»).

## Out of scope

- Xung đột ở `_acceptance/config.yaml` (tệp gộp tay nhiều nhất) và `apps/api/src/generated/server.ts` — không phải đầu ra
  của bộ vẽ bản đồ.
- GitHub vẫn báo PR «có xung đột» theo phép gộp của máy chủ (không chạy driver tự khai) cho tới khi một lần gộp trên máy
  được đẩy lên; phương án 2 của hạt giống kit (không commit trang ở PR, job sau gộp tự vẽ) và mọi đổi ở kit.
- `rebase`, `cherry-pick`: driver giữ bản phía «ours», không vẽ lại; `--check` ở CI bắt.
- Nguồn CI hiểu theo cách nào (merge-ref hay chỉ khi cây merge-ref trùng cây đỉnh) — câu hỏi ở Cổng Phạm vi.
- Sửa `.githooks/pre-push`, `.githooks/gate-shape.json`, `--check` hay luật phân loại T1.

## Notes

- Hồ sơ đã ký có `paths` chạm `scripts/pre-push-t1.mjs`, `scripts/verify-gate-shape.mjs`, `package.json` hay
  `packages/ui/test/**` hoá cũ và được ghim lại trong cùng PR bằng một làn.
