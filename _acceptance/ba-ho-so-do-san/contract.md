---
schema_version: 1
feature: "Hồ sơ đã ký không còn đỏ sẵn trên onehub: mỗi thước chết được sửa hoặc ghi lại có lý do"
slug: ba-ho-so-do-san
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [tooling]
status: approved
veto_state: mo
veto_opened_at: 2026-10-14T04:04:52Z
design_doc: docs/superpowers/specs/2026-10-13-ba-ho-so-do-san-design.md
approved_by: Phan Le Manh
approved_at: 2026-10-14T04:39:44Z
---

# Acceptance Contract: ba-ho-so-do-san

## Context

Hàng F24 của `docs/plan/lo-trinh-okr.json` (đợt r2, dãy P7). Gốc: ba hồ sơ đỏ sẵn báo ở P8-4 (09/10), nới thêm các
hồ sơ có thước chết. Quét ở mốc nền `3a2783409894908bc8dd1ee3893b88f990d1aebe` bằng `phanLoaiMucPaths` của kit
2.28.0 ra 17 hồ sơ đã ký có mục `paths` chết hoặc khai sai dạng; cộng ba hồ sơ P8-4, trùng một → 19 hồ sơ. Ngày 13/10 chủ kho thu phạm vi có tên (lối A, P7-10): lượt ghim lại
19 hồ sơ lộ 28 eval đỏ sẵn ngoài thước paths ở 7 hồ sơ; năm hồ sơ (`danh-sach-keo-chung`, `kara-gop-y-luot-2`,
`to-chuc-danh-sach-chi-tiet`, `toan-canh-okr`, `tong-quan-va-khung-noi-tieng-viet`) hoàn lại nguyên về bản onehub và
chuyển sang F28 ở mục `hoan_lai` của danh sách. Danh sách đóng `_acceptance/ba-ho-so-do-san/danh-sach.json` còn
**14 hồ sơ**; sau làn ghim B (P7-13, 13/10) thêm `tro-ly-okr-nen` hoàn lại (5 eval đỏ sẵn) → **13 hồ sơ**; sau S4 round 1 (P7-15, 14/10) bỏ AC-6, `do-man-tren-kho-rieng` sang `hoan_lai` (thước theo nhánh) → **12 hồ sơ**. Số đo và nguyên nhân từng ca ở design doc.

«Đỏ sẵn» trong hợp đồng này nghĩa là một trong hai: (1) một mục `paths` của hồ sơ đã ký mà bộ lọc của kit từ chối
với mã `paths-khong-tro-toi-tep` hay `dang-khai-la`; (2) một eval máy của hồ sơ đã ký không đạt kỳ vọng ở cây không
có lỗi sản phẩm. «Mốc nền» luôn là sha cố định trên, không phải `merge-base` hay `HEAD`.

## Criteria

