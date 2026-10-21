# Quét không gian tiêu chí — gom-tin-hieu-tu-chay

Preset: tự dựng trục (B1) — bài toán là một lượt máy theo lịch có ba đầu vào rời nhau (tín hiệu, PR đang có, kết cục
phiên gom) và một đầu ra cho người; không khớp entity-feature.

## Ngữ cảnh

- Sản phẩm: lịch gom tín hiệu của kho crm (OneHub) — chân sản phẩm: đào kho
  [SUY-TỪ-REPO: docs/plan/lo-trinh-okr.json hàng TH2] [SUY-TỪ-REPO: scripts/tin-hieu/lich.ts]
  [SUY-TỪ-REPO: _acceptance/config.yaml khoá tin_hieu, lo_trinh] · chân ngành: bot mở PR theo lịch —
  [NGÀNH: Renovate] (thôi dựng lại PR khi người khác đã đẩy commit lên nhánh của nó) và [NGÀNH: Dependabot] (đóng PR
  là bỏ qua đúng bản đó; bản mới thì mở PR mới).

## Trục

- Trục A — tín hiệu lúc lượt chạy: không có chưa-có-chỗ | có chưa-có-chỗ | sai khuôn
  [thước CE: JSON của `tin-hieu.mjs --chua-gom` — ba phần `tin_hieu`, `da_giao`, `loi`]
- Trục B — PR đề xuất đang có: chưa có | mở·máy·cùng dấu | mở·máy·khác dấu | mở·có người | đóng·cùng dấu |
  đóng·khác dấu | đã gộp [thước CE: trạng thái PR của GitHub × tác giả commit × dấu tập; Renovate, Dependabot]
- Trục C — kết cục phiên gom: xanh | răng phủ đỏ | kiểm câu đỏ | răng cắt lượt đỏ | số bản gom ≠ 1 | chạm ngoài vùng |
  thoát ≠ 0 | quá trần | thiếu khoá/lệnh [thước CE: mã thoát 0/1/2 của hai lệnh kit; hợp đồng `claude -p`]

Cắt ngang: không bao giờ gộp; khoá không vào nhật ký; hỏng thì đỏ và gọi tên.

## Không gian (A × B, rồi C trên các ô có gọi mô hình)

Ô có nghĩa của A × B: «không có chưa-có-chỗ» chỉ một kết cục bất kể B (không gọi mô hình) → 1 ô; «sai khuôn» → 1 ô;
«có chưa-có-chỗ» × 7 giá trị B → 7 ô; trong đó bốn ô gọi mô hình (chưa có, mở·máy·khác dấu, đóng·khác dấu, đã gộp)
nhân 9 kết cục C. Gạch: «đã gộp» với cùng dấu — vô nghĩa (tín hiệu đã có chỗ thì không ở tập chưa-có-chỗ).

## Core

1. có mới × chưa có × xanh → PR nháp đúng khuôn — AC-2
2. không có chưa-có-chỗ → không gọi mô hình — AC-1
3. có mới × (bất kỳ) × răng/câu/cắt lượt đỏ hoặc số bản gom ≠ 1 → đỏ, không giao — AC-3
4. có mới × (bất kỳ) × chạm ngoài vùng → đỏ gọi tên tệp — AC-4
5. mở·có người → không đụng; mở·máy·cùng dấu → không gọi; mở·máy·khác dấu → dựng lại cùng PR — AC-5
6. đóng·cùng dấu → không mở lại; đóng·khác dấu → đề xuất mới mang tên nhóm cũ — AC-6
7. có mới × thiếu khoá/lệnh, thoát ≠ 0, quá trần → đỏ với việc của chủ kho — AC-7
8. đã gộp → đo giờ chờ và số nhóm bị sửa — AC-8 (đường đo của ô cơ hội)

## Later

- sai khuôn: đã có ở răng của kit (`loi` của `--chua-gom`); lượt dừng đỏ nhờ ô Core 3 — chưa cần tiêu chí riêng.
- Đề xuất đứng mở quá lâu không ai làm gì → nhắc chủ kho (thuộc TB1/N5).
- Gộp nhiều đợt nhỏ thành một khi tín hiệu tới dồn dập trong ngày.

## Never

- Máy tự gộp khi răng xanh — luật 22 của đợt.
- Máy tự sửa bản gom sau khi người đã sửa — chính phản mục tiêu của câu giao.
- Hai PR đề xuất đứng cùng lúc — răng phủ trên `onehub` làm PR thứ hai đỏ.
