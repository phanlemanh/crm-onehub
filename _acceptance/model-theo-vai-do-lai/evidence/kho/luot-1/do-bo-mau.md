# Đo trợ lý kho trên bộ câu hỏi mẫu

bam bo-mau: 0b3f3f96ddddb749f0a1d78b43f4cdbe88af8648e6fae42722c9fb66b0e02ac2
bam tro-ly: 8003445cb7ceff2f99009850372bb9456cea1d79f6d38ed40685b5740cdc04c9
ma thoat cham-bo-do: 2
thu muc luot cham-bo-do: .acceptance-runs/tro-ly-doc-kho/cham-bo-do/2026-10-20T10-47-28-192Z-74365
luot 1: 46 ma
luot 2: 50 ma

## Tổng của script chấm

- KHONG DO DUOC: 10 cau loi (m06, m10, m29, m33, m36, m40, m06, m23, m28, m32)
- demHoiKho cua cua so chay: traLoi 71, tuChoi 15, loi 6, tiLe 82.6%

## Bảng

### Lượt một theo tầng — đạt là trả lời đúng trang hay từ chối đúng

| ô | đạt | đếm | tỉ lệ | lỗi |
| --- | --- | --- | --- | --- |
| S1 | 13 | 13 | 100.0% | 2 |
| S2 | 5 | 5 | 100.0% | 0 |
| S3 | 7 | 8 | 87.5% | 0 |
| S6-gan | 3 | 3 | 100.0% | 1 |
| S6-ngoai | 2 | 2 | 100.0% | 2 |
| S7 | 8 | 9 | 88.9% | 1 |

### Lượt một theo kiểu chữ

| ô | đạt | đếm | tỉ lệ | lỗi |
| --- | --- | --- | --- | --- |
| chuan | 30 | 31 | 96.8% | 5 |
| khong-dau | 2 | 2 | 100.0% | 0 |
| sai-chinh-ta | 2 | 2 | 100.0% | 0 |
| tin-zalo | 2 | 2 | 100.0% | 0 |
| tron-anh | 1 | 2 | 50.0% | 0 |
| viet-tat | 1 | 1 | 100.0% | 1 |

### Lượt hai qua Zalo theo tầng — đạt là chuyển đúng cho trợ lý kho, ngoài kho thì không chuyển

| ô | đạt | đếm | tỉ lệ | lỗi |
| --- | --- | --- | --- | --- |
| S1 | 14 | 14 | 100.0% | 1 |
| S2 | 5 | 5 | 100.0% | 0 |
| S3 | 6 | 6 | 100.0% | 2 |
| S6-gan | 3 | 3 | 100.0% | 1 |
| S6-ngoai | 4 | 4 | 100.0% | 0 |
| S7 | 10 | 10 | 100.0% | 0 |
| ngoai-kho | 4 | 4 | 100.0% | 0 |

### Không đạt

- m06 (luot 1: loi)
- m06 (luot 2: loi)
- m10 (luot 1: loi)
- m23 (luot 1: sai)
- m23 (luot 2: loi)
- m28 (luot 2: loi)
- m29 (luot 1: loi)
- m32 (luot 2: loi)
- m33 (luot 1: loi)
- m36 (luot 1: loi)
- m40 (luot 1: loi)
- m44 (luot 1: sai)

<!-- bang-do -->
```json
{
  "tang": {
    "S1": {
      "k": 13,
      "n": 13,
      "loi": 2
    },
    "S2": {
      "k": 5,
      "n": 5,
      "loi": 0
    },
    "S3": {
      "k": 7,
      "n": 8,
      "loi": 0
    },
    "S6-gan": {
      "k": 3,
      "n": 3,
      "loi": 1
    },
    "S6-ngoai": {
      "k": 2,
      "n": 2,
      "loi": 2
    },
    "S7": {
      "k": 8,
      "n": 9,
      "loi": 1
    }
  },
  "kieuChu": {
    "chuan": {
      "k": 30,
      "n": 31,
      "loi": 5
    },
    "khong-dau": {
      "k": 2,
      "n": 2,
      "loi": 0
    },
    "viet-tat": {
      "k": 1,
      "n": 1,
      "loi": 1
    },
    "sai-chinh-ta": {
      "k": 2,
      "n": 2,
      "loi": 0
    },
    "tron-anh": {
      "k": 1,
      "n": 2,
      "loi": 0
    },
    "tin-zalo": {
      "k": 2,
      "n": 2,
      "loi": 0
    }
  },
  "zalo": {
    "S1": {
      "k": 14,
      "n": 14,
      "loi": 1
    },
    "S2": {
      "k": 5,
      "n": 5,
      "loi": 0
    },
    "S3": {
      "k": 6,
      "n": 6,
      "loi": 2
    },
    "S6-gan": {
      "k": 3,
      "n": 3,
      "loi": 1
    },
    "S6-ngoai": {
      "k": 4,
      "n": 4,
      "loi": 0
    },
    "S7": {
      "k": 10,
      "n": 10,
      "loi": 0
    },
    "ngoai-kho": {
      "k": 4,
      "n": 4,
      "loi": 0
    }
  },
  "khongDat": [
    "m06 (luot 1: loi)",
    "m06 (luot 2: loi)",
    "m10 (luot 1: loi)",
    "m23 (luot 1: sai)",
    "m23 (luot 2: loi)",
    "m28 (luot 2: loi)",
    "m29 (luot 1: loi)",
    "m32 (luot 2: loi)",
    "m33 (luot 1: loi)",
    "m36 (luot 1: loi)",
    "m40 (luot 1: loi)",
    "m44 (luot 1: sai)"
  ]
}
```
<!-- /bang-do -->
