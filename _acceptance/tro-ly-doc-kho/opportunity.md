---
schema_version: 1
slug: tro-ly-doc-kho
feature: Trợ lý AI đọc Kho tài liệu — hỏi trong CRM hay qua Zalo, trả lời có trích trang và phiên bản do máy chủ kiểm, không biết thì nói không biết
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-04
prototype:
  base_commit: bb55853103b97d8dfa9950b99e6a9e38762b0c49
  disposition: keep
---

## Vấn đề & ai gặp

Lượt 1–3 cho nội dung vào kho và cho người tìm được trang. Nhưng nhân viên không hỏi «trang
nào», họ hỏi «tầng 2 được bao nhiêu phần trăm», «nghỉ phép năm có chuyển sang năm sau không»
— và hôm nay câu đó vẫn đi vào nhóm Zalo, chờ hành chính, nhân sự, kế toán trả lời từ trí nhớ.
Câu trả lời không trỏ về trang nào, nên không ai biết nó theo bản nào, và chủ trang không biết
trang mình thiếu gì.

**Người gặp:** nhân viên giữa việc (hỏi trên điện thoại qua Zalo, hay trong CRM) · người hay bị
hỏi (hành chính, nhân sự, kế toán — trả lời lặp lại) · chủ trang (không biết câu nào không có
trang trả lời, câu trả lời nào sai) · chủ kho (cần số «trả lời có trích ≥ 70%» của lộ trình
mục 5 để quyết lượt 5).

Vật liệu nền: lộ trình mục 4 «Lượt 4», 5; nghiên cứu `kho-tai-lieu-nghien-cuu.md` mục 5.4,
7.2–7.6, 9.1; `kho-tai-lieu-viet-nam-va-do-luong.md` mục 12.1–12.9; bản mẫu `/proto/kho-tai-lieu`
trạng thái `ST-tac-nhan-tra-loi`, `ST-tac-nhan-tu-choi`.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Câu hỏi thật của nhân viên phần lớn có trang trả lời sau khi phòng ban nạp 10–20 tệp | Trợ lý từ chối gần hết, người bỏ hỏi | Bộ câu đo của AC-15 trên kho đo; số «trả lời có trích» trong chạy thật | Chờ bộ câu đo |
| 2 | Bắt trích nguyên văn và kiểm số không làm trợ lý từ chối thừa những câu trả lời được | Tỉ lệ có trích thấp vì bị bác, không vì thiếu trang | Lý do `trich-truot` trên tổng từ chối, đếm từ `TaiLieuHoi` | Đo trong chạy thật |
| 3 | Trợ lý AI ở Zalo nhận ra câu quy định và chuyển cho trợ lý kho | Câu quy định qua Zalo được trả lời không trích | Mẫu câu Zalo trong AC-15 (judgment) | Chờ bộ câu đo |
| 4 | Chủ trang đọc «câu chưa trả lời được» và «bị báo sai» rồi sửa trang | Hàng đầy, kho không lớn lên theo câu hỏi | Số dòng đã xử lý trên tổng cuối chạy thật | Đo trong chạy thật |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: sau hai tuần chạy thật, nhân viên có hỏi kho và được trả lời theo trang, thay vì hỏi nhóm Zalo?
- Kết quả nào là SỐNG: ≥ 70% câu hỏi (trừ câu lỗi) được trả lời có trích (lộ trình mục 5), đếm bằng `demHoiKho` trên `TaiLieuHoi`; và ≥ 50% câu chưa trả lời được và việc báo sai được chủ trang đánh dấu đã xử lý.
- Kết quả nào là CHẾT: ≥ 1 câu trả lời trích chữ của bản chưa duyệt hay trang người hỏi không thấy được, được báo lại trong chạy thật; hoặc ≥ 1 báo sai được chủ trang xác nhận là trợ lý nói điều trang không nói về tiền, hạn hay quyền lợi; hoặc < 40% câu được trả lời có trích.
- Timebox: đo cùng chạy thật mọi phòng ban 2026-10-26 → 2026-11-09, đọc số 2026-11-10 cùng bốn số của lộ trình mục 5 (dời theo lộ trình «lên trước 14/10», chủ kho chốt khi ký 04/10).

