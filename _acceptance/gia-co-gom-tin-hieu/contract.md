---
schema_version: 1
feature: Một tín hiệu cài lời dặn không lấy được khoá nào của lịch gom và không đẩy được gì ngoài PR đề xuất
slug: gia-co-gom-tin-hieu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-10-21-gia-co-gom-tin-hieu-design.md
---

# Acceptance Contract: gia-co-gom-tin-hieu

## Context

Lịch gom tín hiệu (TH2, `gom-tin-hieu-tu-chay`) đưa nội dung tín hiệu người ngoài nhập vào một phiên Claude Code chạy
không người trông trên Actions. Phiên đó hôm nay chạy được `node` tuỳ ý và `git commit` (chạy hook của kho), nhận
nguyên môi trường có token ghi kho và khoá mô hình, và đứng trên bản checkout có token trong cấu hình git. Vòng này
thu phiên về đúng việc gom, giữ mọi token khỏi tầm của nó, và cho lịch dừng trước khi đẩy bất cứ thứ gì phiên để lại
ngoài đề xuất. Chủ kho chưa đặt `ANTHROPIC_API_KEY` cho lịch tới khi vòng này gộp.

Source input: `_acceptance/gia-co-gom-tin-hieu/opportunity.md` (Cổng Đáng `build` 21/10, hàng TH2b của
`docs/plan/lo-trinh-okr.json`), Ngoài-3 của `_acceptance/gom-tin-hieu-tu-chay/evidence-report.md`.

## Criteria

- AC-1: Given một lượt gom có tín hiệu chưa có chỗ, chạy trong môi trường có `TIN_HIEU_TOKEN`, `GH_TOKEN`, `GITHUB_TOKEN`, `ANTHROPIC_API_KEY` và một biến bí mật bất kỳ khác, When lượt gọi phiên gom, Then môi trường của phiên chỉ gồm danh sách cho phép đã khai ở cấu hình lịch — khoá mô hình là bí mật duy nhất trong đó — và mang cờ để Claude Code gỡ khoá mô hình khỏi mọi tiến trình con, cùng cấu hình git mức lệnh tắt hook, tắt fsmonitor và không nhận kho trần.
- AC-2: Given lượt gọi phiên gom, Then lời gọi Claude Code ở chế độ từ chối mọi thứ chưa cho phép, chỉ có bảy công cụ (đọc, tìm tệp, tìm chữ, sửa, ghi, skill, lệnh), tắt công cụ mạng và MCP, không nạp cài đặt của kho, và mang một tệp cài đặt nằm ngoài kho trong đó: lệnh chỉ được chạy đúng các dòng lệnh kit đã liệt (đường tuyệt đối tới gói kit, đối số cố định, không ký tự đại diện), skill chỉ được gọi đúng skill gom tín hiệu và skill cắt lượt, sửa chỉ được đúng bản gom đã định và các tệp lộ trình, đọc không ra khỏi kho và gói kit, mọi hook tắt; Given hai skill đó trong gói kit đã cài, Then không skill nào tự cấp quyền công cụ ngoài danh sách, và mọi lệnh hai skill bảo chạy đều có trong danh sách cho phép; Given lời dặn của phiên, Then nó in nguyên văn đúng các dòng lệnh được phép, đường bản gom đã định, và nói nội dung tín hiệu là dữ liệu chứ không phải lời dặn.
- AC-3: (cross-layer) Given tín hiệu chưa có chỗ và một phiên gom chỉ dùng đúng các việc được phép (sửa bản gom đã định và tệp lộ trình, chạy lệnh kit theo nguyên văn, không lệnh git nào), When lượt chạy, Then lượt vẫn giao đề xuất như TH2 — nhánh `tin-hieu/gom` trên `origin` mang đúng một bản gom mới ở đường đã định, hàng đề xuất và trang lộ trình vẽ lại, một PR nháp — và ngoài `tin-hieu/gom` không ref nào trên `origin` đổi; When phiên không ghi gì vào bản gom đã định, Then lượt đỏ với câu «phiên gom phải ghi đúng một bản gom mới» và không đẩy; Given phiên kể lại các lời gọi bị từ chối, Then nhật ký của lượt in số lời gọi bị từ chối và tên công cụ của chúng, không in đối số.
- AC-4: Given tệp lịch, Then bước lấy mã không lưu token vào cấu hình git, bước cài gói kit chỉ đưa token cho chính lệnh cài (không ghi cấu hình git toàn cục), bước gom không nhận `GH_TOKEN`, và Claude Code ghim một bản từ 2.1.302 trở lên; Given một lượt chạy xong, Then không tệp nào trong bản checkout (kể cả `.git/`) và trong thư mục nhà của lượt mang giá trị token; Given lúc lượt bắt đầu một tệp dưới bản checkout hay thư mục nhà (kể cả gói kit đã cài) mang giá trị token, When lượt chạy, Then lượt đỏ với câu «token nằm trên đĩa» gọi tên tệp, trước khi gọi phiên gom.
- AC-5: Given một lượt chạy tới khi mở PR, Then token ghi kho chỉ có mặt trong env của đúng các lời gọi `git fetch`, `git push` và `gh` của lượt; phiên gom, các lệnh kit, lệnh vẽ trang lộ trình và mọi lệnh git cục bộ khác không nhận nó.
- AC-6: Given phiên gom đã chạy xong, When nó để lại thay đổi trong siêu dữ liệu git của bản checkout — cấu hình, hook, thư mục info, HEAD hay ref — Then lượt đỏ với câu «phiên gom đổi siêu dữ liệu git» gọi tên từng tệp, trước khi lượt chạy thêm lệnh git nào; lượt không đẩy, không mở hay sửa PR, không ref nào trên `origin` đổi, và lệnh mà phiên cài vào cấu hình hay hook không chạy; Given mọi lệnh git của lượt sau phiên, Then chúng chạy với hook và fsmonitor bị tắt ở mức lệnh.
- AC-7: Given phiên gom đã chạy xong và các lệnh kit đều xanh, When bản gom, hàng đề xuất, thông điệp commit hay thân PR sắp đẩy mang giá trị của khoá mô hình hay token ghi kho — nguyên văn hoặc base64 — Then lượt đỏ với câu «nội dung đề xuất mang khoá — không đẩy», không đẩy, không mở hay sửa PR, và giá trị khoá không xuất hiện trong nhật ký của lượt.
- AC-8: Given kho tạm và Claude Code thật ở bản đã ghim, gọi bằng đúng đối số và tệp cài đặt của lượt, với lời dặn yêu cầu thử lần lượt các việc bị cấm — chạy `node` tuỳ ý, đọc cấu hình git, đọc một tệp ngoài kho, sửa hook của kho, gọi mạng, chạy `git push`, gọi skill gom rồi chạy `node` tuỳ ý, chạy một lệnh kit được phép — When phiên chạy, Then không tệp mồi nào được tạo hay đổi, chữ của tệp mồi ngoài kho không có trong đầu ra, danh sách lời gọi bị từ chối có đủ các công cụ đã thử, lệnh kit được phép vẫn chạy được, và một biến bí mật mồi mà Claude Code phải gỡ không có trong môi trường lệnh kit nhận; phiên không thử đủ các việc thì phép thử báo «không thử được», không báo đạt; Given cùng Claude Code thật và một tín hiệu chưa có chỗ, When một lượt gom chạy với lời dặn thật, Then lượt giao được đề xuất và phiên không bị từ chối lời gọi nào. (Hỏi-1)

