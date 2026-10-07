---
schema_version: 1
feature: Bộ điều phối — vá năm lỗ ở biên trước khi mở đợt (hook chặn S4 nhận bản chép, kiểm hình dạng hai tệp cấu hình đợt, test điều phối vào cổng, giữ nhịp khi chờ việc nền, gia hạn theo yêu cầu thật sự kéo dài hạn thuê)
slug: dieu-phoi-va-bien
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [cli, config, ci]
status: implemented
design_doc: docs/superpowers/specs/2026-10-07-dieu-phoi-va-bien-design.md
approved_by: Phan Le Manh
approved_at: 2026-10-07
---

# Acceptance Contract: dieu-phoi-va-bien

## Context

Cổng 2 lượt 4 của `dieu-phoi-hai-tang` (ký 07/10) để lại năm lỗi thật ngoài hợp đồng mà owner chọn
«mở hợp đồng mới» (Ngoài-1, 3, 5, 6, 7 trong `_acceptance/dieu-phoi-hai-tang/review-findings.md`). Nặng
nhất: hook chặn S4 không nhận bản chép `acceptance-verify-<slug>-r<N>.js` mà kho này thật sự chạy, nên
hai lượt S4 vẫn chạy chồng được như 04/10. Vòng này vá cả năm và phải gộp trước khi mở đợt sau-14-10.

