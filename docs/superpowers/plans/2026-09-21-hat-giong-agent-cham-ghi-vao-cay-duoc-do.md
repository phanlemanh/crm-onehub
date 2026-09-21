# Hạt giống — agent chấm ghi vào cây nó đang đo

**Gốc:** `_acceptance/ho-so-khai-dung-tieng`
**Mở ngày:** 2026-09-21 · **Trạng thái:** hạt giống, chưa có ô
**Chủ sở hữu nguyên nhân gốc:** bộ kit (`~/dev/acceptance-gate-kit`), **không
phải kho này**. Triệu chứng tại chỗ đã vá; luật cưỡng chế thì chưa có.

## Chuyện đã xảy ra

Vòng chấm 4 ngày 20/09, agent chấm `ui-check` của E9 tự viết
`_e9-verify-capture.mjs` vào `_acceptance/ho-so-khai-dung-tieng/rang/` — thư mục
thước của chính hồ sơ nó đang chấm.

E10 — một ô đo khác, chạy song song, có khẳng định «cây không đổi sau khi chạy» —
thấy tệp lạ và báo:

> `KHONG DAT: cay dang xet DOI sau khi chay — phep pha da ro ri ra khoi ban sao.`
> `?? _acceptance/ho-so-khai-dung-tieng/rang/_e9-verify-capture.mjs`

Thông điệp ấy **sai hoàn toàn về nguyên nhân**. Không có phép phá nào rò rỉ.
Người quan sát làm nhiễu vật, rồi người quan sát khác đo cái nhiễu ấy như khuyết
tật của vật. Đây là lỗi phạm trù, không phải lỗi của chân đo nào.

Hệ quả thật: vòng chấm 4 ra REJECT vì E10, và một trong hai nguyên nhân của E10
là thứ vừa kể — không phải khuyết tật của sản phẩm.

## Đã làm tại chỗ

`_e9-verify-capture.mjs` đã chuyển sang
`.acceptance-runs/ho-so-khai-dung-tieng/`; hai chân kiểm `rang/` xanh lại.
Đó là dọn triệu chứng, không phải vá nguyên nhân.

## Nguyên nhân gốc, và nó sống ở đâu

Kit **đã có** luật nơi-ghi-tạo-phẩm (mọi tạo phẩm của một lượt chấm thuộc
`.acceptance-runs/`). Luật ấy **chưa được cưỡng chế lên agent chấm** — nó là chữ
trong tài liệu, không phải chốt máy. Agent chấm chạy với quyền ghi trên cây được
đo, nên không gì chặn nó viết ra ngoài.

Chẩn đoán đầy đủ ở `docs/findings/2026-09-20-vong-lan-quan-do-thuoc.md`, Phần I
mục 2 và lối ra số 3: **người chấm CHỈ ĐỌC trên cây được đo; mọi ghi ngoài
`.acceptance-runs/` trong một lượt chấm là LỖI LÀN, không phải phát hiện về vật.**

## Việc phải làm khi mở ô — ở kho kit, không ở đây

1. Cưỡng chế nơi-ghi lên agent chấm (chốt máy, không phải lời dặn trong prompt).
2. Khi một chặn «cây không đổi» đỏ, phân biệt hai nguyên nhân trong thông điệp:
   phép phá rò rỉ (lỗi của vật) ≠ người chấm ghi vào cây (lỗi của làn).
3. Mở chip sang `~/dev/acceptance-gate-kit`. Theo `CLAUDE.md` của kho này: lỗi
   của bộ kit phát hiện ở đây thì mở chip riêng, **không sửa tại chỗ**.
