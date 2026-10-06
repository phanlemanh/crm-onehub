---
schema_version: 1
feature: Tầng máy của Orchestrator–workers hai tầng, giai đoạn 1a — bộ phát lịch tất định (khoá có hạn thuê, canh sức khoẻ máy, kênh yêu cầu, hàng kế, bảng đồng hồ), CLI đợt và bốn hook (chặn S4, nhịp, chờ người)
slug: dieu-phoi-hai-tang
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [cli, config]
status: implemented
design_doc: docs/superpowers/specs/2026-10-07-dieu-phoi-hai-tang-design.md
approved_by: Phan Le Manh
approved_at: 2026-10-07
---

# Acceptance Contract: dieu-phoi-hai-tang

## Context

Ngày 04/10 phiên LLM điều phối tự phát khoá S4 bằng tin nhắn, owner làm nhịp tim (20/33 tin là
«kiểm tra»), khoá S4 bỏ trống 18′ khi còn phiên chờ, hai lần S4 chạy không giữ khoá, và tầng điều
phối tốn ≈302M token. Vòng này dựng tầng máy thay phần máy móc đó: bộ phát lịch tất định, CLI đợt,
và bốn hook, theo spec đã duyệt 05/10 và kế hoạch 1a. Vòng chỉ dựng công cụ; đợt thật mở sau khi gộp.

Source input: prompt + spec `acceptance-gate-kit@7b1afe1e:docs/superpowers/specs/2026-10-05-orchestrator-workers-hai-tang-design.md`
(§3, §4.1–§4.3, §4.5–§4.12, §5 (1a), §5.1, §7, §8) + kế hoạch `…/plans/2026-10-05-orchestrator-workers-1a.md`.

Thuật ngữ:
- **thư mục đợt** = thư mục mà symlink `.acceptance-runs/dieu-phoi-hien-tai` của checkout chính trỏ tới.
- **ngoài đợt** = không có symlink đó.
- **lệnh S4** = Workflow có `scriptPath` kết thúc bằng `acceptance-verify.js`, hoặc Bash có chuỗi
  `repin-lane`, `s4-args` (khoá `s4`) hay `duong-nen.mjs` (khoá `duong-nen`).
- **nhịp** = một lần `motNhip(thư mục đợt, io)`; `io` giả cho test, `io` thật cho tiến trình.

## Criteria