- AC-1: Given cây git ở HEAD của nhánh và 12 hồ sơ trong danh sách đóng, When chạy `phanLoaiMucPaths` của kit (bản do `resolve-plugin.mjs` trả, không chép tay) trên mọi mục `paths` của mọi eval của từng hồ sơ, Then không mục nào trả `paths-khong-tro-toi-tep` hay `dang-khai-la`; khi một bản sao `evals.yaml` của một hồ sơ trong danh sách được cấy một mục trỏ tệp không có, cùng lệnh đỏ với thông điệp gọi đúng `<hồ sơ>:<eval>:<mục>`; và với mỗi hồ sơ, bộ lọc hoá cũ của kit (`staleByPaths`) ở HEAD không tắt vì một lý do mà mốc nền không có — bỏ `paths` của một eval máy đang chạy thì đỏ `BO_LOC_TAT_MOI`.
- AC-2: Given mốc nền, When dựng lại tập đỏ sẵn ở mốc nền (cây `git ls-tree` và `evals.yaml` của mốc nền, cùng hàm của kit, cộng ba ca P8-4 và năm ca đỏ sẵn lộ ở lượt ghim lại 13/10 — `khoa-con-bat-xa-tran` E3, E6, `lenh-dung-do-khong-ai-thay` E2, E3, E8 — khai cứng có tên eval), Then tập (hồ sơ, eval, mục) đó, trừ các hồ sơ ở mục `hoan_lai`, BẰNG đúng tập dòng của `danh-sach.json`, và mỗi hồ sơ ở `hoan_lai` khai đúng tập mục chết của nó cùng các eval đỏ đã đo — thiếu một dòng hay thừa một dòng thì đỏ gọi tên dòng lệch; mỗi dòng có đúng một `xu_ly` ∈ {`tro-duong-moi`, `bo-paths`, `khai-not-run`, `sua-rang`, `tu-het`}.
- AC-3: Given diff từ mốc nền tới HEAD dưới `_acceptance/` trừ thư mục của chính hồ sơ này và `_acceptance/config.yaml`, When đối chiếu với `danh-sach.json`, Then mọi tệp đổi thuộc một hồ sơ có trong danh sách, và tệp của hồ sơ ở `hoan_lai` không đổi ròng qua các commit của vòng; mọi eval đổi `status`, `cmd`, `expected` hay gỡ/sửa `paths` đều có dòng danh sách cho chính (hồ sơ, eval) đó với `xu_ly` khớp loại thay đổi; mọi dòng `khai-not-run` và `sua-rang` mang `ly_do` không rỗng và `can_cu` trỏ một sha có trong lịch sử kho hoặc một `tệp:dòng` có thật ở HEAD. Một eval đổi sang `not-run` mà không có dòng → đỏ gọi tên `<hồ sơ>:<eval>`. Thêm: `bo-paths` chỉ dùng cho eval `not-run`; hồ sơ chỉ có dòng `tu-het` không có tệp nào đổi; tệp đổi ngoài `evals.yaml`/`run-log.jsonl`/`evidence-report.md` có dòng `sua-rang` nêu đúng tệp; mọi khoá có ở mốc nền trong `_acceptance/config.yaml` giữ nguyên giá trị.
- AC-4: Given mọi hồ sơ trong danh sách có ít nhất một dòng khác `tu-het`, When ghim lại bằng một lượt `repin-lane.mjs --write` sau mốc nền, Then mỗi hồ sơ ấy có dòng `kind: repin` mới hơn mốc nền trong `run-log.jsonl` với mọi phần tử `suites_exit` bằng 0 và mọi mã trong `evals_exit` đạt kỳ vọng, `verified_commit` của `evidence-report.md` bằng `sha` của dòng ấy, commit cuối chạm hồ sơ (trừ `run-log.jsonl`, `evidence-report.md`) là tổ tiên của sha ấy, và `recheck-evidence.cjs` trên hồ sơ không in VIOLATION — kể cả E4 của `khoa-con-bat-xa-tran` và E5 của `lenh-dung-do-khong-ai-thay` theo cách xử lý đã chọn.
- AC-5: (judgment) Given `danh-sach.json` và `bang-truoc-sau.md` (máy sinh: mỗi eval đổi, dòng trước/sau, lý do, căn cứ), When hội đồng đọc từng dòng `khai-not-run` và `sua-rang`, Then mỗi lý do thuộc một trong ba loại — vật mà ô đo đã gỡ khỏi sản phẩm, tiền đề của ô bị một quyết định đã ký sau lật, lỗi của chính răng — và không dòng nào hạ một ô đang đỏ vì sản phẩm hỏng thật; mọi dòng `sua-rang` giữ được chiều đỏ của răng.
- AC-7: Given kiểm chéo đêm đã gọi tên hồ sơ có eval đỏ, When đọc `danh-sach.json`, Then mục `ngoai_vong` liệt mọi hồ sơ mà tệp kiểm chéo mới nhất (`.acceptance-runs/kiem-cheo/<ngày>.json`, ngày ghi trong mục) gọi tên mà không có trong danh sách đóng, mỗi hồ sơ kèm danh sách eval và loại (`do-san`/`do-moi`/`khong-chay-duoc`), và mục mang mã yêu cầu `hang-moi` đã gửi giám sát — tập đỏ ngoài vòng không bị bỏ im.
- AC-8: Given mỗi dòng `sua-rang` khai một đột biến có tên, When hàm kiểm của răng (một hàm dùng chung giữa răng và phép đo, không chép) chạy trên nội dung thật ở HEAD và trên bản sao đã áp đột biến, Then nội dung thật đạt và bản sao không đạt với đúng thông điệp ghim — với `ld_ba_noi_deu_chay` (điều 2 về `ci.yml` đã bỏ theo quyết định P7-7 của chủ kho), gỡ `build` khỏi danh sách task của `.githooks/pre-push` thì răng bắt.

