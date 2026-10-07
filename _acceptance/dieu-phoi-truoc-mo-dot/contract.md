---
schema_version: 1
feature: Bộ điều phối — ba lỗ còn lại trước khi mở đợt sau-14-10 (tệp trả lời gia hạn hỏng không làm đứng nhịp, lệnh bọc chạy được với lệnh có biến môi trường, pre-push luôn chạy cổng của chính cây đang đẩy)
slug: dieu-phoi-truoc-mo-dot
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [cli, config, ci]
status: implemented
design_doc: docs/superpowers/specs/2026-10-07-dieu-phoi-truoc-mo-dot-design.md
approved_by: Phan Le Manh
approved_at: 2026-10-07
---

# Acceptance Contract: dieu-phoi-truoc-mo-dot

## Context

Cổng 2 lượt 3 của `dieu-phoi-va-bien` (ký 07/10) để lại hai lỗi owner chọn «mở hợp đồng mới» (Ngoài-4, Ngoài-5,
sổ `d-20261007T031925Z-21`), và lần đẩy PR #291 lộ thêm một lỗ của cổng đẩy mã. Cả ba chạm đúng đợt sắp mở:
giám sát sẽ gõ tay tệp trả lời, thợ sẽ chạy lệnh có `TZ=…`, và mọi thợ đẩy từ worktree.

Source input: prompt của owner 07/10 + `_acceptance/dieu-phoi-va-bien/review-findings.md` lượt 3 + bộ nhớ
`dieu-phoi-va-bien-pr291`. Nhánh rẽ từ `origin/onehub` @ `dc7b4f62`.

Thuật ngữ (thêm vào thuật ngữ của hai vòng trước):
- **tệp trả lời** = `tra-loi/<id>.json` trong thư mục đợt.
- **dòng lệnh bọc** = dòng hook chặn S4 in sau `phải chạy qua giu-nhip: `.
- **hook của cây** = `<gốc cây đang đẩy>/.githooks/pre-push`.

## Criteria

- AC-1: Given một đợt có khoá `s4` của P1 với yêu cầu `gia-han` đang chờ, tệp trả lời của yêu cầu đó là JSON hỏng cú pháp, cùng lúc một đơn `duong-nen` lành của P2 chờ cấp và một khoá `merge` đã hết hạn với nhịp cũ, When một nhịp chạy, Then nhịp không ném: tệp trả lời hỏng chuyển vào `tra-loi/hong/` với đúng tên cũ, có đúng một sự kiện `tra-loi-hong` `can_phan: true` nêu tên tệp và lý do; trong cùng nhịp `duong-nen` được cấp cho P2, khoá `merge` bị thu hồi, `trang-thai.json` và `bang.html` được ghi; hạn thuê của P1 không đổi.
- AC-2: Given tệp trả lời là JSON đúng cú pháp nhưng sai hình dạng ở từng ô của ma trận năm phần tử — không phải object; `ket_qua` thiếu; `ket_qua` không phải chuỗi; `uoc_phut` không phải số; một khoá lạ — When nhịp đọc nó, Then hành vi như AC-1 và `ly_do` của sự kiện bắt đầu `tra-loi/<id>.json: ` nêu đúng trường; còn tệp trả lời đúng hình dạng thì vẫn được đọc như trước (đối chứng): mọi tệp trả lời do chính bộ phát lịch ghi ra (gia hạn máy duyệt, việc phụ gộp, chạm tệp duyệt) qua bộ kiểm, và tệp giám sát ghi có `uoc_phut` vẫn áp gia hạn.
- AC-3: Given một tệp trả lời hỏng đã bị cách ly, When giám sát ghi lại tệp trả lời đúng hình dạng `ket_qua: duyet`, Then nhịp kế kéo dài hạn thuê đúng một lần, và các nhịp sau không sinh thêm sự kiện `tra-loi-hong` nào.
- AC-4: Given P1 giữ khoá `s4` và hook chặn S4 nhận Bash nền chưa bọc ở từng dạng của ma trận bảy phần tử — lệnh trần; tiền tố biến môi trường (`TZ=UTC …`); `cd … && …`; đối số trong nháy đơn có khoảng trắng; biến `"$X"`; ống `| cat`; đối số `--slug=a` — When chạy dòng lệnh bọc mà hook in, bằng `bash`, trong cùng thư mục và môi trường, Then với mọi dạng, stdout và mã thoát trùng khớp với chạy lệnh gốc bằng `bash -c`; và hook nhận chính dòng lệnh bọc đó (chạy nền) là đã bọc, thoát 0.
- AC-5: Given một kho có worktree liên kết mà `core.hooksPath` của worktree trỏ `.githooks` của checkout chính, When `git push` từ worktree, Then pre-push của checkout chính chuyển sang hook của cây đang đẩy (hook của worktree chạy, vòng lệnh của checkout chính không chạy) và lần đẩy mang mã thoát của hook của cây; When `git push` từ chính checkout chính, Then hook chạy vòng lệnh của nó một lần, không chuyển, không lặp; When worktree mang chính bản pre-push này, Then bản của worktree chạy vòng lệnh đúng một lượt, không chuyển tiếp lần nữa; hook của cây nhận nguyên tên remote và dòng ref trên stdin; When cây đang đẩy không có `.githooks/pre-push`, Then hook đang chạy tiếp tục như cũ.
- AC-6: Given cây sau vòng, When chạy lại các phép đo cũ, Then `bun run test:dieu-phoi` xanh; bộ đột biến của `dieu-phoi-hai-tang` và `dieu-phoi-va-bien` xanh; răng ranh giới mã, `git-sach` và `cong` của `dieu-phoi-va-bien` xanh.
- AC-7: Given `scripts/dieu-phoi/README.md`, When phiên giám sát đọc mục «Trong đợt», Then biết tệp trả lời hỏng (cú pháp hay hình dạng) bị chuyển vào `tra-loi/hong/` kèm sự kiện `tra-loi-hong`, yêu cầu đó coi như chưa trả lời, và cách sửa là ghi lại tệp trả lời (judgment); và danh sách khoá hợp lệ của tệp trả lời in trong README bằng đúng tập khoá bộ kiểm dùng.