- AC-1: Given các đơn `xin/` của nhiều phiên với `moc` khác nhau trong `hang-viec.json` và một đơn `ghim-lai` có `mo_merge: true`, When một nhịp cấp lượt, Then đơn `ghim-lai` mở merge được cấp trước mọi đơn, các đơn còn lại theo `moc` sớm trước rồi giờ xin; mỗi tài nguyên cấp đúng một lượt, `ghim-lai` dùng chung khoá `s4`; đơn được cấp bị xoá, `khoa/<tài nguyên>/chu.json` có đủ `phien, slug, loai, worktree, cap_luc, han_thue_den`, và có sự kiện `cap`; tài nguyên đang giữ thì không cấp.
- AC-2: Given khoá `s4` đang giữ và còn đơn chờ, When chủ khoá nhả bằng `rm -rf khoa/s4`, Then nhịp kế tiếp cấp cho đơn đứng đầu hàng (khoá không trống khi còn đơn); và ca kẹt chéo bốn phiên mà luật «tự nhường» 04/10 không cấp cho ai thì bộ lập lịch cấp đúng một.
- AC-3: Given một khoá có `chu.json`, When nhịp xét hạn thuê, Then còn hạn thì giữ; hết hạn mà `nhip` mới hơn `nhip_cu_phut` thì gia hạn thêm đúng `han_thue_phut[loai]` và ghi sự kiện `gia-han`; hết hạn mà `nhip` cũ hoặc vắng thì thu hồi và ghi sự kiện `thu-hoi` có `can_phan: true`; thư mục khoá không có `chu.json` quá 60″ cũng bị thu hồi với `can_phan`.
- AC-4: Given số đo máy macOS, When đánh giá sức khoẻ, Then áp lực bộ nhớ ≥ `ap_luc_muc` hoặc swap dùng > `swap_gb` → giảm tải, kèm lý do có số; ca 05/10 swap 1,6/3 GB với áp lực mức 1 → không giảm tải; một tiến trình RSS > `rss_gb` → dòng «cần người» có tên tiến trình và số GB; trong giảm tải nhịp không cấp `s4`, `ghim-lai`, `duong-nen` nhưng vẫn cấp `merge`, và chỉ ghi đúng một sự kiện `giam-tai` có `can_phan` khi bước vào.
- AC-5: Given hook PreToolUse chặn S4, When nhận một lệnh S4 trong đợt, Then chưa có lượt → thoát 2 với stderr bắt đầu `chan-s4: khoá s4 đang trống nhưng chưa cấp cho phiên này. Ghi đơn xin/<phiên>-s4.json`; khoá thuộc phiên khác → thoát 2 nêu `khoá s4 đang thuộc <phiên>`; khoá ghi đúng worktree (kể cả cwd là thư mục con hay đi qua symlink) → 0; lệnh S4 mà đọc cấu hình đợt hay đầu vào hỏng → thoát 2 với `chan-s4: lỗi nội bộ: … — chặn để an toàn; báo phiên giám sát`.
- AC-6: Given hook chặn S4, When ngoài đợt, hoặc lệnh không phải S4 (kể cả khi `dieu-phoi.config.json` của đợt hỏng, hoặc đầu vào không phải JSON và không nhắc lệnh S4), Then thoát 0 không có stderr.
- AC-7: Given `.claude/settings.json` đã commit, When chạy đúng chuỗi `command` mà tệp khai cho PreToolUse, PostToolUse, Notification và UserPromptSubmit với `CLAUDE_PROJECT_DIR` là một bản sao kho, Then PreToolUse khớp `Workflow|Bash`, Notification khớp `idle_prompt|permission_prompt`; ngoài đợt cả bốn thoát 0; trong một đợt dựng ở bản sao, PreToolUse với lệnh Workflow `acceptance-verify.js` thoát 2 và stderr có `chan-s4:`; bản sao không có `scripts/dieu-phoi/` thì cả bốn thoát 0.
- AC-8: Given một phiên thợ trong đợt, When hook PostToolUse và hook chờ người chạy, Then hook nhịp chỉ chạm `khoa/<tên>/nhip` của khoá mà `worktree` trùng cwd; `idle_prompt` và `permission_prompt` đều ghi `cho-nguoi/<phiên>.json` có `phien, loai` (đúng loại thông báo), `tin, session_id`; loại thông báo khác → `bo-qua`, không ghi; `UserPromptSubmit` xoá đúng tệp đó; phiên còn đơn trong `xin/` → `cho-luot`, còn yêu cầu chưa có `tra-loi/` → `cho-tra-loi`, cả hai không ghi tệp; ngoài đợt → `ngoai-dot`, cwd không thuộc thợ nào → `khong-phai-tho`.
- AC-9: Given yêu cầu `yeu-cau/<phiên>-<số>.json`, When được xét, Then (a) ở hàm định tuyến: `cham-tep` với tệp không thuộc ranh giới thợ khác, không nằm trong nhánh mở nào ngoài nhánh của chính phiên xin, không khớp `bao_ve` hay `chung_chi_them` → máy duyệt; ba ca vướng (ranh giới `<phiên>`, `đang được nhánh <nhánh> sửa`, `thuộc danh sách bảo vệ`) → `can_phan` đúng lý do; `viec-phu` trùng cùng kho cùng tiêu đề hoặc chung tệp trong 24 giờ → `gop` với `voi: <id cũ>`; `s4-gom`/`gia-han` có ước ≤ `s4_tran_gom_phut` → máy duyệt, vượt hay thiếu ước → `can_phan`; `can-nguoi` → `can_phan` với `dich: owner`; mọi loại khác → `can_phan`; (b) ở nhịp thật: máy duyệt thì ghi `tra-loi/<id>.json` có `ket_qua: duyet, boi: may` và thêm tệp vào `ranh-gioi-them.json`; một yêu cầu `can_phan` chỉ sinh một sự kiện qua nhiều nhịp; và vì 1a chưa ánh xạ phiên → nhánh, tệp mà chính nhánh của phiên xin đang sửa vẫn thành `can_phan` nêu tên nhánh đó (lệch về phía an toàn, xem Out of scope).
- AC-10: Given `hang-viec.json` và trạng thái từng hàng suy từ `status` của `contract.md` (trên `origin/<nhanh_chinh>`: `signed-off` = đã gộp; ở worktree của phiên: `signed-off` = đã ký, có tệp = đang làm, vắng = chưa), When nhịp chọn hàng kế, Then `tiep/<phiên>.json` là hàng đang làm nếu có, nếu không là hàng chưa làm có mọi `sau` đã gộp và `uu_tien` nhỏ nhất; hàng thiếu phụ thuộc không bao giờ được chọn (→ `cho: phu-thuoc`); dãy hết hàng → `xong: true`, không bịa hàng; và ở nhịp thật, hàng đã gộp trên nhánh chính không bao giờ được giao lại.
- AC-11: Given trạng thái đợt, When nhịp ghi `trang-thai.json` và dựng `bang.html`, Then trang tự làm mới 30″, có tên đợt, khối «Hộp quyết định», phiên thợ, khoá đang giữ, hàng chờ lượt; chế độ giảm tải và dòng «cần anh» hiện ở đầu trang; mọi chuỗi được escape (`<script>` thành `&lt;script&gt;`) và chỉ link `claude://` hoặc `https://` thành `href` (link `javascript:` không thành `href`).
- AC-12: Given lỗi vận hành, When bộ phát lịch chạy, Then đơn hay yêu cầu JSON hỏng (hoặc thiếu `phien`/`loai`) bị chuyển vào `xin/hong/` hay `yeu-cau/hong/` kèm sự kiện `can_phan`, và nhịp vẫn cấp lượt cho đơn lành; `git fetch` hỏng không ngăn nhịp, và một lỗi lặp cùng nội dung chỉ ghi lại sau 30′; một tiến trình khác còn sống giữ `phat-lich.pid` thì bản thứ hai từ chối, pid đã chết thì bản mới nhận lại.
- AC-13: Given một bản sao kho git, When chạy CLI `dieu-phoi.mjs mo <tên>` rồi `chay`, `xem`, `dong`, `xem`, Then `mo` dựng thư mục đợt từ `mau/` (đủ sáu thư mục, ba tệp, `goc_kho` = gốc bản sao) và symlink; `mo` lần hai khi đợt còn chạy báo `đợt <tên> đang chạy`; `chay` để lại một bộ phát lịch tách tiến trình mà sau ≥ 1 nhịp `xem` in `đợt <tên> · dang-chay · nhịp … · khoá trống · chờ lượt 0 · chờ người 0`; trong đợt hook chặn S4 thoát 2, sau `dong` hook thoát 0, tiến trình đã dừng, và `xem` thoát 1 với `dieu-phoi: không có đợt nào đang chạy`.
- AC-14: Given `scripts/dieu-phoi/README.md` và mục 4 của design doc, When người đọc README làm phiên giám sát, Then README có đủ bốn phần mở đợt, trong đợt, đóng đợt, đường lùi, mỗi phần chở đúng các bước mục 4 liệt kê (lệnh, Monitor timeout 30′, task lịch 30′ có `notifyOnCompletion`, lời dặn chip, push gom 30′, không `/loop`, kiểm `git status --porcelain` trước khi dọn worktree) (judgment); và lệnh Monitor chép nguyên văn từ README, chạy trên một đợt đang sống, nhả ≥ 1 dòng trong 15 giây khi bộ phát lịch ghi một sự kiện `can_phan`.
- AC-15: Given mọi tệp `.mjs` và `.json` dưới `scripts/dieu-phoi/` ngoài `test/`, When quét mã, Then không có chuỗi `gh pr merge`, `--auto`, `onehub`, `crm`, đường dẫn tuyệt đối `/Users/`; không có dòng chú thích (trừ shebang); không có số `60_000`, `3600_000`, `300_000`, `1_800_000`, `30_000` ngoài `cau-hinh.mjs`; mẫu `mau/dieu-phoi.config.json` có `nhanh_chinh: "main"`; và `bun run test:dieu-phoi` chạy cả chín tệp test, mọi ca xanh.

