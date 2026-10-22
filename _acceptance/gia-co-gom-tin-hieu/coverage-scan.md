# Quét hình thái — gia-co-gom-tin-hieu (preset risk-premortem)

## Ngữ cảnh

- Sản phẩm: lịch gom tín hiệu của crm (TH2) — chân sản phẩm: đào repo [SUY-TỪ-REPO: scripts/tin-hieu/gom-lich.ts]
  [SUY-TỪ-REPO: .github/workflows/tin-hieu-gom.yml] [SUY-TỪ-REPO: _acceptance/gom-tin-hieu-tu-chay/evidence-report.md]
  · chân ngành: [NGÀNH: GitHub — Security hardening for GitHub Actions], [NGÀNH: OWASP Top 10 for LLM Applications
  2025 — LLM01, LLM06], [NGÀNH: Claude Code docs — permissions, env-vars, sandboxing].
- Câu khung: «một tháng sau khi đặt khoá mô hình, token ghi kho lọt ra ngoài — vì sao?»

## Trục

- Trục A — Tài sản: token ghi kho | khoá mô hình | quyền đẩy | siêu dữ liệu git | chính tệp lịch/bộ chạy
  [thước CE: bí mật và bước của tệp lịch; NGÀNH GitHub hardening]
- Trục B — Kênh: env tiến trình con | tệp trên đĩa | chạy mã tuỳ ý | mạng | nội dung đẩy lên
  [thước CE: tài liệu Claude Code; OWASP LLM06 «excessive functionality / permissions»]
- Trục C — Lúc: trong phiên | sau phiên (bước git, giao PR của lượt)
  [thước CE: thứ tự bước của gom-lich.ts]

## Ô có nghĩa (A × B, lúc ghi bên cạnh)

| Ô | Lúc | Đường hôm nay (TH2) | Nhãn |
|---|---|---|---|
| token × env | trong | `GH_TOKEN` nằm trong env của phiên | Core → AC-1, AC-5 |
| token × tệp | trong | `.git/config` extraheader của checkout; `~/.gitconfig` insteadOf; `/proc/<lịch>/environ` | Core → AC-2, AC-4 |
| token × mã tuỳ ý | trong | `Bash(node:*)`; `git commit` chạy `.githooks/*` phiên tự ghi | Core → AC-2, AC-8 |
| token × mạng | trong | không chặn WebFetch/MCP tường minh | Core → AC-2, AC-8 |
| token × nội dung | sau | không quét | Core → AC-7 |
| khoá mô hình × env | trong | khoá nằm trong env của mọi lệnh con | Core → AC-1, AC-8 |
| khoá mô hình × tệp | trong | `/proc/self/environ` qua công cụ đọc | Core → AC-2, AC-8 |
| khoá mô hình × nội dung | sau | không quét | Core → AC-7 |
| quyền đẩy × mã tuỳ ý | trong | phiên `git push` bằng token của checkout | Core → AC-2, AC-3, AC-6 |
| quyền đẩy × sau phiên | sau | lượt đẩy `HEAD` ép; ref khác do phiên tạo không bị soi | Core → AC-3, AC-6 |
| siêu dữ liệu git × mã tuỳ ý | sau | `core.fsmonitor`/hook phiên cài chạy ở `git status`/`commit`/`push` của lượt | Core → AC-6 |
| tệp lịch × nội dung | sau | chặn bởi kiểm chạm ngoài vùng của TH2 | đã có (TH2 AC-4) |
| khoá mô hình × mạng | trong | tiêu khoá qua chính Claude Code (gọi mô hình nhiều) — trần lượt + trần phút của TH2 | đã có (TH2 AC-7) |
| khoá mô hình × env (cả tiến trình Claude Code) | trong | Claude Code bắt buộc cầm khoá để gọi API | Later — cách ly hệ điều hành (Hỏi-2) |
| token × mã tuỳ ý (lỗi của chính Claude Code) | trong | lỗ phân quyền của Claude Code | Later — cách ly hệ điều hành (Hỏi-2) |

## Core

AC-1 … AC-8 của hợp đồng (8 ô gộp từ 11 ô Core: các ô cùng một chốt máy gộp làm một tiêu chí).

## Later

- Cách ly hệ điều hành: người dùng riêng cho phiên, iptables chặn mạng theo uid, proxy cục bộ giữ khoá mô hình — Hỏi-2.
- Hộp cát bubblewrap của Claude Code [NGÀNH: Claude Code docs — sandboxing]: chờ biết AppArmor của runner ubuntu-24.04.
- Token fine-grained một kho, hết hạn ngắn — việc cài đặt của chủ kho (ghi tài liệu).

## Never

- Lọc nội dung tín hiệu tìm lời dặn — danh sách đen, đổi chữ là qua [NGÀNH: OWASP LLM01 — «no fool-proof method»].
- Bỏ mô hình khỏi lịch gom — phá câu giao của TH2.

## Cross-cutting

- Mỗi chặn của lượt đỏ, gọi tên, không in khoá; đường giao đề xuất của TH2 vẫn xanh.