## Coverage

Quét bằng skill morphological-scan (preset test-matrix). Chân sản phẩm: `[SUY-TỪ-REPO: _acceptance/dieu-phoi-va-bien/review-findings.md]`, `[SUY-TỪ-REPO: scripts/dieu-phoi/README.md]`. Chân ngành: `[NGÀNH: POSIX sh — gán biến tiền tố chỉ có nghĩa khi qua shell]`, `[NGÀNH: git-scm githooks — core.hooksPath dùng chung giữa các worktree]`.

- Trục lỗ: tệp trả lời hỏng (AC-1, AC-2, AC-3) | dòng lệnh bọc (AC-4) | hook của cây (AC-5) | không hồi quy (AC-6) | tài liệu (AC-7)  [thước CE: ba mục tồn đọng trong bộ nhớ `dieu-phoi-va-bien-pr291`]
- Trục kiểu hỏng của tệp trả lời: cú pháp (AC-1) | không phải object · thiếu khoá · sai kiểu · khoá lạ (AC-2) | hỏng rồi sửa (AC-3)  [thước CE: luật kiểm của `kiemDon`/`kiemYeuCau` vòng trước]
- Trục dạng lệnh: bảy dạng của AC-4  [thước CE: ngữ pháp lệnh đơn POSIX — tiền tố gán, toán tử danh sách, ống, nháy, mở rộng biến]
- Trục nơi đẩy: từ worktree | từ checkout chính | cây không có hook (AC-5)  [thước CE: sự cố đẩy #291 ngày 07/10]
- [GIẢ ĐỊNH] Máy chạy hook có `realpath` (macOS ≥ 13, Linux coreutils). Không đo trên máy thiếu nó.

## Out of scope

- Ba ô đo mỏng ghi Known limits ở hai vòng trước (giữ nguyên là hạn chế).
- Đổi `core.hooksPath` của từng worktree, hay đổi cách app tạo worktree.
- Kiểm hình dạng tệp trả lời ở những chỗ chỉ xét tệp có tồn tại (`xuLyYeuCau`, hook chờ người) — chúng không đọc nội dung.
- Mở đợt sau-14-10.

## Đường đo

Bỏ — không có `opportunity.md` (hợp đồng nối tiếp từ Cổng 2); entry `descope` «bỏ đường-đo — …».

## Notes

- Bản chuyển hook (AC-5) chỉ có hiệu lực ở worktree khi checkout chính đã có bản pre-push này.