## Coverage

Không dùng skill morphological-scan: spec ngoài đã chốt phạm vi và §7 của nó đã liệt ma trận kiểm thử
(entry `descope` trong `decisions.jsonl`). Bảng đối chiếu tay:

- Trục thành phần (spec §5 1a): lập lịch (AC-1, AC-2, AC-3, AC-10) | sức khoẻ (AC-4) | hook chặn S4 (AC-5, AC-6, AC-7) | hook nhịp + chờ người, cả `idle_prompt` lẫn `permission_prompt` (AC-7, AC-8) | kênh yêu cầu (AC-9) | bảng (AC-11) | vỏ I/O bộ phát lịch (AC-12) | CLI + vòng đời đợt (AC-13) | nghi thức giám sát và lệnh Monitor chạy thật (AC-14) | ranh giới mã §5.1 (AC-15)
- Trục chiều đo (spec §7): xanh-đúng ở mọi AC | đỏ-có-tên: thông điệp chặn (AC-5), lý do vướng (AC-9), lỗi nội bộ (AC-5) | chiều im: ngoài đợt / lệnh thường (AC-6, AC-7), chờ lượt không vào hộp quyết định (AC-8), nhánh của chính mình ở hàm định tuyến (AC-9a), thiếu phụ thuộc (AC-10) | lệch an toàn đã khai: nhánh của chính mình ở nhịp thật thành `can_phan` (AC-9b) | đối chứng luật cũ (AC-2), báo động giả 05/10 (AC-4) | tích hợp ở nhịp thật: suy trạng thái hàng (AC-10), đường đánh thức Monitor (AC-14)
- Trục hỏng vận hành (Review Focus của kế hoạch): config hỏng (AC-5, AC-6) | sập giữa lúc cấp (AC-3) | chạy hai lần (AC-12) | worktree qua symlink (AC-5) | JSON ghi dở (AC-12) | mất mạng (AC-12)

