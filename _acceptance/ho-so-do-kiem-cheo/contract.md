---
schema_version: 1
feature: "Các hồ sơ đã ký mà kiểm chéo gọi tên đỏ được đo lại, mỗi thước hỏng được sửa hoặc ghi lại có lý do"
slug: ho-so-do-kiem-cheo
owner: omre.cnsp4@onemount.com
risk_tier: T2
surfaces: [tooling]
status: implemented
design_doc: docs/superpowers/specs/2026-10-22-ho-so-do-kiem-cheo-design.md
approved_by: Manh Phan
approved_at: 2026-10-25T01:44:41Z
---

# Acceptance Contract: ho-so-do-kiem-cheo

## Context

Hàng F28 của `docs/plan/lo-trinh-okr.json` (đợt lo-trinh-tin-hieu, dãy F1). Tập đầu vào khép: 15 hồ sơ kiểm chéo đêm
11–13/10 gọi tên (mục `ngoai_vong` của `_acceptance/ba-ho-so-do-san/danh-sach.json`), 7 hồ sơ F24 hoàn lại cho F28 (mục
`hoan_lai` của cùng tệp), `so-okr-tu-chay` (bản vá F8 `_acceptance/neo-thuoc-het-han/vao-f28-so-okr-tu-chay.patch`), và
5 hồ sơ có `evals.yaml` không đọc được bằng bộ đọc YAML chuẩn (một trùng) — **27 hồ sơ**.