Source input: prompt của owner 07/10 + `review-findings.md` lượt 4 + dòng `d-20261007T002515Z-16`.
Nhánh rẽ từ `origin/feat/dieu-phoi-hai-tang` @ `a3ac4cfc` (PR #288 chưa gộp lúc mở vòng).

Thuật ngữ (thêm vào thuật ngữ của `dieu-phoi-hai-tang`):
- **S4 workflow** = lời gọi Workflow mà (a) tệp `scriptPath` hoặc `script` nội tuyến khai
  `meta.name: 'acceptance-verify'`, hoặc (b) `name` là `acceptance-verify`, hoặc (c) không đọc được
  tệp nhưng tên tệp khớp `acceptance-verify*.js`.
- **lệnh nặng** = lệnh mà hook chặn S4 phân loại ra tài nguyên (`s4`, `duong-nen`).
- **lệnh bọc** = `node <thư mục công cụ>/giu-nhip.mjs -- <lệnh>`.

## Criteria

- AC-1: Given một đợt mà khoá `s4` chưa cấp cho phiên, When hook chặn S4 nhận Workflow ở từng dạng của ma trận — `scriptPath` tên `acceptance-verify.js`; tên `acceptance-verify-<slug>-r<N>.js` (đúng khuôn tên bản chép trong `.acceptance-runs/wf/`); tên bất kỳ (`s4-r3.js`) mà tệp khai `meta.name: 'acceptance-verify'`; `name: 'acceptance-verify'`; `script` nội tuyến khai meta đó — Then cả năm thoát 2 với stderr bắt đầu `chan-s4: khoá s4 đang trống nhưng chưa cấp cho phiên này`; và khi khoá ghi đúng worktree của phiên thì cả năm thoát 0.
- AC-2: Given cùng đợt đó, When hook nhận Workflow không phải S4 — `execute-parallel.js` có meta khác; tệp không tồn tại tên khác; `script` nội tuyến khai meta khác — Then thoát 0 không stderr; còn đầu vào không phải JSON mà nhắc `acceptance-verify-x-r2.js` thì thoát 2 với `chan-s4: lỗi nội bộ: … — chặn để an toàn; báo phiên giám sát`.
- AC-3: Given `dieu-phoi.config.json` sai hình dạng ở từng ô của ma trận mười sáu phần tử — `bao_ve` là chuỗi; `bao_ve` có phần tử không phải chuỗi; `han_thue_phut` thiếu từng loại một trong bốn loại đơn mà bộ cấp khoá nhận (bốn ô); `han_thue_phut[loai]` không phải số dương; `nhip_cu_phut` không phải số; `nhip_cu_phut` không lớn hơn chu kỳ giữ nhịp tính bằng phút; `s4_tran_gom_phut` thiếu; `suc_khoe` thiếu từng khoá một trong `swap_gb`, `ap_luc_muc`, `rss_gb` (ba ô); `nhanh_chinh` rỗng; `goc_kho` rỗng; một khoá lạ — When bộ kiểm hình dạng đọc, Then ném lỗi bắt đầu `dieu-phoi.config.json: ` và nêu đúng tên trường; cấu hình mẫu `mau/dieu-phoi.config.json` cộng `goc_kho` thì qua; và bộ phát lịch khởi động với cấu hình thiếu `goc_kho` thì thoát 1 với `phat-lich: dieu-phoi.config.json: goc_kho …`, còn một nhịp và các hook (không dùng `goc_kho`) không đòi nó.
- AC-4: Given `hang-viec.json` sai hình dạng ở từng ô của ma trận mười ba phần tử — `day` không phải mảng; một dãy thiếu `id`; một dãy thiếu `worktree`; `id` trùng; một hàng thiếu `slug`; `hang[].day` trỏ phiên không có trong `day`; `sau` là chuỗi; `ranh_gioi` là chuỗi; `chung_chi_them` là chuỗi; `uu_tien` không phải số; khoá lạ ở gốc; khoá lạ ở dãy; khoá lạ ở hàng — When bộ kiểm đọc, Then ném lỗi bắt đầu `hang-viec.json: ` nêu đúng trường; mẫu `mau/hang-viec.json` và `hang-viec.json` của mọi fixture test đều qua.
- AC-5: Given một đợt có cấu hình sai hình dạng — `bao_ve` là chuỗi `"packages/db/prisma/**"` và một yêu cầu `cham-tep` xin `packages/db/prisma/schema.prisma`; hoặc thiếu `han_thue_phut["duong-nen"]` và một đơn `duong-nen` lành — When vòng nhịp thật (`taoVong`) chạy, Then không ghi `tra-loi/`, không tạo thư mục `khoa/duong-nen`, không thêm gì vào `ranh-gioi-them.json`, và `su-kien.jsonl` có đúng một sự kiện `loi-nhip` `can_phan: true` mà `ly_do` bắt đầu `dieu-phoi.config.json: ` nêu trường sai; cùng fixture với cấu hình đúng thì tệp bảo vệ thành `can_phan` «thuộc danh sách bảo vệ» và đơn `duong-nen` được cấp với `han_thue_den` hợp lệ.
- AC-6: Given hook chặn S4 và hook chờ người trong một đợt có `dieu-phoi.config.json` hay `hang-viec.json` sai hình dạng (JSON đúng cú pháp), When nhận lệnh, Then với `dieu-phoi.config.json` sai: lệnh S4 thoát 2 với `chan-s4: lỗi nội bộ: dieu-phoi.config.json: …`, lệnh không phải S4 thoát 0, còn hook chờ người (không đọc tệp này) vẫn ghi `cho-nguoi/` như thường; với `hang-viec.json` sai: hook chờ người không ghi `cho-nguoi/` và tiến trình thoát 0, còn hook chặn S4 (không đọc tệp này) giữ nguyên hành vi — lệnh thường 0, lệnh S4 của phiên giữ khoá 0.
- AC-7: Given `bun run test:dieu-phoi`, When đẩy mã hay mở PR, Then vòng lệnh của `.githooks/pre-push` có `test:dieu-phoi`; `.githooks/gate-shape.json` khai checker `test:dieu-phoi` kiểu `node-test` trỏ `scripts/dieu-phoi/test`, kèm lý do không nằm trong `bun run test`; script `test:dieu-phoi` trong `package.json` phủ mọi `*.test.mjs` của thư mục đó; `.github/workflows/acceptance.yml` có job dựng Node 24 rồi chạy `bun run test:dieu-phoi`. (Job xanh trên PR là việc của S5, không phải phép đo của vòng.)
- AC-8: Given checker `node-test` của `scripts/verify-gate-shape.mjs`, When đọc log cổng, Then log lành (mục `pre-push: bun run test:dieu-phoi` có tổng kết với số ca bằng lượt tham chiếu và 0 đỏ) → không vấn đề và một dòng báo `test:dieu-phoi: <N> tests`; log thiếu mục hay thiếu tổng kết → vấn đề nêu `reported no test summary`; số ca ít hơn tham chiếu → vấn đề nêu hai con số; có ca đỏ → vấn đề nêu số đỏ; kiểu checker lạ vẫn là vấn đề như cũ.
- AC-9: Given khoá `s4` của P1 đã hết hạn và `nhip` cũ 20′, When P1 chạy một lệnh dài hơn vài chu kỳ giữ nhịp qua lệnh bọc rồi bộ phát lịch chạy một nhịp, Then khoá được gia hạn (sự kiện `gia-han`, `chu.json` còn); cùng fixture mà lệnh chạy không qua lệnh bọc → khoá bị thu hồi (sự kiện `thu-hoi`); lệnh bọc trả đúng mã thoát của lệnh con (0 và 3), chuyển `SIGTERM` cho lệnh con, và ngoài đợt vẫn chạy lệnh như thường.
- AC-10: Given P1 đang giữ khoá `s4` (hoặc `duong-nen`) trong đợt, When hook chặn S4 nhận Bash là lệnh nặng với `run_in_background: true` mà không qua lệnh bọc, Then thoát 2 với stderr bắt đầu `chan-s4: lệnh nền giữ khoá s4 phải chạy qua giu-nhip:` theo sau là đúng dòng lệnh đã bọc với đường tuyệt đối của `giu-nhip.mjs`; cùng lệnh qua lệnh bọc → 0; cùng lệnh chạy tiền cảnh → 0; lệnh không nặng chạy nền → 0; phiên không giữ khoá vẫn nhận thông điệp chặn cũ.
- AC-11: Given P1 giữ khoá `s4` với `han_thue_den` 13:30, When yêu cầu `gia-han` của P1 có `uoc_phut` 30 ≤ trần tới lúc 12:00, Then `tra-loi` ghi `ket_qua: duyet, boi: may`, `chu.json` có `han_thue_den` 14:00 và `gia_han_theo` chứa id, có sự kiện `gia-han` nêu `theo_yeu_cau`; các nhịp sau không cộng lần hai; khi hạn cũ đã qua thì gốc là giờ nhịp; phiên không giữ khoá nào → `can_phan` «không giữ khoá nào»; nêu `tai_nguyen` mà phiên không giữ → `can_phan`; giữ hai khoá mà không nêu → `can_phan`; vượt trần hay thiếu ước vẫn `can_phan` như cũ.
- AC-12: Given một yêu cầu `gia-han` đã `can_phan`, When giám sát ghi `tra-loi/<id>.json` `ket_qua: duyet` (có hoặc không có `uoc_phut` riêng), Then nếu khoá còn do chính phiên yêu cầu giữ, nhịp kế kéo dài đúng một lần theo số phút của `tra-loi` nếu có, không thì của yêu cầu; yêu cầu viết trước `cap_luc` của lượt hiện tại không áp vào lượt đó; khoá đã sang tay phiên khác thì hạn của phiên đó không đổi và có một sự kiện `can_phan` nêu id; `tra-loi` duyệt mà không có số phút dương nào → không đổi hạn, một sự kiện `can_phan` nêu id, không lặp ở nhịp sau.
- AC-13: Given cây sau vòng, When quét và chạy lại, Then mọi tệp `.mjs`/`.json` dưới `scripts/dieu-phoi/` ngoài `test/` vẫn qua ranh giới mã cũ (không `onehub`, `crm`, `/Users/`, `gh pr merge`, `--auto`, dòng chú thích, số thời gian ngoài `cau-hinh.mjs`) và `cau-hinh.mjs` có `giuNhipMs`; `bun run test:dieu-phoi` xanh; bộ đột biến cũ `_acceptance/dieu-phoi-hai-tang/rang/dot-bien.mjs` vẫn thoát 0 (mọi mốc cũ còn, mọi ca ghim cũ đỏ dưới đột biến của nó).
- AC-14: Given `scripts/dieu-phoi/mau/LUAT.md` và `README.md`, When một phiên thợ đọc LUAT trước S1 và phiên giám sát đọc README, Then thợ biết chạy việc nền dài khi giữ khoá bằng lệnh bọc (kèm lệnh mẫu) và cách xin `gia-han` (`noi_dung.uoc_phut`, `noi_dung.tai_nguyen` khi giữ nhiều khoá); giám sát biết hai tệp cấu hình được kiểm hình dạng ở mỗi nhịp, sai thì có sự kiện `loi-nhip` nêu trường, và duyệt `gia-han` bằng `tra-loi` là đủ để hạn được kéo dài (judgment).
- AC-15: Given một kho có worktree liên kết và `GIT_DIR` trỏ vào gitdir của worktree đó (đúng môi trường git dựng cho hook pre-push), When vòng lệnh thật của `.githooks/pre-push` chạy tới `test:dieu-phoi` và checker `node-test` chạy lượt tham chiếu trên mọi tệp test, Then kho mà `GIT_DIR` trỏ tới không đổi: `core.bare` giữ `false`, không có commit, nhánh hay worktree mới; lượt tham chiếu vẫn chạy đủ ca (số ca > 0, 0 đỏ); và cùng phép đo trên bản sao đã bỏ bước gỡ biến `GIT_*` thì kho bị đổi (đối chứng: lỗ này có thật).

## Coverage

Quét bằng skill morphological-scan (preset test-matrix + risk-premortem). Chân sản phẩm:
`[SUY-TỪ-REPO: _acceptance/dieu-phoi-hai-tang/review-findings.md]`, `[SUY-TỪ-REPO: scripts/dieu-phoi/README.md]`.
Chân ngành: khoá có hạn thuê theo `[NGÀNH: Kubernetes coordination.k8s.io Lease — holderIdentity, renewTime, leaseDurationSeconds]`
và `[NGÀNH: etcd lease KeepAlive]` (người giữ chủ động gia hạn trong lúc làm việc dài → lệnh bọc);
kiểm cấu hình đóng theo `[NGÀNH: JSON Schema additionalProperties: false]`.

- Trục lỗ hổng: nhận diện S4 (AC-1, AC-2) | hình dạng cấu hình (AC-3, AC-4, AC-5, AC-6) | cổng test (AC-7, AC-8, AC-15) | nhịp khi chờ nền (AC-9, AC-10) | gia hạn theo yêu cầu (AC-11, AC-12) | ranh giới và tài liệu (AC-13, AC-14)  [thước CE: năm mục owner chọn ở dòng `d-20261007T002515Z-16`, mỗi mục ≥ 1 AC]
- Trục chiều đo: xanh-đúng (mọi AC) | đỏ-có-tên (AC-1, AC-3, AC-4, AC-5, AC-8, AC-10, AC-11, AC-12) | chiều im — không chặn oan, không đổi hành vi cũ (AC-2, AC-6, AC-10, AC-13) | vòng ghi → đọc ở nhịp thật (AC-5, AC-9, AC-11, AC-12)  [thước CE: khuôn MEASURE-BIRTH + bộ đột biến mẫu của vòng trước]
- Trục đường vào của S4 workflow: `scriptPath` tên gốc | tên bản chép | tên lạ có meta | `name` | `script` nội tuyến | chỉ `resumeFromRunId` (Never — không có danh tính để đọc)  [thước CE: tham số của công cụ Workflow — `scriptPath`, `script`, `name`, `resumeFromRunId`]
- Trục người duyệt gia hạn: máy (AC-11) | giám sát (AC-12) | owner trực tiếp — đi qua giám sát, không đường riêng  [thước CE: README mục «Trong đợt»]
- [GIẢ ĐỊNH] Trong lúc S4 Workflow chạy, lời gọi công cụ của các agent con kích hoạt hook PostToolUse với `cwd` trong worktree của phiên, nên khoá `s4` không cần lệnh bọc cho chính Workflow. Vòng này KHÔNG đo giả định này; nếu sai, khoá `s4` vẫn có thể bị thu giữa một lượt S4 dài hơn hạn thuê 90′ — người gạch tại Cổng 1.

- Trục môi trường chạy cổng (thêm khi mở lại hợp đồng 07/10): dòng lệnh thường | hook pre-push với `GIT_DIR` của worktree liên kết (AC-15) | hook với `GIT_DIR` của kho thường (cùng AC-15, cùng bước gỡ biến) | CI (AC-7)  [thước CE: sự cố core.bare 09:25 ngày 07/10, tái hiện trên kho nháp]

## Out of scope

- Hạn chế đã ghi Known limits ở vòng trước: chuẩn hoá `realpath` cho `day.worktree` (Ngoài-2), tập loại khai ở ba chỗ (Ngoài-4), các ô đo mỏng Ngoài-8/10 — chỉ thêm ca nếu vòng này cần, không hứa sửa.
- Đổi luật duyệt của máy cho `gia-han` theo spec («tối đa bằng ước tính ban đầu»): giữ luật trần `s4_tran_gom_phut` đã ký ở AC-9 cũ, chỉ thêm điều kiện phải giữ khoá.
- Trần tổng cho một khoá được giữ nhịp mãi (lệnh bọc treo giữ khoá vô hạn): việc của giám sát qua bảng; `repin-lane` có trần riêng.
- Nhận diện S4 khi Workflow chỉ được gọi bằng `resumeFromRunId`.
- Đo giả định hook PostToolUse chạy cho agent con của Workflow (xem Coverage).
- Đưa `test:dieu-phoi` vào `bun run test` (khai lý do trong `gate-shape.json`).
- Mở đợt sau-14-10, hàng merge 1b, mọi đổi engine kit.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Đường đo

Bỏ — hồ sơ không có `opportunity.md` (vòng nối tiếp từ Cổng 2, không đi từ Cổng Đáng); entry `descope` «bỏ đường-đo — …».

## Notes

- Nhánh xếp chồng trên PR #288: PR của vòng nhắm `onehub`, chỉ gộp sau #288; trước đó diff của PR còn chứa phần của #288.
- Test chạy bằng `node --test` (Node ≥ 22); CI dùng Node 24.
- Hạn chế đã biết, owner chọn ở Cổng 2 lượt 2 (sổ quyết định, dòng descope gate2):
  - Ngoài-3: yêu cầu `gia-han` viết trước `cap_luc` của lượt hiện tại mà được duyệt thì bị bỏ qua không có sự kiện nào; `tra-loi` vẫn ghi `duyet`.
  - Ngoài-4: test kiểm hình dạng dựng tay bản cấu hình sau `moDot` thay vì đọc tệp do `moDot` ghi ra; `moDot` ghi thêm khoá mới thì đợt thật hỏng mà test vẫn xanh.
  - Ngoài-5: `cli.test.mjs` chỉ xem hook thoát 2 trong đợt, không ghim thông điệp, nên không phân biệt chặn đúng lý do với lỗi nội bộ.
- Mở lại hợp đồng sau chữ ký Cổng 2 lượt 2 (sổ quyết định d-20261007T023802Z-19): lần đẩy đầu của nhánh lộ ra test điều phối chạy trong hook pre-push bật `core.bare=true` ở `.git/config` chung; thêm AC-15, sửa trong vòng này.
- Mở hợp đồng mới (sổ quyết định, dòng revisit gate2): Ngoài-1 tệp `tra-loi` gia hạn hỏng làm đứng cả nhịp; Ngoài-2 lệnh bọc gợi ý hỏng khi lệnh gốc có biến môi trường đứng trước.