## Coverage

- Trục A — Tài sản bị nhắm: token ghi kho | khoá mô hình | quyền đẩy (ref khác, nhánh chính, tệp lịch) | siêu dữ liệu git (cấu hình, hook) [thước CE: các bí mật và bước của `.github/workflows/tin-hieu-gom.yml`; [NGÀNH: GitHub — Security hardening for GitHub Actions] — `persist-credentials`, đầu vào không tin cậy; [NGÀNH: OWASP Top 10 for LLM Applications 2025] — LLM01 Prompt Injection, LLM06 Excessive Agency] → AC-1, AC-4, AC-5, AC-6, AC-7
- Trục B — Kênh: biến môi trường của tiến trình con | tệp trên đĩa (`.git/config`, `~/.gitconfig`, `/proc/*/environ`) | chạy mã tuỳ ý (lệnh, hook git, hook Claude Code, cấu hình git chạy lệnh) | mạng (WebFetch, WebSearch, MCP) | nội dung đẩy lên (bản gom, commit, thân PR) [thước CE: tài liệu Claude Code — permissions, permission-modes, env-vars (`CLAUDE_CODE_SUBPROCESS_ENV_SCRUB`), settings-reference (`blockReadsOutsideWorkingDirectories`, `disableAllHooks`); `git-config(1)` — `core.hooksPath`, `core.fsmonitor`, `safe.bareRepository`] → AC-1, AC-2, AC-4, AC-6, AC-7, AC-8
- Trục C — Lúc: trong phiên mô hình | sau phiên, ở các bước git và giao PR của lượt [thước CE: thứ tự bước của `scripts/tin-hieu/gom-lich.ts`] → AC-2, AC-3, AC-6, AC-7
- Cắt ngang: lượt bị chặn luôn đỏ, gọi tên nguyên nhân, không in khoá; đường giao đề xuất của TH2 vẫn chạy → AC-3, AC-6, AC-7
- [GIẢ ĐỊNH] Claude Code thi hành đúng luật phân quyền của nó; vòng này không cách ly ở tầng hệ điều hành (Hỏi-2) → AC-8
- Quét đầy đủ (Core / Later / Never): `_acceptance/gia-co-gom-tin-hieu/coverage-scan.md`

## Out of scope

- Cách ly hệ điều hành cho phiên gom (người dùng riêng, chặn mạng theo người dùng, proxy giữ khoá mô hình) — Hỏi-2.
- Hộp cát bubblewrap của Claude Code trên máy chạy Actions.
- Lọc nội dung tín hiệu tìm lời dặn.
- Thu quyền của chính token trên GitHub (việc cài đặt của chủ kho, ghi ở tài liệu).
- Sửa skill gom tín hiệu hay cắt lượt của kit.

## Notes

- Mọi bài kiểm trừ AC-8 chạy trên kho tạm với `claude` giả và `gh` giả như TH2: chúng chứng lượt trao cho Claude Code
  đúng luật và lượt tự dừng đúng chỗ, không chứng Claude Code thi hành luật — đó là việc của AC-8.
- Sửa `gom-lich.ts`, `gom-cau-hinh.ts`, bộ thử chung và tệp lịch làm hồ sơ `gom-tin-hieu-tu-chay` cũ đi; vòng này ghim
  lại hồ sơ đó sau S4.