**Mốc nền** là sha cố định `6be0bb688900ecd8843989bd8f8b3095548b604f` (onehub sau #512), không phải `merge-base` hay
`HEAD`. Lượt đo ở mốc nền (`do-lai-nen.json`, sinh bằng `rang/do-lai.mjs`) chạy mọi eval máy không tự khai `not-run`
của từng hồ sơ: 345 eval, 73 đỏ trên 22 hồ sơ. Nguyên nhân từng ô và cách xử lý ở design doc.

«Đỏ» trong hợp đồng này nghĩa là một eval máy của hồ sơ đã ký trả mã khác mã kỳ vọng ở mốc nền. Bảy cách xử lý:
`neo-co-dinh` · `sua-rang` · `khai-not-run` · `tro-duong-moi` · `tu-het` · `sua-cu-phap` (chỉ cú pháp YAML) ·
`san-pham-hong` (lỗi thật của sản phẩm — không sửa răng, không hạ ô).

## Criteria

- AC-1: Given tập đầu vào suy từ nguồn (mục `ngoai_vong` và `hoan_lai` hàng F28 của `_acceptance/ba-ho-so-do-san/danh-sach.json`, `so-okr-tu-chay`, và mọi hồ sơ có `evals.yaml` không đọc được bằng `yaml` chuẩn ở mốc nền), `do-lai-nen.json` và `danh-sach.json`, When đối chiếu, Then `do-lai-nen.json` mang đúng mốc nền và phủ đủ mọi (hồ sơ, eval máy không not-run) của tập đầu vào ở mốc nền; tập (hồ sơ, eval) đỏ trong nó BẰNG đúng hợp các dòng `dong` và các eval khai trong mục `hoan_lai`; mỗi dòng có đúng một `xu_ly` trong bảy giá trị; mỗi hồ sơ YAML hỏng có đúng một dòng `sua-cu-phap`; thiếu hay thừa thì đỏ gọi tên `<hồ sơ>:<eval>`; số trong dòng tổng bằng số ở Context.
- AC-2: Given diff từ mốc nền tới HEAD dưới `_acceptance/` trừ thư mục của chính hồ sơ này, và các dòng `_acceptance/config.yaml` vòng đổi, When đối chiếu với `danh-sach.json`, Then mọi tệp đổi thuộc một hồ sơ có dòng trong danh sách; hồ sơ ở `hoan_lai` không đổi ròng; `contract.md` của mọi hồ sơ khác không đổi (không đổi lời AC); mọi eval đổi `status`, `cmd`, `expected` hay `paths` có dòng cho chính (hồ sơ, eval) đó với `xu_ly` khớp loại đổi; mọi tệp đổi ngoài `evals.yaml`/`run-log.jsonl`/`evidence-report.md` được một dòng `sua-rang`/`neo-co-dinh` nêu đúng tệp; mọi dòng `khai-not-run`, `sua-rang`, `neo-co-dinh` có `ly_do` không rỗng và `can_cu` trỏ một sha có trong lịch sử hoặc `tệp:dòng` có thật ở HEAD; dòng config vòng đổi chỉ là lệnh của chính hồ sơ có dòng; và không tệp nào ngoài `_acceptance/**` và `docs/**` đổi.
- AC-4: Given mọi hồ sơ có ít nhất một dòng khác `tu-het` và `san-pham-hong`, When ghim lại bằng lượt `repin-lane.mjs --write` sau mốc nền, Then mỗi hồ sơ ấy có dòng `kind: repin` mới hơn mốc nền với mọi `suites_exit` bằng 0 và mọi mã trong `evals_exit` đạt kỳ vọng, `verified_commit` bằng `sha` của dòng ấy, commit cuối chạm hồ sơ (trừ `run-log.jsonl`, `evidence-report.md`) là tổ tiên của sha ấy, và `recheck-evidence.cjs` không in VIOLATION.
- AC-5: Given mọi hồ sơ có dòng `sua-cu-phap`, When đọc `evals.yaml` ở HEAD bằng `yaml` chuẩn và bằng `parseEvals` + `expectedExits` của kit, Then không lỗi cú pháp nào, và bản ghi của kit (id, executor, cmd, status, criterion, expected, paths, mã kỳ vọng) ở HEAD bằng đúng bản ghi ở mốc nền — sửa cú pháp không đổi nghĩa; cấy lại lỗi cú pháp cũ vào bản sao thì bộ đọc chuẩn đỏ gọi tên tệp và dòng.
- AC-6: (judgment) Given `danh-sach.json` và `bang-truoc-sau.md` (máy sinh từ danh sách, diff và `do-lai-nen.json` — mỗi dòng xử lý kể cả `san-pham-hong`: đuôi đầu ra đỏ ở mốc nền, nguyên văn câu căn cứ đọc ở `tệp:dòng` hay thông điệp commit của sha, eval trước/sau, đầu ra đột biến; lớp khai sinh lại bảng và so từng byte), When hội đồng đọc từng dòng `khai-not-run`, `sua-rang`, `neo-co-dinh` và `san-pham-hong`, Then mỗi lý do thuộc một trong bốn loại — vật đổi có chủ đích theo một hồ sơ đã ký sau (căn cứ trích được), «vòng này» tính theo nhánh trôi, lỗi của chính răng, ô cần thứ máy đo không bao giờ có — và không dòng nào hạ một ô đang đỏ vì sản phẩm hỏng thật; mỗi dòng `san-pham-hong` nói đúng chỗ hỏng của sản phẩm.
- AC-7: Given các dòng `san-pham-hong`, When đọc mục `hoan_lai` và cửa tín hiệu của kho, Then mỗi hồ sơ có dòng ấy nằm ở `hoan_lai` với danh sách eval đỏ, mã yêu cầu tín hiệu đã gửi qua lõi đợt kèm tiêu đề gọi tên hồ sơ và eval và nội dung nêu tệp sản phẩm hỏng, và phần sửa răng đã tra cho các ô khác của hồ sơ đó — để hàng sửa sản phẩm mang theo, không tra lại. Hồ sơ chủ kho giao cho làn riêng nằm ở `hoan_lai` với dấu `giao_lan_rieng` trỏ một dòng quyết định có người quyết trong sổ và một lý do, không mang lỗi sản phẩm, và mọi eval đỏ của nó ở mốc nền có phần sửa răng ghi sẵn.

## Coverage

Quét bằng skill `morphological-scan` (preset test-matrix), 22/10.

- Ngữ cảnh: chân sản phẩm `[SUY-TỪ-REPO: _acceptance/config.yaml]`, `[SUY-TỪ-REPO: docs/plan/dot-lo-trinh-tin-hieu/LUAT-rieng.md]` (luật 23) · chân ngành `[NGÀNH: pytest xfail(reason=…, strict=True)]` — ca được miễn phải mang lý do, lý do hết thì ca đỏ lại; `[NGÀNH: Google Testing Blog «Flaky Tests at Google» — cách ly ca chập chờn kèm chủ và hạn]`.
- Trục A · gốc đỏ: vòng này theo nhánh trôi · vật đổi có chủ đích theo hồ sơ ký sau · lỗi của răng · cần thứ máy đo không có · tiền đề chạy chưa có · cú pháp YAML · sản phẩm hỏng thật `[thước CE: 73 eval đỏ ở mốc nền đã tra từng ô — design doc]`
- Trục B · loại ô: eval máy đang chạy · eval máy đã `not-run` · ui-check/judgment `[thước CE: bốn executor của kit × hai trạng thái]` — vòng chỉ đo eval máy; ô ngoài làn máy là giới hạn kit đã khai.
- Trục C · xử lý: bảy giá trị ở Context `[thước CE: mọi ô của A có ít nhất một xử lý hợp lệ — bảng ở design doc]`
- Trục D · lớp đo: khai (AC-1, AC-2, AC-7) · chiều đỏ (thu phạm vi 24/10 — xem Known limits) · hành vi (AC-4, AC-5) · phán xét (AC-6)
- Core: A×C trên 21 hồ sơ có eval đỏ hoặc YAML hỏng (trừ 3 hoàn lại). Later: sửa sản phẩm cho 4 lỗi thật (hàng mới qua tín hiệu, AC-7). Never: rà mọi hồ sơ đã ký ngoài tập đầu vào — kiểm chéo đêm không chạy trên máy này từ 13/10, tập ngoài vòng không khép (`vo-khu-muc-tieu` ghi 42 hồ sơ đo đường cũ).

## Đường đo

`opportunity.md` không khai ngưỡng (các ô ngưỡng còn «…»). Đường đo của câu giao là AC-1 (mỗi ô đỏ có một xử lý) và AC-4
(ghim lại xanh trên mọi hồ sơ bị chạm); không có ngưỡng UAT nên vòng không mở phiên nghiệm thu.

## Out of scope

- Sửa mã sản phẩm (`apps/**`, `packages/**`) để một eval xanh lại — trừ khi chủ kho chọn lối khác ở Hỏi-1.
- Ba hồ sơ dính lỗi sản phẩm (`bo-dung-chung-nhan-chuoi`, `cai-dat-con-lai-noi-tieng-viet`, `tong-quan-va-khung-noi-tieng-viet`) — vào `hoan_lai`, không chạm tệp (AC-7).
- Hồ sơ `to-chuc-danh-sach-chi-tiet` — chủ kho thu F28 khỏi hồ sơ này ngày 25/10 và giao cho một làn riêng: ô E20 đo «vòng này» theo nhánh trôi nên chặn cổng trước gộp sau khi onehub đi tiếp; tệp của hồ sơ trả về đúng bản onehub, phần sửa ô E21 ghi sẵn ở `sua-san/to-chuc-danh-sach-chi-tiet.patch`.
- Eval `ui-check`/`judgment` của các hồ sơ — làn máy không chạy chúng (giới hạn kit).
- Hồ sơ đã ký ngoài tập đầu vào, kể cả 42 hồ sơ `vo-khu-muc-tieu` ghi là đo đường cũ.
- Sửa kit (một mục paths chết tắt bộ lọc cả hồ sơ, `ai-elements@latest` trong răng của `nen-chat-ai-elements`) — việc của `~/dev/acceptance-gate-kit`.

## Known limits

Thu phạm vi 24/10 — chủ kho chọn lối 1 ở Cổng Bằng chứng sau lượt chấm thứ hai (sổ quyết định dòng 33–34):

- **Dựng lại lượt đo nền (vế cuối của AC-1 cũ)** không còn là tiêu chí. Lượt chạy lại `rang/do-lai.mjs` trên cây tạm ở mốc
  nền không tất định: ô `cron-theo-ban-khai` E8 gọi Vercel thật (đỏ ở lượt nền vì token hết hạn, nay xanh) và ô
  `tro-ly-okr-nen` E9 gọi mô hình AI thật (lần xanh lần đỏ). Lượt 24/10 tái lập 311 eval, lệch đúng hai ô ấy. AC-1 còn đo
  phần tất định: danh sách khớp từng ô đỏ của `do-lai-nen.json`.
- **Chiều đỏ (AC-3 cũ)** không còn là tiêu chí. Bộ chạy `rang/chieu-do.mjs` vẫn ở trong hồ sơ; lượt 24/10 bắt đúng 36/38 đột
  biến, hai ô sót là ô gọi dịch vụ thật hay chạy cả bộ test của kho dưới tải (`cron-theo-ban-khai` E7, `tro-ly-okr-nen`
  E4). Kết quả lượt S3 (38/38) ở `chieu-do-ket-qua.json` là sử liệu, không chống lưng chữ ký.

## Notes

- Hỏi-1 (lỗi sản phẩm thật), Hỏi-2 (11 ô «vòng này» neo cặp gộp), Hỏi-3 (ghim lint của `cron-theo-ban-khai` E7), Hỏi-4 (`cron-theo-ban-khai` E8 và Vercel): xem design doc mục «Câu hỏi cho người» và sổ quyết định.
- Lời AC, Known limits và mọi dòng `contract.md` của hồ sơ bị sửa giữ nguyên (luật 23); số đếm đổi theo hồ sơ ký sau ghi ở dòng danh sách và `expected` của eval, không ghi vào hợp đồng của hồ sơ ấy.
- Known limits — chọn ở Cổng Bằng chứng 2026-10-24:
  - Ngoài-1: Hội đồng nghiệm thu có thể đọc một bảng vẫn ghi kết quả kiểm tra cũ như thể mới, dù hồ sơ đã nói kết quả đó chỉ là lịch sử.
  - Ngoài-4: Bảng trước/sau đưa cho hội đồng vẫn ghi một ô kiểm tra là bắt được lỗi, trong khi lượt đo mới nhất cho thấy ô đó đã bỏ sót.
  - Ngoài-5: Câu hỏi giao cho hội đồng vẫn yêu cầu xem kết quả kiểm tra cũ, nên họ có thể dựa vào số liệu đã lỗi thời khi phán xét.
  - Ngoài-6: Bước kiểm tra danh sách hồ sơ đỏ giờ chỉ so hai tệp do người viết hồ sơ ghi, không dựng lại phép đo từ đầu.
  - Ngoài-7: Bảng so trước/sau cho người đọc có một khối «đầu ra sau khi sửa» do người dán tay, không phải máy chạy ra, dù đầu bảng nói là máy sinh.
  - Ngoài-8: Một số lệnh kiểm của hồ sơ có thể báo xanh mà thực ra không kiểm gì nếu chạy qua đường dẫn có liên kết tượng trưng, như trong cây tạm trên máy này.
  - Ngoài-9: Trong bảng so trước/sau, hai ô cron E7 và E8 không có số liệu thử phá bằng neo cố định như các ô khác, nên người duyệt chỉ thấy lời tự khai chứ không thấy kết quả máy chạy cho hai ô này.
  - Ngoài-10: Hội đồng chấm chỉ đọc bảng trước/sau, mà hai khối đầu ra trong đó do người gõ tay nên không có gì bảo đảm chúng đúng hay còn mới, dù đầu bảng ghi là máy sinh.
  - Ngoài-11: Phép thử cho hai ô neo cố định chỉ kiểm mã thoát, mà mã đó cũng có thể do lỗi khác gây ra, nên về sau nếu thứ tự trong lệnh đổi thì phép thử có thể xanh vì lý do sai.
  - Ngoài-12: Mô tả các bước kiểm của vài màn Toàn cảnh OKR và Cập nhật tuần đã cũ so với phép đo đang chạy.
  - Ngoài-13: Bảng so sánh trước/sau cho hai bài kiểm của lịch chạy theo bản khai mô tả cách sửa không còn đúng.
  - Ngoài-14: Nếu sau này ai đó sửa công cụ chặn dùng chung, phép đo màn Toàn cảnh OKR có thể không được chạy lại tự động.
  - Ngoài-17: Phần mô tả những gì các bài kiểm của đợt rà này chứng minh hơi khác với cách chúng thực sự chạy.
  - Ngoài-18: Công cụ kiểm tra xem lỗi cố tình cài có bị bắt hay không chưa tự thử hai trường hợp quan trọng của chính nó.
  - Ngoài-19: Công cụ phát hiện thay đổi không có nhãn chưa tự thử khâu tìm thay đổi đó.
  - Ngoài-21: Nếu chạy lại phép đo theo thứ tự khác với tài liệu, một hồ sơ có thể âm thầm bị bỏ khỏi lượt đo.
  - Ngoài-23: Với các hồ sơ có lỗi sản phẩm được giao lại cho hàng sau, phần sửa gợi ý có thể thiếu chỉ dẫn tệp nào và cách chứng minh.
  - Ngoài-24: Công cụ kiểm tra lỗi cài thử chưa tự thử đủ hai kiểu thất bại của chính nó.
  - Ngoài-25: Công cụ phát hiện thay đổi thiếu nhãn và đổi cấu hình lén chưa tự thử phần tìm kiếm thật của nó.
  - Ngoài-26: Bài kiểm từ điển cho hai mục của Trợ lý OKR so với bản từ điển cũ cố định, nên nếu hai mục đó trong từ điển hiện tại bị sửa hỏng, bài kiểm vẫn xanh.
  - Ngoài-27: Bài kiểm việc cập nhật cơ sở dữ liệu của Trợ lý OKR chỉ so hai bản cũ cố định, nên nếu cấu trúc dữ liệu hiện tại đổi theo hướng nguy hiểm, một phần bài kiểm sẽ không thấy.
  - Ngoài-28: Số cảnh báo kiểm tra mã của ứng dụng được đo trên bản lịch sử cố định, không phải bản đang làm.
  - Ngoài-29: Công cụ chỉ kiểm tín hiệu báo lỗi sản phẩm theo đúng khuôn đã ghi, chứ không đối chiếu với tín hiệu đã thật sự gửi.
  - Ngoài-30: Khi một lượt đo lại chạy quá giờ và bị ngắt cưỡng bức, nó để lại một bản sao làm việc tạm và có thể còn tiến trình chạy ngầm trong máy.
  - Ngoài-31: Mô tả các bước kiểm của vài màn Toàn cảnh OKR và Cập nhật tuần đã cũ so với phép đo đang chạy.
  - Ngoài-32: Bảng so sánh trước/sau cho hai bài kiểm của lịch chạy theo bản khai mô tả cách sửa không còn đúng.
  - Ngoài-33: Nếu sau này ai đó sửa công cụ chặn dùng chung, phép đo màn Toàn cảnh OKR có thể không được chạy lại tự động.
  - Ngoài-36: Phần mô tả những gì các bài kiểm của đợt rà này chứng minh hơi khác với cách chúng thực sự chạy.
  - Ngoài-37: Công cụ kiểm tra xem lỗi cố tình cài có bị bắt hay không chưa tự thử hai trường hợp quan trọng của chính nó.
  - Ngoài-38: Công cụ phát hiện thay đổi không có nhãn chưa tự thử khâu tìm thay đổi đó.
  - Ngoài-40: Nếu chạy lại phép đo theo thứ tự khác với tài liệu, một hồ sơ có thể âm thầm bị bỏ khỏi lượt đo.
  - Ngoài-42: Với các hồ sơ có lỗi sản phẩm được giao lại cho hàng sau, phần sửa gợi ý có thể thiếu chỉ dẫn tệp nào và cách chứng minh.
  - Ngoài-43: Công cụ kiểm tra lỗi cài thử chưa tự thử đủ hai kiểu thất bại của chính nó.
  - Ngoài-44: Công cụ phát hiện thay đổi thiếu nhãn và đổi cấu hình lén chưa tự thử phần tìm kiếm thật của nó.
  - Ngoài-45: Bài kiểm từ điển cho hai mục của Trợ lý OKR so với bản từ điển cũ cố định, nên nếu hai mục đó trong từ điển hiện tại bị sửa hỏng, bài kiểm vẫn xanh.
  - Ngoài-46: Bài kiểm việc cập nhật cơ sở dữ liệu của Trợ lý OKR chỉ so hai bản cũ cố định, nên nếu cấu trúc dữ liệu hiện tại đổi theo hướng nguy hiểm, một phần bài kiểm sẽ không thấy.
  - Ngoài-47: Số cảnh báo kiểm tra mã của ứng dụng được đo trên bản lịch sử cố định, không phải bản đang làm.
  - Ngoài-48: Công cụ chỉ kiểm tín hiệu báo lỗi sản phẩm theo đúng khuôn đã ghi, chứ không đối chiếu với tín hiệu đã thật sự gửi.
- Known limits — chọn ở Cổng Bằng chứng 2026-10-26:
  - Ngoài-1: Hồ sơ được chủ kho giao cho làn riêng sẽ không hiện trong bảng trước/sau mà hội đồng và người ký đọc.
  - Ngoài-2: Nếu bước kiểm hồ sơ giao làn riêng bị hỏng âm thầm, lượt chạy vẫn báo không có lỗi, nên có thể bỏ sót một hồ sơ thiếu phần sửa ghi sẵn.
  - Ngoài-3: Phần sửa ghi sẵn cho hồ sơ giao làn riêng có thể trỏ tới một bản vá không tồn tại mà bộ kiểm vẫn cho qua.
  - Ngoài-4: Hội đồng nghiệm thu có thể đọc một bảng vẫn ghi kết quả kiểm tra cũ như thể mới, dù hồ sơ đã nói kết quả đó chỉ là lịch sử.
  - Ngoài-7: Bảng trước/sau đưa cho hội đồng vẫn ghi một ô kiểm tra là bắt được lỗi, trong khi lượt đo mới nhất cho thấy ô đó đã bỏ sót.
  - Ngoài-8: Câu hỏi giao cho hội đồng vẫn yêu cầu xem kết quả kiểm tra cũ, nên họ có thể dựa vào số liệu đã lỗi thời khi phán xét.
  - Ngoài-9: Bước kiểm tra danh sách hồ sơ đỏ giờ chỉ so hai tệp do người viết hồ sơ ghi, không dựng lại phép đo từ đầu.
  - Ngoài-10: Bảng so trước/sau cho người đọc có một khối «đầu ra sau khi sửa» do người dán tay, không phải máy chạy ra, dù đầu bảng nói là máy sinh.
  - Ngoài-11: Một số lệnh kiểm của hồ sơ có thể báo xanh mà thực ra không kiểm gì nếu chạy qua đường dẫn có liên kết tượng trưng, như trong cây tạm trên máy này.
  - Ngoài-12: Trong bảng so trước/sau, hai ô cron E7 và E8 không có số liệu thử phá bằng neo cố định như các ô khác, nên người duyệt chỉ thấy lời tự khai chứ không thấy kết quả máy chạy cho hai ô này.
  - Ngoài-13: Hội đồng chấm chỉ đọc bảng trước/sau, mà hai khối đầu ra trong đó do người gõ tay nên không có gì bảo đảm chúng đúng hay còn mới, dù đầu bảng ghi là máy sinh.
  - Ngoài-14: Phép thử cho hai ô neo cố định chỉ kiểm mã thoát, mà mã đó cũng có thể do lỗi khác gây ra, nên về sau nếu thứ tự trong lệnh đổi thì phép thử có thể xanh vì lý do sai.
  - Ngoài-15: Mô tả các bước kiểm của vài màn Toàn cảnh OKR và Cập nhật tuần đã cũ so với phép đo đang chạy.
  - Ngoài-16: Bảng so sánh trước/sau cho hai bài kiểm của lịch chạy theo bản khai mô tả cách sửa không còn đúng.
  - Ngoài-17: Nếu sau này ai đó sửa công cụ chặn dùng chung, phép đo màn Toàn cảnh OKR có thể không được chạy lại tự động.
  - Ngoài-20: Phần mô tả những gì các bài kiểm của đợt rà này chứng minh hơi khác với cách chúng thực sự chạy.
  - Ngoài-21: Công cụ kiểm tra xem lỗi cố tình cài có bị bắt hay không chưa tự thử hai trường hợp quan trọng của chính nó.
  - Ngoài-22: Công cụ phát hiện thay đổi không có nhãn chưa tự thử khâu tìm thay đổi đó.
  - Ngoài-24: Nếu chạy lại phép đo theo thứ tự khác với tài liệu, một hồ sơ có thể âm thầm bị bỏ khỏi lượt đo.
  - Ngoài-26: Với các hồ sơ có lỗi sản phẩm được giao lại cho hàng sau, phần sửa gợi ý có thể thiếu chỉ dẫn tệp nào và cách chứng minh.
  - Ngoài-27: Công cụ kiểm tra lỗi cài thử chưa tự thử đủ hai kiểu thất bại của chính nó.
  - Ngoài-28: Công cụ phát hiện thay đổi thiếu nhãn và đổi cấu hình lén chưa tự thử phần tìm kiếm thật của nó.
  - Ngoài-29: Bài kiểm từ điển cho hai mục của Trợ lý OKR so với bản từ điển cũ cố định, nên nếu hai mục đó trong từ điển hiện tại bị sửa hỏng, bài kiểm vẫn xanh.
  - Ngoài-30: Bài kiểm việc cập nhật cơ sở dữ liệu của Trợ lý OKR chỉ so hai bản cũ cố định, nên nếu cấu trúc dữ liệu hiện tại đổi theo hướng nguy hiểm, một phần bài kiểm sẽ không thấy.
  - Ngoài-31: Số cảnh báo kiểm tra mã của ứng dụng được đo trên bản lịch sử cố định, không phải bản đang làm.
  - Ngoài-32: Công cụ chỉ kiểm tín hiệu báo lỗi sản phẩm theo đúng khuôn đã ghi, chứ không đối chiếu với tín hiệu đã thật sự gửi.
  - Ngoài-33: Khi một lượt đo lại chạy quá giờ và bị ngắt cưỡng bức, nó để lại một bản sao làm việc tạm và có thể còn tiến trình chạy ngầm trong máy.
  - Ngoài-34: Mô tả các bước kiểm của vài màn Toàn cảnh OKR và Cập nhật tuần đã cũ so với phép đo đang chạy.
  - Ngoài-35: Bảng so sánh trước/sau cho hai bài kiểm của lịch chạy theo bản khai mô tả cách sửa không còn đúng.
  - Ngoài-36: Nếu sau này ai đó sửa công cụ chặn dùng chung, phép đo màn Toàn cảnh OKR có thể không được chạy lại tự động.
  - Ngoài-39: Phần mô tả những gì các bài kiểm của đợt rà này chứng minh hơi khác với cách chúng thực sự chạy.
  - Ngoài-40: Công cụ kiểm tra xem lỗi cố tình cài có bị bắt hay không chưa tự thử hai trường hợp quan trọng của chính nó.
  - Ngoài-41: Công cụ phát hiện thay đổi không có nhãn chưa tự thử khâu tìm thay đổi đó.
  - Ngoài-43: Nếu chạy lại phép đo theo thứ tự khác với tài liệu, một hồ sơ có thể âm thầm bị bỏ khỏi lượt đo.
  - Ngoài-45: Với các hồ sơ có lỗi sản phẩm được giao lại cho hàng sau, phần sửa gợi ý có thể thiếu chỉ dẫn tệp nào và cách chứng minh.
  - Ngoài-46: Công cụ kiểm tra lỗi cài thử chưa tự thử đủ hai kiểu thất bại của chính nó.
  - Ngoài-47: Công cụ phát hiện thay đổi thiếu nhãn và đổi cấu hình lén chưa tự thử phần tìm kiếm thật của nó.
  - Ngoài-48: Bài kiểm từ điển cho hai mục của Trợ lý OKR so với bản từ điển cũ cố định, nên nếu hai mục đó trong từ điển hiện tại bị sửa hỏng, bài kiểm vẫn xanh.
  - Ngoài-49: Bài kiểm việc cập nhật cơ sở dữ liệu của Trợ lý OKR chỉ so hai bản cũ cố định, nên nếu cấu trúc dữ liệu hiện tại đổi theo hướng nguy hiểm, một phần bài kiểm sẽ không thấy.
  - Ngoài-50: Số cảnh báo kiểm tra mã của ứng dụng được đo trên bản lịch sử cố định, không phải bản đang làm.
  - Ngoài-51: Công cụ chỉ kiểm tín hiệu báo lỗi sản phẩm theo đúng khuôn đã ghi, chứ không đối chiếu với tín hiệu đã thật sự gửi.
