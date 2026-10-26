---
schema_version: 2
feature_slug: ho-so-do-kiem-cheo
verdict: REJECT
failed_evals: ["E4"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a7dcf835fa3ae61bcbecb3f1c8aded37a1869440
human_signoff:
---

# Evidence Report: ho-so-do-kiem-cheo

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E4 | AC-4 | script | FAIL |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | judgment | UNCERTAIN |
| E7 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-ho-so-do-kiem-cheo-E1-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hsdk_danh_sach
  verified_at: 2026-10-26T07:39:42Z
  output: |
    danh-sach: 27 hồ sơ đầu vào · 345 eval máy · 38 dòng + 35 eval hoàn lại = 73 đỏ ở mốc nền 6be0bb688900ecd8843989bd8f8b3095548b604f

- eval: E2
  run_id: minted-ho-so-do-kiem-cheo-E2-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hsdk_khai_du
  verified_at: 2026-10-26T07:39:42Z
  output: |
    khai-du: 93 tệp đổi ngoài hồ sơ này, 22 eval đổi, mọi thay đổi có dòng danh sách

- eval: E4
  run_id: minted-ho-so-do-kiem-cheo-E4-r5
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.hsdk_ghim_xanh
  verified_at: 2026-10-26T07:39:42Z
  output: |
    (19 hồ sơ đầu in đủ «repin <run_id> sha <sha7> · suites k/k · evals m/m · recheck sạch»; cuối cùng là bo-xuong-kara, cap-nhat-tuan-okr, tro-ly-okr-nen, zalo-gui-hong-ghi-ly-do cùng sha 938c2f4)
    GHIM_TRUOC_SUA toan-canh-okr: bb5fa690b khong la to tien cua e0389b2a9
    OK tu kiem doi chung duong
    OK tu kiem suite do
    OK tu kiem lech sha
    OK tu kiem chua ghim
    OK tu kiem ghim truoc sua
    ghim-xanh: 19/20 hồ sơ

- eval: E5
  run_id: minted-ho-so-do-kiem-cheo-E5-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hsdk_yaml_chuan
  verified_at: 2026-10-26T07:39:42Z
  output: |
    yaml-chuan: 5/5 hồ sơ đạt

- eval: E6
  judged_by: judge panel (fresh context, ba góc nhìn)
  verdict: UNCERTAIN
  rationale: Cả ba góc nhìn đều UNCERTAIN. Phần lớn dòng có căn cứ đúng loại, nhưng một số chỗ chưa đủ căn cứ để khẳng định (xem phiếu từng góc nhìn bên dưới).
  votes:
    - domain-correctness: UNCERTAIN — Phần lớn dòng có căn cứ đúng loại (cap-nhat-tuan-okr:E7 not-run theo cua-toi-ba-phan AC-2, toan-canh-okr, chan-lai-component-ra-man, cron-theo-ban-khai:E8, các dòng neo cố định, và các dòng san-pham-hong đều nêu tệp, hành vi, vì sao không quyết định nào cho phép). Nhưng chu-mac-dinh-thu-vien-ngoai:E3 và :E4 gọi là loại (a) mà chỉ trích commit cho 5/6 thành phần mới (combobox-multi, flow-map, markdown-reader, radio-group, trinh-soan), không có AC hay dòng sổ. E3 còn thừa nhận chữ mặc định của radio-group, markdown-reader, stat-card CHƯA được đo, trong khi E4 khai chúng không có chuỗi mặc định và đột biến ghim chỉ kiểm khai báo import. Hai tệp không đủ để biết việc nâng neo 76·37·21 lên 120·44·39 có che một lỗi sản phẩm hay không.
    - operational-feasibility: UNCERTAIN — Phần lớn dòng đạt: các dòng neo-co-dinh thuộc loại (b), các dòng sửa răng thuộc loại (a) hoặc (c) có căn cứ, và bốn dòng sản phẩm hỏng của cai-dat-con-lai, tong-quan và so-okr-tu-chay nêu chỗ hỏng và vì sao không quyết định nào cho phép. Nhưng năm chỗ không đủ căn cứ trong hai tệp này để khẳng định: chu-mac-dinh-thu-vien-ngoai:E3, tro-ly-okr-nen:E23, cap-nhat-tuan-okr:E14, toan-canh-okr:E3/E28/E29 và các mục sua_san của hồ sơ hoàn lại. Không có dòng nào cho thấy rõ ràng việc hạ ô trong khi sản phẩm hỏng mà không được người duyệt, nên không FAIL.
    - spec-alignment: UNCERTAIN — Phần lớn dòng của `dong` có lý do khớp loại (a), (b) hoặc (c) và có căn cứ trích được: neo-co-dinh, bo-xuong-kara:E10, chan-lai-component-ra-man:E1/E2/E7, chu-mac-dinh-thu-vien-ngoai:E9, cron-theo-ban-khai:E7/E8, toan-canh-okr:E3/E28/E29 và cap-nhat-tuan-okr:E7/E19. Có bốn chỗ hai tệp này không đủ căn cứ để chấm PASS. Một là tong-quan-va-khung-noi-tieng-viet:E7, dòng san-pham-hong dựa vào mã nguồn, không có đầu ra đo, và AC-7 đã ký có thể đang cho phép chỗ đó. Hai là chu-mac-dinh-thu-vien-ngoai:E3, neo nâng 76 lên 120 mà không liệt kê từng thành phần. Ba là các dòng `sua_san` sua-rang/neo-co-dinh, không có `ly_do` và không có khối đầu ra mốc nền trong bang-truoc-sau.md. Bốn là toan-canh-okr, đầu ra sau sửa có trước lần đổi răng ngày 26/10.
  required_evidence:
    - "[domain-correctness] chu-mac-dinh-thu-vien-ngoai:E3 và E4: dòng AC trong contract.md hoặc dòng sổ decisions.jsonl đã ký của hồ sơ đã dựng combobox-multi (c74dfc452), flow-map (7b9511288), markdown-reader (7371f8c86), radio-group (6d4703002), trinh-soan (584e6caae). Lấy ở _acceptance/<hồ sơ>/contract.md và decisions.jsonl, rồi thêm vào can_cu_them của hai dòng."
    - "[domain-correctness] chu-mac-dinh-thu-vien-ngoai:E4: đầu ra một lượt đo màn thật ở HEAD cho thấy radio-group, markdown-reader và stat-card không sinh chữ mặc định tiếng Anh (hoặc sinh thì đã được khai). Lấy bằng bộ mở nguyên bản mo-nguyen-ban.mjs của chan-lai-component-ra-man hoặc lượt đo màn của chu-mac-dinh-thu-vien-ngoai. Đây là chỗ E3 tự nhận chưa đo; đột biến khai-nguyen-ban-sai-radio-group hiện chỉ bắt khai báo import lucide."
    - "[domain-correctness] cron-theo-ban-khai:E7: một tín hiệu (tin_hieu) hoặc hàng lộ trình theo dõi 33 cảnh báo lint apps/app thêm (36 ở HEAD, ghim 3), lấy ở danh-sach.json hoặc docs/plan/lo-trinh-*.json. Sau khi ô đổi sang đo cây 147b47a33^2, không còn chốt máy nào canh con số ở HEAD, và dòng sổ d-20261022T104414Z-13 tự khai giá đó."
    - "[domain-correctness] hoan_lai.sua_san của tong-quan-va-khung-noi-tieng-viet (E4, E15) và cai-dat-con-lai-noi-tieng-viet (E1, E3, E15): trường ly_do ghi loại (a)-(d) cho từng dòng mở rộng danh sách miễn trừ (khong-phai-chu-nguoi-doc.json, khong-dich-cua-lat.json) hoặc thay ghim cứng bằng số sống. Hiện các dòng này chỉ có sua và can_cu (có dòng can_cu chỉ là tên ô «E15,E3»), không có lý do."
    - "[operational-feasibility] chu-mac-dinh-thu-vien-ngoai:E3 — neo nâng 76·37·21 lên 120·44·39 chỉ kê tên 6 tệp bọc thư viện ngoài. Cần danh sách đủ 45 tệp component và 18 tệp đọc kho chuỗi thêm vào, mỗi tệp gắn một AC hoặc dòng sổ của hồ sơ đã ký. Lấy bằng `git diff --name-status 3f99c7055..HEAD -- packages/ui/src/components` kèm đầu ra danh sách của `node _acceptance/chu-mac-dinh-thu-vien-ngoai/rang/khai-sinh.mjs`. Cần thêm đo chữ mặc định trên màn của radio-group, markdown-reader, stat-card. Dòng này tự nhận là chưa đo."
    - "[operational-feasibility] tro-ly-okr-nen:E23 — mục «Trợ lý OKR» được so với CONTEXT.md cũ vì «hồ sơ ký sau» (#230, nhánh proto/gop-y-dung-cho). Cần chỉ ra AC hoặc dòng sổ trong hợp đồng đã ký (nen-kara hoặc gop-y-dung-cho) đã chủ ý đổi mục đó. Lấy từ `git show 923f57173 --stat` và contract.md hoặc decisions.jsonl của hồ sơ ấy. Nếu #230 chỉ là PR tài liệu/proto không có hồ sơ ký thì dòng này không thuộc loại (a)."
    - "[operational-feasibility] cap-nhat-tuan-okr:E14 — khối nền chỉ có đuôi 11 dòng `dev-session`, không có dòng HONG nào của E14. Cần log đầy đủ của lượt nền (như đã làm cho E19) cho thấy E14 đỏ vì gì. Cần trích nguyên văn AC-3 và AC-4 của cua-toi-ba-phan (`_acceptance/cua-toi-ba-phan/contract.md`) để chứng entry mong đợi đổi sang `viec-cua-toi`."
    - "[operational-feasibility] toan-canh-okr:E3/E28/E29 — «Đầu ra sau» là lượt 23/10 trên cây 730af844a, có trước lần sửa răng ngày 26/10 theo trang-bo-okr (7bbfbc00c). Cần đầu ra chạy lại `man-toan-canh.mjs` sau lần sửa đó (mã 0, số khẳng định) và AC hoặc dòng sổ đã ký của trang-bo-okr cho phép đổi trang. Hiện chỉ có tên commit."
    - "[operational-feasibility] hoan_lai[*].sua_san (ví dụ so-okr-tu-chay:E23/E25 neo-co-dinh, tong-quan-va-khung-noi-tieng-viet:E4 «gỡ giữ nguyên primary/error», cai-dat-con-lai-noi-tieng-viet:E12/E15 đổi neo và nới danh sách cho phép) — các mục này không có trường ly_do và không có khối tương ứng trong bang-truoc-sau.md. Cần mỗi mục một ly_do nêu loại (a)–(d) kèm AC hoặc sha, và nếu có thì khối trước/sau, để chứng việc nới danh sách không che lỗi sản phẩm."
    - "[operational-feasibility] so-okr-tu-chay:E14 (F1-30) — lỗi hydrat chỉ được gọi tên theo cây thành phần `PhanDonViDan › TheDonVi › CardDescription`, không có đường dẫn tệp. Cần đường dẫn tệp và dòng của `CardDescription` (dựng `span[data-so-tom-tat]` ở trình duyệt, khung xương ở máy chủ). Lấy bằng `grep -rn \"data-so-tom-tat\" apps/app`."
    - "[spec-alignment] tong-quan-va-khung-noi-tieng-viet:E7. Đầu ra lượt đo E7 sau khi áp sửa răng ghi sẵn ở `sua_san` E1 (`man-that.mjs` bỏ nhập `deal-stage.ts`, lấy giai đoạn từ `giaiDoan.list`). Đầu ra này phải cho thấy chính E7 đỏ vì nhãn giai đoạn ở `sales-dashboard.tsx:204-208` thiếu `translate=\"no\"`. Lấy bằng cách chạy lệnh của E7 trong `_acceptance/tong-quan-va-khung-noi-tieng-viet/evals.yaml` trên cây đã áp sửa răng, rồi dán vào khối E7 của bang-truoc-sau.md. Kèm một câu của chủ kho (dòng sổ) nói AC-7 («trừ nhãn mang lang=en») không còn áp cho nhãn giai đoạn là dữ liệu workspace. Thiếu cả hai thì chưa biết E7 có đỏ sau sửa răng không, và chưa loại được việc AC-7 đã ký cho phép."
    - "[spec-alignment] chu-mac-dinh-thu-vien-ngoai:E3. Danh sách từng tệp trong 45 component và 18 tệp đọc kho chuỗi mới (120 − 76, 39 − 21), mỗi tệp gắn với một AC hoặc dòng sổ của hồ sơ đã ký thêm nó. Hiện chỉ có combobox-multi, context-menu, flow-map, markdown-reader, radio-group, trinh-soan và stat-card được nêu tên, kèm mã commit. Lấy bằng cách chạy lại logic của `rang/khai-sinh.mjs` giữa `3f99c7055` và HEAD, in tên tệp thêm và bỏ, rồi ghi vào `can_cu_them` của dòng. Chữ mặc định của radio-group, markdown-reader và stat-card cũng cần một đo trên màn, vì `ly_do` thừa nhận «CHƯA được đo»."
    - "[spec-alignment] Các dòng `sua_san` có xu_ly sua-rang hoặc neo-co-dinh trong `hoan_lai`: cai-dat-con-lai-noi-tieng-viet E1, E3, E6, E10, E11, E12, E14, E15, E17; tong-quan-va-khung-noi-tieng-viet E1, E2, E4, E8, E10 đến E15, E21; so-okr-tu-chay E8, E23, E25. Mỗi dòng cần trường `ly_do` ghi rõ thuộc loại (a), (b), (c) hay (d), kèm căn cứ là AC hoặc dòng sổ (hiện `can_cu` chỉ là mã commit), và một khối «Đầu ra đỏ ở mốc nền» trong bang-truoc-sau.md. Nơi lấy: các mục `hoan_lai[].sua_san[]` của danh-sach.json, và khối tương ứng do `rang/bang.mjs` sinh ra. Các dòng này nới danh sách miễn trừ (`khong-phai-chu-nguoi-doc.json` thêm `data-slot`, `hinh`, `aria-haspopup`, giữ nguyên «Sign out failed»; `soi-ma.mjs` thêm miễn trừ `nap.ts`) nên cần lý do mới chấm được."
    - "[spec-alignment] toan-canh-okr:E3, E28, E29. Đầu ra lượt `man-toan-canh.mjs` chạy sau lần đổi răng 26/10 (mở trang đơn vị với `donOkr=goc`, bấm `[data-the='danh-sach']` và `[data-the='hop-tuan']`). Cột `duoi_sau` hiện là lượt 23/10 trên cây `730af844a`, có trước lần đổi này, nên chưa chứng minh bản răng hiện tại xanh. Lấy bằng cách chạy lệnh của E3 trong `_acceptance/toan-canh-okr/evals.yaml` trên HEAD hiện tại rồi dán dòng «N khẳng định, 0 hỏng» vào `duoi_sau`."
    - "[spec-alignment] tro-ly-okr-nen:E25 và bang-thanh-vien-giu-hang:E1 đến E7. Với E25, dòng AC hoặc dòng sổ của tro-ly-okr-tom-tat quy định phiên con của trợ lý ghi `okr.chuyen-tiep` thay cho `okr.de-xuat`. Hiện chỉ có thông điệp commit `853f07bd2`, không phải AC hay dòng sổ. Với E1 đến E4, E6, E7 của bang-thanh-vien-giu-hang, một câu nói rõ vì sao các ô này đỏ ở mốc nền: dùng chung lệnh với E5, như toan-canh-okr đã ghi. Hiện `ly_do` chỉ dẫn «datatable-loc-ro (AC-1, AC-3)». Lấy bằng cách trích nguyên văn AC-1 và AC-3 từ `_acceptance/datatable-loc-ro/contract.md` vào `can_cu_them`, và thêm dòng giải thích dùng chung lệnh."
  human_override:  # chi nguoi ghi

- eval: E7
  run_id: minted-ho-so-do-kiem-cheo-E7-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hsdk_loi_ra
  verified_at: 2026-10-26T07:39:42Z
  output: |
    loi-ra: 5 hồ sơ hoàn lại, 0 lỗi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ho-so-do-kiem-cheo-SUITE-bun_run_test_filter_api-r5
  exit_code: 1
  verified_at: 2026-10-26T07:39:42Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-ho-so-do-kiem-cheo-SUITE-bun_run_test_filter_app_filter_crm_ui-r5
  exit_code: 0
  verified_at: 2026-10-26T07:39:42Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ho-so-do-kiem-cheo-SUITE-bun_run_test_filter_agent_filter_crm_aut-r5
  exit_code: 0
  verified_at: 2026-10-26T07:39:42Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ho-so-do-kiem-cheo-SUITE-bun_run_test_filter_agent_okr_filter_crm-r5
  exit_code: 0
  verified_at: 2026-10-26T07:39:42Z

- cmd: bunx turbo run lint --force
  run_id: minted-ho-so-do-kiem-cheo-SUITE-bunx_turbo_run_lint_force-r5
  exit_code: 0
  verified_at: 2026-10-26T07:39:42Z

- cmd: bun run lint:slop
  run_id: minted-ho-so-do-kiem-cheo-SUITE-bun_run_lint_slop-r5
  exit_code: 0
  verified_at: 2026-10-26T07:39:42Z

- cmd: bunx turbo run build --force
  run_id: minted-ho-so-do-kiem-cheo-SUITE-bunx_turbo_run_build_force-r5
  exit_code: 0
  verified_at: 2026-10-26T07:39:42Z

Lệnh đỏ không gắn eval nào: `bun run test -- --filter=api` có 2083 bài đạt, 17 bỏ qua, 1 bài đỏ trên 2101 bài ở 265 tệp (tệp báo cáo không nêu tên bài đỏ). Lệnh `bun _acceptance/ho-so-do-kiem-cheo/rang/ghim-xanh.mjs` đỏ là chính E4 ở trên.

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 4 — baseline khong do lai round nay

Eval không phân biệt (xanh cả trên HEAD lẫn mốc nền): không có.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1 đỏ và E3 chưa chạy xong trong trần 30 phút. Trả về triển khai.
Round 2: chạy lại cả bảy eval (E1–E7, gồm E3 và E6); chi tiết ở run-log.jsonl.
Round 3: E3 rời bộ eval sau khi chủ kho thu F28 khỏi to-chuc-danh-sach-chi-tiet; E1, E2, E4, E5, E7 và hội đồng E6 chạy lại.
Round 4: sau khi ký lại Cổng Phạm vi, năm eval máy và bảy lệnh suite đều xanh; E6 còn UNCERTAIN ở cả ba góc nhìn, chờ người chốt ở Cổng Bằng chứng.
Round 5: E4 đỏ, 19/20 hồ sơ ghim đạt; toan-canh-okr bị GHIM_TRUOC_SUA vì commit cuối chạm hồ sơ (bb5fa690b, sửa răng đo màn) không là tổ tiên của sha ghim e0389b2. Lệnh suite api còn một bài đỏ không gắn eval. E1, E2, E5, E7 xanh; E6 vẫn UNCERTAIN ở cả ba góc nhìn. Giờ verified_at là mốc ngày vì run-log chưa mang giờ chạy của lượt này. Trả về triển khai: ghim lại toan-canh-okr sau commit sửa răng.
