# Kho nguồn dùng khoá Blob riêng — thiết kế

Ngày 2026-09-28 · hồ sơ `_acceptance/kho-nguon-khoa-rieng/` · T2

## Vấn đề

Kho nguồn tài liệu (`packages/db/src/blob-nguon.ts`, Blob **private**) và phần sao logo, ảnh
(`packages/db/src/blob.ts`, Blob **public**) cùng đọc `BLOB_READ_WRITE_TOKEN`. Một store Vercel
Blob chỉ là public hoặc private, và token không nói store thuộc loại nào. Ngày 2026-09-28 cả ba
dự án `crm-onehub-api`, `crm-onehub-app`, `crm-onehub-agent` đều chưa đặt biến này, nên tải nguồn
tắt trên production (AC-5 của `may-soan-de-xuat`). Đặt khoá store private vào tên chung sẽ đẩy
logo vào store private; đặt khoá store public thì kho nguồn mở nút rồi hỏng mọi lượt tải.

## Quyết định

- **Biến riêng `KHO_TAI_LIEU_BLOB_TOKEN`** cho kho nguồn. Store đích là `kho-tai-lieu-nguon`
  (sin1, private), **không gắn dự án nào** — gắn vào dự án `crm-onehub-*` thì Vercel tự đặt
  `BLOB_READ_WRITE_TOKEN` bằng khoá của nó.
- **Không lùi sang `BLOB_READ_WRITE_TOKEN`** (chủ kho chốt A, 2026-09-28). Biến riêng vắng thì
  kho nguồn tắt êm như AC-5 cũ: nút khoá, `PRECONDITION_FAILED`, không ném lỗi. Lùi sang tên chung
  sẽ bật kho nguồn trên store public đúng hôm chủ kho đặt khoá logo.
- `blob.ts` không đổi: logo, ảnh vẫn chỉ đọc `BLOB_READ_WRITE_TOKEN`.
- Hồ sơ mới thay AC-5 của `may-soan-de-xuat`; hợp đồng đã ký không sửa. Sổ quyết định của
  `may-soan-de-xuat` có một dòng trỏ sang hồ sơ này.

## Việc đổi

| Chỗ | Đổi |
| --- | --- |
| `packages/db/src/blob-nguon.ts` | đọc `KHO_TAI_LIEU_BLOB_TOKEN`; thông điệp tắt nêu tên mới; tên biến là hằng trong `BLOB_NGUON` |
| `apps/agent/agent/lib/capabilities.ts` | `LUU_NGUON` bật theo biến mới, `from` nêu tên mới |
| `.env.example` | mục mới cạnh `BLOB_READ_WRITE_TOKEN`: store private, không gắn dự án |
| `apps/api/src/config/env.validation.ts` | khai biến tuỳ chọn |
| `turbo.json` gốc | `globalPassThroughEnv` |
| `apps/api/turbo.json`, `apps/agent/turbo.json` | `passThroughEnv` của dev, test, dev:headless — cạnh chỗ đang có `BLOB_READ_WRITE_TOKEN` |
| `docs/environment.md`, `docs/api.md` | bảng năng lực và mục «Kho tài liệu: nguồn» nêu tên mới |
| `_acceptance/may-soan-de-xuat/rang/blob-that.mjs` | đọc biến mới (env rồi `.env`), thiếu → exit 2 nêu tên mới, không in giá trị |
| `_acceptance/may-soan-de-xuat/rang/man-tai-nguon.mjs` | API của bàn đo giả chạy với biến mới giả |
| `apps/api/test/tai-lieu-nguon-tat.spec.ts`, `apps/agent/test/capabilities.spec.ts`, `packages/db/test/blob-nguon.spec.ts` | xoá, đặt đúng biến |

Bàn đo `blob-that.mjs` cần `.env` có dòng `KHO_TAI_LIEU_BLOB_TOKEN=…`; chủ kho tự dán, máy không
đọc hay in giá trị.

## Phép đo

- Ma trận 2×2 hai biến × hai kho (nguồn, logo), viết trước tám kỳ vọng.
- Quan hệ: Blob API giả ghi header `authorization`; kho nguồn ký PUT, ký GET, xoá khi cả hai biến
  đặt khác nhau → mọi yêu cầu mang token kho nguồn.
- Ô «chỉ khoá logo» qua API thật (Nest, tRPC): kho nguồn tắt, lượt 1 chạy như cũ.
- Năm nhà của biến, không nằm trong mảng `env` nào của turbo.
- Phép thử thật trên store `kho-tai-lieu-nguon` bằng biến mới.

## Ngoài phạm vi

Đặt biến lên Vercel (hỏi chủ kho sau merge) · thuộc tính telemetry cho kho nguồn · kiểm kiểu store
lúc khởi động · đổi logic `blob.ts`.