## Coverage

Quét bằng skill `morphological-scan` (preset test-matrix), 13/10.

- Ngữ cảnh: chân sản phẩm `[SUY-TỪ-REPO: _acceptance/config.yaml]`, `[SUY-TỪ-REPO: CLAUDE.md]` (luật 47, mục «Bốn cổng») · chân ngành `[NGÀNH: pytest xfail(reason=…, strict=True)]` — một ca được miễn phải mang lý do, và lý do hết thì ca đỏ lại.
- Trục A · nguồn đỏ: tệp đã xoá/dời · tệp chưa từng có (gõ sai) · khai sai dạng · tiền đề bị luật sau lật · lời hứa bị hồ sơ đã ký sau phá · lỗi của răng · tự hết đỏ `[thước CE: quét kit trên 223 hồ sơ ở mốc nền + P8-4 + kiểm chéo 11–13/10]`
- Trục B · loại ô: máy đang chạy · máy đã `not-run` · ui-check/judgment hiệu lực · ui-check/judgment `not-run` `[thước CE: bốn executor của kit × hai trạng thái]`
- Trục C · xử lý: `tro-duong-moi` · `bo-paths` · `khai-not-run` · `sua-rang` · `tu-het` `[thước CE: mọi ô của A×B có ít nhất một xử lý hợp lệ; bảng ở design doc]`
- Trục D · lớp đo của vòng: tĩnh (AC-1) · khai (AC-2, AC-3, AC-7) · hành vi (AC-4, AC-8; AC-6 bỏ 14/10) · phán xét (AC-5)
- Core: A×B×C trên 12 hồ sơ trong danh sách đóng (19 trước khi thu phạm vi 13/10). Later: các hồ sơ kiểm chéo gọi tên ngoài danh sách (AC-7 ghi lại, hàng mới). Never: khai bổ sung `paths` cho ô thiếu khai (35 hồ sơ) — thiếu khai không phải thước chết, bộ lọc giữ luật cũ an toàn.
- Đã gạch ở Cổng Phạm vi (chủ kho, 13/10, P7-1): tập «đỏ sẵn» của vòng chỉ gồm hai loại ở mục Context (paths chết · eval P8-4); eval đỏ mà kiểm chéo mới thấy ra hàng mới.

## Đường đo

`opportunity.md` không khai ngưỡng (các ô ngưỡng còn «…»). Đường đo của câu giao là AC-1 (đếm mục chết = 0) và AC-4
(ghim lại xanh trên mọi hồ sơ bị chạm); không có ngưỡng UAT nên vòng không mở phiên nghiệm thu.

## Out of scope

- Bảy hồ sơ ở `hoan_lai` (gồm `do-man-tren-kho-rieng`, AC-6 bỏ 14/10) (thu phạm vi 13/10, lối A và P7-13): mục paths chết và 28 eval đỏ sẵn đã đo của chúng làm ở F28.

- Hồ sơ kiểm chéo gọi tên có eval đỏ mà ngoài danh sách đóng — ghi ở `ngoai_vong` (AC-7), làm ở hàng mới.
- Khai bổ sung `paths` cho ô không khai (`eval-may-thieu-paths`, `eval-ngoai-may-thieu-paths`, 35 hồ sơ ở mốc nền).
- Sửa kit để một mục `paths` chết không tắt bộ lọc của cả hồ sơ — việc của kit (`~/dev/acceptance-gate-kit`), không vá ở đây.
- Sửa mã sản phẩm để một eval xanh lại — trừ khi chủ kho chọn lối (a) ở Hỏi-2.

## Notes

- Hỏi-1, Hỏi-2, Hỏi-3: xem design doc mục «Câu hỏi cho người» và sổ quyết định (Hỏi-3 sinh từ gap-probe P0).