## Kết quả prototype

Bản mẫu `/proto/kho-tai-lieu` (lượt 0, giữ vĩnh viễn theo `docs/proto.md`) có hai trạng thái
của lượt này: `ST-tac-nhan-tra-loi` (câu trả lời có trích dưới mỗi ý, nút «Báo câu trả lời này
sai») và `ST-tac-nhan-tu-choi` (câu từ chối, trang gần nhất, câu vào hàng chưa trả lời được).
Hai chỗ lượt này đi khác bản mẫu: câu trả lời mẫu làm phép tính trên số trích (36 triệu từ 1,2%
của 3 tỷ) — lượt này cấm, vì mọi con số phải có trong đoạn trích; và câu hỏi nằm ở tab «Hỏi»
của Kho chứ không ở màn «Hội thoại» riêng. Không đo số nào trên bản mẫu.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Hai tool chỉ đọc, chỉ bản đã duyệt; hợp đồng trích dẫn; từ chối xác định | `docs/plan/kho-tai-lieu-nghien-cuu.md` mục 7.2–7.4 (trong kho) | triết-lý/logic | có | — |
| Báo câu trả lời sai thành việc cho chủ trang; hàng câu chưa trả lời được | Zendesk Knowledge Capture, Intercom Fin, Slite Ask, GitBook Content gaps (nghiên cứu mục 5.4) | triết-lý/logic | có | — |
| Ranh giới `subagent`, khoá riêng, ZDR, kiểm số bằng mã | `docs/agent.md`, `apps/agent/agent/subagents/may_soan/` (trong kho) | mã đã có trong kho | có | — |
| Bố cục câu trả lời và câu từ chối | `apps/app/app/proto/_modules/kho-tai-lieu/man-hoi.tsx` (trong kho) | ngôn-ngữ-thiết-kế/hình-thái đã có trong kho | có | Người ký Cổng Đáng |

## Cổng 0

- **decision = ?** Máy khuyên **build**: lộ trình mục 3 đặt lượt này trước chạy thật; điều kiện mở «lượt 3 đã lên» đạt 2026-09-29 (#205); điều kiện «có 50 câu hỏi thật» chưa đạt — xem «Bộ câu đo» ở thẻ Cổng Phạm vi, S0–S3 không chờ nó, chỉ AC-15 chờ.
- **disposition = keep.** Bản mẫu ở lại kho; lượt này thêm một mục `catalog.ts` trỏ cùng module, không xoá gì.

## Thước đo thành công → ứng viên criterion

- Tỉ lệ trả lời có trích → AC-9 (đếm), AC-3, AC-4 (mỗi câu một kết quả rõ), AC-15 (chất lượng trên câu đo).
- Không lộ bản chưa duyệt → AC-1, AC-2, AC-3 (d).
- Chủ trang xử lý hàng → AC-10, AC-11.
- Không bịa con số → AC-3 (f).

## Bảng nợ kế thừa (CHỈ khi disposition: keep)

| Path | Giữ / Dựng lại | Chạm t3_paths? | Ghi chú |
|---|---|---|---|
| `apps/app/app/proto/_modules/kho-tai-lieu/man-hoi.tsx` | Dựng lại: tab «Hỏi» trong `apps/app/app/(app)/[slug]/tai-lieu/` bằng AI Elements | không | Bản mẫu giữ nguyên làm phòng trưng bày |
| `apps/app/app/proto/catalog.ts` | Giữ; thêm mục `tro-ly-doc-kho` | không | Luật slug bản mẫu = slug hồ sơ |

## Out of scope từ khám phá

- Vai «chỉ OKR» hỏi kho; «báo sai» qua Zalo; hội thoại nhiều lượt; phép tính trên số trích.
- Trang lưu trữ (lượt 3b), hiệu lực theo ngày, bộ vàng 470 mục, mồi rò rỉ, G1–G10.
- Vector, `pg_trgm`, Citations API của nhà cung cấp.