## Out of scope

- Hàng merge tự động, báo hoá cũ, train (spec §4.4, giai đoạn 1b). Không có mã nào gọi `gh pr merge`.
- Phát hiện owner merge tay và đọc check Acceptance trên đỉnh mới (spec §4.9) — đi cùng 1b.
- Suy trạng thái từ `card.html`, `run-log.jsonl`, PR và check (spec §4.6): 1a chỉ đọc `status` của `contract.md`.
- Phát lại chuỗi đơn dựng từ Nhật ký 04/10 (spec §7): AC-2 dùng ca tổng hợp.
- Ánh xạ phiên → nhánh của chính nó trong `cham-tep` (`nhanhCua` trả `null`, lệch về `can_phan`).
- Script `khoi-dong.mjs` riêng và cài launchd (spec §4.2 (6)); hook mức user chặn S4 xuyên kho (§4.10).
- Mở đợt thật, chạy thử một ngày với 3 thợ (điều kiện qua của 1a), đo thước §6 — làm sau khi gộp.
- Thợ cloud (giai đoạn 2), đóng gói vào kit (giai đoạn 3), mọi thay đổi engine kit.
- Mọi hàng của lộ trình sản phẩm.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Mã khác kế hoạch 1a đúng hai chỗ: bỏ chú thích, gom hằng thời gian vào `cau-hinh.mjs` (design doc mục 3). Test của kế hoạch giữ nguyên.
- Test chạy bằng `node --test` (Node ≥ 22; máy có v26, cần mẫu glob thay vì thư mục).
- Suite của kho (`feature_loop.suite_keys`) không chạm `scripts/dieu-phoi/`; chúng chạy mỗi round để chứng không hồi quy.
